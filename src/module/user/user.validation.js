const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");

const createUser = {
  body: Joi.object().keys({
    FullName: Joi.string().required(),
    UserName: Joi.string().required(),
    Email: Joi.string().required(),
    EmployeeCode: Joi.string().required(),
    Password: Joi.string().required(),
    UserRole: Joi.string().required(),
    Active: Joi.number().default(1),
    CompanyCode: Joi.string().allow(""),
  }),
};
const getUsers = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().allow(""),
    UserRole: Joi.string().allow(""),
    sortBy: Joi.string().required(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
const updateActive = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const unlockUser = {
  params: Joi.object().keys({
    UserId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    IsLocked: Joi.number().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      FullName: Joi.string().required(),
      CompanyCode: Joi.alternatives().try(
        Joi.string().allow(''),        // Allows a string, including an empty string
        Joi.array().items(Joi.string()) // Allows an array of strings
      ),
      UserName: Joi.string().required(),
      Email: Joi.string().required(),
      EmployeeCode: Joi.string().required(),
      UserRole: Joi.string().required(),
      Password: Joi.string().allow(""),
      Active: Joi.number().required(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getUserByCompanyCode = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

const getUsersByCode = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};



module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByCompanyCode,
  updateActive,
  unlockUser,
  getUsersByCode
};
