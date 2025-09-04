// Test completo para la API de formaciones
const API_BASE_URL = 'http://localhost:3001/api';

// Función auxiliar para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 1: Health check
async function testHealthCheck() {
  console.log('🔍 Test 1: Health Check');
  const result = await makeRequest('http://localhost:3001/health');
  
  if (result.success) {
    console.log('✅ Health check OK:', result.data);
  } else {
    console.log('❌ Health check falló:', result.error);
  }
  console.log('');
}

// Test 2: Obtener todas las formaciones (inicialmente vacío)
async function testGetAllFormations() {
  console.log('🔍 Test 2: Obtener todas las formaciones');
  const result = await makeRequest(`${API_BASE_URL}/formations`);
  
  if (result.success) {
    console.log('✅ GET /formations OK:', result.data.length, 'formaciones encontradas');
    console.log('Datos:', result.data);
  } else {
    console.log('❌ GET /formations falló:', result.error);
  }
  console.log('');
}

// Test 3: Crear una nueva formación
async function testCreateFormation() {
  console.log('🔍 Test 3: Crear nueva formación');
  
  const newFormation = {
    name: 'Formación 4-3-3 Ofensiva',
    description: 'Formación ofensiva con extremos rápidos',
    formation_type: '4-3-3',
    team_id: 1,
    is_template: true
  };
  
  const result = await makeRequest(`${API_BASE_URL}/formations`, {
    method: 'POST',
    body: JSON.stringify(newFormation)
  });
  
  if (result.success) {
    console.log('✅ POST /formations OK - ID:', result.data.id);
    console.log('Formación creada:', result.data);
    return result.data.id; // Retornamos el ID para usar en otros tests
  } else {
    console.log('❌ POST /formations falló:', result.error);
    return null;
  }
}

// Test 4: Obtener una formación por ID
async function testGetFormationById(formationId) {
  if (!formationId) {
    console.log('⏭️ Test 4: Saltado - no hay ID de formación');
    return;
  }
  
  console.log('🔍 Test 4: Obtener formación por ID');
  const result = await makeRequest(`${API_BASE_URL}/formations/${formationId}`);
  
  if (result.success) {
    console.log('✅ GET /formations/:id OK');
    console.log('Formación:', result.data);
  } else {
    console.log('❌ GET /formations/:id falló:', result.error);
  }
  console.log('');
}

// Test 5: Actualizar una formación
async function testUpdateFormation(formationId) {
  if (!formationId) {
    console.log('⏭️ Test 5: Saltado - no hay ID de formación');
    return;
  }
  
  console.log('🔍 Test 5: Actualizar formación');
  
  const updatedData = {
    name: 'Formación 4-3-3 Defensiva ACTUALIZADA',
    description: 'Formación defensiva modificada',
    formation_type: '4-3-3'
  };
  
  const result = await makeRequest(`${API_BASE_URL}/formations/${formationId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData)
  });
  
  if (result.success) {
    console.log('✅ PUT /formations/:id OK');
    console.log('Formación actualizada:', result.data);
  } else {
    console.log('❌ PUT /formations/:id falló:', result.error);
  }
  console.log('');
}

// Test 6: Obtener posiciones de una formación
async function testGetFormationPositions(formationId) {
  if (!formationId) {
    console.log('⏭️ Test 6: Saltado - no hay ID de formación');
    return;
  }
  
  console.log('🔍 Test 6: Obtener posiciones de formación');
  const result = await makeRequest(`${API_BASE_URL}/formations/${formationId}/positions`);
  
  if (result.success) {
    console.log('✅ GET /formations/:id/positions OK');
    console.log('Posiciones:', result.data.length, 'encontradas');
    console.log('Datos:', result.data);
  } else {
    console.log('❌ GET /formations/:id/positions falló:', result.error);
  }
  console.log('');
}

// Test 7: Agregar una posición a la formación
async function testAddPosition(formationId) {
  if (!formationId) {
    console.log('⏭️ Test 7: Saltado - no hay ID de formación');
    return;
  }
  
  console.log('🔍 Test 7: Agregar posición a formación');
  
  const newPosition = {
    position: 'GK',
    player_id: 1,
    x_coordinate: 50,
    y_coordinate: 90,
    is_starter: true
  };
  
  const result = await makeRequest(`${API_BASE_URL}/formations/${formationId}/positions`, {
    method: 'POST',
    body: JSON.stringify(newPosition)
  });
  
  if (result.success) {
    console.log('✅ POST /formations/:id/positions OK');
    console.log('Posición agregada:', result.data);
    return result.data.id;
  } else {
    console.log('❌ POST /formations/:id/positions falló:', result.error);
    return null;
  }
}

// Test 8: Obtener detalles completos de la formación
async function testGetFormationDetails(formationId) {
  if (!formationId) {
    console.log('⏭️ Test 8: Saltado - no hay ID de formación');
    return;
  }
  
  console.log('🔍 Test 8: Obtener detalles completos de formación');
  const result = await makeRequest(`${API_BASE_URL}/formations/${formationId}/details`);
  
  if (result.success) {
    console.log('✅ GET /formations/:id/details OK');
    console.log('Detalles completos:', result.data);
  } else {
    console.log('❌ GET /formations/:id/details falló:', result.error);
  }
  console.log('');
}

// Test 9: Eliminar la formación (al final)
async function testDeleteFormation(formationId) {
  if (!formationId) {
    console.log('⏭️ Test 9: Saltado - no hay ID de formación');
    return;
  }
  
  console.log('🔍 Test 9: Eliminar formación');
  const result = await makeRequest(`${API_BASE_URL}/formations/${formationId}`, {
    method: 'DELETE'
  });
  
  if (result.success) {
    console.log('✅ DELETE /formations/:id OK');
    console.log('Resultado:', result.data);
  } else {
    console.log('❌ DELETE /formations/:id falló:', result.error);
  }
  console.log('');
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 INICIANDO TESTS COMPLETOS DE LA API DE FORMACIONES');
  console.log('='.repeat(60));
  console.log('');
  
  await testHealthCheck();
  await testGetAllFormations();
  
  const formationId = await testCreateFormation();
  console.log('');
  
  await testGetFormationById(formationId);
  await testUpdateFormation(formationId);
  await testGetFormationPositions(formationId);
  
  const positionId = await testAddPosition(formationId);
  console.log('');
  
  await testGetFormationDetails(formationId);
  await testDeleteFormation(formationId);
  
  console.log('🎉 TESTS COMPLETADOS');
  console.log('='.repeat(60));
}

// Verificar que el servidor esté corriendo antes de ejecutar tests
async function checkServerAndRunTests() {
  console.log('🔍 Verificando que el servidor esté corriendo...');
  const serverCheck = await makeRequest('http://localhost:3001/health');
  
  if (!serverCheck.success) {
    console.log('❌ El servidor no está corriendo en puerto 3001');
    console.log('Por favor inicia el servidor con: node src/server-mock.js');
    return;
  }
  
  console.log('✅ Servidor detectado, iniciando tests...');
  console.log('');
  await runAllTests();
}

// Ejecutar
checkServerAndRunTests().catch(console.error);
