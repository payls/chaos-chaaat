'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/constant.json');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.user_email_verification, { foreignKey: 'user_fk' });
      user.hasMany(models.user_access_token, { foreignKey: 'user_fk' });
      user.hasMany(models.user_social_auth, { foreignKey: 'user_fk' });
      user.hasMany(models.user_role, { foreignKey: 'user_fk' });
      user.hasMany(models.task, { foreignKey: 'owner_fk' });
      user.hasMany(models.task_message, { foreignKey: 'user_fk' });
      user.hasMany(models.user_saved_property, { foreignKey: 'user_fk' });
      user.hasOne(models.agency_user, { foreignKey: 'user_fk' });
    }
  }
  let fields = {
    user_id: { type: DataTypes.UUID, defaultValue: uuidv4(), primaryKey: true },
    password: { type: DataTypes.TEXT },
    password_salt: { type: DataTypes.TEXT },
    first_name: { type: DataTypes.STRING },
    middle_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    full_name: {
      type: DataTypes.VIRTUAL,
      get() {
        return h.user.formatFirstMiddleLastName({
          first_name: this.first_name,
          middle_name: this.middle_name,
          last_name: this.last_name,
        });
      },
    },
    email: { type: DataTypes.STRING },
    mobile_number: { type: DataTypes.STRING },
    is_whatsapp: { type: DataTypes.BOOLEAN },
    hubspot_bcc_id: { type: DataTypes.STRING },
    date_of_birth: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM(Object.values(constant.USER.GENDER)) },
    nationality: { type: DataTypes.STRING },
    ordinarily_resident_location: { type: DataTypes.STRING },
    permanent_resident: { type: DataTypes.INTEGER },
    profile_picture_url: {
      type: DataTypes.TEXT,
      get() {
        return h.isEmpty(this.getDataValue('profile_picture_url'))
          ? constant.USER.PROFILE_PICTURE_PLACEHOLDER
          : this.getDataValue('profile_picture_url');
      },
    },
    buyer_type: { type: DataTypes.STRING },
    last_seen: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM(Object.values(constant.USER.STATUS)),
      defaultValue: constant.USER.STATUS.ACTIVE,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes, this);
  user.init(fields, {
    sequelize,
    modelName: 'user',
    freezeTableName: true,
    timestamps: false,
  });
  return user;
};
