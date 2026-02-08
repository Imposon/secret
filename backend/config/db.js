require("dotenv").config();
const mysql = require("mysql2/promise");

let pool;

try {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  console.log("✅ MySQL Pool created");
  
  // Init Tables
  const initTables = async () => {
    try {
      const connection = await pool.getConnection();
      console.log("✅ MySQL connected successfully");
      
      // Init Users Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Init Query History Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS query_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          query TEXT NOT NULL,
          db VARCHAR(50) DEFAULT 'mysql',
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      connection.release();
    } catch (err) {
      console.error("❌ MySQL Init Error:", err.message);
    }
  };

  initTables();
  
} catch (err) {
  console.error("❌ MySQL Pool Creation Error:", err.message);
}

module.exports = pool;
