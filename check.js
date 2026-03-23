export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { wallet } = req.query;

  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const DUNE_API_KEY = process.env.DUNE_API_KEY;
  const QUERY_ID = '6891371';

  try {
    // Execute the query
    const execRes = await fetch(`https://api.dune.com/api/v1/query/${QUERY_ID}/execute`, {
      method: 'POST',
      headers: {
        'X-Dune-API-Key': DUNE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_parameters: { wallet_address: wallet },
        performance: 'medium',
      }),
    });

    if (!execRes.ok) throw new Error('Failed to execute query');
    const { execution_id } = await execRes.json();

    // Poll for results
    let rows = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const statusRes = await fetch(
        `https://api.dune.com/api/v1/execution/${execution_id}/results`,
        { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
      );

      if (!statusRes.ok) continue;
      const data = await statusRes.json();

      if (data.state === 'QUERY_STATE_COMPLETED') {
        rows = data.result?.rows || [];
        break;
      }
      if (data.state === 'QUERY_STATE_FAILED') {
        throw new Error('Query failed');
      }
    }

    if (rows === null) throw new Error('Query timed out');

    // Process results
    if (rows.length === 0) {
      return res.status(200).json({ incidents: 0, estimatedLoss: 0, totalVolume: 0, worstTrade: null, rows: [] });
    }

    const incidents = rows.length;
    const totalVolume = rows.reduce((sum, r) => sum + (parseFloat(r.amount_usd) || 0), 0);
    const estimatedLoss = incidents * 630; // $630 avg per EigenPhi/Cointelegraph research Dec 2025
    const worst = rows[0]; // already sorted DESC by amount_usd

    return res.status(200).json({
      incidents,
      estimatedLoss,
      totalVolume: Math.round(totalVolume),
      worstTrade: {
        tokenSold: worst.token_sold_symbol,
        tokenBought: worst.token_bought_symbol,
        amountUsd: Math.round(parseFloat(worst.amount_usd)),
        blockTime: worst.block_time,
        txHash: worst.tx_hash,
      },
      rows: rows.map(r => ({
        blockTime: r.block_time,
        tokenSold: r.token_sold_symbol,
        tokenBought: r.token_bought_symbol,
        amountUsd: Math.round(parseFloat(r.amount_usd)),
        txHash: r.tx_hash,
      })),
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
