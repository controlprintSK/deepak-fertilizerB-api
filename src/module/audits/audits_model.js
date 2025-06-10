const { DataTypes } = require('sequelize');

const audits = (sequelize) => {
  return sequelize.define('auditsTrail', {
    UserName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    CompanyCode: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    UserEmail: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    UserRole: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    Activity: {
      type: DataTypes.STRING, // Store JSON as string
      defaultValue: '[]', // Default empty array as string
    },
    History: {
      type: DataTypes.STRING, // Store JSON as string
      defaultValue: '[]', // Default empty array as string
    },
    ComputerName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    SourceIpAddress: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    NetworkIp: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    API: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    RequestTime: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    ResponseTime: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    RequestData: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    ResponseData: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  }, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    tableName: 'coll_auditsTrail' // optional: customize table name
  })
};

const auditsTrailSchema = (sequelize) => {
  return sequelize.define('auditsTrail', {
    UserName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    CompanyCode: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    UserEmail: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    UserRole: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    Activity: {
      type: DataTypes.STRING, // Store JSON as string
      defaultValue: '[]', // Default empty array as string
    },
    History: {
      type: DataTypes.STRING, // Store JSON as string
      defaultValue: '[]', // Default empty array as string
    },
    ComputerName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    SourceIpAddress: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    NetworkIp: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    API: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    RequestTime: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    ResponseTime: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    RequestData: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    ResponseData: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  }, {
    timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' },
    tableName: 'coll_auditsTrail' // optional: customize table name
  });
};

module.exports = { audits, auditsTrailSchema };
