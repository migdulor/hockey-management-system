import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

async function checkTeamPlayersTable() {
  console.log('🔍 Consultando estructura de tabla team_players...')
  
  try {
    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'team_players' 
      ORDER BY ordinal_position
    `
    
    const result = await pool.query(structureQuery)
    
    console.log('\n📊 Estructura de tabla team_players:')
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`)
    })
    
    // Check sample data
    console.log('\n📋 Datos de ejemplo (primeros 5 registros):')
    const sampleQuery = 'SELECT * FROM team_players LIMIT 5'
    const sampleResult = await pool.query(sampleQuery)
    
    if (sampleResult.rows.length > 0) {
      console.log(sampleResult.rows)
    } else {
      console.log('  No hay datos en la tabla team_players')
    }
    
    // Check constraints
    console.log('\n🔗 Restricciones de la tabla:')
    const constraintsQuery = `
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'team_players'::regclass
    `
    const constraintsResult = await pool.query(constraintsQuery)
    constraintsResult.rows.forEach(row => {
      console.log(`  ${row.conname} (${row.contype}): ${row.definition}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkTeamPlayersTable()
