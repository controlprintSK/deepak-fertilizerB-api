const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const auditsTrailService = require('./audits_service');
// const pick = require('../../utils/pick');

const addAuditsTrail = catchAsync(async (req, res) => {
  const resObj = await auditsTrailService.addAuditsTrail(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addAuditsTrailMainDB = catchAsync(async (req, res) => {
  const resObj = await auditsTrailService.addAuditsTrailMainDB(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const listAllTrails = catchAsync(async (req, res) => {
  const result = await auditsTrailService.listAllTrails(req.body);
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  addAuditsTrail,
  addAuditsTrailMainDB,
  listAllTrails,
};
