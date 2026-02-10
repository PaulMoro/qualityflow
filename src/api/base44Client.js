// Turso database client - replaces Base44 SDK
// This maintains a similar API to Base44 for minimal code changes
// but uses Turso (libSQL) underneath for optimal performance

import { db, entities } from './db';
import { turso, query, queryOne, transaction } from './tursoClient';

// Export the database helpers with Base44-compatible API
export const base44 = {
  entities: {
    ...entities,
    Query: {
      and: (...args) => ({ type: 'and', args }),
      or: (...args) => ({ type: 'or', args }),
      eq: (field, value) => ({ type: 'eq', field, value }),
      neq: (field, value) => ({ type: 'neq', field, value }),
    }
  },
  // Mock auth for compatibility
  auth: {
    me: async () => ({ email: 'user@qualityflow.com', display_name: 'QualityFlow User' }),
    isAuthenticated: async () => true,
    logout: () => { window.location.href = '/'; },
    redirectToLogin: () => { console.log('Login redirect'); }
  },
  // Mock functions for compatibility
  functions: {
    invoke: async (name, params) => {
      console.warn(`Base44 function '${name}' invoked with params:`, params);
      return { data: null };
    }
  },
  // Mock integrations for compatibility
  integrations: {
    Core: {
      UploadFile: async (params) => {
        console.warn('Base44 UploadFile invoked:', params);
        return { data: null };
      }
    }
  },
  // Direct access to Turso client if needed
  client: turso,
  // Helper functions
  query,
  queryOne,
  transaction
};

// Also export db for new code that doesn't need Base44 compatibility
export { db };
