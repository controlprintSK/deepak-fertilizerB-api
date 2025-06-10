const httpStatus = require('http-status');
const Q = require('q');
// const { LineManager } = require('./linemanager_model');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');

/**
 * Get Line Manager by Code
 * @param {ObjectId} Code
 * @returns {Promise<LineManager>}
 */
const getLineManagerByCode = async (db, Code) => {
  const deferred = Q.defer();
  const { LineManager } = db.schema;
  const result = await LineManager.find({
    CompanyCode: Code.CompanyCode,
    Status: 1,
  }).sort({ createdAt: -1 });

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Details',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};
const getLineManagerById = async (db, id) => {
  const deferred = Q.defer();
  const { LineManager } = db.schema;
  const result = await LineManager.aggregate([
    {
      $addFields: {
        ids: {
          $toString: '$_id',
        },
      },
    },
    {
      $match: {
        ids: id,
      },
    },
    {
      $lookup: {
        from: 'coll_product',
        let: { getProductCodes: '$Products' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ['$ProductCode', '$$getProductCodes'],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              ids: {
                $toString: '$_id',
              },
            },
          },
        ],
        as: 'products',
      },
    },
  ]);

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Details',
    data: result.length > 0 ? result[0] : [],
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

const getLineManagerInsertByCode = async (LineManager, Code, CompanyCode) => {
  const result = await LineManager.findOne({
    Code: Code,
    CompanyCode: CompanyCode,
    Status: 1,
  });

  return result;
};

/**
 * Create a Line Manager
 * @param {Object} lineManagerData
 * @returns {Promise<LineManager>}
 */
const createLineManager = async (lineManagerData) => {
  const deferred = Q.defer();
  const { LineManager } = lineManagerData.schema;
  const isLineMasterExist = await getLineManagerInsertByCode(LineManager, lineManagerData.Code, lineManagerData.CompanyCode);

  if (isLineMasterExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Line Manager Code already exist');
  }

  const result = await LineManager.create(lineManagerData);

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Created',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Update a LineM anager
 * @param {Object} lineManagerData
 * @returns {Promise<LineManager>}
 */
const updateLineManager = async (lineManagerData, id) => {
  const deferred = Q.defer();
  const { LineManager } = lineManagerData.schema;

  const result = await LineManager.findOneAndUpdate(
    {
      $and: [{ _id: id }],
    },
    {
      $set: lineManagerData,
    },
    { new: true }
  );
  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Details Updated',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * List a Line Manager
 * @param {Object}
 * @returns {Promise<LineManager>}
 */
const listLineManager = async (_schema, filter, options) => {
  const deferred = Q.defer();
  const { LineManager } = _schema;
  let sortBy;
  let limit;
  let page;
  let match;
  if (filter != '') {
    sortBy = options.sortBy; // Sorting field
    limit = options.limit; // Number of items per page
    page = options.page; // Current page
    match = {
      $match: { ...filter, Status: 1 },
    };
  } else {
    match = {
      $match: { Status: 1 },
    };
    sortBy = { createdAt: -1 }; // Sorting field
    limit = 100; // Number of items per page
    page = 1; // Current page
  }

  let result = await LineManager.aggregate([
    match,
    {
      $addFields: {
        id: {
          $toString: '$_id',
        },
      },
    },
    {
      $lookup: {
        from: 'coll_product',
        let: { getProductCodes: '$Products' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ['$ProductCode', '$$getProductCodes'],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              ids: {
                $toString: '$_id',
              },
            },
          },
        ],
        as: 'fproducts',
      },
    },
    {
      $sort: { [sortBy]: -1 }, // Sort by 'createdAt' in descending order
    },
    {
      $sort: { _id: -1 }, // Sort by 'createdAt' in descending order
    },
    {
      $skip: (page - 1) * limit, // Skip documents based on the current page
    },
    {
      $limit: limit, // Limit the number of documents per page
    },
  ]);

  result = {
    results: result,
    page: options.page,
    limit: options.limit,
    totalPages: Math.floor(result.length / options.limit),
    totalResults: result.length,
  };

  const resObj = {
    status: httpStatus.OK,
    message: 'Companies Details',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * List Line Manager by Code
 * @param {ObjectId} Code
 * @returns {Promise<LineManager>}
 */
const deleteLineManager = async (db, id) => {
  const deferred = Q.defer();
  const { LineManager } = db.schema;

  const result = await LineManager.findOneAndUpdate(
    {
      $and: [{ _id: id }],
    },
    {
      $set: { Status: 0 },
    },
    { new: true }
  );

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Deleted',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

const changeActiveLineManager = async (db, id) => {
  const deferred = Q.defer();
  const { LineManager } = db.schema;

  let act = await LineManager.findOne({ $and: [{ _id: id }] });

  const result = await LineManager.findOneAndUpdate(
    {
      $and: [{ _id: id }],
    },
    {
      $set: { Active: !act.Active },
    },
    { new: true }
  );

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Active Changed',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Sync data from server to line manager
 * @param {ObjectId} data
 * @returns {Promise<LineManager>}
 */
const syncDataToLineManager = async (data) => {
  const deferred = Q.defer();
  const { LineManager } = data.schema;

  const result = await LineManager.find({ SyncStatus: 0, Status: 1, Active: true, CompanyCode: data.CompanyCode });

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager List',
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
  const { LineManager } = data.schema;

  const result = await LineManager.updateMany(
    { Code: { $in: data.Code } },
    {
      $set: {
        SyncStatus: 1,
        SyncTime: moment().format('DD-MM-YYYY HH:mm:ss.SSSS'),
      },
    },
    { new: true }
  ).exec();

  const resObj = {
    status: httpStatus.OK,
    message: 'Updated',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

const getAllLines = async (data) => {
  const deferred = Q.defer();
  const { LineManager } = data.schema;

  const result = await LineManager.find({}).exec();

  const resObj = {
    status: httpStatus.OK,
    message: 'Updated',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

module.exports = {
  createLineManager,
  updateLineManager,
  getLineManagerByCode,
  listLineManager,
  deleteLineManager,
  changeActiveLineManager,
  getLineManagerById,
  syncDataToLineManager,
  syncDataToLineManagerStatusUpdate,
  getAllLines,
};
