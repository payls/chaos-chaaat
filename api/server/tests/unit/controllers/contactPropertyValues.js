const assert = require('chai').assert;
const models = require('../../../models');
const contactPropertyValuesController =
  require('../../../controllers/contactPropertyValues').makeContactPropertyValuesController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const contactPropertyValuesMockInfoAllAttributesNotNull = {
  contact_property_value_id: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  contact_fk: '2147043b-49e8-11eb-a0fc-fb4663a41de0',
  contact_property_definition_fk: '63a41de0-49e8-a0fc-11eb-fb462147043b',
  attribute_value_int: 12.9,
  attribute_value_string: 'Test string',
  attribute_value_date: h.date.getSqlCurrentDate(),
  is_deleted: false,
  created_by: '2147043b-fb46-11eb-a0fc-49e863a41de0',
  updated_by: '2147043b-fb46-11eb-a0fc-49e863a41de0',
};

const contactPropertyValuesMockInfoOnlyStringAttributeNotNull = {
  contact_property_value_id: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  contact_fk: '2147043b-49e8-11eb-a0fc-fb4663a41de0',
  contact_property_definition_fk: '63a41de0-49e8-a0fc-11eb-fb462147043b',
  attribute_value_string: 'Test string',
  is_deleted: false,
  created_by: '2147043b-fb46-11eb-a0fc-49e863a41de0',
  updated_by: '2147043b-fb46-11eb-a0fc-49e863a41de0',
};

describe('Unit test for contactPropertyValuesController', function () {
  it('create: should not create contact_property_values record when more than one attribute_values(int, string, date) is not null', async function () {
    try {
      const { contact_property_value_id } = await h.database.transaction(
        async (transaction) => {
          const contact_property_value_id =
            await contactPropertyValuesController.create(
              contactPropertyValuesMockInfoAllAttributesNotNull,
              { transaction },
            );
          await contactPropertyValuesController.destroy(
            { contact_property_value_id },
            { transaction },
          );
          return contact_property_value_id;
        },
      );

      assert.isNull(contact_property_value_id);
    } catch (err) {
      assert.isNotNull(err);
    }
  });

  it('create: should create contact_property_values record when only one attribute_values(int, string, date) is not null', async function () {
    const { contact_property_value_id } = await h.database.transaction(
      async (transaction) => {
        const contact_property_value_id =
          await contactPropertyValuesController.create(
            contactPropertyValuesMockInfoOnlyStringAttributeNotNull,
            { transaction },
          );
        await contactPropertyValuesController.destroy(
          { contact_property_value_id },
          { transaction },
        );
        return { contact_property_value_id };
      },
    );

    assert.isNotNull(contact_property_value_id);
    assert.isString(contact_property_value_id);
  });

  it('findOne: should find a newly created contact_property_values record', async function () {
    const { contact_property_value_id, contactPropertyValuesRecord } =
      await h.database.transaction(async (transaction) => {
        const contact_property_value_id =
          await contactPropertyValuesController.create(
            contactPropertyValuesMockInfoOnlyStringAttributeNotNull,
            { transaction },
          );
        const contactPropertyValuesRecord =
          await contactPropertyValuesController.findOne(
            { contact_property_value_id },
            { transaction },
          );

        await contactPropertyValuesController.destroy(
          { contact_property_value_id },
          { transaction },
        );
        return { contact_property_value_id, contactPropertyValuesRecord };
      });
    assert.isNotNull(contact_property_value_id);
    assert.isNotNull(contactPropertyValuesRecord);
    assert.strictEqual(
      contact_property_value_id,
      contactPropertyValuesRecord.contact_property_value_id,
    );
  });

  it('update: should not update contact_property_values record when more than one attribute_values(int, string, date) is not null', async function () {
    try {
      const { contact_property_value_id } = await h.database.transaction(
        async (transaction) => {
          const contact_property_value_id =
            await contactPropertyValuesController.create(
              contactPropertyValuesMockInfoOnlyStringAttributeNotNull,
              { transaction },
            );

          const updated_contact_property_value_id =
            await contactPropertyValuesController.update(
              contact_property_value_id,
              {
                attribute_value_string: 'test update 1',
                attribute_value_int: '1',
              },
              { transaction },
            );
          await contactPropertyValuesController.destroy(
            { contact_property_value_id },
            { transaction },
          );
          return {
            contact_property_value_id: updated_contact_property_value_id,
          };
        },
      );

      assert.isNull(contact_property_value_id);
    } catch (err) {
      assert.isNotNull(err);
    }
  });

  it('update: should update contact_property_values record when only one attribute_values(int, string, date) is not null', async function () {
    const { contact_property_value_id_updated, contactPropertyValuesRecord } =
      await h.database.transaction(async (transaction) => {
        const contact_property_value_id =
          await contactPropertyValuesController.create(
            contactPropertyValuesMockInfoOnlyStringAttributeNotNull,
            { transaction },
          );
        const contact_property_value_id_updated =
          await contactPropertyValuesController.update(
            contact_property_value_id,
            { attribute_value_string: 'test string update 2' },
            { transaction },
          );

        const contactPropertyValuesRecord =
          await contactPropertyValuesController.findOne(
            { contact_property_value_id },
            { transaction },
          );
        await contactPropertyValuesController.destroy(
          { contact_property_value_id },
          { transaction },
        );
        return {
          contact_property_value_id_updated,
          contactPropertyValuesRecord,
        };
      });

    assert.isNotNull(contact_property_value_id_updated);
    assert.isNotNull(contactPropertyValuesRecord);
    assert.isString(contactPropertyValuesRecord.attribute_value_string);
    assert.isNotNull(contactPropertyValuesRecord.attribute_value_string);
    assert.strictEqual(
      contactPropertyValuesRecord.attribute_value_string,
      'test string update 2',
    );
  });
});
