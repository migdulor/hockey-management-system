# 🏒 Hockey Management System

Sistema integral de gestión de equipos de hockey con arquitectura hexagonal.

## 🏗️ Arquitectura

- **Frontend**: React + TypeScript + Vercel
- **Backend**: Node.js + Express + Railway (Arquitectura Hexagonal)
- **Database**: PostgreSQL en Railway
- **Payments**: MercadoPago + Facturación AFIP
- **Storage**: Cloudinary para imágenes

## 🚀 Deploy Automático

- **Frontend**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/migdulor/hockey-management-system/tree/main/frontend)
- **Backend**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/postgres)

## 📋 Funcionalidades

### ✅ Gestión de Equipos
- Crear equipos ilimitados (30 días prueba gratuita)
- Gestión de jugadores con fotos
- Máximo 2 equipos por jugador del mismo club
- Posiciones específicas (Arquera, Defensora, Volante, Delantera)

### ✅ Formaciones Tácticas
- Editor visual drag & drop
- Selección de 20 jugadores por partido (11 titulares + 9 suplentes)
- Exportar formaciones como imagen
- Copiar formaciones anteriores

### ✅ Gestión de Partidos
- Cronometraje preciso (4 cuartos de 15 minutos)
- Registro de acciones en tiempo real
- Modo offline durante partidos
- Control de cambios y tarjetas
- Shootouts para desempate

### ✅ Estadísticas y Reportes
- Reportes de asistencias con gráficos
- Estadísticas detalladas de partidos
- Mapas de calor por zonas de cancha
- Estadísticas individuales de jugadores
- Exportación a PDF

### ✅ Sistema de Facturación (Argentina)
- **$10,000 ARS por equipo/mes** (IVA incluido)
- 30 días de prueba gratuita
- Facturación electrónica AFIP
- Integración MercadoPago
- Eliminación de datos al cancelar

## 🛠️ Desarrollo Local

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Base de Datos
```bash
# Ejecutar migraciones
cd backend
npm run migrate

# Cargar datos de prueba
npm run seed
```

## 🏗️ Arquitectura Hexagonal

```
backend/src/
├── core/              # 🔵 DOMINIO (Reglas de negocio)
│   ├── entities/      # Entidades de negocio
│   ├── repositories/  # Interfaces (puertos)
│   └── services/      # Servicios de dominio
├── application/       # 🟡 CASOS DE USO
│   ├── use-cases/     # Lógica de aplicación
│   └── dtos/          # Data Transfer Objects
├── infrastructure/    # 🟢 ADAPTADORES
│   ├── database/      # PostgreSQL
│   ├── security/      # Auth & Security
│   └── external/      # APIs externas
└── interfaces/        # 🔴 CONTROLADORES
    └── http/          # REST API
```

## 📊 Base de Datos

### Entidades Principales
- **Users** (Entrenadores)
- **Teams** (Equipos)
- **Players** (Jugadores)
- **Formations** (Formaciones)
- **Matches** (Partidos)
- **MatchActions** (Acciones de partido)
- **Attendance** (Asistencias)
- **Billing** (Facturación)

## 🔐 Autenticación

- JWT Tokens
- Bcrypt para passwords
- Middleware de autorización
- Validación de permisos por equipo

## 📱 Características Técnicas

### Frontend
- React 18 con Hooks
- React Router para navegación
- Axios para API calls
- Chart.js para gráficos
- React DnD para formaciones
- PWA para uso offline

### Backend
- Express.js con middleware personalizado
- Validación con Joi
- Logs con Winston
- Rate limiting
- Helmet para seguridad
- Compression y CORS

### Base de Datos
- PostgreSQL con índices optimizados
- Migraciones automáticas
- Soft deletes para auditoría
- Constraints de negocio
- Backup automático

## 🌍 Deployment

### Variables de Entorno

**Backend (.env):**
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=cloudinary://...
MERCADOPAGO_ACCESS_TOKEN=...
AFIP_CERT_PATH=...
```

**Frontend (.env):**
```bash
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_ENVIRONMENT=production
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

## 📚 Documentación

- [Arquitectura Hexagonal](docs/architecture/README.md)
- [API Documentation](docs/api/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Facturación AFIP](docs/billing/README.md)

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
- **Email**: migdulor@hotmail.com
- **GitHub**: [@migdulor](https://github.com/migdulor)

---

⭐ **¡Dale una estrella al proyecto si te parece útil!** ⭐