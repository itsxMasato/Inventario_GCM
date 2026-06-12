const { poolPromise } = require('./db')

async function test() {
  try {
    const pool = await poolPromise
    const result = await pool.request().query('SELECT GETDATE() AS now')
    console.log('Conexión OK:', result.recordset[0])
    process.exit(0)
  } catch (err) {
    console.error('Error de conexión:', err.message || err)
    process.exit(1)
  }
}

test()
