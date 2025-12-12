const assert = require('chai').assert;
const constant = require('../../../../constants/constant.json');
const StaffContactLinkService = require('../../../../services/staff/contactLink');
const h = require('../../../../helpers');
const models = require('../../../../models');
const { mockContact } = require('../../../fixtures/mockContact');
const { catchError } = require('../../../../helpers/error');
const { mockUser } = require('../../../fixtures/common/mockUser');
const {
  mockProjectProperty,
} = require('../../../fixtures/mockProjectProperty');
const contactController =
  require('../../../../controllers/contact').makeContactController(models);
const projectPropertyController =
  require('../../../../controllers/projectProperty').makeProjectPropertyController(
    models,
  );
h.test.init();

let staffContactLinkService;
let projectPropertyId;

describe('contact link service unit test', function () {
  describe('.updateContactLink()', function () {
    before(async function () {
      projectPropertyId = await h.database.transaction(async (transaction) => {
        return await projectPropertyController.create(mockProjectProperty, {
          transaction,
        });
      });
    });

    beforeEach(function () {
      staffContactLinkService = new StaffContactLinkService();
    });

    it('updateContactLink should exists when app loads', function () {
      assert.isDefined(staffContactLinkService);
    });

    it('updateContactLink: should update lead status to "updated_proposal_created" when permalink already exists', async function () {
      await h.database.transaction(async (transaction) => {
        staffContactLinkService.setDbTransaction(transaction);
        const contact_id = await contactController.create(mockContact, {
          transaction,
        });
        const [err, result] = await catchError(
          staffContactLinkService.updateContactLink({
            headers: { 'x-access-token': mockUser.accessToken },
            body: {
              contact_id,
              autogenerate_permalink: true,
              unit_ids: [
                { project_property_id: projectPropertyId, display_order: 1 },
              ],
              user_id: 'random-user',
              is_general_enquiry: true,
            },
          }),
        );
        assert.isNull(err);
        assert.isNotNull(result);
        assert.isNotNull(result.isNew);
        assert.isFalse(result.isNew);
        assert.isNotNull(result.contactId);
        const contact = await contactController.findOne(
          { contact_id },
          {
            transaction,
          },
        );
        assert.isNotNull(contact);
        assert.strictEqual(
          contact.lead_status,
          constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED,
        );
        await contactController.destroy({ contact_id }, { transaction });
      });
    });

    it('updateContactLink: should update lead status to "proposal_created" when permalink created', async function () {
      await h.database.transaction(async (transaction) => {
        staffContactLinkService.setDbTransaction(transaction);
        const contact_id = await contactController.create(
          { ...mockContact, permalink: '' },
          {
            transaction,
          },
        );
        const [err, result] = await catchError(
          staffContactLinkService.updateContactLink({
            headers: { 'x-access-token': mockUser.accessToken },
            body: {
              contact_id,
              autogenerate_permalink: true,
              unit_ids: [
                { project_property_id: projectPropertyId, display_order: 1 },
              ],
              user_id: 'random-user',
            },
          }),
        );
        assert.isNull(err);
        assert.isNotNull(result);
        assert.isNotNull(result.isNew);
        assert.isTrue(result.isNew);
        assert.isNotNull(result.contactId);
        const contact = await contactController.findOne(
          { contact_id },
          {
            transaction,
          },
        );
        assert.isNotNull(contact);
        assert.strictEqual(
          contact.lead_status,
          constant.LEAD_STATUS.PROPOSAL_CREATED,
        );
        await contactController.destroy({ contact_id }, { transaction });
      });
    });

    it('updateContactLink: is_general_enquiry column should be updated based on the value(default false)', async function () {
      await h.database.transaction(async (transaction) => {
        staffContactLinkService.setDbTransaction(transaction);
        const contact_id = await contactController.create(mockContact, {
          transaction,
        });
        const [err, result] = await catchError(
          staffContactLinkService.updateContactLink({
            headers: { 'x-access-token': mockUser.accessToken },
            body: {
              contact_id,
              autogenerate_permalink: true,
              unit_ids: [
                { project_property_id: projectPropertyId, display_order: 1 },
              ],
              user_id: 'random-user',
              is_general_enquiry: true,
            },
          }),
        );

        assert.isNull(err);
        assert.isNotNull(result);
        assert.isNotNull(result.isNew);
        assert.isFalse(result.isNew);
        assert.isNotNull(result.contactId);
        const contact = await contactController.findOne(
          { contact_id },
          { transaction },
        );
        assert.isNotNull(contact);
        assert.strictEqual(contact.is_general_enquiry, true);
        await contactController.destroy({ contact_id }, { transaction });
      });
    });

    after(async function () {
      await h.database.transaction(async (transaction) => {
        await projectPropertyController.destroy(
          { project_property_id: projectPropertyId },
          { transaction },
        );
      });
    });
  });
});
