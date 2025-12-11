'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
module.exports = (sequelize, DataTypes) => {
  class project_team_behind extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_team_behind.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
    }
  }
  let fields = {
    project_team_behind_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: DataTypes.UUID,
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    logo_url: {
      type: DataTypes.TEXT,
      get() {
        return h.general.formatCdnUrl(config, this.getDataValue('logo_url'));
      },
      set(value) {
        let formattedLogoUrl = value;
        if (
          h.notEmpty(value) &&
          (value.indexOf('http://') > -1 || value.indexOf('https://') > -1)
        ) {
          formattedLogoUrl = formattedLogoUrl.replace(
            `${config.cdnUrls[0]}/`,
            '',
          );
        }
        this.setDataValue('logo_url', formattedLogoUrl);
      },
    },
    description: DataTypes.TEXT,
    title: DataTypes.TEXT,
    filename: DataTypes.TEXT,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_team_behind.init(fields, {
    sequelize,
    modelName: 'project_team_behind',
    freezeTableName: true,
    timestamps: false,
  });
  return project_team_behind;
};
