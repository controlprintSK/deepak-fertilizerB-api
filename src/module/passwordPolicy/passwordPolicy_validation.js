const Joi = require("joi");

const addPasswordPolicy = {
  body: Joi.object().keys({
    PasswordExpiry: Joi.number().integer().min(30).max(999).required(),
    LastPasswordUsed: Joi.number().integer().min(1).max(5).required(),
    MinimumLength: Joi.number().integer().min(6).max(20).required(),
    MaximumLength: Joi.number()
      .integer()
      .min(Joi.ref("MinimumLength"))
      .max(20)
      .required(),
    LoginAttemps: Joi.number().integer().min(0).max(9).required(),
    PasswordReminder: Joi.number().integer().min(1).max(99).required(),
    RequiresPasswordReset: Joi.number().integer(),
    Lowercase: Joi.number().integer().min(0).max(1).required(),
    Uppercase: Joi.number().integer().min(0).max(1).required(),
    Numbers: Joi.number().integer().min(0).max(1).required(),
    SpecialCharacters: Joi.number().integer().min(0).max(1).required(),
  }),
};
const updatePasswordPolicy = {
  body: Joi.object().keys({
    PasswordExpiry: Joi.number().integer().min(30).max(999).allow(),
    LastPasswordUsed: Joi.number().integer().min(1).max(5).allow(),
    MinimumLength: Joi.number().integer().min(6).max(20).allow(),
    MaximumLength: Joi.number()
      .integer()
      .min(Joi.ref("MinimumLength"))
      .max(20)
      .allow(),
    LoginAttemps: Joi.number().integer().min(0).max(9).allow(),
    PasswordReminder: Joi.number().integer().min(1).max(99).allow(),
    RequiresPasswordReset: Joi.number().integer(),
    Lowercase: Joi.number().integer().min(0).max(1).allow(),
    Uppercase: Joi.number().integer().min(0).max(1).allow(),
    Numbers: Joi.number().integer().min(0).max(1).allow(),
    SpecialCharacters: Joi.number().integer().min(0).max(1).allow(),
  }),
};

module.exports = {
  addPasswordPolicy,
  updatePasswordPolicy,
};
