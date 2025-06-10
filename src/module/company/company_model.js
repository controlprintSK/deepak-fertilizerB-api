const { DataTypes } = require('sequelize');

const Company = (sequelize) => {
  return sequelize.define('Company', {
    CompanyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('CompanyCode', value.toUpperCase());
      },
    },
    CompanyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    City: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    State: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PinCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LicenseNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CompanyType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IpAddress: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    Active: {
      type: DataTypes.BOOLEAN,
    },
    Status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    timestamps: true,      // adds createdAt and updatedAt
    tableName: 'coll_company' // optional: customize table name
  });  
};




// const companySchema = mongoose.Schema(
//   {
//     CompanyCode: {
//       type: String,
//       required: true,
//       trim: true,
//       set: (v) => v.toUpperCase(),
//     },
//     CompanyName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // CompanyGroup: {
//     //   type: String,
//     //   required: true,
//     //   trim: true,
//     // },
//     Address: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     City: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     State: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     Country: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     PinCode: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     LicenseNo: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     CompanyType: {
//       type: String,
//       required: true,
//     },
//     IpAddress: {
//       type: String,
//       default: '',
//     },
//     Active: {
//       type: Boolean,
//     },
//     Status: {
//       type: Number,
//       default: 1,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

const CompanyContact = (sequelize) => {
  return sequelize.define('CompanyContact', {
    CompanyCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    ContactNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    Status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    timestamps: true,           // adds createdAt & updatedAt
    tableName: 'coll_company_contact' // optional: customize table name
  });
};

/**
 * Check if CompanyCode Exist
 * @param {string} CompanyCode
 * @returns {Promise<boolean>}
 */
// companySchema.statics.isCompanyCodeExist = async function (CompanyCode) {
//   const company = await this.findOne({ CompanyCode });
//   return !!company;
// };

// // add plugin that converts mongoose to json
// companySchema.plugin(toJSON);
// companySchema.plugin(paginate);

// add plugin that converts mongoose to json
// companyContactSchema.plugin(toJSON);
// companyContactSchema.plugin(paginate);

// const Company = mongoose.model('company', companySchema, 'coll_company');
// const CompanyContact = mongoose.model('companyContact', companyContactSchema, 'coll_company_contact');

module.exports = { Company, CompanyContact };
