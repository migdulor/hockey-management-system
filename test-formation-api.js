const testFormationAPI = async () => {
  const BASE_URL = 'http://localhost:3001/api/formations';
  
  console.log('🧪 Iniciando pruebas de la API de formaciones...\n');
  
  try {
    // Test 1: GET /api/formations (obtener todas las formaciones)
    console.log('📋 Test 1: Obtener todas las formaciones');
    const getAllResponse = await fetch(BASE_URL);
    const formations = await getAllResponse.json();
    console.log(`✅ Status: ${getAllResponse.status}`);
    console.log(`✅ Formaciones encontradas: ${formations.length}`);
    console.log('');
    
    // Test 2: POST /api/formations (crear nueva formación)
    console.log('🆕 Test 2: Crear nueva formación');
    const newFormation = {
      id: `formation_test_${Date.now()}`,
      teamId: `team_${Date.now()}`,
      name: 'Formación de Prueba',
      description: 'Formación creada para testing',
      tacticalSystem: '4-3-3',
      formationType: 'offensive',
      isTemplate: false,
      exportSettings: {
        width: 1080,
        height: 1350,
        format: 'PNG',
        backgroundColor: '#ffffff',
        playerCircleSize: 30,
        fontFamily: 'Arial',
        fontSize: 12
      },
      version: 1,
      usageCount: 0
    };
    
    const createResponse = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFormation)
    });
    
    if (createResponse.ok) {
      const createdFormation = await createResponse.json();
      console.log(`✅ Status: ${createResponse.status}`);
      console.log(`✅ Formación creada con ID: ${createdFormation.id}`);
      
      // Test 3: GET /api/formations/:id (obtener formación específica)
      console.log('\n📖 Test 3: Obtener formación específica');
      const getByIdResponse = await fetch(`${BASE_URL}/${createdFormation.id}`);
      if (getByIdResponse.ok) {
        const formation = await getByIdResponse.json();
        console.log(`✅ Status: ${getByIdResponse.status}`);
        console.log(`✅ Formación encontrada: ${formation.name}`);
      } else {
        console.log(`❌ Error al obtener formación: ${getByIdResponse.status}`);
      }
      
      // Test 4: GET /api/formations/:id/positions (obtener posiciones)
      console.log('\n🏃 Test 4: Obtener posiciones de la formación');
      const getPositionsResponse = await fetch(`${BASE_URL}/${createdFormation.id}/positions`);
      if (getPositionsResponse.ok) {
        const positions = await getPositionsResponse.json();
        console.log(`✅ Status: ${getPositionsResponse.status}`);
        console.log(`✅ Posiciones encontradas: ${positions.length}`);
      } else {
        console.log(`❌ Error al obtener posiciones: ${getPositionsResponse.status}`);
      }
      
      // Test 5: POST /api/formations/:id/positions (añadir posición)
      console.log('\n➕ Test 5: Añadir posición a la formación');
      const newPosition = {
        playerId: `player_${Date.now()}`,
        positionType: 'starter',
        positionNumber: 1,
        fieldPositionX: 50,
        fieldPositionY: 10,
        positionName: 'Arquera',
        tacticalRole: 'Goalkeeper',
        positionZone: 'defensive',
        jerseyNumber: 1,
        captain: true,
        viceCaptain: false
      };
      
      const addPositionResponse = await fetch(`${BASE_URL}/${createdFormation.id}/positions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPosition)
      });
      
      if (addPositionResponse.ok) {
        const addedPosition = await addPositionResponse.json();
        console.log(`✅ Status: ${addPositionResponse.status}`);
        console.log(`✅ Posición añadida: ${addedPosition.positionName}`);
        
        // Test 6: DELETE /api/formations/:id/positions/:positionId (eliminar posición)
        console.log('\n🗑️  Test 6: Eliminar posición');
        const deletePositionResponse = await fetch(`${BASE_URL}/${createdFormation.id}/positions/${addedPosition.id}`, {
          method: 'DELETE'
        });
        console.log(`✅ Status: ${deletePositionResponse.status}`);
      } else {
        console.log(`❌ Error al añadir posición: ${addPositionResponse.status}`);
        const errorText = await addPositionResponse.text();
        console.log(`❌ Error details: ${errorText}`);
      }
      
      // Test 7: DELETE /api/formations/:id (eliminar formación)
      console.log('\n🗑️  Test 7: Eliminar formación de prueba');
      const deleteResponse = await fetch(`${BASE_URL}/${createdFormation.id}`, {
        method: 'DELETE'
      });
      console.log(`✅ Status: ${deleteResponse.status}`);
      
    } else {
      console.log(`❌ Error al crear formación: ${createResponse.status}`);
      const errorText = await createResponse.text();
      console.log(`❌ Error details: ${errorText}`);
    }
    
    console.log('\n🎉 Pruebas de API completadas');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
};

// Ejecutar las pruebas
testFormationAPI();
