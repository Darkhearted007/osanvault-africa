// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { generateSEO } from "./seo-generator.js"; // your SEO module

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "../public")));

// Simple status endpoint
app.get("/api/status", (req, res) => {
  res.json({ status: "ÒsánVault backend running ✅" });
});

// Optional: regenerate SEO manually
app.get("/api/generate-seo", async (req, res) => {
  try {
    await generateSEO();
    res.json({ success: true, message: "SEO regenerated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ÒsánVault backend listening on port ${PORT}`);
});
