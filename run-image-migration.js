const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function runMigration() {
    try {
        const migrationSQL = fs.readFileSync('./add-image-fields.sql', 'utf8');
        console.log('Ejecutando migración para campos de imagen...');
        
        await sql.unsafe(migrationSQL);
        console.log('✅ Migración completada exitosamente');
        
        // Verificar que se agregaron los campos
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('teams', 'players') 
            AND column_name IN ('team_jersey_photo', 'player_photo')
            ORDER BY table_name, column_name
        `;
        
        console.log('✅ Campos agregados:', result.rows);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
    }
}

runMigration();
