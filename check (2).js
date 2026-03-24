module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { wallet } = req.query;

  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const DUNE_API_KEY = process.env.DUNE_API_KEY;
  const SANDWICH_QUERY_ID = '6891371';
  const DEX_VOLUME_QUERY_ID = '6897737';

  async function runDuneQuery(queryId, params) {
    const execRes = await fetch(`https://api.dune.com/api/v1/query/${queryId}/execute`, {
      method: 'POST',
      headers: {
        'X-Dune-API-Key': DUNE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_parameters: params,
        performance: 'medium',
      }),
    });

    if (!execRes.ok) throw new Error('Failed to execute query');
    const { execution_id } = await execRes.json();

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(
        `https://api.dune.com/api/v1/execution/${execution_id}/results`,
        { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
      );
      if (!statusRes.ok) continue;
      const data = await statusRes.json();
      if (data.state === 'QUERY_STATE_COMPLETED') return data.result?.rows || [];
      if (data.state === 'QUERY_STATE_FAILED') throw new Error('Query failed');
    }
    throw new Error('Query timed out');
  }

  try {
    // Run both queries in parallel
    const [sandwichRows, volumeRows] = await Promise.all([
      runDuneQuery(SANDWICH_QUERY_ID, { wallet_address: wallet }),
      runDuneQuery(DEX_VOLUME_QUERY_ID, { wallet_address: wallet }),
    ]);

    const dexTrades = parseInt(volumeRows[0]?.trades || 0);
    const dexVolume = parseFloat(volumeRows[0]?.total_volume_usd || 0);

    // Estimated loss = 1% of total DEX volume
    // Conservative industry estimate of MEV exposure for active DEX traders
    const estimatedLoss = Math.round(dexVolume * 0.01);

    if (dexTrades === 0 && sandwichRows.length === 0) {
      // No DEX history at all
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

    // Build sandwich data if any
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
    console.error(err);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};
