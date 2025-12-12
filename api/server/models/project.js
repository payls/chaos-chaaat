'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);

module.exports = (sequelize, DataTypes) => {
  class project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      project.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      project.hasMany(models.project_property, { foreignKey: 'project_fk' });
      project.hasMany(models.project_team_behind, { foreignKey: 'project_fk' });
      project.hasMany(models.project_media, { foreignKey: 'project_fk' });
      project.hasMany(models.project_media_property, {
        foreignKey: 'project_fk',
      });
      // project.hasMany(models.project_feature, { foreignKey: 'project_fk' });
      project.hasMany(models.project_breadcrumb, { foreignKey: 'project_fk' });
      project.hasMany(models.project_location_map, {
        foreignKey: 'project_fk',
      });
      project.hasMany(models.project_location_nearby, {
        foreignKey: 'project_fk',
      });
      project.belongsToMany(models.feature, {
        through: models.project_feature,
        as: 'features',
        foreignKey: 'project_fk',
      });
    }
  }
  let fields = {
    project_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    name: DataTypes.STRING,
    description: { type: DataTypes.TEXT },
    key_stats: { type: DataTypes.TEXT },
    project_highlights: { type: DataTypes.TEXT },
    why_invest: { type: DataTypes.TEXT },
    shopping: { type: DataTypes.TEXT },
    transport: { type: DataTypes.TEXT },
    education: { type: DataTypes.TEXT },
    project_type: DataTypes.STRING,
    currency_code: DataTypes.STRING,
    size_format: DataTypes.STRING, // constant.SIZE_FORMAT
    completion_date: DataTypes.DATE,
    location_address_1: DataTypes.STRING,
    location_address_2: DataTypes.STRING,
    location_address_3: DataTypes.STRING,
    location_latitude: DataTypes.DECIMAL(40, 20),
    location_longitude: DataTypes.DECIMAL(40, 20),
    location_google_map_url: { type: DataTypes.TEXT },
    location_google_place_id: { type: DataTypes.STRING },
    location_google_place_raw: {
      type: DataTypes.TEXT,
      get() {
        return !h.isEmpty(this.getDataValue('location_google_place_raw'))
          ? JSON.parse(this.getDataValue('location_google_place_raw'))
          : null;
      },
      set(value) {
        this.setDataValue(
          'location_google_place_raw',
          !h.isEmpty(value) ? JSON.stringify(value) : '',
        );
      },
    },
    status: { type: DataTypes.STRING }, // constant.PROJECT.STATUS
    is_deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
    country_fk: DataTypes.STRING,
    slug: DataTypes.STRING,
    property_header_info_name: DataTypes.STRING,
    property_header_info_descriptions: DataTypes.TEXT,
    property_header_info_short_description: DataTypes.TEXT,
    property_header_info_cover_picture_url: {
      type: DataTypes.TEXT,
      get() {
        return h.general.formatCdnUrl(
          config,
          this.getDataValue('property_header_info_cover_picture_url'),
        );
      },
      set(value) {
        let formattedLogoUrl = value;
        if (
          h.notEmpty(value) &&
          (value.indexOf('http://') > -1 || value.indexOf('https://') > -1)
        ) {
          formattedLogoUrl = formattedLogoUrl.replace(
            `${config.cdnUrls[0]}/`,
            '',
          );
        }
        this.setDataValue(
          'property_header_info_cover_picture_url',
          formattedLogoUrl,
        );
      },
    },
    property_header_info_cover_picture_title: DataTypes.TEXT,
    property_header_info_cover_picture_filename: DataTypes.TEXT,
    completion_status: DataTypes.DECIMAL(10, 2),
    availability_status: DataTypes.DECIMAL(10, 2),
    bedrooms_description: DataTypes.TEXT,
    pricing_description: DataTypes.TEXT,
    residences_description: DataTypes.TEXT,
    estimated_completion: DataTypes.STRING,
    units_available_description: DataTypes.TEXT,
    brochure_url: DataTypes.TEXT,
    sf_project_id: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  project.init(fields, {
    sequelize,
    modelName: 'project',
    freezeTableName: true,
    timestamps: false,
  });
  return project;
};
