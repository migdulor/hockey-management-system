# Hockey Management System

Sistema completo de gestión de hockey con arquitectura hexagonal.

## 📁 Estructura del Proyecto

```
hockey-management-system/
├── 📂 backend/                          # API Backend (Node.js + Express)
│   ├── 📂 src/
│   │   ├── 📂 core/                     # 🏛️ NÚCLEO DE DOMINIO
│   │   │   ├── 📂 entities/            # Entidades de dominio
│   │   │   ├── 📂 services/            # Servicios de dominio
│   │   │   └── 📂 repositories/        # Interfaces de repositorios
│   │   │
│   │   ├── 📂 application/             # 🔧 CASOS DE USO
│   │   │   ├── 📂 services/            # Servicios de aplicación
│   │   │   └── 📂 use-cases/           # Casos de uso específicos
│   │   │
│   │   ├── 📂 infrastructure/          # 🛠️ INFRAESTRUCTURA
│   │   │   ├── 📂 database/            # Conexión y repositorios DB
│   │   │   │   ├── 📂 config/         # Configuración de BD
│   │   │   │   ├── 📂 repositories/   # Implementaciones concretas
│   │   │   │   ├── 📂 migrations/     # Migraciones de BD
│   │   │   │   └── connection.ts      # Conexión a PostgreSQL
│   │   │   ├── 📂 external-services/ # APIs externas (WhatsApp, etc.)
│   │   │   ├── 📂 monitoring/        # Logging y monitoreo
│   │   │   └── 📂 security/          # Autenticación y autorización
│   │   │
│   │   ├── 📂 interfaces/             # 🌐 INTERFACES (HTTP, CLI, etc.)
│   │   │   └── 📂 http/
│   │   │       ├── 📂 controllers/   # Controladores HTTP
│   │   │       ├── 📂 routes/        # Rutas de la API
│   │   │       └── 📂 middlewares/   # Middlewares HTTP
│   │   │
│   │   └── 📂 shared/                 # 🤝 CÓDIGO COMPARTIDO
│   │       ├── 📂 utils/             # Utilidades generales
│   │       └── 📂 constants/         # Constantes del sistema
│   │
│   ├── 📂 tests/                      # Pruebas automatizadas
│   ├── 📂 dist/                       # Código compilado
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                           # Variables de entorno
│
├── 📂 frontend/                       # Frontend (React + Vite)
│   ├── 📂 src/
│   │   ├── 📂 components/            # Componentes React
│   │   ├── 📂 pages/                 # Páginas de la aplicación
│   │   ├── 📂 services/              # Servicios HTTP para API
│   │   ├── App.tsx                   # Componente principal
│   │   └── main.tsx                  # Punto de entrada
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── 📋 README.md                      # Documentación principal
└── 🔧 .gitignore                     # Archivos ignorados por Git
```

## 🏗️ Arquitectura Hexagonal

### Capas de la Arquitectura:

1. **🏛️ Core (Núcleo)**
   - Entidades de dominio
   - Lógica de negocio pura
   - Interfaces de repositorios

2. **🔧 Application (Aplicación)**
   - Casos de uso
   - Servicios de aplicación
   - Orquestación de la lógica

3. **🛠️ Infrastructure (Infraestructura)**
   - Implementaciones de repositorios
   - Conexiones a bases de datos
   - Servicios externos

4. **🌐 Interfaces (Interfaces)**
   - Controladores HTTP
   - Rutas de API
   - Middlewares

## 🚀 Servicios Disponibles

### Backend (Puerto 3001)
- ✅ CRUD completo de jugadores
- ✅ Gestión de equipos
- ✅ Sistema de formaciones
- ✅ Control de asistencias
- ✅ Reportes y estadísticas
- ✅ Integración con WhatsApp
- ✅ Sistema de pagos
- ✅ Machine Learning para análisis
- ✅ Importación masiva (CSV/JSON)

### Frontend (Puerto 3000)
- 🔧 En desarrollo
- Interface React con Vite
- Comunicación con API backend

## 🗄️ Base de Datos
- **PostgreSQL** en Railway Cloud
- SSL habilitado
- Migraciones automatizadas
- Conexión configurada y funcional

## 📊 Estado Actual
- ✅ **Servidor Backend**: FUNCIONANDO
- ✅ **Base de Datos**: CONECTADA
- ✅ **Arquitectura Hexagonal**: COMPLETA
- ✅ **CRUD Jugadores**: IMPLEMENTADO
- ✅ **Sistema de Importación**: FUNCIONAL
- 🔧 **Frontend**: CONFIGURADO (pendiente desarrollo)

## 🛠️ Comandos de Desarrollo

### Backend:
```bash
cd backend
npm start      # Inicia servidor
npm run dev    # Desarrollo con recarga automática
npm run build  # Compilar TypeScript
```

### Frontend:
```bash
cd frontend
npm install    # Instalar dependencias
npm run dev    # Servidor de desarrollo
```

## 🔗 Endpoints API

- `GET /health` - Estado del servidor
- `GET /api/players` - Obtener jugadores
- `POST /api/players` - Crear jugador
- `GET /api/players/:id` - Obtener jugador por ID
- `PUT /api/players/:id` - Actualizar jugador
- `DELETE /api/players/:id` - Eliminar jugador

¡El sistema está completamente funcional y listo para desarrollo! 🚀
