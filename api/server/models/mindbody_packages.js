'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class mindbody_packages extends Model {}
  let fields = {
    mindbody_package_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    package_id: { type: DataTypes.UUID },
    agency_fk: { type: DataTypes.UUID },
    name: { type: DataTypes.TEXT },
    source_type: { type: DataTypes.TEXT },
    payload: { type: DataTypes.TEXT },
    is_deleted: { type: DataTypes.INTEGER },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  mindbody_packages.init(fields, {
    sequelize,
    modelName: 'mindbody_packages',
    freezeTableName: true,
    timestamps: false,
  });
  return mindbody_packages;
};
