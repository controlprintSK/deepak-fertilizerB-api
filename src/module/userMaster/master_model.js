const { DataTypes } = require('sequelize');


const ModuleMaster = (sequelize) => {
  return sequelize.define('moduleMaster', {
    ModuleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    ModuleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ParentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null, // You can use null instead of empty string for integers
    },
    SequenceNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true, // createdAt and updatedAt
    tableName: 'coll_moduleMaster', // Optional: specify table name
  });
  
};
  

// add plugin that converts mongoose to json
// moduleMasterSchema.plugin(toJSON);
// moduleMasterSchema.plugin(paginate);
// const ModuleMaster = mongoose.model(
//   "moduleMaster",
//   moduleMasterSchema,
//   "coll_moduleMaster"
// );

const PageMaster = (sequelize) => {
  const PageMasterModel = sequelize.define('PageMaster', {
    PageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    PageName: DataTypes.STRING,
    ModuleId: DataTypes.INTEGER,
    Visible: DataTypes.BOOLEAN,
    SequenceNo: DataTypes.INTEGER,
    ParentId: DataTypes.INTEGER,
    Icon: DataTypes.STRING,
    PageUrl: DataTypes.STRING,
    DisplayName: DataTypes.STRING,
  }, {
    tableName: 'coll_pageMaster',
    timestamps: false,
  });
  return PageMasterModel;
};
// add plugin that converts mongoose to json
// pageMasterSchema.plugin(toJSON);
// pageMasterSchema.plugin(paginate);
// const PageMaster = mongoose.model(
//   "pageMaster",
//   pageMasterSchema,
//   "coll_pageMaster"
// );

const RightMaster = (sequelize) => {
  return sequelize.define('rightMaster', {
    RightsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    RightsName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    timestamps: true, // createdAt and updatedAt
    tableName: 'coll_rightMaster', // Optional: specify the table name explicitly
  });
};

// add plugin that converts mongoose to json
// rightMasterSchema.plugin(toJSON);
// rightMasterSchema.plugin(paginate);
// const RightMaster = mongoose.model(
//   "rightMaster",
//   rightMasterSchema,
//   "coll_rightMaster"
// );

const PageRights = (sequelize) => {
  return sequelize.define('pageRights', {
    PageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RightsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RightsName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
  }, {
    timestamps: true, // adds createdAt and updatedAt
    tableName: 'coll_pageRights', // Optional: explicitly set table name
  });
};


// add plugin that converts mongoose to json
// pageRightsSchema.plugin(toJSON);
// pageRightsSchema.plugin(paginate);
// const PageRights = mongoose.model(
//   "pageRights",
//   pageRightsSchema,
//   "coll_pageRights"
// );

const RoleMaster = (sequelize) => {
  return sequelize.define('roleMaster', {
    RoleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    RoleName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    IsUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    Active: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    IsFixed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    Status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    timestamps: true, // createdAt and updatedAt
    tableName: 'coll_roleMaster', // optional explicit table name
  });
};

// add plugin that converts mongoose to json
// roleMasterSchema.plugin(toJSON);
// roleMasterSchema.plugin(paginate);
// const RoleMaster = mongoose.model(
//   "roleMaster",
//   roleMasterSchema,
//   "coll_roleMaster"
// );

const RoleRightMaster = (sequelize) => {
  return sequelize.define('roleRightMaster', {
    RoleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RightsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true, // adds createdAt and updatedAt
    tableName: 'coll_roleRightMaster', // Optional: specify the table name explicitly
  });
};

// add plugin that converts mongoose to json
// roleRightMasterSchema.plugin(toJSON);
// roleRightMasterSchema.plugin(paginate);
// const RoleRightMaster = mongoose.model(
//   "roleRightMaster",
//   roleRightMasterSchema,
//   "coll_roleRightMaster"
// );

const UserRights = (sequelize) => {
  return sequelize.define('userRights', {
    UserId: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    PageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      trim: true,
    },
    RightsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      trim: true,
    },
    UpdateDate: {
      type: DataTypes.STRING,
      defaultValue: () => new Date().toISOString(),
    },
    CompanyCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
      trim: true,
    },
  }, {
    timestamps: true, // Adds createdAt and updatedAt
    tableName: 'coll_userRights', // Optional: specify table name
  });
};

// add plugin that converts mongoose to json
// userRightSchema.plugin(toJSON);
// userRightSchema.plugin(paginate);
// const UserRights = mongoose.model(
//   "userRights",
//   userRightSchema,
//   "coll_userRights"
// );

module.exports = {
  ModuleMaster,
  PageMaster,
  RightMaster,
  PageRights,
  RoleMaster,
  RoleRightMaster,
  UserRights
};