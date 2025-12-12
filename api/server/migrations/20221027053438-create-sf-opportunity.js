'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sf_opportunity', {
      sf_opportunity_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      attributes: {
        type: Sequelize.TEXT,
      },
      Id: {
        type: Sequelize.STRING,
      },
      IsDeleted: {
        type: Sequelize.BOOLEAN,
      },
      AccountId: {
        type: Sequelize.STRING,
      },
      IsPrivate: {
        type: Sequelize.BOOLEAN,
      },
      Name: {
        type: Sequelize.STRING,
      },
      Description: {
        type: Sequelize.TEXT,
      },
      StageName: {
        type: Sequelize.STRING,
      },
      Amount: {
        type: Sequelize.DOUBLE,
      },
      Probability: {
        type: Sequelize.INTEGER,
      },
      ExpectedRevenue: {
        type: Sequelize.DOUBLE,
      },
      TotalOpportunityQuantity: {
        type: Sequelize.INTEGER,
      },
      CloseDate: {
        type: Sequelize.STRING,
      },
      Type: {
        type: Sequelize.STRING,
      },
      NextStep: {
        type: Sequelize.STRING,
      },
      LeadSource: {
        type: Sequelize.STRING,
      },
      IsClosed: {
        type: Sequelize.BOOLEAN,
      },
      IsWon: {
        type: Sequelize.BOOLEAN,
      },
      ForecastCategory: {
        type: Sequelize.STRING,
      },
      ForecastCategoryName: {
        type: Sequelize.STRING,
      },
      CampaignId: {
        type: Sequelize.STRING,
      },
      HasOpportunityLineItem: {
        type: Sequelize.BOOLEAN,
      },
      Pricebook2Id: {
        type: Sequelize.STRING,
      },
      OwnerId: {
        type: Sequelize.STRING,
      },
      CreatedDate: {
        type: Sequelize.DATE,
      },
      CreatedById: {
        type: Sequelize.STRING,
      },
      LastModifiedDate: {
        type: Sequelize.DATE,
      },
      LastModifiedById: {
        type: Sequelize.STRING,
      },
      SystemModstamp: {
        type: Sequelize.DATE,
      },
      LastActivityDate: {
        type: Sequelize.DATE,
      },
      FiscalQuarter: {
        type: Sequelize.INTEGER,
      },
      FiscalYear: {
        type: Sequelize.INTEGER,
      },
      Fiscal: {
        type: Sequelize.STRING,
      },
      LastViewedDate: {
        type: Sequelize.DATE,
      },
      LastReferencedDate: {
        type: Sequelize.DATE,
      },
      HasOpenActivity: {
        type: Sequelize.BOOLEAN,
      },
      HasOverdueTask: {
        type: Sequelize.BOOLEAN,
      },
      DeliveryInstallationStatus__c: {
        type: Sequelize.STRING,
      },
      TrackingNumber__c: {
        type: Sequelize.STRING,
      },
      OrderNumber__c: {
        type: Sequelize.STRING,
      },
      CurrentGenerators__c: {
        type: Sequelize.STRING,
      },
      MainCompetitors__c: {
        type: Sequelize.STRING,
      },
      Project_ID__c: {
        type: Sequelize.STRING,
      },
      Project_Id: {
        // this is Project_Id__c in salesforce, we just remove __c because it might have an issue in mysql having similar field names but different cases
        type: Sequelize.STRING,
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sf_opportunity');
  },
};
