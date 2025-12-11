'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class hubspot_form_submission_payload extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      hubspot_form_submission_payload.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      hubspot_form_submission_payload.belongsTo(models.hubspot_form, {
        foreignKey: 'hubspot_form_id',
        targetKey: 'hubspot_form_id',
      });

      hubspot_form_submission_payload.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }

  let fields = {
    hubspot_form_submission_payload_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    contact_fk: { type: DataTypes.UUID },
    hubspot_form_fk: { type: DataTypes.STRING },
    payload: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, defaultValue: 'create' },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  hubspot_form_submission_payload.init(fields, {
    sequelize,
    modelName: 'hubspot_form_submission_payload',
    freezeTableName: true,
    timestamps: false,
  });

  return hubspot_form_submission_payload;
};
