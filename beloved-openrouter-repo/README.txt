Upload these files to the root of your GitHub repo.

Structure:
- index.html
- api/chat.js

In Vercel project settings, add these environment variables:
- AI_BASE_URL = https://openrouter.ai/api/v1
- AI_API_KEY = your OpenRouter key
- AI_MODEL = stepfun/step-3.5-flash:free
- SITE_URL = your full Vercel site URL, e.g. https://your-project.vercel.app

Then redeploy the project.
