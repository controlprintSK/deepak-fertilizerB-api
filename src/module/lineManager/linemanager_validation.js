const Joi = require('joi');

const createLineMaster = {
  body: Joi.object().keys({
    Code: Joi.string().required(),
    Name: Joi.string().required(),
    CompanyCode: Joi.string().required(),
    PrinterIp: Joi.string().required(),
    PrinterPort: Joi.string().required(),
    ScannerIp: Joi.string().required(),
    ScannerPort: Joi.string().required(),
    PLCIp: Joi.string().required(),
    PLCPort: Joi.string().required(),
    Products: Joi.array().required(),
    Active: Joi.boolean().allow(true),
  }),
};

const updateLineMaster = {
  body: Joi.object().keys({
    Code: Joi.string().required(),
    Name: Joi.string().required(),
    CompanyCode: Joi.string().required(),
    PrinterIp: Joi.string().required(),
    PrinterPort: Joi.string().required(),
    ScannerIp: Joi.string().required(),
    ScannerPort: Joi.string().required(),
    PLCIp: Joi.string().required(),
    PLCPort: Joi.string().required(),
    Products: Joi.array().required(),
    Active: Joi.boolean().allow(true),
  }),
};

const listLineMaster = {
  body: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
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
