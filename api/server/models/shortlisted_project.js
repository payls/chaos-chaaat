'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class shortlisted_project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shortlisted_project.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
      shortlisted_project.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
      shortlisted_project.hasMany(models.shortlisted_project_setting, {
        foreignKey: 'shortlisted_project_fk',
      });
    }
  }
  let fields = {
    shortlisted_project_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: DataTypes.UUID,
    project_rating: { type: DataTypes.TINYINT, defaultValue: 0 },
    is_opened: { type: DataTypes.TINYINT, defaultValue: 0 },
    project_fk: DataTypes.UUID,
    display_order: DataTypes.INTEGER,
    is_bookmarked: DataTypes.BOOLEAN,
    bookmark_date: DataTypes.DATE,
    is_enquired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    enquired_date: DataTypes.DATE,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_project.init(fields, {
    sequelize,
    modelName: 'shortlisted_project',
    freezeTableName: true,
    timestamps: false,
  });
  return shortlisted_project;
};
