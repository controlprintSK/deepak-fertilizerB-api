const jwt = require("jsonwebtoken");
// const fs = require("fs");

const responseFun = (reqobj) => {
  let resobj = {};
  if (reqobj.status == 0) {
    resobj = {
      status: reqobj?.status,
      data: reqobj?.data,
      message: reqobj?.message,
    };
  } else if (reqobj.status == 1) {
    resobj = {
      status: reqobj?.status,
      data: reqobj?.data,
      message: reqobj?.message,
    };
  }
  return resobj;
};

const handleConsoleLog = (shouldLog) => {
  return shouldLog ? console.log.bind(console) : () => {};
};
const handleConsoleError = (shouldLog) => {
  return shouldLog ? console.error.bind(console) : () => {};
};
const getDecodedToken = (authorizationHeader) => {
  if (authorizationHeader) {
    if (authorizationHeader?.startsWith("Bearer ")) {
      const token = authorizationHeader.substring(7);
      return jwt.decode(token, { complete: true });
    } else {
      return jwt.decode(authorizationHeader, { complete: true });
    }
  }
  return null;
};

module.exports = {
  responseFun,
  handleConsoleLog,
  handleConsoleError,
  getDecodedToken
};
