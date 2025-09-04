// Prueba simple usando fetch nativo de Node.js (disponible desde Node 18+)
const API_BASE_URL = 'http://localhost:3001/api';

// Test simple para verificar que la API funcione
async function testAPI() {
  try {
    console.log('🔍 Testing API de Formaciones...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Test 2: GET formations (vacío inicialmente)
    console.log('\n2. Getting all formations...');
    const getResponse = await fetch(`${API_BASE_URL}/formations`);
    const formations = await getResponse.json();
    console.log('✅ Formations:', formations);
    
    // Test 3: POST nueva formación
    console.log('\n3. Creating new formation...');
    const newFormation = {
      name: 'Test Formation 4-4-2',
      description: 'Formación de prueba',
      formation_type: '4-4-2',
      team_id: 1,
      is_template: true
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/formations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFormation)
    });
    
    const createdFormation = await createResponse.json();
    console.log('✅ Created formation:', createdFormation);
    
    const formationId = createdFormation.id;
    
    // Test 4: GET formation by ID
    console.log('\n4. Getting formation by ID...');
    const getByIdResponse = await fetch(`${API_BASE_URL}/formations/${formationId}`);
    const formation = await getByIdResponse.json();
    console.log('✅ Formation by ID:', formation);
    
    // Test 5: GET formation positions
    console.log('\n5. Getting formation positions...');
    const positionsResponse = await fetch(`${API_BASE_URL}/formations/${formationId}/positions`);
    const positions = await positionsResponse.json();
    console.log('✅ Positions:', positions);
    
    // Test 6: POST nueva posición
    console.log('\n6. Adding position to formation...');
    const newPosition = {
      position: 'GK',
      player_id: 1,
      x_coordinate: 50,
      y_coordinate: 90,
      is_starter: true
    };
    
    const addPositionResponse = await fetch(`${API_BASE_URL}/formations/${formationId}/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosition)
    });
    
    const addedPosition = await addPositionResponse.json();
    console.log('✅ Added position:', addedPosition);
    
    // Test 7: GET formation details (con posiciones)
    console.log('\n7. Getting formation details...');
    const detailsResponse = await fetch(`${API_BASE_URL}/formations/${formationId}/details`);
    const details = await detailsResponse.json();
    console.log('✅ Formation details:', details);
    
    // Test 8: PUT actualizar formación
    console.log('\n8. Updating formation...');
    const updateData = {
      name: 'Updated Formation 4-4-2',
      description: 'Formación actualizada'
    };
    
    const updateResponse = await fetch(`${API_BASE_URL}/formations/${formationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const updatedFormation = await updateResponse.json();
    console.log('✅ Updated formation:', updatedFormation);
    
    // Test 9: DELETE formación
    console.log('\n9. Deleting formation...');
    const deleteResponse = await fetch(`${API_BASE_URL}/formations/${formationId}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    console.log('✅ Delete result:', deleteResult);
    
    console.log('\n🎉 ¡Todos los tests completados exitosamente!');
    console.log('La API de formaciones está funcionando correctamente.');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar tests
testAPI();
