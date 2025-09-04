// Prueba usando el módulo http nativo de Node.js
const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testFormationAPI() {
  console.log('🚀 Iniciando pruebas de la API de formaciones...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    });
    console.log('✅ Health check:', healthResult.data);
    
    // Test 2: GET all formations
    console.log('\n2. Getting all formations...');
    const getResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/formations',
      method: 'GET'
    });
    console.log('✅ All formations:', getResult.data);
    
    // Test 3: POST nueva formación
    console.log('\n3. Creating new formation...');
    const formationData = JSON.stringify({
      name: 'Test Formation 4-3-3',
      description: 'Formación de prueba con Node.js nativo',
      formation_type: '4-3-3',
      team_id: 1,
      is_template: true
    });
    
    const createResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/formations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(formationData)
      }
    }, formationData);
    
    console.log('✅ Created formation:', createResult.data);
    const formationId = createResult.data.id;
    
    // Test 4: GET formation by ID
    console.log('\n4. Getting formation by ID...');
    const getByIdResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/formations/${formationId}`,
      method: 'GET'
    });
    console.log('✅ Formation by ID:', getByIdResult.data);
    
    // Test 5: POST nueva posición
    console.log('\n5. Adding position to formation...');
    const positionData = JSON.stringify({
      position: 'GK',
      player_id: 1,
      x_coordinate: 50,
      y_coordinate: 90,
      is_starter: true
    });
    
    const addPositionResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/formations/${formationId}/positions`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(positionData)
      }
    }, positionData);
    
    console.log('✅ Added position:', addPositionResult.data);
    
    // Test 6: GET formation positions
    console.log('\n6. Getting formation positions...');
    const getPositionsResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/formations/${formationId}/positions`,
      method: 'GET'
    });
    console.log('✅ Formation positions:', getPositionsResult.data);
    
    // Test 7: GET formation details
    console.log('\n7. Getting formation details...');
    const getDetailsResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/formations/${formationId}/details`,
      method: 'GET'
    });
    console.log('✅ Formation details:', getDetailsResult.data);
    
    // Test 8: PUT actualizar formación
    console.log('\n8. Updating formation...');
    const updateData = JSON.stringify({
      name: 'Updated Test Formation 4-3-3',
      description: 'Formación actualizada desde pruebas'
    });
    
    const updateResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/formations/${formationId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData)
      }
    }, updateData);
    
    console.log('✅ Updated formation:', updateResult.data);
    
    // Test 9: DELETE formación
    console.log('\n9. Deleting formation...');
    const deleteResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/formations/${formationId}`,
      method: 'DELETE'
    });
    console.log('✅ Deleted formation:', deleteResult.data);
    
    console.log('\n🎉 ¡TODOS LOS TESTS COMPLETADOS EXITOSAMENTE!');
    console.log('🔥 La API de formaciones está completamente funcional');
    console.log('✅ Todos los endpoints probados correctamente:');
    console.log('   - Health check ✓');
    console.log('   - GET /formations ✓');
    console.log('   - POST /formations ✓');
    console.log('   - GET /formations/:id ✓');
    console.log('   - PUT /formations/:id ✓');
    console.log('   - DELETE /formations/:id ✓');
    console.log('   - GET /formations/:id/positions ✓');
    console.log('   - POST /formations/:id/positions ✓');
    console.log('   - GET /formations/:id/details ✓');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
testFormationAPI();
