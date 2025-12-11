/*
Opportunity payload
{
  attributes: {
    type: 'Opportunity',
    url: '/services/data/v42.0/sobjects/Opportunity/0065j00000vDf4MAAS'
  },
  Id: '0065j00000vDf4MAAS',
  IsDeleted: false,
  AccountId: '0015j00000oheTQAAY',
  IsPrivate: false,
  Name: 'Olivia XERO 2',
  Description: null,
  StageName: 'Needs Analysis',
  Amount: null,
  Probability: 20,
  ExpectedRevenue: null,
  TotalOpportunityQuantity: null,
  CloseDate: '2022-10-26',
  Type: null,
  NextStep: null,
  LeadSource: null,
  IsClosed: false,
  IsWon: false,
  ForecastCategory: 'Pipeline',
  ForecastCategoryName: 'Pipeline',
  CampaignId: null,
  HasOpportunityLineItem: false,
  Pricebook2Id: null,
  OwnerId: '0055j0000076SBtAAM',
  CreatedDate: '2022-10-27T03:28:04.000+0000',
  CreatedById: '0055j0000076SBtAAM',
  LastModifiedDate: '2022-10-27T03:28:04.000+0000',
  LastModifiedById: '0055j0000076SBtAAM',
  SystemModstamp: '2022-10-27T03:28:04.000+0000',
  LastActivityDate: null,
  FiscalQuarter: 4,
  FiscalYear: 2022,
  Fiscal: '2022 4',
  LastViewedDate: '2022-10-27T03:28:05.000+0000',
  LastReferencedDate: '2022-10-27T03:28:05.000+0000',
  HasOpenActivity: false,
  HasOverdueTask: false,
  DeliveryInstallationStatus__c: null,
  TrackingNumber__c: null,
  OrderNumber__c: null,
  CurrentGenerators__c: null,
  MainCompetitors__c: null,
  Project_ID__c: '292skdsl29020'
  Project_Id__c: 'Orlando'
}
*/
'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class sf_opportunity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      sf_opportunity.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }

  // NOTES
  // for salesforce based tables, we will be conforming to their variable format to remove confussion
  // some fields have a "__c" suffix which means that it is custom field
  let fields = {
    sf_opportunity_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    attributes: DataTypes.TEXT,
    Id: DataTypes.STRING,
    IsDeleted: DataTypes.BOOLEAN,
    AccountId: DataTypes.STRING,
    IsPrivate: DataTypes.BOOLEAN,
    Name: DataTypes.STRING,
    Description: DataTypes.TEXT,
    StageName: DataTypes.STRING,
    Amount: DataTypes.DOUBLE,
    Probability: DataTypes.INTEGER,
    ExpectedRevenue: DataTypes.DOUBLE,
    TotalOpportunityQuantity: DataTypes.INTEGER,
    CloseDate: DataTypes.STRING,
    Type: DataTypes.STRING,
    NextStep: DataTypes.STRING,
    LeadSource: DataTypes.STRING,
    IsClosed: DataTypes.BOOLEAN,
    IsWon: DataTypes.BOOLEAN,
    ForecastCategory: DataTypes.STRING,
    ForecastCategoryName: DataTypes.STRING,
    CampaignId: DataTypes.STRING,
    HasOpportunityLineItem: DataTypes.BOOLEAN,
    Pricebook2Id: DataTypes.STRING,
    OwnerId: DataTypes.STRING,
    CreatedDate: DataTypes.DATE,
    CreatedById: DataTypes.STRING,
    LastModifiedDate: DataTypes.DATE,
    LastModifiedById: DataTypes.STRING,
    SystemModstamp: DataTypes.DATE,
    LastActivityDate: DataTypes.DATE,
    FiscalQuarter: DataTypes.INTEGER,
    FiscalYear: DataTypes.INTEGER,
    Fiscal: DataTypes.STRING,
    LastViewedDate: DataTypes.DATE,
    LastReferencedDate: DataTypes.DATE,
    HasOpenActivity: DataTypes.BOOLEAN,
    HasOverdueTask: DataTypes.BOOLEAN,
    DeliveryInstallationStatus__c: DataTypes.STRING,
    TrackingNumber__c: DataTypes.STRING,
    OrderNumber__c: DataTypes.STRING,
    CurrentGenerators__c: DataTypes.STRING,
    MainCompetitors__c: DataTypes.STRING,
    Project_ID__c: DataTypes.STRING,
    Project_Id: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  sf_opportunity.init(fields, {
    sequelize,
    modelName: 'sf_opportunity',
    freezeTableName: true,
    timestamps: false,
  });
  return sf_opportunity;
};
