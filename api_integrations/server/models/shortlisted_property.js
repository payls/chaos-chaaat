'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class shortlisted_property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shortlisted_property.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
      shortlisted_property.belongsTo(models.project_property, {
        foreignKey: 'project_property_fk',
        targetKey: 'project_property_id',
      });
      shortlisted_property.hasMany(models.shortlisted_property_comment, {
        foreignKey: 'shortlisted_property_fk',
      });
      shortlisted_property.hasMany(models.shortlisted_property_setting, {
        foreignKey: 'shortlisted_property_fk',
      });
    }
  }
  let fields = {
    shortlisted_property_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_property_fk: DataTypes.STRING,
    property_fk: DataTypes.STRING,
    contact_fk: DataTypes.UUID,
    display_order: DataTypes.INTEGER,
    property_rating: { type: DataTypes.TINYINT, defaultValue: 0 },
    is_opened: { type: DataTypes.TINYINT, defaultValue: 0 },
    is_bookmarked: DataTypes.BOOLEAN,
    bookmark_date: DataTypes.DATE,
    is_requested_for_reservation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reservation_date: DataTypes.DATE,
    is_general_enquiry: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_property.init(fields, {
    sequelize,
    modelName: 'shortlisted_property',
    freezeTableName: true,
    timestamps: false,
  });
  return shortlisted_property;
};
