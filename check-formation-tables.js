const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

// Cargar variables de entorno
config({ path: '.env.local' });

async function checkFormationTables() {
  try {
    console.log('🔍 Verificando tablas de formaciones...');
    
    // Verificar tabla formations
    console.log('\n📋 Verificando tabla formations...');
    const formationsResult = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'formations' 
      ORDER BY ordinal_position;
    `;
    
    if (formationsResult.rows.length === 0) {
      console.log('❌ La tabla formations no existe');
      return;
    }
    
    console.log('✅ Tabla formations encontrada con columnas:');
    formationsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar tabla formation_positions
    console.log('\n📋 Verificando tabla formation_positions...');
    const positionsResult = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'formation_positions' 
      ORDER BY ordinal_position;
    `;
    
    if (positionsResult.rows.length === 0) {
      console.log('❌ La tabla formation_positions no existe');
      return;
    }
    
    console.log('✅ Tabla formation_positions encontrada con columnas:');
    positionsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar datos de prueba
    console.log('\n📊 Contando registros existentes...');
    const formationsCount = await sql`SELECT COUNT(*) FROM formations`;
    const positionsCount = await sql`SELECT COUNT(*) FROM formation_positions`;
    
    console.log(`✅ Registros en formations: ${formationsCount.rows[0].count}`);
    console.log(`✅ Registros en formation_positions: ${positionsCount.rows[0].count}`);
    
    console.log('\n🎉 Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error al verificar las tablas:', error);
  }
}

checkFormationTables();
