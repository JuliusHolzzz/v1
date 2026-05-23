// WikiRace API Client — optional direct REST access (window.WikiRaceAPI)
const API_BASE = "/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("wikirace_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

window.WikiRaceAPI = {
  async register(username, password) {
    const data = await apiFetch("/players/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.token) localStorage.setItem("wikirace_token", data.token);
    return data;
  },

  async login(username, password) {
    const data = await apiFetch("/players/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.token) localStorage.setItem("wikirace_token", data.token);
    return data;
  },

  logout() {
    localStorage.removeItem("wikirace_token");
  },

  async submitScore(scoreData) {
    return apiFetch("/scores", {
      method: "POST",
      body: JSON.stringify(scoreData),
    });
  },

  async getLeaderboard({ mode, date, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (date) params.set("date", date);
    if (limit) params.set("limit", limit);
    return apiFetch(`/scores/leaderboard?${params}`);
  },

  async createLobby(lobbyData) {
    return apiFetch("/lobbies", {
      method: "POST",
      body: JSON.stringify(lobbyData),
    });
  },

  async getPublicLobbies(status = "waiting") {
    return apiFetch(`/lobbies?status=${status}&is_public=true`);
  },

  async getLobbyByCode(code) {
    return apiFetch(`/lobbies/code/${code}`);
  },

  async getLobby(id) {
    return apiFetch(`/lobbies/${id}`);
  },

  async updateLobby(id, data) {
    return apiFetch(`/lobbies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
