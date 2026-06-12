const sql = require('mssql')
require('dotenv').config()

const config = {
  server: process.env.DB_SERVER || '190.92.48.218',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_DATABASE || 'Inventario_GCM',
  user: process.env.DB_USER || 'inventario_api',
  password: process.env.DB_PASSWORD || 'Inventario@2026!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1',
      ciphers: 'DEFAULT@SECLEVEL=0'
    }
  }
}

sql.connect(config)
  .then(() => console.log('✅ Conectado exitosamente'))
  .catch(err => console.error('❌ Error:', err.message))