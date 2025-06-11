const Joi = require('joi');

const createCustomerMaster = {
  body: Joi.object().keys({
    CustomerCode: Joi.string().required().max(10),
    CustomerName: Joi.string().required().max(100),
    CustomerType: Joi.string().required(),
    ContactNo: Joi.string().required().max(100),
    Gstin: Joi.string().required().max(100),
    CustomerLogo: Joi.string().required().max(100),
    Address: Joi.string().required().max(100),
    Pincode: Joi.string().required().max(100),
    Country: Joi.string().required().max(100),
    State: Joi.string().required().max(100),
    City: Joi.string().required().max(100),
    Active: Joi.number().valid(0, 1).required(),
  }),
};

const updateCustomerMaster = {
  body: Joi.object().keys({
    Code: Joi.string().required().max(10),
    Name: Joi.string().required().max(100),
    CompanyCode: Joi.string().required(),
    Active: Joi.number().valid(0, 1).required(),
  }),
};

const listCustomerMaster = {
  body: Joi.object().keys({
    sortBy: Joi.string().allow(''),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    CompanyCode: Joi.string().allow(''),
    Code: Joi.string().allow(''),
    Name: Joi.string().allow(''),
  }),
};

const listCustomerMasterInsertByCode = {
  params: Joi.object().keys({
    Code: Joi.string().required(),
  }),
};

const listCustomerMasterByCode = {
  params: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

const deleteCustomerMaster = {
  params: Joi.object().keys({
    //Code: Joi.string().required(),
    id: Joi.string().required(),
  }),
};
const changeActiveCustomerMaster = {
  params: Joi.object().keys({
    //Code: Joi.string().required(),
    id: Joi.string().required(),
  }),
};

const syncDataToCustomerManager = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};
module.exports = {
  createCustomerMaster,
  updateCustomerMaster,
  listCustomerMaster,
  listCustomerMasterByCode,
  deleteCustomerMaster,
  changeActiveCustomerMaster,
  listCustomerMasterInsertByCode,
  syncDataToCustomerManager,
};
