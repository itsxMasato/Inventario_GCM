const sql = require('mssql')

const password = 'Inventario@2026!'
const user = 'inventario_api'
const database = 'Inventario_GCM'

const servers = [
  '190.92.48.218',
  'tcp:190.92.48.218',
  '190.92.48.218,1433',
  'tcp:190.92.48.218,1433',
  'NHNHAPP',
  'NHNHAPP,1433',
  'tcp:NHNHAPP,1433'
]

async function testServer(server) {
  const config = {
    server,
    database,
    user,
    password,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 10000,
      requestTimeout: 10000
    }
  }

  console.log(`\n=== Probando ${server} ===`)
  try {
    const pool = await sql.connect(config)
    const result = await pool.request().query('SELECT @@SERVERNAME as serverName, DB_NAME() as databaseName, USER_NAME() as userName')
    console.log('✅ Conectado con éxito:', result.recordset[0])
    await sql.close()
  } catch (err) {
    console.error('❌ Error:', err.code || 'NO_CODE', '-', err.message)
    if (err.originalError) {
      console.error('   Detalle:', err.originalError.message)
    }
    await sql.close().catch(() => {})
  }
}

;(async () => {
  for (const server of servers) {
    await testServer(server)
  }
  process.exit(0)
})()
