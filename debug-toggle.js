// Script simple para debuggear el problema del toggle

const config = require('./vercel-config.js');

async function debugToggle() {
    try {
        console.log('🔍 Debug: Verificando el toggle...\n');
        
        // Simular el token que estaría en el localStorage
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock'; // Token falso para probar
        
        console.log('1. Intentando hacer toggle...');
        
        // Usar el ID de un usuario específico que sabemos que existe
        const userId = '38ad1d66-aabf-43d3-97ae-4affb0687e1f'; // entrenador2@test.com
        const toggleUrl = config.getBypassUrl(`/api/admin/users/${userId}/toggle`);
        
        console.log('URL completa:', toggleUrl);
        
        const response = await fetch(toggleUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${mockToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.status === 401) {
            console.log('\n⚠️  Se requiere token válido. Esto es normal.');
            console.log('💡 El endpoint está funcionando (rechaza tokens inválidos).');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugToggle();
