import pool from './postgres.js';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    const migrationPath = path.join(process.cwd(), 'backend/src/core/db/migrations/001_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Ejecutando migraciones...');
    await pool.query(sql);
    console.log('✅ Migraciones ejecutadas exitosamente');
    
    // Verificar tablas creadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('❌ Error ejecutando migraciones:', err);
  } finally {
    await pool.end();
  }
};

runMigrations();
