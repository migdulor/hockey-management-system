import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function checkTables() {
  console.log('🔍 Consultando estructura de tablas existentes...');
  
  try {
    // Ver todas las tablas
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 Tablas disponibles:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Ver estructura de cada tabla mencionada
    const tablesToCheck = ['teams', 'players', 'training_sessions', 'training_attendances', 'users'];
    
    for (const tableName of tablesToCheck) {
      try {
        const columnsResult = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position
        `;
        
        if (columnsResult.rows.length > 0) {
          console.log(`\n📊 Estructura de tabla '${tableName}':`);
          columnsResult.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
          });
        } else {
          console.log(`\n❌ Tabla '${tableName}' no existe`);
        }
      } catch (error) {
        console.log(`\n❌ Error consultando tabla '${tableName}': ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkTables().catch(console.error);
