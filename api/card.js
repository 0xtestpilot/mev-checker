module.exports = async function handler(req, res) {
  const loss = req.query.loss || '$0';
  const trades = req.query.trades || '0';
  const volume = req.query.volume || '$0';
  const incidents = req.query.incidents || '0';
  const sandwichVol = req.query.sandwichVol || '$0';
  const confirmed = req.query.confirmed === '1';

  const badgeY = 84;
  const labelY = confirmed ? 138 : 108;
  const numBgY = confirmed ? 150 : 118;
  const numY = confirmed ? 268 : 238;
  const statsY = confirmed ? 314 : 284;
  const ctaY = confirmed ? 430 : 400;

  const numBgW = Math.min(loss.length * 70 + 24, 960);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#e8e8e2"/>
  ${Array.from({length:14},(_,i)=>`<line x1="0" y1="${i*48}" x2="1200" y2="${i*48}" stroke="#00000010" stroke-width="1"/>`).join('')}
  ${Array.from({length:26},(_,i)=>`<line x1="${i*48}" y1="0" x2="${i*48}" y2="630" stroke="#00000010" stroke-width="1"/>`).join('')}
  <rect width="1200" height="60" fill="#e8e8e2"/>
  <line x1="0" y1="60" x2="1200" y2="60" stroke="#00000020" stroke-width="1"/>
  <rect x="48" y="14" width="32" height="32" rx="5" fill="#111110"/>
  <rect x="52" y="18" width="24" height="24" rx="3" fill="none" stroke="#c8ff00" stroke-width="1.5"/>
  <line x1="52" y1="42" x2="76" y2="18" stroke="#c8ff00" stroke-width="1.5"/>
  <text x="600" y="38" text-anchor="middle" font-size="12" letter-spacing="3" fill="#666660" font-family="Courier New, monospace">MEV CHECKER</text>
  <text x="1152" y="38" text-anchor="end" font-size="11" letter-spacing="1" fill="#99998f" font-family="Courier New, monospace">mev-checker.vercel.app</text>
  ${confirmed ? `<rect x="48" y="${badgeY}" width="316" height="26" rx="4" fill="#c8ff00"/><circle cx="64" cy="${badgeY+13}" r="4" fill="#111110"/><text x="76" y="${badgeY+18}" font-size="11" font-weight="bold" letter-spacing="2" fill="#111110" font-family="Courier New, monospace">SANDWICH ATTACKS CONFIRMED</text>` : ''}
  <text x="48" y="${labelY}" font-size="12" letter-spacing="3" fill="#666660" font-family="Courier New, monospace">// ESTIMATED MEV LOSSES — LAST 1 YEAR</text>
  <rect x="44" y="${numBgY}" width="${numBgW}" height="136" fill="#c8ff00"/>
  <text x="56" y="${numY}" font-size="122" font-weight="bold" letter-spacing="-4" fill="#111110" font-family="Courier New, monospace">${loss}</text>
  <rect x="48" y="${statsY}" width="1104" height="96" rx="6" fill="none" stroke="#00000018" stroke-width="1"/>
  <rect x="49" y="${statsY+1}" width="275" height="94" fill="#f0f0ea"/>
  <text x="68" y="${statsY+22}" font-size="10" letter-spacing="1" fill="#99998f" font-family="Courier New, monospace">DEX TRADES</text>
  <text x="68" y="${statsY+54}" font-size="26" font-weight="bold" fill="#111110" font-family="Courier New, monospace">${trades}</text>
  <text x="68" y="${statsY+74}" font-size="10" fill="#99998f" font-family="Courier New, monospace">1 year</text>
  <line x1="324" y1="${statsY}" x2="324" y2="${statsY+96}" stroke="#00000015" stroke-width="1"/>
  <rect x="325" y="${statsY+1}" width="275" height="94" fill="#f0f0ea"/>
  <text x="344" y="${statsY+22}" font-size="10" letter-spacing="1" fill="#99998f" font-family="Courier New, monospace">DEX VOLUME</text>
  <text x="344" y="${statsY+54}" font-size="26" font-weight="bold" fill="#111110" font-family="Courier New, monospace">${volume}</text>
  <text x="344" y="${statsY+74}" font-size="10" fill="#99998f" font-family="Courier New, monospace">multichain</text>
  <line x1="600" y1="${statsY}" x2="600" y2="${statsY+96}" stroke="#00000015" stroke-width="1"/>
  <rect x="601" y="${statsY+1}" width="275" height="94" fill="#f0f0ea"/>
  <text x="620" y="${statsY+22}" font-size="10" letter-spacing="1" fill="#99998f" font-family="Courier New, monospace">SANDWICHES</text>
  <text x="620" y="${statsY+54}" font-size="26" font-weight="bold" fill="#111110" font-family="Courier New, monospace">${incidents}</text>
  <text x="620" y="${statsY+74}" font-size="10" fill="#99998f" font-family="Courier New, monospace">${confirmed ? 'confirmed' : 'none found'}</text>
  <line x1="876" y1="${statsY}" x2="876" y2="${statsY+96}" stroke="#00000015" stroke-width="1"/>
  <rect x="877" y="${statsY+1}" width="275" height="94" fill="#f0f0ea"/>
  <text x="896" y="${statsY+22}" font-size="10" letter-spacing="1" fill="#99998f" font-family="Courier New, monospace">VOL. SANDWICHED</text>
  <text x="896" y="${statsY+54}" font-size="26" font-weight="bold" fill="#111110" font-family="Courier New, monospace">${sandwichVol}</text>
  <text x="896" y="${statsY+74}" font-size="10" fill="#99998f" font-family="Courier New, monospace">exposed</text>
  <rect x="48" y="${ctaY}" width="1104" height="52" rx="6" fill="#111110"/>
  <text x="72" y="${ctaY+22}" font-size="14" font-weight="bold" fill="#ffffff" font-family="Courier New, monospace">Stop losing to MEV bots.</text>
  <text x="72" y="${ctaY+40}" font-size="11" fill="#ffffff80" font-family="Courier New, monospace">Privana routes your trades through private mempools.</text>
  <rect x="1002" y="${ctaY+10}" width="134" height="32" rx="4" fill="#c8ff00"/>
  <text x="1069" y="${ctaY+31}" text-anchor="middle" font-size="12" font-weight="bold" fill="#111110" font-family="Courier New, monospace">Try Privana</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(svg);
};
