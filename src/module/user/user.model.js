const { DataTypes } = require('sequelize');

const User = (sequelize) => {
  return sequelize.define('User', {
    FullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    EmployeeCode: DataTypes.STRING,
    Mobile: DataTypes.STRING,
    Email: DataTypes.STRING,
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UserRole: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CompanyCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('CompanyCode');
        return raw ? JSON.parse(raw) : [];
      },
      set(value) {
        this.setDataValue('CompanyCode', JSON.stringify(value));
      }
    },    
    CurrentCompany: DataTypes.STRING,
    RequiresPasswordReset: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    IsLocked: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    FailedAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    PasswordExpiry: DataTypes.DATE,
    PasswordLastChanged: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    Active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    Status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    tableName: 'coll_user',
    timestamps: true,
  });
};

module.exports = User;
