const models = require('../models');
const hubspotController = require('./hubspot').makeHubspotController(models);
const salesforceController =
  require('./salesforce').makeSalesForceController(models);
const gmailController = require('./gmail').makeGmailController(models);
const agencyUserEmailOauthController =
  require('./agencyUserEmailOauth').makeAgencyUserEmailOauthController(models);
const trayIntegrationsController =
  require('./tray').makeTrayIntegrationsController(models);
const contactSourceController =
  require('./contactSource').makeContactSourceController(models);
const agencyUserController =
  require('./agencyUser').makeAgencyUserController(models);
const contactPropertyDefinitionsController =
  require('./contactPropertyDefinitions').makeContactPropertyDefinitionsController(
    models,
  );
const contactPropertyValuesController =
  require('./contactPropertyValues').makeContactPropertyValuesController(
    models,
  );

const sfContactOpportunityCtl =
  require('./sfContactOpportunity').makeController(models);

const sfOpportunityCtl = require('./sfOpportunity').makeController(models);

const agencyConfigCtl = require('./agencyConfig').makeController(models);

module.exports = {
  hubspot: hubspotController,
  gmail: gmailController,
  agencyUserEmailOauth: agencyUserEmailOauthController,
  tray: trayIntegrationsController,
  contactSource: contactSourceController,
  agencyUser: agencyUserController,
  salesforce: salesforceController,
  contactPropertyDefinitions: contactPropertyDefinitionsController,
  contactPropertyValues: contactPropertyValuesController,
  sfContactOpportunity: sfContactOpportunityCtl,
  sfOpportunity: sfOpportunityCtl,
  agencyConfig: agencyConfigCtl,
};
