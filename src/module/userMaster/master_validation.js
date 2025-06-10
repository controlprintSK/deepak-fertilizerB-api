const Joi = require('joi');

const moduleMasterSchema = {
  body: Joi.object().keys({
    ModuleId: Joi.number().required(),
    ModuleName: Joi.string().required(),
    Icon: Joi.string().required(),
    SequenceNo: Joi.number().required(),
    Visible: Joi.boolean().required(),
  }),
};

const addModuleMaster = Joi.alternatives().try(
  moduleMasterSchema, // Single object
  Joi.array().items(moduleMasterSchema) // Array of objects
);

const pageMasterSchema = {
  body: Joi.object().keys({
    ModuleId: Joi.number().required(),
    PageId: Joi.number().required(),
    PageName: Joi.string().required(),
    DisplayName: Joi.string().required(),
    PageUrl: Joi.string().required(),
    Icon: Joi.string().required(),
    SequenceNo: Joi.number().required(),
    Visible: Joi.boolean().required(),
  }),
};

const addPageMaster = Joi.alternatives().try(
  pageMasterSchema, // Single object
  Joi.array().items(pageMasterSchema) // Array of objects
);

const rightMasterSchema = {
  body: Joi.object().keys({
    RightsId: Joi.number().required(),
    RightsName: Joi.string().required(),
  }),
};

const addRightMaster = Joi.alternatives().try(
  rightMasterSchema, // Single object
  Joi.array().items(rightMasterSchema) // Array of objects
);

const pageRightSchema = {
  body: Joi.object().keys({
    PageId: Joi.string().required(),
    RightsId: Joi.string().required(),
    RightsName: Joi.string().allow(''),
  }),
};

const addPageRight = Joi.alternatives().try(
  pageRightSchema, // Single object
  Joi.array().items(pageRightSchema) // Array of objects
);

const roleMasterSchema = {
  body: Joi.object().keys({
    RoleId: Joi.number().required(),
    RoleName: Joi.string().required(),
  }),
};

const addRoleMaster = Joi.alternatives().try(
  roleMasterSchema, // Single object
  Joi.array().items(roleMasterSchema) // Array of objects
);

const rolerightmasterSchema = {
  body: Joi.object().keys({
    PageId: Joi.number().required(),
    RoleId: Joi.number().required(),
    RightsId: Joi.number().required(),
  }),
};

const addRoleRightMaster = Joi.alternatives().try(
  rolerightmasterSchema, // Single object
  Joi.array().items(rolerightmasterSchema) // Array of objects
);

const addUserRightSchema = {
  body: Joi.object().keys({
    UserId: Joi.string().required(),
    RightsId: Joi.number().required(),
    PageId: Joi.number().required(),
    CompanyCode: Joi.string().required(),
    Action: Joi.string().required(),
  }),
};

const addUserRights = Joi.alternatives().try(
  addUserRightSchema, // Single object
  Joi.array().items(addUserRightSchema) // Array of objects
);

const getRightsByRoleId = {
  body: Joi.object().keys({
    RoleId: Joi.number().required(),
  }),
};

const getMenuByUserId = {
  body: Joi.object().keys({
    UserId: Joi.string().required(),
  }),
};

module.exports = {
  addModuleMaster,
  addPageMaster,
  addRightMaster,
  addPageRight,
  addRoleMaster,
  addRoleRightMaster,
  addUserRights,
  getRightsByRoleId,
  getMenuByUserId,
};
