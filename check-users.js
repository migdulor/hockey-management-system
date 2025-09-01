const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
    try {
        const result = await pool.query('SELECT id, email, first_name, last_name, role, is_active FROM users ORDER BY email');
        console.log('👥 Usuarios en la base de datos:');
        console.log('Total usuarios:', result.rows.length);
        console.log('');
        
        result.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
            console.log(`   Rol: ${user.role}`);
            console.log(`   Activo: ${user.is_active}`);
            console.log(`   ID: ${user.id}`);
            console.log('');
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error consultando base de datos:', error.message);
    }
}

checkUsers();
