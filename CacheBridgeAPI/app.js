import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import Redis from "ioredis";

const app = express();
app.use(express.json());

// enable CORS for console frontend
app.use(cors({
    origin: "http://localhost:4000" // adjust if console served elsewhere
}));

// Load env vars
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;
const DB_NAME = process.env.MONGO_DB || "cachebridge";

// Setup clients
const mongoClient = new MongoClient(MONGO_URI);
const redis = new Redis(REDIS_URL);

let users;

// Cache hit/miss counters
let cacheHits = 0;
let cacheMisses = 0;

// Connect Mongo before starting server
async function init() {
    await mongoClient.connect();
    const db = mongoClient.db(DB_NAME);
    users = db.collection("users");

    console.log("Connected to MongoDB and Redis");
    app.listen(PORT, () => console.log(`CacheBridge API running on :${PORT}`));
}

// --- API routes ---

// Add a user
app.post("/users", async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: "Name & email required" });

        const result = await users.insertOne({ name, email });

        // Invalidate cache list
        await redis.del("users:all");

        res.status(201).json({ id: result.insertedId, name, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add user" });
    }
});

// Get a single user (cache-aside)
app.get("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const cacheKey = `user:${userId}`;

    try {
        // 1. Try Redis
        const cached = await redis.get(cacheKey);
        if (cached) {
            cacheHits++;
            return res.json({ ...JSON.parse(cached), source: "cache" });
        }

        // 2. Fallback to Mongo
        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ error: "User not found" });

        // 3. Store in Redis with TTL
        await redis.setex(cacheKey, 60, JSON.stringify(user)); // 60s TTL
        cacheMisses++;

        res.json({ ...user, source: "mongo" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// Get all users (simple cache)
app.get("/users", async (req, res) => {
    const cacheKey = "users:all";

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            cacheHits++;
            return res.json({ users: JSON.parse(cached), source: "cache" });
        }

        const allUsers = await users.find().toArray();

        await redis.setex(cacheKey, 60, JSON.stringify(allUsers)); // 60s TTL
        cacheMisses++;

        res.json({ users: allUsers, source: "mongo" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Clear cache
app.delete("/cache/clear", async (req, res) => {
    try {
        await redis.flushall();
        res.json({ message: "Redis cache cleared" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to clear Redis cache" });
    }
});

// Health check
app.get("/health", async (req, res) => {
    const start = Date.now();
    try {
        const mongoCount = await users.countDocuments();
        const redisKeys = await redis.dbsize();
        const latency = Date.now() - start;

        res.json({
            api: { status: "online", latency },
            mongo: { status: "online", docs: mongoCount },
            redis: { status: "online", keys: redisKeys }
        });
    } catch (err) {
        console.error("Health check error:", err);
        res.status(500).json({
            api: { status: "error" },
            mongo: { status: "unknown" },
            redis: { status: "unknown" },
            error: err.message
        });
    }
});

// Metrics endpoint
app.get("/metrics", (req, res) => {
    res.json({
        hits: cacheHits,
        misses: cacheMisses
    });
});

init().catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
});
