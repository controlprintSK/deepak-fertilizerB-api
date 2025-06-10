const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const masterService = require('./master_service');

const addModuleMaster = catchAsync(async (req, res) => {
  const resObj = await masterService.addModuleMaster(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addPageMaster = catchAsync(async (req, res) => {
  const resObj = await masterService.addPageMaster(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addRightMaster = catchAsync(async (req, res) => {
  const resObj = await masterService.addRightMaster(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addPageRight = catchAsync(async (req, res) => {
  const resObj = await masterService.addPageRight(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addRoleMaster = catchAsync(async (req, res) => {
  const resObj = await masterService.addRoleMaster(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addRoleRightMaster = catchAsync(async (req, res) => {
  const resObj = await masterService.addRoleRightMaster(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const addUserRights = catchAsync(async (req, res) => {
  const resObj = await masterService.addUserRights(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const getRightsByRoleId = catchAsync(async (req, res) => {
  const resObj = await masterService.getRightsByRoleId(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const getMenuByUserId = catchAsync(async (req, res) => {
  const resObj = await masterService.getMenuByUserId(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});
const getRoleMaster = catchAsync(async (req, res) => {
  const resObj = await masterService.getRoleMaster();
  res.status(httpStatus.OK).json(resObj);
});

const getAllMenu = catchAsync(async (req, res) => {
  const resObj = await masterService.getAllMenu(req.body);
  res.status(httpStatus.OK).json(resObj);
});

const getAllMenuForUserGroup = catchAsync(async (req, res) => {
  const resObj = await masterService.getAllMenuForUserGroup(req.body);
  res.status(httpStatus.OK).json(resObj);
});

const addRemoveUserGroupsRights = catchAsync(async (req, res) => {
  const resObj = await masterService.addRemoveUserGroupsRights(
    req.body,
    req.headers
  );
  res.status(httpStatus.OK).json(resObj);
});

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
  getRoleMaster,
  getAllMenu,
  getAllMenuForUserGroup,
  addRemoveUserGroupsRights
};
