const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const userService = require("./user.service");
const { assignDefaultRights } = require("../userMaster/master_service");
// const fileLogger = require("../../middlewares/logger");
// const moment = require("moment");
// const auditsTrail = require("../../middlewares/auditsTrail");

const createAdminUser = catchAsync(async (data) => {
  const resObj = await userService.createUser(data);
  assignDefaultRights(resObj.data, {}, "no");
});

const createUser = catchAsync(async (req, res) => {
  const resObj = await userService.createUser(req.body);
  assignDefaultRights(resObj.data, req.headers, "no");
  res.status(httpStatus.CREATED).json(resObj);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.body, ["CompanyCode", "UserRole"]);
  const options = pick(req.body, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).json(result);
});

const getUser = catchAsync(async (req, res) => {
  const resObj = await userService.getUserById(req.params.userId);
  if (!resObj) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.status(httpStatus.OK).send(resObj);
});

const updateUser = catchAsync(async (req, res) => {
  if (req.files && req.files.ProfilePhoto && req.files.ProfilePhoto.length) {
    let file = req.files.ProfilePhoto[0].path;
    let Profile = file.replace(/\\/g, "/").split("public/")[1];
    req.body.ProfilePhoto = Profile;
  }
  req.body.CompanyCode = req.body.CompanyCode.length > 0 ? req.body.CompanyCode[0] : req.body.CompanyCode
  const resObj = await userService.updateUserById(
    req.params.userId,
    req.body,
    req.headers
  );

  await assignDefaultRights(resObj.data);

  res.status(httpStatus.CREATED).json(resObj);
});

const deleteUser = catchAsync(async (req, res) => {
  const resObj = await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.CREATED).json(resObj);
});

const getUserByCode = catchAsync(async (req, res) => {
  const resObj = await userService.getUserByCode(req.body);
  res.status(httpStatus.OK).send(resObj);
});
const changeActiveUser = catchAsync(async (req, res) => {
  const resObj = await userService.changeActiveUser(
    req.body,
    req.params.userId
  );
  res.status(httpStatus.OK).json(resObj);
});

const getUserSuperAdmin = catchAsync(async (req, res) => {
  const resObj = await userService.getUserSuperAdmin();
  res.status(httpStatus.OK).send(resObj);
});

const unlockUser = catchAsync(async (req, res) => {
  const resObj = await userService.unlockUser(req.params.UserId, req.body);
  res.status(httpStatus.OK).json(resObj);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByCode,
  getUserSuperAdmin,
  changeActiveUser,
  unlockUser,
  createAdminUser,
};
