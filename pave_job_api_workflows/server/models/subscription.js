'use strict';
const { Model } = require('sequelize');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      subscription.hasMany(models.agency, {
        foreignKey: 'agency_subscription_fk',
      });
    }
  }

  let fields = {
    subscription_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      autoIncrement: true,
    },
    subscription_max_users: { type: DataTypes.INTEGER },
    subscription_name: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  subscription.init(fields, {
    sequelize,
    modelName: 'subscription',
    freezeTableName: true,
    timestamps: false,
  });
  return subscription;
};
