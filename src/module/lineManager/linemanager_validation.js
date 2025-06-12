const Joi = require('joi');

const createLineMaster = {
  body: Joi.object().keys({
    Code: Joi.string().required().max(10),
    Name: Joi.string().required().max(100),
    CompanyCode: Joi.string().required(),
    Active: Joi.number().valid(0, 1).required(),
  }),
};

const updateLineMaster = {
  body: Joi.object().keys({
    Code: Joi.string().required().max(10),
    Name: Joi.string().required().max(100),
    CompanyCode: Joi.string().required(),
    Active: Joi.number().valid(0, 1).required(),
  }),
};

const listLineMaster = {
  body: Joi.object().keys({
    sortBy: Joi.string().allow(''),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    CompanyCode: Joi.string().allow(''),
    Code: Joi.string().allow(''),
    Name: Joi.string().allow(''),
  }),
};

const listLineMasterInsertByCode = {
  params: Joi.object().keys({
    Code: Joi.string().required(),
  }),
};

const listLineMasterByCode = {
  params: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

const deleteLineMaster = {
  params: Joi.object().keys({
    //Code: Joi.string().required(),
    id: Joi.string().required(),
  }),
};
const changeActiveLineMaster = {
  params: Joi.object().keys({
    //Code: Joi.string().required(),
    id: Joi.string().required(),
  }),
};

const syncDataToLineManager = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};
module.exports = {
  createLineMaster,
  updateLineMaster,
  listLineMaster,
  listLineMasterByCode,
  deleteLineMaster,
  changeActiveLineMaster,
  listLineMasterInsertByCode,
  syncDataToLineManager,
};
