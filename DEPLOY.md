# Deploy & public repo checklist

Local production verify (already done in agent session):

```bash
npm run build
npm run start -- -H 127.0.0.1 -p 3000
# http://127.0.0.1:3000
# http://127.0.0.1:3000/meetings/atlas-weekly
# http://127.0.0.1:3000/share/atlas-weekly
```

## 1. Public GitHub repository

```bash
gh auth login
gh repo create fathom_ai_clone --public --source=. --remote=origin --push
# or if remote exists:
git push -u origin main
gh repo edit --visibility public
```

Confirm `.agent-logs/` and `CAPTURE-TEST.md` are on `main`.

## 2. Vercel production deploy

```bash
npx vercel login
npx vercel --prod
```

Then verify in **incognito**:

- `/`
- `/meetings/atlas-weekly`
- `/share/atlas-weekly`

## 3. Walkthrough script

See root `README.md`.
