'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_view extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      contact_view.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      contact_view.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
      contact_view.hasMany(models.contact_view_property, {
        foreignKey: 'contact_view_fk',
      });
    }
  }

  let fields = {
    contact_view_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    agency_fk: { type: DataTypes.UUID },
    agency_user_fk: { type: DataTypes.UUID },
    contact_view_name: { type: DataTypes.STRING },
    contact_view_fields: { type: DataTypes.STRING },
    access_level: { type: DataTypes.INTEGER },
    contact_view_status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_view.init(fields, {
    sequelize,
    modelName: 'contact_view',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_view;
};
