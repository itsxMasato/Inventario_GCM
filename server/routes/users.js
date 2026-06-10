const express = require('express')
const { poolPromise } = require('../db')
const { authenticate } = require('../auth')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query('SELECT id, username, firstName, lastName, email FROM Users')
    res.json(result.recordset)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
})

// Save entire users array (used by frontend PUT /users)
router.put('/', authenticate, async (req, res) => {
  const users = req.body
  if (!Array.isArray(users)) return res.status(400).json({ message: 'Expected array of users' })
  try {
    const pool = await poolPromise
    const tx = new pool.Transaction()
    await tx.begin()
    const request = new tx.request()
    // Delete all existing users and re-insert (simple demo approach)
    await request.query('DELETE FROM Users')
    for (const u of users) {
      await request
        .input('username', u.username)
        .input('password', u.password || '')
        .input('firstName', u.firstName || null)
        .input('lastName', u.lastName || null)
        .input('email', u.email || null)
        .query('INSERT INTO Users (username, password, firstName, lastName, email) VALUES (@username, @password, @firstName, @lastName, @email)')
    }
    await tx.commit()
    res.json({ message: 'Users saved' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error saving users' })
  }
})

module.exports = router
