const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const JWT_SECRET = process.env.JWT_SECRET || "wikirace_secret_change_me";

function requireDb(_req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      error: "Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
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

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = new Set([
        "https://wiki-race.de",
        "https://www.wiki-race.de",
        "https://wiki-race.base44.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173",
      ]);
      if (allowed.has(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: Boolean(supabase),
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Base44-compatible entity API (used by the frontend bundle)
// ═══════════════════════════════════════════════════════════════════════════════

app.get("/api/apps/:appId/entities/:entity", requireDb, async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/apps/:appId/entities/:entity", requireDb, async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/apps/:appId/entities/:entity/:id", requireDb, async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REST API (WikiRaceAPI / direct clients)
// ═══════════════════════════════════════════════════════════════════════════════

app.post("/api/players/register", requireDb, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    if (username.length < 2) {
      return res.status(400).json({ error: "Username too short (min 2)" });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password too short (min 4)" });
    }

    const lower = username.toLowerCase();

    const { data: existing } = await supabase
      .from("players")
      .select("id")
      .eq("username", lower)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("players")
      .insert({ username: lower, password_hash, total_games: 0, best_score: 0 })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id, username: data.username }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ player: { id: data.id, username: data.username }, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/players/login", requireDb, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const { data: player, error } = await supabase
      .from("players")
      .select("*")
      .eq("username", username.toLowerCase())
      .single();

    if (error || !player) {
      return res.status(401).json({ error: "Wrong username or password" });
    }

    const valid = await bcrypt.compare(password, player.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Wrong username or password" });
    }

    const token = jwt.sign(
      { id: player.id, username: player.username },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ player: { id: player.id, username: player.username }, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/players/:username", requireDb, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("id, username, total_games, best_score, created_at")
      .eq("username", req.params.username.toLowerCase())
      .single();

    if (error || !data) return res.status(404).json({ error: "Player not found" });
    res.json(compatRow(data));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/scores", requireDb, async (req, res) => {
  try {
    const {
      username,
      time_seconds,
      clicks,
      score,
      from_article,
      to_article,
      mode,
      date,
    } = req.body;

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

    const { data: player } = await supabase
      .from("players")
      .select("best_score, total_games")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (player) {
      await supabase
        .from("players")
        .update({
          total_games: (player.total_games || 0) + 1,
          best_score: Math.max(player.best_score || 0, score),
        })
        .eq("username", username.toLowerCase());
    }

    res.json(compatRow(data));
  } catch (err) {
    console.error("Score submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/scores/leaderboard", requireDb, async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/lobbies", requireDb, async (req, res) => {
  try {
    const {
      code,
      host,
      is_public,
      from_article,
      to_article,
      max_players,
      players,
    } = req.body;

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
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/lobbies", requireDb, async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/lobbies/code/:code", requireDb, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("lobbies")
      .select("*")
      .eq("code", req.params.code.toUpperCase())
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Lobby not found" });
    }

    res.json(compatRow(data[0]));
  } catch (err) {
    console.error("Lobby get error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/lobbies/:id", requireDb, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("lobbies")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Lobby not found" });
    res.json(compatRow(data));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/lobbies/:id", requireDb, async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/lobbies/cleanup", requireDb, async (_req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from("lobbies").delete().lt("created_at", oneDayAgo);

    if (error) throw error;
    res.json({ message: "Cleanup done" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Start (local dev only; Vercel uses serverless export) ─────────────────────
const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`WikiRace API running on port ${PORT}`);
  });
}

module.exports = app;
