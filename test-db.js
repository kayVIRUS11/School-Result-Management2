const { Client } = require("pg");

const client = new Client({
  host: "db.neocmiuqqhfjkhzysurt.supabase.co",
  port: 5432,
  user: "postgres",
  password: "Imadethisat18.?",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    await client.connect();
    console.log("PG connected successfully");
  } catch (err) {
    console.error("PG connect error:", err.message || err);
  } finally {
    await client.end();
  }
}

testConnection();
