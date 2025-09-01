const config = require('./vercel-config.js');

async function debugUsers() {
    try {
        console.log('🔍 CONSULTANDO USUARIOS EN LA BASE DE DATOS...\n');
        
        const response = await fetch(config.getBypassUrl('/api/debug/users'), {
            method: 'GET',
            headers: config.getBypassHeaders()
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Success:', data.success);
        console.log('Count:', data.count);
        console.log('\n📋 USUARIOS ENCONTRADOS:');
        
        if (data.users && data.users.length > 0) {
            data.users.forEach((user, index) => {
                console.log(`${index + 1}. Email: '${user.email}'`);
                console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
                console.log(`   Rol: ${user.role}`);
                console.log(`   Activo: ${user.is_active}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Creado: ${user.created_at}`);
                console.log('');
            });
        } else {
            console.log('❌ No se encontraron usuarios en la tabla users');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugUsers();
