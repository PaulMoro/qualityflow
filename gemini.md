# Gemini: Project Master Context & Architecture

## 1. Project Overview & Vision
QualityFlow is a comprehensive **Project Management & Tracking System**, designed for teams and agencies. It facilitates project organization, task management with customizable states/priorities, and workflow control via phases and entry criteria.

**Key Philosophy:**
The project was originally architected for the **Base44 Platform** and has been **migrated to a custom stack** using **Turso (LibSQL)**. Crucially, the **architecture and mindset** of the original system have been preserved. The frontend code interacts with a compatibility layer (`src/api/base44Client.js`) that mimics the Base44 SDK but routes data to the Turso database, ensuring a smooth transition while keeping the original "schema-driven" logic.

## 2. Core Features

### Project & Task Management
*   **Projects**: Creation, editing, and visualization of projects.
*   **Tasks**: Full CRUD for tasks with customizable states (e.g., TODO, IN_PROGRESS, DONE) and priorities.
*   **Checklists**: A powerful feature allowing granular tracking. Supports creation, editing, reordering, and conflict management of checklist items.
*   **Workflows**: Projects follow defined `WorkflowPhase`s with specific `EntryCriteria` (gates) that must be met to progress.

### Team & Resources
*   **Team Management**: Management of `TeamMember` entities and their roles (Admin, Developer, Leader, etc.).
*   **Resource Occupancy**: A view (`ResourceOccupancy.jsx`) that visualizes team workload, showing assigned projects/tasks to identify bottlenecks.
*   **Individual Views**: Filtered views showing specific work assignments for a logged-in user.

### Access & Security
*   **Shared Access**: Ability to share sensitive project assets (credentials, URLs) via secure, temporary links (`ProjectAccessToken`).
*   **Public Forms**: External users can submit tasks via public links, which accept parameters like `form_token`.
*   **Authentication**:
    *   **Original Design**: Managed by Base44's Auth system.
    *   **Current Implementation**: The application simulates this via `base44.auth.me()` in the compatibility layer, currently returning a mock user context to facilitate development/migration.

## 3. Technical Architecture: The Migration Layer

The system uses a unique **Adapter Pattern** to bridge the original architecture with the new database.

### The "Base44 SDK" Adapter
*   **Location**: `src/api/base44Client.js`
*   **Role**: It is the application's core. It abstracts direct database calls.
*   **Mechanism**:
    *   The frontend calls methods like `base44.entities.Project.list()`.
    *   The adapter translates these calls into **SQL queries** executed against **Turso**.
    *   It preserves the "entity" concept, where data structures are defined by JSON-like schemas (mapped to SQL tables in `schema.sql`).

### Database & Schema
*   **Engine**: Turso (LibSQL/SQLite).
*   **Structure**: Relational tables (`Project`, `Task`, `ChecklistItem`, `User`, etc.) that mirror the original Schema-Driven design.
*   **Automatic Fields**: All entities automatically track `id`, `created_date`, `updated_date`, and `created_by`.

## 4. Technical Deep Dive: Data Flow & Functions

The application logic is split between frontend components ("Snippets") and backend logic ("Functions") located in `functions/`.

### Function-to-Component Mapping

| Function Name | Frontend Component | Trigger | DB Interaction |
| :--- | :--- | :--- | :--- |
| **`getPublicForm`** | `src/pages/PublicTaskForm.jsx` | Page Load | Reads `TaskFormPublicUrl` to validate tokens. |
| **`submitPublicTaskForm`** | `src/pages/PublicTaskForm.jsx` | User Submit | Creates `Task`, logs activity in `TaskActivityLog`. |
| **`sendTaskNotification`** | `src/components/tasks/TaskDetailPanel.jsx` | Task Update | Reads `User`, creates `TaskNotification`. |
| **`validateAccessToken`** | `src/pages/SharedAccess.jsx` | Link Visit | Validates `ProjectAccessToken`, tracks `access_count` in logs. |
| **`sendAccessTokenEmail`** | `ShareMultipleAccessModal.jsx` | Share Action | Triggered via UI to send secure links via email. |

*(Note: `googleDrivePicker.ts` exists in the codebase but relies on a disconnected logic path. The frontend currently uses direct URL inputs for file associations.)*

## 5. Integrations

1.  **Email Notifications**:
    *   Used for task assignments and shared access tokens.
    *   Implemented via `functions/sendTaskNotification.ts` and `functions/sendAccessTokenEmail.ts`.
2.  **Google Drive**:
    *   **Concept**: Authorized connector to manage project files.
    *   **Implementation**: A "Google Drive Picker" UI exists to link files (storing URLs in `ProjectDocument`), though the deep backend integration is currently simplified to URL storage.

## 6. Project Structure

*   **`src/api/`**: Contains the Database/SDK adapter (`base44Client.js`, `tursoClient.js`, `db.js`). This is the "Brain" of the migration.
*   **`functions/`**: Deno-based serverless functions that handle business logic (notifications, secure validation).
*   **`src/components/checklist/`**: Core logic for the Checklist feature (`ChecklistItemRow.jsx`, `checklistTemplates.jsx`).
*   **`src/lib/VisualEditAgent.jsx`**: A specialized tool enabling visual interactions/editing within the app.

## 7. Recent Fixes & Improvements
For a detailed breakdown of the solutions implemented for the **Authentication System** and **Resource Occupation Tab**, please refer to:
[reparaciones_2026_02_11.md](./reparaciones_2026_02_11.md)
