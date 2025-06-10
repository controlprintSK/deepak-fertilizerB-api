const { Sequelize } = require('sequelize');
const logger = require('../config/logger');

const connections = {};

const getDBConnection = async (dbName) => {
  console.log(dbName, "dbNamedbNamedbName")
  const fullDbName = `DB_DEEPAK_${dbName}`;

  if (connections[fullDbName]) {
    logger.info(`Sequelize connection for ${fullDbName} already exists.`);
    return connections[fullDbName];
  }

  const sequelize = new Sequelize(fullDbName, 'QCdbadmin', 'C0ntrol9rint', {
    host: '192.168.50.41',
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
  });

  try {
    await sequelize.authenticate();
    logger.info(`Connected to ${fullDbName}`);
    connections[fullDbName] = sequelize;
    return sequelize;
  } catch (err) {
    logger.error(`Failed to connect to ${fullDbName}`, err);
    throw err;
  }
};

module.exports = getDBConnection;
