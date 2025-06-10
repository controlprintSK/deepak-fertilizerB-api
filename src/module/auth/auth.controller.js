const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const userService = require('../user/user.service');
// const auditsTrail = require('../../middlewares/auditsTrail');
// const fileLogger = require('../../middlewares/logger');
// const moment = require('moment');
const authService = require('./auth.service');
const tokenService = require('../token/token.service');
const emailService = require('../mailer/email.service');
const { assignDefaultRights, getMenuByUserId } = require('../userMaster/master_service');

const register = catchAsync(async (req, res) => {
  const user = await userService.registerUser(req.body);
  await assignDefaultRights(user.data);
  const tokens = await tokenService.generateAuthTokens(user.data);
  const finalData = { ...user, data: { user: user.data, ...tokens } };
  res.status(httpStatus.CREATED).json(finalData);
});

const login = catchAsync(async (req, res) => {
  const user = await authService.loginUserWithUserNameAndPassword(req.body);
  user.data.CurrentCompany = JSON.parse(user.data.CompanyCode)[0]
  let userModules = await getMenuByUserId({ UserId: user.data.id });
  const tokens = await tokenService.generateAuthTokens(user.data, userModules);

  const resObj = {
    ...user,
    data: {
      user: user.data,
      ...tokens,
      userModules: userModules?.data ? userModules?.data?.modules : [],
    },
  };

  res.status(httpStatus.OK).json(resObj);
});

const companyLogin = catchAsync(async (req, res) => {
  const user = await authService.companyLogin(req.body);

  let userModules = await getMenuByUserId({ UserId: user.data.id });
  const tokens = await tokenService.generateAuthTokens(user.data, userModules);
  const resObj = {
    ...user,
    data: {
      user: user.data,
      ...tokens,
      userModules: userModules?.data && userModules?.data?.length ? userModules?.data[0]?.modules : [],
    },
  };
  res.status(httpStatus.OK).json(resObj);
});

const loginAsCompany = catchAsync(async (req, res) => {
  const user = await authService.loginAsCompany(req.body);
  let userModules = await getMenuByUserId({ UserId: user.data.id });
  const tokens = await tokenService.generateAuthTokens(user.data, userModules);
  const resObj = {
    ...user,
    data: {
      user: user.data,
      ...tokens,
      userModules: userModules?.data && userModules?.data?.length ? userModules?.data[0]?.modules : [],
    },
  };
  res.status(httpStatus.OK).json(resObj);
});

const logout = catchAsync(async (req, res) => {
  const resObj = await authService.logout(req.body.userId);
  res.status(httpStatus.OK).json(resObj);
});

const refreshTokens = catchAsync(async (req, res) => {
  const resObj = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).json(resObj);
});

const forgotPassword = catchAsync(async (req, res) => {
  const resObj = await tokenService.generateResetPasswordToken(req.body);
  res.status(httpStatus.OK).json(resObj);
});

const resetPassword = catchAsync(async (req, res) => {
  const resObj = await authService.resetPassword(req.body.token, req.body.password);
  res.status(httpStatus.OK).json(resObj);
});

const changePassword = catchAsync(async (req, res) => {
  let resObj = await authService.changePassword(req.body.UserId, req.body);
  res.status(httpStatus.OK).json(resObj);
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
  loginAsCompany,
  companyLogin,
};
