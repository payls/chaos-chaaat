'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class landing_page_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      landing_page_info.hasOne(models.agency_custom_landing_pages, {
        foreignKey: 'agency_custom_landing_page_id',
      });
    }
  }

  let fields = {
    landing_page_info_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_custom_landing_page_fk: { type: DataTypes.UUID },
    landing_page_data: { type: DataTypes.TEXT },
    landing_page_html: { type: DataTypes.TEXT },
    landing_page_css: { type: DataTypes.TEXT },
    meta_title: { type: DataTypes.STRING },
    meta_description: { type: DataTypes.STRING },
    meta_image: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  landing_page_info.init(fields, {
    sequelize,
    modelName: 'landing_page_info',
    freezeTableName: true,
    timestamps: false,
  });

  return landing_page_info;
};
