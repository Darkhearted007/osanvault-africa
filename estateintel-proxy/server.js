require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/estateintel/:endpoint", async (req, res) => {
  try {
    const response = await fetch(`https://api.estateintel.com/${req.params.endpoint}`, {
      headers: { Authorization: `Bearer ${process.env.ESTATEINTEL_API_KEY}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ÒsánVault Africa EstateIntel proxy running on port ${PORT}`);
});
