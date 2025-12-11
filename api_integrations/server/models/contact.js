'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contact.hasMany(models.shortlisted_property, {
        foreignKey: 'contact_fk',
      });
      contact.hasMany(models.shortlisted_project, {
        foreignKey: 'contact_fk',
      });
      contact.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      contact.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
      contact.hasMany(models.shortlisted_property_comment_reaction, {
        foreignKey: 'contact_fk',
      });
      contact.hasMany(models.contact_activity, {
        foreignKey: 'contact_fk',
      });
      contact.hasMany(models.contact_source, {
        foreignKey: 'contact_fk',
      });
      contact.hasMany(models.contact_email_communication, {
        foreignKey: 'contact_fk',
      });
      contact.hasMany(models.contact_property_values, {
        foreignKey: 'contact_fk',
      });
      contact.hasMany(models.contact_lead_score, {
        foreignKey: 'contact_fk',
      });
    }
  }
  let fields = {
    contact_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    mobile_number: { type: DataTypes.STRING },
    is_whatsapp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    opt_out_whatsapp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    opt_out_sms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lead_score: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    last_24_hour_lead_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_48_hour_lead_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_24_hour_lead_score_diff: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    permalink: { type: DataTypes.TEXT },
    permalink_message: { type: DataTypes.TEXT },
    permalink_sent_date: { type: DataTypes.DATE },
    permalink_last_opened: { type: DataTypes.DATE },
    permalink_template: { type: DataTypes.TEXT, defaultValue: 'pave' },
    lead_status: { type: DataTypes.STRING }, // constant.LEAD_STATUS
    is_general_enquiry: { type: DataTypes.BOOLEAN, defaultValue: false },
    profile_picture_url: { type: DataTypes.TEXT },
    agency_fk: { type: DataTypes.UUID },
    agency_user_fk: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING }, // constant.CONTACT.STATUS
    agent_email_preference: { type: DataTypes.BOOLEAN, defaultValue: true },
    contact_email_preference: { type: DataTypes.BOOLEAN, defaultValue: true },
    lead_status_last_update: { type: DataTypes.DATE },
    enquiry_email_timestamp: { type: DataTypes.DATE },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact.init(fields, {
    sequelize,
    modelName: 'contact',
    freezeTableName: true,
    timestamps: false,
  });
  return contact;
};
