'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class lock extends Model {
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
    lock_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    process_name: DataTypes.STRING,
    entity_id: DataTypes.STRING,
  };
  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(
    fields,
    DataTypes,
  );
  lock.init(fields, {
    sequelize,
    modelName: 'lock',
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['process_name', 'entity_id'],
      },
    ],
  });
  return lock;
};
