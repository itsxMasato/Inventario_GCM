const sql = require('mssql')
require('dotenv').config()

const rawServer = process.env.DB_SERVER || ''
const [serverName, instanceNameFromServer] = rawServer.split('\\', 2)

const server = serverName || rawServer
const dbInstance = process.env.DB_INSTANCE || instanceNameFromServer
const port = process.env.DB_PORT
  ? parseInt(process.env.DB_PORT, 10)
  : undefined

const authType = (process.env.DB_AUTH_TYPE || 'sql').toLowerCase()
const usingWindowsAuth = authType === 'windows'

const config = {
  server,
  database: process.env.DB_DATABASE,

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },

  options: {
    encrypt: process.env.DB_ENCRYPT
      ? process.env.DB_ENCRYPT.toLowerCase() === 'true'
      : false,

    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT
      ? process.env.DB_TRUST_SERVER_CERT.toLowerCase() === 'true'
      : true,

    enableArithAbort: true,

    connectTimeout: process.env.DB_CONNECT_TIMEOUT
      ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10)
      : 30000
  }
}

// ===========================
// WINDOWS AUTHENTICATION
// ===========================
if (usingWindowsAuth) {
  config.driver = process.env.DB_DRIVER || 'msnodesqlv8'
  config.options.trustedConnection = true
}
// ===========================
// SQL AUTHENTICATION
// ===========================
else {
  config.authentication = {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  }

  config.user = process.env.DB_USER
  config.password = process.env.DB_PASSWORD
}

// ===========================
// INSTANCE O PORT
// ===========================
if (dbInstance) {
  config.options.instanceName = dbInstance
} else if (port) {
  config.port = port
}

// ===========================
// DEBUG
// ===========================
console.log('\n========== ENV ==========')
console.log({
  DB_AUTH_TYPE: process.env.DB_AUTH_TYPE,
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: process.env.DB_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD
})

console.log('\n========== CONFIG ==========')
console.log({
  server: config.server,
  database: config.database,
  user: config.user,
  port: config.port,
  instanceName: config.options.instanceName,
  encrypt: config.options.encrypt,
  trustServerCertificate: config.options.trustServerCertificate,
  usingWindowsAuth
})

// ===========================
// CONNECTION
// ===========================
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('\n✅ Connected to SQL Server')
    return pool
  })
  .catch(err => {
    console.log('\n❌ Database Connection Failed!')
    console.error(err)
    throw err
  })

module.exports = {
  sql,
  poolPromise
}