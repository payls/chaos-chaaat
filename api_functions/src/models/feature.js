'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class feature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      feature.belongsToMany(models.project, {
        through: models.project_feature,
        as: 'projects',
        foreignKey: 'feature_fk',
      });
    }
  }
  let fields = {
    feature_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    project_fk_unique: { type: DataTypes.UUID },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  feature.init(fields, {
    sequelize,
    modelName: 'feature',
    freezeTableName: true,
    timestamps: false,
  });
  return feature;
};
