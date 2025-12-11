'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class client_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      client_detail.belongsTo(models.crm_settings, {
        foreignKey: 'crm_settings_fk',
        targetKey: 'crm_settings_id',
      });

      client_detail.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }

  let fields = {
    client_detail_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    crm_settings_fk: { type: DataTypes.UUID },
    contact_fk: { type: DataTypes.UUID },
    appointment_id: { type: DataTypes.STRING },
    client_id: { type: DataTypes.STRING }, // String // (eg: mindbody registered client id)
    email: { type: DataTypes.STRING },
    mobile_number: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  client_detail.init(fields, {
    sequelize,
    modelName: 'client_detail',
    freezeTableName: true,
    timestamps: false,
  });
  return client_detail;
};
