'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class shortlisted_project_setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      shortlisted_project_setting.belongsTo(models.shortlisted_project, {
        foreignKey: 'shortlisted_project_fk',
        targetKey: 'shortlisted_project_id',
      });
      shortlisted_project_setting.hasMany(models.shortlisted_property_setting, {
        foreignKey: 'shortlisted_project_setting_fk',
      });
    }
  }

  let fields = {
    shortlisted_project_setting_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    shortlisted_project_fk: DataTypes.UUID,
    media_setting_image: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    media_setting_video: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    media_setting_floor_plan: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    media_setting_brocure: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    media_setting_factsheet: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    info_setting_key_stats: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    info_setting_project_highlights: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    info_setting_why_invest: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    info_setting_shopping: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    info_setting_transport: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    info_setting_education: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    hidden_media: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    media_order: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_project_setting.init(fields, {
    sequelize,
    modelName: 'shortlisted_project_setting',
    freezeTableName: true,
    timestamps: false,
  });

  return shortlisted_project_setting;
};
