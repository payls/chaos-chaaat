const assert = require('chai').assert;
const models = require('../../../models');
const userSavedPropertyController =
  require('../../../controllers/userSavedProperty').makeUserSavedPropertyController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const userSavedPropertyInfo = {
  property_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  user_fk: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for userSavedPropertyController', function () {
  it('create: should create user_saved_property record and return user_saved_property_id', async function () {
    const { user_saved_property_id } = await h.database.transaction(
      async (transaction) => {
        const user_saved_property_id = await userSavedPropertyController.create(
          userSavedPropertyInfo,
          { transaction },
        );
        await userSavedPropertyController.destroy(
          { user_saved_property_id },
          { transaction },
        );
        return { user_saved_property_id };
      },
    );
    assert.isNotNull(user_saved_property_id);
    assert.isString(user_saved_property_id);
  });

  it('update: should update user_saved_property record and return user_saved_property_id', async function () {
    const {
      user_saved_property_id,
      updated_user_saved_property_id,
      updated_user_saved_property,
    } = await h.database.transaction(async (transaction) => {
      const user_saved_property_id = await userSavedPropertyController.create(
        userSavedPropertyInfo,
        { transaction },
      );
      const updated_user_saved_property_id =
        await userSavedPropertyController.update(
          user_saved_property_id,
          {
            user_fk: 'new_user_fk',
            property_fk: 'new_property_fk',
          },
          { transaction },
        );
      const updated_user_saved_property =
        await userSavedPropertyController.findOne(
          { user_saved_property_id },
          { transaction },
        );
      await userSavedPropertyController.destroy(
        { user_saved_property_id },
        { transaction },
      );
      return {
        user_saved_property_id,
        updated_user_saved_property_id,
        updated_user_saved_property,
      };
    });
    assert.isNotNull(user_saved_property_id);
    assert.isNotNull(updated_user_saved_property_id);
    assert.isNotNull(updated_user_saved_property);
    assert.strictEqual(updated_user_saved_property_id, user_saved_property_id);
    assert.strictEqual(updated_user_saved_property.user_fk, 'new_user_fk');
    assert.strictEqual(
      updated_user_saved_property.property_fk,
      'new_property_fk',
    );
  });

  it('findAll: by user_fk', async function () {
    const { user_saved_property_id, user_saved_properties } =
      await h.database.transaction(async (transaction) => {
        const user_saved_property_id = await userSavedPropertyController.create(
          userSavedPropertyInfo,
          { transaction },
        );
        const { user_fk } = userSavedPropertyInfo;
        const user_saved_properties = await userSavedPropertyController.findAll(
          { user_fk },
          { transaction },
        );
        await userSavedPropertyController.destroy(
          { user_saved_property_id },
          { transaction },
        );
        return { user_saved_property_id, user_saved_properties };
      });
    assert.isNotNull(user_saved_property_id);
    assert.isNotNull(user_saved_properties);
    assert.isArray(user_saved_properties);
    assert.strictEqual(
      user_saved_properties[0].user_saved_property_id,
      user_saved_property_id,
    );
  });

  it('findOne: by user_fk and property_fk', async function () {
    const { user_saved_property_id, user_saved_property } =
      await h.database.transaction(async (transaction) => {
        const user_saved_property_id = await userSavedPropertyController.create(
          userSavedPropertyInfo,
          { transaction },
        );
        const { user_fk, property_fk } = userSavedPropertyInfo;
        const user_saved_property = await userSavedPropertyController.findOne(
          { user_fk, property_fk },
          { transaction },
        );
        await userSavedPropertyController.destroy(
          { user_saved_property_id },
          { transaction },
        );
        return { user_saved_property_id, user_saved_property };
      });
    assert.isNotNull(user_saved_property_id);
    assert.isNotNull(user_saved_property);
    assert.strictEqual(
      user_saved_property.user_saved_property_id,
      user_saved_property_id,
    );
  });
});
