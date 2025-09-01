// 🔧 Configuración de Vercel para Hockey Management System
// Bypass token para testing automático con URLs limpias

module.exports = {
    BYPASS_TOKEN: 'fc85dada1b5dc5394adba665f545be20',
    PROJECT_URL: 'https://hockey-management.vercel.app',
    API_BASE: '/api',
    
    // Headers para requests autenticados
    getBypassHeaders: () => ({
        'x-vercel-protection-bypass': 'fc85dada1b5dc5394adba665f545be20',
        'Content-Type': 'application/json'
    }),
    
    // URL con bypass token - ahora con URLs limpias (sin /frontend)
    getBypassUrl: (path = '') => `https://hockey-management.vercel.app${path}?_vercel_share=fc85dada1b5dc5394adba665f545be20`,
    
    // URLs directas de las páginas principales
    urls: {
        login: `https://hockey-management.vercel.app/login.html?_vercel_share=fc85dada1b5dc5394adba665f545be20`,
        admin: `https://hockey-management.vercel.app/admin.html?_vercel_share=fc85dada1b5dc5394adba665f545be20`,
        teams: `https://hockey-management.vercel.app/teams.html?_vercel_share=fc85dada1b5dc5394adba665f545be20`,
        dashboard: `https://hockey-management.vercel.app/dashboard.html?_vercel_share=fc85dada1b5dc5394adba665f545be20`
    }
};