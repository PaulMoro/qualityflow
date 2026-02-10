import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const MIGRATIONS = [
  { table: 'Project', column: 'leader_email', type: 'TEXT' },
  { table: 'Project', column: 'risk_level', type: "TEXT DEFAULT 'medium'" },
  { table: 'Project', column: 'start_date', type: 'DATETIME' },
  { table: 'Project', column: 'phase_responsibles', type: 'TEXT' },
  { table: 'Project', column: 'phase_durations', type: 'TEXT' },
  { table: 'Project', column: 'team_members', type: 'TEXT' },
  { table: 'Project', column: 'is_sample', type: 'BOOLEAN DEFAULT 0' },
  { table: 'Task', column: 'is_sample', type: 'BOOLEAN DEFAULT 0' },
  { table: 'WorkflowPhase', column: 'blocked_reason', type: 'TEXT' },
  { table: 'WorkflowPhase', column: 'is_sample', type: 'BOOLEAN DEFAULT 0' },
  { table: 'EntryCriteria', column: 'title', type: 'TEXT' },
  { table: 'EntryCriteria', column: 'is_sample', type: 'BOOLEAN DEFAULT 0' },
  { table: 'TaskConfiguration', column: 'is_sample', type: 'BOOLEAN DEFAULT 0' },
  { table: 'TaskFormPublicUrl', column: 'redirect_url', type: 'TEXT' },
  { table: 'TaskFormPublicUrl', column: 'is_sample', type: 'BOOLEAN DEFAULT 0' },
];

async function migrate() {
  console.log("Starting schema migration...");

  for (const m of MIGRATIONS) {
    try {
      // Check if column exists
      const info = await client.execute(`PRAGMA table_info(${m.table})`);
      const exists = info.rows.some(row => row.name === m.column);

      if (!exists) {
        console.log(`Adding column ${m.column} to ${m.table}...`);
        await client.execute(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`);
      } else {
        console.log(`Column ${m.column} already exists in ${m.table}.`);
      }
    } catch (err) {
      console.error(`Failed to migrate ${m.table}.${m.column}:`, err.message);
    }
  }

  console.log("Migration completed.");
}

migrate().catch(console.error);
