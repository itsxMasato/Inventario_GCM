# Inventario_GCM

Proyecto de gestión de inventario para Grupo Camaronero Milcien (GCM).

**Resumen:** Aplicación fullstack (frontend con Vite + React + Tailwind, backend en Node.js/Express) que utiliza Microsoft SQL Server como base de datos.

**Contenido del README:**
- **Requisitos**: software necesario para ejecutar el proyecto.
- **Esquema de base de datos**: script SQL para crear la base de datos y tablas.
- **Instalación y ejecución**: pasos para ejecutar frontend y backend.
- **Conexión a la base de datos**: cómo configurar `.env` y probar la conexión desde Node.js.
- **Buenas prácticas y recomendaciones**: sugerencias para producción, seguridad y mejoras.

**Requisitos**
- Node.js 16+ (recomendado 18+)
- npm o yarn
- Microsoft SQL Server (local o remoto)
- SQL Server Management Studio o Azure Data Studio (opcional)

**Tablas (sin comentarios)**

Guarda el siguiente script como `create_inventario_gcm.sql` y ejecútalo en tu servidor SQL (sustituye la IP/credenciales según corresponda).

```sql
use master
go

create database Inventario_GCM
go

use Inventario_GCM
go

CREATE TABLE Roles (
	id INT IDENTITY(1,1) PRIMARY KEY,
	name NVARCHAR(100) NOT NULL,
	description NVARCHAR(500) NULL,
	permissions NVARCHAR(MAX) NULL,
	createdAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Users (
	id INT IDENTITY(1,1) PRIMARY KEY,
	username NVARCHAR(100) NOT NULL UNIQUE,
	password NVARCHAR(200) NOT NULL,
	firstName NVARCHAR(100) NULL,
	lastName NVARCHAR(100) NULL,
	email NVARCHAR(200) NULL,
	identityNumber NVARCHAR(50) NULL,
	status NVARCHAR(20) DEFAULT 'active',
	roleId INT NULL,
	createdAt DATETIME DEFAULT GETDATE(),
	updatedAt DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (roleId) REFERENCES Roles(id)
);

CREATE TABLE Products (
	id INT IDENTITY(1,1) PRIMARY KEY,
	name NVARCHAR(200) NOT NULL,
	code NVARCHAR(50) UNIQUE NULL,
	description NVARCHAR(500) NULL,
	stock INT DEFAULT 0,
	min INT DEFAULT 10,
	unitPrice DECIMAL(10,2) NULL,
	createdAt DATETIME DEFAULT GETDATE(),
	updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Movements (
	id INT IDENTITY(1,1) PRIMARY KEY,
	productId INT NOT NULL,
	type NVARCHAR(50),
	quantity INT NOT NULL,
	reason NVARCHAR(500) NULL,
	userId INT NULL,
	notes NVARCHAR(500) NULL,
	createdAt DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (productId) REFERENCES Products(id),
	FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE INDEX idx_movements_product ON Movements(productId, createdAt DESC);
CREATE INDEX idx_movements_date ON Movements(createdAt DESC);

CREATE TABLE audit_logs (
	id INT IDENTITY(1,1) PRIMARY KEY,
	action NVARCHAR(100),
	user_id INT NULL,
	details NVARCHAR(500),
	timestamp DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE INDEX idx_audit_action ON audit_logs(action, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

CREATE TABLE user_change_history (
	id INT IDENTITY(1,1) PRIMARY KEY,
	user_id INT NOT NULL,
	change_type NVARCHAR(50),
	old_value NVARCHAR(200),
	new_value NVARCHAR(200),
	changed_by INT NULL,
	changed_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (changed_by) REFERENCES Users(id)
);

CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_products_code ON Products(code);
```

**Conexión remota**

Si la base de datos está en un servidor externo con IP `X` y la base de datos se llama `Inventario_GCM`, usa en tu `.env` (ejemplo):

```env
DB_USER=sa
DB_PASSWORD=TuPasswordSeguro
DB_SERVER=X
DB_DATABASE=Inventario_GCM
DB_PORT=1433
DB_ENCRYPT=false
```

**Consultas frecuentes**

```sql
-- Todos los usuarios
SELECT * FROM Users;

-- Usuarios con su rol
SELECT u.id, u.username, u.firstName, u.lastName, r.name AS role
FROM Users u
LEFT JOIN Roles r ON u.roleId = r.id;

-- Productos con stock
SELECT id, name, code, stock, unitPrice FROM Products;

-- Productos con stock por debajo del mínimo
SELECT id, name, code, stock, min FROM Products WHERE stock <= min;

-- Movimientos de un producto (por productId)
SELECT m.id, m.productId, m.type, m.quantity, m.reason, m.createdAt, u.username
FROM Movements m
LEFT JOIN Users u ON m.userId = u.id
WHERE m.productId = @productId
ORDER BY m.createdAt DESC;

-- Movimientos en los últimos N días
SELECT m.*, p.name AS productName
FROM Movements m
LEFT JOIN Products p ON m.productId = p.id
WHERE m.createdAt >= DATEADD(day, -@days, GETDATE())
ORDER BY m.createdAt DESC;

-- Sumar entradas y salidas por producto (agregado)
SELECT productId,
	SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) AS total_entrada,
	SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) AS total_salida
FROM Movements
GROUP BY productId;

-- Log de auditoría reciente
SELECT * FROM audit_logs ORDER BY timestamp DESC;

-- Historial de cambios de un usuario
SELECT * FROM user_change_history WHERE user_id = @userId ORDER BY changed_at DESC;

-- Insertar usuario (ejecutar desde backend con contraseña hasheada)
INSERT INTO Users (username, password, firstName, lastName, email, status, roleId)
VALUES (@username, @passwordHash, @firstName, @lastName, @email, 'active', @roleId);

-- Actualizar stock y registrar movimiento en transacción (ejemplo conceptual)
BEGIN TRANSACTION;
	UPDATE Products SET stock = stock + @delta WHERE id = @productId;
	INSERT INTO Movements (productId, type, quantity, reason, userId, notes) VALUES (@productId, @type, @quantity, @reason, @userId, @notes);
COMMIT TRANSACTION;
```

**Instalación y ejecución**

1) Clonar y preparar el proyecto (raíz):

```bash
git clone <tu-repo> Inventario_GCM
cd Inventario_GCM
npm install
```

2) Instalar dependencias del servidor y configurar `.env`:

```bash
cd server
npm install
```

Crear un archivo `.env` en la carpeta `server/` con las variables:

```env
DB_USER=cdc
DB_PASSWORD=$OPORTE362026*
DB_SERVER=NHNHAPP
DB_INSTANCE=cdc
DB_DATABASE=Inventario_GCM
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=true
DB_CONNECT_TIMEOUT=30000
JWT_SECRET=un_secreto_largo
PORT=4000
```

Si prefieres usar IP en lugar de nombre de host, usa:

```env
DB_SERVER=190.92.48.218
DB_PORT=4013
DB_INSTANCE=
```

3) Iniciar servidor (desarrollo):

```bash
npm run dev
```

4) Iniciar frontend (desde la raíz del repo):

```bash
npm run dev
```

**Conexión a la base de datos desde el sistema (Node.js)**

El backend ya usa el paquete `mssql` y el archivo de conexión es [server/db.js](server/db.js#L1-L40).

Ejemplo rápido para probar la conexión (crear `server/test-conn.js`):

```js
const { poolPromise } = require('./db');

async function test() {
	try {
		const pool = await poolPromise;
		const result = await pool.request().query('SELECT GETDATE() AS now');
		console.log('Conexión OK:', result.recordset[0]);
		process.exit(0);
	} catch (err) {
		console.error('Error de conexión:', err);
		process.exit(1);
	}
}

test()
```

Ejecuta:

```bash
cd server
node test-conn.js
```

Si ves `Conexión OK` con la fecha, la conexión funciona.

**Conexión desde SQL Server Management Studio / Azure Data Studio**
- Servidor: `localhost,1433` o `IP_DEL_SERVIDOR,PUERTO`
- Usuario: el valor de `DB_USER` (ej. `sa`)
- Contraseña: `DB_PASSWORD`
- Base de datos: `Inventario_GCM`

**Recomendaciones, mejoras y observaciones tras revisar el código**
- Seguridad:
	- Asegúrate de que `JWT_SECRET` y credenciales no estén en el repositorio. Usa `.env` y variables de entorno en producción.
	- Forzar TLS/`DB_ENCRYPT=true` en conexiones a bases externas.
- Contraseñas:
	- El proyecto ya incluye `bcrypt` en `server/package.json`; confirma que las rutas de creación de usuarios hasheen las contraseñas antes de guardarlas.
- Integridad y rendimiento:
	- Considera triggers/handled updates para `updatedAt` o actualizarlas desde la lógica de la API.
	- Usa transacciones al registrar `Movements` y actualizar `Products.stock` para evitar inconsistencias.
	- Los índices creados son correctos; añade índices adicionales según consultas frecuentes (por ejemplo `Users.email`).
- Diseño del modelo:
	- `roles.permissions` está definido como JSON; si el modelo crece, plantea una tabla `Permissions` normalizada y una relación muchos-a-muchos.
- Backups y migraciones:
	- Usa migraciones (ej. `migrate` o `knex`/`sequelize`/`mssql` scripts) y un plan de backups para la base de datos en producción.
- Auditar:
	- `audit_logs` está presente; considera añadir IP, user-agent y request_id si se requiere trazabilidad más profunda.

**Creación de un usuario administrador (ejemplo)**
Es preferible insertar el usuario a través de un script Node para que la contraseña se almacene hasheada.

Ejemplo rápido (`server/create-admin.js`):

```js
const bcrypt = require('bcrypt');
const { poolPromise } = require('./db');

async function createAdmin() {
	const password = 'admin123';
	const hash = await bcrypt.hash(password, 10);
	const pool = await poolPromise;
	await pool.request()
		.input('username','nvarchar', 'admin')
		.input('password','nvarchar', hash)
		.input('firstName','nvarchar','Admin')
		.input('lastName','nvarchar','User')
		.query("INSERT INTO Users (username, password, firstName, lastName, status) VALUES (@username, @password, @firstName, @lastName, 'active')");
	console.log('Usuario admin creado: admin / admin123 (cambia la contraseña)')
	process.exit(0)
}

createAdmin()
```

**Dónde mirar en el proyecto**
- Conexión a DB: [server/db.js](server/db.js#L1-L40)
- Lógica de autenticación: [server/auth.js](server/auth.js#L1-L120)
- Funciones de export/print: [src/lib/auditLog.js](src/lib/auditLog.js#L1-L120) (ya contiene generación de PDF/HTML para impresión)

---

Si quieres, aplico también alguno de los siguientes cambios ahora:
- Crear los scripts `server/test-conn.js` y `server/create-admin.js` en el repo.
- Añadir migraciones SQL y un script `npm run migrate`.
- Forzar `DB_ENCRYPT=true` en producción y documentar certificados.

Dime cuál prefieres y lo implemento.
