const express = require('express')
const { poolPromise } = require('../db')
const { authenticate } = require('../auth')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query('SELECT id, name, description FROM Roles')
    res.json(result.recordset)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener roles' })
  }
})

router.put('/', authenticate, async (req, res) => {
  const roles = req.body
  if (!Array.isArray(roles)) return res.status(400).json({ message: 'Expected array of roles' })
  try {
    const pool = await poolPromise
    const tx = new pool.Transaction()
    await tx.begin()
    const request = new tx.request()
    await request.query('DELETE FROM Roles')
    for (const r of roles) {
      await request.input('name', r.name).input('description', r.description || null)
        .query('INSERT INTO Roles (name, description) VALUES (@name, @description)')
    }
    await tx.commit()
    res.json({ message: 'Roles saved' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error saving roles' })
  }
})

module.exports = router
