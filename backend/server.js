require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // Ensure DB connection/init

const authRoutes = require("./routes/authRoutes");
const dbRoutes = require("./routes/dbRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 Starting Clean SQL Runner Backend...");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", dbRoutes); // /api/databases, /api/query, etc.
app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
