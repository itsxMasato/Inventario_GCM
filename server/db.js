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
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT.toLowerCase() === 'true' : false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT ? process.env.DB_TRUST_SERVER_CERT.toLowerCase() === 'true' : true,
    enableArithAbort: true,
    connectTimeout: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 30000,
  }
}

if (usingWindowsAuth) {
  config.driver = process.env.DB_DRIVER || 'msnodesqlv8'
} else {
  config.authentication = {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  }
  config.user = process.env.DB_USER
  config.password = process.env.DB_PASSWORD
}

if (dbInstance) {
  config.options.instanceName = dbInstance
} else if (port) {
  config.port = port
}

console.log('DB Config:', JSON.stringify({
  server: config.server,
  database: config.database,
  user: usingWindowsAuth ? undefined : config.user,
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
