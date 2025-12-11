'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_custom_landing_pages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_custom_landing_pages.hasMany(models.agency, {
        foreignKey: 'agency_id',
      });
      // define association here
      agency_custom_landing_pages.hasOne(models.landing_page_info, {
        foreignKey: 'agency_custom_landing_page_fk',
      });
    }
  }

  let fields = {
    agency_custom_landing_page_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    landing_page_name: { type: DataTypes.STRING },
    landing_page: { type: DataTypes.STRING },
    landing_page_slug: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_custom_landing_pages.init(fields, {
    sequelize,
    modelName: 'agency_custom_landing_pages',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_custom_landing_pages;
};
