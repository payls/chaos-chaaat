'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class whatsapp_chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      whatsapp_chat.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      whatsapp_chat.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      whatsapp_chat.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });

      whatsapp_chat.belongsTo(models.whatsapp_message_tracker, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_fk',
      });
    }
  }

  let fields = {
    whatsapp_chat_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    original_event_id: { type: DataTypes.STRING },
    msg_id: { type: DataTypes.STRING },
    msg_info: { type: DataTypes.STRING },
    msg_type: { type: DataTypes.STRING },
    msg_template_id: DataTypes.UUID,
    msg_category: { type: DataTypes.STRING },
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
    sender_number: { type: DataTypes.STRING },
    sender_url: { type: DataTypes.STRING },
    receiver_number: { type: DataTypes.STRING },
    receiver_url: { type: DataTypes.STRING },
    delivered: { type: DataTypes.INTEGER },
    sent: { type: DataTypes.INTEGER },
    failed: { type: DataTypes.INTEGER },
    failed_reason: { type: DataTypes.TEXT },
    read: { type: DataTypes.INTEGER },
    campaign_name: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  whatsapp_chat.init(fields, {
    sequelize,
    modelName: 'whatsapp_chat',
    freezeTableName: true,
    timestamps: false,
  });

  return whatsapp_chat;
};
