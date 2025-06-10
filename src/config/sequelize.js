// src/config/sequelize.js
const { Sequelize } = require('sequelize');
const dbName = 'DB_DEEPAK_MAIN';

const sequelize = new Sequelize(dbName, 'QCdbadmin', 'C0ntrol9rint', {
  host: '192.168.50.41',
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
  logging: false,
});

module.exports = sequelize;