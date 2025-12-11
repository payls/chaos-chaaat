'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

/*
sf_contact_opportunity payload
{
  Id: '00K5j000000tSxWEAU',
  OpportunityId: '0065j00000vDf4MAAS',
  ContactId: '0035j00000mf6jyAAA',
  IsPrimary: true,
  CreatedDate: '2022-10-27T03:28:04.000+0000',
  CreatedById: '0055j0000076SBtAAM',
  LastModifiedDate: '2022-10-27T03:28:04.000+0000',
  LastModifiedById: '0055j0000076SBtAAM',
  SystemModstamp: '2022-10-27T03:28:04.000+0000',
  IsDeleted: false
}
*/

module.exports = (sequelize, DataTypes) => {
  class sf_contact_opportunity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      sf_contact_opportunity.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }

  // NOTES
  // for salesforce based tables, we will be conforming to their variable format to remove confussion
  // some fields have a "__c" suffix which means that it is custom field
  let fields = {
    sf_contact_opportunity_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    attributes: DataTypes.TEXT,
    Id: DataTypes.STRING,
    OpportunityId: DataTypes.STRING,
    ContactId: DataTypes.STRING,
    IsPrimary: DataTypes.BOOLEAN,
    CreatedDate: DataTypes.DATE,
    CreatedById: DataTypes.STRING,
    LastModifiedDate: DataTypes.DATE,
    LastModifiedById: DataTypes.STRING,
    SystemModstamp: DataTypes.DATE,
    IsDeleted: DataTypes.BOOLEAN,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  sf_contact_opportunity.init(fields, {
    sequelize,
    modelName: 'sf_contact_opportunity',
    freezeTableName: true,
    timestamps: false,
  });
  return sf_contact_opportunity;
};
