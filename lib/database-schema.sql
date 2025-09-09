-- Database Schema for Project Persistence System
-- This schema enables saving and loading of AI-generated code and project data

-- Projects table (extends existing projects table)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id TEXT,
    status TEXT DEFAULT 'active', -- active, archived, deleted
    settings JSONB DEFAULT '{}', -- Project-specific settings
    metadata JSONB DEFAULT '{}' -- Additional project metadata
);

-- Project Code Files table
-- Stores all generated code files for each project
CREATE TABLE IF NOT EXISTS project_code_files (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL, -- e.g., "src/components/Button.tsx"
    file_name TEXT NOT NULL, -- e.g., "Button.tsx"
    file_content TEXT NOT NULL,
    file_type TEXT, -- e.g., "tsx", "js", "css", "json"
    file_size INTEGER, -- Size in bytes
    is_active BOOLEAN DEFAULT TRUE, -- For soft deletion
    version_id TEXT NOT NULL, -- Reference to version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(project_id, file_path, version_id)
);

-- Project Versions table
-- Tracks different versions of project changes
CREATE TABLE IF NOT EXISTS project_versions (
    id TEXT PRIMARY KEY, -- UUID or timestamp-based
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_type TEXT NOT NULL, -- 'initial', 'incremental', 'user_edit', 'ai_generation'
    change_description TEXT,
    user_prompt TEXT, -- The user's prompt that led to this change
    ai_response TEXT, -- The AI's response/thinking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT, -- User ID who made the change

    UNIQUE(project_id, version_number)
);

-- Project Conversations table
-- Stores chat history and conversation context
CREATE TABLE IF NOT EXISTS project_conversations (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL, -- Unique message identifier
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}', -- Additional message metadata
    version_id TEXT REFERENCES project_versions(id),

    UNIQUE(project_id, message_id)
);

-- Project Sandbox State table
-- Stores sandbox/preview state for each project
CREATE TABLE IF NOT EXISTS project_sandbox_state (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sandbox_id TEXT, -- E2B sandbox ID
    sandbox_url TEXT, -- Preview URL
    sandbox_status TEXT DEFAULT 'stopped', -- running, stopped, error
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    configuration JSONB DEFAULT '{}', -- Sandbox configuration

    UNIQUE(project_id)
);

-- Project Analytics table
-- Stores usage analytics and performance metrics
CREATE TABLE IF NOT EXISTS project_analytics (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'generation', 'preview', 'error', 'user_action'
    event_data JSONB DEFAULT '{}',
    user_id TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_code_files_project_id ON project_code_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_code_files_version_id ON project_code_files(version_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_conversations_project_id ON project_conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sandbox_state_project_id ON project_sandbox_state(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_code_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sandbox_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id::uuid);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id::uuid);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id::uuid);

-- RLS Policies for project_code_files
CREATE POLICY "Users can view code files from their projects" ON project_code_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_code_files.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can insert code files for their projects" ON project_code_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_code_files.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can update code files for their projects" ON project_code_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_code_files.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

-- RLS Policies for project_versions
CREATE POLICY "Users can view versions from their projects" ON project_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_versions.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can insert versions for their projects" ON project_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_versions.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

-- RLS Policies for project_conversations
CREATE POLICY "Users can view conversations from their projects" ON project_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_conversations.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can insert conversations for their projects" ON project_conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_conversations.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

-- RLS Policies for project_sandbox_state
CREATE POLICY "Users can view sandbox state from their projects" ON project_sandbox_state
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_sandbox_state.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can insert/update sandbox state for their projects" ON project_sandbox_state
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_sandbox_state.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

-- RLS Policies for project_analytics
CREATE POLICY "Users can view analytics from their projects" ON project_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_analytics.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can insert analytics for their projects" ON project_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_analytics.project_id
            AND projects.owner_id::uuid = auth.uid()
        )
    );
