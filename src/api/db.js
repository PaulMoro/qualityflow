import { query, queryOne, transaction, buildWhereClause, parseOrderBy } from './tursoClient';

/**
 * Generic entity helper factory
 * Creates CRUD operations for any table
 */
/**
 * Generic entity helper factory
 * Creates CRUD operations for any table
 * @param {string} tableName
 * @param {string[]} jsonFields - Array of field names that should be treated as JSON
 */
function createEntityHelper(tableName, jsonFields = []) {
  /**
   * Helper to parse JSON fields in a record
   */
  const parseRecord = (record) => {
    if (!record) return record;
    const parsed = { ...record };
    jsonFields.forEach(field => {
      if (parsed[field] && typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (e) {
          console.warn(`Failed to parse JSON field ${field} in ${tableName}:`, e);
        }
      }
    });
    return parsed;
  };

  /**
   * Helper to stringify JSON fields in data
   */
  const stringifyData = (data) => {
    const stringified = { ...data };
    jsonFields.forEach(field => {
      if (stringified[field] && typeof stringified[field] === 'object') {
        stringified[field] = JSON.stringify(stringified[field]);
      }
    });
    return stringified;
  };

  return {
    /**
     * List records with optional filtering and ordering
     * @param {string|object} orderByOrFilters - Order string (e.g., '-created_date') or filters object
     * @param {object} filters - Optional filters if first param is orderBy string
     */
    async list(orderByOrFilters, filters = {}) {
      let orderBy = '';
      let actualFilters = {};

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
      const result = await query(sql, params);
      return result.map(parseRecord);
    },

    /**
     * Get a single record by ID
     */
    async get(id) {
      const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
      const result = await queryOne(sql, [id]);
      return parseRecord(result);
    },

    /**
     * Create a new record
     */
    async create(data) {
      const processedData = stringifyData(data);
      const keys = Object.keys(processedData);
      const values = Object.values(processedData);
      const placeholders = keys.map(() => '?').join(', ');

      const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await queryOne(sql, values);
      return parseRecord(result);
    },

    /**
     * Update a record by ID
     */
    async update(id, data) {
      const processedData = stringifyData(data);
      const keys = Object.keys(processedData);
      const values = Object.values(processedData);
      const setClause = keys.map(key => `${key} = ?`).join(', ');

      const sql = `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
      const result = await queryOne(sql, [...values, id]);
      return parseRecord(result);
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
        const processedData = stringifyData(data);
        const keys = Object.keys(processedData);
        const values = Object.values(processedData);
        const placeholders = keys.map(() => '?').join(', ');
        return {
          sql: `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          args: values
        };
      });

      const batchResults = await transaction(queries);
      return batchResults.map(r => parseRecord(r.rows[0]));
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
      const result = await queryOne(sql, params);
      return parseRecord(result);
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
  // Core entities
  Project: createEntityHelper('Project', [
    'applicable_areas', 'area_responsibles', 'team_members',
    'phase_responsibles', 'phase_durations', 'custom_phase_names',
    'phase_order', 'hidden_phases'
  ]),
  Task: createEntityHelper('Task', ['tags', 'custom_fields', 'assigned_to']),
  TeamMember: createEntityHelper('TeamMember'),
  Client: createEntityHelper('Client'),

  // Configuration
  Technology: createEntityHelper('Technology'),
  ProjectType: createEntityHelper('ProjectType'),
  FeeType: createEntityHelper('FeeType'),
  SiteType: createEntityHelper('SiteType'),

  // Checklists & Workflow
  ChecklistItem: createEntityHelper('ChecklistItem', ['applicable_technologies', 'applicable_site_types']),
  Conflict: createEntityHelper('Conflict'),
  WorkflowPhase: createEntityHelper('WorkflowPhase'),
  EntryCriteria: createEntityHelper('EntryCriteria'),

  // Tasks extended
  TaskConfiguration: createEntityHelper('TaskConfiguration', ['custom_statuses', 'custom_priorities', 'custom_fields']),
  TaskNotification: createEntityHelper('TaskNotification', ['metadata']),
  TaskComment: createEntityHelper('TaskComment'),
  TaskNotificationRule: createEntityHelper('TaskNotificationRule', ['conditions', 'recipient_emails']),
  TaskFormPublicUrl: createEntityHelper('TaskFormPublicUrl', ['visible_fields', 'notification_emails']),
  TaskActivityLog: createEntityHelper('TaskActivityLog', ['notification_details', 'metadata']),

  // Project data
  ProjectDocument: createEntityHelper('ProjectDocument'),
  PreviewComment: createEntityHelper('PreviewComment'),
  ScheduleTask: createEntityHelper('ScheduleTask', ['assigned_to']),

  // Access management
  ProjectAccess: createEntityHelper('ProjectAccess', ['apis']),
  ProjectAccessItem: createEntityHelper('ProjectAccessItem'),
  ProjectAccessToken: createEntityHelper('ProjectAccessToken', ['access_item_ids']),
  ProjectAccessLog: createEntityHelper('ProjectAccessLog'),

  // Permissions
  RolePermission: createEntityHelper('RolePermission'),
};

// Also export as 'entities' for compatibility
export const entities = db;
