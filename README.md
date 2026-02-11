# QualityFlow - Plataforma de Gestión de Calidad

QualityFlow es una aplicación web completa diseñada para la gestión de calidad en proyectos de software. Permite a los usuarios gestionar proyectos, checklists, tareas, métricas y auditorías de manera eficiente.

## 🚀 Características Principales

### 📊 Gestión de Proyectos
- **Creación y Edición**: Creación de proyectos con información detallada como nombre, descripción, fechas, presupuesto y equipo.
- **Roles de Usuario**: Soporte para múltiples roles (Product Owner, Project Manager, Team Member) con permisos diferenciados.
- **Métricas**: Seguimiento de métricas clave del proyecto como porcentaje de completitud, presupuesto consumido y tiempo.

### ✅ Checklists y Tareas
- **Checklists por Proyecto**: Cada proyecto tiene su propio conjunto de checklists.
- **Tareas**: Gestión de tareas con estados (Pendiente, En Progreso, Completada), prioridades y responsables.
- **Edición Visual**: Herramienta de edición visual para modificar checklists y tareas directamente en la interfaz.

### 👥 Gestión de Usuarios y Equipos
- **Autenticación**: Inicio de sesión seguro con Google OAuth y email.
- **Notificaciones**: Sistema de notificaciones en tiempo real para tareas asignadas.
- **Panel de Administración**: Gestión de usuarios, roles y permisos para administradores.

### 📋 Auditorías
- **Auditorías de Calidad**: Creación y gestión de auditorías con ítems y respuestas.
- **Historial de Auditorías**: Registro completo de todas las auditorías realizadas.

### 📈 Reportes y Analíticas
- **Dashboard General**: Vista panorámica del estado de todos los proyectos.
- **Reportes Detallados**: Generación de reportes en PDF para proyectos y auditorías.
- **Gráficos Interactivos**: Visualización de métricas y progreso.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Base44 (API y Base de Datos)
- **Autenticación**: Google OAuth
- **UI Components**: Radix UI, Lucide React
- **Testing**: Vitest

## ⚙️ Instalación y Configuración

### Requisitos Previos
- Node.js (v18 o superior)
- npm

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd qualityflow
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` y configura las siguientes variables:
   ```env
   VITE_TURSO_DATABASE_URL=your_turso_database_url
   VITE_TURSO_AUTH_TOKEN=your_turso_auth_token
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

## 📂 Estructura del Proyecto

```
qualityflow/
├── src/
│   ├── api/             # Conexiones a la API y Base de Datos
│   ├── components/      # Componentes reutilizables
│   ├── lib/             # Lógica de negocio y utilidades
│   ├── pages/           # Páginas de la aplicación
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Punto de entrada de la aplicación
├── public/              # Archivos estáticos
├── schema.sql           # Esquema de la base de datos
└── .env.example         # Plantilla de variables de entorno
```

## 🧪 Ejecutar Tests

Para ejecutar los tests unitarios:

```bash
npm run test
```

## 📝 Notas de Desarrollo

- La aplicación utiliza un sistema de autenticación basado en Base44.
- Se ha implementado un sistema de notificaciones para tareas asignadas.
- La aplicación incluye un modo de edición visual para modificar la estructura de la aplicación en tiempo real.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, crea un branch para tu feature y envía un pull request.

## 📄 Licencia

Este proyecto es de código cerrado y propiedad de sus desarrolladores.
