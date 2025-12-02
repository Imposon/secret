require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const mysql = require("mysql2/promise");
const { Client: PGClient } = require("pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}



//SQLITE
const sqliteDB = new sqlite3.Database("./prisma/dev.db", (err) => {
  if (err) console.error("SQLite error:", err);
  else console.log("SQLite connected");
});

//MYSQL
let mysqlDB;
(async () => {
  try {
    mysqlDB = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
    });
    console.log("MySQL connected");
  } catch (err) {
    console.log("MySQL not connected:", err.message);
  }
})();

// POSTGRES
let pgClient;
(async () => {
  try {
    pgClient = new PGClient({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      database: process.env.POSTGRES_DB,
    });
    await pgClient.connect();
    console.log("PostgreSQL connected");
  } catch (err) {
    console.log("PostgreSQL not connected:", err.message);
  }
})();

function getQueryType(query) {
  if (!query) return "unknown";
  const first = query.trim().split(/\s+/)[0].toLowerCase();
  if (["select", "pragma"].includes(first)) return "select";
  if (["insert", "update", "delete", "create", "drop", "alter", "replace"].includes(first))
    return "modify";
  return "other";
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/databases", async (req, res) => {
  try {
    // SQLite tables
    const sqliteTables = await new Promise((resolve) => {
      sqliteDB.all(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`,
        [],
        (err, rows) => resolve(rows?.map((r) => r.name) || [])
      );
    });

    // MySQL tables
    let mysqlTables = [];
    try {
      const [rows] = await mysqlDB.query(`SHOW TABLES`);
      mysqlTables = rows.map((r) => Object.values(r)[0]);
    } catch {}

    // PostgreSQL tables
    let pgTables = [];
    try {
      const result = await pgClient.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema='public';
      `);
      pgTables = result.rows.map((r) => r.table_name);
    } catch {}

    res.json([
      { type: "sqlite", name: "SQLite", tables: sqliteTables },
      { type: "mysql", name: "MySQL", tables: mysqlTables },
      { type: "postgres", name: "PostgreSQL", tables: pgTables },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/columns/:db/:table", async (req, res) => {
  const { db, table } = req.params;

  try {
    if (db === "sqlite") {
      sqliteDB.all(`PRAGMA table_info(${table})`, [], (err, rows) =>
        res.json(rows || [])
      );
    }

    if (db === "mysql") {
      const [cols] = await mysqlDB.query(`DESCRIBE ${table}`);
      res.json(cols);
    }

    if (db === "postgres") {
      const result = await pgClient.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name='${table}';
      `);
      res.json(result.rows);
    }
  } catch {
    res.json([]);
  }
});
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email & password required" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name }
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email & password required" });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

app.post("/api/query", authMiddleware, async (req, res) => {
  const { query, db } = req.body;
  const userId = req.user?.id;
  if (!query || typeof query !== "string") return res.status(400).json({ success: false, error: "Query required" });

  const type = getQueryType(query);

  try {
    if ((db === "sqlite" || !db) && type === "select") {
      sqliteDB.all(query, [], async (err, rows) => {
        if (err) {
          await prisma.queryHistory.create({ data: { query, status: "error", type, message: err.message, userId } });
          return res.status(500).json({ success: false, error: err.message });
        }
        await prisma.queryHistory.create({ data: { query, status: "success", type, message: `Returned ${rows.length} rows`, userId } });
        res.json({ success: true, type: "select", result: rows });
      });
      return;
    }

    if ((db === "sqlite" || !db) && type !== "select") {
      sqliteDB.run(query, async function (err) {
        if (err) {
          await prisma.queryHistory.create({ data: { query, status: "error", type, message: err.message, userId } });
          return res.status(500).json({ success: false, error: err.message });
        }
        const message = `OK. lastID=${this.lastID ?? null}, changes=${this.changes ?? 0}`;
        await prisma.queryHistory.create({ data: { query, status: "success", type, message, userId } });
        res.json({ success: true, type: "modify", message, info: { lastID: this.lastID, changes: this.changes } });
      });
      return;
    }

    if (db === "mysql") {
      const [rows] = await mysqlDB.query(query);
      await prisma.queryHistory.create({ data: { query, status: "success", type, message: `mysql returned`, userId } });
      return res.json({ success: true, type: "select", result: rows });
    }

    if (db === "postgres") {
      const result = await pgClient.query(query);
      await prisma.queryHistory.create({ data: { query, status: "success", type, message: `postgres returned`, userId } });
      return res.json({ success: true, type: "select", result: result.rows });
    }

    res.status(400).json({ success: false, error: "Unknown DB or unsupported query type" });
  } catch (err) {
    console.error("Query exec error:", err);
    await prisma.queryHistory.create({ data: { query, status: "error", type, message: err.message, userId } }).catch(() => {});
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/history", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const history = await prisma.queryHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.post("/api/history/rerun/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const h = await prisma.queryHistory.findUnique({ where: { id } });
  if (!h) return res.status(404).json({ error: "Not found" });
  req.body = { query: h.query, db: req.body.db || "sqlite" }; 
  return app._router.handle(req, res, () => {}); 
});

app.listen(5001, () => console.log("Backend running on http://localhost:5001"));
