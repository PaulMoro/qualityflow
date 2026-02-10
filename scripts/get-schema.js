import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function getSchemas() {
  const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = tablesResult.rows.map(r => r.name);

  const schemas = {};
  for (const table of tables) {
    const columnsResult = await client.execute(`PRAGMA table_info(${table})`);
    schemas[table] = columnsResult.rows.map(r => r.name);
  }

  console.log(JSON.stringify(schemas, null, 2));
}

getSchemas().catch(console.error);
