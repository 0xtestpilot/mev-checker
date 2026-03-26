const { createCanvas } = require('canvas');

module.exports = async function handler(req, res) {
  const loss = req.query.loss || '$0';
  const trades = req.query.trades || '0';
  const volume = req.query.volume || '$0';
  const incidents = req.query.incidents || '0';
  const sandwichVol = req.query.sandwichVol || '$0';
  const confirmed = req.query.confirmed === '1';

  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#e8e8e2';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(0, i*48); ctx.lineTo(W, i*48); ctx.stroke(); }
  for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.moveTo(i*48, 0); ctx.lineTo(i*48, H); ctx.stroke(); }

  // Nav bar
  ctx.fillStyle = '#e8e8e2';
  ctx.fillRect(0, 0, W, 60);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(W, 60); ctx.stroke();

  // Nav icon box
  ctx.fillStyle = '#111110';
  roundRect(ctx, 48, 14, 32, 32, 5);
  ctx.fillStyle = '#111110';
  ctx.fill();

  // Nav icon slash
  ctx.strokeStyle = '#c8ff00';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(52, 18, 24, 24);
  ctx.beginPath(); ctx.moveTo(52, 42); ctx.lineTo(76, 18); ctx.stroke();

  // Nav center text
  ctx.fillStyle = '#666660';
  ctx.font = '500 12px "Courier New"';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText('MEV CHECKER', 600, 38);

  // Nav right text
  ctx.fillStyle = '#99998f';
  ctx.font = '11px "Courier New"';
  ctx.textAlign = 'right';
  ctx.fillText('mev-checker.vercel.app', 1152, 38);
  ctx.textAlign = 'left';

  let y = 84;

  // Confirmed badge
  if (confirmed) {
    ctx.fillStyle = '#c8ff00';
    roundRect(ctx, 48, y, 316, 26, 4);
    ctx.fill();
    ctx.fillStyle = '#111110';
    ctx.beginPath(); ctx.arc(64, y+13, 4, 0, Math.PI*2); ctx.fill();
    ctx.font = 'bold 11px "Courier New"';
    ctx.fillText('SANDWICH ATTACKS CONFIRMED', 76, y+18);
    y += 40;
  }

  // Label
  ctx.fillStyle = '#666660';
  ctx.font = '12px "Courier New"';
  ctx.fillText('// ESTIMATED MEV LOSSES — LAST 1 YEAR', 48, y + 20);
  y += 30;

  // Big number background
  const numW = Math.min(loss.length * 72 + 24, 980);
  ctx.fillStyle = '#c8ff00';
  ctx.fillRect(44, y, numW, 136);

  // Big number
  ctx.fillStyle = '#111110';
  ctx.font = 'bold 120px "Courier New"';
  ctx.fillText(loss, 56, y + 116);
  y += 150;

  // Stats row
  const statsH = 96;
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  roundRect(ctx, 48, y, 1104, statsH, 6);
  ctx.fill();

  const cols = [
    ['DEX TRADES', trades, '1 year'],
    ['DEX VOLUME', volume, 'multichain'],
    ['SANDWICHES', incidents, confirmed ? 'confirmed' : 'none found'],
    ['VOL. SANDWICHED', sandwichVol, 'exposed'],
  ];

  cols.forEach(([ label, val, sub ], i) => {
    const x = 48 + i * 276 + 1;
    ctx.fillStyle = '#f0f0ea';
    ctx.fillRect(x, y + 1, 274, statsH - 2);

    if (i > 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + statsH); ctx.stroke();
    }

    ctx.fillStyle = '#99998f';
    ctx.font = '10px "Courier New"';
    ctx.fillText(label, x + 20, y + 22);

    ctx.fillStyle = '#111110';
    ctx.font = 'bold 24px "Courier New"';
    ctx.fillText(val, x + 20, y + 56);

    ctx.fillStyle = '#99998f';
    ctx.font = '10px "Courier New"';
    ctx.fillText(sub, x + 20, y + 76);
  });

  y += statsH + 6;

  // CTA bar
  ctx.fillStyle = '#111110';
  roundRect(ctx, 48, y, 1104, 52, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px "Courier New"';
  ctx.fillText('Stop losing to MEV bots.', 72, y + 22);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '11px "Courier New"';
  ctx.fillText('Privana routes your trades through private mempools.', 72, y + 40);

  ctx.fillStyle = '#c8ff00';
  roundRect(ctx, 1002, y + 10, 134, 32, 4);
  ctx.fill();

  ctx.fillStyle = '#111110';
  ctx.font = 'bold 12px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('Try Privana', 1069, y + 31);

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(buffer);
};
