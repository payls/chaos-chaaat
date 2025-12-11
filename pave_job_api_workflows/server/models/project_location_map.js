'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class project_location_map extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_location_map.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
      project_location_map.hasMany(models.location, {
        foreignKey: 'project_location_map_fk',
      });
    }
  }
  let fields = {
    project_location_map_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: DataTypes.UUID,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_location_map.init(fields, {
    sequelize,
    modelName: 'project_location_map',
    freezeTableName: true,
    timestamps: false,
  });
  return project_location_map;
};
