# Development Server Guide

**Last updated**: 2026-05-07

## How to Start the Application on Local Port

This guide documents the correct way to start the Next.js development server, based on successful troubleshooting sessions.

---

## Quick Start

```bash
cd /Users/bm/Desktop/Perfect_Blue
ulimit -n 10240 && npm run dev -- --port 3008
```

Then open: **http://localhost:3008**

### Verify the server (optional)

This project’s default locale is **Polish (`pl`)**. After you see `✓ Ready`, you can confirm routing works without a browser:

```bash
# Root should redirect to the default locale (307 + Location: /pl)
curl -sI http://localhost:3008/ | head -5

# Default locale home should return 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3008/pl
```

If the server prints `✓ Ready` but these checks return **404** for `/` and `/pl`, treat it as a watcher / file-descriptor problem (see Issue 2) before debugging application code.

---

## Common Issues & Solutions

### Issue 1: Port Already in Use

**Symptoms:**
- Error: `address already in use :::3008`
- Server fails to start

**Solution:**
```bash
# Kill all processes on port 3008
lsof -ti:3008 | xargs kill -9

# Then restart
ulimit -n 10240 && npm run dev -- --port 3008
```

### Issue 2: File Watcher Errors (EMFILE)

**Symptoms:**
- Error: `EMFILE: too many open files` (often from Watchpack)
- Changes not reflecting in browser
- Stale code being served
- **404 on `/`, `/pl`, or other routes** even though the terminal shows `✓ Ready` (watchers failed; the app may not compile routes correctly)

**Solution:**
```bash
# 1. Kill the existing dev server process
kill <pid>

# 2. Clear Next.js cache
rm -rf .next

# 3. Increase file limit and restart
ulimit -n 10240 && npm run dev -- --port 3008
```

**If EMFILE persists:** Some **IDE tasks, agents, or CI/sandbox runners** enforce a low open-file cap regardless of `ulimit` in the shell. Run the same Quick Start command from a **normal local terminal** (Terminal.app, iTerm, etc.), or raise **system-level** file descriptor limits for your user session. Until watchers work, expect broken hot reload and possible 404s.

### Issue 3: Session Expired / Server Stopped

**Symptoms:**
- `localhost:3008` not responding
- Connection refused

**Solution:**
```bash
# Check if server is running
lsof -ti:3008

# If no output (server stopped), restart:
ulimit -n 10240 && npm run dev -- --port 3008
```

### Issue 4: Missing Next.js Vendor Chunk (`@supabase.js`)

**Symptoms:**
- Error: `Cannot find module './vendor-chunks/@supabase.js'`
- Require stack points into `.next/server/...` (for example `webpack-runtime.js`)
- Often appears after repeated dev-server restarts or stale build artifacts

**Solution:**
```bash
cd /Users/bm/Desktop/Perfect_Blue

# 1) Kill stale processes on project port
lsof -ti:3008 | xargs kill -9 || true

# 2) Clear Next.js build cache
rm -rf .next

# 3) Clear local webpack/next cache (safe)
rm -rf node_modules/.cache

# 4) Restart dev server
ulimit -n 10240 && npm run dev -- --port 3008
```

**Verify immediately:**
```bash
curl -sI http://localhost:3008/pl/listings | head -5
curl -sI http://localhost:3008/pl/profile | head -5
```

---

## Checking Server Status

### Method 1: Check Terminal Output
```bash
# View recent dev server logs
tail -n 50 /Users/bm/.cursor/projects/Users-bm-Desktop-Perfect-Blue/terminals/*.txt
```

### Method 2: Check Running Processes
```bash
# List all processes on port 3008
lsof -ti:3008

# If output shows a PID, server is running
# If no output, server is stopped
```

### Method 3: Check Terminal Metadata
```bash
# View all terminal sessions
head -n 10 /Users/bm/.cursor/projects/Users-bm-Desktop-Perfect-Blue/terminals/*.txt
```

---

## Important Notes

1. **Always use `ulimit -n 10240`** before starting the dev server to prevent file watcher issues (may be ineffective inside some sandboxed runners; see Issue 2)
2. **Port 3008** is the standard development port for this project
3. **Clear `.next` cache** if you see stale code or unexpected behavior
4. **Environment variables** are loaded from `.env.local`
5. The server typically takes **1-2 seconds** to start and compile
6. **`✓ Ready` is not enough** if Watchpack is spamming EMFILE—use the **Verify the server** checks above to confirm redirects and `/pl` return **200**
7. Avoid running multiple `next dev` processes for this repo/port at the same time; stale listeners on 3008 increase cache/startup issues

---

## Troubleshooting Checklist

When the dev server won't start or behaves incorrectly:

- [ ] Check if port 3008 is already in use (`lsof -ti:3008`)
- [ ] Kill any existing processes on port 3008
- [ ] Clear the `.next` build cache (`rm -rf .next`)
- [ ] If you see missing `vendor-chunks` errors, also clear `node_modules/.cache`
- [ ] Increase file descriptor limit (`ulimit -n 10240`)
- [ ] Run the **Verify the server** `curl` checks; if you get **404** on `/` and `/pl`, fix EMFILE / run from a normal terminal (Issue 2)
- [ ] Verify environment variables exist (`.env.local`)
- [ ] Check for Node.js/npm errors in terminal output
- [ ] Restart the dev server with the full command

---

## Full Restart Procedure (Nuclear Option)

If nothing else works:

```bash
# 1. Kill all Node processes
pkill -9 node

# 2. Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# 3. Restart with increased limits
ulimit -n 10240 && npm run dev -- --port 3008
```

---

## Success Indicators

When the server starts correctly, you should see:

```
▲ Next.js 14.2.35
- Local:        http://localhost:3008
- Environments: .env.local

✓ Starting...
✓ Ready in 1343ms
```

Then the first page compilation:

```
○ Compiling /[locale] ...
✓ Compiled /[locale] in 2.3s (997 modules)
```

---

## Additional Resources

- Next.js Documentation: https://nextjs.org/docs
- Project uses Next.js 14.2.35 with App Router
- Supabase client is configured in `src/lib/supabase/`
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
