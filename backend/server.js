require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 Starting Clean SQL Runner Backend...");

//

// MySQL Connection & Init
let mysqlDB;
(async () => {
  try {
    mysqlDB = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
    });
    console.log("✅ MySQL connected");

    // Init Users Table (MySQL)
    await mysqlDB.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Init Query History Table (MySQL)
    await mysqlDB.query(`
      CREATE TABLE IF NOT EXISTS query_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        query TEXT NOT NULL,
        db VARCHAR(50) DEFAULT 'mysql',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  } catch (err) {
    console.log("❌ MySQL not connected:", err.message);
  }
})();

//


//


//
//
//
// AUTH
//
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-123";

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    if (!mysqlDB) return res.status(500).json({ error: "Database not connected" });
    const hash = await bcrypt.hash(password, 10);
    try {
      const [result] = await mysqlDB.query(
        `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
        [email, hash, name]
      );
      const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET);
      res.json({ token });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') 
        return res.status(400).json({ error: "User exists" });
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!mysqlDB) return res.status(500).json({ error: "Database not connected" });
  try {
    const [rows] = await mysqlDB.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    const user = rows[0];

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/databases", async (req, res) => {
  try {
    // MySQL
    let mysqlTables = [];
    if (mysqlDB) {
      try {
        const [rows] = await mysqlDB.query(`SHOW TABLES`);
        mysqlTables = rows.map((r) => Object.values(r)[0]);
      } catch {}
    }

    res.json([
      { type: "mysql", name: "MySQL", tables: mysqlTables },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
app.get("/api/columns/:db/:table", async (req, res) => {
  const { db, table } = req.params;

  try {
    if (db === "mysql") {
      if (!mysqlDB) {
        return res.json([]);
      }
      const [cols] = await mysqlDB.query(`DESCRIBE ${table}`);
      return res.json(cols);
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
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    let lastResult = null;

    // MySQL
    if (db === "mysql" || !db) { // Default to MySQL if no db specified
      if (!mysqlDB) {
        return res
          .status(400)
          .json({ success: false, error: "MySQL not connected" });
      }
      for (const stmt of statements) {
        const [rows] = await mysqlDB.query(stmt);
        lastResult = rows;
      }
      
      // Auto-save successful query to history
      try {
        await mysqlDB.query(
          `INSERT INTO query_history (query, db) VALUES (?, ?)`,
          [query, db || "mysql"]
        );
      } catch (historyErr) {
        console.error("Failed to save to history:", historyErr);
        // Don't fail the query if history save fails
      }
      
      return res.json({ success: true, result: lastResult });
    }

    return res.json({ success: false, error: "Invalid database" });
  } catch (err) {
    console.log("SQL Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// HISTORY ENDPOINTS
// Get all query history
app.get("/api/history", async (req, res) => {
  if (!mysqlDB) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  try {
    const [rows] = await mysqlDB.query(
      `SELECT id, query, db, created_at AS createdAt FROM query_history ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single query from history
app.get("/api/history/:id", async (req, res) => {
  if (!mysqlDB) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  try {
    const [rows] = await mysqlDB.query(
      `SELECT id, query, db, created_at AS createdAt FROM query_history WHERE id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Query not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Save query to history (called automatically after successful query execution)
app.post("/api/history", async (req, res) => {
  const { query, db } = req.body;
  
  if (!mysqlDB) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }
  
  try {
    const [result] = await mysqlDB.query(
      `INSERT INTO query_history (query, db) VALUES (?, ?)`,
      [query, db || "mysql"]
    );
    
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("History save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete single query from history
app.delete("/api/history/:id", async (req, res) => {
  if (!mysqlDB) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  try {
    const [result] = await mysqlDB.query(
      `DELETE FROM query_history WHERE id = ?`,
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Query not found" });
    }
    
    res.json({ success: true, message: "Query deleted" });
  } catch (err) {
    console.error("History delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Clear all history
app.delete("/api/history", async (req, res) => {
  if (!mysqlDB) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  try {
    await mysqlDB.query(`DELETE FROM query_history`);
    res.json({ success: true, message: "All history cleared" });
  } catch (err) {
    console.error("History clear error:", err);
    res.status(500).json({ error: err.message });
  }
});

//
app.listen(process.env.PORT || 5003, () =>
  console.log(
    `🚀 Backend running on http://localhost:${process.env.PORT || 5003}`,
  ),
);
