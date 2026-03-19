const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("Table ready");
}
init();

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/record", async (req, res) => {
  const { data } = req.body;
  const result = await pool.query(
    "INSERT INTO records (data) VALUES ($1) RETURNING *", [data]
  );
  res.json(result.rows[0]);
});

app.get("/records", async (req, res) => {
  const result = await pool.query("SELECT * FROM records ORDER BY id");
  res.json(result.rows);
});

app.listen(3000, () => console.log("Backend running on port 3000"));
