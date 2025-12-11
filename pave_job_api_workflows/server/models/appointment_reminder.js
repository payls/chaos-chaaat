'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class appointment_reminder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      appointment_reminder.belongsTo(models.appointment_booking, {
        foreignKey: 'appointment_booking_fk',
        targetKey: 'appointment_booking_id',
      });
      appointment_reminder.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
      appointment_reminder.belongsTo(models.automation_rule_template, {
        foreignKey: 'automation_rule_template_fk',
        targetKey: 'automation_rule_template_id',
      });
      appointment_reminder.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }

  let fields = {
    appointment_reminder_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    automation_rule_template_fk: { type: DataTypes.UUID },
    reminder_type: { type: DataTypes.STRING },
    time_unit: { type: DataTypes.STRING },
    time_unit_number_val: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    agency_user_fk: { type: DataTypes.UUID },
    appointment_booking_fk: { type: DataTypes.UUID },
    reminder_time: { type: DataTypes.DATE },
    node_id: { type: DataTypes.UUID },
    whatsapp_flow_fk: { type: DataTypes.UUID },
    contact_fk: { type: DataTypes.UUID },
  };

  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(fields, DataTypes);
  appointment_reminder.init(fields, {
    sequelize,
    modelName: 'appointment_reminder',
    freezeTableName: true,
    timestamps: false,
  });
  return appointment_reminder;
};
