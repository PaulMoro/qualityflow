// Turso database client - replaces Base44 SDK
// This maintains a similar API to Base44 for minimal code changes
// but uses Turso (libSQL) underneath for optimal performance

import { db, entities } from './db';
import { turso as client, turso, query, queryOne, transaction } from './tursoClient';

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
  // Real auth Implementation
  auth: {
    me: async () => {
      const token = localStorage.getItem('qualityflow_token');
      if (!token) return null;
      try {
        // Direct DB check for session
        const rs = await client.execute({
          sql: "SELECT * FROM UserSession WHERE token = ?",
          args: [token]
        });
        const session = rs.rows[0];

        if (!session || new Date(session.expires_at) < new Date()) {
          localStorage.removeItem('qualityflow_token');
          return null;
        }

        const userRs = await client.execute({
          sql: "SELECT id, email, display_name, role FROM User WHERE id = ?",
          args: [session.user_id]
        });
        const user = userRs.rows[0];

        return user ? { ...user, full_name: user.display_name } : null;
      } catch (e) {
        console.error("Auth check failed:", e);
        return null;
      }
    },
    isAuthenticated: async () => {
      const token = localStorage.getItem('qualityflow_token');
      return !!token;
    },
    login: async (email, password) => {
      try {
        console.log("Attempting client-side login for:", email);
        const rs = await client.execute({
          sql: "SELECT * FROM User WHERE email = ?",
          args: [email]
        });
        const user = rs.rows[0];

        if (!user) {
          return { success: false, error: 'Credenciales inválidas' };
        }

        // MVP: Plain text comparison (User requested no encryption packages)
        // In a real app we would use bcryptjs here, but strictly following "no packages" request
        if (password !== user.password_hash) {
          return { success: false, error: 'Credenciales inválidas' };
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await client.execute({
          sql: "INSERT INTO UserSession (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
          args: [crypto.randomUUID(), user.id, token, expiresAt]
        });

        await client.execute({
          sql: "UPDATE User SET last_login = ? WHERE id = ?",
          args: [new Date().toISOString(), user.id]
        });

        localStorage.setItem('qualityflow_token', token);
        return { success: true, user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role } };

      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }
    },
    register: async (email, password, display_name) => {
      try {
        const userId = `user_${Date.now()}`;

        // MVP: Store plain text password
        await client.execute({
          sql: "INSERT INTO User (id, email, password_hash, display_name, role, is_active) VALUES (?, ?, ?, ?, 'viewer', 1)",
          args: [userId, email, password, display_name || email.split('@')[0]]
        });

        return { success: true, user: { id: userId, email } };
      } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
          return { success: false, error: 'El usuario ya existe' };
        }
        return { success: false, error: error.message };
      }
    },
    logout: () => {
      localStorage.removeItem('qualityflow_token');
      window.location.href = '/login';
    },
    redirectToLogin: () => {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
  },
  appLogs: {
    logUserInApp: async () => { },
  },
  functions: {
    invoke: async (name, params) => {
      console.log(`Base44 function '${name}' invoked with params:`, params);

      // Map function names to local Deno URLs
      // In production you would point this to your actual function host
      const functionMap = {
        'auth_login': 'http://localhost:8000/auth_login.ts',
        'auth_register': 'http://localhost:8000/auth_register.ts',
        'auth_me': 'http://localhost:8000/auth_me.ts',
        // Add others as needed
      };

      const url = functionMap[name];
      if (!url) {
        console.error(`Function ${name} not found in map`);
        return { data: { error: `Function ${name} not found` } };
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            return { data: { error: errorJson.error || response.statusText } };
          } catch (e) {
            return { data: { error: errorText || response.statusText } };
          }
        }

        const data = await response.json();
        return { data };
      } catch (error) {
        console.error(`Error invoking function ${name}:`, error);
        return { data: { error: error.message } };
      }
    }
  },
  // Mock integrations for compatibility
  integrations: {
    Core: {
      SendEmail: async (params) => {
        console.warn('Real email sending not implemented in client, mocking success', params);
        return { data: { success: true } };
      },
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
