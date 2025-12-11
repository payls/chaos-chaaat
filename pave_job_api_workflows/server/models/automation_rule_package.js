'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class automation_rule_packages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      automation_rule_packages.belongsTo(models.mindbody_packages, {
        foreignKey: 'package_fk',
        targetKey: 'mindbody_package_id',
      });
    }
  }
  let fields = {
    automation_rule_packages_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    automation_rule_fk: {
      type: DataTypes.UUID,
    },
    package_fk: {
      type: DataTypes.UUID,
    },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  automation_rule_packages.init(fields, {
    sequelize,
    modelName: 'automation_rule_packages',
    freezeTableName: true,
    timestamps: false,
  });
  return automation_rule_packages;
};
