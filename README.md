# MEV Checker

Check how much MEV bots have extracted from an Ethereum wallet over the last 12 months.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import the repo
3. In Project Settings → Environment Variables, add:
   - `DUNE_API_KEY` = your Dune API key
4. Deploy

That's it. The app will be live at your Vercel URL.

## How it works

- Frontend: single HTML file, no framework
- Backend: one Vercel serverless function (`/api/check.js`)
- Data: Dune Analytics query #6891371 on `dex.sandwiched`
- Loss estimate: incidents × $630 avg (EigenPhi/Cointelegraph, Dec 2025)

## Updating the Privana CTA link

In `index.html`, find `href="https://privana.xyz"` and update to your real URL.
