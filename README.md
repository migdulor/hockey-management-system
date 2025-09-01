# 🏒 Hockey Management System

Sistema integral de gestión de equipos de hockey para entrenadores y coaches.

## 🌐 Demo en Vivo

**🔗 Aplicación**: https://hockey-management.vercel.app/

### Credenciales de Prueba:
- **Admin**: admin@hockeymanagement.com / admin123
- **Coach**: cualquier email de coach existente / password123

## 🏗️ Arquitectura Técnica

- **Frontend**: HTML + CSS + JavaScript (Vanilla)
- **Backend**: Node.js + Express + TypeScript  
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel
- **Authentication**: JWT Tokens

## 📋 Funcionalidades Implementadas

### ✅ **Sistema de Autenticación**
- Login diferenciado por roles (Admin/Coach)
- JWT tokens con middleware de seguridad
- Dashboard personalizado por rol

### ✅ **Gestión de Divisiones**
- Divisiones diferenciadas por género (masculino/femenino)
- Configuración de máximo equipos por división
- Gestión completa CRUD de divisiones

### ✅ **Gestión de Equipos**
- Crear equipos asignados a divisiones específicas
- Filtrado automático por género de división
- Visualización con tarjetas informativas
- Contador en tiempo real de jugadores por equipo

### ✅ **Gestión de Jugadores**
- Sistema completo de jugadores con datos personalizados
- **Posiciones diferenciadas por género**:
  - **Femenino**: Portera, Arquera, Defensora, Mediocampista, Delantera
  - **Masculino**: Portero, Arquero, Defensor, Mediocampista, Delantero
- Relación many-to-many entre equipos y jugadores
- Información detallada: nombre, apodo, posición, número de camiseta, titular/suplente

### ✅ **Importación Excel**
- **Funcionalidad de importación masiva desde Excel**
- Formato específico con columnas: `Nombre | Apodo | Posición | Número de Camiseta | Es Titular`
- Validación automática de datos y posiciones según género
- Procesamiento por lotes con reporte de éxitos/errores
- Interfaz intuitiva con instrucciones detalladas

### ✅ **Base de Datos Optimizada**
- **Tablas principales**: users, divisions, teams, players, team_players, training_sessions, training_attendances
- Relaciones normalizadas y constraints de integridad
- Índices optimizados para consultas frecuentes
- Junction table para relación equipos-jugadores

## 🚀 Estado del Proyecto

### **Módulos Completamente Funcionales:**
- ✅ Autenticación y autorización
- ✅ Gestión de divisiones
- ✅ Gestión de equipos
- ✅ Gestión de jugadores
- ✅ Importación Excel
- ✅ Dashboard administrativo

### **Módulos Planificados (Próximas Implementaciones):**
- 📋 **Asistencias**: Registro de asistencias por fecha y equipo
- 🏑 **Formaciones**: Editor visual drag & drop en cancha
- ⚽ **Partidos**: Gestión de partidos y estadísticas
- 📊 **Reportes**: Estadísticas avanzadas y reportes

## 🛠️ Desarrollo Local

## 🛠️ Desarrollo Local

### Requisitos
- Node.js 18+
- PostgreSQL 14+ (o cuenta Neon)
- Git

### Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run migrate

# Iniciar servidor de desarrollo
npm run dev
```

### Frontend
```bash
# El frontend está en archivos estáticos HTML
# Servir desde backend o usar live server
cd frontend
# Abrir dashboard.html en navegador
```

### Base de Datos
```bash
# Estructura actual de tablas:
# - users (administradores y coaches)
# - divisions (divisiones por género)
# - teams (equipos asignados a divisiones)
# - players (jugadores individuales)
# - team_players (relación equipos-jugadores)
# - training_sessions, training_attendances (futuras implementaciones)
```

## 🌍 Deployment

### Variables de Entorno Requeridas

**Backend:**
```bash
NODE_ENV=production
POSTGRES_URL=postgresql://user:password@host/database
JWT_SECRET=your_jwt_secret_key
```

### Deployment en Vercel
```bash
# Deploy manual
vercel --prod

# Configurar alias personalizado
vercel alias [deployment-url] hockey-management.vercel.app
```

## 📊 Estructura de la Base de Datos

### Esquema Principal
```sql
-- Usuarios del sistema
users (id, email, password, role, created_at)

-- Divisiones por género
divisions (id, name, gender, max_teams, created_at)

-- Equipos asignados a divisiones
teams (id, name, division_id, coach_id, created_at)

-- Jugadores individuales
players (id, name, nickname, position, jersey_number, created_at)

-- Relación equipos-jugadores (many-to-many)
team_players (team_id, player_id, is_starter, joined_at)
```

## 🔐 Seguridad Implementada

- **JWT Authentication**: Tokens seguros con expiración
- **Password Hashing**: Bcrypt para encriptación
- **Role-based Access**: Diferenciación admin/coach
- **Input Validation**: Sanitización de datos de entrada
- **CORS Configuration**: Configuración para producción

## 🎯 Funcionalidades Destacadas

### **Importación Excel Avanzada**
- Lectura de archivos .xlsx y .xls
- Validación de formato y estructura
- Procesamiento por lotes con manejo de errores
- Integración automática con equipos existentes

### **Gestión Inteligente por Género**
- Posiciones automáticamente diferenciadas
- Interfaz adaptativa según contexto
- Validaciones específicas por género

### **Dashboard Responsivo**
- Interfaz moderna y intuitiva
- Navegación por tabs fluida
- Feedback visual en tiempo real

## 🧪 Testing

```bash
# Verificar conexión a base de datos
node backend/check-divisions.ts

# Probar endpoints principales
curl -X GET http://localhost:3000/api/divisions
curl -X POST http://localhost:3000/api/auth/login
```

## � Próximas Implementaciones

### 📋 Módulo de Asistencias
- Registro de asistencias por fecha y equipo
- Estados: Presente, Tarde, Ausente
- Observaciones personalizadas por jugadora
- Reportes históricos de participación

### 🏑 Módulo de Formaciones
- Editor visual drag & drop en cancha
- Fotos de jugadoras en posiciones
- Datos del partido (rival, cancha, fecha)
- Exportación como imagen
- Plantillas reutilizables

### ⚽ Gestión de Partidos
- Registro completo de partidos
- Estadísticas en tiempo real
- Control de cambios y sustituciones
- Cronómetro y marcador

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit changes (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Desarrollador**: Miguel Dulor
- **GitHub**: [@migdulor](https://github.com/migdulor)
- **Proyecto**: [Hockey Management System](https://github.com/migdulor/hockey-management-system)

## 🏆 Características del Proyecto

### ✨ **Lo que hace único a este sistema:**

1. **🎯 Especializado en Hockey**: Posiciones y reglas específicas del deporte
2. **👥 Gestión por Género**: Diferenciación automática masculino/femenino
3. **📊 Importación Excel**: Carga masiva de jugadores con validación inteligente
4. **🔄 Arquitectura Escalable**: Preparado para futuras funcionalidades
5. **🚀 Deploy Automático**: Integración continua con Vercel
6. **💾 Base de Datos Robusta**: PostgreSQL con relaciones optimizadas

---

⭐ **¡Dale una estrella al proyecto si te parece útil!** ⭐

**🔗 Demo Live**: https://hockey-management.vercel.app/