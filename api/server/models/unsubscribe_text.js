'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class unsubscribe_text extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  let fields = {
    unsubscribe_text_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    content: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  unsubscribe_text.init(fields, {
    sequelize,
    modelName: 'unsubscribe_text',
    freezeTableName: true,
    timestamps: false,
  });

  return unsubscribe_text;
};
