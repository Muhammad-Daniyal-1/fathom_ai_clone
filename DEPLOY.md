# Deploy

## Live

- App: https://muhammad-daniyal-1.github.io/fathom_ai_clone/
- Repo: https://github.com/Muhammad-Daniyal-1/fathom_ai_clone (public)

## Redeploy GitHub Pages

```bash
GITHUB_PAGES=true npm run build
touch out/.nojekyll
npx gh-pages -d out --dotfiles
gh api -X POST repos/Muhammad-Daniyal-1/fathom_ai_clone/pages/builds
```

Optional Vercel (requires `npx vercel login`):

```bash
npx vercel --prod
```

To enable Actions deploy, refresh token scope then copy `docs/deploy-pages.workflow.yml` → `.github/workflows/`:

```bash
gh auth refresh -s workflow
```
