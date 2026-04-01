# Angel + Beloved Bot

This is the easiest true-AI setup:
- `index.html` at the repo root
- `api/chat.js` for the Vercel serverless backend

## Deploy
1. Upload these files to one GitHub repo.
2. Import that repo into Vercel.
3. Add these environment variables in Vercel:
   - `AI_BASE_URL`
   - `AI_API_KEY`
   - `AI_MODEL`
4. Redeploy.

## Notes
This backend assumes your AI provider uses an OpenAI-compatible `/chat/completions` API shape.
If your provider is different, only `api/chat.js` needs adjustment.
