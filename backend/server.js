require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const mysql = require("mysql2/promise");
const { Client: PGClient } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 Starting Clean SQL Runner Backend...");

//
const sqliteDB = new sqlite3.Database("./prisma/dev.db", err => {
  if (err) console.error("❌ SQLite error:", err);
  else {
    console.log("✅ SQLite connected");
    // Init Users Table
    sqliteDB.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

//
let mysqlDB;
(async () => {
  try {
    mysqlDB = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB
    });
    console.log("✅ MySQL connected");
  } catch (err) {
    console.log("❌ MySQL not connected:", err.message);
  }
})();

//
// POSTGRES (Railway)
// POSTGRES (Railway)
let pgClient;
(async () => {
  try {
    pgClient = new PGClient({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,   // required for Railway
      },
    });

    await pgClient.connect();
    console.log("✅ PostgreSQL connected (Railway SSL enabled)");
  } catch (err) {
    console.error("❌ PostgreSQL not connected:", err.message);
  }
})();




//
//
//
// AUTH
//
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-123";

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const hash = await bcrypt.hash(password, 10);
    sqliteDB.run(
      `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
      [email, hash, name],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) return res.status(400).json({ error: "User exists" });
          return res.status(500).json({ error: err.message });
        }
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  sqliteDB.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Invalid credentials" });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  });
});

app.get("/api/databases", async (req, res) => {
  try {
    // SQLite
    const sqliteTables = await new Promise(resolve => {
      sqliteDB.all(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`,
        [],
        (err, rows) => resolve(rows?.map(r => r.name) || [])
      );
    });

    // MySQL
    let mysqlTables = [];
    if (mysqlDB) {
      try {
        const [rows] = await mysqlDB.query(`SHOW TABLES`);
        mysqlTables = rows.map(r => Object.values(r)[0]);
      } catch {}
    }

    // Postgres
    let pgTables = [];
    if (pgClient) {
      try {
        const result = await pgClient.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public';
        `);
        pgTables = result.rows.map(r => r.table_name);
      } catch {}
    }

    res.json([
      { type: "sqlite", name: "SQLite", tables: sqliteTables },
      { type: "mysql", name: "MySQL", tables: mysqlTables },
      { type: "postgres", name: "PostgreSQL", tables: pgTables }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//
app.get("/api/columns/:db/:table", async (req, res) => {
  const { db, table } = req.params;

  try {
    if (db === "sqlite") {
      sqliteDB.all(`PRAGMA table_info(${table})`, [], (err, rows) =>
        res.json(rows || [])
      );
      return;
    }

    if (db === "mysql") {
      if (!mysqlDB) {
        return res.json([]);
      }
      const [cols] = await mysqlDB.query(`DESCRIBE ${table}`);
      return res.json(cols);
    }

    if (db === "postgres") {
      if (!pgClient) {
        return res.json([]);
      }
      const result = await pgClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}';
      `);
      return res.json(result.rows);
    }

    res.json([]);
  } catch {
    res.json([]);
  }
});


//
app.post("/api/query", async (req, res) => {
  const { query, db } = req.body;

  if (!query) return res.json({ success: false, error: "Query required" });

  const statements = query
    .split(";")
    .map(s => s.trim())
    .filter(Boolean);

  try {
    let lastResult = null;

    // SQLite
    if (db === "sqlite") {
      for (const stmt of statements) {
        const type = stmt.toLowerCase().startsWith("select") ? "select" : "modify";

        if (type === "select") {
          lastResult = await new Promise((resolve, reject) => {
            sqliteDB.all(stmt, [], (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            });
          });
        } else {
          lastResult = await new Promise((resolve, reject) => {
            sqliteDB.run(stmt, function (err) {
              if (err) return reject(err);
              resolve({ lastID: this.lastID, changes: this.changes });
            });
          });
        }
      }
      return res.json({ success: true, result: lastResult });
    }

    // MySQL
    if (db === "mysql") {
      if (!mysqlDB) {
        return res.status(500).json({ success: false, error: "MySQL not connected" });
      }
      for (const stmt of statements) {
        const [rows] = await mysqlDB.query(stmt);
        lastResult = rows;
      }
      return res.json({ success: true, result: lastResult });
    }

    // PostgreSQL
    if (db === "postgres") {
      if (!pgClient) {
        return res.status(500).json({ success: false, error: "PostgreSQL not connected" });
      }
      for (const stmt of statements) {
        const result = await pgClient.query(stmt);
        lastResult = result.rows;
      }
      return res.json({ success: true, result: lastResult });
    }

    return res.json({ success: false, error: "Invalid database" });
  } catch (err) {
    console.log("SQL Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



//
app.listen(process.env.PORT || 5003, () =>
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT || 5003}`)
);
