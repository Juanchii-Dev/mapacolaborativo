-- scripts/create-tables.sql
-- This script is a generic placeholder for table creation.
-- Use 01-create-database-schema.sql for specific table creation.

-- Example: Create a simple 'items' table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
