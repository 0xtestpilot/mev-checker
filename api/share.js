module.exports = async function handler(req, res) {
  const { loss, trades, volume, incidents, sandwichVol, confirmed } = req.query;

  const title = loss
    ? `MEV bots took ${loss} from my wallet in the last year.`
    : 'Have MEV bots been eating your trades?';

  const description = loss
    ? `Check yours — paste any wallet and see how much you've lost to bots.`
    : 'Paste your wallet. No signup, no wallet connect. Results in ~20 seconds.';

  const cardParams = new URLSearchParams();
  if (loss) cardParams.set('loss', loss);
  if (trades) cardParams.set('trades', trades);
  if (volume) cardParams.set('volume', volume);
  if (incidents) cardParams.set('incidents', incidents);
  if (sandwichVol) cardParams.set('sandwichVol', sandwichVol);
  if (confirmed) cardParams.set('confirmed', confirmed);

  const cardUrl = 'https://mev-checker.xyz/api/card' +
    (cardParams.toString() ? '?' + cardParams.toString() : '');
  const siteUrl = 'https://mev-checker.xyz';

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
  <meta property="og:url" content="${siteUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${cardUrl}" />
  <meta http-equiv="refresh" content="0;url=${siteUrl}" />
  <script>window.location.href = '${siteUrl}';</script>
</head>
<body></body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).send(html);
};
