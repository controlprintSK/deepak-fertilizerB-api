const { DataTypes } = require('sequelize');

const LineMaster = (sequelize) => {
  return sequelize.define(
    'LineMaster',
    {
      CompanyCode: {
        type: DataTypes.STRING(50), // specify length
        allowNull: false,
        set(value) {
          this.setDataValue('CompanyCode', value.toUpperCase());
        },
      },
      Name: {
        type: DataTypes.STRING(100), // specify length
        allowNull: false,
      },
      Code: {
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
      tableName: 'coll_line',
      hooks: {
        // Correct placement for hooks
        beforeCreate: (instance) => {
          instance.Status = 1;
        },
      },
    }
  );
};

module.exports = { LineMaster };
