'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class agency_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_user.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      agency_user.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
      agency_user.hasOne(models.agency_user_tray, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.contact, { foreignKey: 'agency_user_fk' });
      agency_user.hasMany(models.contact_view, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.contact_view_property, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.shortlisted_property_comment, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.shortlisted_property_comment_reaction, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.contact_email_communication, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.agency_report, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.whatsapp_message_tracker, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.whatsapp_chat, {
        foreignKey: 'agency_user_fk',
      });
      agency_user.hasMany(models.live_chat, {
        foreignKey: 'agency_user_fk',
      });
    }
  }
  let fields = {
    agency_user_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    user_fk: { type: DataTypes.UUID },
    agency_fk: { type: DataTypes.UUID },
    title: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    year_started: { type: DataTypes.INTEGER },
    website: { type: DataTypes.TEXT },
    instagram: { type: DataTypes.TEXT },
    linkedin: { type: DataTypes.TEXT },
    facebook: { type: DataTypes.TEXT },
    youtube: { type: DataTypes.TEXT },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_user.init(fields, {
    sequelize,
    modelName: 'agency_user',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_user;
};
