const net = require('net');
const sock = net.createConnection({ host: '190.92.48.218', port: 4013, timeout: 15000 }, () => {
  console.log('TCP connected');
  sock.end();
  process.exit(0);
});

sock.on('error', err => {
  console.error('error', err.code || '', err.message || err);
  process.exit(1);
});

sock.on('timeout', () => {
  console.error('timeout');
  sock.destroy();
  process.exit(1);
});
