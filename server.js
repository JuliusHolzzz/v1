/**
 * WikiRace — single Node server for Vercel + local dev.
 * Serves static frontend (js/css) and /api routes on the same origin.
 */
const path = require("path");
const express = require("express");
const { createWikiRaceApp } = require("./lib/wikirace-api");

const app = express();
const rootDir = __dirname;

app.use(createWikiRaceApp());

app.use(
  express.static(rootDir, {
    index: false,
    extensions: ["html"],
  })
);

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(rootDir, "index.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`WikiRace running at http://localhost:${port}`);
});

module.exports = app;
