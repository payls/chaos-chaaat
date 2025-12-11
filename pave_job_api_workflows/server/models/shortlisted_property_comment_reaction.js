'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class shortlisted_property_comment_reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shortlisted_property_comment_reaction.belongsTo(
        models.shortlisted_property_comment,
        {
          foreignKey: 'shortlisted_property_comment_fk',
          targetKey: 'shortlisted_property_comment_id',
        },
      );
      shortlisted_property_comment_reaction.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
      shortlisted_property_comment_reaction.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }
  let fields = {
    shortlisted_property_comment_reaction_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    shortlisted_property_comment_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    emoji: DataTypes.STRING, // constant.SHORTLIST_PROPERTY.COMMENT.REACTION
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_property_comment_reaction.init(fields, {
    sequelize,
    modelName: 'shortlisted_property_comment_reaction',
    freezeTableName: true,
    timestamps: false,
  });
  return shortlisted_property_comment_reaction;
};
