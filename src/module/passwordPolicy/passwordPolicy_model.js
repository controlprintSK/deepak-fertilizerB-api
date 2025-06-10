const { DataTypes } = require('sequelize');

const definePasswordPolicyModel = (sequelize) => {
  return sequelize.define('PasswordPolicy', {
    PasswordExpiry: { type: DataTypes.INTEGER, defaultValue: 60 },
    LastPasswordUsed: { type: DataTypes.INTEGER, defaultValue: 3 },
    MinimumLength: { type: DataTypes.INTEGER, defaultValue: 8 },
    MaximumLength: { type: DataTypes.INTEGER, defaultValue: 15 },
    LoginAttemps: { type: DataTypes.INTEGER, defaultValue: 5 },
    PasswordReminder: { type: DataTypes.INTEGER, defaultValue: 10 },
    RequiresPasswordReset: { type: DataTypes.INTEGER, defaultValue: 1 },
    Lowercase: { type: DataTypes.INTEGER, defaultValue: 1 },
    Uppercase: { type: DataTypes.INTEGER, defaultValue: 1 },
    Numbers: { type: DataTypes.INTEGER, defaultValue: 1 },
    SpecialCharacters: { type: DataTypes.INTEGER, defaultValue: 1 },
    Status: { type: DataTypes.INTEGER, defaultValue: 1 },
  }, {
    tableName: 'coll_password_policy',
    timestamps: true,
  });
};

module.exports = definePasswordPolicyModel;
