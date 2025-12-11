'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class automation_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      automation_category.hasMany(models.agency, {
        foreignKey: 'agency_id',
      });
    }
  }
  let fields = {
    automation_category_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    title: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    platform: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  automation_category.init(fields, {
    sequelize,
    modelName: 'automation_category',
    freezeTableName: true,
    timestamps: false,
  });
  return automation_category;
};
