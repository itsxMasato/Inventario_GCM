require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { poolPromise } = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/auth', require('./auth'))
app.use('/users', require('./routes/users'))
app.use('/roles', require('./routes/roles'))

const port = process.env.PORT || 4000

poolPromise
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
  })
  .catch(err => {
    console.error('Failed to start server due to DB error:', err)
    process.exit(1)
  })