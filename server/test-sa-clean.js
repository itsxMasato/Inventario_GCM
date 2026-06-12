const sql = require('mssql')

const config = {
  server: '190.92.48.218',
  port: 1433,
  database: 'Inventario_GCM',
  user: 'inventario_api',
  password: 'Testing123',
  database: 'Inventario_GCM',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
}

console.log('🔧 Probando conexión con SA...')
console.log(`Server: ${config.server}:${config.port}`)
console.log(`User: ${config.user}`)
console.log('')

sql.connect(config)
  .then(pool => {
    console.log('✅ ¡CONECTADO CON SA!')
    return pool.request().query('SELECT @@SERVERNAME as servidor, DB_NAME() as base_datos, USER_NAME() as usuario')
  })
  .then(result => {
    console.log('📋 Info del servidor:')
    console.log(result.recordset[0])
    return sql.close()
  })
  .catch(err => {
    console.error('❌ Error de conexión:')
    console.error('  Código:', err.code)
    console.error('  Mensaje:', err.message)
    if (err.originalError) {
      console.error('  Detalle:', err.originalError.message)
    }
    process.exit(1)
  })
