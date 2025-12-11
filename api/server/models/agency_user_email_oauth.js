'use strict';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_user_email_oauth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      agency_user_email_oauth.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }

  let fields = {
    agency_user_email_oauth_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_user_fk: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING },
    source: { type: DataTypes.STRING },
    access_info: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_user_email_oauth.init(fields, {
    sequelize,
    modelName: 'agency_user_email_oauth',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_user_email_oauth;
};
