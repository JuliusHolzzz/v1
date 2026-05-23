# WikiRace — Deploy (Vercel + Supabase)

> **Base44 ist deaktiviert.** Alle Daten (Leaderboard, Lobbies, Accounts) liegen nur noch in **deiner Supabase**. Die alte Base44-Cloud wird vom Code nicht mehr angesprochen.

## 1. Supabase + GitHub (hast du schon)

Mit **Supabase ↔ GitHub** auf `JuliusHolzzz/v1`:

- Schema liegt in `supabase/migrations/` (nicht nur `supabase_schema.sql` im Root)
- Bei jedem Push auf `main` wendet Supabase neue Migrations auf das verknüpfte Projekt an
- In Supabase: **Database** → **Migrations** — dort siehst du, ob `initial_wikirace_schema` durch ist

Falls die Tabellen noch fehlen: einmal **SQL Editor** → Inhalt von `supabase_schema.sql` ausführen (gleicher Inhalt, harmlos wegen `IF NOT EXISTS`).

**API-Keys** (für Vercel): **Project Settings** → **API**

| Vercel-Variable | Supabase |
|-----------------|----------|
| `SUPABASE_URL` oder `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` oder `SUPABASE_SERVICE_KEY` | `service_role` (secret) |

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
Dann setzt Supabase meist **`NEXT_PUBLIC_SUPABASE_URL`** und **`SUPABASE_SERVICE_ROLE_KEY`** auf Vercel (unser Server liest beide Namen). Du musst nur noch **`JWT_SECRET`** manuell ergänzen und **Redeploy** auslösen.

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

> **Architektur:** Ein `server.js` am Projekt-Root liefert **Frontend + API** auf derselben URL. Vercel erkennt `server.listen()` automatisch — keine kaputten `/api`-Rewrites mehr.

> **Schwarzer Bildschirm?** War oft: JS/CSS 404. Mit `server.js` werden `js/`, `css/`, `images/` direkt mit ausgeliefert.

## 4. Prüfen

- `https://DEINE-APP.vercel.app/api/health`  
  → `"database": true` und `"tablesOk": true`  
  → Wenn `"database": false`: Env-Variablen fehlen auf Vercel → **Redeploy**  
  → Wenn `"tablesOk": false`: `supabase/migrations/` in Supabase noch nicht gelaufen
- App öffnen → Leaderboard (leer bis erste Scores)
- Multiplayer → Lobby erstellen → sollte in **öffentliche Lobbies** erscheinen

## 5. Eigene Domain (optional)

Vercel → Project → **Settings** → **Domains** → `wiki-race.de` hinzufügen.

## Lokal testen

```bash
cp .env.example .env
# .env ausfüllen (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
npm install
npm start
# Browser: http://localhost:3000
# Test: http://localhost:3000/api/health  → database: true
```
