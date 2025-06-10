const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const Q = require("q");
const config = require("../../config/config");
const userService = require("../user/user.service");
const Token = require("./token.model");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateAccessToken = async (
  userModules,
  user,
  expires,
  type,
  secret = config.jwt.secret
) => {
  // user: type == "access" ? user : user.id,
  let temp =
    userModules?.data
      ? userModules?.data?.modules
      : [];
  let pageRights = [];
  // console.log(temp, "temptemptemptemp", userModules?.data)
  for (const item of temp) {
    if (item?.pages) {
      for (const val of item.pages) {
        pageRights.push({
          PageId: val?.PageId,
          // PageUrl: val?.PageUrl,
          Rights: val?.Rights,
        });
      }
    }
  }
  
  const payload = {
    sub: user?.id,
    UserRole: user?.UserRole,
    Email: user?.Email,
    UserName: user?.UserName,
    CompanyCode: user?.CompanyCode,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    pageRights: pageRights,
  };
  return jwt.sign(payload, secret);
};

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (user, expires, type, secret = config.jwt.secret) => {
  // user: type == "access" ? user : user.id,
  const payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const deferred = Q.defer();
  const getTokenModel = Token(global.sequelize);

  const tokenDoc = await getTokenModel.upsert(
    {
      token,
      user: userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    },
    {
      returning: true,
    }
  );

  deferred.resolve(tokenDoc);
  return deferred.promise;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const deferred = Q.defer();
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });

  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  deferred.resolve(tokenDoc);
  return deferred.promise;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, userModules) => {
  const deferred = Q.defer();
  // const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const accessToken = await generateAccessToken(
    userModules,
    user,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );
  deferred.resolve({
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  });
  return deferred.promise;
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (data) => {
  const deferred = Q.defer();
  const user = await userService.getUserByEmail(data.Email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = generateToken(
    user,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  deferred.resolve({
    status: httpStatus.OK,
    message: "Reset password Token generated",
    data: resetPasswordToken,
  });
  return deferred.promise;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const deferred = Q.defer();
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );
  const verifyEmailToken = generateToken(
    user,
    expires,
    tokenTypes.VERIFY_EMAIL
  );
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);

  deferred.resolve(verifyEmailToken);
  return deferred.promise;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};