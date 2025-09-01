import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

async function checkDivisions() {
  console.log('🔍 Consultando estructura y divisiones disponibles...')
  
  try {
    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'divisions' 
      ORDER BY ordinal_position
    `
    const structure = await pool.query(structureQuery)
    
    console.log('\n📊 Estructura de tabla divisions:')
    structure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`)
    })
    
    // Get all divisions with their details
    const result = await pool.query('SELECT * FROM divisions ORDER BY name, created_at')
    
    console.log('\n🏆 Divisiones disponibles:')
    result.rows.forEach(div => {
      console.log(`  - ${div.name} (ID: ${div.id})`)
      if (div.gender) console.log(`    Género: ${div.gender}`)
      if (div.category) console.log(`    Categoría: ${div.category}`)
      if (div.age_min || div.age_max) console.log(`    Edad: ${div.age_min || '?'}-${div.age_max || '?'}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkDivisions()
