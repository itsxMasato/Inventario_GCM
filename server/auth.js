const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { poolPromise } = require('./db')

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ message: 'username and password required' })

  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('username', username)
      .query(`
        SELECT TOP 1 u.id, u.username, u.password, u.firstName, u.lastName, u.email, u.roleId,
          r.name AS roleName, r.permissions
        FROM Users u
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE u.username = @username
      `)

    const user = result.recordset[0]
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })

    const isHashedPassword = typeof user.password === 'string' && /^\$2[aby]\$/.test(user.password)
    const passwordMatches = isHashedPassword
      ? await bcrypt.compare(password, user.password)
      : password === user.password

    if (!passwordMatches) return res.status(401).json({ message: 'Credenciales inválidas' })

    const rolePermissions = []
    if (user.permissions) {
      try {
        const parsed = JSON.parse(user.permissions)
        if (Array.isArray(parsed)) {
          rolePermissions.push(...parsed)
        }
      } catch (err) {
        const parts = String(user.permissions).split(',').map(p => p.trim()).filter(Boolean)
        rolePermissions.push(...parts)
      }
    }

    const payload = { id: user.id, username: user.username, roleId: user.roleId }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' })

    console.log(`[AUTH] Login exitoso para ${username}, roleName=${user.roleName}, permisos=${rolePermissions.length}`)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleName,
        rolePermissions: rolePermissions,
        roles: user.roleId ? [user.roleId] : [],
      },
      token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error en login' })
  }
})

function authenticate(req, res, next) {
  const auth = req.headers['authorization']
  if (!auth) return res.status(401).json({ message: 'No autorizado' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ message: 'Malformed token' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = router
module.exports.authenticate = authenticate