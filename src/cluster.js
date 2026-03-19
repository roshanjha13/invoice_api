const cluster = require('cluster');
const os = require('os');
const logger = require('./utils/logger');

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Master process ${process.pid} is running`);
  logger.info(`Starting ${numCPUs} workers...`);

  // CPU ke hisaab se workers banao
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Worker crash ho toh restart karo
  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker ${worker.process.pid} died — restarting...`);
    cluster.fork();
  });

} else {
  // Har worker apna server chalayega
  require('./server');
  logger.info(`Worker ${process.pid} started`);
}