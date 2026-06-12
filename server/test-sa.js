const sql = require('mssql')

const config = {
  server: '190.92.48.218',
  port: 1433,
  database: 'master',
  user: 'sa',
  password: 'Soporte2026',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 30000
  }
}

console.log('🔧 Probando conexión con SA...')
console.log('')

sql.connect(config)
  .then(pool => {
    console.log('✅ CONECTADO CON SA')
    return pool.request().query('SELECT @@SERVERNAME as servidor, DB_NAME() as base_datos, USER_NAME() as usuario_conectado')
  })
  .then(result => {
    console.log('📋 Info del servidor:')
    console.log(result.recordset[0])
    console.log('')
    
    // Ahora verifica que exista el usuario inventario_api
    return sql.query(`
      SELECT name, is_disabled 
      FROM sys.server_principals 
      WHERE name = 'inventario_api'
    `)
  })
  .then(result => {
    console.log('🔍 Información del usuario inventario_api:')
    if (result.recordset.length === 0) {
      console.log('⚠️  El usuario inventario_api NO EXISTE en el servidor')
    } else {
      console.log(result.recordset[0])
    }
    
    return sql.close()
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
  })
