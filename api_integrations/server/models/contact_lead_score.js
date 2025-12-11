'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class contact_lead_score extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contact_lead_score.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }

  let fields = {
    contact_lead_score_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: { type: DataTypes.UUID },
    score: { type: DataTypes.INTEGER },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_lead_score.init(fields, {
    sequelize,
    modelName: 'contact_lead_score',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_lead_score;
};
