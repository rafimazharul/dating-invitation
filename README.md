# Date Invitation 💗

React + Vite front end, one Vercel serverless function (`api/send.js`) that emails the plan through Resend.

## Run locally
```bash
npm install
cp .env.example .env      # fill in your RESEND_API_KEY and TO_EMAIL
npm run dev               # serves the site AND /api/send locally
```

## Email setup (Resend)
1. Create a free account at resend.com and make an API key.
2. Testing: keep `FROM_EMAIL=Date Plan <onboarding@resend.dev>`. Resend only delivers test mail to the email you signed up with, so sign up with mazharulrafi@gmail.com.
3. Optional: verify your own domain in Resend and use an address on it as `FROM_EMAIL`.

## Deploy to a public URL (Vercel)
```bash
npm i -g vercel
vercel                    # first deploy, accept defaults (framework: Vite)
vercel env add RESEND_API_KEY
vercel env add TO_EMAIL
vercel env add FROM_EMAIL
vercel --prod             # prints the shareable URL
```
Or push to GitHub, import the repo at vercel.com, and add the three env vars under Settings → Environment Variables.

## Thumbnails
Add optional WebP images (about 400px wide) to `public/img/<slug>.webp`, using the slugs in `src/data.js` (for example `diabari.webp`, `pizza.webp`). Anything missing falls back to a pink emoji tile, and all images are lazy-loaded.

## Notes
- The email is sent only after she taps "Confirm & send my plan"; the UI says success only when the server confirms Resend accepted it, and shows a retry button otherwise.
- Payment is never verified or required. The summary says "Skipped" or "Clicked pay korbo (not verified)".
- Rate limiting is in-memory per serverless instance, so it is best-effort. Use Vercel's firewall rules for stricter limits.
