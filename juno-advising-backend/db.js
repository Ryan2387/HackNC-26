require("dotenv").config();

const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000,
});

db.on("error", (err) => {
  console.error("Database pool error:", err);
});

module.exports = db;

