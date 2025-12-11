'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class unified_inbox extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      unified_inbox.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });

      unified_inbox.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      unified_inbox.belongsTo(models.whatsapp_message_tracker, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_fk',
      });
    }
  }
  let fields = {
    unified_inbox_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    tracker_id: DataTypes.UUID,
    tracker_ref_name: { type: DataTypes.STRING },
    campaign_name: { type: DataTypes.TEXT },
    agency_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    event_id: { type: DataTypes.STRING },
    msg_platform: { type: DataTypes.STRING },
    sender: { type: DataTypes.STRING },
    sender_url: { type: DataTypes.STRING },
    receiver: { type: DataTypes.STRING },
    receiver_url: { type: DataTypes.STRING },
    msg_id: { type: DataTypes.STRING },
    msg_body: { type: DataTypes.TEXT },
    msg_type: { type: DataTypes.TEXT },
    batch_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    template_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    tracker_type: { type: DataTypes.STRING },
    pending: { type: DataTypes.BOOLEAN, defaultValue: true },
    sent: { type: DataTypes.INTEGER, defaultValue: 0 },
    delivered: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed: { type: DataTypes.INTEGER, defaultValue: 0 },
    read: { type: DataTypes.INTEGER, defaultValue: 0 },
    replied: { type: DataTypes.INTEGER, defaultValue: 0 },
    broadcast_date: { type: DataTypes.DATE },
    last_msg_date: { type: DataTypes.DATE },
    visible: { type: DataTypes.INTEGER, defaultValue: 1 },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  unified_inbox.init(fields, {
    sequelize,
    modelName: 'unified_inbox',
    freezeTableName: true,
    timestamps: false,
  });

  return unified_inbox;
};
