const httpStatus = require("http-status");
const Q = require("q");
const {
  ModuleMaster,
  PageMaster,
  RightMaster,
  PageRights,
  RoleMaster,
  RoleRightMaster,
  UserRights,
} = require("./master_model");
const ApiError = require("../../utils/ApiError");
const { User } = require("../user/user.model");
const { getDecodedToken } = require("../../utils/common");
const moment = require("moment");
const { addAuditsTrail } = require("../audits/audits_service");

/**
 * get rights by RoleId
 * @param {Object} data
 * @returns {Promise<RoleRightMaster>}
 */
const getRightsByRoleId = async (data) => {
  const deferred = Q.defer();

  const result = await RoleRightMaster.find({ RoleId: data.RoleId });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "RoleID does not exist");
  }

  const resObj = {
    status: httpStatus.OK,
    message: "Success",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Assign default right to user by RoleID
 * @param {Object} data
 * @returns {Promise<RoleRightMaster>}
 */
const assignDefaultRights = async (data, header, type) => {
  const deferred = Q.defer();

  const isRoleExist = await RoleRightMaster.find({ RoleId: data.UserRole });
  if (!isRoleExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "RoleID does not exist");
  }

  const result = await RoleRightMaster.aggregate([
    {
      $match: { RoleId: data.UserRole },
    },

    {
      $project: {
        _id: 0,
        UserId: data.id,
        UserName: data?.UserName,
        RoleId: 1,
        PageId: "$PageId",
        RightsId: "$RightsId",
        CompanyCode: data?.CompanyCode || "",
        Action: "ADD",
      },
    },
  ]);

  const _res = await addUserRights(result, header, type);
  deferred.resolve(_res);
  return deferred.promise;
};

/**
 * Get Right assigned to particular user groups
 * @param {Object} data
 * @returns {Promise<RoleRightMaster>}
 */
const getRightsOfUserGroups = async (data) => {
  const deferred = Q.defer();

  try {
    let result = await RoleRightMaster.aggregate([
      {
        $match: { RoleId: data.RoleId },
      },
      {
        $lookup: {
          from: "coll_pageMaster",
          localField: "PageId",
          foreignField: "PageId",
          as: "pageDetails",
        },
      },
      {
        $unwind: "$pageDetails",
      },
      {
        $lookup: {
          from: "coll_moduleMaster",
          localField: "pageDetails.ModuleId",
          foreignField: "ModuleId",
          as: "moduleDetails",
        },
      },
      {
        $unwind: "$moduleDetails",
      },
      {
        $match: {
          "moduleDetails.Visible": true, // Filter pages where PageVisible is true
        },
      },
      {
        $match: {
          "pageDetails.Visible": true, // Filter pages where PageVisible is true
        },
      },
      {
        $group: {
          _id: {
            RoleId: "$RoleId",
            ModuleId: "$moduleDetails.ModuleId",
            PageId: "$pageDetails.PageId",
          },
          ModuleName: { $first: "$moduleDetails.ModuleName" },
          ModuleIcon: { $first: "$moduleDetails.Icon" },
          ModuleSequenceNo: { $first: "$moduleDetails.SequenceNo" },
          ModuleVisible: { $first: "$moduleDetails.Visible" },
          PageName: { $first: "$pageDetails.PageName" },
          DisplayName: { $first: "$pageDetails.DisplayName" },
          Icon: { $first: "$pageDetails.Icon" },
          PageUrl: { $first: "$pageDetails.PageUrl" },
          PageSequenceNo: { $first: "$pageDetails.SequenceNo" },
          PageVisible: { $first: "$pageDetails.Visible" },
          // Rights: {
          //   $push: {
          //     RightsId: '$RightsId',
          //     // CompanyCode: '$CompanyCode',
          //   },
          // },

          Rights: {
            $push: "$RightsId",
          },
        },
      },
      {
        $sort: { PageSequenceNo: 1 },
      },

      {
        $group: {
          _id: {
            RoleId: "$_id.RoleId",
            ModuleId: "$_id.ModuleId",
          },
          ModuleName: { $first: "$ModuleName" },
          ModuleIcon: { $first: "$ModuleIcon" },
          ModuleSequenceNo: { $first: "$ModuleSequenceNo" },
          ModuleVisible: { $first: "$ModuleVisible" },
          pages: {
            $push: {
              PageId: "$_id.PageId",
              PageName: "$PageName",
              DisplayName: "$DisplayName",
              Icon: "$Icon",
              PageUrl: "$PageUrl",
              PageSequenceNo: "$PageSequenceNo",
              PageVisible: "$PageVisible",
              Rights: "$Rights",
            },
          },
        },
      },
      {
        $sort: { ModuleSequenceNo: 1 },
      },
      {
        $group: {
          _id: "$_id.RoleId",
          modules: {
            $push: {
              ModuleId: "$_id.ModuleId",
              ModuleName: "$ModuleName",
              Icon: "$ModuleIcon",
              SequenceNo: "$ModuleSequenceNo",
              Visible: "$ModuleVisible",
              pages: "$pages",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          RoleId: "$_id",
          modules: 1,
        },
      },
    ]);

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    const resObj = {
      status: httpStatus.OK,
      message: "success",
      data: result,
    };
    deferred.resolve(resObj);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
  return deferred.promise;
};

/**
 * Add/Remove User Groups Right
 * @param {Object} data
 * @returns {Promise<RoleRightMaster>}
 */
const addRemoveUserGroupsRights = async (obj, header) => {
  const deferred = Q.defer();
  const requestTime = moment().format("DD-MM-YYYY HH:mm:ss.SSSS");

  let decoded = getDecodedToken(header?.authorization);
  let data = obj?.rightToUpdate;

  let duplicateData = [];
  let bulkOps = [];
  let permissionChanges = [];
  for (const item of data) {
    const query = {
      PageId: item.PageId,
      RoleId: obj.RoleId,
      RightsId: item.RightsId,
    };

    const existingDocument = await RoleRightMaster.findOne(query);
    if (item.Action == "ADD") {
      if (existingDocument) {
        duplicateData.push({
          PageId: item.PageId,
          RoleId: obj.RoleId,
          RightsId: item.RightsId,
        });
        continue;
      } else {
        permissionChanges.push({
          ChangeType: item?.Action,
          Page: item.PageId,
          Before:
            item?.Action === "REMOVE" ? { RightsId: item.RightsId } : null,
          After: item?.Action === "ADD" ? { RightsId: item.RightsId } : null,
          ChangedBy: decoded?.payload?.UserName,
          UserId: item.UserId,
          UserName: obj?.RoleName,
        });
      }

      bulkOps.push({
        insertOne: {
          document: {
            PageId: item.PageId,
            RoleId: obj.RoleId,
            RightsId: item.RightsId,
          },
        },
      });
    }

    if (item.Action == "REMOVE") {
      bulkOps.push({
        deleteOne: {
          filter: {
            RoleId: obj.RoleId,
            PageId: item.PageId,
            RightsId: item.RightsId,
          },
        },
      });

      if (existingDocument && item?.Action === "REMOVE") {
        permissionChanges.push({
          ChangeType: item?.Action,
          Page: item.PageId,
          Before:
            item?.Action === "REMOVE" ? { RightsId: item.RightsId } : null,
          After: item?.Action === "ADD" ? { RightsId: item.RightsId } : null,
          ChangedBy: decoded?.payload?.UserName,
          UserId: item.UserId,
          UserName: obj?.RoleName,
        });
      }
    }
  }

  const result = await RoleRightMaster.bulkWrite(bulkOps);
  const userList = await User.find({ UserRole: obj?.RoleId });

  if (userList && Array.isArray(userList) && userList.length) {
    for (const item1 of userList) {
      let reqObj = {
        id: item1?._id,
        UserRole: obj?.RoleId,
        CompanyCode: item1?.CompanyCode[0] || "",
        UserName: item1?.UserName,
      };

      await UserRights.deleteMany({ UserId: item1?._id });
      await assignDefaultRights(reqObj, header, "no");
    }
  }

  const resObj = {
    status: httpStatus.OK,
    message: "User group Right Updated",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };

  try {
    let auditsObj = {
      userId: decoded?.payload?.sub,
      UserRole: decoded?.payload?.UserRole,
      UserName: decoded?.payload?.UserName,
      CompanyCode: decoded?.payload?.CompanyCode[0] || "",
      IpAddress: header?.host || "",
      API: "/addRemoveUserGroupsRights",
      RequestTime: requestTime,
      ResponseTime: moment().format("DD-MM-YYYY HH:mm:ss.SSSS"),
      Activity: [
        {
          module: "Group - Permission",
          action: "update",
        },
      ],
      History: permissionChanges,
      RequestData: data,
      ResponseData: resObj,
    };
    addAuditsTrail(auditsObj);
    
  } catch (error) {
    // console.log("error :>> ", error);
  }

  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add New Module
 * @param {Object} data
 * @returns {Promise<ModuleMaster>}
 */
const addModuleMaster = async (data) => {
  const deferred = Q.defer();

  let finalData = [];
  let duplicateData = [];
  for (const item of data) {
    const query = { ModuleId: item.ModuleId };
    const existingDocument = await ModuleMaster.findOne(query);

    if (existingDocument) {
      duplicateData.push({
        ModuleId: item.ModuleId,
        ModuleName: item.ModuleName,
      });
      continue;
    }

    finalData.push(item);
  }

  const result = await ModuleMaster.create(finalData);
  const resObj = {
    status: httpStatus.OK,
    message: "Module Created",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add New Page
 * @param {Object} data
 * @returns {Promise<PageMaster>}
 */
const addPageMaster = async (data) => {
  const deferred = Q.defer();

  let finalData = [];
  let duplicateData = [];
  for (const item of data) {
    const query = { PageId: item.PageId };
    const existingDocument = await PageMaster.findOne(query);

    if (existingDocument) {
      duplicateData.push({ PageId: item.PageId, PageName: item.PageName });
      continue;
    }

    finalData.push(item);
  }

  const result = await PageMaster.create(finalData);
  const resObj = {
    status: httpStatus.OK,
    message: "Page Created",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add New Right
 * @param {Object} data
 * @returns {Promise<RightMaster>}
 */
const addRightMaster = async (data) => {
  const deferred = Q.defer();

  let finalData = [];
  let duplicateData = [];
  for (const item of data) {
    const query = { RightsId: item.RightsId };
    const existingDocument = await RightMaster.findOne(query);

    if (existingDocument) {
      duplicateData.push({
        RightsId: item.RightsId,
        RightsName: item.RightsName,
      });
      continue;
    }

    finalData.push(item);
  }

  const result = await RightMaster.create(finalData);
  const resObj = {
    status: httpStatus.OK,
    message: "Page Created",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add Page Right
 * @param {Object} data
 * @returns {Promise<PageRights>}
 */
const addPageRight = async (data) => {
  const deferred = Q.defer();

  let finalData = [];
  let duplicateData = [];
  for (const item of data) {
    const query = { PageId: item.PageId, RightsId: item.RightsId };
    const existingDocument = await PageRights.findOne(query);

    if (existingDocument) {
      duplicateData.push({
        PageId: item.PageId,
        RightsId: item.RightsId,
        RightsName: item.RightsName,
      });
      continue;
    }

    finalData.push(item);
  }

  const result = await PageRights.create(finalData);
  const resObj = {
    status: httpStatus.OK,
    message: "Page Right Created",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add Role
 * @param {Object} data
 * @returns {Promise<RoleMaster>}
 */
const addRoleMaster = async (data) => {
  const deferred = Q.defer();

  let finalData = [];
  let duplicateData = [];
  for (const item of data) {
    const query = { RoleId: item.RoleId };
    const existingDocument = await RoleMaster.findOne(query);

    if (existingDocument) {
      duplicateData.push({ RoleId: item.RoleId, RoleName: item.RoleName });
      continue;
    }

    finalData.push(item);
  }

  const result = await RoleMaster.create(finalData);
  const resObj = {
    status: httpStatus.OK,
    message: "Page Created",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add Role Right
 * @param {Object} roleWiseData
 * @returns {Promise<RoleMaster>}
 */
const addRoleRightMaster = async (roleWiseData) => {
  const deferred = Q.defer();

  try {
    let roleRightmaster = [];

    for (const role of roleWiseData) {
      for (const rightId of role.RightsId) {
        roleRightmaster.push({
          PageId: role.PageId,
          RoleId: role.RoleId,
          RightsId: rightId,
        });
      }
    }

    let finalData = [];
    let duplicateData = [];
    for (const item of roleRightmaster) {
      const query = {
        RoleId: item.RoleId,
        RightsId: item.RightsId,
        PageId: item.PageId,
      };
      const existingDocument = await RoleRightMaster.findOne(query);

      if (existingDocument) {
        duplicateData.push({
          PageId: item.PageId,
          RoleId: item.RoleId,
          RightsId: item.RightsId,
        });
        continue;
      }

      finalData.push(item);
    }

    const result = await RoleRightMaster.create(finalData);
    const resObj = {
      status: httpStatus.OK,
      message: "Role Right Created",
      data: {
        duplicateDataCount: duplicateData.length,
        insertedCount: result.length,
        duplicateData,
      },
    };
    deferred.resolve(resObj);
    return deferred.promise;
  } catch (error) {
    // console.log("error :>> ", error);
  }
};

/**
 * Add/Remove User Right
 * @param {Object} data
 * @returns {Promise<UserRights>}
 */
const addUserRights = async (data, header, _type) => {
  const deferred = Q.defer();
  const requestTime = moment().format("DD-MM-YYYY HH:mm:ss.SSSS");

  let decoded = getDecodedToken(header?.authorization);
  // UserName: decoded?.payload?.UserName
  // userId: decoded?.payload?.sub,
  // UserRole: decoded?.payload?.UserRole,

  let duplicateData = [];
  let bulkOps = [];
  let permissionChanges = [];
  for (const item of data) {
    console.log(item, "itemitemitemitemitem", item.CompanyCode)
    const query = {
      CompanyCode: item.CompanyCode,
      PageId: item.PageId,
      UserId: item.UserId,
      RightsId: item.RightsId,
    };

    const existingDocument = await UserRights.findOne(query);
    if (item.Action == "ADD") {
      if (existingDocument) {
        duplicateData.push({
          CompanyCode: item.CompanyCode[0],
          PageId: item.PageId,
          UserId: item.UserId,
          RightsId: item.RightsId,
        });
        continue;
      } else {
        permissionChanges.push({
          ChangeType: item?.Action,
          Page: item.PageId,
          Before:
            item?.Action === "REMOVE" ? { RightsId: item.RightsId } : null,
          After: item?.Action === "ADD" ? { RightsId: item.RightsId } : null,
          ChangedBy: decoded?.payload?.UserName,
          UserId: item.UserId,
          UserName: item?.UserName,
        });
      }

      bulkOps.push({
        insertOne: {
          document: {
            CompanyCode: item.CompanyCode[0],
            PageId: item.PageId,
            UserId: item.UserId,
            RightsId: item.RightsId,
          },
        },
      });
    }

    if (item.Action == "REMOVE") {
      bulkOps.push({
        deleteOne: {
          filter: {
            UserId: item.UserId,
            PageId: item.PageId,
            RightsId: item.RightsId,
            CompanyCode: item.CompanyCode[0],
          },
        },
      });

      if (existingDocument && item?.Action === "REMOVE") {
        permissionChanges.push({
          ChangeType: item?.Action,
          Page: item.PageId,
          Before:
            item?.Action === "REMOVE" ? { RightsId: item.RightsId } : null,
          After: item?.Action === "ADD" ? { RightsId: item.RightsId } : null,
          ChangedBy: decoded?.payload?.UserName,
          UserId: item.UserId,
          UserName: item?.UserName,
        });
      }
    }
  }

  const result = await UserRights.bulkWrite(bulkOps);

  const resObj = {
    status: httpStatus.OK,
    message: "User Right Updated",
    data: {
      duplicateDataCount: duplicateData.length,
      insertedCount: result.length,
      duplicateData,
    },
  };

  if (_type != "no") {
    try {
      let auditsObj = {
        userId: decoded?.payload?.sub,
        UserRole: decoded?.payload?.UserRole,
        UserName: decoded?.payload?.UserName,
        CompanyCode: decoded?.payload?.CompanyCode[0] || "",
        IpAddress: header?.host || "",
        API: "/addUserRights",
        RequestTime: requestTime,
        ResponseTime: moment().format("DD-MM-YYYY HH:mm:ss.SSSS"),
        Activity: [
          {
            module: "User - Permission",
            action: "update",
          },
        ],
        History: permissionChanges,
        RequestData: data,
        ResponseData: resObj,
      };

      addAuditsTrail(auditsObj);
    } catch (error) {
      // console.log("error :>> ", error);
    }
  }

  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get User Rights by Userid
 * @param {String} UserId
 * @returns {Promise<UserRights>}
 */
const getMenuByUserId = async ({ UserId }) => {
  const deferred = Q.defer();

  const getUserRightsModel = UserRights(global.sequelize);
  const getPageMasterModel = PageMaster(global.sequelize);
  const getModuleMasterModel = ModuleMaster(global.sequelize);
  getUserRightsModel.belongsTo(getPageMasterModel, {
    foreignKey: 'PageId',
    as: 'pageDetails',
  });
  getPageMasterModel.belongsTo(getModuleMasterModel, {
    foreignKey: 'ModuleId',
    as: 'moduleDetails'
  });
  
  
  const result = await getUserRightsModel.findAll({
    where: {
      UserId,
    },
    include: [
      {
        model: getPageMasterModel,
        as: 'pageDetails',
        where: { Visible: true },
        include: [
          {
            model: getModuleMasterModel,
            as: 'moduleDetails',
            where: { Visible: true },
          },
        ],
      },
    ],
  });

  const groupedByModule = {};

  for (const row of result) {
    const page = row.pageDetails;
    const module = page.moduleDetails;

    const moduleId = module.ModuleId;

    if (!groupedByModule[moduleId]) {
      groupedByModule[moduleId] = {
        ModuleId: module.ModuleId,
        ModuleName: module.ModuleName,
        Icon: module.Icon,
        SequenceNo: module.SequenceNo,
        Visible: module.Visible,
        pages: [],
      };
    }

    groupedByModule[moduleId].pages.push({
      PageId: page.PageId,
      PageName: page.PageName,
      DisplayName: page.DisplayName,
      Icon: page.Icon,
      PageUrl: page.PageUrl,
      PageSequenceNo: page.SequenceNo,
      ParentId: page.ParentId != null ? page.ParentId : "",
      PageVisible: page.Visible,
      Rights: [row.RightsId], // or group by PageId if there are multiple Rights
    });
  }
  
  const modules = Object.values(groupedByModule).sort(
    (a, b) => a.SequenceNo - b.SequenceNo
  );

  let finalModules = modules.map(module => {
    const merged = [];
  
    module.pages.forEach(page => {
      let existing = merged.find(m => m.PageId === page.PageId);
      if (existing) {
        existing.Rights.push(...page.Rights);
      } else {
        merged.push({ ...page });
      }
    });

    const pageMap = new Map();
    
    // Deduplicate rights
    merged.forEach(page => {
      page.pages = []; // Prepare a `pages` array for nesting
      pageMap.set(page.PageId, page);
    });

    const topLevelPages = [];

    merged.forEach(page => {
      if (page.ParentId) {
        const parent = pageMap.get(Number(page.ParentId));
        if (parent) {
          parent.pages.push(page);
        } else {
          // Orphaned child, no parent found – treat as top-level
          topLevelPages.push(page);
        }
      } else {
        topLevelPages.push(page);
      }
    });
    
  
    return {
      ...module,
      pages: topLevelPages
    };
  });

  const finalResponse = {
    UserId,
    modules: finalModules,
  };

  if (!finalResponse) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  const resObj = {
    status: httpStatus.OK,
    message: "success",
    data: finalResponse,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Add User Right
 * @returns {Promise<RoleMaster>}
 */
const getRoleMaster = async () => {
  const deferred = Q.defer();
  
  const getRoleMasterModel = RoleMaster(global.sequelize);

  const result = await getRoleMasterModel.findAll({
    attributes: ['RoleId', 'RoleName'],
    raw: true
  });

  const resObj = {
    status: httpStatus.OK,
    message: "List Role",
    data: result,
  };

  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get Menu list
 * @returns {Promise<PageRights>}
 */
const getAllMenu = async (data) => {
  const deferred = Q.defer();

  try {
    let result = await PageMaster.aggregate([
      {
        $match: {
          Visible: true,
        },
      },
      {
        $lookup: {
          from: "coll_pageRights",
          localField: "PageId",
          foreignField: "PageId",
          as: "pageRightsDetails",
        },
      },
      {
        $lookup: {
          from: "coll_userRights",
          let: { pageId: "$PageId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$PageId", "$$pageId"] },
                    { $eq: ["$UserId", data.UserId] },
                  ],
                },
              },
            },
            { $project: { RightsId: 1, _id: 0 } },
          ],
          as: "userRightsDetails",
        },
      },
      {
        $lookup: {
          from: "coll_moduleMaster",
          localField: "ModuleId",
          foreignField: "ModuleId",
          as: "moduleDetails",
        },
      },
      {
        $unwind: "$moduleDetails",
      },
      {
        $match: {
          "moduleDetails.Visible": true,
        },
      },

      {
        $project: {
          PageId: 1,
          PageName: 1,
          DisplayName: 1,
          PageUrl: 1,
          PageSequenceNo: "$SequenceNo",
          PageVisible: "$Visible",
          Rights: {
            $map: {
              input: "$pageRightsDetails",
              as: "rght",
              in: {
                RightsId: "$$rght.RightsId",
                RightsName: "$$rght.RightsName",
              },
            },
          },
          UserRights: {
            $map: {
              input: "$userRightsDetails",
              as: "usr",
              in: "$$usr.RightsId",
            },
          },
          ModuleName: "$moduleDetails.ModuleName",
          ModuleSequenceNo: "$moduleDetails.SequenceNo",
          ModuleVisible: "$moduleDetails.Visible",
          ModuleId: "$moduleDetails.ModuleId",
        },
      },
      {
        $sort: { PageSequenceNo: 1 },
      },
      {
        $group: {
          _id: "$ModuleId",
          ModuleName: { $first: "$ModuleName" },
          ModuleSequenceNo: { $first: "$ModuleSequenceNo" },
          ModuleVisible: { $first: "$ModuleVisible" },
          pages: {
            $push: {
              PageId: "$PageId",
              PageName: "$PageName",
              DisplayName: "$DisplayName",
              PageUrl: "$PageUrl",
              PageSequenceNo: "$PageSequenceNo",
              PageVisible: "$PageVisible",
              UserRights: "$UserRights",
              Rights: "$Rights",
            },
          },
        },
      },
      {
        $project: {
          ModuleName: 1,
          ModuleSequenceNo: 1,
          ModuleVisible: 1,
          pages: 1,
        },
      },
      {
        $sort: { ModuleSequenceNo: 1 },
      },
      {
        $group: {
          _id: null,
          modules: {
            $push: {
              ModuleId: "$_id",
              ModuleName: "$ModuleName",
              // SequenceNo: '$ModuleSequenceNo',
              Visible: "$ModuleVisible",
              pages: "$pages",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          modules: 1,
        },
      },
    ]);

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    const resObj = {
      status: httpStatus.OK,
      message: "success",
      data: result,
    };
    deferred.resolve(resObj);
    return deferred.promise;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

/**
 * Get Menu list for user group
 * @returns {Promise<PageRights>}
 */
const getAllMenuForUserGroup = async (data) => {
  const deferred = Q.defer();

  try {
    let result = await PageMaster.aggregate([
      {
        $match: {
          Visible: true,
        },
      },
      {
        $lookup: {
          from: "coll_pageRights",
          localField: "PageId",
          foreignField: "PageId",
          as: "pageRightsDetails",
        },
      },
      {
        $lookup: {
          from: "coll_roleRightMaster",
          let: { pageId: "$PageId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$PageId", "$$pageId"] },
                    { $eq: ["$RoleId", data.RoleId] },
                  ],
                },
              },
            },
            { $project: { RightsId: 1, _id: 0 } },
          ],
          as: "userRightsDetails",
        },
      },
      {
        $lookup: {
          from: "coll_moduleMaster",
          localField: "ModuleId",
          foreignField: "ModuleId",
          as: "moduleDetails",
        },
      },
      {
        $unwind: "$moduleDetails",
      },
      {
        $match: {
          "moduleDetails.Visible": true,
        },
      },
      {
        $project: {
          PageId: 1,
          PageName: 1,
          DisplayName: 1,
          PageUrl: 1,
          PageSequenceNo: "$SequenceNo",
          PageVisible: "$Visible",
          Rights: {
            $map: {
              input: "$pageRightsDetails",
              as: "rght",
              in: {
                RightsId: "$$rght.RightsId",
                RightsName: "$$rght.RightsName",
              },
            },
          },
          UserRights: {
            $map: {
              input: "$userRightsDetails",
              as: "usr",
              in: "$$usr.RightsId",
            },
          },
          ModuleName: "$moduleDetails.ModuleName",
          ModuleSequenceNo: "$moduleDetails.SequenceNo",
          ModuleVisible: "$moduleDetails.Visible",
          ModuleId: "$moduleDetails.ModuleId",
          type: { $ifNull: ["$moduleDetails.type", ""] },
        },
      },
      {
        $sort: { PageSequenceNo: 1 },
      },
      {
        $group: {
          _id: "$ModuleId",
          ModuleName: { $first: "$ModuleName" },
          ModuleSequenceNo: { $first: "$ModuleSequenceNo" },
          type: { $first: "$type" },
          ModuleVisible: { $first: "$ModuleVisible" },
          pages: {
            $push: {
              PageId: "$PageId",
              PageName: "$PageName",
              DisplayName: "$DisplayName",
              PageUrl: "$PageUrl",
              PageSequenceNo: "$PageSequenceNo",
              PageVisible: "$PageVisible",
              UserRights: "$UserRights",
              Rights: "$Rights",
            },
          },
        },
      },
      {
        $project: {
          ModuleName: 1,
          ModuleSequenceNo: 1,
          ModuleVisible: 1,
          type: 1,
          pages: 1,
        },
      },
      {
        $sort: { ModuleSequenceNo: 1 },
      },
      {
        $group: {
          _id: null,
          modules: {
            $push: {
              ModuleId: "$_id",
              ModuleName: "$ModuleName",
              type: "$type",
              // SequenceNo: '$ModuleSequenceNo',
              Visible: "$ModuleVisible",
              pages: "$pages",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          modules: 1,
        },
      },
    ]);

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    console.log(result, "resultresultresult")
    const resObj = {
      status: httpStatus.OK,
      message: "success",
      data: result,
    };
    deferred.resolve(resObj);
    return deferred.promise;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

/**
 * Get All Page
 * @param {Object} data
 * @returns {Promise<PageMaster>}
 */
const getPageMaster = async () => {
  const deferred = Q.defer();

  const result = await PageMaster.find({});
  const resObj = {
    status: httpStatus.OK,
    message: "Page List",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get All Right
 * @param {Object} data
 * @returns {Promise<RightMaster>}
 */
const getRightMaster = async () => {
  const deferred = Q.defer();

  const result = await RightMaster.find({});
  const resObj = {
    status: httpStatus.OK,
    message: "Right List",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

/**
 * Get All Page Right Right
 * @param {Object} data
 * @returns {Promise<PageRights>}
 */
const getPageRightMaster = async () => {
  const deferred = Q.defer();

  const result = await PageRights.aggregate([
    {
      $project: {
        _id: 0,
        PageId: 1,
        RightsId: 1,
        RightsName: 1,
      },
    },
  ]);
  const resObj = {
    status: httpStatus.OK,
    message: "Right List",
    data: result,
  };
  deferred.resolve(resObj);
  return deferred.promise;
};

module.exports = {
  addModuleMaster,
  addPageMaster,
  addRightMaster,
  addPageRight,
  addRoleMaster,
  addRoleRightMaster,
  addUserRights,
  getRightsByRoleId,
  assignDefaultRights,
  getMenuByUserId,
  getRoleMaster,
  getAllMenu,
  getRightsOfUserGroups,
  addRemoveUserGroupsRights,
  getAllMenuForUserGroup,
  getPageMaster,
  getRightMaster,
  getPageRightMaster,
};
