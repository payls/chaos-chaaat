'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class hubspot_form extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      hubspot_form.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      hubspot_form.hasMany(models.hubspot_form_submission_payload, {
        foreignKey: 'hubspot_form_fk',
      });
    }
  }

  let fields = {
    hubspot_form_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    form_id: { type: DataTypes.STRING },
    form_name: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    archived: { type: DataTypes.BOOLEAN, defaultValue: false },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  hubspot_form.init(fields, {
    sequelize,
    modelName: 'hubspot_form',
    freezeTableName: true,
    timestamps: false,
  });

  return hubspot_form;
};
