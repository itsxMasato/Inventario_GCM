const sql = require('mssql')
require('dotenv').config()

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_DATABASE,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  },
  options: {
    encrypt: process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT.toLowerCase() === 'true' : false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT ? process.env.DB_TRUST_SERVER_CERT.toLowerCase() === 'true' : true,
    enableArithAbort: true,
    connectTimeout: 30000,
  }
}

console.log('=== DIAGNÓSTICO DE CONEXIÓN A SQL SERVER ===\n')
console.log('Configuración:')
console.log(`  Server: ${config.server}:${config.port}`)
console.log(`  Database: ${config.database}`)
console.log(`  User: ${config.authentication.options.userName}`)
console.log(`  Encrypt: ${config.options.encrypt}`)
console.log(`  TrustServerCertificate: ${config.options.trustServerCertificate}\n`)

async function diagnose() {
  let pool
  try {
    console.log('📡 Conectando a SQL Server...')
    pool = new sql.ConnectionPool(config)
    await pool.connect()
    console.log('✅ Conexión exitosa!\n')

    // 1. Verificar tablas
    console.log('📋 Verificando tablas...')
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `)
    const tables = tablesResult.recordset.map(r => r.TABLE_NAME)
    console.log(`  Tablas encontradas: ${tables.join(', ')}\n`)

    if (!tables.includes('Users')) {
      console.log('❌ FALTA TABLA: Users')
      return
    }
    if (!tables.includes('Roles')) {
      console.log('❌ FALTA TABLA: Roles')
      return
    }

    // 2. Contar usuarios
    console.log('👥 Usuarios en la base de datos:')
    const usersResult = await pool.request().query('SELECT id, username, firstName, lastName, roleId FROM Users')
    if (usersResult.recordset.length === 0) {
      console.log('  ❌ NO HAY USUARIOS\n')
    } else {
      usersResult.recordset.forEach(u => {
        console.log(`  - ${u.username} (${u.firstName} ${u.lastName}) [roleId: ${u.roleId}]`)
      })
      console.log()
    }

    // 3. Contar roles
    console.log('🎭 Roles en la base de datos:')
    const rolesResult = await pool.request().query('SELECT id, name, description, permissions FROM Roles')
    if (rolesResult.recordset.length === 0) {
      console.log('  ❌ NO HAY ROLES\n')
    } else {
      rolesResult.recordset.forEach(r => {
        const perms = r.permissions ? (Array.isArray(JSON.parse(r.permissions)) ? JSON.parse(r.permissions).length + ' permisos' : r.permissions) : 'sin permisos'
        console.log(`  - ${r.name} (${perms})`)
        if (r.permissions) {
          try {
            const parsed = JSON.parse(r.permissions)
            if (Array.isArray(parsed)) {
              parsed.forEach(p => console.log(`    * ${p}`))
            }
          } catch (e) {}
        }
      })
      console.log()
    }

    // 4. Probar login (simular)
    console.log('🔐 Probando login del usuario admin:')
    const loginResult = await pool.request()
      .input('username', 'admin')
      .query(`
        SELECT TOP 1 u.id, u.username, u.password, u.firstName, u.lastName, u.email, u.roleId,
          r.name AS roleName, r.permissions
        FROM Users u
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE u.username = @username
      `)

    if (loginResult.recordset.length === 0) {
      console.log('  ❌ Usuario admin no existe\n')
    } else {
      const user = loginResult.recordset[0]
      console.log(`  ✅ Usuario encontrado:`)
      console.log(`    - Username: ${user.username}`)
      console.log(`    - Nombre: ${user.firstName} ${user.lastName}`)
      console.log(`    - Email: ${user.email}`)
      console.log(`    - RoleId: ${user.roleId}`)
      console.log(`    - RoleName: ${user.roleName || 'SIN ROL'}`)
      console.log(`    - Contraseña guardada: ${user.password}`)
      
      if (user.permissions) {
        try {
          const perms = JSON.parse(user.permissions)
          console.log(`    - Permisos (${Array.isArray(perms) ? perms.length : 'objeto'}):`)
          if (Array.isArray(perms)) {
            perms.forEach(p => console.log(`      * ${p}`))
          } else {
            console.log(`      ${perms}`)
          }
        } catch (e) {
          console.log(`    - Permisos (raw): ${user.permissions}`)
        }
      } else {
        console.log('    - Permisos: NINGUNO')
      }
      console.log()
    }

    // 5. Estadísticas generales
    console.log('📊 Estadísticas:')
    console.log(`  - Total usuarios: ${usersResult.recordset.length}`)
    console.log(`  - Total roles: ${rolesResult.recordset.length}`)
    console.log()

    console.log('✅ DIAGNÓSTICO COMPLETADO\n')

  } catch (err) {
    console.error('\n❌ ERROR DE CONEXIÓN:')
    console.error(`  Código: ${err.code}`)
    console.error(`  Mensaje: ${err.message}`)
    console.error(`  Número: ${err.number}`)
    console.error()
    console.error('POSIBLES CAUSAS:')
    if (err.code === 'ELOGIN') {
      console.error('  - Credenciales inválidas (usuario o contraseña)')
      console.error('  - El usuario no existe en SQL Server')
    } else if (err.code === 'ENOTOPEN') {
      console.error('  - Problema al conectar al servidor')
      console.error('  - Verifiqua la IP y puerto')
    } else if (err.message.includes('ECONN')) {
      console.error('  - No se puede alcanzar el servidor')
      console.error('  - Firewall bloqueando puertos')
    }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

diagnose()