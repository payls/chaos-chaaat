'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class project_media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_media.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
      project_media.hasMany(models.project_media_property, {
        foreignKey: 'project_media_fk',
      });
      project_media.hasMany(models.project_media_tag, {
        foreignKey: 'project_media_fk',
      });
      project_media.belongsToMany(models.project_property, {
        through: 'project_media_property',
        as: 'project_properties',
        foreignKey: 'project_media_fk',
      });
    }
  }
  let fields = {
    project_media_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: DataTypes.UUID,
    type: DataTypes.STRING, // same as constant.PROPERTY.MEDIA.TYPE
    url: DataTypes.TEXT,
    thumbnail_src: DataTypes.TEXT,
    filename: DataTypes.TEXT,
    title: DataTypes.STRING,
    header_text: DataTypes.STRING,
    is_hero_image: DataTypes.BOOLEAN,
    display_order: DataTypes.INTEGER,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_media.init(fields, {
    sequelize,
    modelName: 'project_media',
    freezeTableName: true,
    timestamps: false,
  });
  return project_media;
};
