-- V8__whiteboard_tables.sql
-- Whiteboard feature tables for Miro-like collaborative canvas

-- Whiteboards table (extends canvas concept)
CREATE TABLE whiteboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    application_id VARCHAR(255),
    created_by VARCHAR(255),
    viewport TEXT,  -- JSON: {"zoom": 1, "panX": 0, "panY": 0}
    version BIGINT DEFAULT 0,
    canvas_type VARCHAR(20) DEFAULT 'WHITEBOARD',
    background_color VARCHAR(20) DEFAULT '#ffffff',
    grid_enabled BOOLEAN DEFAULT true,
    grid_size INTEGER DEFAULT 20,
    snap_to_grid BOOLEAN DEFAULT true,
    allow_anonymous_editing BOOLEAN DEFAULT false,
    max_collaborators INTEGER DEFAULT 50,
    template_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whiteboard elements table
CREATE TABLE whiteboard_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    element_type VARCHAR(50) NOT NULL,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    z_index INTEGER DEFAULT 0,
    rotation FLOAT DEFAULT 0,
    opacity FLOAT DEFAULT 1,
    configuration TEXT,  -- JSON: element-specific config
    background_color VARCHAR(20),
    border_color VARCHAR(20),
    border_width INTEGER DEFAULT 0,
    border_radius INTEGER DEFAULT 0,
    text_content TEXT,
    font_size INTEGER DEFAULT 14,
    font_family VARCHAR(100) DEFAULT 'Inter',
    font_weight VARCHAR(20) DEFAULT 'normal',
    font_style VARCHAR(20) DEFAULT 'normal',
    text_color VARCHAR(20) DEFAULT '#000000',
    text_align VARCHAR(20) DEFAULT 'left',
    image_url TEXT,
    image_alt VARCHAR(255),
    path_data TEXT,  -- SVG path for drawings
    shape_type VARCHAR(50),
    fill_color VARCHAR(20),
    created_by UUID,
    last_edited_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP  -- Soft delete for OT tombstones
);

-- Whiteboard connectors table
CREATE TABLE whiteboard_connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    source_element_id UUID NOT NULL,
    target_element_id UUID NOT NULL,
    source_port_id VARCHAR(100),
    target_port_id VARCHAR(100),
    stroke_color VARCHAR(20) DEFAULT '#000000',
    stroke_width INTEGER DEFAULT 2,
    stroke_style VARCHAR(20) DEFAULT 'solid',
    start_arrow VARCHAR(20) DEFAULT 'none',
    end_arrow VARCHAR(20) DEFAULT 'arrow',
    label VARCHAR(255),
    label_position FLOAT DEFAULT 0.5,
    line_type VARCHAR(20) DEFAULT 'straight',
    control_points TEXT,  -- JSON array of {x, y}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP  -- Soft delete for OT tombstones
);

-- Comments table
CREATE TABLE whiteboard_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    element_id UUID,  -- Optional: comment on specific element
    position_x INTEGER,
    position_y INTEGER,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    author_name VARCHAR(255),
    author_avatar VARCHAR(500),
    parent_id UUID REFERENCES whiteboard_comments(id) ON DELETE CASCADE,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMP,
    reactions TEXT,  -- JSON: [{"emoji": "👍", "userId": "...", "username": "..."}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE whiteboard_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    element_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    value VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(element_id, user_id)
);

-- Whiteboard revisions for version control
CREATE TABLE whiteboard_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL,
    snapshot TEXT NOT NULL,  -- JSON: full whiteboard state
    label VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(whiteboard_id, revision)
);

-- Indexes for performance
CREATE INDEX idx_whiteboards_application ON whiteboards(application_id);
CREATE INDEX idx_whiteboards_created_by ON whiteboards(created_by);

CREATE INDEX idx_whiteboard_elements_whiteboard ON whiteboard_elements(whiteboard_id);
CREATE INDEX idx_whiteboard_elements_type ON whiteboard_elements(element_type);
CREATE INDEX idx_whiteboard_elements_deleted ON whiteboard_elements(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_whiteboard_connectors_whiteboard ON whiteboard_connectors(whiteboard_id);
CREATE INDEX idx_whiteboard_connectors_source ON whiteboard_connectors(source_element_id);
CREATE INDEX idx_whiteboard_connectors_target ON whiteboard_connectors(target_element_id);

CREATE INDEX idx_whiteboard_comments_whiteboard ON whiteboard_comments(whiteboard_id);
CREATE INDEX idx_whiteboard_comments_element ON whiteboard_comments(element_id);
CREATE INDEX idx_whiteboard_comments_parent ON whiteboard_comments(parent_id);
CREATE INDEX idx_whiteboard_comments_resolved ON whiteboard_comments(resolved) WHERE resolved = false;

CREATE INDEX idx_whiteboard_votes_element ON whiteboard_votes(element_id);
CREATE INDEX idx_whiteboard_votes_whiteboard ON whiteboard_votes(whiteboard_id);

CREATE INDEX idx_whiteboard_revisions_whiteboard ON whiteboard_revisions(whiteboard_id);
CREATE INDEX idx_whiteboard_revisions_revision ON whiteboard_revisions(whiteboard_id, revision);
