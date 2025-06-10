const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const productService = require('./product_service');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
// const fileLogger = require('../../middlewares/logger');
// const moment = require('moment');
// const auditsTrail = require('../../middlewares/auditsTrail');

const listProducts = catchAsync(async (req, res) => {
  const filter = pick(req.body, ['CompanyCode']);
  const options = pick(req.body, ['sortBy', 'limit', 'page']);
  const result = await productService.listProducts(filter, options, req.body.schema);
  res.status(httpStatus.OK).json(result);
});

const getProduct = catchAsync(async (req, res) => {
  const result = await productService.getProductByCode(req.body, req.params.productCode);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.status(httpStatus.OK).json(result);
});

const productListWithNameAndCode = catchAsync(async (req, res) => {
  const result = await productService.productListWithNameAndCode(req.body, req.body.schema);
  res.status(httpStatus.OK).json(result);
});

const addProduct = catchAsync(async (req, res) => {
  let Images = [];
  if (req.files && req.files.Images && req.files.Images.length) {
    let imgArr = JSON.parse(req.body.imageArray);
    req.files.Images.map((e, index) => {
      let data = {};
      data.path = e.path.replace(/\\/g, '/');
      data.filename = e.filename;
      data.StartDate = imgArr[index].StartDate || '';
      data.EndDate = imgArr[index].EndDate || '';
      Images.push(data);
    });
  }
  req.body.HistoricalImages = Images;
  let _schema = req.body.schema;
  const resObj = await productService.addProduct(req.body, _schema);
  res.status(httpStatus.CREATED).json(resObj);
});

const updateProduct = catchAsync(async (req, res) => {
  let Images = [];
  if (req.files && req.files.Images && req.files.Images.length) {
    let imgArr = JSON.parse(req.body.imageArray);
    req.files.Images.map((e, index) => {
      let data = {};
      data.path = e.path.replace(/\\/g, '/');
      data.filename = e.filename;
      data.StartDate = imgArr[index].StartDate || '';
      data.EndDate = imgArr[index].EndDate || '';
      Images.push(data);
    });
  }
  req.body.HistoricalImages = Images;
  const resObj = await productService.updateProduct(req.body, req.params.productCode);
  res.status(httpStatus.CREATED).json(resObj);
});

const deleteProduct = catchAsync(async (req, res) => {
  const resObj = await productService.deleteProduct(req.body, req.params.productCode);
  if (!resObj) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.status(httpStatus.CREATED).json(resObj);
});

const syncDataToLineManager = catchAsync(async (req, res) => {
  const resObj = await productService.syncDataToLineManager(req.body);
  res.status(httpStatus.OK).json(resObj);
});

const syncDataToLineManagerStatusUpdate = catchAsync(async (req, res) => {
  const resObj = await productService.syncDataToLineManagerStatusUpdate(req.body);
  res.status(httpStatus.OK).json(resObj);
});
const changeActiveProduct = catchAsync(async (req, res) => {
  const resObj = await productService.changeActiveProduct(req.body, req.params.id);
  res.status(httpStatus.CREATED).json(resObj);
});

const getAllProducts = catchAsync(async (req, res) => {
  const resObj = await productService.getAllProducts(req.body);
  res.status(httpStatus.CREATED).json(resObj);
});

module.exports = {
  addProduct,
  updateProduct,
  listProducts,
  getProduct,
  deleteProduct,
  productListWithNameAndCode,
  syncDataToLineManager,
  syncDataToLineManagerStatusUpdate,
  changeActiveProduct,
  getAllProducts,
};
