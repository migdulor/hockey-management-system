import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

async function removeIsStarterColumn() {
  console.log('🗑️ Eliminando columna is_starter de team_players...');
  
  try {
    // Verificar si la columna existe
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'team_players' 
      AND column_name = 'is_starter'
    `;
    
    if (columnCheck.length > 0) {
      console.log('✅ Columna is_starter encontrada');
      
      // Verificar dependencias
      console.log('🔍 Buscando dependencias...');
      
      // Primero, intentar eliminar cualquier índice que pueda existir
      try {
        await sql`DROP INDEX IF EXISTS idx_team_players_is_starter`;
        console.log('✅ Índice eliminado (si existía)');
      } catch (e) {
        console.log('ℹ️ No había índices para eliminar');
      }
      
      // Intentar eliminar constraints si existen
      try {
        await sql`ALTER TABLE team_players DROP CONSTRAINT IF EXISTS chk_is_starter`;
        console.log('✅ Constraints eliminados (si existían)');
      } catch (e) {
        console.log('ℹ️ No había constraints para eliminar');
      }
      
      // Ahora intentar eliminar la columna
      await sql`ALTER TABLE team_players DROP COLUMN is_starter CASCADE`;
      
      console.log('✅ Columna is_starter eliminada exitosamente');
    } else {
      console.log('ℹ️ La columna is_starter ya no existe en la tabla');
    }
    
    // Verificar la estructura actual
    const currentColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'team_players'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Estructura actual de team_players:');
    currentColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar columna:', error);
    throw error;
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  removeIsStarterColumn()
    .then(() => {
      console.log('🎉 Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

export { removeIsStarterColumn };
