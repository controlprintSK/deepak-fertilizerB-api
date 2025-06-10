const httpStatus = require('http-status');
const pick = require('../../utils/pick');
// const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const companyService = require('./company_service');
// const fileLogger = require('../../middlewares/logger');
// const moment = require('moment');
// const auditsTrail = require('../../middlewares/auditsTrail');

const createCompany = catchAsync(async (req, res) => {
  const resObj = await companyService.createCompany(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const updateCompany = catchAsync(async (req, res) => {
  const resObj = await companyService.updateCompany(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const listCompany = catchAsync(async (req, res) => {
  const filter = pick(req.body, ['CompanyCode']);
  const options = pick(req.body, ['sortBy', 'limit', 'page']);
  const resObj = await companyService.listCompany(filter, options);
  res.status(httpStatus.OK).json(resObj);
});
const listAllCompany = catchAsync(async (req, res) => {
  const resObj = await companyService.listAllCompany(req.params);
  res.status(httpStatus.OK).json(resObj);
});
const listCompanyContact = catchAsync(async (req, res) => {
  const resObj = await companyService.listCompanyContact(req.params);
  res.status(httpStatus.OK).json(resObj);
});

const listCompanyByCode = catchAsync(async (req, res) => {
  const resObj = await companyService.getCompanyByCode(req.params.CompanyCode);
  res.status(httpStatus.OK).json(resObj);
});

const deleteCompany = catchAsync(async (req, res) => {
  const resObj = await companyService.deleteCompany(req.params.CompanyCode);
  res.status(httpStatus.CREATED).json(resObj);
});

const updateContactById = catchAsync(async (req, res) => {
  const resObj = await companyService.updateContactById(req.body, req.params._id);
  res.status(httpStatus.CREATED).json(resObj);
});

const deleteContactById = catchAsync(async (req, res) => {
  const resObj = await companyService.deleteContactById(req.params._id);
  res.status(httpStatus.CREATED).json(resObj);
});

const listByCode = catchAsync(async (req, res) => {
  const resObj = await companyService.listByCode(req.params.CompanyCode);
  res.status(httpStatus.OK).json(resObj);
});
const createContact = catchAsync(async (req, res) => {
  const resObj = await companyService.createContact(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});
const changeActiveCompany = catchAsync(async (req, res) => {
  const resObj = await companyService.changeActiveCompany(req.params.id);
  res.status(httpStatus.CREATED).json(resObj);
});

module.exports = {
  createCompany,
  updateCompany,
  listCompany,
  listAllCompany,
  listCompanyContact,
  listCompanyByCode,
  deleteCompany,
  updateContactById,
  deleteContactById,
  listByCode,
  createContact,
  changeActiveCompany,
};
