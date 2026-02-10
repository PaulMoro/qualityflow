import { query, queryOne, transaction, buildWhereClause, parseOrderBy } from './tursoClient';

/**
 * Generic entity helper factory
 * Creates CRUD operations for any table
 */
function createEntityHelper(tableName) {
  return {
    /**
     * List records with optional filtering and ordering
     * @param {string|object} orderByOrFilters - Order string (e.g., '-created_date') or filters object
     * @param {object} filters - Optional filters if first param is orderBy string
     */
    async list(orderByOrFilters, filters = {}) {
      let orderBy = '';
      let actualFilters = {};

      // Handle both signatures: list(orderBy) and list(filters)
      if (typeof orderByOrFilters === 'string') {
        orderBy = orderByOrFilters;
        actualFilters = filters;
      } else if (typeof orderByOrFilters === 'object') {
        actualFilters = orderByOrFilters;
        orderBy = actualFilters.orderBy || '';
        delete actualFilters.orderBy;
      }

      const { clause, params } = buildWhereClause(actualFilters);
      const orderClause = parseOrderBy(orderBy);

      const sql = `SELECT * FROM ${tableName} ${clause} ${orderClause}`.trim();
      return await query(sql, params);
    },

    /**
     * Get a single record by ID
     */
    async get(id) {
      const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
      return await queryOne(sql, [id]);
    },

    /**
     * Create a new record
     */
    async create(data) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');

      const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      return await queryOne(sql, values);
    },

    /**
     * Update a record by ID
     */
    async update(id, data) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(key => `${key} = ?`).join(', ');

      const sql = `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
      return await queryOne(sql, [...values, id]);
    },

    /**
     * Delete a record by ID
     */
    async delete(id) {
      const sql = `DELETE FROM ${tableName} WHERE id = ?`;
      await query(sql, [id]);
      return { success: true };
    },

    /**
     * Find records matching filters (Base44 compatibility)
     */
    async filter(filters) {
      return await this.list(filters);
    },

    /**
     * Create multiple records at once
     */
    async bulkCreate(records) {
      if (!records || records.length === 0) return [];

      const queries = records.map(data => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        return {
          sql: `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          args: values
        };
      });

      const batchResults = await transaction(queries);
      return batchResults.map(r => r.rows[0]);
    },

    /**
     * Find records matching filters
     */
    async find(filters) {
      return await this.list(filters);
    },

    /**
     * Find one record matching filters
     */
    async findOne(filters) {
      const { clause, params } = buildWhereClause(filters);
      const sql = `SELECT * FROM ${tableName} ${clause} LIMIT 1`;
      return await queryOne(sql, params);
    },

    /**
     * Count records matching filters
     */
    async count(filters = {}) {
      const { clause, params } = buildWhereClause(filters);
      const sql = `SELECT COUNT(*) as count FROM ${tableName} ${clause}`;
      const result = await queryOne(sql, params);
      return result?.count || 0;
    }
  };
}

// Export entity helpers for all tables
export const db = {
  // Authentication
  User: createEntityHelper('User'),

  // Core entities
  Project: createEntityHelper('Project'),
  Task: createEntityHelper('Task'),
  TeamMember: createEntityHelper('TeamMember'),
  Client: createEntityHelper('Client'),

  // Configuration
  Technology: createEntityHelper('Technology'),
  ProjectType: createEntityHelper('ProjectType'),
  FeeType: createEntityHelper('FeeType'),
  SiteType: createEntityHelper('SiteType'),

  // Checklists & Workflow
  ChecklistItem: createEntityHelper('ChecklistItem'),
  Conflict: createEntityHelper('Conflict'),
  WorkflowPhase: createEntityHelper('WorkflowPhase'),
  EntryCriteria: createEntityHelper('EntryCriteria'),

  // Tasks extended
  TaskConfiguration: createEntityHelper('TaskConfiguration'),
  TaskNotification: createEntityHelper('TaskNotification'),
  TaskComment: createEntityHelper('TaskComment'),
  TaskNotificationRule: createEntityHelper('TaskNotificationRule'),
  TaskFormPublicUrl: createEntityHelper('TaskFormPublicUrl'),
  TaskActivityLog: createEntityHelper('TaskActivityLog'),

  // Project data
  ProjectDocument: createEntityHelper('ProjectDocument'),
  PreviewComment: createEntityHelper('PreviewComment'),
  ScheduleTask: createEntityHelper('ScheduleTask'),

  // Access management
  ProjectAccess: createEntityHelper('ProjectAccess'),
  ProjectAccessItem: createEntityHelper('ProjectAccessItem'),
  ProjectAccessToken: createEntityHelper('ProjectAccessToken'),
  ProjectAccessLog: createEntityHelper('ProjectAccessLog'),

  // Permissions
  RolePermission: createEntityHelper('RolePermission'),
};

// Also export as 'entities' for compatibility
export const entities = db;
