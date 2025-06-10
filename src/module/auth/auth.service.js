const httpStatus = require('http-status');
const Q = require('q');
const tokenService = require('../token/token.service');
const userService = require('../user/user.service');
const { Token } = require('../token/token.model');
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/tokens');
const getDBConnection = require('../../db/dbDynamicConnection');
const { Product } = require('../product/product_model');
const definePasswordPolicyModel = require('../passwordPolicy/passwordPolicy_model');
const User = require('../user/user.model');
const bcrypt = require('bcryptjs');
const { getMenuByUserId } = require("../userMaster/master_service");
const moment = require('moment');
const {
  getPasswordPolicy,
} = require("../passwordPolicy/passwordPolicy_service");
const createDatabases = require('../../db/createDatabase');
// const { PasswordPolicy } = require("../passwordPolicy/passwordPolicy_model");

/**
 * Create New DB
 * @param {Object} dbName
 * @returns {Promise}
 */
const createDatabase = async (dbName) => {
  try {

    console.log(`DB_DEEPAK_${dbName}`, "FFFFFF")
    await createDatabases(`DB_DEEPAK_${dbName}`);
    const sequelize = await getDBConnection(dbName);
    await Product(sequelize);
    let getPasswordPolicyModel = await definePasswordPolicyModel(sequelize);
    await sequelize.sync({ force: true });
    const existingPolicy = await getPasswordPolicyModel.findOne({
      where: {
        "Status": 1
      },
    });
    if (!existingPolicy) {
      const defaultPolicy = {
        "PasswordExpiry": 30,
        "LastPasswordUsed": 2,
        "MinimumLength": 10,
        "MaximumLength": 15,
        "LoginAttemps": 4,
        "PasswordReminder": 30,
        "RequiresPasswordReset": 0,
        "Lowercase": 1,
        "Uppercase": 1,
        "Numbers": 1,
        "SpecialCharacters": 0,
        "Status": 1
      };
      await getPasswordPolicyModel.create(defaultPolicy);
    }
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error in creating DB');
  }
};

const lockUser = async (UserName, passwordPolicy) => {
  var deferred = Q.defer();

  let getUserModel = User(global.sequelize);
  const userData = await getUserModel.findOne({
    where: { UserName },
    attributes: [
      'id',
      'FullName',
      'UserName',
      'EmployeeCode',
      'Email',
      'Password',
      'UserRole',
      'CompanyCode',
      'RequiresPasswordReset',
      'IsLocked',
      'FailedAttempts',
      'Active',
      'Status',
      'updatedAt'
    ]
  });

  if (userData) {
    // Increment FailedAttempts
    userData.FailedAttempts += 1;

    // Lock user if failed attempts exceed policy limit
    const maxAttempts = passwordPolicy?.LoginAttemps || 3;
    if (userData.FailedAttempts >= maxAttempts) {
      userData.IsLocked = 1;
    }

    await userData.save().catch(err => console.error('Error saving user:', err));    

  } else {
    console.log('⚠️ User not found.');
  }

  
  


  // let userData = await User.findOneAndUpdate(
  //   {
  //     $and: [{ UserName: UserName }],
  //   },
  //   {
  //     $inc: { FailedAttempts: 1 },
  //   },
  //   { new: true }
  // );
  // if (userData.FailedAttempts >= passwordPolicy?.LoginAttemps) {
  //   await User.findOneAndUpdate(
  //     {
  //       $and: [{ UserName: UserName }],
  //     },
  //     {
  //       $set: { IsLocked: 1 },
  //     },
  //     { new: true }
  //   );
  // }

  deferred.resolve();
  return deferred.promise;
};

const formatDateForSQL = async (date) => {
  return new Date(date).toISOString().slice(0, 23).replace('T', ' ');
};

const resetWrongPasswordAttempt = async (UserName) => {
  var deferred = Q.defer();
  await User.findOneAndUpdate(
    {
      $or: [{ UserName: UserName }],
    },
    {
      $set: { wrongPassword: 0 },
    },
    { new: true }
  );

  deferred.resolve();
  return deferred.promise;
};

const unlockUser = async (userId) => {
  var deferred = Q.defer();
  await User.findOneAndUpdate(
    {
      $and: [{ _id: userId }],
    },
    {
      $set: { locked: 0, wrongPassword: 0 },
    },
    { new: true }
  );
  deferred.resolve();
  return deferred.promise;
};

/**
 * check Pasword Expiry
 * @param {Object} user
 * @returns {Promise<user>}
 */
const checkPaswordExpiry = async (user, passwordPolicy) => {
  var deferred = Q.defer();
  const maxPasswordAgeInMinutes =
    Number(passwordPolicy?.PasswordExpiry) * 24 * 60;
  const passwordLastChanged = moment(user.PasswordLastChanged);
  const passwordLastChanged1 = moment(user.PasswordLastChanged);
  const now = moment();
  const expiryDate = passwordLastChanged1.add(
    Number(passwordPolicy?.PasswordExpiry),
    "days"
  );

  const daysLeft = expiryDate.diff(now, "days");

  

  try {
    if (now.diff(passwordLastChanged, "minutes") > maxPasswordAgeInMinutes) {
      // await User.findOneAndUpdate(
      //   { _id: user._id },
      //   { $set: { RequiresPasswordReset: 1 } },
      //   { new: true }
      // );
      deferred.resolve({
        status: 3,
        message: "Password Expired ! Please Change Your Password First",
      });
    } else {
      
      if (daysLeft <= Number(passwordPolicy?.PasswordReminder)) {
        deferred.resolve({
          status: 2,
          message: `Your password will expire in ${
            daysLeft + 1
          } day(s). Please reset your password soon.`,
        });
      } else {
        deferred.resolve({
          status: 1,
          message: "Password is valid and not expiring soon.",
        });
      }
    }
  } catch (error) {
    deferred.reject(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An error occurred while checking password expiry."
      )
    );
  }
  return deferred.promise;
};

/**
 * Login with username and password
 * @param {Object} data
 * @returns {Promise<user>}
 */
const loginUserWithUserNameAndPassword = async (data) => {
  var deferred = Q.defer();
  let user = {};
  if (data?.CompanyCode) {
    user = await userService.getUserByUserNameCompanyCode(
      data.UserName,
      data.CompanyCode
    );
  } else {
    user = await userService.getUserByUserNameAndRole(data.UserName);
  }

  let _res = await getPasswordPolicy(data.CompanyCode != undefined ? data.CompanyCode : "");
  let passwordPolicy = {};

  if (String(_res?.status)?.includes("20")) {
    passwordPolicy = _res?.data;
  }

  let userObj = {};
  if (user) {
    if (user.Active == 0) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "You are Inactive. Please Contact Administration !"
      );
    }

    if (user?.UserName == "admin") {
      if (!(await user.isPasswordMatch(data.Password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Password is not correct ");
      } else {
        let _us = JSON.stringify(user);
        user = {
          ...JSON.parse(_us),
        };
        userObj = {
          status: httpStatus.OK,
          message: "Login success",
          data: user,
        };
      }
    } else {
      let res = await checkPaswordExpiry(user, passwordPolicy);
      if (res.status == 3) {
        user.RequiresPasswordReset = 1;
      }
      if (user.IsLocked == 1) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are Locked due to too many wrong attempts, please contact Super Admin"
        );
      } else {

        let getUserModel = User(global.sequelize);
        const userData = await getUserModel.findOne({
          where: {
            UserName: user.UserName
          }
        });
        if (!(await bcrypt.compare(data.Password, userData.Password))) {
          await lockUser(data.UserName, passwordPolicy);
          let countWrongAttempt = await userService.getUserByUserName(
            data.UserName
          );
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            `Password is not correct. ${countWrongAttempt.FailedAttempts} wrong attempt(s).`
          );
        } else {
          resetFailedAttemptsAttempt(data.UserName);
          let _us = JSON.stringify(user);
          user = {
            ...JSON.parse(_us),
          };
          userObj = {
            status: httpStatus.OK,
            message:
              res.status == 2 || res.status == 3
                ? res.message
                : "Login success",
            data: user,
          };
        }
      }
    }
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
  }

  deferred.resolve(userObj);
  return deferred.promise;
  // return userObj;
};

const resetFailedAttemptsAttempt = async (UserName) => {
  var deferred = Q.defer();
  let getUserModel = User(global.sequelize);
  await getUserModel.update(
    { FailedAttempts: 0 },
    {
      where: {
        UserName: UserName
      },
      returning: true // This option is supported in PostgreSQL, but not in MSSQL. MSSQL will not return the updated rows.
    }
  );
  deferred.resolve();
  return deferred.promise;
};

/**
 * Login with UserName, Password, CompanyCode
 * @param {string} UserName
 * @param {string} Password
 * @param {string} CompanyCode
 * @returns {Promise<user>}
 */
const companyLogin = async ({ UserName, Password, CompanyCode }) => {
  var deferred = Q.defer();
  let user = await userService.getUserByUserNameCompanyCode(UserName, CompanyCode);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
  }

  if (!(await user.isPasswordMatch(Password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is not correct');
  }

  let _us = JSON.stringify(user);
  user = { ...JSON.parse(_us), CurrentCompany: CompanyCode };
  let userObj = {
    status: httpStatus.OK,
    message: 'Login success',
    data: user,
  };

  deferred.resolve(userObj);
  return deferred.promise;
};

/**
 * Login As Company by username and CompanyCode
 * @param {string} UserName
 * @param {string} CompanyCode
 * @returns {Promise<user>}
 */
const loginAsCompany = async ({ UserName, CompanyCode }) => {
  var deferred = Q.defer();
  let user = await User.findOne({ UserName, UserRole: { $gte: 100 } });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
  }
  let _us = JSON.stringify(user);
  user = { ...JSON.parse(_us), CurrentCompany: CompanyCode };
  let userObj = {
    status: httpStatus.OK,
    message: 'Login success',
    data: user,
  };

  deferred.resolve(userObj);
  return deferred.promise;
};

/**
 * Logout
 * @param {string} user
 * @returns {Promise}
 */
const logout = async (userId) => {
  const deferred = Q.defer();
  await Token.deleteMany({
    userId,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  deferred.resolve({
    status: httpStatus.OK,
    message: 'Logout success',
    data: userId,
  });
  return deferred.promise;
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  const deferred = Q.defer();
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    let userModules = await getMenuByUserId({ UserId: user.data.id });
    const generatedToken = await tokenService.generateAuthTokens(user.data, userModules);

    // await Token.deleteOne({
    //   // token: refreshTokenDoc.token,
    //   type: refreshTokenDoc.type,
    //   user: refreshTokenDoc.user,
    //   blacklisted: refreshTokenDoc.blacklisted,
    // });
    const resObj = {
      status: httpStatus.OK,
      message: 'Token Generated',
      data: {
        // user: user.data,
        ...generatedToken,
        userModules: userModules?.data && userModules?.data?.length ? userModules?.data[0]?.modules : [],
      },
    };
    deferred.resolve(resObj);
    return deferred.promise;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  const deferred = Q.defer();
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    let passwordData = {
      lastPasswords: user.data.lastPasswords,
      newPassword: newPassword,
    };
    await matchExistingPassword(passwordData);
    let _pass = await user.data.encrypt(newPassword);
    let passwordExpiry = moment().add(90, 'days').toDate();

    await userService.updateUserById(user.data._id.toString(), { Password: _pass, passwordExpiry: passwordExpiry });
    await existing5Passwords(user.data._id.toString(), _pass);

    await unlockUser(user.data._id.toString());

    await Token.deleteMany({ user: user.data._id, type: tokenTypes.RESET_PASSWORD });
    const resObj = {
      status: httpStatus.OK,
      message: 'Password reset success',
      data: { id: user.data.id, UserName: user.data.UserName, Email: user.data.Email },
    };
    deferred.resolve(resObj);
    return deferred.promise;
  } catch (error) {
    if (error instanceof ApiError) {
      deferred.reject(error); // Operational error, reject with the same error
    } else {
      deferred.reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Password reset failed')); // Unexpected error
    }

    return deferred.promise;
  }
};

const existing5Passwords = async (userId, _pass) => {
	const deferred = Q.defer();
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          PasswordHistory: {
            $each: [_pass],
            $position: 0, // Insert at the beginning
            $slice: 5, // Ensure the array contains only the last 5 elements
          },
        },
      },
      { new: true }
    );
	deferred.resolve(updatedUser);
  } catch (error) {    
    deferred.reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error)); // Unexpected error
  }
  return deferred.promise;
};

const matchExistingPassword = async (data) => {
  try {
    let _res = await getPasswordPolicy(data);
    let passwordPolicy = {};

    if (String(_res?.status)?.includes("20")) {
      passwordPolicy = _res?.data;
    }

    let res = await Promise.all(
      data.PasswordHistory.map(async (oldPassword) => {
        const isMatch = await bcrypt.compare(
          data.newPassword,
          oldPassword?.password
        );
        
        if (isMatch) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            `New password matches one of the previous ${passwordPolicy?.LastPasswordUsed} passwords, please try another`
          );
        }
      })
    );

    return res;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error while checking last passwords:', error);
  }
};

/**
 * Change password
 * @param {string} userId
 * @param {string} newPassword
 * @returns {Promise}
 */
const changePassword = async (userId, reqData) => {
  var deferred = Q.defer();
  try {
    let { PasswordPolicy } = reqData.schema
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    let isPasswordmatch = await user.isPasswordMatch(reqData.OldPassword);
    if (!isPasswordmatch) {
      throw new ApiError(httpStatus.NOT_FOUND, "Old Password is incorrect");
    }
 
    let passwordData = {
      PasswordHistory: user.PasswordHistory,
      newPassword: reqData.NewPassword,
      schema: reqData.schema
    };
    
    await matchExistingPassword(passwordData);
    let _pass = await user.encrypt(reqData?.NewPassword);

    let passPolicy = await PasswordPolicy.findOne({});
    let passwordExpiry = moment()
      .add(`${passPolicy.PasswordExpiry}`, "days")
      .toDate();

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          Password: _pass,
          PasswordLastChanged: moment().toDate(),
          RequiresPasswordReset: 0,
          PasswordExpiry: passwordExpiry,
        },
      },
      { new: true }
    );

    await existing5Passwords(userId, {
      password: _pass,
      changedAt: moment().toDate(),
    });

    await unlockUser(userId);

    let resObj = {
      status: httpStatus.OK,
      message: 'Password reset success',
      data: {
        id: user.id,
        UserName: user.UserName,
        Password: user.Password,
      },
    };

    deferred.resolve(resObj);
    return deferred.promise;
  } catch (error) {
    
    if (error instanceof ApiError) {
      deferred.reject(error); // Operational error, reject with the same error
    } else {
      deferred.reject(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Password Change failed")
      ); // Unexpected error
    }

    return deferred.promise;
  }
};
// const changePassword = async (userId, reqData) => {
//   var deferred = Q.defer();
//   try {
//     const user = await userService.getUserById(userId);
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//     }

//     let isPasswordmatch = await user.data.isPasswordMatch(reqData.OldPassword);
//     if (!isPasswordmatch) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Old Password is incorrect");
//     }

//     let passwordData = {
//       PasswordHistory: user.data.PasswordHistory,
//       newPassword: reqData.NewPassword,
//       schema: reqData.schema
//     };
    
//     await matchExistingPassword(passwordData);

//     let _pass = await user.data.encrypt(reqData.NewPassword);

//     console.log(_pass, "_res_res_res")
//     return
//     let passwordExpiry = moment().add(90, 'days').toDate();

//     await userService.updateUserByPassWord(userId, { Password: _pass, passwordExpiry: passwordExpiry });
//     await existing5Passwords(userId, _pass);

//     await unlockUser(userId);

//     let resObj = {
//       status: httpStatus.OK,
//       message: 'Password reset success',
//       data: {
//         id: user.data.id,
//         UserName: user.data.UserName,
//         Password: user.data.Password,
//       },
//     };

//     deferred.resolve(resObj);
//     return deferred.promise;
//   } catch (error) {
//     if (error instanceof ApiError) {
//       deferred.reject(error); // Operational error, reject with the same error
//     } else {
//       deferred.reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Password Change failed')); // Unexpected error
//     }

//     return deferred.promise;
//   }
// };

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithUserNameAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  changePassword,
  companyLogin,
  createDatabase,
  loginAsCompany,
  checkPaswordExpiry,
  resetFailedAttemptsAttempt,
  resetWrongPasswordAttempt,
  existing5Passwords,
  formatDateForSQL
};
