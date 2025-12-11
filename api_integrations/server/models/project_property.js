'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class project_property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project_property.belongsTo(models.project, {
        foreignKey: 'project_fk',
        targetKey: 'project_id',
      });
      project_property.hasMany(models.project_media_property, {
        foreignKey: 'project_property_fk',
      });
      project_property.belongsToMany(models.project_media, {
        through: 'project_media_property',
        as: 'project_medias',
        foreignKey: 'project_property_fk',
      });
    }
  }
  let fields = {
    project_property_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_fk: DataTypes.UUID,
    unit_type: DataTypes.STRING,
    unit_number: DataTypes.STRING,
    floor: DataTypes.STRING,
    sqm: {
      type: DataTypes.DECIMAL(20, 10),
      get() {
        return Math.abs(this.getDataValue('sqm')).toFixed(1);
      },
    },
    number_of_bedroom: {
      type: DataTypes.DECIMAL(10, 1),
      get() {
        return Math.abs(this.getDataValue('number_of_bedroom')).toFixed(1);
      },
    },
    number_of_bathroom: {
      type: DataTypes.DECIMAL(10, 1),
      get() {
        return Math.abs(this.getDataValue('number_of_bathroom')).toFixed(1);
      },
    },
    number_of_parking_lots: DataTypes.STRING,
    direction_facing: DataTypes.STRING, // constant.DIRECTION
    currency_code: DataTypes.STRING,
    starting_price: {
      type: DataTypes.DECIMAL(40, 10),
      get() {
        return Math.abs(this.getDataValue('starting_price')).toFixed(2);
      },
    },
    weekly_rent: DataTypes.DECIMAL(40, 10),
    rental_yield: DataTypes.DECIMAL(40, 10),
    status: DataTypes.STRING, // constant.PROPERTY.STATUS
    is_deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project_property.init(fields, {
    sequelize,
    modelName: 'project_property',
    freezeTableName: true,
    timestamps: false,
  });
  return project_property;
};
