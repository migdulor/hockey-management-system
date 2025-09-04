-- Migration: 001_create_formations_schema.sql
-- Created at: 2025-09-03 12:00:00
-- Description: Creates the initial schema for the formations module.

-- Table to store formation definitions
CREATE TABLE IF NOT EXISTS formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store player positions within a formation
CREATE TABLE IF NOT EXISTS formation_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    position_x INTEGER NOT NULL, -- X coordinate on the visual representation of the field
    position_y INTEGER NOT NULL, -- Y coordinate on the visual representation of the field
    is_starter BOOLEAN NOT NULL DEFAULT TRUE, -- To distinguish starters from substitutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a player can only be in a formation once
    UNIQUE(formation_id, player_id)
);

-- Add comments to tables and columns for better understanding
COMMENT ON TABLE formations IS 'Stores saved team formations, including a name and description.';
COMMENT ON COLUMN formations.team_id IS 'The team this formation belongs to.';
COMMENT ON COLUMN formations.created_by IS 'The user who created this formation.';

COMMENT ON TABLE formation_players IS 'Stores the position of each player in a specific formation.';
COMMENT ON COLUMN formation_players.position_x IS 'The X coordinate for the player''s position on the field diagram.';
COMMENT ON COLUMN formation_players.position_y IS 'The Y coordinate for the player''s position on the field diagram.';
COMMENT ON COLUMN formation_players.is_starter IS 'Indicates if the player is a starter (on the field) or a substitute.';

-- Create a trigger to automatically update the updated_at timestamp on formations table
CREATE OR REPLACE FUNCTION update_formation_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_formations_updated_at
BEFORE UPDATE ON formations
FOR EACH ROW
EXECUTE FUNCTION update_formation_updated_at_column();

-- You can add indexes for performance improvements on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_formations_team_id ON formations(team_id);
CREATE INDEX IF NOT EXISTS idx_formation_players_formation_id ON formation_players(formation_id);
