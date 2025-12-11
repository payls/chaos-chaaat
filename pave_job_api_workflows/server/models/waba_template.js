'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class waba_template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
      waba_template.belongsTo(models.agency_whatsapp_config, {
        foreignKey: 'waba_number',
        targetKey: 'waba_number',
      });
    }
  }
  let fields = {
    waba_template_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    template_id: { type: DataTypes.STRING },
    template_name: { type: DataTypes.STRING },
    waba_number: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
    header_image: { type: DataTypes.TEXT },
    variable_identifier: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING },
    language: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    template_order: { type: DataTypes.INTEGER },
    visible: { type: DataTypes.BOOLEAN },
    is_edited: { type: DataTypes.BOOLEAN },
    last_edit_date: { type: DataTypes.DATE },
    is_draft: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  waba_template.init(fields, {
    sequelize,
    modelName: 'waba_template',
    freezeTableName: true,
    timestamps: false,
  });

  return waba_template;
};
