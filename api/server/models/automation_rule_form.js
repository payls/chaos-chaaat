'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class automation_rule_form extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      automation_rule_form.belongsTo(models.hubspot_form, {
        foreignKey: 'form_fk',
        targetKey: 'hubspot_form_id',
      });
    }
  }
  let fields = {
    automation_rule_form_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    automation_rule_fk: {
      type: DataTypes.UUID,
    },
    form_fk: {
      type: DataTypes.UUID,
    },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  automation_rule_form.init(fields, {
    sequelize,
    modelName: 'automation_rule_form',
    freezeTableName: true,
    timestamps: false,
  });
  return automation_rule_form;
};
