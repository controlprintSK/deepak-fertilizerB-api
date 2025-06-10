const Joi = require('joi');

const companyContact = Joi.object().keys({
  CompanyCode: Joi.string().required(),
  Name: Joi.string().required(),
  ContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  Email: Joi.string().email().required(),
  Designation: Joi.string().required(),
  Purpose: Joi.string().required(),
});

const createCompany = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
    CompanyName: Joi.string().required(),
    // CompanyGroup: Joi.string().required(),
    Address: Joi.string().required(),
    City: Joi.string().required(),
    State: Joi.string().required(),
    Country: Joi.string().required(),
    PinCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required(),
    IpAddress: Joi.string()
      .ip({ version: ['ipv4'] })
      .required(),
    Active: Joi.boolean().required(),
    LicenseNo: Joi.string().required(),
    CompanyType: Joi.string().required(),
    ContactDetails: Joi.array().items(companyContact).min(1).required(),
  }),
};

const updateCompanyContact = Joi.object().keys({
  CompanyCode: Joi.string().required(),
  Name: Joi.string().required(),
  ContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  Email: Joi.string().email().required(),
  Designation: Joi.string().required(),
  Purpose: Joi.string().required(),
});

const updateCompany = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
    CompanyName: Joi.string().required(),
    // CompanyGroup: Joi.string().required(),
    Address: Joi.string().required(),
    City: Joi.string().required(),
    State: Joi.string().required(),
    Country: Joi.string().required(),
    PinCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required(),
    IpAddress: Joi.string()
      .ip({ version: ['ipv4'] })
      .required(),
    Active: Joi.boolean().required(),
    LicenseNo: Joi.string().required(),
    CompanyType: Joi.string().required(),
  }),
};

const listCompanyByCode = {
  params: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

const deleteCompany = {
  params: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};
const deleteContactById = {
  params: Joi.object().keys({
    _id: Joi.string().required(),
  }),
};
const listByCode = {
  params: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

const updateContactById = Joi.object().keys({
  CompanyCode: Joi.string().required(),
  Name: Joi.string().required(),
  ContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  Email: Joi.string().email().required(),
  Designation: Joi.string().required(),
  Purpose: Joi.string().required(),
});

const createContact = Joi.object().keys({
  CompanyCode: Joi.string().required(),
  Name: Joi.string().required(),
  ContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  Email: Joi.string().email().required(),
  Designation: Joi.string().required(),
  Purpose: Joi.string().required(),
});

const listCompanyContact = {
  params: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

module.exports = {
  companyContact,
  createCompany,
  updateCompanyContact,
  updateCompany,
  listCompanyByCode,
  deleteCompany,
  deleteContactById,
  updateContactById,
  listByCode,
  createContact,
  listCompanyContact
};
