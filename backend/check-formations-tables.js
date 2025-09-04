import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_TjPolq27YkZn@ep-round-pine-acy1hi7r-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    const tables = ['formations', 'formation_exports', 'formation_players', 'formation_positions', 'formation_strategies'];
    
    for (let table of tables) {
      console.log(`\n📋 Verificando tabla: ${table}`);
      
      // Verificar si existe la tabla
      const existsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `;
      const existsResult = await client.query(existsQuery);
      
      if (existsResult.rows[0].exists) {
        console.log(`✅ Tabla ${table} existe`);
        
        // Obtener estructura de la tabla
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          ORDER BY ordinal_position;
        `;
        const structureResult = await client.query(structureQuery);
        
        console.log('📝 Estructura:');
        structureResult.rows.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Contar registros
        const countQuery = `SELECT COUNT(*) FROM ${table}`;
        const countResult = await client.query(countQuery);
        console.log(`📊 Registros: ${countResult.rows[0].count}`);
        
      } else {
        console.log(`❌ Tabla ${table} NO existe`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
