import pool from './postgres.js';

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa:', res.rows[0]);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    await pool.end();
  }
};

testConnection();
