-- Turso Schema for QualityFlow

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users / Team Members
CREATE TABLE IF NOT EXISTS TeamMember (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer', -- developer, qa, web_leader, product_owner, admin
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    "order" INTEGER DEFAULT 0,
    assigned_to TEXT, -- JSON array of emails
    due_date DATE,
    
    -- Tracking
    completed_by TEXT,
    completed_at DATETIME,
    assigned_by TEXT,
    created_by TEXT,
    
    -- Public form metadata
    is_from_public_form BOOLEAN DEFAULT 0,
    requester_email TEXT,
    requester_name TEXT,
    notification_email TEXT,
    
    -- JSON for custom fields per project config
    custom_fields TEXT, 
    
    is_sample BOOLEAN DEFAULT 0, -- Added
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    module_enabled BOOLEAN DEFAULT 1,
    custom_statuses TEXT, -- JSON array
    custom_priorities TEXT, -- JSON array
    custom_fields TEXT, -- JSON array
    is_sample BOOLEAN DEFAULT 0, -- Added
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task Notifications
CREATE TABLE IF NOT EXISTS TaskNotification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES Task(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES Project(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    event_type TEXT NOT NULL, -- task_completed, assigned, etc.
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    metadata TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES Task(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES Project(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- created, updated, status_changed, completed, etc.
    action_by TEXT NOT NULL,
    action_by_name TEXT,
    previous_value TEXT, -- JSON
    new_value TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task Form Public URLs
CREATE TABLE IF NOT EXISTS TaskFormPublicUrl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    form_token TEXT NOT NULL UNIQUE,
    form_title TEXT NOT NULL,
    form_description TEXT,
    default_status TEXT,
    visible_fields TEXT, -- JSON array
    notification_emails TEXT, -- JSON array
    require_authentication BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    max_submissions_per_day INTEGER,
    success_message TEXT,
    redirect_url TEXT, -- Added
    is_sample BOOLEAN DEFAULT 0, -- Added
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    phase_key TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    
    started_at DATETIME,
    completed_at DATETIME,
    
    approved_by TEXT,
    approval_notes TEXT,
    completed_by TEXT,
    
    blocked_reason TEXT, -- Added
    entry_criteria_completed BOOLEAN DEFAULT 0,
    is_sample BOOLEAN DEFAULT 0, -- Added
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entry Criteria
CREATE TABLE IF NOT EXISTS EntryCriteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    phase_key TEXT NOT NULL,
    title TEXT, -- Added
    criteria_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT 1,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    completed_by TEXT,
    is_sample BOOLEAN DEFAULT 0, -- Added
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- Project Access Items
CREATE TABLE IF NOT EXISTS ProjectAccessItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES Project(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    access_type TEXT NOT NULL, -- url, credentials, file, etc.
    url TEXT,
    username TEXT,
    password TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
