import pkg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const { Pool } = pkg;

// Configuración de la base de datos (Vercel Postgres)
const dbConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
};

let pool: pkg.Pool | null = null;

export const getDbPool = (): pkg.Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    pool.on('connect', () => {
      console.log('✅ Conexión exitosa a PostgreSQL');
    });
    
    pool.on('error', (err) => {
      console.error('❌ Error en la conexión a PostgreSQL:', err);
    });
  }
  
  return pool;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = getDbPool();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Test de conexión exitoso:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Error en test de conexión:', error);
    return false;
  }
};
