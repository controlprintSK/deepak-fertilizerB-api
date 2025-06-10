const Joi = require('joi');

const createCompany = {
  body: Joi.object().keys({
    Code: Joi.string().required(),
    Name: Joi.string().required(),
    Address: Joi.string().required(),
    City: Joi.string().required(),
    State: Joi.string().required(),
    Country: Joi.string().required(),
    PIN: Joi.string().required(),
    LicenseNo: Joi.string().required(),
    CompanyType: Joi.number().required(),
  }),
};

const updateCompany = {
  body: Joi.object().keys({
    Code: Joi.string().required(),
    Name: Joi.string().required(),
    Address: Joi.string().required(),
    City: Joi.string().required(),
    State: Joi.string().required(),
    Country: Joi.string().required(),
    PIN: Joi.string().required(),
    LicenseNo: Joi.string().required(),
    CompanyType: Joi.number().required(),
  }),
};

module.exports = {
  createCompany,
  updateCompany,
};
