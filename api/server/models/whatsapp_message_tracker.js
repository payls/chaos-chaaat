'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class whatsapp_message_tracker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      whatsapp_message_tracker.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      whatsapp_message_tracker.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      whatsapp_message_tracker.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });

      whatsapp_message_tracker.belongsTo(models.whatsapp_chat, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_fk',
      });

      whatsapp_message_tracker.belongsTo(models.campaign_cta, {
        foreignKey: 'tracker_ref_name',
        targetKey: 'campaign_tracker_ref_name',
      });

      whatsapp_message_tracker.belongsTo(models.campaign_schedule, {
        foreignKey: 'tracker_ref_name',
        targetKey: 'tracker_ref_name',
      });

      whatsapp_message_tracker.belongsTo(models.agency_whatsapp_config, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_fk',
      });
    }
  }
  let fields = {
    whatsapp_message_tracker_id: {
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
    original_event_id: { type: DataTypes.STRING },
    msg_id: { type: DataTypes.STRING },
    msg_origin: { type: DataTypes.STRING },
    msg_body: { type: DataTypes.TEXT },
    pending: { type: DataTypes.BOOLEAN, defaultValue: true },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    batch_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    sender_number: { type: DataTypes.STRING },
    sender_url: { type: DataTypes.STRING },
    receiver_number: { type: DataTypes.STRING },
    receiver_url: { type: DataTypes.STRING },
    sent: { type: DataTypes.INTEGER, defaultValue: 0 },
    delivered: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed_reason: { type: DataTypes.TEXT },
    read: { type: DataTypes.INTEGER, defaultValue: 0 },
    replied: { type: DataTypes.INTEGER, defaultValue: 0 },
    broadcast_date: { type: DataTypes.DATE },
    visible: { type: DataTypes.INTEGER, defaultValue: 1 },
    addtl_1_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    addtl_2_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    addtl_3_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    template_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    tracker_type: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  whatsapp_message_tracker.init(fields, {
    sequelize,
    modelName: 'whatsapp_message_tracker',
    freezeTableName: true,
    timestamps: false,
  });

  return whatsapp_message_tracker;
};
