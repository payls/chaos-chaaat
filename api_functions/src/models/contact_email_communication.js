'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_email_communication extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contact_email_communication.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
      contact_email_communication.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }
  let fields = {
    contact_email_communication_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    email_subject: DataTypes.TEXT,
    email_body: DataTypes.TEXT,
    email_meta: DataTypes.TEXT, // in case we store emails from multiple sources.
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_email_communication.init(fields, {
    sequelize,
    modelName: 'contact_email_communication',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_email_communication;
};
