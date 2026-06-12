const sql = require('mssql')

const config = {
  server: '190.92.48.218',
  port: 1433,
  database: 'Inventario_GCM',
  driver: 'msnodesqlv8',
  authentication: {
    type: 'ntlm',
    options: {
      domain: 'HNHNHAPP',
      userName: 'cdc',
      password: ''
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 30000
  }
}

console.log('🔧 Probando Windows Authentication...')
console.log('')

sql.connect(config)
  .then(pool => {
    console.log('✅ CONECTADO CON WINDOWS AUTH')
    return pool.request().query('SELECT @@SERVERNAME as servidor, DB_NAME() as base_datos, USER_NAME() as usuario')
  })
  .then(result => {
    console.log('📋 Info:')
    console.log(result.recordset[0])
    return sql.close()
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
    if (err.originalError) {
      console.error('  Detalle:', err.originalError.message)
    }
    process.exit(1)
  })
