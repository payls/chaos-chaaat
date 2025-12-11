'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class shortlisted_property_comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shortlisted_property_comment.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
      shortlisted_property_comment.belongsTo(models.shortlisted_property, {
        foreignKey: 'shortlisted_property_fk',
        targetKey: 'shortlisted_property_id',
      });
      shortlisted_property_comment.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
      // shortlisted_property_comment.belongsTo(shortlisted_property_comment, { as: 'shortlisted_property_comment_reply', foreignKey: 'parent_comment_fk', targetKey: 'shortlisted_property_comment_id' });
      shortlisted_property_comment.hasMany(shortlisted_property_comment, {
        as: 'shortlisted_property_comment_reply',
        foreignKey: 'parent_comment_fk',
      });
      shortlisted_property_comment.hasMany(
        models.shortlisted_property_comment_attachment,
        { foreignKey: 'shortlisted_property_comment_fk' },
      );
      shortlisted_property_comment.hasMany(
        models.shortlisted_property_comment_reaction,
        { foreignKey: 'shortlisted_property_comment_fk' },
      );
      shortlisted_property_comment.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    shortlisted_property_comment_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    shortlisted_property_fk: DataTypes.UUID,
    contact_fk: DataTypes.UUID,
    agency_user_fk: DataTypes.UUID,
    user_fk: DataTypes.UUID,
    contact_comment: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    message: DataTypes.TEXT,
    comment_date: DataTypes.DATE,
    parent_comment_fk: DataTypes.UUID,
    status: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_property_comment.init(fields, {
    sequelize,
    modelName: 'shortlisted_property_comment',
    freezeTableName: true,
    timestamps: false,
  });
  return shortlisted_property_comment;
};
