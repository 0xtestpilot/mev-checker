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

  // Known DEX router contract addresses to filter for DEX activity
  const DEX_CONTRACTS = new Set([
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
    '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3 Router
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap Universal Router
    '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b', // Uniswap Universal Router 2
    '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch V5
    '0x1111111254fb6c44bac0bed2854e76f90643097d', // 1inch V4
    '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap Router
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0x Exchange
    '0x74de5d4fcbf63e00296fd95d33236b9794016631', // Matcha/0x
    '0x6131b5fae19ea4f9d964eac0408e4408b66337b5', // Kyber
    '0x6c9b26c4e89af9f00da4e7b2f9d29198db3ecbe',  // Paraswap
    '0xdef171fe48cf0115b1d80b88dc8eab59176fee57', // Paraswap V5
    '0x1b81d678ffb9c0263b24a97847620c99d213eb14', // Pancakeswap
  ]);

  // Get 12 months ago as block timestamp filter
  const oneYearAgo = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);

  async function getSandwichData() {
    const url = `https://api.dune.com/api/v1/query/${SANDWICH_QUERY_ID}/results?` +
      new URLSearchParams({ 'params.wallet_address': wallet });
    const response = await fetch(url, {
      headers: { 'X-Dune-API-Key': DUNE_API_KEY }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.result?.rows || [];
  }

  async function getAlchemyVolume(chainId, baseUrl) {
    let totalVolume = 0;
    let tradeCount = 0;
    let pageKey = null;

    // We'll do up to 3 pages to avoid timeout
    for (let page = 0; page < 3; page++) {
      const params = {
        fromBlock: '0x0',
        toBlock: 'latest',
        fromAddress: wallet,
        category: ['erc20'],
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: '0x3e8', // 1000
        order: 'desc',
      };
      if (pageKey) params.pageKey = pageKey;

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [params],
        }),
      });

      if (!response.ok) break;
      const data = await response.json();
      const transfers = data.result?.transfers || [];

      for (const tx of transfers) {
        // Filter to last 12 months
        const ts = tx.metadata?.blockTimestamp;
        if (ts && new Date(ts).getTime() / 1000 < oneYearAgo) {
          pageKey = null;
          break;
        }
        // Check if this tx went to a known DEX
        if (DEX_CONTRACTS.has(tx.to?.toLowerCase())) {
          const value = parseFloat(tx.value) || 0;
          // Use raw token value as proxy — we'll multiply by a rough USD estimate
          // For stablecoins (USDC, USDT, DAI) value is roughly USD
          const symbol = tx.asset?.toLowerCase() || '';
          if (['usdc', 'usdt', 'dai', 'busd', 'frax', 'lusd'].includes(symbol)) {
            totalVolume += value;
          } else if (symbol === 'weth' || symbol === 'eth') {
            totalVolume += value * 2500; // rough ETH price proxy
          } else {
            // Skip non-stablecoin, non-ETH for now — avoids bad estimates
          }
          tradeCount++;
        }
      }

      pageKey = data.result?.pageKey;
      if (!pageKey) break;
    }

    return { totalVolume, tradeCount };
  }

  try {
    const alchemyBase = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    const [sandwichRows, alchemyResult] = await Promise.all([
      getSandwichData(),
      getAlchemyVolume('ethereum', alchemyBase),
    ]);

    const dexTrades = alchemyResult.tradeCount;
    const dexVolume = alchemyResult.totalVolume;
    const estimatedLoss = Math.round(dexVolume * 0.0125);

    if (dexTrades === 0 && sandwichRows.length === 0) {
      return res.status(200).json({
        type: 'none',
        estimatedLoss: 0,
        dexTrades: 0,
        dexVolume: 0,
        incidents: 0,
        sandwichVolume: 0,
        chains: [],
        worstTrade: null,
        rows: [],
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
