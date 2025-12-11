'use script';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class whatsapp_flow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      whatsapp_flow.belongsTo(models.agency_user, {
        foreignKey: 'created_by',
        targetKey: 'agency_user_id',
      });

      whatsapp_flow.belongsTo(models.waba_template, {
        foreignKey: 'waba_template_fk',
        targetKey: 'waba_template_id',
      });

      whatsapp_flow.belongsTo(models.crm_settings, {
        foreignKey: 'crm_settings_fk',
        targetKey: 'crm_settings_id',
      });
    }
  }

  let fields = {
    whatsapp_flow_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
    },
    waba_template_fk: { type: DataTypes.UUID },
    crm_settings_fk: { type: DataTypes.UUID },
    flow_id: { type: DataTypes.STRING },
    flow_name: { type: DataTypes.STRING },
    flow_categories: { type: DataTypes.STRING, default: 'APPOINTMENT' },
    flow_payload: { type: DataTypes.TEXT },
    message: { type: DataTypes.STRING },
    button_text: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    preview_link: { type: DataTypes.STRING },
    created_by: { type: DataTypes.UUID },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  whatsapp_flow.init(fields, {
    sequelize,
    modelName: 'whatsapp_flow',
    freezeTableName: true,
    timestamps: false,
  });
  return whatsapp_flow;
};
