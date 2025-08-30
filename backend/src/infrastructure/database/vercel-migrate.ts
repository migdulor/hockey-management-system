import { sql } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando migración de base de datos a Vercel...');

async function executeMigration(migrationFile: string): Promise<void> {
  try {
    console.log(`📄 Ejecutando migración: ${migrationFile}`);
    
    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Dividir por declaraciones SQL (punto y coma + salto de línea)
    const statements = migrationSQL
      .split(/;\s*[\r\n]+/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
      }
    }
    
    console.log(`✅ Migración completada: ${migrationFile}`);
  } catch (error) {
    console.error(`❌ Error en migración ${migrationFile}:`, error);
    throw error;
  }
}

async function runAllMigrations(): Promise<void> {
  const migrations = [
    '001_users_and_authentication.sql',
    '002_divisions_hockey.sql',
    '003_teams_with_validations.sql',
    '004_players_with_controls.sql',
    '005_action_types_hockey.sql',
    '006_matches_with_time_control.sql',
    '007_match_actions.sql',
    '008_tactical_zones_heatmaps.sql',
    '009_seasons_management.sql',
    '010_backup_offline_support.sql',
    '011_refactor_attendance_system.sql',
    '012_complete_formations_system.sql'
  ];

  console.log(`🎯 Ejecutando ${migrations.length} migraciones...`);

  for (const migration of migrations) {
    await executeMigration(migration);
  }

  console.log('🎉 ¡Todas las migraciones ejecutadas correctamente!');
}

// Ejecutar migraciones si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllMigrations().catch((error) => {
    console.error('💥 Error fatal en migraciones:', error);
    process.exit(1);
  });
}

export { runAllMigrations, executeMigration };
