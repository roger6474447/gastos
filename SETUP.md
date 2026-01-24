# Guía de Configuración - Sistema de Registro de Gastos

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
2. **MySQL 8.0+** - [Descargar aquí](https://dev.mysql.com/downloads/mysql/)
3. **XAMPP** (opcional, incluye MySQL) - [Descargar aquí](https://www.apachefriends.org/)

## Paso 1: Iniciar MySQL

### Opción A: Usando XAMPP
1. Abre el Panel de Control de XAMPP
2. Inicia el servicio **MySQL**
3. Verifica que esté corriendo (luz verde)

### Opción B: MySQL Standalone
```bash
# Windows - Iniciar servicio MySQL
net start MySQL80

# Verificar que está corriendo
mysql --version
```

## Paso 2: Crear la Base de Datos

Abre MySQL desde la terminal o phpMyAdmin:

```bash
# Conectar a MySQL
mysql -u root -p
# (presiona Enter si no hay contraseña)
```

Luego ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS gastos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gastos_db
JWT_SECRET=mi_secreto_jwt_super_seguro_cambiar_en_produccion_12345
PORT=3000
UPLOAD_DIR=uploads
```

**Importante:** Si tu MySQL tiene contraseña, agrégala en `DB_PASSWORD`.

## Paso 4: Inicializar la Base de Datos

Desde la carpeta `backend/`, ejecuta:

```bash
npm run init-db
```

Deberías ver:
```
✅ Database initialized successfully!
📝 Default users created:
   Admin: admin / admin123
   User: usuario / user123
```

## Paso 5: Iniciar el Backend

En una terminal, desde la carpeta `backend/`:

```bash
npm start
```

Deberías ver:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3000
```

## Paso 6: Iniciar el Frontend

En **otra terminal**, desde la carpeta `frontend/`:

```bash
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Paso 7: Acceder a la Aplicación

1. Abre tu navegador en: **http://localhost:5173**
2. Inicia sesión con las credenciales de prueba:
   - **Admin:** `admin` / `admin123`
   - **Usuario:** `usuario` / `user123`

## Solución de Problemas

### Error: "ECONNREFUSED" o "Database connection failed"
- ✅ Verifica que MySQL esté corriendo
- ✅ Revisa las credenciales en el archivo `.env`
- ✅ Asegúrate de que la base de datos `gastos_db` existe

### Error: "Port 3000 already in use"
- Cambia el puerto en `backend/.env`: `PORT=3001`
- Actualiza el proxy en `frontend/vite.config.js`

### Error: "Cannot find module"
- Ejecuta `npm install` en ambas carpetas (backend y frontend)

### La página no carga en el navegador
- Verifica que ambos servidores (backend y frontend) estén corriendo
- Revisa la consola del navegador para errores
- Asegúrate de estar en http://localhost:5173 (no 3000)

## Estructura de Carpetas

```
sistemaweb-registrogastos/
├── backend/
│   ├── config/          # Configuración de BD
│   ├── middleware/      # Autenticación
│   ├── routes/          # Endpoints API
│   ├── utils/           # Utilidades
│   ├── uploads/         # Imágenes subidas
│   ├── .env             # Variables de entorno
│   ├── server.js        # Servidor principal
│   └── init-db.js       # Script de inicialización
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── context/     # Estado global
│   │   └── utils/       # Utilidades
│   └── index.html
└── README.md
```

## Próximos Pasos

1. **Registra tu primer gasto** usando el formulario
2. **Sube una foto de factura** desde tu móvil
3. **Genera reportes** filtrados por período
4. **Exporta a PDF o Excel** para análisis

## Notas de Seguridad

⚠️ **Importante para Producción:**
- Cambia el `JWT_SECRET` en `.env` por uno más seguro
- Usa contraseñas fuertes para los usuarios
- Configura HTTPS en el servidor
- Actualiza las dependencias regularmente

## Soporte

Si encuentras algún problema, verifica:
1. Que MySQL esté corriendo
2. Que las dependencias estén instaladas
3. Que los puertos 3000 y 5173 estén disponibles
4. Los logs en la consola del backend y frontend
