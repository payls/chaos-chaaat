'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class cron_job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(/* models */) {
      // define association here
    }
  }

  let fields = {
    cron_job_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    type: { type: DataTypes.STRING },
    payload: { type: DataTypes.TEXT },
    num_try: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  cron_job.init(fields, {
    sequelize,
    modelName: 'cron_job',
    freezeTableName: true,
    timestamps: false,
  });
  return cron_job;
};
