# Deploy

## Primary — Vercel (live AI)

Required for `/api/analyze` and `/api/ask` (Groq, server-side key).

```bash
npx vercel --prod
```

Configure in the Vercel project (never commit secrets):

- `GROQ_API_KEY`
- `GROQ_MODEL=openai/gpt-oss-120b`

## Fallback — GitHub Pages (seeded UI only)

Static export cannot host secure Groq routes. Use only for the seeded reconstruction:

```bash
GITHUB_PAGES=true npm run build
touch out/.nojekyll
npx gh-pages -d out --dotfiles
```

Live (static): https://muhammad-daniyal-1.github.io/fathom_ai_clone/

Repo: https://github.com/Muhammad-Daniyal-1/fathom_ai_clone
