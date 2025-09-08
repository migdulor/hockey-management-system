const fs = require('fs');
const path = require('path');

// Leer el archivo dashboard.html
const dashboardPath = path.join(__dirname, 'frontend', 'dashboard.html');
let content = fs.readFileSync(dashboardPath, 'utf8');

// Reemplazar todas las URLs de API relativas por URLs que usen API_BASE_URL
// Buscar patrones como '/api/algo' y reemplazarlos por '${API_BASE_URL}/api/algo'
content = content.replace(/fetch\(\s*['"`]\/api\//g, 'fetch(`${API_BASE_URL}/api/');
content = content.replace(/fetch\(\s*`\/api\//g, 'fetch(`${API_BASE_URL}/api/');

// También reemplazar casos donde se construye la URL con template literals
content = content.replace(/`\/api\//g, '`${API_BASE_URL}/api/');

// Guardar el archivo actualizado
fs.writeFileSync(dashboardPath, content, 'utf8');

console.log('✅ URLs de API actualizadas en dashboard.html');
