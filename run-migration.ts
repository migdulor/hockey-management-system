import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function runMigration() {
  console.log('🔄 Aplicando migración teams-players...');
  
  try {
    // Crear tabla teams si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          category VARCHAR(20),
          division VARCHAR(20),
          coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Tabla teams verificada/creada');
    
    // Crear tabla players si no existe
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
          updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Tabla players verificada/creada');
    
    // Crear índices si no existen
    await sql`CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_players_jersey ON players(team_id, jersey_number)`;
    
    console.log('✅ Índices verificados/creados');
    
    // Verificar tablas creadas
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('teams', 'players', 'users')
      ORDER BY table_name
    `;
    
    console.log('📊 Tablas existentes:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.error('Stack:', error.stack);
  }
}

runMigration().catch(console.error);
