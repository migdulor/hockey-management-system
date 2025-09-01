#!/usr/bin/env node

// 🔑 Script para configurar bypass token automáticamente
// Uso: node setup-bypass-token.js TU_TOKEN_AQUI

const fs = require('fs');
const path = require('path');

const token = process.argv[2];

if (!token) {
    console.log(`
🔑 CONFIGURAR BYPASS TOKEN

Uso: node setup-bypass-token.js TU_BYPASS_TOKEN

Pasos para obtener el token:
1. Ve a https://vercel.com/migdulors-projects/hockey-management/settings/deployment-protection
2. Busca "Protection Bypass for Automation" 
3. Copia el token generado
4. Ejecuta: node setup-bypass-token.js [TU_TOKEN]

⚠️  El token debe tener 32 caracteres
`);
    process.exit(1);
}

if (token.length !== 32) {
    console.log('❌ Error: El token debe tener exactamente 32 caracteres');
    process.exit(1);
}

try {
    let filesUpdated = 0;

    // 1. Actualizar frontend/login.html
    const loginPath = path.join(__dirname, 'frontend', 'login.html');
    if (fs.existsSync(loginPath)) {
        let loginContent = fs.readFileSync(loginPath, 'utf8');
        const originalContent = loginContent;
        
        // Reemplazar diferentes variaciones del token
        loginContent = loginContent.replace(
            "const VERCEL_BYPASS_TOKEN = 'TU_TOKEN_AQUI';",
            `const VERCEL_BYPASS_TOKEN = '${token}';`
        );
        loginContent = loginContent.replace(
            /const VERCEL_BYPASS_TOKEN = '[a-f0-9]{32}';/g,
            `const VERCEL_BYPASS_TOKEN = '${token}';`
        );
        loginContent = loginContent.replace(
            /const VERCEL_BYPASS_TOKEN = 'fc85dada1b5dc5394adba665f545be20';/g,
            `const VERCEL_BYPASS_TOKEN = '${token}';`
        );
        
        if (originalContent !== loginContent) {
            fs.writeFileSync(loginPath, loginContent);
            console.log('✅ frontend/login.html actualizado');
            filesUpdated++;
        } else {
            console.log('ℹ️  frontend/login.html ya tiene el token correcto');
        }
    } else {
        console.log('⚠️  frontend/login.html no encontrado');
    }

    // 2. Actualizar frontend/admin.html si existe
    const adminPath = path.join(__dirname, 'frontend', 'admin.html');
    if (fs.existsSync(adminPath)) {
        let adminContent = fs.readFileSync(adminPath, 'utf8');
        const originalAdminContent = adminContent;
        
        adminContent = adminContent.replace(
            /const VERCEL_BYPASS_TOKEN = '[^']*';/g,
            `const VERCEL_BYPASS_TOKEN = '${token}';`
        );
        
        if (originalAdminContent !== adminContent) {
            fs.writeFileSync(adminPath, adminContent);
            console.log('✅ frontend/admin.html actualizado');
            filesUpdated++;
        }
    }

    // 3. Crear/actualizar vercel-config.js con URLs limpias
    const configPath = path.join(__dirname, 'vercel-config.js');
    const configContent = `// 🔧 Configuración de Vercel para Hockey Management System
// Bypass token para testing automático con URLs limpias

module.exports = {
    BYPASS_TOKEN: '${token}',
    PROJECT_URL: 'https://hockey-management.vercel.app',
    API_BASE: '/api',
    
    // Headers para requests autenticados
    getBypassHeaders: () => ({
        'x-vercel-protection-bypass': '${token}',
        'Content-Type': 'application/json'
    }),
    
    // URL con bypass token - ahora con URLs limpias (sin /frontend)
    getBypassUrl: (path = '') => \`https://hockey-management.vercel.app\${path}?_vercel_share=${token}\`,
    
    // URLs directas de las páginas principales
    urls: {
        login: \`https://hockey-management.vercel.app/login.html?_vercel_share=${token}\`,
        admin: \`https://hockey-management.vercel.app/admin.html?_vercel_share=${token}\`,
        teams: \`https://hockey-management.vercel.app/teams.html?_vercel_share=${token}\`,
        dashboard: \`https://hockey-management.vercel.app/dashboard.html?_vercel_share=${token}\`
    }
};`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ vercel-config.js creado/actualizado con URLs limpias');
    filesUpdated++;

    console.log(`
🎉 ¡Bypass token configurado exitosamente!

Token: ${token}
Archivos actualizados: ${filesUpdated}

✨ URLs LIMPIAS CONFIGURADAS:
• Login: https://hockey-management.vercel.app/login.html?_vercel_share=${token}
• Admin: https://hockey-management.vercel.app/admin.html?_vercel_share=${token}
• Teams: https://hockey-management.vercel.app/teams.html?_vercel_share=${token}

Próximos pasos:
1. Despliega a Vercel: vercel --prod
2. Prueba las nuevas URLs limpias (sin /frontend/)
3. Las redirecciones automáticas funcionarán con las URLs limpias

💡 Usa vercel-config.js para obtener URLs y headers automáticamente.
`);

} catch (error) {
    console.error('❌ Error configurando bypass token:', error.message);
    process.exit(1);
}
