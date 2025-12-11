'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class stripe_checkout_session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      stripe_checkout_session.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }
  let fields = {
    stripe_checkout_session_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    paid: { type: DataTypes.STRING },
    payload: { type: DataTypes.TEXT },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  stripe_checkout_session.init(fields, {
    sequelize,
    modelName: 'stripe_checkout_session',
    freezeTableName: true,
    timestamps: false,
  });

  return stripe_checkout_session;
};
