// Test completo del sistema: Backend API + Frontend
// Este script verifica que todos los endpoints funcionen correctamente

import http from 'http';

const API_BASE = 'http://localhost:3001';

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ success: true, status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ success: true, status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject({ success: false, error: error.message });
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function runTests() {
    console.log('🧪 INICIANDO TESTS DEL SISTEMA COMPLETO\n');

    // Test 1: Health Check
    console.log('1️⃣ Test: Health Check');
    try {
        const result = await makeRequest(`${API_BASE}/`);
        if (result.success && result.status === 200) {
            console.log('✅ Health check OK');
            console.log(`   Status: ${result.data.status}`);
            console.log(`   Formations: ${result.data.formations}`);
        } else {
            console.log('❌ Health check failed');
        }
    } catch (error) {
        console.log('❌ Health check error:', error.error);
    }

    // Test 2: Players API
    console.log('\n2️⃣ Test: Players API');
    try {
        const result = await makeRequest(`${API_BASE}/api/players`);
        if (result.success && result.status === 200) {
            console.log(`✅ Players API OK - ${result.data.length} jugadoras cargadas`);
            console.log(`   Ejemplo: ${result.data[0].first_name} ${result.data[0].last_name} (${result.data[0].position})`);
        } else {
            console.log('❌ Players API failed');
        }
    } catch (error) {
        console.log('❌ Players API error:', error.error);
    }

    // Test 3: Formations API (GET)
    console.log('\n3️⃣ Test: Formations API (GET)');
    try {
        const result = await makeRequest(`${API_BASE}/api/formations`);
        if (result.success && result.status === 200) {
            console.log(`✅ Formations GET OK - ${result.data.length} formaciones`);
        } else {
            console.log('❌ Formations GET failed');
        }
    } catch (error) {
        console.log('❌ Formations GET error:', error.error);
    }

    // Test 4: Create Formation (POST)
    console.log('\n4️⃣ Test: Create Formation (POST)');
    const testFormation = {
        id: 'test_formation_' + Date.now(),
        name: 'Formación de Prueba',
        strategy: '1-4-3-3',
        teamId: 'team_test',
        matchId: 'match_test',
        description: 'Formación creada para testing'
    };

    try {
        const result = await makeRequest(`${API_BASE}/api/formations`, {
            method: 'POST',
            body: testFormation
        });
        if (result.success && result.status === 201) {
            console.log('✅ Formation CREATE OK');
            console.log(`   ID: ${result.data.id}`);
            console.log(`   Name: ${result.data.name}`);
            
            // Test 5: Get Formation by ID
            console.log('\n5️⃣ Test: Get Formation by ID');
            const getResult = await makeRequest(`${API_BASE}/api/formations/${result.data.id}`);
            if (getResult.success && getResult.status === 200) {
                console.log('✅ Formation GET by ID OK');
                console.log(`   Retrieved: ${getResult.data.name}`);
            } else {
                console.log('❌ Formation GET by ID failed');
            }
            
        } else {
            console.log('❌ Formation CREATE failed');
        }
    } catch (error) {
        console.log('❌ Formation CREATE error:', error.error);
    }

    console.log('\n🎉 TESTS COMPLETADOS');
    console.log('\n📌 Para probar el frontend:');
    console.log('   Abre: file:///C:/Proyectos/hockey-management-system/frontend/formations.html');
    console.log('   O desde VS Code: Simple Browser');
}

runTests().catch(console.error);
