const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);
const h = require('../../../helpers');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+testuser@yourpave.com',
};
const userRoleInfo = {
  user_role_id: '',
  user_fk: '',
  user_role: constant.USER.ROLE.STAFF_ADMIN,
};

describe('Unit Test for userRoleController', function () {
  let user_id = '';

  before(async function () {
    user_id = await userController.create(userInfo);
    userRoleInfo.user_fk = user_id;
  });

  it('findOne: by user_role_id', async function () {
    const { record } = await h.database.transaction(async (transaction) => {
      const user_role_id = await userRoleController.create({
        user_fk: user_id,
        user_role: userRoleInfo.user_role,
      });
      const record = await userRoleController.findOne(
        { user_role_id },
        { transaction },
      );
      await userRoleController.destroy({ user_role_id }, { transaction });
      return { record };
    });
    assert.isNotNull(record);
  });

  it('findOne: by user_fk', async function () {
    const { record } = await h.database.transaction(async (transaction) => {
      const user_role_id = await userRoleController.create({
        user_fk: user_id,
        user_role: userRoleInfo.user_role,
      });
      const record = await userRoleController.findOne(
        { user_fk: user_id },
        { transaction },
      );
      await userRoleController.destroy({ user_role_id }, { transaction });
      return { record };
    });
    assert.isNotNull(record);
    assert.strictEqual(record.user_fk, user_id);
  });

  it('create: should create a new user_role record and return user_role_id', async function () {
    const { user_role_id } = await h.database.transaction(
      async (transaction) => {
        const user_role_id = await userRoleController.create(
          {
            user_fk: user_id,
            user_role: userRoleInfo.user_role,
            created_by: user_id,
          },
          { transaction },
        );
        await userRoleController.destroy({ user_role_id }, { transaction });
        return { user_role_id };
      },
    );
    assert.isNotNull(user_role_id);
    assert.isString(user_role_id);
  });

  it('update: should update user_role record and return user_role_id', async function () {
    const { user_role_id, _user_role_id, updatedUserRole } =
      await h.database.transaction(async (transaction) => {
        const user_role_id = await userRoleController.create({
          user_fk: user_id,
          user_role: userRoleInfo.user_role,
        });
        const _user_role_id = await userRoleController.update(
          user_role_id,
          {
            user_fk: 'hello world',
            user_role: userRoleInfo.user_role,
            created_by: user_id,
          },
          { transaction },
        );
        const updatedUserRole = await userRoleController.findOne(
          { user_role_id: _user_role_id },
          { transaction },
        );
        await userRoleController.destroy({ user_role_id }, { transaction });
        return { user_role_id, _user_role_id, updatedUserRole };
      });
    assert.isNotNull(_user_role_id);
    assert.strictEqual(_user_role_id, user_role_id);
    assert.isNotNull(updatedUserRole);
    assert.strictEqual(updatedUserRole.user_fk, 'hello world');
  });

  after(async function () {
    await userController.destroy({ user_id });
  });
});
