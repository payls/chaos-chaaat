'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class appointment_booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      appointment_booking.belongsTo(models.crm_settings, {
        foreignKey: 'crm_settings_fk',
        targetKey: 'crm_settings_id',
      });
    }
  }

  let fields = {
    appointment_booking_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    crm_settings_fk: { type: DataTypes.UUID },
    appointment_id: { type: DataTypes.STRING },
    appointment_type: { type: DataTypes.STRING },
    appointment_link: { type: DataTypes.STRING },
    initial_booking_message: { type: DataTypes.STRING },
    initial_message_cta: { type: DataTypes.STRING },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    timezone: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  appointment_booking.init(fields, {
    sequelize,
    modelName: 'appointment_booking',
    freezeTableName: true,
    timestamps: false,
  });
  return appointment_booking;
};
