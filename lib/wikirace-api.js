const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let supabaseClient = null;

function resolveSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    null
  );
}

function resolveSupabaseServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  if (process.env.SUPABASE_SERVICE_KEY) {
    return process.env.SUPABASE_SERVICE_KEY;
  }
  if (process.env.SUPABASE_SECRET_KEY) {
    return process.env.SUPABASE_SECRET_KEY;
  }
  try {
    const raw = process.env.SUPABASE_SECRET_KEYS;
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.default || parsed.service_role || Object.values(parsed)[0];
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getSupabase() {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseServiceKey();
  if (!url || !key) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

function resetSupabaseClient() {
  supabaseClient = null;
}

const JWT_SECRET = process.env.JWT_SECRET || "wikirace_secret_change_me";

function requireDb(_req, res, next) {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({
      error:
        "Database not configured. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on Vercel, then redeploy.",
      missing: {
        url: !resolveSupabaseUrl(),
        serviceKey: !resolveSupabaseServiceKey(),
      },
      hint: "Supabase → Project Settings → API → service_role key",
    });
  }
  next();
}

function parseSort(sort) {
  if (!sort) return { column: "created_at", ascending: false };
  const desc = sort.startsWith("-");
  const col = desc ? sort.slice(1) : sort;
  const column = col === "created_date" ? "created_at" : col;
  return { column, ascending: !desc };
}

function compatRow(row) {
  if (!row) return row;
  return { ...row, created_date: row.created_date || row.created_at };
}

function compatRows(rows) {
  return (rows || []).map(compatRow);
}

function playerPasswordMatches(storedHash, providedHash) {
  return Boolean(storedHash && providedHash && storedHash === providedHash);
}

function createWikiRaceApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/api/health", async (_req, res) => {
    resetSupabaseClient();
    const supabase = getSupabase();
    const out = {
      status: "ok",
      database: Boolean(supabase),
      env: {
        SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY),
      },
      timestamp: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase.from("lobbies").select("id").limit(1);
      out.tablesOk = !error;
      if (error) out.tableError = error.message;
    }

    res.json(out);
  });

  app.get("/api/apps/:appId/entities/:entity", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { entity } = req.params;
      const q = req.query.q ? JSON.parse(req.query.q) : {};
      const sort = parseSort(req.query.sort);
      const limit = parseInt(req.query.limit || "50", 10);

      if (entity === "GameScore") {
        let query = supabase
          .from("game_scores")
          .select("*")
          .order(sort.column, { ascending: sort.ascending })
          .limit(limit);

        if (q.mode) query = query.eq("mode", q.mode);
        if (q.date) query = query.eq("date", q.date);

        const { data, error } = await query;
        if (error) throw error;
        return res.json(compatRows(data || []));
      }

      if (entity === "Lobby") {
        let query = supabase
          .from("lobbies")
          .select("*")
          .order(sort.column, { ascending: sort.ascending })
          .limit(limit);

        if (q.status) query = query.eq("status", q.status);
        if (q.is_public !== undefined) query = query.eq("is_public", q.is_public);
        if (q.code) query = query.eq("code", String(q.code).toUpperCase());

        const { data, error } = await query;
        if (error) throw error;
        return res.json(compatRows(data || []));
      }

      if (entity === "Player") {
        if (!q.username) return res.json([]);

        const { data: player, error } = await supabase
          .from("players")
          .select("id, username, password_hash, total_games, best_score, created_at")
          .eq("username", String(q.username).toLowerCase())
          .maybeSingle();

        if (error) throw error;
        if (!player) return res.json([]);

        if (q.password_hash) {
          const ok = playerPasswordMatches(player.password_hash, q.password_hash);
          if (!ok) return res.json([]);
        }

        const { password_hash: _ph, ...safe } = player;
        return res.json(compatRows([safe]));
      }

      return res.status(404).json({ error: "Unknown entity" });
    } catch (err) {
      console.error("Entity filter error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.post("/api/apps/:appId/entities/:entity", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { entity } = req.params;
      const body = req.body;

      if (entity === "GameScore") {
        const { data, error } = await supabase
          .from("game_scores")
          .insert({
            username: String(body.username || "").toLowerCase(),
            time_seconds: body.time_seconds || 0,
            clicks: body.clicks || 0,
            score: body.score,
            from_article: body.from_article,
            to_article: body.to_article,
            mode: body.mode || "classic",
            date: body.date || new Date().toISOString().split("T")[0],
          })
          .select()
          .single();

        if (error) throw error;

        const { data: player } = await supabase
          .from("players")
          .select("best_score, total_games")
          .eq("username", String(body.username || "").toLowerCase())
          .maybeSingle();

        if (player) {
          await supabase
            .from("players")
            .update({
              total_games: (player.total_games || 0) + 1,
              best_score: Math.max(player.best_score || 0, body.score || 0),
            })
            .eq("username", String(body.username || "").toLowerCase());
        }

        return res.json(compatRow(data));
      }

      if (entity === "Lobby") {
        const { data, error } = await supabase
          .from("lobbies")
          .insert({
            code: String(body.code || "").toUpperCase(),
            host: body.host,
            is_public: body.is_public !== false,
            status: body.status || "waiting",
            from_article: body.from_article,
            to_article: body.to_article,
            max_players: body.max_players || 8,
            players: body.players || [],
          })
          .select()
          .single();

        if (error) throw error;
        return res.json(compatRow(data));
      }

      if (entity === "Player") {
        const lower = String(body.username || "").toLowerCase();
        const { data: existing } = await supabase
          .from("players")
          .select("id")
          .eq("username", lower)
          .maybeSingle();

        if (existing) {
          return res.status(409).json({ error: "Username already taken" });
        }

        const { data, error } = await supabase
          .from("players")
          .insert({
            username: lower,
            password_hash: body.password_hash,
            total_games: body.total_games || 0,
            best_score: body.best_score || 0,
          })
          .select("id, username, total_games, best_score, created_at")
          .single();

        if (error) throw error;
        return res.json(compatRow(data));
      }

      return res.status(404).json({ error: "Unknown entity" });
    } catch (err) {
      console.error("Entity create error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.put("/api/apps/:appId/entities/:entity/:id", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { entity, id } = req.params;

      if (entity === "Lobby") {
        const { data, error } = await supabase
          .from("lobbies")
          .update(req.body)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return res.json(compatRow(data));
      }

      return res.status(404).json({ error: "Unknown entity" });
    } catch (err) {
      console.error("Entity update error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.post("/api/scores", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { username, time_seconds, clicks, score, from_article, to_article, mode, date } =
        req.body;

      if (!username || score === undefined) {
        return res.status(400).json({ error: "username and score required" });
      }

      const { data, error } = await supabase
        .from("game_scores")
        .insert({
          username: username.toLowerCase(),
          time_seconds: time_seconds || 0,
          clicks: clicks || 0,
          score,
          from_article,
          to_article,
          mode: mode || "classic",
          date: date || new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      res.json(compatRow(data));
    } catch (err) {
      console.error("Score submit error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.get("/api/scores/leaderboard", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { mode, date, limit = 50 } = req.query;

      let query = supabase
        .from("game_scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(parseInt(limit, 10));

      if (mode) query = query.eq("mode", mode);
      if (date) query = query.eq("date", date);

      const { data, error } = await query;
      if (error) throw error;

      res.json(compatRows(data || []));
    } catch (err) {
      console.error("Leaderboard error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.post("/api/lobbies", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { code, host, is_public, from_article, to_article, max_players, players } =
        req.body;

      const { data, error } = await supabase
        .from("lobbies")
        .insert({
          code: String(code || "").toUpperCase(),
          host,
          is_public: is_public !== false,
          status: "waiting",
          from_article,
          to_article,
          max_players: max_players || 8,
          players: players || [],
        })
        .select()
        .single();

      if (error) throw error;
      res.json(compatRow(data));
    } catch (err) {
      console.error("Lobby create error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.get("/api/lobbies", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { status, is_public, code, limit = 20 } = req.query;

      let query = supabase
        .from("lobbies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(parseInt(limit, 10));

      if (status) query = query.eq("status", status);
      if (is_public !== undefined) query = query.eq("is_public", is_public === "true");
      if (code) query = query.eq("code", String(code).toUpperCase());

      const { data, error } = await query;
      if (error) throw error;

      res.json(compatRows(data || []));
    } catch (err) {
      console.error("Lobbies list error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.put("/api/lobbies/:id", requireDb, async (req, res) => {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from("lobbies")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json(compatRow(data));
    } catch (err) {
      console.error("Lobby update error:", err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.all("/app-logs/*", (_req, res) => {
    res.status(204).end();
  });

  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  return app;
}

module.exports = { createWikiRaceApp, getSupabase, resolveSupabaseUrl, resolveSupabaseServiceKey };
