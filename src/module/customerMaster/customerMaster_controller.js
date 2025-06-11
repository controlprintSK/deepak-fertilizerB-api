const httpStatus = require('http-status');
const pick = require('../../utils/pick');
// const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const lineManagerService = require('./customerMaster_service');
// const moment = require('moment');
// const auditsTrail = require('../../middlewares/auditsTrail');

const createLineManager = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.createLineManager(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const updateLineManager = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.updateLineManager(req.body, req.params.id);
  res.status(httpStatus.CREATED).json(resObj);
});

const listLineManager = catchAsync(async (req, res) => {
  // if (req.body.CompanyCode) {
  const filter = pick(req.body, ['CompanyCode', 'Name', 'Code']);
  const options = pick(req.body, ['sortBy', 'limit', 'page']);
  const resObj = await lineManagerService.listLineManager(req.body.schema, filter, options);
  res.status(httpStatus.OK).json(resObj);
  // } else {
  //   const resObj = await lineManagerService.listLineManager(req.body.schema, '', '');
  //   res.status(httpStatus.OK).json(resObj);
  // }
});

const listLineById = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.listLineById(req.body.schema, req.params.id);
  res.status(httpStatus.OK).json(resObj);
});

const listLineManagerByCode = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.getLineManagerByCode(req.body, req.params);
  res.status(httpStatus.OK).json(resObj);
});

const listLineManagerById = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.getLineManagerById(req.body, req.params.id);
  res.status(httpStatus.OK).json(resObj);
});

const deleteLineManager = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.deleteLineManager(req.body, req.params.id);
  res.status(httpStatus.CREATED).json(resObj);
});

const changeActiveLineManager = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.changeActiveLineManager(req.body, req.params.id);
  res.status(httpStatus.CREATED).json(resObj);
});

const syncDataToLineManager = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.syncDataToLineManager(req.body);
  res.status(httpStatus.OK).json(resObj);
});
const syncDataToLineManagerStatusUpdate = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.syncDataToLineManagerStatusUpdate(req.body);
  res.status(httpStatus.OK).json(resObj);
});

const getAllLines = catchAsync(async (req, res) => {
  const resObj = await lineManagerService.getAllLines(req.body);
  res.status(httpStatus.OK).json(resObj);
});

module.exports = {
  createLineManager,
  updateLineManager,
  listLineManager,
  listLineManagerByCode,
  deleteLineManager,
  changeActiveLineManager,
  listLineManagerById,
  syncDataToLineManager,
  syncDataToLineManagerStatusUpdate,
  getAllLines,
  listLineById,
};
