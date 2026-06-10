const express = require('express')
const jwt = require('jsonwebtoken')
const { poolPromise } = require('./db')

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ message: 'username and password required' })
  try {
    const pool = await poolPromise
    const result = await pool.request().input('username', username).query('SELECT TOP 1 * FROM Users WHERE username = @username')
    const user = result.recordset[0]
    if (!user || user.password !== password) return res.status(401).json({ message: 'Credenciales inválidas' })
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' })
    res.json({ user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email }, token })
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
