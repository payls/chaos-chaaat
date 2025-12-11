const assert = require('chai').assert;
const h = require('../../helpers');
const { mockContact } = require('../fixtures/mockContact');
const models = require('../../models');
const contactController =
  require('../../controllers/contact').makeContactController(models);
const contactSourceController =
  require('../../controllers/contactSource').makeContactSourceController(
    models,
  );
const salesforceController =
  require('../../controllers/salesforce').makeSalesForceController(models);

const salesforceContact = mockContact.salesforceContactPayload;
h.test.init();

describe('Integration Test for salesforce controller', function () {
  before(async function () {});

  it('Able to add salesforce contact - addContactToPave()', async function () {
    const result = await salesforceController.addContactToPave(
      mockContact.salesforceContactPayload.body.raw,
    );
  });

  it('Able to update salesforce contact - updateContactInPave()', async function () {
    mockContact.salesforceContactPayload.body.raw.contact.FirstName =
      'Updated+firstName';
    mockContact.salesforceContactPayload.body.raw.contact.LastName =
      'Updated+lastName';
    mockContact.salesforceContactPayload.body.raw.contact.MobilePhone =
      'Updated+819232';
    mockContact.salesforceContactPayload.body.raw.contact.Email =
      'Updated+email+1232';

    try {
      await salesforceController.updateContactInPave(
        mockContact.salesforceContactPayload.body.raw,
      );
      const updatedContact = await contactController.findOne(
        {
          email: 'Updated+email+1232',
          first_name: 'Updated+firstName',
          last_name: 'Updated+lastName',
          mobile_number: 'Updated+819232',
          status: 'active',
          agency_fk:
            mockContact.salesforceContactPayload.body.raw.agency_user.agency_fk,
        },
        {
          include: [
            {
              model: models.contact_source,
              required: true,
              where: {
                source_contact_id:
                  mockContact.salesforceContactPayload.body.raw.contact.Id,
              },
            },
          ],
        },
      );
      assert.isNotEmpty(updatedContact);
    } catch (e) {
      assert.isNull(e);
    }
  });

  after(async function () {
    await h.database.transaction(async (transaction) => {
      const deletedContactSource = await contactSourceController.destroy(
        {
          source_contact_id:
            mockContact.salesforceContactPayload.body.raw.contact.Id,
        },
        { transaction },
      );

      await contactController.destroy(
        {
          contact_id: deletedContactSource.contact_fk,
        },
        { transaction },
      );
    });
  });
});
