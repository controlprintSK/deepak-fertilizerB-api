const httpStatus = require('http-status');
const Q = require('q');
const { Company, CompanyContact } = require('./company_model');
const ApiError = require('../../utils/ApiError');
const { createDatabase } = require('../auth/auth.service');

/**
 * Get Company by Code
 * @param {ObjectId} CompanyCode
 * @returns {Promise<Company>}
 */
const getCompanyByCode = async (CompanyCode) => {
  const deferred = Q.defer();
  let getCompanyModel = Company(global.sequelize);
  const result = await getCompanyModel.findAll({
    where: {
      CompanyCode: CompanyCode,
      Status: 1,
    },
  });
  const resObj = {
    status: httpStatus.OK,
    message: 'Company Details',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Create a Company
 * @param {Object} companyData
 * @returns {Promise<Company>}
 */
const createCompany = async (companyData) => {
  const deferred = Q.defer();
  const { ContactDetails, ...companyInfo } = companyData;
  const isCompanyExist = await getCompanyByCode(companyInfo.CompanyCode);
  if (isCompanyExist.data.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Company Code already exist');
  }
  let getCompanyModel = Company(global.sequelize);
  const result = await getCompanyModel.create(companyInfo);
  let getCompanyContactModel = CompanyContact(global.sequelize);
  const contactResults = await Promise.all(ContactDetails.map((contact) => getCompanyContactModel.create(contact)));
  createDatabase(result.CompanyCode);

  const resObj = {
    status: httpStatus.OK,
    message: 'Company Created',
    data: { companyData: result, contactData: contactResults },
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Update a Company
 * @param {Object} companyData
 * @returns {Promise<Company>}
 */
const updateCompany = async (companyData) => {
  const deferred = Q.defer();

  let getCompanyModel = await Company(global.sequelize);

  let result = await getCompanyModel.update(
    { ...companyData }, // fields to update
    {
      where: { CompanyCode: companyData.CompanyCode }, // condition
      returning: true, // ensures updated row is returned (works in PostgreSQL and MSSQL)
    }
  );
  
  const resObj = {
    status: httpStatus.OK,
    message: 'Company Details Updated',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get Company by Code
 * @param {ObjectId} CompanyCode
 * @returns {Promise<Company>}
 */
const listCompanyContact = async (CompanyCode) => {
  const deferred = Q.defer();
  const result = await CompanyContact.find({
    CompanyCode: CompanyCode.CompanyCode,
    Status: 1,
  });

  const resObj = {
    status: httpStatus.OK,
    message: 'Company Details',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * List a Company
 * @param {Object}
 * @returns {Promise<Company>}
 */
const listCompany = async (filter, options) => {
  const deferred = Q.defer();

  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  let getCompanyModel = Company(global.sequelize);

  const result = await getCompanyModel.findAndCountAll({
    where: {
      ...filter,
      Status: 1
    },
    limit,
    offset,
    order: [['createdAt', 'DESC']] // Optional: Customize sorting
  });

  const resObj = {
    status: httpStatus.OK,
    message: 'Companies Details',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * List all Company
 * @param {Object}
 * @returns {Promise<Company>}
 */
const listAllCompany = async (filter) => {
  const deferred = Q.defer();
  filter.Status = 1;
  const result = await Company.aggregate([
    { $match: { Status: 1 } },
    {
      $project: {
        CompanyCode: 1,
        CompanyName: 1,
        // CompanyCode: 1,
      },
    },
  ]);
  const resObj = {
    status: httpStatus.OK,
    message: 'Company List',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Delete Company by Code
 * @param {ObjectId} Code
 * @returns {Promise<Company>}
 */
const deleteCompany = async (Code) => {
  const deferred = Q.defer();

  let _del = await CompanyContact.updateMany(
    {
      CompanyCode: Code,
    },
    { $set: { Status: 0 } }
  );
  if (_del.modifiedCount == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Company Contact');
  }

  const result = await Company.findOneAndUpdate(
    {
      $and: [{ CompanyCode: Code }],
    },
    {
      $set: { Status: 0 },
    },
    { new: true }
  );

  const resObj = {
    status: httpStatus.OK,
    message: 'Company Deleted',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Update Contact Person of the Company
 * @param {ObjectId} Id
 * @param {ObjectId} ContactData -- Data for Update in Contact
 * @returns {Promise<Company>}
 */
const updateContactById = async (ContactData, Id) => {
  const deferred = Q.defer();

  const result = await CompanyContact.findOneAndUpdate(
    {
      _id: Id,
    },
    { $set: { ...ContactData } },
    { new: true }
  );

  const resObj = {
    status: httpStatus.OK,
    message: 'Details Updated Successfully',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};
/**
 * Delete Contact Person of the Company
 * @param {ObjectId} Id
 * Change Status : 0  for Delete
 * @returns {Promise<Company>}
 */
const deleteContactById = async (Id) => {
  const deferred = Q.defer();

  const result = await CompanyContact.findOneAndUpdate(
    {
      _id: Id,
    },
    { $set: { Status: 0 } },
    { new: true }
  );

  const resObj = {
    status: httpStatus.OK,
    message: 'Deleted SuccessFul',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get All Details of Company by Code
 * @param {ObjectId} CompanyCode
 * @returns {Promise<Company>}
 */
const listByCode = async (companyCode) => {
  const deferred = Q.defer();
  let result = await Company.aggregate([
    {
      $match: { CompanyCode: companyCode, Status: 1 },
    },
    {
      $lookup: {
        from: 'coll_company_contact',
        localField: 'CompanyCode',
        foreignField: 'CompanyCode',
        as: 'ContactDetails',
      },
    },
    {
      $unwind: {
        path: '$ContactDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'ContactDetails.Status': 1 } },
    {
      $group: {
        _id: '$_id',
        CompanyCode: { $first: '$CompanyCode' },
        CompanyName: { $first: '$CompanyName' },
        CompanyGroup: { $first: '$CompanyGroup' },
        Address: { $first: '$Address' },
        City: { $first: '$City' },
        State: { $first: '$State' },
        Country: { $first: '$Country' },
        PinCode: { $first: '$PinCode' },
        LicenseNo: { $first: '$LicenseNo' },
        CompanyType: { $first: '$CompanyType' },
        IpAddress: { $first: '$IpAddress' },
        Active: { $first: '$Active' },
        Status: { $first: '$Status' },
        ContactDetails: { $push: '$ContactDetails' },
      },
    },
    {
      $addFields: {
        ContactDetails: '$ContactDetails',
      },
    },
    {
      $project: {
        CompanyCode: 1,
        CompanyName: 1,
        CompanyGroup: 1,
        active: 1,
        Address: 1,
        City: 1,
        State: 1,
        Country: 1,
        PinCode: 1,
        LicenseNo: 1,
        CompanyType: 1,
        IpAddress: 1,
        Active: 1,
        Status: 1,
        ContactDetails: 1,
      },
    },
  ]);

  const resObj = {
    status: httpStatus.OK,
    message: 'list of data',
    data: result || [],
  };
  deferred.resolve(resObj);
  return deferred.promise;
};
const createContact = async (contactData) => {
  const deferred = Q.defer();
  const result = await CompanyContact.create(contactData);
  const resObj = {
    status: httpStatus.OK,
    message: 'Contact Created',
    companyData: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};
const changeActiveCompany = async (id) => {
  const deferred = Q.defer();

  let act = await Company.findOne({ $and: [{ _id: id }] });

  const result = await Company.findOneAndUpdate(
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
    message: 'Company Active Changed',
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

module.exports = {
  createCompany,
  updateCompany,
  listCompanyContact,
  getCompanyByCode,
  listCompany,
  deleteCompany,
  updateContactById,
  deleteContactById,
  listByCode,
  createContact,
  listAllCompany,
  changeActiveCompany,
};
