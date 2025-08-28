# CacheBridge API & Console

This project demonstrates the **correct usage of MongoDB with Redis as a cache**.  
It provides a simple Node.js API (`CacheBridgeAPI`) and a small console app (`CacheBridgeConsole`) to monitor and test how caching improves performance.

The system is packaged with Docker Compose and includes:

- **CacheBridgeAPI** – main API for user accounts (CRUD, cache-aside pattern)
- **CacheBridgeConsole** – console / monitoring UI
- **MongoDB** – source of truth (persistent database)
- **Redis** – cache layer (in-memory accelerator)
- **Mongo Express** – web GUI for MongoDB (port 8081)
- **RedisInsight** – web GUI for Redis (port 8001)

---

## Features

- Create users in MongoDB.
- Fetch users with **cache-aside pattern**:
  - First request → MongoDB (cold, slower).
  - Subsequent request → Redis (warm, faster).
- Clear Redis cache manually to test differences.
- Test automation script in PowerShell (`Test-CacheBridge.ps1`) simulates load and measures performance.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/CacheBridgeAPI.git
cd CacheBridgeAPI
