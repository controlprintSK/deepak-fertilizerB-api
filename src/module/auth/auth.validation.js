const Joi = require('joi');
const { password } = require('../../validations/custom.validation');

const register = {
  body: Joi.object().keys({
    Email: Joi.string().required().email(),
    Password: Joi.string().required().custom(password),
    FirstName: Joi.string().required(),
    LastName: Joi.string().allow(''),
    Mobile: Joi.string().required(),
    UserRole: Joi.number().required(),
    UserName: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().allow(''),
    UserName: Joi.string().required(),
    Password: Joi.string().required(),
  }),
};
const companyLogin = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
    UserName: Joi.string().required(),
    Password: Joi.string().required(),
  }),
};
const loginAsCompany = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
    UserName: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    Email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};
const changePassword = {
  body: Joi.object().keys({
    OldPassword: Joi.string().required(),
    NewPassword: Joi.string().required(),
    UserId: Joi.required(),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  companyLogin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  loginAsCompany,
};
