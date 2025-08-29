import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files (index.html, dashboard.js, etc.)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`CacheBridge Console running at http://localhost:${PORT}`);
});
