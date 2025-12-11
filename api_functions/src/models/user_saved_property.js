'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class user_saved_property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_saved_property.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    user_saved_property_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    property_fk: DataTypes.STRING,
    user_fk: DataTypes.UUID,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  user_saved_property.init(fields, {
    sequelize,
    modelName: 'user_saved_property',
    freezeTableName: true,
    timestamps: false,
  });
  return user_saved_property;
};
