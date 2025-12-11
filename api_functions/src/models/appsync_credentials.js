'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class appsync_credentials extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  let fields = {
    appsync_credentials_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    api_key: { type: DataTypes.STRING },
    expiration_date: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  appsync_credentials.init(fields, {
    sequelize,
    modelName: 'appsync_credentials',
    freezeTableName: true,
    timestamps: false,
  });
  return appsync_credentials;
};
