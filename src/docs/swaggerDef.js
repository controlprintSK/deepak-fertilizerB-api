const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.1.0',
  info: {
    title: 'PIL Pharma 2.0 API documentation',
    version,
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
