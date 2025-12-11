'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_user_chat_read_status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // agency_campaign_event_details.belongsTo(models.whatsapp_message_tracker, {
      //   foreignKey: 'agency_fk',
      //   targetKey: 'agency_fk',
      // });
    }
  }

  let fields = {
    agency_user_chat_read_status_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    chat_id: { type: DataTypes.STRING },
    chat_type: { type: DataTypes.STRING },
    agency_user_fk: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_user_chat_read_status.init(fields, {
    sequelize,
    modelName: 'agency_user_chat_read_status',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_user_chat_read_status;
};
