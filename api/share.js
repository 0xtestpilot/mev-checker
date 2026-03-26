module.exports = async function handler(req, res) {
  const { loss, trades, volume, incidents, sandwichVol, confirmed } = req.query;

  const cardUrl = `https://mev-checker.vercel.app/api/card?loss=${encodeURIComponent(loss || '$0')}&trades=${encodeURIComponent(trades || '0')}&volume=${encodeURIComponent(volume || '$0')}&incidents=${encodeURIComponent(incidents || '0')}&sandwichVol=${encodeURIComponent(sandwichVol || '$0')}&confirmed=${confirmed || '0'}&v=3`;

  const title = `MEV bots may have stolen ${loss || '$0'} from my wallet`;
  const description = `${trades || '0'} DEX trades · ${volume || '$0'} total volume · ${incidents || '0'} confirmed sandwich attacks. Check how much you've lost.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${cardUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="https://mev-checker.vercel.app" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${cardUrl}" />
  <meta http-equiv="refresh" content="0;url=https://mev-checker.vercel.app" />
  <script>window.location.href = 'https://mev-checker.vercel.app';</script>
</head>
<body></body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).send(html);
};
