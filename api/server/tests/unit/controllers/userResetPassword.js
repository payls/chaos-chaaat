const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const userResetPasswordController =
  require('../../../controllers/userResetPassword').makeUserResetPasswordController(
    models,
  );
const h = require('../../../helpers');
const constant = require('../../../constants/constant.json');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+testuser@yourpave.com',
};

describe('Unit Test for userResetPasswordController', function () {
  let userId = null;
  let userResetPasswordId = null;

  before(async function () {
    await userController.destroy({ email: userInfo.email });
    userId = await userController.create(userInfo);
  });

  it('create: should return ID of newly created record', async function () {
    const { _userResetPasswordId } = await h.database.transaction(
      async (transaction) => {
        const _userResetPasswordId = await userResetPasswordController.create(
          userId,
          userId,
          { transaction },
        );
        await userResetPasswordController.destroy(
          { user_reset_password_id: _userResetPasswordId },
          { transaction },
        );
        return { _userResetPasswordId };
      },
    );
    assert.isNotNull(_userResetPasswordId);
    assert.isString(_userResetPasswordId);
  });

  it('update: should return ID of updated record', async function () {
    const resetDate = h.date.getSqlCurrentDate();
    const { userResetPassword } = await h.database.transaction(
      async (transaction) => {
        let _userResetPasswordId = await userResetPasswordController.create(
          userId,
          userId,
          { transaction },
        );
        _userResetPasswordId = await userResetPasswordController.update(
          _userResetPasswordId,
          {
            user_fk: 'random_user_fk',
            token: 'asdfasdf',
            reset_date: resetDate,
            status: constant.USER.RESET_PASSWORD.STATUS.EXPIRED,
          },
          { transaction },
        );
        const userResetPassword = await userResetPasswordController.findOne(
          { user_reset_password_id: _userResetPasswordId },
          { transaction },
        );
        await userResetPasswordController.destroy(
          { user_reset_password_id: _userResetPasswordId },
          { transaction },
        );
        return { userResetPassword };
      },
    );
    assert.isNotNull(userResetPassword);
    assert.isObject(userResetPassword);
    assert.strictEqual(userResetPassword.user_fk, 'random_user_fk');
    assert.strictEqual(userResetPassword.token, 'asdfasdf');
    assert.strictEqual(
      userResetPassword.status,
      constant.USER.RESET_PASSWORD.STATUS.EXPIRED,
    );
  });

  it('findOne: by user_reset_password_id', async function () {
    const { userResetPassword, user_reset_password_id } =
      await h.database.transaction(async (transaction) => {
        const user_reset_password_id = await userResetPasswordController.create(
          userId,
          userId,
          { transaction },
        );
        const userResetPassword = await userResetPasswordController.findOne(
          { user_reset_password_id },
          { transaction },
        );
        await userResetPasswordController.destroy(
          { user_reset_password_id },
          { transaction },
        );
        return { userResetPassword, user_reset_password_id };
      });
    assert.isNotNull(userResetPassword);
    assert.isObject(userResetPassword);
    assert.strictEqual(
      userResetPassword.user_reset_password_id,
      user_reset_password_id,
    );
  });

  it('findOne: by token', async function () {
    const { userResetPassword1, userResetPassword } =
      await h.database.transaction(async (transaction) => {
        userResetPasswordId = await userResetPasswordController.create(
          userId,
          userId,
          { transaction },
        );
        const userResetPassword = await userResetPasswordController.findOne(
          { user_reset_password_id: userResetPasswordId },
          { transaction },
        );
        const userResetPassword1 = await userResetPasswordController.findOne(
          { token: userResetPassword.token },
          { transaction },
        );
        await userResetPasswordController.destroy(
          { user_reset_password_id: userResetPasswordId },
          { transaction },
        );
        return { userResetPassword1, userResetPassword };
      });
    assert.isNotNull(userResetPassword1);
    assert.isObject(userResetPassword1);
    assert.strictEqual(userResetPassword1.token, userResetPassword.token);
  });

  it('findOne: by user_fk', async function () {
    const { userResetPassword } = await h.database.transaction(
      async (transaction) => {
        userResetPasswordId = await userResetPasswordController.create(
          userId,
          userId,
          { transaction },
        );
        const userResetPassword = await userResetPasswordController.findOne(
          { user_fk: userId },
          { transaction },
        );
        await userResetPasswordController.destroy(
          { user_reset_password_id: userResetPasswordId },
          { transaction },
        );
        return { userResetPassword };
      },
    );
    assert.isNotNull(userResetPassword);
    assert.isObject(userResetPassword);
    assert.strictEqual(userResetPassword.user_fk, userId);
  });

  it('verify: should return true', async function () {
    const { userResetPassword, userResetPassword1, verifyStatus } =
      await h.database.transaction(async (transaction) => {
        userResetPasswordId = await userResetPasswordController.create(
          userId,
          userId,
          { transaction },
        );
        const userResetPassword = await userResetPasswordController.findOne(
          { user_reset_password_id: userResetPasswordId },
          { transaction },
        );
        const verifyStatus = await userResetPasswordController.verify(
          userResetPassword.token,
          { transaction },
        );
        const userResetPassword1 = await userResetPasswordController.findOne(
          { user_reset_password_id: userResetPasswordId },
          { transaction },
        );
        await userResetPasswordController.destroy(
          { user_reset_password_id: userResetPasswordId },
          { transaction },
        );
        return { userResetPassword, userResetPassword1, verifyStatus };
      });
    assert.isBoolean(verifyStatus);
    assert.strictEqual(verifyStatus, true);
    assert.isNotNull(userResetPassword1);
    assert.strictEqual(userResetPassword.token, userResetPassword1.token);
    assert.isNotNull(userResetPassword1.reset_date);
  });

  after(async function () {
    await userController.destroy({ user_id: userId });
  });
});
