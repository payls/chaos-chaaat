'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_subscription.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      agency_subscription.hasMany(models.agency_subscription_product, {
        foreignKey: 'agency_subscription_fk',
      });
    }
  }
  let fields = {
    agency_subscription_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    stripe_subscription_id: { type: DataTypes.STRING },
    subscription_name: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    subscription_start: { type: DataTypes.DATE },
    subscription_end: { type: DataTypes.DATE },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_subscription.init(fields, {
    sequelize,
    modelName: 'agency_subscription',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_subscription;
};
