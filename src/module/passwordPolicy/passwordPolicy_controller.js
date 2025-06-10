const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const Service = require("./passwordPolicy_service");

const addPasswordPolicy = catchAsync(async (req, res) => {
  const resObj = await Service.addPasswordPolicy(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const updatePasswordPolicy = catchAsync(async (req, res) => {
  const resObj = await Service.updatePasswordPolicy(req.params.Id, req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

const getPasswordPolicy = catchAsync(async (req, res) => {
  const resObj = await Service.getPasswordPolicy(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

module.exports = {
  addPasswordPolicy,
  updatePasswordPolicy,
  getPasswordPolicy,
};
