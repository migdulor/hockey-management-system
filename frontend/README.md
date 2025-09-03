# � Hockey Management System - Frontend

Sistema de gestión de hockey moderno y completo desarrollado con React, TypeScript y Vite.

## 🚀 Características

### ✅ Implementado
- **Sistema de Login** con credenciales demo
- **Dashboard Principal** con estadísticas y resumen
- **Gestión de Equipos** con CRUD completo
- **Interfaz Responsiva** adaptable a dispositivos móviles
- **Diseño Moderno** con componentes reutilizables
- **Estados de Carga** y manejo de errores
- **Navegación Intuitiva** entre módulos

### 🔄 En Desarrollo
- Gestión de Jugadores
- Programación de Partidos
- Sistema de Torneos
- Estadísticas Avanzadas
- Reportes y Análisis

## 🏗️ Arquitectura del Frontend

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   │   ├── LoginPage.tsx   # Página de inicio de sesión
│   │   ├── DashboardPage.tsx # Dashboard principal
│   │   └── TeamsPage.tsx   # Gestión de equipos
│   ├── services/           # Servicios API
│   │   └── api.ts         # Configuración de Axios
│   ├── styles/            # Estilos globales
│   │   └── globals.css    # CSS utilities (Tailwind-like)
│   ├── App.tsx            # Componente principal
│   └── main.tsx          # Punto de entrada
├── index.html             # Template HTML
├── vite.config.ts        # Configuración de Vite
└── package.json          # Dependencias y scripts
```

## 📱 Páginas y Funcionalidades

### 🔐 Login Page
- **Formulario de Login** con validación
- **Credenciales Demo**: `admin` / `password`
- **Mostrar/Ocultar Contraseña**
- **Indicadores de Carga**
- **Mensajes de Error**
- **Vista de Características** (Equipos, Partidos, Torneos)
- **Placeholder para QR Code**

### 📊 Dashboard
- **Estadísticas Generales**:
  - 12 Equipos Registrados
  - 8 Partidos Programados  
  - 3 Torneos Activos
  - 156 Jugadores Totales
- **Partidos Recientes** con estados
- **Próximos Eventos** con fechas
- **Acciones Rápidas** para cada módulo
- **Navegación Integrada**

### 👥 Gestión de Equipos
- **Vista de Tarjetas** con información completa
- **Búsqueda y Filtros** por nombre/entrenador
- **Estadísticas por Equipo** (victorias/derrotas/jugadores)
- **Modal de Detalles** con lista de jugadores
- **Formulario de Creación** de equipos
- **Acciones CRUD** (Ver, Editar, Eliminar)

## 🎨 Diseño y UX

### 🎯 Principios de Diseño
- **Minimalista y Limpio**: Interfaz sin distracciones
- **Colores Coherentes**: Paleta azul/gris profesional
- **Iconografía Clara**: Emojis y símbolos intuitivos
- **Feedback Visual**: Estados de hover, loading y errores
- **Responsive Design**: Adaptable a móviles y tablets

### 🎨 Paleta de Colores
```css
/* Primarios */
Azul Principal: #2563eb
Azul Hover: #1d4ed8
Azul Claro: #eff6ff

/* Grises */
Texto Principal: #111827
Texto Secundario: #6b7280
Fondo: #f9fafb
Tarjetas: #ffffff

/* Estados */
Éxito: #10b981
Advertencia: #f59e0b
Error: #dc2626
```

### 📐 Grid System
- **Mobile First**: Diseño adaptativo desde móvil
- **Grid CSS**: Layout flexible con `grid-cols-1/2/3/4`
- **Breakpoints Responsive**:
  - `sm`: >= 640px
  - `md`: >= 768px  
  - `lg`: >= 1024px

## 🔧 Configuración Técnica

### 📦 Dependencias Principales
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}
```

### ⚙️ Scripts Disponibles
```bash
npm run dev      # Desarrollo (puerto 3000)
npm run build    # Construcción para producción
npm run preview  # Vista previa de build
```

### 🔗 Configuración de Proxy
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

## 🚀 Instrucciones de Uso

### 1️⃣ Instalación
```bash
cd frontend
npm install
```

### 2️⃣ Desarrollo
```bash
npm run dev
```

### 3️⃣ Acceso
- **URL**: http://localhost:3000
- **Usuario**: admin
- **Contraseña**: password

## 🔮 Próximas Características

### 📅 Gestión de Partidos
- Programar nuevos partidos
- Calendario de eventos
- Resultados y marcadores
- Historial de encuentros

### 🏆 Sistema de Torneos
- Crear torneos personalizados
- Brackets y eliminatorias
- Clasificaciones automáticas
- Premios y reconocimientos

### 👤 Perfil de Jugadores
- Fichas individuales detalladas
- Estadísticas personales
- Historial de partidos
- Fotos y documentos

### 📊 Analytics Avanzado
- Gráficos interactivos
- Comparativas entre equipos
- Tendencias temporales
- Reportes exportables

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Estilos**: CSS personalizado (Tailwind-like)
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Routing**: Navegación manual (SPA)

## 👨‍💻 Desarrollo

### 📁 Estructura de Componentes
```typescript
// Ejemplo de componente típico
const ComponentName: React.FC = () => {
  const [state, setState] = useState<Type>('');
  
  const handleAction = () => {
    // Lógica del componente
  };

  return (
    <div className="component-container">
      {/* JSX del componente */}
    </div>
  );
};
```

### 🔄 Estado de la Aplicación
- **Auth State**: Token en localStorage
- **Page State**: Navegación sin router
- **Component State**: React useState hooks
- **Loading States**: Indicadores de carga
- **Error Handling**: Manejo de errores

## 📞 Soporte

Para preguntas o issues relacionados con el frontend:

- **Desarrollador**: Miguel Dulor
- **Email**: migdulor@hotmail.com
- **Proyecto**: Hockey Management System

---

**� ¡Disfruta gestionando tu liga de hockey!**
