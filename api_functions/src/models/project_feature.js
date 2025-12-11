'use strict';
const { Model } = require('sequelize');
const h = require('../helpers');
const { v4: uuidv4 } = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class project_feature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(/*models*/) {
      // define association here
      // project_feature.belongsTo(models.project, { foreignKey: 'project_fk', targetKey: 'project_id' });
      // project_feature.belongsTo(models.feature, { foreignKey: 'feature_fk', targetKey: 'feature_id' });
    }
  }
  let fields = {
    project_feature_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: {
      type: DataTypes.UUID,
      primaryKey: false,
      references: { model: 'project', key: 'project_id' },
      allowNull: true,
    },
    feature_fk: {
      type: DataTypes.UUID,
      primaryKey: false,
      references: { model: 'feature', key: 'feature_id' },
      allowNull: true,
    },
    // name: DataTypes.STRING,
    // type: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_feature.init(fields, {
    sequelize,
    modelName: 'project_feature',
    freezeTableName: true,
    timestamps: false,
  });
  return project_feature;
};
