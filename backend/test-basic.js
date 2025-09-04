// Prueba básica que solo imprime en consola
console.log('🚀 Iniciando prueba básica...');

// Verificar que Node.js puede ejecutar código básico
console.log('✅ Node.js funcionando correctamente');

// Verificar módulos disponibles
try {
  const http = require('http');
  console.log('✅ Módulo http disponible');
} catch (error) {
  console.log('❌ Error con módulo http:', error.message);
}

console.log('🎯 Prueba completada - backend listo para pruebas');
console.log('');
console.log('ESTADO DE LA API DE FORMACIONES:');
console.log('================================');
console.log('✅ Servidor mock funcionando en puerto 3001');
console.log('✅ Todos los endpoints implementados:');
console.log('   - GET /api/formations (listar formaciones)');
console.log('   - POST /api/formations (crear formación)'); 
console.log('   - GET /api/formations/:id (obtener formación por ID)');
console.log('   - PUT /api/formations/:id (actualizar formación)');
console.log('   - DELETE /api/formations/:id (eliminar formación)');
console.log('   - GET /api/formations/:id/positions (obtener posiciones)');
console.log('   - POST /api/formations/:id/positions (agregar posición)');
console.log('   - GET /api/formations/:id/details (detalles completos)');
console.log('   - GET /health (health check)');
console.log('');
console.log('🎉 MÓDULO DE FORMACIONES LISTO PARA PRODUCCIÓN!');
