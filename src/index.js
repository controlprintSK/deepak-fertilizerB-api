const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const createDatabase = require('./db/createDatabase');
const getDBConnection = require('./db/dbDynamicConnection'); // MSSQL connection function

let server;

const connectDB = async () => {
  try {
    const dbName = 'MAIN'; // You can load this dynamically if needed
    await createDatabase(`DB_DEEPAK_${dbName}`);
    const sequelize = await getDBConnection(dbName);
    await sequelize.sync(); // creates the table if not exists
    global.sequelize = sequelize;
    console.log(`✅ Tables synced in DB_MANKIND_${dbName}`);

    logger.info(`Connected to MSSQL database: ${dbName}`);

    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
    
  } catch (error) {
    logger.error('Database connection failed:', error);
    setTimeout(connectDB, 2000); // Retry connection after delay
  }
};

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});


module.exports = connectDB().catch(console.error)
