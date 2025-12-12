const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const userEmailVerificationController =
  require('../../../controllers/userEmailVerification').makeUserEmailVerificationController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+testuser@yourpave.com',
};

describe('Unit Test for userEmailVerificationController', function () {
  let userId = null;
  let userEmailVerificationId = null;

  before(async function () {
    await userController.destroy({ email: userInfo.email });
    userId = await userController.create(userInfo);
  });

  it('create: should return ID of newly created record', async function () {
    const { _userEmailVerificationId } = await h.database.transaction(
      async (transaction) => {
        const _userEmailVerificationId =
          await userEmailVerificationController.create(userId, userId, {
            transaction,
          });
        await userEmailVerificationController.destroy(
          { user_email_verification_id: _userEmailVerificationId },
          { transaction },
        );
        return { _userEmailVerificationId };
      },
    );
    assert.isNotNull(_userEmailVerificationId);
    assert.isString(_userEmailVerificationId);
  });

  it('update: should return ID of updated record', async function () {
    const verifiedDate = h.date.getSqlCurrentDate();
    const { userEmailVerification } = await h.database.transaction(
      async (transaction) => {
        let _userEmailVerificationId =
          await userEmailVerificationController.create(userId, userId, {
            transaction,
          });
        _userEmailVerificationId = await userEmailVerificationController.update(
          _userEmailVerificationId,
          {
            user_fk: 'random_user_fk',
            token: 'asdfasdf',
            verified_date: verifiedDate,
          },
          { transaction },
        );
        const userEmailVerification =
          await userEmailVerificationController.findOne(
            { user_email_verification_id: _userEmailVerificationId },
            { transaction },
          );
        await userEmailVerificationController.destroy(
          { user_email_verification_id: _userEmailVerificationId },
          { transaction },
        );
        return { userEmailVerification };
      },
    );
    assert.isNotNull(userEmailVerification);
    assert.isObject(userEmailVerification);
    assert.strictEqual(userEmailVerification.user_fk, 'random_user_fk');
    assert.strictEqual(userEmailVerification.token, 'asdfasdf');
  });

  it('findOne: by user_email_verification_id', async function () {
    const { userEmailVerification, user_email_verification_id } =
      await h.database.transaction(async (transaction) => {
        const user_email_verification_id =
          await userEmailVerificationController.create(userId, userId, {
            transaction,
          });
        const userEmailVerification =
          await userEmailVerificationController.findOne(
            { user_email_verification_id },
            { transaction },
          );
        await userEmailVerificationController.destroy(
          { user_email_verification_id: userEmailVerificationId },
          { transaction },
        );
        return { userEmailVerification, user_email_verification_id };
      });
    assert.isNotNull(userEmailVerification);
    assert.isObject(userEmailVerification);
    assert.strictEqual(
      userEmailVerification.user_email_verification_id,
      user_email_verification_id,
    );
  });

  it('findOne: by token', async function () {
    const { userEmailVerification1, userEmailVerification } =
      await h.database.transaction(async (transaction) => {
        userEmailVerificationId = await userEmailVerificationController.create(
          userId,
          userId,
          { transaction },
        );
        const userEmailVerification =
          await userEmailVerificationController.findOne(
            { user_email_verification_id: userEmailVerificationId },
            { transaction },
          );
        const userEmailVerification1 =
          await userEmailVerificationController.findOne(
            { token: userEmailVerification.token },
            { transaction },
          );
        await userEmailVerificationController.destroy(
          { user_email_verification_id: userEmailVerificationId },
          { transaction },
        );
        return { userEmailVerification1, userEmailVerification };
      });
    assert.isNotNull(userEmailVerification1);
    assert.isObject(userEmailVerification1);
    assert.strictEqual(
      userEmailVerification1.token,
      userEmailVerification.token,
    );
  });

  it('findOne: by user_fk', async function () {
    const { userEmailVerification } = await h.database.transaction(
      async (transaction) => {
        userEmailVerificationId = await userEmailVerificationController.create(
          userId,
          userId,
          { transaction },
        );
        const userEmailVerification =
          await userEmailVerificationController.findOne(
            { user_fk: userId },
            { transaction },
          );
        await userEmailVerificationController.destroy(
          { user_email_verification_id: userEmailVerificationId },
          { transaction },
        );
        return { userEmailVerification };
      },
    );
    assert.isNotNull(userEmailVerification);
    assert.isObject(userEmailVerification);
    assert.strictEqual(userEmailVerification.user_fk, userId);
  });

  it('verify: should return true', async function () {
    const { userEmailVerification, userEmailVerification1, verifyStatus } =
      await h.database.transaction(async (transaction) => {
        userEmailVerificationId = await userEmailVerificationController.create(
          userId,
          userId,
          { transaction },
        );
        const userEmailVerification =
          await userEmailVerificationController.findOne(
            { user_email_verification_id: userEmailVerificationId },
            { transaction },
          );
        const verifyStatus = await userEmailVerificationController.verify(
          userEmailVerification.token,
          { transaction },
        );
        const userEmailVerification1 =
          await userEmailVerificationController.findOne(
            { user_email_verification_id: userEmailVerificationId },
            { transaction },
          );
        await userEmailVerificationController.destroy(
          { user_email_verification_id: userEmailVerificationId },
          { transaction },
        );
        return { userEmailVerification, userEmailVerification1, verifyStatus };
      });
    assert.isBoolean(verifyStatus);
    assert.strictEqual(verifyStatus, true);
    assert.isNotNull(userEmailVerification1);
    assert.strictEqual(
      userEmailVerification.token,
      userEmailVerification1.token,
    );
    assert.isNotNull(userEmailVerification1.verified_date);
  });

  after(async function () {
    await userController.destroy({ user_id: userId });
  });
});
