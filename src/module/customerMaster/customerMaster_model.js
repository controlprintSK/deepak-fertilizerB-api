const { DataTypes } = require('sequelize');

const CustomerMaster = (sequelize) => {
  return sequelize.define(
    'CustomerMaster',
    {
      CustomerCode: {
        type: DataTypes.STRING(20), // specify length
        allowNull: false,
        set(value) {
          this.setDataValue('CustomerCode', value.toUpperCase());
        },
      },
      CustomerName: {
        type: DataTypes.STRING(100), // specify length
        allowNull: false,
      },
      CustomerType: {
        type: DataTypes.STRING(100), // specify length
        allowNull: false,
      },
      ContactNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Gstin: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CustomerLogo: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Address: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Pincode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Country: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      State: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      City: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      Active: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      SyncTime: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'coll_customer_master',
      hooks: {
        // Correct placement for hooks
        beforeCreate: (instance) => {
          instance.Status = 1;
        },
      },
    }
  );
};

module.exports = { CustomerMaster };
