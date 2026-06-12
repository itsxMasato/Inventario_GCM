const sql = require('mssql')
require('dotenv').config()

const config = {
  server: process.env.DB_SERVER || '190.92.48.218',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_DATABASE || 'Inventario_GCM',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Soporte2026',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'inventario_api',
      password: process.env.DB_PASSWORD || 'Inventario@2026!'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
    enableArithAbort: true
  }
}

console.log('🔧 Configuración de conexión:')
console.log(`  Server: ${config.server}:${config.port}`)
console.log(`  Database: ${config.database}`)
console.log(`  User: ${config.user}`)
console.log(`  Encrypt: ${config.options.encrypt}`)
console.log(`  Trust Cert: ${config.options.trustServerCertificate}`)
console.log('')

const pool = new sql.ConnectionPool(config)

pool.on('error', err => {
  console.error('❌ Pool error:', err.message)
})

sql.connect(config)
  .then(pool => {
    console.log('✅ Conectado exitosamente a SQL Server')
    console.log('📦 Pool conectado')
    return pool.request().query('SELECT @@SERVERNAME as server, DB_NAME() as database')
  })
  .then(result => {
    console.log('📋 Información del servidor:')
    console.log('  ', result.recordset[0])
    
    return sql.close()
  })
  .then(() => {
    console.log('✅ Conexión cerrada correctamente')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error de conexión:')
    console.error('  Código:', err.code)
    console.error('  Mensaje:', err.message)
    if (err.originalError) {
      console.error('  Error original:', err.originalError.message)
    }
    process.exit(1)
  })
