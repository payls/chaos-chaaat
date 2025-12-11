'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class amq_progress_tracker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      amq_progress_tracker.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }

  let fields = {
    amq_progress_tracker_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    type: { type: DataTypes.STRING },
    success: { type: DataTypes.INTEGER },
    error: { type: DataTypes.INTEGER },
    total: { type: DataTypes.INTEGER },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  amq_progress_tracker.init(fields, {
    sequelize,
    modelName: 'amq_progress_tracker',
    freezeTableName: true,
    timestamps: false,
  });

  return amq_progress_tracker;
};
