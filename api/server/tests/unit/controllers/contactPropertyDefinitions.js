const assert = require('chai').assert;
const models = require('../../../models');
const contactPropertyDefinitionsController =
  require('../../../controllers/contactPropertyDefinitions').makeContactPropertyDefinitionsController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const contactPropertyDefinitionsMockInfo = {
  agency_user_fk: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  agency_fk: '043b1de0-49e8-11eb-a0fc-2147fb4663a4',
  attribute_name: 'mock attribute',
  attribute_type: 'mock type',
  attribute_source: 'mock source',
  status: 'active',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for contactPropertyDefinitionsController', function () {
  it('create: should create contact_property_definitions record and return contact_property_definition_id', async function () {
    const { contact_property_definition_id } = await h.database.transaction(
      async (transaction) => {
        const contact_property_definition_id =
          await contactPropertyDefinitionsController.create(
            contactPropertyDefinitionsMockInfo,
            {
              transaction,
            },
          );
        await contactPropertyDefinitionsController.destroy(
          { contact_property_definition_id },
          { transaction },
        );
        return { contact_property_definition_id };
      },
    );
    assert.isNotNull(contact_property_definition_id);
    assert.isString(contact_property_definition_id);
  });

  it('findOne: by contact_property_definition_id', async function () {
    const { contact_property_definition_id, contactPropertyDefinitionsRecord } =
      await h.database.transaction(async (transaction) => {
        const contact_property_definition_id =
          await contactPropertyDefinitionsController.create(
            contactPropertyDefinitionsMockInfo,
            {
              transaction,
            },
          );
        const contactPropertyDefinitionsRecord =
          await contactPropertyDefinitionsController.findOne(
            { contact_property_definition_id },
            { transaction },
          );
        await contactPropertyDefinitionsController.destroy(
          { contact_property_definition_id },
          { transaction },
        );
        return {
          contact_property_definition_id,
          contactPropertyDefinitionsRecord,
        };
      });
    assert.isNotNull(contact_property_definition_id);
    assert.isNotNull(contactPropertyDefinitionsRecord);
    assert.strictEqual(
      contactPropertyDefinitionsRecord.contact_property_definition_id,
      contact_property_definition_id,
    );
  });

  it('update: should update contact_property_definitions record and return updated record', async function () {
    const {
      contact_property_definition_id,
      updatedContactPropertyDefinitionsRecord,
    } = await h.database.transaction(async (transaction) => {
      const contact_property_definition_id =
        await contactPropertyDefinitionsController.create(
          contactPropertyDefinitionsMockInfo,
          {
            transaction,
          },
        );
      await contactPropertyDefinitionsController.update(
        contact_property_definition_id,
        {
          attribute_name: 'updated attribute test',
        },
        { transaction },
      );
      const updatedContactPropertyDefinitionsRecord =
        await contactPropertyDefinitionsController.findOne(
          { contact_property_definition_id },
          { transaction },
        );
      await contactPropertyDefinitionsController.destroy(
        { contact_property_definition_id },
        { transaction },
      );
      return {
        contact_property_definition_id,
        updatedContactPropertyDefinitionsRecord,
      };
    });
    assert.isNotNull(contact_property_definition_id);
    assert.isNotNull(updatedContactPropertyDefinitionsRecord);
    assert.isString(updatedContactPropertyDefinitionsRecord.attribute_name);
    assert.strictEqual(
      updatedContactPropertyDefinitionsRecord.attribute_name,
      'updated attribute test',
    );
  });
});
