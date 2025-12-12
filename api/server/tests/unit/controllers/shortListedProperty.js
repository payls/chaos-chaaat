const assert = require('chai').assert;
const models = require('../../../models');
const shortListedPropertyController =
  require('../../../controllers/shortListedProperty').makeShortListedPropertyController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const shortListedPropertyInfo = {
  property_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  contact_fk: 'asy112e3-49e8-03fr-l9ic-2747223b1gv9',
  display_order: 3,
  property_rating: 1,
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for shortListedPropertyController', function () {
  it('create: should create shortlisted_property record and return shortlisted_property_id', async function () {
    const { shortlisted_property_id } = await h.database.transaction(
      async (transaction) => {
        const shortlisted_property_id =
          await shortListedPropertyController.create(shortListedPropertyInfo, {
            transaction,
          });
        await shortListedPropertyController.destroy(
          { shortlisted_property_id },
          { transaction },
        );
        return { shortlisted_property_id };
      },
    );
    assert.isNotNull(shortlisted_property_id);
    assert.isString(shortlisted_property_id);
  });

  it('findOne: by shortlisted_property_id', async function () {
    const { shortlisted_property_id, shortListedRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_id =
          await shortListedPropertyController.create(shortListedPropertyInfo, {
            transaction,
          });
        const shortListedRecord = await shortListedPropertyController.findOne(
          { shortlisted_property_id },
          { transaction },
        );
        await shortListedPropertyController.destroy(
          { shortlisted_property_id },
          { transaction },
        );
        return { shortlisted_property_id, shortListedRecord };
      });
    assert.isNotNull(shortlisted_property_id);
    assert.isNotNull(shortListedRecord);
    assert.strictEqual(
      shortListedRecord.shortlisted_property_id,
      shortlisted_property_id,
    );
  });

  it('update: should update shortlisted_property record and return updated record', async function () {
    const newPropertyFk = h.general.generateId();
    const { shortlisted_property_id, updatedShortListedRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_id =
          await shortListedPropertyController.create(shortListedPropertyInfo, {
            transaction,
          });
        await shortListedPropertyController.update(
          shortlisted_property_id,
          { property_fk: newPropertyFk, property_rating: 3 },
          { transaction },
        );
        const updatedShortListedRecord =
          await shortListedPropertyController.findOne(
            { shortlisted_property_id },
            { transaction },
          );
        await shortListedPropertyController.destroy(
          { shortlisted_property_id },
          { transaction },
        );
        return { shortlisted_property_id, updatedShortListedRecord };
      });
    assert.isNotNull(shortlisted_property_id);
    assert.isNotNull(updatedShortListedRecord);
    assert.isString(updatedShortListedRecord.property_fk);
    assert.isNumber(updatedShortListedRecord.property_rating);
    assert.strictEqual(updatedShortListedRecord.property_fk, newPropertyFk);
    assert.strictEqual(updatedShortListedRecord.property_rating, 3);
  });
});
