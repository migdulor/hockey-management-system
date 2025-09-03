const { sql } = require('@vercel/postgres');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test simple query
        const testQuery = await sql`SELECT version()`;
        console.log('✅ Connection successful:', testQuery.rows[0].version);
        
        // Try to add columns
        console.log('Adding team_jersey_photo column to teams...');
        await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_jersey_photo TEXT`;
        console.log('✅ team_jersey_photo column added');
        
        console.log('Adding player_photo column to players...');
        await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS player_photo TEXT`;
        console.log('✅ player_photo column added');
        
        // Verify columns exist
        const columnsCheck = await sql`
            SELECT column_name, table_name 
            FROM information_schema.columns 
            WHERE table_name IN ('teams', 'players') 
            AND column_name IN ('team_jersey_photo', 'player_photo')
            ORDER BY table_name, column_name
        `;
        
        console.log('✅ Columns verification:', columnsCheck.rows);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testConnection();
