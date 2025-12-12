'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class line_template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
      line_template.belongsTo(models.agency_channel_config, {
        foreignKey: 'line_channel',
        targetKey: 'agency_channel_config_id',
      });

      line_template.belongsTo(models.user, {
        foreignKey: 'created_by',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    line_template_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    template_name: { type: DataTypes.STRING },
    template_type: { type: DataTypes.STRING },
    line_channel: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  line_template.init(fields, {
    sequelize,
    modelName: 'line_template',
    freezeTableName: true,
    timestamps: false,
  });

  return line_template;
};
