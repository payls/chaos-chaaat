'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class shortlisted_property_comment_attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shortlisted_property_comment_attachment.belongsTo(
        models.shortlisted_property_comment,
        {
          foreignKey: 'shortlisted_property_comment_fk',
          targetKey: 'shortlisted_property_comment_id',
        },
      );
    }
  }
  let fields = {
    shortlisted_property_comment_attachment_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    shortlisted_property_comment_fk: DataTypes.UUID,
    attachment_url: DataTypes.TEXT,
    attachment_title: DataTypes.STRING,
    file_name: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  shortlisted_property_comment_attachment.init(fields, {
    sequelize,
    modelName: 'shortlisted_property_comment_attachment',
    freezeTableName: true,
    timestamps: false,
  });
  return shortlisted_property_comment_attachment;
};
