import { createClient } from '@libsql/client';

const TURSO_URL = import.meta.env.VITE_TURSO_DATABASE_URL;
const TURSO_TOKEN = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing Turso credentials. Please set VITE_TURSO_DATABASE_URL and VITE_TURSO_AUTH_TOKEN in .env');
}


export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

/**
 * Execute a SQL query and return results
 */
export async function query(sql, params = []) {
  try {
    const result = await turso.execute({ sql, args: params });
    return result.rows;
  } catch (error) {
    console.error('Turso query error:', error);
    throw error;
  }
}

/**
 * Execute a SQL query and return a single row
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction(queries) {
  try {
    const batch = queries.map(({ sql, args = [] }) => ({
      sql,
      args
    }));
    const results = await turso.batch(batch);
    return results;
  } catch (error) {
    console.error('Turso transaction error:', error);
    throw error;
  }
}

/**
 * Helper to build WHERE clause from filters
 */
export function buildWhereClause(filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return { clause: '', params: [] };
  }

  const conditions = [];
  const params = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  });

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

/**
 * Helper to parse order by string (e.g., '-created_date' -> 'created_date DESC')
 */
export function parseOrderBy(orderBy) {
  if (!orderBy) return '';

  const isDesc = orderBy.startsWith('-');
  const field = isDesc ? orderBy.slice(1) : orderBy;
  const direction = isDesc ? 'DESC' : 'ASC';

  return `ORDER BY ${field} ${direction}`;
}
