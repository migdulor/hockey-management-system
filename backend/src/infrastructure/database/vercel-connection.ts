import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔄 Configurando conexión con Vercel Database...');

// Función para probar la conexión a Vercel Postgres
export const testVercelConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Probando conexión a Vercel Postgres...');
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Conexión exitosa a Vercel Postgres');
    console.log('⏰ Tiempo actual:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Vercel Postgres:', error);
    return false;
  }
};

// Función para probar la conexión a Vercel KV
export const testVercelKV = async (): Promise<boolean> => {
  try {
    console.log('🧪 Probando conexión a Vercel KV...');
    await kv.set('test-connection', 'success', { ex: 60 }); // Expire en 60 segundos
    const result = await kv.get('test-connection');
    if (result === 'success') {
      console.log('✅ Conexión exitosa a Vercel KV');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error conectando a Vercel KV:', error);
    return false;
  }
};

// Función para inicializar todas las conexiones
export const initializeVercelConnections = async (): Promise<void> => {
  console.log('🚀 Inicializando conexiones de Vercel...');
  
  const postgresOk = await testVercelConnection();
  const kvOk = await testVercelKV();
  
  if (postgresOk && kvOk) {
    console.log('🎯 Todas las conexiones de Vercel inicializadas correctamente');
  } else {
    console.warn('⚠️ Algunas conexiones fallaron - el sistema puede funcionar en modo degradado');
  }
};

// Exportar sql y kv para uso en otros archivos
export { sql, kv };
