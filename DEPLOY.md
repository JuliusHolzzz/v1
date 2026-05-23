# WikiRace — Deploy (Vercel + Supabase)

## 1. Supabase einrichten (~5 Min.)

1. Öffne [supabase.com](https://supabase.com) → **New project**
2. Warte, bis die DB bereit ist
3. **SQL Editor** → **New query** → Inhalt von `supabase_schema.sql` einfügen → **Run**
4. **Project Settings** → **API**:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** Key (secret!) → `SUPABASE_SERVICE_KEY`  
     ⚠️ Niemals im Frontend verwenden — nur auf Vercel als Server-Env.

## 2. Code auf GitHub

```bash
git add .
git commit -m "Enable Supabase backend, multiplayer, and Vercel API"
git push origin main
```

## 3. Vercel verbinden

1. [vercel.com/new](https://vercel.com/new) → Repo **JuliusHolzzz/v1** importieren
2. **Root Directory**: leer lassen (Repo-Root ist das Projekt)
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
