'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class live_chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      live_chat.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      live_chat.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      live_chat.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });

      live_chat.belongsTo(models.live_chat_session, {
        foreignKey: 'session_id',
        targetKey: 'live_chat_session_id',
      });
    }
  }

  let fields = {
    live_chat_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    session_id: { type: DataTypes.STRING },
    msg_type: { type: DataTypes.STRING },
    msg_body: { type: DataTypes.TEXT },
    media_url: { type: DataTypes.TEXT },
    content_type: { type: DataTypes.STRING },
    file_name: { type: DataTypes.TEXT },
    reply_to_live_chat_id: { type: DataTypes.TEXT },
    reply_to_content: { type: DataTypes.TEXT },
    reply_to_msg_type: { type: DataTypes.STRING },
    reply_to_file_name: { type: DataTypes.TEXT },
    reply_to_contact_id: { type: DataTypes.STRING },
    caption: { type: DataTypes.TEXT },
    msg_timestamp: { type: DataTypes.INTEGER },
    sender_number: { type: DataTypes.STRING },
    receiver_number: { type: DataTypes.STRING },
    sent: { type: DataTypes.INTEGER },
    delivered: { type: DataTypes.INTEGER },
    failed: { type: DataTypes.INTEGER },
    read: { type: DataTypes.INTEGER },
    replied: { type: DataTypes.INTEGER },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  live_chat.init(fields, {
    sequelize,
    modelName: 'live_chat',
    freezeTableName: true,
    timestamps: false,
  });

  return live_chat;
};
