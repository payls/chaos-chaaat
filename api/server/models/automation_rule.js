'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class automation_rule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      automation_rule.hasMany(models.automation_rule_template, {
        foreignKey: 'automation_rule_fk',
      });

      automation_rule.hasMany(models.automation_rule_packages, {
        foreignKey: 'automation_rule_fk',
      });

      automation_rule.hasOne(models.automation_rule_form, {
        foreignKey: 'automation_rule_fk',
      });

      automation_rule.belongsTo(models.automation_category, {
        foreignKey: 'automation_category_fk',
        targetKey: 'automation_category_id',
      });
    }
  }
  let fields = {
    automation_rule_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    name: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    exclude_package: {
      type: DataTypes.UUID,
    },
    automation_category_fk: {
      type: DataTypes.UUID,
    },
    rule_trigger_fk: {
      type: DataTypes.UUID,
    },
    rule_trigger_setting: {
      type: DataTypes.STRING,
    },
    rule_trigger_setting_count: {
      type: DataTypes.STRING,
    },
    workflow_timeout_count: {
      type: DataTypes.INTEGER,
    },
    workflow_timeout_type: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  automation_rule.init(fields, {
    sequelize,
    modelName: 'automation_rule',
    freezeTableName: true,
    timestamps: false,
  });
  return automation_rule;
};
