const httpStatus = require("http-status");
const Q = require("q");
const { default: mongoose } = require("mongoose");
const definePasswordPolicyModel = require("./passwordPolicy_model");

/**
 * Add Password Policy
 * @param {ObjectId} PasswordPolicyData
 * @returns {Promise<Company>}
 */
const addPasswordPolicy = async (data) => {
  const deferred = Q.defer();
  const { PasswordPolicy } = data.schema;
  const result = await PasswordPolicy.find({});
  if (result.length > 0) {
    return updatePasswordPolicy(result[0]._id, data);
  }
  let res = await PasswordPolicy.create(data);
  const resObj = {
    status: httpStatus.OK,
    message: "Details Added Successfully !",
    data: res,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Update General Settings
 * @param {ObjectId} PasswordPolicydata
 * @returns {Promise<Company>}
 */
const updatePasswordPolicy = async (Id, data) => {
  const deferred = Q.defer();
  const { PasswordPolicy } = data.schema;
  let res = await PasswordPolicy.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(Id) },
    { $set: { ...data } },
    { new: true }
    // { sort: { createdAt: 1 } }
  );
  const resObj = {
    status: httpStatus.OK,
    message: "Updated SuccessFully !",
    data: res,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};


/**
 * List General Settings
 * @param {Object}
 * @returns {Promise<Company>}
 */
const getPasswordPolicy = async (data) => {
  const deferred = Q.defer();
  let PasswordPolicy;
  if (data.schema == undefined) {
    PasswordPolicy = definePasswordPolicyModel(global.sequelize);
  } else {
    PasswordPolicy = data.schema.PasswordPolicy;
  }
  const result = await PasswordPolicy.findAll({});
  const resObj = {
    status: httpStatus.OK,
    message: "General Settings Details",
    data: result[0],
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

module.exports = {
  updatePasswordPolicy,
  addPasswordPolicy,
  getPasswordPolicy,
};
