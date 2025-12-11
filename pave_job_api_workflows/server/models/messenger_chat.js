'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class messenger_chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      messenger_chat.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      messenger_chat.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      messenger_chat.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });

      messenger_chat.belongsTo(models.messenger_message_tracker, {
        foreignKey: 'messenger_webhook_event_fk',
        targetKey: 'messenger_webhook_event_id',
      });
    }
  }

  let fields = {
    messenger_chat_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    campaign_name: { type: DataTypes.TEXT },
    agency_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    messenger_webhook_event_fk: { type: DataTypes.STRING },
    msg_id: { type: DataTypes.STRING },
    msg_type: { type: DataTypes.STRING },
    msg_body: { type: DataTypes.TEXT },
    media_url: { type: DataTypes.TEXT },
    media_msg_id: { type: DataTypes.TEXT },
    content_type: { type: DataTypes.STRING },
    file_name: { type: DataTypes.TEXT },
    reply_to_event_id: { type: DataTypes.TEXT },
    reply_to_content: { type: DataTypes.TEXT },
    reply_to_msg_type: { type: DataTypes.STRING },
    reply_to_file_name: { type: DataTypes.TEXT },
    reply_to_contact_id: { type: DataTypes.STRING },
    caption: { type: DataTypes.TEXT },
    msg_origin: { type: DataTypes.STRING },
    msg_timestamp: { type: DataTypes.INTEGER },
    sender: { type: DataTypes.STRING },
    sender_url: { type: DataTypes.STRING },
    receiver: { type: DataTypes.STRING },
    receiver_url: { type: DataTypes.STRING },
    delivered: { type: DataTypes.INTEGER },
    sent: { type: DataTypes.INTEGER },
    failed: { type: DataTypes.INTEGER },
    read: { type: DataTypes.INTEGER },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  messenger_chat.init(fields, {
    sequelize,
    modelName: 'messenger_chat',
    freezeTableName: true,
    timestamps: false,
  });

  return messenger_chat;
};
