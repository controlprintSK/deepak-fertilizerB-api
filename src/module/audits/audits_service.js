const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const Q = require('q');
const { audits, auditsTrailSchema } = require('../audits/audits_model');
const getDBConnection = require('../../db/dbDynamicConnection');

/**
 * Create a Product
 * @param {Object} Data
 * @returns {Promise<Audits>}
 */
const addAuditsTrail = async (Data) => {
  var deferred = Q.defer();

  try {

    let dbName = Data.db;
    let conn = await getDBConnection(dbName);
    const auditsTrail = conn.model('auditsTrail', auditsTrailSchema, 'coll_auditsTrail');

    let reqObj = {
      UserName: Data.UserName || '',
      CompanyCode: Data.CompanyCode || '',
      // User: `${userData[0]?.FirstName} ${userData[0]?.LastName}`,
      UserEmail: Data.Email || '',
      UserRole: Data.UserRole || '',
      Activity: JSON.stringify(Data.Activity ? Data.Activity : [Data.Activity]),
      ComputerName: Data.computerName || '',
      NetworkIp: Data.netWorkIp || '',
      SourceIpAddress: Data.IpAddress || '',
      History: JSON.stringify(Data.History ? Data.History : [Data.History]),
      API: Data.API || '',
      RequestTime: Data.RequestTime || '',
      ResponseTime: Data.ResponseTime || '',
      RequestData: JSON.stringify(Data.RequestData ? Data.RequestData : [Data.RequestData]),
      ResponseData: Data.ResponseData || '',
    };
    const result = await auditsTrail.create(reqObj);
    let resObj = {
      status: httpStatus.OK,
      message: 'Audit Trail Created',
      data: result,
    };
    deferred.resolve(resObj);

  } catch (error) {
    deferred.resolve(error);
  }  
  return deferred.promise;
};

/**
 * Create a Product
 * @param {Object} Data
 * @returns {Promise<audits>}
 */
const addAuditsTrailMainDB = async (Data) => {
  var deferred = Q.defer();

  let reqObj = {
    UserName: Data.UserName || '',
    CompanyCode: Data.CompanyCode || '',
    // User: `${userData[0]?.FirstName} ${userData[0]?.LastName}`,
    UserEmail: Data.Email || '',
    UserRole: Data.UserRole || '',
    Activity: JSON.stringify(Data.Activity ? Data.Activity : [Data.Activity]),
    ComputerName: Data.computerName || '',
    NetworkIp: Data.netWorkIp || '',
    SourceIpAddress: Data.IpAddress || '',
    History: JSON.stringify(Data.History ? Data.History : [Data.History]),
    API: Data.API || '',
    RequestTime: Data.RequestTime || '',
    ResponseTime: Data.ResponseTime || '',
    RequestData: JSON.stringify(Data.RequestData ? Data.RequestData : [Data.RequestData]),
    ResponseData: Data.ResponseData || '',
  };

  const getAuditsModel = audits(global.sequelize);

  const result = await getAuditsModel.create(reqObj);
  let resObj = {
    status: httpStatus.OK,
    message: 'Audit Trail Created',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const listAllTrails = async (filter) => {
  const deferred = Q.defer();

  const { audits } = filter.schema;

  // Pagination settings
  var page = parseInt(filter.page) || 0;
  var limit = parseInt(filter.limit) || 20;
  var skip = page * limit;

  let newObject = {};
  let FCompanyCode;

  // Handle CompanyCode filter
  if (filter.CompanyCode && Array.isArray(filter.CompanyCode) && filter.CompanyCode.length) {
    FCompanyCode = { CompanyCode: { $in: filter.CompanyCode } };
  }

  // Handle date filter
  function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // Months are 0-indexed in JavaScript Date
  }

  const startDate = parseDate(filter.startDate);
  let endDate = parseDate(filter.endDate);

  // Set endDate to the end of the day (23:59:59.999)
  endDate.setHours(23, 59, 59, 999);

  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    newObject['createdAt'] = {
      $gt: startDate,
      $lte: endDate,
    };
  } else if (filter.startDate || filter.endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format for startDate or endDate.');
  }

  // Handle search item filtering
  if (filter.searchItem) {
    let searchRegex = new RegExp(filter.searchItem, 'i');
    newObject.$or = [
      FCompanyCode,
      { UserName: { $regex: searchRegex } },
      { CompanyCode: { $regex: searchRegex } },
      { UserEmail: { $regex: searchRegex } },
      { ComputerName: { $regex: searchRegex } },
      { UserRole: { $regex: searchRegex } },
      { SourceIpAddress: { $regex: searchRegex } },
      { NetworkIp: { $regex: searchRegex } },
      { Activity: { $regex: searchRegex } },
      { History: { $regex: searchRegex } },
      { API: { $regex: searchRegex } },
    ];
  }

  try {
    let totalDataCount = await audits.countDocuments(newObject);

    let result = await audits
      .aggregate([
        { $match: newObject },
        { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
        { $skip: skip },
        { $limit: limit },
      ])
      .exec();

    const resObj = {
      status: httpStatus.OK,
      message: 'List of Trails',
      data: result,
      totalCount: totalDataCount,
    };
    deferred.resolve(resObj);
  } catch (error) {
    deferred.reject({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error retrieving data',
    });
  }

  return deferred.promise;
};

module.exports = {
  addAuditsTrail,
  addAuditsTrailMainDB,
  listAllTrails,
};
