const sql = require('mssql')

const config = {
  server: '190.92.48.218',
  port: 1433,
  database: 'Inventario_GCM',
  user: 'inventario_api',
  password: 'Inventario@2026!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  }
}

console.log('Direct config connect')

sql.connect(config)
  .then(pool => pool.request().query('SELECT 1 as ok'))
  .then(result => {
    console.log('OK', result.recordset)
    return sql.close()
  })
  .catch(err => {
    console.error('CODE:', err.code)
    console.error('MESSAGE:', err.message)
    if (err.originalError) {
      console.error('ORIGINAL:', err.originalError.message)
    }
    process.exit(1)
  })
