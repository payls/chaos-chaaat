'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class sms_message_tracker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      sms_message_tracker.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      sms_message_tracker.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      sms_message_tracker.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }
  let fields = {
    sms_message_tracker_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    tracker_ref_name: { type: DataTypes.STRING },
    agency_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    webhook_access_key: { type: DataTypes.STRING },
    msg_id: { type: DataTypes.STRING },
    msg_type: { type: DataTypes.STRING },
    sms_msg_sid: { type: DataTypes.STRING },
    msg_body: { type: DataTypes.TEXT },
    account_sid: { type: DataTypes.STRING },
    sender_number: { type: DataTypes.STRING },
    sender_url: { type: DataTypes.STRING },
    receiver_number: { type: DataTypes.STRING },
    receiver_url: { type: DataTypes.STRING },
    delivered: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed: { type: DataTypes.INTEGER, defaultValue: 0 },
    msg_trigger: { type: DataTypes.STRING, defaultValue: 'proposal' },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  sms_message_tracker.init(fields, {
    sequelize,
    modelName: 'sms_message_tracker',
    freezeTableName: true,
    timestamps: false,
  });

  return sms_message_tracker;
};
