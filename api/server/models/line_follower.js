'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class line_follower extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      line_follower.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      line_follower.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });

      line_follower.belongsTo(models.agency_channel_config, {
        foreignKey: 'agency_channel_config_fk',
        targetKey: 'agency_channel_config_id',
      });
    }
  }

  let fields = {
    line_follower_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    agency_channel_config_fk: { type: DataTypes.UUID },
    contact_fk: DataTypes.UUID,
    line_user_fk: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  line_follower.init(fields, {
    sequelize,
    modelName: 'line_follower',
    freezeTableName: true,
    timestamps: false,
  });

  return line_follower;
};
