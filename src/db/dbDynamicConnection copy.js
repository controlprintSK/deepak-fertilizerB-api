const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');
const connections = {};

const getDBConnection = async (dbName) => {
  let _name = 'DB_MANKIND_' + dbName;
  try {
    let conn = '';
    if (connections[_name]) {
      conn = connections[_name];
      logger.info('DB Already exist');
    } else {
      const newConnection = mongoose.createConnection(`${config.mongoDbUrl}/${_name}`, config.mongoose.options);
      logger.info('DB not Exist');
      connections[_name] = newConnection;
      conn = newConnection;
    }

    return conn;
  } catch (error) {
    logger.error(`Failed to create connection for database: ${dbName}`, error);
    throw error;
  }
};

module.exports = getDBConnection;
