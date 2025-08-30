#!/usr/bin/env ts-node
/**
 * 🏑 Hockey Management System - Migración a Vercel Database
 * 
 * Script para ejecutar todas las migraciones en Vercel Postgres
 * Incluye las nuevas tablas para entrenamientos, asistencias y formaciones
 */

import { createPool } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear pool de conexión personalizado
const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

interface Migration {
  version: string;
  name: string;
  path: string;
  content: string;
}

async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  
  const migrations: Migration[] = [];
  
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const version = file.split('_')[0];
    const name = file.replace('.sql', '').replace(/^\d+_/, '');
    
    migrations.push({
      version,
      name,
      path: filePath,
      content
    });
  }
  
  // Ordenar por número de versión
  return migrations.sort((a, b) => parseInt(a.version) - parseInt(b.version));
}

async function createMigrationsTable(): Promise<void> {
  console.log('📋 Creando tabla de migraciones...');
  
  await pool.sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      execution_time_ms INTEGER
    )
  `;
  
  console.log('✅ Tabla de migraciones creada');
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await pool.sql`
    SELECT version FROM schema_migrations ORDER BY version
  `;
  
  return new Set(result.rows.map(row => row.version as string));
}

async function executeMigration(migration: Migration): Promise<void> {
  const startTime = Date.now();
  
  console.log(`🔄 Ejecutando migración ${migration.version}: ${migration.name}...`);
  
  try {
    // Ejecutar el contenido de la migración
    await pool.query(migration.content);
    
    const executionTime = Date.now() - startTime;
    
    // Registrar en tabla de migraciones
    await pool.sql`
      INSERT INTO schema_migrations (version, name, execution_time_ms)
      VALUES (${migration.version}, ${migration.name}, ${executionTime})
    `;
    
    console.log(`✅ Migración ${migration.version} ejecutada exitosamente (${executionTime}ms)`);
    
  } catch (error) {
    console.error(`❌ Error ejecutando migración ${migration.version}:`, error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  console.log('🏑 Iniciando migración a Vercel Database...\n');
  
  try {
    // Crear tabla de migraciones si no existe
    await createMigrationsTable();
    
    // Cargar migraciones disponibles
    const migrations = await loadMigrations();
    console.log(`📦 Encontradas ${migrations.length} migraciones`);
    
    // Obtener migraciones ya ejecutadas
    const executedMigrations = await getExecutedMigrations();
    console.log(`🔍 ${executedMigrations.size} migraciones ya ejecutadas`);
    
    // Filtrar migraciones pendientes
    const pendingMigrations = migrations.filter(m => !executedMigrations.has(m.version));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No hay migraciones pendientes');
      return;
    }
    
    console.log(`📋 Ejecutando ${pendingMigrations.length} migraciones pendientes:\n`);
    
    // Ejecutar migraciones pendientes
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    
    // Mostrar resumen
    const finalExecuted = await getExecutedMigrations();
    console.log(`📊 Total de migraciones ejecutadas: ${finalExecuted.size}`);
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1] === __filename) {
  runMigrations().catch(console.error);
}

export { runMigrations };
