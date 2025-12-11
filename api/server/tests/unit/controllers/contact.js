const assert = require('chai').assert;
const models = require('../../../models');
const contactController =
  require('../../../controllers/contact').makeContactController(models);
const h = require('../../../helpers');
const constant = require('../../../constants/constant.json');
const { mockContact } = require('../../fixtures/mockContact');
h.test.init();

const contactInfo = mockContact;

describe('Unit Test for contactController', function () {
  it('create: should create contact record and return contact_id', async function () {
    const { contact_id } = await h.database.transaction(async (transaction) => {
      const contact_id = await contactController.create(contactInfo, {
        transaction,
      });
      await contactController.destroy({ contact_id }, { transaction });
      return { contact_id };
    });
    assert.isNotNull(contact_id);
    assert.isString(contact_id);
  });

  it('findOne: by contact_id', async function () {
    const { contact_id, contactRecord } = await h.database.transaction(
      async (transaction) => {
        const contact_id = await contactController.create(contactInfo, {
          transaction,
        });
        const contactRecord = await contactController.findOne(
          { contact_id },
          { transaction },
        );
        await contactController.destroy({ contact_id }, { transaction });
        return { contact_id, contactRecord };
      },
    );
    assert.isNotNull(contact_id);
    assert.isNotNull(contactRecord);
    assert.strictEqual(contactRecord.contact_id, contact_id);
  });

  it('update: should update contact record and return updated record', async function () {
    const { contact_id, updatedContactRecord } = await h.database.transaction(
      async (transaction) => {
        const contact_id = await contactController.create(contactInfo, {
          transaction,
        });
        await contactController.update(
          contact_id,
          {
            first_name: 'Update First Name',
            mobile_number: '+6598765432',
          },
          { transaction },
        );
        const updatedContactRecord = await contactController.findOne(
          { contact_id },
          { transaction },
        );
        await contactController.destroy({ contact_id }, { transaction });
        return { contact_id, updatedContactRecord };
      },
    );
    assert.isNotNull(contact_id);
    assert.isNotNull(updatedContactRecord);
    assert.isString(updatedContactRecord.first_name);
    assert.isString(updatedContactRecord.mobile_number);
    assert.strictEqual(updatedContactRecord.first_name, 'Update First Name');
    assert.strictEqual(updatedContactRecord.mobile_number, '+6598765432');
  });

  it('update: should update lead status and return updated record', async function () {
    const { contact_id, contactRecord } = await h.database.transaction(
      async (transaction) => {
        const contact_id = await contactController.create(contactInfo, {
          transaction,
        });
        await contactController.update(
          contact_id,
          {
            lead_status: constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT,
          },
          { transaction },
        );
        const contactRecord = await contactController.findOne(
          { contact_id },
          { transaction },
        );
        await contactController.destroy({ contact_id }, { transaction });
        return { contact_id, contactRecord };
      },
    );
    assert.isNotNull(contact_id);
    assert.isNotNull(contactRecord);
    assert.strictEqual(
      contactRecord.lead_status,
      constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT,
    );
  });
});
