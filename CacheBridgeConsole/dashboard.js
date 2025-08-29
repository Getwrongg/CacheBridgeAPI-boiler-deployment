const API_BASE = "http://localhost:4001";

const apiStatusEl = document.getElementById("api-status");
const mongoStatusEl = document.getElementById("mongo-status");
const redisStatusEl = document.getElementById("redis-status");
const hitsEl = document.getElementById("cache-hits");
const missesEl = document.getElementById("cache-misses");
const ratioEl = document.getElementById("cache-ratio");
const clearBtn = document.getElementById("clear-cache");

// Fetch health
async function fetchHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        apiStatusEl.textContent = `API: ${data.api.status} (${data.api.latency}ms)`;
        mongoStatusEl.textContent = `MongoDB: ${data.mongo.status}, docs: ${data.mongo.docs}`;
        redisStatusEl.textContent = `Redis: ${data.redis.status}, keys: ${data.redis.keys}`;
    } catch {
        apiStatusEl.textContent = "API: Offline";
        mongoStatusEl.textContent = "MongoDB: Unknown";
        redisStatusEl.textContent = "Redis: Unknown";
    }
}

// Fetch metrics
async function fetchMetrics() {
    try {
        const res = await fetch(`${API_BASE}/metrics`);
        const data = await res.json();
        hitsEl.textContent = `Cache Hits: ${data.hits}`;
        missesEl.textContent = `Cache Misses: ${data.misses}`;
        const ratio = data.hits + data.misses > 0 ? (data.hits / (data.hits + data.misses)) * 100 : 0;
        ratioEl.textContent = `Hit Ratio: ${ratio.toFixed(1)}%`;
    } catch {
        hitsEl.textContent = "Cache Hits: Error";
        missesEl.textContent = "Cache Misses: Error";
        ratioEl.textContent = "Hit Ratio: Error";
    }
}

// Clear cache
async function clearCache() {
    try {
        const res = await fetch(`${API_BASE}/cache/clear`, { method: "DELETE" });
        const data = await res.json();
        alert(data.message || "Cache cleared");
        fetchMetrics();
    } catch {
        alert("Failed to clear cache");
    }
}

clearBtn.addEventListener("click", clearCache);

function refresh() {
    fetchHealth();
    fetchMetrics();
}
setInterval(refresh, 5000);
refresh();
