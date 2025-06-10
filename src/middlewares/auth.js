const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const verifyCallback = (pageId, right, req, resolve, reject) => async (err, user, pageRights, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  
  if (!['superadmin','ADMIN'].includes(user.UserRole)) {
  // if (!user.UserRole) {
    const page = pageRights.find((val) => val.PageId == pageId && val.Rights.includes(right));
    if (!page) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Insufficient rights'));
    }
  }

  resolve();
};

const auth = (pageId, right) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(pageId, right, req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
