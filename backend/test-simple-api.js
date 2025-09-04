// Test simple para verificar que la API está funcionando
import http from 'http';

async function testAPI() {
    console.log('🔍 Probando API de formaciones...');
    
    // Test 1: Health check
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET'
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('✅ Health check response:', res.statusCode);
                console.log('📄 Response:', data);
                
                // Test 2: Get formations
                testFormations();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

function testFormations() {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/formations',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('✅ Formations endpoint response:', res.statusCode);
            console.log('📄 Formations data:', data);
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Error en formations:', error.message);
    });
    
    req.end();
}

testAPI().catch(console.error);
