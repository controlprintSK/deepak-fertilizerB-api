const httpStatus = require("http-status");
const { Op } = require('sequelize');
const Q = require("q");
const User = require("./user.model");
const ApiError = require("../../utils/ApiError");
// const { Company } = require("../company/company_model");
const moment = require("moment");
const { RoleMaster } = require("../userMaster/master_model");
const { UserRights } = require("../userMaster/master_model");
const bcrypt = require("bcryptjs");
const { assignDefaultRights } = require("../userMaster/master_service");
const { PasswordPolicy } = require("../passwordPolicy/passwordPolicy_model");

/**
 * Register a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const registerUser = async (userBody) => {
  const deferred = Q.defer();

  const isRoleIdExist = await RoleMaster.find({ RoleId: userBody.UserRole });
  if (!isRoleIdExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User Role does not exist!");
  }

  const isUserExist = await User.isUserNameTaken(userBody.UserName);
  if (isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "UserName already taken");
  }
  let passPolicy = await PasswordPolicy.findOne({});
  let PasswordExpiry = moment()
    .add(passPolicy?.PasswordExpiry || 120, "days")
    .toDate();
  userBody.PasswordExpiry = PasswordExpiry;
  const createdUser = await User.create(userBody);

  await User.findOneAndUpdate(
    { UserName: createdUser.UserName },
    {
      $push: {
        PasswordHistory: {
          $each: [
            { password: createdUser.Password, changedAt: moment().toDate() },
          ],
        },
      },
    },
    { new: true }
  );

  const userObj = {
    status: httpStatus.OK,
    message: "User Created",
    data: createdUser,
  };
  deferred.resolve(userObj);
  return deferred.promise;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const deferred = Q.defer();

  let { PasswordPolicy } =  userBody.schema

  const isRoleIdExist = await RoleMaster.find({ RoleId: userBody.UserRole });
  if (!isRoleIdExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User Role does not exist!");
  }

  const isUserExist = await User.isUserNameTaken(userBody.UserName);
  const isEmployeeCodeExist = await User.isEmployeeCodeTaken(
    userBody.EmployeeCode
  );

  if (isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "UserId already taken");
  }

  if (isEmployeeCodeExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "EmployeeId already taken");
  }

  // const isCompanyCode = await Company.isCompanyCodeExist(userBody.CompanyCode);

  // if (!isCompanyCode) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Company Code does not exist!");
  // }
  let passPolicy = await PasswordPolicy.findOne({});
  let passwordExpiry = moment()
    .add(`${passPolicy.PasswordExpiry}`, "days")
    .toDate();
  userBody.PasswordExpiry = passwordExpiry;
  userBody.RequiresPasswordReset = passPolicy.RequiresPasswordReset;
  const createdUser = await User.create(userBody);

  await User.findOneAndUpdate(
    { UserName: createdUser.UserName },
    {
      $push: {
        PasswordHistory: {
          $each: [
            { password: createdUser.Password, changedAt: moment().toDate() },
          ],
        },
      },
    },
    { new: true }
  );

  const userObj = {
    status: httpStatus.OK,
    message: "User Created",
    data: createdUser,
  };
  deferred.resolve(userObj);
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
const queryUsers = async (filter, options) => {
  const deferred = Q.defer();
  filter.EmployeeCode = {$ne: ""}
  const users = await User.paginate(filter, options);  
  const resObj = {
    status: httpStatus.OK,
    message: "List users",
    data: users,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const deferred = Q.defer();
  const result = await User.findById(id);
  const resObj = {
    status: httpStatus.OK,
    message: "List User",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get user by email
 * @param {string} Email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (Email) => {
  const deferred = Q.defer();
  const resObj = await User.findOne({ Email });
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get user by UserName
 * @param {string} Email
 * @returns {Promise<User>}
 */
const getUserByUserNameCompanyCode = async (UserName, CompanyCode) => {
  const deferred = Q.defer();
  let getUserModel = User(global.sequelize);
  const resObj = await getUserModel.findOne({
    where: {
      UserName: UserName,
      CompanyCode: {
        [Op.like]: `%${CompanyCode}%`  // LIKE '%MKD%' if CompanyCode = 'MKD'
      }
    }
  });
  deferred.resolve(resObj?.dataValues);
  return deferred.promise;
};

/**
 * Get list of all user
 * @returns {Promise<User>}
 */
const getUserByCode = async (data) => {
  const deferred = Q.defer();
  const result = await User.find({
    CompanyCode: data?.CompanyCode,
    Status: 1,
    Active: 1,
    UserRole: { $ne: 100 },
  });
  let resObj = {
    status: httpStatus.OK,
    message: "User list",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get Super admin user list
 * @returns {Promise<User>}
 */
const getUserSuperAdmin = async () => {
  const deferred = Q.defer();
  const result = await User.find({ UserRole: { $gte: 100 } });
  const resObj = {
    status: httpStatus.OK,
    message: "User list",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get user by UserName
 * @param {string} Email
 * @returns {Promise<User>}
 */
const getUserByUserName = async (UserName) => {
  const deferred = Q.defer();
  let getUserModel = User(global.sequelize);
  const resObj = await getUserModel.findOne({
    where: {
      UserName: UserName
    }
  });
  // const resObj = await User.findOne({ UserName });
  deferred.resolve(resObj?.dataValues);
  return deferred.promise;
};

/**
 * Get user by UserName
 * @param {string} Email
 * @returns {Promise<User>}
 */
const getUserByUserNameAndRole = async (UserName) => {
  const deferred = Q.defer();
  const resObj = await User.findOne({
    where: {
      UserName: UserName,
      UserRole: 'superadmin'
    }
  });  
  console.log(resObj, "Testingggggggggggggg")
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody, header) => {
  const deferred = Q.defer();
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (updateBody.email && (await User.isUserNameTaken(updateBody.UserName))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  let PassInfo = {};
  if (updateBody.Password) {
    let { PasswordPolicy } = updateBody.schema
    let passPolicy = await PasswordPolicy.findOne({});	
    let passwordExpiry = moment()
      .add(`${passPolicy.PasswordExpiry}`, "days")
      .toDate();
    const hashedPassword = await bcrypt.hash(updateBody.Password, 10);
    updateBody.Password = hashedPassword;
    PassInfo = {
      Password: hashedPassword,
      PasswordLastChanged: moment().toDate(),
      RequiresPasswordReset: 1,
      PasswordExpiry: passwordExpiry,
      IsLocked: 0,
      FailedAttempts: 0,
      PasswordHistory: [],
    };
  }
  Object.assign(user, updateBody);

  const result = await User.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        Email: updateBody.Email,
        UserRole: updateBody.UserRole,
        FullName: updateBody.FullName,
        Active: updateBody.Active,
        ...PassInfo,
      },
    },
    { new: true }
  );

  if (user?.data?.UserRole !== updateBody.UserRole) {
    await UserRights.deleteMany({ UserId: userId }, { new: true });
    await assignDefaultRights(result, header, "no");
  }

  const resObj = {
    status: httpStatus.OK,
    message: "User details Updated",
    data: result,
  };

  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const deferred = Q.defer();
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.updateOne(
    { _id: userId },
    { $set: { Status: 0 } },
    { new: true }
  );

  const resObj = {
    status: httpStatus.OK,
    message: "User Deleted",
    data: result,
  };

  deferred.resolve(resObj);
  return deferred.promise;
};

const changeActiveUser = async (data, userId) => {
  const deferred = Q.defer();
  let act = await User.findOne({
    $and: [{ _id: userId }],
  });

  const result = await User.findOneAndUpdate(
    {
      $and: [{ _id: userId }],
    },
    {
      $set: { Active: !act.Active },
    },
    { new: true }
  );
  const resObj = {
    status: httpStatus.OK,
    message: "User Active Changed",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

const unlockUser = async (UserId, data) => {
  const deferred = Q.defer();

  const user = await getUserById(UserId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.findOneAndUpdate(
    {
      $and: [{ _id: UserId }],
    },
    {
      $set: { IsLocked: data?.IsLocked, FailedAttempts: 0 },
    },
    { new: true }
  );
  const resObj = {
    status: httpStatus.OK,
    message:
      data?.IsLocked == 1
        ? "User Locked Successfully"
        : "User Unocked Successfully",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

const getUsersByCode = async (UserId, data) => {
  const deferred = Q.defer();

  const user = await getUserById(UserId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.findOneAndUpdate(
    {
      $and: [{ _id: UserId }],
    },
    {
      $set: { IsLocked: data?.IsLocked, FailedAttempts: 0 },
    },
    { new: true }
  );
  const resObj = {
    status: httpStatus.OK,
    message:
      data?.IsLocked == 1
        ? "User Locked Successfully"
        : "User Unocked Successfully",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByUserName,
  updateUserById,
  deleteUserById,
  registerUser,
  getUserByUserNameCompanyCode,
  getUserByCode,
  getUserByUserNameAndRole,
  getUserSuperAdmin,
  changeActiveUser,
  unlockUser,
  getUsersByCode
};
