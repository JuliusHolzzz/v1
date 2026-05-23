# WikiRace — Deploy (Vercel + Supabase)

## 1. Supabase + GitHub (hast du schon)

Mit **Supabase ↔ GitHub** auf `JuliusHolzzz/v1`:

- Schema liegt in `supabase/migrations/` (nicht nur `supabase_schema.sql` im Root)
- Bei jedem Push auf `main` wendet Supabase neue Migrations auf das verknüpfte Projekt an
- In Supabase: **Database** → **Migrations** — dort siehst du, ob `initial_wikirace_schema` durch ist

Falls die Tabellen noch fehlen: einmal **SQL Editor** → Inhalt von `supabase_schema.sql` ausführen (gleicher Inhalt, harmlos wegen `IF NOT EXISTS`).

**API-Keys** (für Vercel): **Project Settings** → **API**

| Vercel-Variable | Supabase |
|-----------------|----------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_KEY` | `service_role` (secret) |

⚠️ `service_role` nur auf dem Server (Vercel), nie im Browser.

## 2. Code auf GitHub

```bash
git add .
git commit -m "Enable Supabase backend, multiplayer, and Vercel API"
git push origin main
```

## 3. Vercel verbinden

**Option A — Supabase-Integration (empfohlen)**  
Supabase Dashboard → **Project Settings** → **Integrations** → **Vercel** → Repo `v1` verknüpfen.  
Dann setzt Supabase `SUPABASE_URL` und `SUPABASE_SERVICE_KEY` auf Vercel automatisch. Du musst nur noch **`JWT_SECRET`** manuell in Vercel ergänzen.

**Option B — manuell**  
1. [vercel.com/new](https://vercel.com/new) → Repo **JuliusHolzzz/v1** importieren  
2. **Root Directory**: leer lassen  
3. **Environment Variables** (Production + Preview):

| Name | Wert |
|------|------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service_role) |
| `JWT_SECRET` | langer Zufallsstring (z. B. `openssl rand -hex 32`) |

4. **Deploy**

## 4. Prüfen

- `https://DEINE-APP.vercel.app/api/health`  
  → `{"status":"ok","database":true,...}`
- App öffnen → Leaderboard (leer bis erste Scores)
- Multiplayer → Lobby erstellen → sollte in **öffentliche Lobbies** erscheinen

## 5. Eigene Domain (optional)

Vercel → Project → **Settings** → **Domains** → `wiki-race.de` hinzufügen.

## Lokal testen

```bash
cp .env.example .env
# .env ausfüllen
npm install
npm start
# In anderem Terminal: npx serve . -p 4173
# Browser: http://localhost:4173  (API läuft auf :3001 — für lokales Testen besser: npx vercel dev)
```

Empfohlen lokal: `npx vercel dev` (startet Frontend + API wie auf Vercel).
