const Joi = require('joi');

const addProduct = Joi.object().keys({
  ProductCode: Joi.string().required(),
  ProductName: Joi.string().required(),
  GenericName: Joi.string().required(),
  BrandName: Joi.string().required(),
  PackagingType: Joi.string().required(),
  Description: Joi.string(),
  UOM: Joi.string(),
  Image: Joi.string(),
  PackSize: Joi.string(),
  Active: Joi.boolean(),
});

const updateProduct = Joi.object().keys({
  id: Joi.string().required(),
  ProductName: Joi.string().required(),
  GenericName: Joi.string().required(),
  BrandName: Joi.string().required(),
  PackagingType: Joi.string().required(),
  Description: Joi.string(),
  GTIN: Joi.string(),
  UOM: Joi.string(),
  Image: Joi.string(),
  PackSize: Joi.string(),
  Active: Joi.boolean(),
});

const listProducts = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().allow(''),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const productListWithNameAndCode = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productCode: Joi.string(),
  }),
};
const syncDataToLineManager = {
  body: Joi.object().keys({
    CompanyCode: Joi.string().required(),
  }),
};

module.exports = {
  addProduct,
  updateProduct,
  listProducts,
  deleteProduct,
  productListWithNameAndCode,
  syncDataToLineManager,
};
