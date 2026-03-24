# MEV Checker

See how much MEV bots may have extracted from your Ethereum wallet over the last 12 months.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import the repo
3. Add environment variable: `DUNE_API_KEY` = your Dune API key
4. Deploy

## How it works

- Two Dune queries run in parallel for every wallet check
- Query 6891371: confirmed sandwich attacks from `dex.sandwiched` (ethereum, arbitrum, base, polygon)
- Query 6897737: total DEX trading volume from `dex.trades`
- Estimated loss = total EVM DEX volume × 1% (conservative industry estimate)
- Everyone gets a number — confirmed victims show real incident data on top

## Update the Privana CTA

In `index.html` find `href="https://privana.xyz"` and update to your real URL.
