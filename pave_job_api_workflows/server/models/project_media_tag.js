'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class project_media_tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_media_tag.belongsTo(models.project_media, {
        foreignKey: 'project_media_fk',
        targetKey: 'project_media_id',
      });
    }
  }
  let fields = {
    project_media_tag_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_media_fk: DataTypes.UUID,
    tag: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_media_tag.init(fields, {
    sequelize,
    modelName: 'project_media_tag',
    freezeTableName: true,
    timestamps: false,
  });
  return project_media_tag;
};
