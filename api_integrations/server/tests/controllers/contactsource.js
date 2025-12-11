const assert = require('chai').assert;
const h = require('../../helpers');
const { mockContact } = require('../fixtures/mockContact');
const models = require('../../models');
const contactSourceController =
  require('../../controllers/contactSource').makeContactSourceController(
    models,
  );
const dummyContactSource = mockContact.dummyContactSource;
h.test.init();

describe('Unit Test for contactsource controller', function () {
  before(async function () {});

  it('Able to create contact source', async function () {
    await h.database.transaction(async (transaction) => {
      await contactSourceController.create(dummyContactSource, { transaction });
    });
  });

  after(async function () {
    await h.database.transaction(async (transaction) => {
      const deletedContactSource = await contactSourceController.destroy(
        {
          source_contact_id: dummyContactSource.source_contact_id,
        },
        { transaction },
      );
    });
  });
});
