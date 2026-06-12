const { Connection } = require('tedious')
const config = {
  server: '190.92.48.218',
  authentication: {
    type: 'default',
    options: {
      userName: 'cdc',
      password: '$OPORTE362026*'
    }
  },
  options: {
    database: 'Inventario_GCM',
    port: 4013,
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: true,
      log: true
    }
  }
}

const connection = new Connection(config)
connection.on('connect', err => {
  if (err) {
    console.error('connect error', err)
    process.exit(1)
  }
  console.log('connected')
  connection.close()
  process.exit(0)
})
connection.on('debug', message => {
  console.error('DEBUG', message)
})
connection.on('error', err => {
  console.error('ERROR', err)
})
connection.on('end', () => {
  console.error('END')
})
