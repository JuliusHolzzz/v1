const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || "wikirace_secret_change_me";

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://wiki-race.de",
    "https://www.wiki-race.de",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYERS
// ═══════════════════════════════════════════════════════════════════════════════

// Register
app.post("/api/players/register", async (req, res) => {
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

    // Check if taken
    const { data: existing } = await supabase
      .from("players")
      .select("id")
      .eq("username", lower)
      .single();

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

// Login
app.post("/api/players/login", async (req, res) => {
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

// Get player by username (legacy compat)
app.get("/api/players/:username", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("id, username, total_games, best_score, created_at")
      .eq("username", req.params.username.toLowerCase())
      .single();

    if (error || !data) return res.status(404).json({ error: "Player not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GAME SCORES
// ═══════════════════════════════════════════════════════════════════════════════

// Submit score
app.post("/api/scores", async (req, res) => {
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

    // Update player best score
    const { data: player } = await supabase
      .from("players")
      .select("best_score, total_games")
      .eq("username", username.toLowerCase())
      .single();

    if (player) {
      await supabase
        .from("players")
        .update({
          total_games: (player.total_games || 0) + 1,
          best_score: Math.max(player.best_score || 0, score),
        })
        .eq("username", username.toLowerCase());
    }

    res.json(data);
  } catch (err) {
    console.error("Score submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get leaderboard
app.get("/api/scores/leaderboard", async (req, res) => {
  try {
    const { mode, date, limit = 50 } = req.query;

    let query = supabase
      .from("game_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(parseInt(limit));

    if (mode) query = query.eq("mode", mode);
    if (date) query = query.eq("date", date);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOBBIES
// ═══════════════════════════════════════════════════════════════════════════════

// Create lobby
app.post("/api/lobbies", async (req, res) => {
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
        code,
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
    res.json(data);
  } catch (err) {
    console.error("Lobby create error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get public lobbies
app.get("/api/lobbies", async (req, res) => {
  try {
    const { status, is_public, limit = 20 } = req.query;

    let query = supabase
      .from("lobbies")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (status) query = query.eq("status", status);
    if (is_public !== undefined) query = query.eq("is_public", is_public === "true");

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error("Lobbies list error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get lobby by code
app.get("/api/lobbies/code/:code", async (req, res) => {
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

    res.json(data[0]);
  } catch (err) {
    console.error("Lobby get error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get lobby by ID
app.get("/api/lobbies/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("lobbies")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Lobby not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update lobby
app.put("/api/lobbies/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("lobbies")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Lobby update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete old lobbies (cleanup)
app.delete("/api/lobbies/cleanup", async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("lobbies")
      .delete()
      .lt("created_at", oneDayAgo);

    if (error) throw error;
    res.json({ message: "Cleanup done" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WikiRace API running on port ${PORT}`);
});

module.exports = app;
