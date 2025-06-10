const httpStatus = require("http-status");
// const { Product } = require('./product_model');
const ApiError = require("../../utils/ApiError");
const Q = require("q");
const moment = require("moment");

/**
 * Get Product by Code
 * @param {ObjectId} _id
 * @returns {Promise<Product>}
 */
const getProductByCode = async (db, code) => {
  var deferred = Q.defer();
  const { Products } = db.schema;
  let result = await Products.findOne({ ProductCode: code, Status: 1 });
  let resObj = {
    status: httpStatus.OK,
    message: "Product Details",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get Product list by Company Code
 * @param {ObjectId} data
 * @returns {Promise<Product>}
 */
const productListWithNameAndCode = async (data, _schema) => {
  var deferred = Q.defer();
  const { Products } = _schema;
  let result = await Products.aggregate([
    {
      $match: { CompanyCode: data?.CompanyCode, Status: 1 },
    },
    {
      $project: {
        _id: 1,
        ProductCode: 1,
        ProductName: 1,
      },
    },
  ]);

  let resObj = {
    status: httpStatus.OK,
    message: "Product List",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};
/**
 * Product List
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Product>}
 */
const listProducts = async (filter, options, _schema) => {
  var deferred = Q.defer();
  const { Products } = _schema;
  const result = await Products.paginate({ ...filter, Status: 1 }, options);
  let resObj = {
    status: httpStatus.OK,
    message: "List product",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Create a Product
 * @param {Object} productData
 * @returns {Promise<Product>}
 */
const addProduct = async (productData) => {
  var deferred = Q.defer();
  const { Products } = productData.schema;
  let isProductExist = await getProductByCode(
    productData,
    productData.ProductCode
  );
  if (isProductExist.data) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product Code already exist");
  }
  productData.PackagingInfo = JSON.parse(
    productData.PackagingInfo.replace(/(\w+)\s*:/g, '"$1":').replace(/'/g, '"')
  );
  const result = await Products.create(productData);

  let resObj = {
    status: httpStatus.OK,
    message: "Product Created",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Update a Product
 * @param {Object} _id
 * @returns {Promise<Product>}
 */
const updateProduct = async (productData, productCode) => {
  var deferred = Q.defer();
  const { Products } = productData.schema;

  productData.PackagingInfo = JSON.parse(
    productData.PackagingInfo.replace(/(\w+)\s*:/g, '"$1":').replace(/'/g, '"')
  );
  const result = await Products.findOneAndUpdate(
    {
      $and: [{ ProductCode: productCode }],
    },
    {
      $set: { ...productData },
    },
    { new: true, upsert: true }
  );
  let resObj = {
    status: httpStatus.OK,
    message: "Product Updated",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Delete Product by Code
 * @param {ObjectId} Product Code
 * @returns {Promise<Product>}
 */
const deleteProduct = async (db, code) => {
  var deferred = Q.defer();
  const { Products } = db.schema;
  let isProductExist = await getProductByCode(db, code);
  if (!isProductExist.data) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product Not Found With This Product Code"
    );
  }

  let result = await Products.findOneAndUpdate(
    { ProductCode: code, Status: 1 },
    { $set: { Status: 0 } },
    { new: true }
  );

  let resObj = {
    status: httpStatus.OK,
    message: "Deleted Successfully",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Sync data from server to line manager
 * @param {ObjectId} data
 * @returns {Promise<Products>}
 */
const syncDataToLineManager = async (data) => {
  const deferred = Q.defer();
  const { Products } = data.schema;

  const result = await Products.find({
    SyncStatus: 0,
    Status: 1,
    Active: true,
    CompanyCode: data.CompanyCode,
  });

  const resObj = {
    status: httpStatus.OK,
    message: "Product List",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Status update
 * @param {ObjectId} data
 * @returns {Promise<LineManager>}
 */
const syncDataToLineManagerStatusUpdate = async (data) => {
  const deferred = Q.defer();
  const { Products } = data.schema;

  const result = await Products.updateMany(
    { ProductCode: { $in: data.ProductCode } },
    {
      $set: {
        SyncStatus: 1,
        SyncTime: moment().format("DD-MM-YYYY HH:mm:ss.SSSS"),
      },
    },
    { new: true }
  ).exec();

  const resObj = {
    status: httpStatus.OK,
    message: "Updated",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};
const changeActiveProduct = async (data, id) => {
  const deferred = Q.defer();
  const { Products } = data.schema;
  let act = await Products.aggregate([
    {
      $addFields: {
        ProductId: { $toString: "$_id" },
      },
    },
    {
      $match: { ProductId: id },
    },
    {
      $lookup: {
        from: "coll_lineManager",
        let: { getProductCode: "$ProductCode" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$$getProductCode", "$Products"],
              },
            },
          },
        ],
        as: "lineManagerDetails",
      },
    },
    {
      $project: {
        _id: 0,
        Active: 1,
        lineManagerDetails: 1,
      },
    },
  ]);

  if (act.length > 0) {
    let lineManagerDetails = act[0].lineManagerDetails;
    if (lineManagerDetails.length > 0) {
      const resObj = {
        status: httpStatus.NOT_FOUND,
        message:
          "This Product is already use in linemaster so can`t be deactive.",
        data: [],
      };
      deferred.resolve(resObj);
    } else {
      const result = await Products.findOneAndUpdate(
        {
          $and: [{ _id: id }],
        },
        {
          $set: { Active: !act[0].Active },
        },
        { new: true }
      );

      const resObj = {
        status: httpStatus.OK,
        message: "Product Active Changed",
        data: result,
      };
      deferred.resolve(resObj);
    }
  }
  deferred.resolve([]);
  return deferred.promise;
};

const getAllProducts = async (data) => {
  const deferred = Q.defer();
  const { Products } = data.schema;
  console.log(data, "dtaatatt");
  let result = await Products.find({}).exec();

  const resObj = {
    status: httpStatus.OK,
    message: "All Products",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

module.exports = {
  addProduct,
  updateProduct,
  listProducts,
  getProductByCode,
  deleteProduct,
  productListWithNameAndCode,
  syncDataToLineManager,
  syncDataToLineManagerStatusUpdate,
  changeActiveProduct,
  getAllProducts,
};
