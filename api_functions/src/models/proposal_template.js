'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class proposal_template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      proposal_template.hasMany(models.shortlisted_property_proposal_template, {
        foreignKey: 'proposal_template_fk',
      });
      proposal_template.hasMany(models.shortlisted_project_proposal_template, {
        foreignKey: 'proposal_template_fk',
      });
      proposal_template.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }

  let fields = {
    proposal_template_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    name: { type: DataTypes.STRING },
    is_draft: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_subject: { type: DataTypes.TEXT },
    email_body: { type: DataTypes.TEXT },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  proposal_template.init(fields, {
    sequelize,
    modelName: 'proposal_template',
    freezeTableName: true,
    timestamps: false,
  });
  return proposal_template;
};
