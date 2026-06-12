const bcrypt = require('bcrypt')
const { sql, poolPromise } = require('./db')
require('dotenv').config()

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const firstName = process.env.ADMIN_FIRSTNAME || 'Admin'
  const lastName = process.env.ADMIN_LASTNAME || 'User'
  const roleName = process.env.ADMIN_ROLENAME || 'Administrador'

  try {
    const pool = await poolPromise

    // Buscar o crear rol admin
    let roleId = null
    const roleRes = await pool.request().input('name', sql.NVarChar, roleName).query('SELECT id FROM Roles WHERE name = @name')
    if (roleRes.recordset.length > 0) {
      roleId = roleRes.recordset[0].id
      console.log('Rol existente encontrado, id=', roleId)
      const permissions = JSON.stringify([
        'Ver Productos',
        'Crear/Editar Productos',
        'Ver Movimientos',
        'Crear/Editar Movimientos',
        'Administrar Usuarios',
        'Ver Reportes',
      ])
      await pool.request()
        .input('id', sql.Int, roleId)
        .input('permissions', sql.NVarChar, permissions)
        .query("UPDATE Roles SET permissions = @permissions WHERE id = @id AND (permissions IS NULL OR LTRIM(RTRIM(permissions)) = '')")
    } else {
      const insertRole = await pool.request()
        .input('name', sql.NVarChar, roleName)
        .input('description', sql.NVarChar, 'Rol administrador creado por create-admin script')
        .input('permissions', sql.NVarChar, JSON.stringify([
          'Ver Productos',
          'Crear/Editar Productos',
          'Ver Movimientos',
          'Crear/Editar Movimientos',
          'Administrar Usuarios',
          'Ver Reportes',
        ]))
        .query("INSERT INTO Roles (name, description, permissions) VALUES (@name, @description, @permissions); SELECT SCOPE_IDENTITY() AS id;")
      roleId = insertRole.recordset[0].id
      console.log('Rol admin creado, id=', roleId)
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.request().input('username', sql.NVarChar, username).query('SELECT id FROM Users WHERE username = @username')
    if (userExists.recordset.length > 0) {
      console.log('El usuario ya existe con id=', userExists.recordset[0].id)
      process.exit(0)
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hash)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('status', sql.NVarChar, 'active')
      .input('roleId', sql.Int, roleId)
      .query('INSERT INTO Users (username, password, firstName, lastName, status, roleId) VALUES (@username, @password, @firstName, @lastName, @status, @roleId)')

    console.log(`Usuario admin creado: ${username} (contraseña: ${password}) — cambia la contraseña en producción`)
    process.exit(0)
  } catch (err) {
    console.error('Error creando admin:', err.message || err)
    process.exit(1)
  }
}

createAdmin()
