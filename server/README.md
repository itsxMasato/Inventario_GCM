# Backend mínimo para Inventario_GCM

Este backend es un ejemplo mínimo (Node.js + Express) que conecta a SQL Server 2014 usando el paquete `mssql`.

Resumen rápido
- Conexión: `mssql` + `.env` (ver `.env.example`).
- Autenticación: JWT (`/auth/login`).
- Endpoints demo: `/users`, `/roles` (GET/PUT) y ejemplos para `/products`, `/movements`, `/reports`.

Instalación y ejecución
1. Copiar `.env.example` a `.env` y rellenar los valores de conexión.
2. Instalar dependencias:

```bash
cd server
npm install
```

3. Crear las tablas en SQL Server (ejemplos abajo).
4. Iniciar el servidor:

```bash
npm start
```

Tablas y esquema sugerido (SQL Server 2014)
-- Users
```sql
CREATE TABLE Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(100) NOT NULL UNIQUE,
  password NVARCHAR(200) NOT NULL,
  firstName NVARCHAR(100) NULL,
  lastName NVARCHAR(100) NULL,
  email NVARCHAR(200) NULL,
  roles NVARCHAR(200) NULL, -- lista simple (ej: '1,2') o normalizar en UserRoles
  forcePasswordReset BIT DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE()
);
```

-- Roles
```sql
CREATE TABLE Roles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  description NVARCHAR(500) NULL
);
```

-- Products
```sql
CREATE TABLE Products (
  id INT IDENTITY(1,1) PRIMARY KEY,
  sku NVARCHAR(50) NULL,
  name NVARCHAR(200) NOT NULL,
  description NVARCHAR(1000) NULL,
  unitPrice DECIMAL(18,2) DEFAULT 0,
  stockQuantity INT DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE()
);
CREATE INDEX IX_Products_SKU ON Products(sku);
```

-- Movements (entradas/salidas de inventario)
```sql
CREATE TABLE Movements (
  id INT IDENTITY(1,1) PRIMARY KEY,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  movementType NVARCHAR(20) NOT NULL, -- 'IN'|'OUT'|'ADJUSTMENT'
  reference NVARCHAR(200) NULL,
  note NVARCHAR(1000) NULL,
  createdBy INT NULL, -- user id
  createdAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (productId) REFERENCES Products(id)
);
CREATE INDEX IX_Movements_ProductId_CreatedAt ON Movements(productId, createdAt);
```

-- Reports (metadatos / historial de exportes)
```sql
CREATE TABLE Reports (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(200) NOT NULL,
  params NVARCHAR(2000) NULL, -- JSON o serializado según necesidad
  generatedBy INT NULL,
  generatedAt DATETIME DEFAULT GETDATE(),
  filePath NVARCHAR(1000) NULL
);
```

Notas de diseño
- Para `roles` es recomendable normalizar (tabla `UserRoles(userId, roleId)`) si cada usuario tiene varias roles.
- Las contraseñas deben almacenarse hasheadas (usar `bcrypt` en el backend). El ejemplo demo usa texto plano solo como referencia; reemplazar por hash antes de producción.
- `Reports.params` puede almacenar JSON con filtros usados para regenerar o auditar el reporte.

Índices y rendimiento
- Índices recomendados: `Users.username` UNIQUE, `Products.sku`, `Movements(productId, createdAt)`.
- Revisar estadísticas y planes de ejecución si la base crece mucho.

Consultas/reports útiles (ejemplos)
- Stock actual por producto:
```sql
SELECT id, sku, name, stockQuantity FROM Products ORDER BY name;
```
- Movimientos por rango de fechas:
```sql
SELECT m.*, p.name, u.username
FROM Movements m
JOIN Products p ON p.id = m.productId
LEFT JOIN Users u ON u.id = m.createdBy
WHERE m.createdAt BETWEEN @from AND @to
ORDER BY m.createdAt DESC;
```

Inserciones de ejemplo
```sql
INSERT INTO Roles (name, description) VALUES ('Administrador','Acceso total'),('Operador','Gestión de inventario'),('Analista','Solo lectura y reportes');

INSERT INTO Users (username, password, firstName, lastName, email, roles) VALUES ('admin','admin123','Admin','User','admin@example.com','1');

INSERT INTO Products (sku, name, description, unitPrice, stockQuantity) VALUES ('P-001','Producto A','Descripción A',10.50,100);
```

Endpoints esperados (lista de referencia)
- `POST /auth/login` -> body `{ username, password }` → `{ user, token }`
- `GET /users` -> lista de usuarios (público o protegido según necesidades)
- `PUT /users` -> reemplaza/actualiza usuarios (protegido)
- `GET /roles`, `PUT /roles` (protegido)
- `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- `GET /movements`, `POST /movements` (registrar entrada/salida)
- `GET /reports?name=...&from=...&to=...` (generar/exportar reportes)

Seguridad y buenas prácticas
- Hashear contraseñas con `bcrypt` y nunca guardar texto plano.
- Usar `Authorization: Bearer <token>` en las llamadas protegidas.
- Limitar el usuario de la base de datos a los permisos necesarios (no usar sa en producción).
- Habilitar TLS en las conexiones a SQL Server si es posible; si usas `encrypt=false` en `.env` ajustar según infraestructura.

Frontend
- En el proyecto React, definir `VITE_API_URL` apuntando al backend (ej.: en `.env.local`):

```
VITE_API_URL=http://localhost:4000
```

- Actualizar `src/lib/auth.js` y `src/lib/data.js` para usar la API y enviar el header `Authorization` con el token.

Siguientes pasos sugeridos
- Implementar endpoints adicionales (`/products`, `/movements`, `/reports`).
- Añadir hashing de contraseña y validaciones.
- Probar integración end-to-end con la app React apuntando a `VITE_API_URL`.
