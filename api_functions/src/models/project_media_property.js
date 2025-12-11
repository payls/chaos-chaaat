'use strict';
const { Model } = require('sequelize');
const h = require('../helpers');
const { v4: uuidv4 } = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class project_media_property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_media_property.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
      project_media_property.belongsTo(models.project_media, {
        foreignKey: 'project_media_fk',
        targetKey: 'project_media_id',
      });
      project_media_property.belongsTo(models.project_property, {
        foreignKey: 'project_property_fk',
        targetKey: 'project_property_id',
      });
    }
  }
  let fields = {
    project_media_property_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: DataTypes.UUID,
    project_media_fk: DataTypes.UUID,
    project_property_fk: DataTypes.UUID,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_media_property.init(fields, {
    sequelize,
    modelName: 'project_media_property',
    freezeTableName: true,
    timestamps: false,
  });
  return project_media_property;
};
