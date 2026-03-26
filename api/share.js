module.exports = async function handler(req, res) {
  const { loss, trades, volume, incidents, sandwichVol } = req.query;

  const title = loss
    ? `MEV bots may have stolen ${loss} from my wallet`
    : 'Have MEV bots been stealing from your wallet?';

  const description = loss
    ? `${trades || '0'} DEX trades · ${volume || '$0'} total volume · ${incidents || '0'} confirmed sandwich attacks. Check how much you've lost.`
    : 'Paste your Ethereum wallet address and find out how much MEV bots have extracted from your trades in the last 12 months.';

  const cardUrl = 'https://mev-checker.vercel.app/og-image.png';

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
