const sql = require('mssql')
require('dotenv').config()

const rawServer = process.env.DB_SERVER || ''
const [serverName, instanceNameFromServer] = rawServer.split('\\', 2)
const server = serverName || rawServer
const dbInstance = process.env.DB_INSTANCE || instanceNameFromServer
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined
const authType = (process.env.DB_AUTH_TYPE || 'sql').toLowerCase()
const usingWindowsAuth = authType === 'windows'

const config = {
  server,
  database: process.env.DB_DATABASE,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    port: 1433,
  }
}

if (!usingWindowsAuth) {
  config.user = process.env.DB_USER
  config.password = process.env.DB_PASSWORD
}

if (port && !dbInstance) {
  config.port = port
}

if (usingWindowsAuth) {
  config.driver = process.env.DB_DRIVER || 'msnodesqlv8'
}

// Agregalo justo antes de crear el ConnectionPool
console.log('DB Config:', JSON.stringify({
  server: config.server,
  database: config.database,
  user: config.user,
  port: config.port,
  instanceName: config.options.instanceName,
  encrypt: config.options.encrypt,
  trustServerCertificate: config.options.trustServerCertificate,
  usingWindowsAuth
}, null, 2))

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server')
    return pool
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err)
    throw err
  })

module.exports = { sql, poolPromise }
