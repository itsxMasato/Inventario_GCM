const sql = require('mssql')

const configs = [
  {
    name: 'IP+PORT',
    config: {
      server: '190.92.48.218',
      port: 4013,
      database: 'Inventario_GCM',
      user: 'inventario_api',
      password: 'Inventario@2026!',
      options: { encrypt: false, trustServerCertificate: true, connectTimeout: 30000, enableArithAbort: true }
    }
  },
  {
    name: 'IP+INSTANCE',
    config: {
      server: '190.92.48.218',
      database: 'Inventario_GCM',
      user: 'inventario_api',
      password: 'Inventario@2026!',
      options: { instanceName: 'cdc', encrypt: false, trustServerCertificate: true, connectTimeout: 30000, enableArithAbort: true }
    }
  },
  {
    name: 'HOST+INSTANCE',
    config: {
      server: 'NHNHAPP',
      database: 'Inventario_GCM',
      user: 'inventario_api',
      password: 'Inventario@2026!',
      options: { instanceName: 'cdc', encrypt: false, trustServerCertificate: true, connectTimeout: 30000, enableArithAbort: true }
    }
  },
  {
    name: 'HOST+PORT',
    config: {
      server: 'NHNHAPP',
      port: 4013,
      database: 'Inventario_GCM',
      user: 'inventario_api',
      password: 'Inventario@2026!',
      options: { encrypt: false, trustServerCertificate: true, connectTimeout: 30000, enableArithAbort: true }
    }
  }
]

async function run() {
  for (const item of configs) {
    console.log('===', item.name, '===')
    console.log(JSON.stringify(item.config, null, 2))
    try {
      const pool = await sql.connect(item.config)
      const result = await pool.request().query('SELECT 1 as ok')
      console.log('SUCCESS:', result.recordset)
      await pool.close()
    } catch (err) {
      console.error('ERROR:', err.code, err.message)
      if (err.originalError) console.error('ORIG:', err.originalError.message)
    }
    console.log('')
  }
}

run().then(() => process.exit(0))
