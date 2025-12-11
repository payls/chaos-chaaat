'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class project_breadcrumb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_breadcrumb.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
    }
  }
  let fields = {
    project_breadcrumb_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: DataTypes.UUID,
    text: DataTypes.STRING,
    url: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_breadcrumb.init(fields, {
    sequelize,
    modelName: 'project_breadcrumb',
    freezeTableName: true,
    timestamps: false,
  });
  return project_breadcrumb;
};
