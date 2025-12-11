'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class messenger_message_tracker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      messenger_message_tracker.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      messenger_message_tracker.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      messenger_message_tracker.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });

      messenger_message_tracker.hasMany(models.messenger_chat, {
        foreignKey: 'messenger_webhook_event_fk',
      });
    }
  }
  let fields = {
    messenger_message_tracker_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    campaign_name: { type: DataTypes.TEXT },
    campaign_name_label: { type: DataTypes.TEXT },
    tracker_ref_name: { type: DataTypes.STRING },
    agency_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    messenger_webhook_event_id: { type: DataTypes.STRING },
    msg_id: { type: DataTypes.STRING },
    msg_type: { type: DataTypes.STRING },
    msg_origin: { type: DataTypes.STRING },
    msg_body: { type: DataTypes.TEXT },
    sender: { type: DataTypes.STRING },
    sender_url: { type: DataTypes.STRING },
    receiver: { type: DataTypes.STRING },
    receiver_url: { type: DataTypes.STRING },
    batch_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    template_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    tracker_type: { type: DataTypes.STRING },
    pending: { type: DataTypes.BOOLEAN, defaultValue: true },
    sent: { type: DataTypes.INTEGER, defaultValue: 0 },
    delivered: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed: { type: DataTypes.INTEGER, defaultValue: 0 },
    read: { type: DataTypes.INTEGER, defaultValue: 0 },
    replied: { type: DataTypes.INTEGER, defaultValue: 0 },
    msg_trigger: { type: DataTypes.STRING },
    broadcast_date: { type: DataTypes.DATE },
    visible: { type: DataTypes.INTEGER, defaultValue: 1 },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  messenger_message_tracker.init(fields, {
    sequelize,
    modelName: 'messenger_message_tracker',
    freezeTableName: true,
    timestamps: false,
  });

  return messenger_message_tracker;
};
