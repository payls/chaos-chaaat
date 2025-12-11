'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class mindbody_client_services extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      mindbody_client_services.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
      });
    }
  }
  let fields = {
    mindbody_client_services_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: { type: DataTypes.UUID },
    payload: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  mindbody_client_services.init(fields, {
    sequelize,
    modelName: 'mindbody_client_services',
    freezeTableName: true,
    timestamps: false,
  });
  return mindbody_client_services;
};
