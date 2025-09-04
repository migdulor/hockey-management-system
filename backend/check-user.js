import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

async function checkUser() {
    try {
        console.log('🔍 Buscando usuario migdulor1@gmail.com...');
        
        const result = await sql`
            SELECT id, email, password_hash, role, is_active, first_name, last_name
            FROM users 
            WHERE email = 'migdulor1@gmail.com'
        `;
        
        if (result.rows.length === 0) {
            console.log('❌ Usuario no encontrado');
            
            // Listar algunos usuarios para ver qué hay
            console.log('\n📋 Usuarios disponibles:');
            const allUsers = await sql`
                SELECT id, email, role, is_active, first_name, last_name
                FROM users 
                LIMIT 10
            `;
            
            allUsers.rows.forEach(user => {
                console.log(`- ${user.email} (${user.role}) - Activo: ${user.is_active}`);
            });
            
        } else {
            const user = result.rows[0];
            console.log('✅ Usuario encontrado:');
            console.log(`- ID: ${user.id}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Activo: ${user.is_active}`);
            console.log(`- Nombre: ${user.first_name} ${user.last_name}`);
            
            // Verificar contraseña
            console.log('\n🔐 Verificando contraseña "entreno123"...');
            const isValidPassword = await bcrypt.compare('entreno123', user.password_hash);
            
            if (isValidPassword) {
                console.log('✅ Contraseña correcta');
            } else {
                console.log('❌ Contraseña incorrecta');
                
                // Intentar crear un hash de la contraseña para comparar
                const testHash = await bcrypt.hash('entreno123', 10);
                console.log('\n🧪 Hash de test generado para "entreno123":');
                console.log(testHash);
                console.log('\n🔍 Hash almacenado en BD:');
                console.log(user.password_hash);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUser();
