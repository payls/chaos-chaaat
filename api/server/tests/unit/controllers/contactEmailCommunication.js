const assert = require('chai').assert;
const models = require('../../../models');
const h = require('../../../helpers');

const contactEmailCommunicationController =
  require('../../../controllers/contactEmailCommunication').makeContactEmailCommunicationController(
    models,
  );

h.test.init();

const contactEmailCommunicationInfo = {
  contact_fk: '8ue38sh7-49e8-11eb-a0fc-2147043b1de0',
  agency_user_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  email_subject: '<p>test email subject</p>',
  email_body: '<p> test email body </p>',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for contactEmailCommunicationController', function () {
  it('create: should create contact email communication record and return contact_email_communication_id', async function () {
    const { contact_email_communication_id } = await h.database.transaction(
      async (transaction) => {
        const contact_email_communication_id =
          await contactEmailCommunicationController.create(
            contactEmailCommunicationInfo,
            { transaction },
          );

        await contactEmailCommunicationController.destroy(
          { contact_email_communication_id },
          { transaction },
        );
        return { contact_email_communication_id };
      },
    );
    assert.isNotNull(contact_email_communication_id);
    assert.isString(contact_email_communication_id);
  });

  it('findOne: by contact_email_communication_id', async function () {
    const { contact_email_communication_id, contactEmailCommunicationRecord } =
      await h.database.transaction(async (transaction) => {
        const contact_email_communication_id =
          await contactEmailCommunicationController.create(
            contactEmailCommunicationInfo,
            { transaction },
          );
        const contactEmailCommunicationRecord =
          await contactEmailCommunicationController.findOne(
            { contact_email_communication_id },
            { transaction },
          );
        await contactEmailCommunicationController.destroy(
          { contact_email_communication_id },
          { transaction },
        );
        return {
          contact_email_communication_id,
          contactEmailCommunicationRecord,
        };
      });

    assert.isNotNull(contact_email_communication_id);
    assert.isNotNull(contactEmailCommunicationRecord);
    assert.strictEqual(
      contactEmailCommunicationRecord.contact_email_communication_id,
      contact_email_communication_id,
    );
  });
  it('update: should update contact email communication record and return updated record', async function () {
    const { contact_email_communication_id, updatedRecord } =
      await h.database.transaction(async (transaction) => {
        const contact_email_communication_id =
          await contactEmailCommunicationController.create(
            contactEmailCommunicationInfo,
            { transaction },
          );
        await contactEmailCommunicationController.update(
          contact_email_communication_id,
          {
            email_subject: '<p>Updated text subject</p>',
          },
          { transaction },
        );
        const updatedRecord = await contactEmailCommunicationController.findOne(
          { contact_email_communication_id },
          { transaction },
        );
        await contactEmailCommunicationController.destroy(
          { contact_email_communication_id },
          { transaction },
        );
        return { contact_email_communication_id, updatedRecord };
      });
    assert.isNotNull(contact_email_communication_id);
    assert.isNotNull(updatedRecord);
    assert.strictEqual(
      updatedRecord.email_subject,
      '<p>Updated text subject</p>',
    );
  });
});
