const h = require('../helpers');

module.exports.makeController = (models) => {
  const { sf_opportunity: sfOpportunityModel } = models;

  const sfOpportunityCtl = {};

  /**
   * Create sf_opportunity record
   * @param {{
   *  sf_opportunity_id?: string,
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  IsDeleted: boolean,
   *  AccountId: string,
   *  IsPrivate: boolean,
   *  Name: string,
   *  Description: string,
   *  StageName: string,
   *  Amount: number,
   *  Probability: number,
   *  ExpectedRevenue: number,
   *  TotalOpportunityQuantity: number,
   *  CloseDate: date,
   *  Type: string,
   *  NextStep: string,
   *  LeadSource: string,
   *  IsClosed: boolean,
   *  IsWon: boolean,
   *  ForecastCategory: string,
   *  ForecastCategoryName: string,
   *  CampaignId: string,
   *  HasOpportunityLineItem: boolean,
   *  Pricebook2Id: string,
   *  OwnerId: string,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  LastActivityDate: date,
   *  FiscalQuarter: number,
   *  FiscalYear: number,
   *  Fiscal: string,
   *  LastViewedDate: date,
   *  LastReferencedDate: date,
   *  HasOpenActivity: boolean,
   *  HasOverdueTask: boolean,
   *  DeliveryInstallationStatus__c: string,
   *  TrackingNumber__c: string,
   *  OrderNumber__c: string,
   *  CurrentGenerators__c: string,
   *  MainCompetitors__c: string,
   *  Project_ID__c: string,
   *  Project_Id: string,
   *	created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */

  sfOpportunityCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'sfOpportunityCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      attributes,
      Id,
      IsDeleted,
      AccountId,
      IsPrivate,
      Name,
      Description,
      StageName,
      Amount,
      Probability,
      ExpectedRevenue,
      TotalOpportunityQuantity,
      CloseDate,
      Type,
      NextStep,
      LeadSource,
      IsClosed,
      IsWon,
      ForecastCategory,
      ForecastCategoryName,
      CampaignId,
      HasOpportunityLineItem,
      Pricebook2Id,
      OwnerId,
      CreatedDate,
      CreatedById,
      LastModifiedDate,
      LastModifiedById,
      SystemModstamp,
      LastActivityDate,
      FiscalQuarter,
      FiscalYear,
      Fiscal,
      LastViewedDate,
      LastReferencedDate,
      HasOpenActivity,
      HasOverdueTask,
      DeliveryInstallationStatus__c,
      TrackingNumber__c,
      OrderNumber__c,
      CurrentGenerators__c,
      MainCompetitors__c,
      Project_ID__c,
      Project_Id,
      Project_Id__c,
      created_by,
    } = record;
    const sf_opportunity_id = h.general.generateId();
    await sfOpportunityModel.create(
      {
        sf_opportunity_id,
        agency_fk,
        attributes,
        Id,
        IsDeleted,
        AccountId,
        IsPrivate,
        Name,
        Description,
        StageName,
        Amount,
        Probability,
        ExpectedRevenue,
        TotalOpportunityQuantity,
        CloseDate,
        Type,
        NextStep,
        LeadSource,
        IsClosed,
        IsWon,
        ForecastCategory,
        ForecastCategoryName,
        CampaignId,
        HasOpportunityLineItem,
        Pricebook2Id,
        OwnerId,
        CreatedDate,
        CreatedById,
        LastModifiedDate,
        LastModifiedById,
        SystemModstamp,
        LastActivityDate,
        FiscalQuarter,
        FiscalYear,
        Fiscal,
        LastViewedDate,
        LastReferencedDate,
        HasOpenActivity,
        HasOverdueTask,
        DeliveryInstallationStatus__c,
        TrackingNumber__c,
        OrderNumber__c,
        CurrentGenerators__c,
        MainCompetitors__c,
        Project_ID__c,
        Project_Id: Project_Id__c || Project_Id,
        created_by,
      },
      { transaction },
    );

    return sf_opportunity_id;
  };

  /**
   * Update sf_opportunity record
   * @param {string} sf_opportunity_id
   * @param {{
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  IsDeleted: boolean,
   *  AccountId: string,
   *  IsPrivate: boolean,
   *  Name: string,
   *  Description: string,
   *  StageName: string,
   *  Amount: number,
   *  Probability: number,
   *  ExpectedRevenue: number,
   *  TotalOpportunityQuantity: number,
   *  CloseDate: date,
   *  Type: string,
   *  NextStep: string,
   *  LeadSource: string,
   *  IsClosed: boolean,
   *  IsWon: boolean,
   *  ForecastCategory: string,
   *  ForecastCategoryName: string,
   *  CampaignId: string,
   *  HasOpportunityLineItem: boolean,
   *  Pricebook2Id: string,
   *  OwnerId: string,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  LastActivityDate: date,
   *  FiscalQuarter: number,
   *  FiscalYear: number,
   *  Fiscal: string,
   *  LastViewedDate: date,
   *  LastReferencedDate: date,
   *  HasOpenActivity: boolean,
   *  HasOverdueTask: boolean,
   *  DeliveryInstallationStatus__c: string,
   *  TrackingNumber__c: string,
   *  OrderNumber__c: string,
   *  CurrentGenerators__c: string,
   *  MainCompetitors__c: string,
   *  Project_ID__c: string,
   *  Project_Id: string,
   *	created_by: string,
   *	created_by: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  sfOpportunityCtl.update = async (
    sf_opportunity_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'sfOpportunityCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      attributes,
      Id,
      IsDeleted,
      AccountId,
      IsPrivate,
      Name,
      Description,
      StageName,
      Amount,
      Probability,
      ExpectedRevenue,
      TotalOpportunityQuantity,
      CloseDate,
      Type,
      NextStep,
      LeadSource,
      IsClosed,
      IsWon,
      ForecastCategory,
      ForecastCategoryName,
      CampaignId,
      HasOpportunityLineItem,
      Pricebook2Id,
      OwnerId,
      CreatedDate,
      CreatedById,
      LastModifiedDate,
      LastModifiedById,
      SystemModstamp,
      LastActivityDate,
      FiscalQuarter,
      FiscalYear,
      Fiscal,
      LastViewedDate,
      LastReferencedDate,
      HasOpenActivity,
      HasOverdueTask,
      DeliveryInstallationStatus__c,
      TrackingNumber__c,
      OrderNumber__c,
      CurrentGenerators__c,
      MainCompetitors__c,
      Project_ID__c,
      Project_Id__c,
      Project_Id,
    } = record;
    await sfOpportunityModel.update(
      {
        agency_fk,
        attributes,
        Id,
        IsDeleted,
        AccountId,
        IsPrivate,
        Name,
        Description,
        StageName,
        Amount,
        Probability,
        ExpectedRevenue,
        TotalOpportunityQuantity,
        CloseDate,
        Type,
        NextStep,
        LeadSource,
        IsClosed,
        IsWon,
        ForecastCategory,
        ForecastCategoryName,
        CampaignId,
        HasOpportunityLineItem,
        Pricebook2Id,
        OwnerId,
        CreatedDate,
        CreatedById,
        LastModifiedDate,
        LastModifiedById,
        SystemModstamp,
        LastActivityDate,
        FiscalQuarter,
        FiscalYear,
        Fiscal,
        LastViewedDate,
        LastReferencedDate,
        HasOpenActivity,
        HasOverdueTask,
        DeliveryInstallationStatus__c,
        TrackingNumber__c,
        OrderNumber__c,
        CurrentGenerators__c,
        MainCompetitors__c,
        Project_ID__c,
        Project_Id: Project_Id__c || Project_Id,
        updated_by,
      },
      { where: { sf_opportunity_id }, transaction },
    );
    return sf_opportunity_id;
  };

  /**
   * Find all sf_opportunity records
   * @param {{
   *  sf_opportunity_id: string,
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  IsDeleted: boolean,
   *  AccountId: string,
   *  IsPrivate: boolean,
   *  Name: string,
   *  Description: string,
   *  StageName: string,
   *  Amount: number,
   *  Probability: number,
   *  ExpectedRevenue: number,
   *  TotalOpportunityQuantity: number,
   *  CloseDate: date,
   *  Type: string,
   *  NextStep: string,
   *  LeadSource: string,
   *  IsClosed: boolean,
   *  IsWon: boolean,
   *  ForecastCategory: string,
   *  ForecastCategoryName: string,
   *  CampaignId: string,
   *  HasOpportunityLineItem: boolean,
   *  Pricebook2Id: string,
   *  OwnerId: string,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  LastActivityDate: date,
   *  FiscalQuarter: number,
   *  FiscalYear: number,
   *  Fiscal: string,
   *  LastViewedDate: date,
   *  LastReferencedDate: date,
   *  HasOpenActivity: boolean,
   *  HasOverdueTask: boolean,
   *  DeliveryInstallationStatus__c: string,
   *  TrackingNumber__c: string,
   *  OrderNumber__c: string,
   *  CurrentGenerators__c: string,
   *  MainCompetitors__c: string,
   *  Project_ID__c: string,
   *  Project_Id: string,
   *	created_by: string,
   *	created_by: string,
   *	updated_by: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  sfOpportunityCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'sfOpportunityCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await sfOpportunityModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };
  /**
   * Find one sf_opportunity record
   * @param {{
   *  sf_opportunity_id: string,
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  IsDeleted: boolean,
   *  AccountId: string,
   *  IsPrivate: boolean,
   *  Name: string,
   *  Description: string,
   *  StageName: string,
   *  Amount: number,
   *  Probability: number,
   *  ExpectedRevenue: number,
   *  TotalOpportunityQuantity: number,
   *  CloseDate: date,
   *  Type: string,
   *  NextStep: string,
   *  LeadSource: string,
   *  IsClosed: boolean,
   *  IsWon: boolean,
   *  ForecastCategory: string,
   *  ForecastCategoryName: string,
   *  CampaignId: string,
   *  HasOpportunityLineItem: boolean,
   *  Pricebook2Id: string,
   *  OwnerId: string,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  LastActivityDate: date,
   *  FiscalQuarter: number,
   *  FiscalYear: number,
   *  Fiscal: string,
   *  LastViewedDate: date,
   *  LastReferencedDate: date,
   *  HasOpenActivity: boolean,
   *  HasOverdueTask: boolean,
   *  DeliveryInstallationStatus__c: string,
   *  TrackingNumber__c: string,
   *  OrderNumber__c: string,
   *  CurrentGenerators__c: string,
   *  MainCompetitors__c: string,
   *  Project_ID__c: string,
   *  Project_Id: string,
   *	created_by: string,
   *	created_by: string,
   *	updated_by: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  sfOpportunityCtl.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'sfOpportunityCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await sfOpportunityModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete sf_opportunity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  sfOpportunityCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'sfOpportunityCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await sfOpportunityModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Soft delete sf_opportunity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  sfOpportunityCtl.softDelete = async (where, { transaction } = {}) => {
    const funcName = 'sfOpportunityCtl.softDelete';
    h.validation.requiredParams(funcName, { where });
    await sfOpportunityModel.update(
      {
        IsDeleted: true,
      },
      { where: { ...where }, transaction },
    );
  };

  return sfOpportunityCtl;
};
