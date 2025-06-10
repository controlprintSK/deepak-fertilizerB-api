const config = require('../config/config');
const jwt = require('jsonwebtoken');

const localAuth = (token) => {
  try {
    let decoded = jwt.verify(token, 'ltdtnirplortnocprinter');

    if (decoded == config.jwt.secret) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports = localAuth;
