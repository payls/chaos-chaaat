'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_source extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contact_source.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }

  let fields = {
    contact_source_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: DataTypes.UUID,
    source_contact_id: DataTypes.STRING,
    source_type: DataTypes.STRING,
    source_meta: DataTypes.TEXT,
    source_original_payload: DataTypes.TEXT,
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_source.init(fields, {
    sequelize,
    modelName: 'contact_source',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_source;
};
