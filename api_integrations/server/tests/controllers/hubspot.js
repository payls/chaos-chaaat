const models = require('../../models');
const { mockHubspotContactCreate } = require('../fixtures/mockHubspot');
const { assert } = require('chai');
const { mockAgency } = require('../fixtures/mockAgency');
const { initUser } = require('../common/user');
const { initAgencyUser } = require('../common/agencyUser');
const agencyController =
  require('../../controllers/agency').makeAgencyController(models);
const agencyUserController =
  require('../../controllers/agencyUser').makeAgencyUserController(models);
const contactController =
  require('../../controllers/contact').makeContactController(models);
const hubspotController =
  require('../../controllers/hubspot').makeHubspotController(models);
const userController = require('../../controllers/user').makeUserController(
  models,
);
describe(`Unit Test for hubspot controller`, function () {
  describe(`.addContactToPave()`, function () {
    let userId;
    let agencyId;
    let agencyUserId;
    beforeEach(async function () {
      const hubspotContactOwner = mockHubspotContactCreate.contact_owner;
      userId = await initUser(
        hubspotContactOwner.firstName,
        hubspotContactOwner.lastName,
        hubspotContactOwner.email,
      );
      agencyId = await agencyController.create(mockAgency);
      agencyUserId = await initAgencyUser(userId, agencyId);
    });
    afterEach(async function () {
      const hubspotContact = mockHubspotContactCreate.contact;
      await contactController.destroy({
        email: hubspotContact.properties.email,
      });
      await agencyUserController.destroy({ agency_user_id: agencyUserId });
      await agencyController.destroy({ agency_id: agencyId });
      await userController.destroy({ user_id: userId });
    });
    it(`Should succeed when creating contact from Hubspot`, async function () {
      const contactEmail = mockHubspotContactCreate.contact.properties.email;
      await hubspotController.addContactToPave(mockHubspotContactCreate);
      const contact = await contactController.findOne({
        email: contactEmail,
      });
      assert.isNotNull(contact);
      assert.strictEqual(contact.email, contactEmail);
    });
  });
});
