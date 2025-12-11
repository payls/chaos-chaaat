'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class automation_rule_trigger extends Model {}
  let fields = {
    rule_trigger_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    description: { type: DataTypes.TEXT },
    platform: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  automation_rule_trigger.init(fields, {
    sequelize,
    modelName: 'automation_rule_trigger',
    freezeTableName: true,
    timestamps: false,
  });
  return automation_rule_trigger;
};
