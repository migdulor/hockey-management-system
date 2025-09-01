import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function runTeamsMigration() {
  console.log('🔄 Aplicando migración teams-players...');
  
  try {
    // Crear tabla teams
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          category VARCHAR(20),
          division VARCHAR(20),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Crear tabla players
    await sql`
      CREATE TABLE IF NOT EXISTS players (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(20),
          jersey_number INTEGER,
          position VARCHAR(30),
          date_of_birth DATE,
          photo_url TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(team_id, jersey_number)
      )
    `;
    
    // Crear índices
    await sql`CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id)`;
    
    console.log('✅ Migración aplicada exitosamente');
    
    // Verificar tablas
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('teams', 'players')
      ORDER BY table_name
    `;
    
    console.log('📊 Tablas verificadas:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTeamsMigration().catch(console.error);
