'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class crm_settings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      crm_settings.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      crm_settings.belongsTo(models.agency_user, {
        foreignKey: 'created_by',
        targetKey: 'agency_user_id',
      });
      crm_settings.belongsTo(models.automation_rule_template, {
        foreignKey: 'automation_rule_template_fk',
        targetKey: 'automation_rule_template_id',
      });
    }
  }

  let fields = {
    crm_settings_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    agency_fk: { type: DataTypes.UUID },
    agency_oauth_fk: { type: DataTypes.UUID },
    automation_rule_template_fk: { type: DataTypes.UUID },
    channel_type: { type: DataTypes.STRING },
    crm_type: { type: DataTypes.STRING }, // SFDC, GCALENDAR, OUTLOOK, MINDBODY, HUBSPOT
    crm_timeslot_settings: { type: DataTypes.TEXT },
    screens_data: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.UUID },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  crm_settings.init(fields, {
    sequelize,
    modelName: 'crm_settings',
    freezeTableName: true,
    timestamps: false,
  });
  return crm_settings;
};
