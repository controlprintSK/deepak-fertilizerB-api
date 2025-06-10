
const { DataTypes } = require('sequelize');

const Product = (sequelize) => {
  return sequelize.define('product', {
    ProductCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
      set(value) {
        this.setDataValue('ProductCode', value.toUpperCase());
      },
    },
    ProductName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    GenericName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    BrandName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    CompanyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    Description: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    UOM: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    PackagingType: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    HistoricalImages: {
      type: DataTypes.TEXT, // or STRING(4000) for compatibility
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('HistoricalImages');
        return raw ? JSON.parse(raw) : [];
      },
      set(value) {
        this.setDataValue('HistoricalImages', JSON.stringify(value));
      }
    },
    PackagingInfo: {
      type: DataTypes.TEXT, // or STRING(4000) for compatibility
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('HistoricalImages');
        return raw ? JSON.parse(raw) : [];
      },
      set(value) {
        this.setDataValue('HistoricalImages', JSON.stringify(value));
      }
    },
    Active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    Status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    SyncStatus: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    SyncTime: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  }, {
    timestamps: true, // adds createdAt and updatedAt
    tableName: 'coll_product', // optional: specify table name explicitly
  });
};


module.exports = { Product };
