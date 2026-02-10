import { createClient } from "@libsql/client";
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env");
  process.exit(1);
}

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

const DATA_DIR = path.join(__dirname, '../data_backup');

// Map CSV filenames to Table names
// Base44 exports with format: TableName_export.csv
const FILE_MAPPING = {
  'Project_export.csv': 'Project',
  'Task_export.csv': 'Task',
  'TeamMember_export.csv': 'TeamMember',
  'Client_export.csv': 'Client',
  'Technology_export.csv': 'Technology',
  'ProjectType_export.csv': 'ProjectType',
  'FeeType_export.csv': 'FeeType',
  'SiteType_export.csv': 'SiteType',
  'ChecklistItem_export.csv': 'ChecklistItem',
  'Conflict_export.csv': 'Conflict',
  'WorkflowPhase_export.csv': 'WorkflowPhase',
  'EntryCriteria_export.csv': 'EntryCriteria',
  'RolePermission_export.csv': 'RolePermission',
  'TaskConfiguration_export.csv': 'TaskConfiguration',
  'TaskNotification_export.csv': 'TaskNotification',
  'TaskComment_export.csv': 'TaskComment',
  'TaskNotificationRule_export.csv': 'TaskNotificationRule',
  'TaskFormPublicUrl_export.csv': 'TaskFormPublicUrl',
  'ScheduleTask_export.csv': 'ScheduleTask',
  'PreviewComment_export.csv': 'PreviewComment',
  'ProjectDocument_export.csv': 'ProjectDocument',
  'ProjectAccessItem_export.csv': 'ProjectAccessItem',
  'ProjectAccessToken_export.csv': 'ProjectAccessToken',
  'ProjectAccessLog_export.csv': 'ProjectAccessLog',
  'TaskActivityLog_export.csv': 'TaskActivityLog',
  'ProjectAccess_export.csv': 'ProjectAccess' // Extra table from Base44
};

/* 
  Helper to sanitize values for SQL types 
  - Converts empty strings to NULL
  - Handles booleans (true/false, 1/0)
  - Handles JSON strings
*/
const sanitizeValue = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  if (value === 'true') return 1;
  if (value === 'false') return 0;
  // Try to parse JSON if it looks like array/object, otherwise leave as string
  if ((typeof value === 'string') && (value.startsWith('[') || value.startsWith('{'))) {
    try {
      // Just validating it's JSON, but we store as text in SQLite usually
      JSON.parse(value);
      return value;
    } catch (e) {
      return value;
    }
  }
  return value;
};

// Map of CSV headers to DB columns
// If a header is not in this map, it will be used as-is
const HEADER_MAPPING = {
  // 'csv_header': 'db_column'
  // 'created_date': 'created_at', // Removed: we changed schema to match CSV
  // 'updated_date': 'updated_at', // Removed: we changed schema to match CSV
};

/**
 * Get the actual columns for a table from Turso
 */
async function getTableColumns(tableName) {
  try {
    const result = await client.execute(`PRAGMA table_info(${tableName})`);
    return result.rows.map(row => row.name);
  } catch (err) {
    console.error(`Failed to get schema for ${tableName}:`, err.message);
    return [];
  }
}

async function importFile(filename, tableName) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${filename}: File not found in ${DATA_DIR}`);
    return;
  }

  console.log(`Processing ${filename} into ${tableName}...`);

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  if (records.length === 0) {
    console.log(`No records found in ${filename}`);
    return;
  }

  // Get target columns
  const targetColumns = await getTableColumns(tableName);
  if (targetColumns.length === 0) {
    console.warn(`Could not determine columns for ${tableName}, skipping import.`);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    const filteredRecord = {};

    Object.entries(record).forEach(([key, value]) => {
      // Apply header mapping
      let targetKey = HEADER_MAPPING[key] !== undefined ? HEADER_MAPPING[key] : key;

      // If mapped to null, skip
      if (targetKey === null) return;

      // Only include if column exists in target table
      if (targetColumns.includes(targetKey)) {
        filteredRecord[targetKey] = sanitizeValue(value);
      }
    });

    if (Object.keys(filteredRecord).length === 0) continue;

    const keys = Object.keys(filteredRecord);
    const escapedKeys = keys.map(k => `"${k}"`).join(', ');
    const values = Object.values(filteredRecord);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${escapedKeys}) VALUES (${placeholders})`;

    try {
      await client.execute({ sql, args: values });
      successCount++;
    } catch (err) {
      console.error(`Failed to insert record into ${tableName}:`, err.message);
      // console.error('SQL:', sql);
      // console.error('Values:', values);
      errorCount++;
    }
  }

  console.log(`Finished ${tableName}: ${successCount} success, ${errorCount} errors.`);
}

async function main() {
  console.log("Starting import (Step-by-Step mode)...");

  // Only run Project for Task 4 verification
  await importFile('Project_export.csv', 'Project');

  console.log("Step completed.");
}

main().catch(console.error);
