'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class shortlisted_property_proposal_template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shortlisted_property_proposal_template.belongsTo(
        models.proposal_template,
        {
          foreignKey: 'proposal_template_fk',
          targetKey: 'proposal_template_id',
        },
      );
      shortlisted_property_proposal_template.belongsTo(
        models.project_property,
        {
          foreignKey: 'project_property_fk',
          targetKey: 'project_property_id',
        },
      );
      shortlisted_property_proposal_template.hasMany(
        models.shortlisted_property_setting_proposal_template,
        {
          foreignKey: 'shortlisted_project_setting_proposal_template_fk',
        },
      );
    }
  }
  let fields = {
    shortlisted_property_proposal_template_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_property_fk: DataTypes.STRING,
    property_fk: DataTypes.STRING,
    proposal_template_fk: DataTypes.UUID,
    display_order: DataTypes.INTEGER,
    is_general_enquiry: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_property_proposal_template.init(fields, {
    sequelize,
    modelName: 'shortlisted_property_proposal_template',
    freezeTableName: true,
    timestamps: false,
  });
  return shortlisted_property_proposal_template;
};
