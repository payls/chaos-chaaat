'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class product_matrix extends Model {
    static associate() {
      // define association here
      // user.hasMany(models.user_email_verification, { foreignKey: 'user_fk' });
      // user.hasMany(models.user_access_token, { foreignKey: 'user_fk' });
      // user.hasMany(models.user_social_auth, { foreignKey: 'user_fk' });
      // user.hasMany(models.user_role, { foreignKey: 'user_fk' });
      // user.hasMany(models.task, { foreignKey: 'owner_fk' });
      // user.hasMany(models.task_message, { foreignKey: 'user_fk' });
      // user.hasMany(models.user_saved_property, { foreignKey: 'user_fk' });
      // user.hasOne(models.agency_user, { foreignKey: 'user_fk' });
      // user.hasOne(models.line_template, { foreignKey: 'created_by' });
    }
  }
  let fields = {
    product_matrix_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    product_name: { type: DataTypes.STRING },
    product_type: { type: DataTypes.STRING },
    product_price: { type: DataTypes.STRING },
    stripe_product_price_id: { type: DataTypes.STRING },
    allowed_slot: { type: DataTypes.INTEGER },
    banner_image: { type: DataTypes.INTEGER },
    weekly_dealz: { type: DataTypes.INTEGER },
    weekly_banner_dealz: { type: DataTypes.INTEGER },
  };
  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(
    fields,
    DataTypes,
    this,
  );
  product_matrix.init(fields, {
    sequelize,
    modelName: 'product_matrix',
    freezeTableName: true,
    timestamps: false,
  });
  return product_matrix;
};
