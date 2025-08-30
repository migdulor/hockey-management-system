#!/usr/bin/env ts-node
/**
 * 🏑 Hockey Management System - Verificación de Configuración
 * 
 * Verifica que todas las variables de entorno estén configuradas
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface ConfigCheck {
  name: string;
  value: string | undefined;
  required: boolean;
  category: string;
}

function checkConfiguration(): void {
  console.log('🏑 Hockey Management System - Verificación de Configuración\n');

  const checks: ConfigCheck[] = [
    // Vercel Postgres (Requeridas)
    { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL, required: true, category: 'Postgres' },
    { name: 'POSTGRES_PRISMA_URL', value: process.env.POSTGRES_PRISMA_URL, required: true, category: 'Postgres' },
    { name: 'POSTGRES_URL_NO_SSL', value: process.env.POSTGRES_URL_NO_SSL, required: true, category: 'Postgres' },
    { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING, required: true, category: 'Postgres' },
    { name: 'POSTGRES_USER', value: process.env.POSTGRES_USER, required: true, category: 'Postgres' },
    { name: 'POSTGRES_HOST', value: process.env.POSTGRES_HOST, required: true, category: 'Postgres' },
    { name: 'POSTGRES_PASSWORD', value: process.env.POSTGRES_PASSWORD, required: true, category: 'Postgres' },
    { name: 'POSTGRES_DATABASE', value: process.env.POSTGRES_DATABASE, required: true, category: 'Postgres' },
    
    // App Config
    { name: 'NODE_ENV', value: process.env.NODE_ENV, required: true, category: 'App' },
    { name: 'PORT', value: process.env.PORT, required: false, category: 'App' },
    
    // Vercel KV (Opcionales)
    { name: 'KV_URL', value: process.env.KV_URL, required: false, category: 'KV Cache' },
    { name: 'KV_REST_API_URL', value: process.env.KV_REST_API_URL, required: false, category: 'KV Cache' },
    { name: 'KV_REST_API_TOKEN', value: process.env.KV_REST_API_TOKEN, required: false, category: 'KV Cache' },
    
    // Vercel Blob (Opcional)
    { name: 'BLOB_READ_WRITE_TOKEN', value: process.env.BLOB_READ_WRITE_TOKEN, required: false, category: 'Blob Storage' },
  ];

  const categories = [...new Set(checks.map(c => c.category))];
  let hasErrors = false;
  let hasWarnings = false;

  for (const category of categories) {
    console.log(`📋 ${category}:`);
    
    const categoryChecks = checks.filter(c => c.category === category);
    
    for (const check of categoryChecks) {
      const hasValue = check.value && check.value.trim() !== '';
      
      if (check.required) {
        if (hasValue) {
          const maskedValue = check.value!.length > 20 ? 
            check.value!.substring(0, 20) + '...' : check.value!;
          console.log(`   ✅ ${check.name}: ${maskedValue}`);
        } else {
          console.log(`   ❌ ${check.name}: FALTANTE (REQUERIDA)`);
          hasErrors = true;
        }
      } else {
        if (hasValue) {
          const maskedValue = check.value!.length > 20 ? 
            check.value!.substring(0, 20) + '...' : check.value!;
          console.log(`   ✅ ${check.name}: ${maskedValue}`);
        } else {
          console.log(`   ⚠️  ${check.name}: No configurada (opcional)`);
          hasWarnings = true;
        }
      }
    }
    console.log('');
  }

  // Resumen
  console.log('📊 RESUMEN:');
  
  if (hasErrors) {
    console.log('❌ CONFIGURACIÓN INCOMPLETA - Variables requeridas faltantes');
    console.log('\n🔧 Para solucionarlo:');
    console.log('1. Ve a tu Vercel Dashboard');
    console.log('2. Storage → Postgres → .env.local tab');
    console.log('3. Copia las variables POSTGRES_* a tu archivo .env');
    console.log('4. Ejecuta nuevamente: npm run check:config');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  CONFIGURACIÓN BÁSICA COMPLETA - Algunas variables opcionales no configuradas');
    console.log('✅ Puedes proceder con la migración');
    process.exit(0);
  } else {
    console.log('🎉 CONFIGURACIÓN COMPLETA - Todas las variables configuradas');
    console.log('✅ Listo para ejecutar migración');
    process.exit(0);
  }
}

// Test de conexión básico
async function testConnection(): Promise<void> {
  console.log('🔌 Probando conexión a base de datos...');
  
  try {
    const { sql } = await import('@vercel/postgres');
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Conexión exitosa');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.log('\n🔧 Posibles soluciones:');
    console.log('- Verifica que las variables POSTGRES_* sean correctas');
    console.log('- Asegúrate de que la base de datos esté activa en Vercel');
    console.log('- Revisa tu conexión a internet');
  }
}

// Ejecutar verificación
if (process.argv[1] === __filename) {
  checkConfiguration();
  
  // Si la configuración es correcta, probar conexión
  if (process.argv.includes('--test-connection')) {
    testConnection();
  }
}
