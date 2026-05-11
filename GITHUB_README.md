# GITHUB_README.md

## Repository Details

- **Repository URL**: https://github.com/Depczynskim/perfect-blue.git
- **Default branch**: `main`
- **Local project path**: `/Users/bm/Desktop/Perfect_Blue`
- **Remote name**: `origin`

## Current Git State

- Repo został zainicjalizowany lokalnie.
- Pierwszy commit został utworzony: `Initial project commit`.
- Branch `main` jest podpięty do `origin/main`.

## Safe Push Rules (Security)

Do repo **nie mogą** trafić:

- `.env`
- `.env.local`
- `.env.*.local`
- `SUPABASE_NOTES_LOCAL.md`
- `.next/`
- `node_modules/`
- pliki logów (`*.log`)

W kodzie mogą występować nazwy zmiennych środowiskowych (np. `process.env.STRIPE_SECRET_KEY`), ale **nie wolno** commitować realnych wartości kluczy.

## Standard Push Workflow

```bash
cd /Users/bm/Desktop/Perfect_Blue
git status
git add .
git commit -m "your message"
git push
```

## Extra Safety Check Before Push

```bash
git status --short
git diff --cached
```

Jeśli zobaczysz w staged files cokolwiek z lokalnych sekretów, przerwij i popraw `.gitignore` / staging przed push.

## Last Updated

2026-05-07
