-- Create tables for Hockey Management System

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    position VARCHAR(100),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    birth_date DATE,
    emergency_contact VARCHAR(255),
    medical_info TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled',
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formations table
CREATE TABLE IF NOT EXISTS formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    formation_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendances table
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, match_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_active ON players(active);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_formations_team_match ON formations(team_id, match_id);
CREATE INDEX IF NOT EXISTS idx_attendances_player_match ON attendances(player_id, match_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_formations_updated_at BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
