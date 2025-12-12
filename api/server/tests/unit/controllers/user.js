const assert = require('chai').assert;
const models = require('../../../models');
const { user: userModel } = models;
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const h = require('../../../helpers');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+testuser@yourpave.com',
  password: 'asdfasdf',
};

describe('Unit Test for userController', function () {
  let user_id = '';

  before(async function () {
    await userController.destroy({ email: userInfo.email });
    const { hashed_password, password_salt } = h.user.hashPassword(
      userInfo.password,
    );
    user_id = await userController.create({
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      email: userInfo.email,
      password: hashed_password,
      password_salt,
    });
  });

  it('delete: should soft delete a user record', async function () {
    const { created_user_id } = await h.database.transaction(
      async (transaction) => {
        const created_user_id = await userController.create(
          {
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            email: 'mervin+randomuser1@yourpave.com',
          },
          { transaction },
        );
        await userController.destroy(
          { user_id: created_user_id },
          { transaction },
        );
        return { created_user_id };
      },
    );
    const record = await userModel.findOne({
      where: { user_id: created_user_id },
    });
    assert.isNull(record);
  });

  it('destroy: should hard delete a user record', async function () {
    const { created_user_id } = await h.database.transaction(
      async (transaction) => {
        const created_user_id = await userController.create(
          {
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            email: 'mervin+randomuser2@yourpave.com',
          },
          { transaction },
        );
        await userController.destroy(
          { user_id: created_user_id },
          { transaction },
        );
        return { created_user_id };
      },
    );
    const record = await userModel.findOne({
      where: { user_id: created_user_id },
    });
    assert.isNull(record);
  });

  it('update: should update a user and return user ID of updated user', async function () {
    const { updated_user_id } = await h.database.transaction(
      async (transaction) => {
        const updated_user_id = await userController.update(
          user_id,
          { middle_name: 'my middle name' },
          { transaction },
        );
        return { updated_user_id };
      },
    );
    assert.isNotNull(updated_user_id);
    assert.strictEqual(updated_user_id, user_id);
  });

  it('update: should update a users last seen', async function () {
    const sqlCurrentDate = h.date.getSqlCurrentDate();
    const { updated_user_id, user } = await h.database.transaction(
      async (transaction) => {
        const updated_user_id = await userController.update(
          user_id,
          { last_seen: sqlCurrentDate },
          { transaction },
        );
        const user = await userController.findOne({ user_id }, { transaction });
        return { updated_user_id, user };
      },
    );
    assert.deepEqual(user.last_seen, new Date(sqlCurrentDate));
    assert.isNotNull(updated_user_id);
    assert.strictEqual(updated_user_id, user_id);
  });

  it('findAll: should return user records', async function () {
    const { users } = await h.database.transaction(async (transaction) => {
      const users = await userController.findAll({}, { transaction });
      return { users };
    });
    assert.exists(users);
  });

  it('findOne: should return user record', async function () {
    const { user } = await h.database.transaction(async (transaction) => {
      const user = await userController.findOne({ user_id }, { transaction });
      return { user };
    });
    assert.isNotNull(user);
    assert.strictEqual(user.first_name, userInfo.first_name);
    assert.strictEqual(user.last_name, userInfo.last_name);
    assert.strictEqual(user.email, userInfo.email);
  });

  it('isUserActive: should return that user record is active', async function () {
    const { isActive } = await h.database.transaction(async (transaction) => {
      const isActive = await userController.isUserActive(user_id, {
        transaction,
      });
      return { isActive };
    });
    assert.isNotNull(isActive);
    assert.isBoolean(isActive);
    assert.strictEqual(isActive, true);
  });

  it('verifyUserPassword: should not throw any error with valid email and password', async function () {
    try {
      await h.database.transaction(async (transaction) => {
        await userController.verifyUserPassword(
          userInfo.email,
          userInfo.password,
          { transaction },
        );
      });
    } catch (err) {
      assert.isNull(err);
    }
  });

  after(async function () {
    await userController.destroy({ user_id });
  });
});
