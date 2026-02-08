const db = require("../config/db");

exports.getAllHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, query, db, created_at AS createdAt FROM query_history ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHistoryById = async (req, res) => {
  try {
    const [rows] = await db.query(
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
};

exports.saveHistory = async (req, res) => {
  const { query, db: dbType } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }
  
  try {
    const [result] = await db.query(
      `INSERT INTO query_history (query, db) VALUES (?, ?)`,
      [query, dbType || "mysql"]
    );
    
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("History save error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const [result] = await db.query(
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
};

exports.clearHistory = async (req, res) => {
  try {
    await db.query(`DELETE FROM query_history`);
    res.json({ success: true, message: "All history cleared" });
  } catch (err) {
    console.error("History clear error:", err);
    res.status(500).json({ error: err.message });
  }
};
