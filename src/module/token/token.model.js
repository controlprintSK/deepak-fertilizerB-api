const { DataTypes } = require('sequelize');

const Token = (sequelize) => {
  return sequelize.define('Token', {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Important for upsert condition
    },
    type: {
      type: DataTypes.ENUM('refresh', 'resetPassword', 'verifyEmail'),
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    blacklisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    tableName: 'coll_token',
  });
};

module.exports = Token;

// /**
//  * @typedef Token
//  */
// const Token = mongoose.model('Token', tokenSchema, 'coll_token');

// module.exports = { Token, tokenSchema };
