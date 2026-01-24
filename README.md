# Sistema Web de Registro de Gastos

Aplicación web completa para gestionar y registrar gastos de compras con autenticación, carga de imágenes de facturas, y generación de reportes en PDF/Excel.

## Características

- 🔐 **Autenticación**: Sistema con roles de Usuario y Administrador
- 📝 **Registro de Gastos**: Formulario con cálculo automático de totales
- 📸 **Carga de Imágenes**: Optimizada para dispositivos móviles con compresión automática
- 📊 **Reportes**: Filtros por día, mes y año con exportación a PDF y Excel
- 👥 **Control de Permisos**: Usuarios ven solo sus gastos, administradores ven todos
- 📱 **Responsive**: Funcional en móviles, tablets y escritorio

## Tecnologías

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios
- jsPDF & xlsx (exportación)

### Backend
- Node.js + Express
- MySQL
- JWT (autenticación)
- Multer + Sharp (manejo de imágenes)

## Requisitos Previos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

## Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sistemaweb-registrogastos
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gastos_db
JWT_SECRET=tu_secreto_jwt_seguro
PORT=3000
```

Crear la base de datos:
```bash
mysql -u root -p < config/schema.sql
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

## Ejecución

### Iniciar Backend
```bash
cd backend
npm start
```
El servidor estará en `http://localhost:3000`

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
La aplicación estará en `http://localhost:5173`

## Credenciales por Defecto

- **Administrador**: `admin` / `admin123`
- **Usuario**: `usuario` / `user123`

## Estructura del Proyecto

```
sistemaweb-registrogastos/
├── backend/
│   ├── config/          # Configuración de BD
│   ├── middleware/      # Autenticación JWT
│   ├── routes/          # Endpoints API
│   ├── utils/           # Procesamiento de imágenes
│   └── server.js        # Servidor Express
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── context/     # Estado global
│   │   └── utils/       # Utilidades (API, exportación)
│   └── index.html
└── README.md
```

## Uso

1. **Login**: Accede con las credenciales por defecto
2. **Registrar Gasto**: Completa el formulario y sube la foto de la factura
3. **Ver Reportes**: Filtra por período y exporta a PDF o Excel
4. **Gestión**: Los administradores pueden ver todos los gastos

## Licencia

MIT
