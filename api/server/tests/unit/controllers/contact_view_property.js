const assert = require('chai').assert;
const models = require('../../../models');
const { contact_view_property: contactViewPropertyModel } = models;
const contactViewPropertyController =
  require('../../../controllers/contactViewProperty').makeContactViewPropertyController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const contactViewProperty = {
  contact_view_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  agency_user_fk: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  is_pinned: true,
};

describe('Unit Test for contactViewPropertyController', function () {
  let contact_view_property_id = '';

  before(async function () {
    contact_view_property_id = await contactViewPropertyController.create({
      contact_view_fk: contactViewProperty.contact_view_fk,
      agency_user_fk: contactViewProperty.agency_user_fk,
      is_pinned: contactViewProperty.is_pinned,
    });
  });

  it('delete: should soft delete a contact_view_property record', async function () {
    const { created_contact_view_property_id } = await h.database.transaction(
      async (transaction) => {
        const created_contact_view_property_id =
          await contactViewPropertyController.create(
            {
              contact_view_fk: contactViewProperty.contact_view_fk,
              agency_user_fk: contactViewProperty.agency_user_fk,
              is_pinned: contactViewProperty.is_pinned,
            },
            { transaction },
          );
        await contactViewPropertyController.destroy(
          { contact_view_property_id: created_contact_view_property_id },
          { transaction },
        );
        return { created_contact_view_property_id };
      },
    );
    const record = await contactViewPropertyModel.findOne({
      where: { contact_view_property_id: created_contact_view_property_id },
    });
    assert.isNull(record);
  });

  it('destroy: should hard delete a contact_view_property record', async function () {
    const { created_contact_view_property_id } = await h.database.transaction(
      async (transaction) => {
        const created_contact_view_property_id =
          await contactViewPropertyController.create(
            {
              contact_view_fk: contactViewProperty.contact_view_fk,
              agency_user_fk: contactViewProperty.agency_user_fk,
              is_pinned: contactViewProperty.is_pinned,
            },
            { transaction },
          );
        await contactViewPropertyController.destroy(
          { contact_view_property_id: created_contact_view_property_id },
          { transaction },
        );
        return { created_contact_view_property_id };
      },
    );
    const record = await contactViewPropertyModel.findOne({
      where: { contact_view_property_id: created_contact_view_property_id },
    });
    assert.isNull(record);
  });

  it('update: should update a contact_view_property and return contact_view_property ID of updated contact_view_property', async function () {
    const { updated_contact_view_property_id } = await h.database.transaction(
      async (transaction) => {
        const updated_contact_view_property_id =
          await contactViewPropertyController.update(
            contact_view_property_id,
            {
              contact_view_fk: contactViewProperty.contact_view_fk,
              agency_user_fk: contactViewProperty.agency_user_fk,
              is_pinned: contactViewProperty.is_pinned,
            },
            { transaction },
          );
        return { updated_contact_view_property_id };
      },
    );
    assert.isNotNull(updated_contact_view_property_id);
    assert.strictEqual(
      updated_contact_view_property_id,
      contact_view_property_id,
    );
  });

  it('findAll: should return contact_view_property records', async function () {
    const { contact_view_propertys } = await h.database.transaction(
      async (transaction) => {
        const contact_view_propertys =
          await contactViewPropertyController.findAll({}, { transaction });
        return { contact_view_propertys };
      },
    );
    assert.exists(contact_view_propertys);
  });

  it('findOne: should return contact_view_property record', async function () {
    const { contact_view_property } = await h.database.transaction(
      async (transaction) => {
        const contact_view_property =
          await contactViewPropertyController.findOne(
            { contact_view_property_id },
            { transaction },
          );
        return { contact_view_property };
      },
    );
    assert.isNotNull(contact_view_property);
    assert.strictEqual(
      contact_view_property.contact_view_fk,
      contactViewProperty.contact_view_fk,
    );
    assert.strictEqual(
      contact_view_property.agency_user_fk,
      contactViewProperty.agency_user_fk,
    );
    assert.strictEqual(
      contact_view_property.is_pinned,
      contactViewProperty.is_pinned,
    );
  });

  after(async function () {
    await contactViewPropertyController.destroy({ contact_view_property_id });
  });
});
