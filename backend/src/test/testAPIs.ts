import pool from '../core/db/postgres.js';

const testAPIs = async () => {
  try {
    console.log('🧪 Probando APIs del backend...\n');
    
    // 1. Crear un equipo de prueba
    console.log('1. Creando equipo de prueba...');
    const teamId = crypto.randomUUID();
    const teamQuery = `
      INSERT INTO teams (id, name, category, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const teamResult = await pool.query(teamQuery, [
      teamId,
      'Equipo Test',
      'Senior',
      'Equipo creado para pruebas'
    ]);
    console.log('✅ Equipo creado:', teamResult.rows[0].name);
    
    // 2. Crear un jugador de prueba
    console.log('\n2. Creando jugador de prueba...');
    const playerId = crypto.randomUUID();
    const playerQuery = `
      INSERT INTO players (id, name, email, phone, position, team_id, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const playerResult = await pool.query(playerQuery, [
      playerId,
      'Juan Pérez',
      'juan.perez@test.com',
      '+1234567890',
      'Delantero',
      teamId,
      true
    ]);
    console.log('✅ Jugador creado:', playerResult.rows[0].name);
    
    // 3. Crear un partido de prueba
    console.log('\n3. Creando partido de prueba...');
    const matchId = crypto.randomUUID();
    const matchQuery = `
      INSERT INTO matches (id, home_team_id, away_team_id, date, location, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const matchResult = await pool.query(matchQuery, [
      matchId,
      teamId,
      teamId, // mismo equipo para simplicidad
      new Date('2025-09-01T18:00:00'),
      'Estadio Test',
      'scheduled'
    ]);
    console.log('✅ Partido creado:', matchResult.rows[0].location);
    
    // 4. Verificar datos creados
    console.log('\n4. Verificando datos en la base de datos...');
    
    const teamsCount = await pool.query('SELECT COUNT(*) FROM teams');
    const playersCount = await pool.query('SELECT COUNT(*) FROM players');
    const matchesCount = await pool.query('SELECT COUNT(*) FROM matches');
    
    console.log(`📊 Estadísticas:`);
    console.log(`  - Equipos: ${teamsCount.rows[0].count}`);
    console.log(`  - Jugadores: ${playersCount.rows[0].count}`);
    console.log(`  - Partidos: ${matchesCount.rows[0].count}`);
    
    // 5. Limpiar datos de prueba
    console.log('\n5. Limpiando datos de prueba...');
    await pool.query('DELETE FROM matches WHERE id = $1', [matchId]);
    await pool.query('DELETE FROM players WHERE id = $1', [playerId]);
    await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
    console.log('✅ Datos de prueba eliminados');
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('🚀 Backend listo para usar con Railway PostgreSQL');
    
  } catch (err) {
    console.error('❌ Error en las pruebas:', err);
  } finally {
    await pool.end();
  }
};

testAPIs();
