const bcrypt = require('bcrypt');

async function generatePasswordHashes() {
    const saltRounds = 12;
    
    const passwords = [
        { name: 'admin123', plain: 'admin123' },
        { name: 'coach123', plain: 'coach123' },
        { name: 'test123', plain: 'test123' }
    ];
    
    console.log('🔐 Generating password hashes with bcrypt (salt rounds: 12)\n');
    
    for (const pwd of passwords) {
        const hash = await bcrypt.hash(pwd.plain, saltRounds);
        console.log(`${pwd.name}:`);
        console.log(`  Plain: ${pwd.plain}`);
        console.log(`  Hash:  ${hash}`);
        console.log('');
    }
    
    console.log('✅ Copy these hashes to your SQL init script!');
}

generatePasswordHashes().catch(console.error);
