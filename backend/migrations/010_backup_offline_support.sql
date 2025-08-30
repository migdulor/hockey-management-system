-- Migración 010: Sistema de Backup y Offline Support
-- Fecha: 2025-08-26
-- Descripción: Tablas para backup automático y soporte offline-first

-- Tabla para control de sincronización offline
CREATE TABLE sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
  data JSONB NOT NULL, -- Los datos completos del registro
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  sync_attempts INTEGER DEFAULT 0,
  last_error TEXT,
  is_synced BOOLEAN DEFAULT false
);

-- Índices para sincronización eficiente
CREATE INDEX idx_sync_status_user ON sync_status(user_id);
CREATE INDEX idx_sync_status_pending ON sync_status(is_synced, created_at);
CREATE INDEX idx_sync_status_table ON sync_status(table_name, record_id);

-- Tabla para backups automáticos locales
CREATE TABLE local_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('FULL', 'INCREMENTAL', 'EXPORT')),
  file_name VARCHAR(255) NOT NULL,
  file_size_kb INTEGER,
  backup_data JSONB, -- Para backups pequeños, se almacena el JSON completo
  file_path VARCHAR(500), -- Para backups grandes, se guarda la ruta al archivo
  tables_included TEXT[], -- Array de tablas incluidas en el backup
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Fecha de expiración del backup
  is_compressed BOOLEAN DEFAULT false,
  checksum VARCHAR(64) -- Para verificar integridad
);

-- Función para crear backup automático incremental
CREATE OR REPLACE FUNCTION create_incremental_backup(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    backup_id UUID;
    last_backup_date TIMESTAMP;
    backup_data JSONB;
BEGIN
    -- Buscar fecha del último backup
    SELECT created_at INTO last_backup_date
    FROM local_backups 
    WHERE user_id = target_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Si no hay backup previo, usar fecha muy antigua
    IF last_backup_date IS NULL THEN
        last_backup_date := '1900-01-01'::TIMESTAMP;
    END IF;
    
    -- Crear estructura JSON con datos modificados desde último backup
    backup_data := json_build_object(
        'teams', (
            SELECT json_agg(row_to_json(t.*))
            FROM teams t
            WHERE t.user_id = target_user_id 
            AND t.updated_at > last_backup_date
        ),
        'players', (
            SELECT json_agg(row_to_json(p.*))
            FROM players p
            JOIN team_players tp ON p.id = tp.player_id
            JOIN teams t ON tp.team_id = t.id
            WHERE t.user_id = target_user_id
            AND (p.updated_at > last_backup_date OR tp.joined_at > last_backup_date)
        ),
        'matches', (
            SELECT json_agg(row_to_json(m.*))
            FROM matches m
            JOIN teams t ON m.team_id = t.id
            WHERE t.user_id = target_user_id
            AND m.updated_at > last_backup_date
        )
    );
    
    -- Insertar backup
    INSERT INTO local_backups (
        user_id, backup_type, file_name, backup_data,
        tables_included, expires_at
    ) VALUES (
        target_user_id, 'INCREMENTAL', 
        'backup_incremental_' || to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS') || '.json',
        backup_data,
        ARRAY['teams', 'players', 'matches'],
        NOW() + INTERVAL '30 days'
    ) RETURNING id INTO backup_id;
    
    RETURN backup_id;
END;
$$ language 'plpgsql';

-- Tabla para configuración de backup por usuario  
CREATE TABLE backup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  auto_backup_enabled BOOLEAN DEFAULT true,
  backup_frequency_hours INTEGER DEFAULT 24, -- Cada 24 horas por defecto
  max_backups_to_keep INTEGER DEFAULT 10,
  include_photos BOOLEAN DEFAULT false, -- Por performance, fotos separadas
  last_auto_backup TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para backup settings
CREATE TRIGGER update_backup_settings_updated_at 
    BEFORE UPDATE ON backup_settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Agregar columna de sincronización a tablas principales (para offline-first)
ALTER TABLE teams ADD COLUMN needs_sync BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN needs_sync BOOLEAN DEFAULT false;
ALTER TABLE matches ADD COLUMN needs_sync BOOLEAN DEFAULT false;
ALTER TABLE team_players ADD COLUMN needs_sync BOOLEAN DEFAULT false;
ALTER TABLE match_actions ADD COLUMN needs_sync BOOLEAN DEFAULT false;

-- Función para marcar registros como pendientes de sincronización
CREATE OR REPLACE FUNCTION mark_for_sync()
RETURNS TRIGGER AS $$
BEGIN
    NEW.needs_sync := true;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para marcar automáticamente registros modificados
CREATE TRIGGER mark_teams_for_sync
    BEFORE UPDATE ON teams
    FOR EACH ROW 
    EXECUTE FUNCTION mark_for_sync();

CREATE TRIGGER mark_players_for_sync  
    BEFORE UPDATE ON players
    FOR EACH ROW 
    EXECUTE FUNCTION mark_for_sync();

CREATE TRIGGER mark_matches_for_sync
    BEFORE UPDATE ON matches
    FOR EACH ROW 
    EXECUTE FUNCTION mark_for_sync();

-- Índices para performance de sincronización
CREATE INDEX idx_teams_needs_sync ON teams(needs_sync, user_id);
CREATE INDEX idx_players_needs_sync ON players(needs_sync);
CREATE INDEX idx_matches_needs_sync ON matches(needs_sync);
CREATE INDEX idx_backup_settings_user ON backup_settings(user_id);
