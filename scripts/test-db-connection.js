const { sql } = require('@vercel/postgres');

async function testDatabaseConnection() {
    try {
        console.log('🔍 Probando conexión a la base de datos...\n');
        
        // Test basic connection
        const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
        console.log('✅ Conexión exitosa!');
        console.log('📅 Hora actual:', result.rows[0].current_time);
        console.log('🐘 Versión PostgreSQL:', result.rows[0].pg_version.split(' ')[0]);
        
        // List existing tables
        console.log('\n📋 Tablas existentes:');
        const tables = await sql`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `;
        
        if (tables.rows.length > 0) {
            tables.rows.forEach(table => {
                console.log(`  📄 ${table.tablename}`);
            });
        } else {
            console.log('  ⚠️  No hay tablas en la base de datos');
        }
        
        // Check for users table specifically
        console.log('\n👥 Verificando tabla de usuarios:');
        try {
            const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
            console.log(`✅ Tabla 'users' encontrada con ${usersCount.rows[0].count} registros`);
            
            // Show existing users (without passwords)
            const users = await sql`
                SELECT id, email, first_name, last_name, role, active, created_at 
                FROM users 
                ORDER BY created_at DESC
            `;
            
            if (users.rows.length > 0) {
                console.log('\n👤 Usuarios existentes:');
                users.rows.forEach(user => {
                    console.log(`  ID: ${user.id} | ${user.email} | ${user.first_name} ${user.last_name} | ${user.role} | Active: ${user.active}`);
                });
            }
            
        } catch (error) {
            console.log('⚠️  Tabla "users" no existe o tiene estructura diferente');
            console.log('🔧 Será necesario ejecutar el script de inicialización');
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n💡 Asegúrate de que las variables de entorno estén configuradas:');
        console.log('   - POSTGRES_URL');
        console.log('   - POSTGRES_PRISMA_URL');
        console.log('   - etc.');
    }
}

testDatabaseConnection();
