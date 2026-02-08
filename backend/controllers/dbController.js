const db = require("../config/db");

exports.getDatabases = async (req, res) => {
  try {
    let mysqlTables = [];
    try {
      const [rows] = await db.query(`SHOW TABLES`);
      mysqlTables = rows.map((r) => Object.values(r)[0]);
    } catch {}

    res.json([
      { type: "mysql", name: "MySQL", tables: mysqlTables },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getColumns = async (req, res) => {
  const { db: dbType, table } = req.params;

  try {
    if (dbType === "mysql") {
      const [cols] = await db.query(`DESCRIBE ${table}`);
      return res.json(cols);
    }
    res.json([]);
  } catch {
    res.json([]);
  }
};

exports.executeQuery = async (req, res) => {
  const { query, db: dbType } = req.body;

  if (!query) return res.json({ success: false, error: "Query required" });

  const statements = query
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    let lastResult = null;

    if (dbType === "mysql" || !dbType) { 
      // Default to MySQL
      for (const stmt of statements) {
        const [rows] = await db.query(stmt);
        lastResult = rows;
      }
      
      // Auto-save successful query to history
      try {
        await db.query(
          `INSERT INTO query_history (query, db) VALUES (?, ?)`,
          [query, dbType || "mysql"]
        );
      } catch (historyErr) {
        console.error("Failed to save to history:", historyErr);
      }
      
      return res.json({ success: true, result: lastResult });
    }

    return res.json({ success: false, error: "Invalid database" });
  } catch (err) {
    console.log("SQL Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
