module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { wallet } = req.query;
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const DUNE_API_KEY = process.env.DUNE_API_KEY;
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  const SANDWICH_QUERY_ID = '6891371';

  const ALCHEMY_BASE = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  const ALCHEMY_PRICES = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-address`;

  // Known DEX routers — wallet must send tokens TO these to count as a DEX trade
  const DEX_ROUTERS = new Set([
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2
    '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap Universal Router
    '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b', // Uniswap Universal Router 2
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Uniswap Universal Router 3
    '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch V5
    '0x1111111254fb6c44bac0bed2854e76f90643097d', // 1inch V4
    '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0x Exchange Proxy
    '0xdef171fe48cf0115b1d80b88dc8eab59176fee57', // Paraswap V5
    '0x6131b5fae19ea4f9d964eac0408e4408b66337b5', // KyberSwap
    '0x6c9b26c4e89af9f00da4e7b2f9d29198db3ecbe',  // Paraswap V4
    '0x1b81d678ffb9c0263b24a97847620c99d213eb14', // Pancakeswap V3
    '0x13f4ea83d0bd40e75c8222255bc855a974568dd4', // Pancakeswap V3 (alt)
    '0xb971ef87ede563556b2ed4b1c0b0019111dd85d2', // CoW Protocol
    '0x9008d19f58aabd9ed0d60971565aa8510560ab41', // CoW Protocol 2
  ]);

  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  async function getSandwichData() {
    const url = `https://api.dune.com/api/v1/query/${SANDWICH_QUERY_ID}/results?` +
      new URLSearchParams({ 'params.wallet_address': wallet });
    const res = await fetch(url, { headers: { 'X-Dune-API-Key': DUNE_API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.result?.rows || [];
  }

  async function getTransfers() {
    const params = {
      fromBlock: '0x0',
      toBlock: 'latest',
      fromAddress: wallet,
      category: ['erc20', 'external'],
      withMetadata: true,
      excludeZeroValue: true,
      maxCount: '0x3e8',
      order: 'desc',
    };

    const response = await fetch(ALCHEMY_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'alchemy_getAssetTransfers', params: [params] }),
    });

    if (!response.ok) return [];
    const data = await response.json();

    // Also fetch contract types to identify smart contracts vs wallets
    const transfers = data.result?.transfers || [];

    // Get unique destination addresses to check which are contracts
    const toAddresses = [...new Set(transfers.map(t => t.to).filter(Boolean))];

    // Batch check which addresses are contracts using eth_getCode
    const contractChecks = await Promise.all(
      toAddresses.slice(0, 50).map(async (addr) => {
        const r = await fetch(ALCHEMY_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'eth_getCode', params: [addr, 'latest'] }),
        });
        const d = await r.json();
        return { addr: addr.toLowerCase(), isContract: d.result && d.result !== '0x' };
      })
    );

    const contractSet = new Set(
      contractChecks.filter(c => c.isContract).map(c => c.addr)
    );

    // Mark transfers where destination is a contract as DEX trades
    return transfers.map(t => ({ ...t, _isContract: contractSet.has(t.to?.toLowerCase()) }));
  }

  async function getTokenPrices(contractAddresses) {
    if (contractAddresses.length === 0) return {};

    // Batch into groups of 25 (API limit)
    const batches = [];
    for (let i = 0; i < contractAddresses.length; i += 25) {
      batches.push(contractAddresses.slice(i, i + 25));
    }

    const prices = {};
    await Promise.all(batches.map(async (batch) => {
      const addresses = batch.map(a => ({ network: 'eth-mainnet', address: a }));
      const response = await fetch(ALCHEMY_PRICES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
      });
      if (!response.ok) return;
      const data = await response.json();
      for (const token of (data.data || [])) {
        const price = parseFloat(token.prices?.[0]?.value || 0);
        if (price > 0) prices[token.address?.toLowerCase()] = price;
      }
    }));

    return prices;
  }

  try {
    const [sandwichRows, transfers] = await Promise.all([
      getSandwichData(),
      getTransfers(),
    ]);

    // Filter to DEX trades in last 12 months
    // Include: transfers to known routers OR transfers to any contract
    const dexTransfers = transfers.filter(tx => {
      if (!tx.to) return false;
      const ts = tx.metadata?.blockTimestamp;
      if (ts && ts < oneYearAgo) return false;
      // Known router OR detected contract
      return DEX_ROUTERS.has(tx.to.toLowerCase()) || tx._isContract;
    });

    // Collect unique ERC20 contract addresses
    const contractAddresses = [...new Set(
      dexTransfers
        .filter(tx => tx.rawContract?.address)
        .map(tx => tx.rawContract.address.toLowerCase())
    )];

    // Get prices for all tokens in one batch
    const prices = await getTokenPrices(contractAddresses);

    // Calculate USD volume
    let dexVolume = 0;
    let dexTrades = 0;

    for (const tx of dexTransfers) {
      const value = parseFloat(tx.value) || 0;
      if (value === 0) continue;

      if (tx.category === 'external') {
        // ETH transfer to DEX — use live ETH price if available
        const ethPrice = prices['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'] || 2000;
        dexVolume += value * ethPrice;
        dexTrades++;
      } else if (tx.rawContract?.address) {
        const addr = tx.rawContract.address.toLowerCase();
        const price = prices[addr];
        if (price) {
          dexVolume += value * price;
          dexTrades++;
        } else {
          // No price found — count the trade but skip volume
          dexTrades++;
        }
      }
    }

    const estimatedLoss = Math.round(dexVolume * 0.0125);

    if (dexTrades === 0 && sandwichRows.length === 0) {
      return res.status(200).json({
        type: 'none', estimatedLoss: 0, dexTrades: 0, dexVolume: 0,
        incidents: 0, sandwichVolume: 0, chains: [], worstTrade: null, rows: [],
      });
    }

    const incidents = sandwichRows.length;
    const sandwichVolume = sandwichRows.reduce((sum, r) => sum + (parseFloat(r.amount_usd) || 0), 0);
    const chains = [...new Set(sandwichRows.map(r => r.blockchain).filter(Boolean))];
    const worst = sandwichRows[0] || null;

    return res.status(200).json({
      type: incidents > 0 ? 'confirmed' : 'exposure',
      estimatedLoss,
      dexTrades,
      dexVolume: Math.round(dexVolume),
      incidents,
      sandwichVolume: Math.round(sandwichVolume),
      chains,
      worstTrade: worst ? {
        tokenSold: worst.token_sold_symbol,
        tokenBought: worst.token_bought_symbol,
        amountUsd: Math.round(parseFloat(worst.amount_usd)),
        blockTime: worst.block_time,
        txHash: worst.tx_hash,
        blockchain: worst.blockchain,
      } : null,
      rows: sandwichRows.map(r => ({
        blockTime: r.block_time,
        tokenSold: r.token_sold_symbol,
        tokenBought: r.token_bought_symbol,
        amountUsd: Math.round(parseFloat(r.amount_usd)),
        txHash: r.tx_hash,
        blockchain: r.blockchain,
      })),
    });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};
