-- Turso Schema for QualityFlow

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users (Authentication)
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_login TEXT,
    created_date TEXT,
    updated_date TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Users / Team Members
CREATE TABLE IF NOT EXISTS TeamMember (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer',
    avatar_color TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Clients
CREATE TABLE IF NOT EXISTS Client (
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    id TEXT PRIMARY KEY,
    created_date DATETIME,
    updated_date DATETIME,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Project Configuration Tables
CREATE TABLE IF NOT EXISTS ProjectType (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS FeeType (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT 1,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS SiteType (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Technology (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    color TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Projects
CREATE TABLE IF NOT EXISTS Project (
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    fee_type TEXT,
    is_monthly_fee BOOLEAN DEFAULT 0,
    monthly_fee_scope TEXT,
    product_owner_email TEXT,
    client_id TEXT,
    site_type TEXT,
    technology TEXT,
    applicable_areas TEXT,
    area_responsibles TEXT,
    project_value REAL,
    impact_level TEXT,
    status TEXT,
    current_workflow_phase TEXT,
    risk_level TEXT,
    start_date DATETIME,
    target_date DATETIME,
    team_members TEXT,
    leader_email TEXT,
    completion_percentage INTEGER,
    critical_pending INTEGER,
    has_conflicts BOOLEAN DEFAULT 0,
    custom_phase_names TEXT,
    phase_order TEXT,
    hidden_phases TEXT,
    phase_responsibles TEXT,
    phase_durations TEXT,
    id TEXT PRIMARY KEY,
    created_date DATETIME,
    updated_date DATETIME,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Tasks
CREATE TABLE IF NOT EXISTS Task (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES Project(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TEXT,
    assigned_to TEXT,
    assigned_by TEXT,
    notification_email TEXT,
    requester_name TEXT,
    requester_email TEXT,
    is_from_public_form BOOLEAN DEFAULT 0,
    tags TEXT,
    custom_fields TEXT,
    "order" INTEGER DEFAULT 0,
    completed_by TEXT,
    completed_at TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Task Comments
CREATE TABLE IF NOT EXISTS TaskComment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES Task(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES Project(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task Configuration (per project)
CREATE TABLE IF NOT EXISTS TaskConfiguration (
    id TEXT PRIMARY KEY,
    project_id TEXT, -- No strict FK
    module_enabled BOOLEAN DEFAULT 1,
    custom_statuses TEXT, -- JSON array
    custom_priorities TEXT, -- JSON array
    custom_fields TEXT, -- JSON array
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Task Notifications
CREATE TABLE IF NOT EXISTS TaskNotification (
    id TEXT PRIMARY KEY,
    task_id TEXT, -- No strict FK
    project_id TEXT, -- No strict FK
    recipient_email TEXT,
    event_type TEXT, -- task_completed, assigned, etc.
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    metadata TEXT, -- JSON
    created_date TEXT, -- CSV Header
    updated_date TEXT, -- CSV Header
    created_by_id TEXT, -- CSV Header
    is_sample BOOLEAN DEFAULT 0 -- CSV Header
);

-- Task Notification Rules
CREATE TABLE IF NOT EXISTS TaskNotificationRule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES Project(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- status_changed, assigned, due_date_approaching, etc.
    conditions TEXT, -- JSON object with conditions
    recipient_emails TEXT, -- JSON array
    notification_template TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task Activity Log
CREATE TABLE IF NOT EXISTS TaskActivityLog (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    project_id TEXT,
    action_type TEXT,
    action_by TEXT,
    action_by_name TEXT,
    previous_value TEXT,
    new_value TEXT,
    notification_details TEXT,
    metadata TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Task Form Public URLs
CREATE TABLE IF NOT EXISTS TaskFormPublicUrl (
    id TEXT PRIMARY KEY,
    project_id TEXT, -- No strict FK
    form_token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT 1,
    form_title TEXT,
    form_description TEXT,
    default_status TEXT,
    visible_fields TEXT, -- JSON array
    require_authentication BOOLEAN DEFAULT 0,
    max_submissions_per_day TEXT,
    success_message TEXT,
    redirect_url TEXT,
    notification_emails TEXT, -- JSON array
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Project Documents (Briefs, etc.)
CREATE TABLE IF NOT EXISTS ProjectDocument (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL, -- brief, specs, design, etc.
    file_url TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Items
CREATE TABLE IF NOT EXISTS ChecklistItem (
    project_id TEXT,
    phase TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    weight TEXT,
    status TEXT,
    completed_by TEXT,
    completed_at DATETIME,
    completed_by_role TEXT,
    applicable_technologies TEXT,
    applicable_site_types TEXT,
    notes TEXT,
    "order" INTEGER,
    id TEXT PRIMARY KEY,
    created_date DATETIME,
    updated_date DATETIME,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Conflicts
CREATE TABLE IF NOT EXISTS Conflict (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    checklist_item_id INTEGER REFERENCES ChecklistItem(id),
    description TEXT,
    status TEXT DEFAULT 'open', -- open, resolved
    resolution TEXT,
    resolved_by TEXT, -- email
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Phases (Tracking phase status/approvals)
CREATE TABLE IF NOT EXISTS WorkflowPhase (
    id TEXT PRIMARY KEY,
    project_id TEXT, -- No strict FK
    phase_key TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at TEXT,
    completed_at TEXT,
    completed_by TEXT,
    approved_by TEXT,
    approval_notes TEXT,
    blocked_reason TEXT,
    entry_criteria_completed BOOLEAN DEFAULT 0,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Entry Criteria
CREATE TABLE IF NOT EXISTS EntryCriteria (
    id TEXT PRIMARY KEY,
    project_id TEXT, -- No strict FK
    phase_key TEXT NOT NULL,
    title TEXT,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT 1,
    area TEXT,
    is_completed BOOLEAN DEFAULT 0,
    completed_by TEXT,
    completed_at TEXT,
    document_url TEXT,
    notes TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Preview Comments
CREATE TABLE IF NOT EXISTS PreviewComment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    screenshot_url TEXT,
    position_x REAL,
    position_y REAL,
    iframe_url TEXT,
    author_email TEXT,
    author_name TEXT,
    status TEXT DEFAULT 'open', -- open, resolved
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Schedule Tasks (Gantt/Timeline)
CREATE TABLE IF NOT EXISTS ScheduleTask (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area TEXT NOT NULL, -- creativity, software, seo, marketing, etc.
    start_date DATE NOT NULL,
    end_date DATE,
    duration INTEGER, -- days
    assigned_to TEXT, -- JSON array or single email
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project Access (Legacy/Extra table)
CREATE TABLE IF NOT EXISTS ProjectAccess (
    id TEXT PRIMARY KEY,
    project_id TEXT, -- No strict FK
    qa_hosting_url TEXT,
    qa_hosting_user TEXT,
    qa_hosting_password TEXT,
    prod_hosting_url TEXT,
    prod_hosting_user TEXT,
    prod_hosting_password TEXT,
    cms_qa_url TEXT,
    cms_qa_user TEXT,
    cms_qa_password TEXT,
    cms_prod_url TEXT,
    cms_prod_user TEXT,
    cms_prod_password TEXT,
    apis TEXT, -- JSON array
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Project Access Items
CREATE TABLE IF NOT EXISTS ProjectAccessItem (
    id TEXT PRIMARY KEY,
    project_id TEXT, -- No strict FK
    title TEXT,
    email TEXT,
    url TEXT,
    username TEXT,
    password TEXT,
    notes TEXT,
    "order" INTEGER DEFAULT 0,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample BOOLEAN DEFAULT 0
);

-- Project Access Tokens (for sharing)
CREATE TABLE IF NOT EXISTS ProjectAccessToken (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    access_item_id INTEGER REFERENCES ProjectAccessItem(id) ON DELETE CASCADE,
    access_item_ids TEXT, -- JSON array for multiple items
    token TEXT NOT NULL UNIQUE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT 0,
    access_count INTEGER DEFAULT 0,
    last_accessed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project Access Log
CREATE TABLE IF NOT EXISTS ProjectAccessLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES Project(id) ON DELETE CASCADE,
    access_item_id INTEGER REFERENCES ProjectAccessItem(id) ON DELETE CASCADE,
    token_id INTEGER REFERENCES ProjectAccessToken(id) ON DELETE CASCADE,
    accessed_by_email TEXT,
    accessed_by_name TEXT,
    ip_address TEXT,
    user_agent TEXT,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions
CREATE TABLE IF NOT EXISTS RolePermission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL UNIQUE,
    
    -- Permission Flags
    can_access_dashboard BOOLEAN DEFAULT 0,
    can_access_projects BOOLEAN DEFAULT 0,
    can_create_projects BOOLEAN DEFAULT 0,
    can_edit_projects BOOLEAN DEFAULT 0,
    can_delete_projects BOOLEAN DEFAULT 0,
    can_access_resources BOOLEAN DEFAULT 0,
    can_access_schedules BOOLEAN DEFAULT 0,
    can_access_team BOOLEAN DEFAULT 0,
    can_access_reports BOOLEAN DEFAULT 0,
    can_view_reports BOOLEAN DEFAULT 0,
    can_access_admin BOOLEAN DEFAULT 0,
    can_approve_phases BOOLEAN DEFAULT 0,
    can_resolve_conflicts BOOLEAN DEFAULT 0,
    can_access_global_access BOOLEAN DEFAULT 0,
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
