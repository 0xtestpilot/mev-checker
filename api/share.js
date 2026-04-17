module.exports = async function handler(req, res) {
  const { loss, trades, volume, incidents, sandwichVol, confirmed } = req.query;

  const title = loss
    ? `MEV bots may have stolen ${loss} from my wallet`
    : 'Have MEV bots been stealing from your wallet?';

  const description = loss
    ? `${trades || '0'} DEX trades · ${volume || '$0'} total volume · ${incidents || '0'} confirmed sandwich attacks. Check how much you've lost.`
    : 'Paste your Ethereum wallet address and find out how much MEV bots have extracted from your trades in the last 12 months.';

  // Build the dynamic card URL from the same params we received
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
