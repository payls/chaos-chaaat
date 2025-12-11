'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class live_chat_session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      live_chat_session.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      live_chat_session.hasMany(models.live_chat, {
        foreignKey: 'session_id',
      });
    }
  }

  let fields = {
    live_chat_session_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  live_chat_session.init(fields, {
    sequelize,
    modelName: 'live_chat_session',
    freezeTableName: true,
    timestamps: false,
  });

  return live_chat_session;
};
