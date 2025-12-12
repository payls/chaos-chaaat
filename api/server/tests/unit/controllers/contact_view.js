const assert = require('chai').assert;
const models = require('../../../models');
const { contact_view: contactViewModel } = models;
const contactViewController =
  require('../../../controllers/contactView').makeContactViewController(models);
const h = require('../../../helpers');
h.test.init();

const contactView = {
  agency_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  agency_user_fk: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  contact_view_name: 'utm',
  contact_view_fields: 'utm',
  access_level: 1,
  contact_view_status: 'active',
};

describe('Unit Test for contactViewController', function () {
  let contact_view_id = '';

  before(async function () {
    contact_view_id = await contactViewController.create({
      agency_fk: contactView.agency_fk,
      agency_user_fk: contactView.agency_user_fk,
      contact_view_name: contactView.contact_view_name,
      contact_view_fields: contactView.contact_view_fields,
      access_level: contactView.access_level,
      contact_view_status: contactView.contact_view_status,
    });
  });

  it('delete: should soft delete a contact_view record', async function () {
    const { created_contact_view_id } = await h.database.transaction(
      async (transaction) => {
        const created_contact_view_id = await contactViewController.create(
          {
            agency_fk: contactView.agency_fk,
            agency_user_fk: contactView.agency_user_fk,
            contact_view_name: contactView.contact_view_name,
            contact_view_fields: contactView.contact_view_fields,
            access_level: contactView.access_level,
            contact_view_status: contactView.contact_view_status,
          },
          { transaction },
        );
        await contactViewController.destroy(
          { contact_view_id: created_contact_view_id },
          { transaction },
        );
        return { created_contact_view_id };
      },
    );
    const record = await contactViewModel.findOne({
      where: { contact_view_id: created_contact_view_id },
    });
    assert.isNull(record);
  });

  it('destroy: should hard delete a contact_view record', async function () {
    const { created_contact_view_id } = await h.database.transaction(
      async (transaction) => {
        const created_contact_view_id = await contactViewController.create(
          {
            agency_fk: contactView.agency_fk,
            agency_user_fk: contactView.agency_user_fk,
            contact_view_name: contactView.contact_view_name,
            contact_view_fields: contactView.contact_view_fields,
            access_level: contactView.access_level,
          },
          { transaction },
        );
        await contactViewController.destroy(
          { contact_view_id: created_contact_view_id },
          { transaction },
        );
        return { created_contact_view_id };
      },
    );
    const record = await contactViewModel.findOne({
      where: { contact_view_id: created_contact_view_id },
    });
    assert.isNull(record);
  });

  it('update: should update a contact_view and return contact_view ID of updated contact_view', async function () {
    const { updated_contact_view_id } = await h.database.transaction(
      async (transaction) => {
        const updated_contact_view_id = await contactViewController.update(
          contact_view_id,
          {
            agency_fk: contactView.agency_fk,
            agency_user_fk: contactView.agency_user_fk,
            contact_view_name: contactView.contact_view_name,
            contact_view_fields: contactView.contact_view_fields,
            access_level: contactView.access_level,
            contact_view_status: contactView.contact_view_status,
          },
          { transaction },
        );
        return { updated_contact_view_id };
      },
    );
    assert.isNotNull(updated_contact_view_id);
    assert.strictEqual(updated_contact_view_id, contact_view_id);
  });

  it('findAll: should return contact_view records', async function () {
    const { contact_views } = await h.database.transaction(
      async (transaction) => {
        const contact_views = await contactViewController.findAll(
          {},
          { transaction },
        );
        return { contact_views };
      },
    );
    assert.exists(contact_views);
  });

  it('findOne: should return contact_view record', async function () {
    const { contact_view } = await h.database.transaction(
      async (transaction) => {
        const contact_view = await contactViewController.findOne(
          { contact_view_id },
          { transaction },
        );
        return { contact_view };
      },
    );
    assert.isNotNull(contact_view);
    assert.strictEqual(contact_view.agency_fk, contactView.agency_fk);
    assert.strictEqual(contact_view.agency_user_fk, contactView.agency_user_fk);
    assert.strictEqual(
      contact_view.contact_view_fields,
      contactView.contact_view_fields,
    );
    assert.strictEqual(contact_view.access_level, contactView.access_level);
    assert.strictEqual(
      contact_view.contact_view_name,
      contactView.contact_view_name,
    );
  });

  after(async function () {
    await contactViewController.destroy({ contact_view_id });
  });
});
