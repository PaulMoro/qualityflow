# Migration Guide: Base44 to Turso (SQLite)

This guide helps you migrate your application data from Base44's managed backend to your own **Turso** database, which is ideal for deployment on **Replit**.

## Prerequisites

1.  **Turso Account**: [Sign up](https://turso.tech/signup) if you haven't.
2.  **Turso CLI**: Install the command-line tool.
    ```bash
    # Install on Linux/macOS
    curl -sSfL https://get.tur.so/install.sh | bash
    
    # Login
    turso auth login
    ```

## Step 1: Export Data from Base44

1.  Log in to your **Base44 Dashboard**.
2.  Navigate to your Project > **Database** or **CMS**.
3.  For each collection, click **Export** and download as **CSV**.
4.  Create a folder named `data_backup` in the root of this project.
5.  **Important:** Base44 exports files with the format `TableName_export.csv`. You should have these files:
    *   `Project_export.csv`
    *   `Task_export.csv`
    *   `TaskComment_export.csv`
    *   `TaskConfiguration_export.csv`
    *   `TaskNotification_export.csv`
    *   `TaskNotificationRule_export.csv`
    *   `TaskFormPublicUrl_export.csv`
    *   `TaskActivityLog_export.csv`
    *   `TeamMember_export.csv`
    *   `Client_export.csv`
    *   `Technology_export.csv`
    *   `ProjectType_export.csv`
    *   `FeeType_export.csv`
    *   `SiteType_export.csv`
    *   `ChecklistItem_export.csv`
    *   `Conflict_export.csv`
    *   `WorkflowPhase_export.csv`
    *   `EntryCriteria_export.csv`
    *   `PreviewComment_export.csv`
    *   `ScheduleTask_export.csv`
    *   `ProjectDocument_export.csv`
    *   `ProjectAccess_export.csv`
    *   `ProjectAccessItem_export.csv`
    *   `ProjectAccessToken_export.csv`
    *   `ProjectAccessLog_export.csv`
    *   `RolePermission_export.csv`

> **Nota:** Algunos archivos pueden estar vacíos (0 bytes) si no tienes datos en esas tablas. El script los omitirá automáticamente.

## Step 2: Setup Turso Database

1.  Create a new database:
    ```bash
    turso db create qualityflow-db
    ```
2.  Get the connection URL:
    ```bash
    turso db show qualityflow-db
    # Copy the URL that starts with libsql://...
    ```
3.  Create an authentication token:
    ```bash
    turso db tokens create qualityflow-db
    # Copy this token
    ```

## Step 3: Apply Schema

1.  Run the schema against your database using the Turso CLI:
    ```bash
    turso db shell qualityflow-db < schema.sql
    ```

## Step 4: Import Data

We have created a script `scripts/import-data.js` to automate this.

1.  Install necessary dependencies:
    ```bash
    npm install @libsql/client csv-parse dotenv
    ```

2.  Create a `.env` file in the project root (if you haven't already) and add your Turso credentials:
    ```env
    TURSO_DATABASE_URL="libsql://qualityflow-db-your-user.turso.io"
    TURSO_AUTH_TOKEN="your-auth-token"
    ```

3.  Run the import script:
    ```bash
    node scripts/import-data.js
    ```

    The script will read the CSV files from `data_backup` and insert them into your Turso database.

## Step 5: Connect from Replit

When you move your code to Replit:

1.  Ensure `@libsql/client` is in `package.json`.
2.  Set up your environment variables in Replit Secrets (Tools > Secrets):
    *   `TURSO_DATABASE_URL`
    *   `TURSO_AUTH_TOKEN`
3.  Update your database connection code (next phase) to use `@libsql/client`.
