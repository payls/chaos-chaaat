'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_view_property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      contact_view_property.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
      contact_view_property.belongsTo(models.contact_view, {
        foreignKey: 'contact_view_fk',
        targetKey: 'contact_view_id',
      });
    }
  }

  let fields = {
    contact_view_property_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    contact_view_fk: { type: DataTypes.UUID },
    agency_user_fk: { type: DataTypes.UUID },
    is_pinned: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_view_property.init(fields, {
    sequelize,
    modelName: 'contact_view_property',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_view_property;
};
