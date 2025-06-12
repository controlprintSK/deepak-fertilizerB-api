const httpStatus = require('http-status');
const { Op } = require('sequelize');
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
    where: {
      Code: Code,
      CompanyCode: CompanyCode,
      Status: 1,
    },
  });

  return result;
};

/**
 * Create a Line Manager
 * @param {Object} lineManagerData
 * @returns {Promise<LineManager>}
 */
const createLineManager = async (lineManagerData) => {
  // console.log('lineManagerData', lineManagerData);
  const deferred = Q.defer();
  const { getLineModel } = lineManagerData.schema;
  const isLineMasterExist = await getLineManagerInsertByCode(
    getLineModel,
    lineManagerData.Code,
    lineManagerData.CompanyCode
  );

  if (isLineMasterExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Line Code already exist');
  }

  const result = await getLineModel.create(lineManagerData);

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Created',
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
  const { getLineModel } = lineManagerData.schema;

  const result = await getLineModel.update(
    { ...lineManagerData },
    {
      where: {
        id: id,
      },
      returning: true,
    }
  );
  const resObj = {
    status: httpStatus.OK,
    message: 'Line Master Details Updated',
    data: result[1],
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
  let Finalresult = {};
  let page = options.page || 1;
  let limit = options.limit || 10;
  const offset = (page - 1) * limit;
  const { getLineModel } = _schema;
  const where = {
    Status: 1,
    ...(filter.CompanyCode && { CompanyCode: { [Op.like]: `%${filter.CompanyCode}%` } }),
    ...(filter.Name && { Name: { [Op.like]: `%${filter.Name}%` } }),
    ...(filter.Code && { Code: { [Op.like]: `%${filter.Code}%` } }),
  };
  const result = await getLineModel.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']], // Optional: Customize sorting
  });

  Finalresult = {
    results: result.rows,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(result.count / limit),
    totalResults: result.count,
  };

  const resObj = {
    status: httpStatus.OK,
    message: 'List Details',
    data: Finalresult,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

const listLineById = async (_schema, id) => {
  const deferred = Q.defer();
  const { getLineModel } = _schema;
  const result = await getLineModel.findOne({
    where: {
      id: id,
      Status: 1,
    },
  });

  const resObj = {
    status: httpStatus.OK,
    message: 'Line Details',
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
  const { getLineModel } = db.schema;

  const result = await getLineModel.update(
    { Status: 0 },
    {
      where: {
        id: id,
      },
      returning: true,
    }
  );
  const resObj = {
    status: httpStatus.OK,
    message: 'Line Manager Deleted',
    data: result[1],
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
  listLineById,
};
