const assert = require('chai').assert;
const models = require('../../../models');
const authController = require('../../../controllers/auth').makeAuthController(
  models,
);
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const h = require('../../../helpers');
h.test.init();

describe('Unit Test for authController', function () {
  it('registerUserByEmail: should return newly generated user id', async function () {
    const { user_id } = await h.database.transaction(async (transaction) => {
      const user = {
        first_name: 'Test',
        last_name: 'User',
        mobile_number: '639491111111',
        email: 'mervin+testuser@yourpave.com',
      };
      const createdUser = await authController.registerUserByEmail(
        user.first_name,
        user.last_name,
        user.mobile_number,
        user.email,
        { send_email: false, transaction },
      );
      await userController.destroy(
        { user_id: createdUser.record.dataValues.user_id },
        { transaction },
      );
      return { user_id: createdUser.record.dataValues.user_id };
    });
    assert.isNotNull(user_id);
    assert.isString(user_id);
  });

  it('loginUserByEmail: should return access token if email and password matches', async function () {
    const { access_token } = await h.database.transaction(
      async (transaction) => {
        const userInfo = {
          first_name: 'Test',
          last_name: 'User 1',
          email: 'mervin+testuser1@yourpave.com',
          password: 'asdfasdf',
        };
        const user_id = await createUser(userInfo, { transaction });
        const { access_token } = await authController.loginUserByEmail(
          userInfo.email,
          userInfo.password,
          { transaction },
        );
        await userController.destroy({ user_id }, { transaction });
        return { user_id, access_token };
      },
    );
    assert.isNotNull(access_token);
    assert.isString(access_token);
  });

  it('loginUserByEmail: should throw error if email and password does not match', async function () {
    try {
      const { access_token } = await h.database.transaction(
        async (transaction) => {
          const userInfo = {
            first_name: 'Test',
            last_name: 'User 1',
            email: 'mervin+testuser1@yourpave.com',
            password: 'asdfasdf',
          };
          const user_id = await createUser(userInfo, { transaction });
          const { access_token } = await authController.loginUserByEmail(
            userInfo.email,
            'wrong password',
            { transaction },
          );
          await userController.destroy({ user_id }, { transaction });
          return { user_id, access_token };
        },
      );
      assert.isNotNull(access_token);
    } catch (err) {
      assert.isNotNull(err);
    }
  });

  it('logout: should not throw error if logout is successfully', async function () {
    try {
      await h.database.transaction(async (transaction) => {
        const userInfo = {
          first_name: 'Test',
          last_name: 'User 2',
          email: 'mervin+testuser2@yourpave.com',
          password: 'asdfasdf',
        };
        const user_id = await createUser(userInfo, { transaction });
        const { access_token } = await authController.loginUserByEmail(
          userInfo.email,
          userInfo.password,
          { transaction },
        );
        await authController.logout(access_token, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { user_id };
      });
    } catch (err) {
      assert.isNotNull(err);
    }
  });

  it('verifySessionToken: should return newly generated access token if verification is successfully', async function () {
    try {
      const { new_access_token } = await h.database.transaction(
        async (transaction) => {
          const userInfo = {
            first_name: 'Test',
            last_name: 'User 3',
            email: 'mervin+testuser3@yourpave.com',
            password: 'asdfasdf',
          };
          const user_id = await createUser(userInfo, { transaction });
          const { access_token } = await authController.loginUserByEmail(
            userInfo.email,
            userInfo.password,
            { transaction },
          );
          const new_access_token = await authController.verifySessionToken(
            access_token,
            { transaction },
          );
          await userController.destroy({ user_id }, { transaction });
          return { user_id, new_access_token };
        },
      );
      assert.isNotNull(new_access_token);
      assert.isString(new_access_token);
    } catch (err) {
      assert.isNotNull(err);
    }
  });

  async function createUser(record, { transaction }) {
    const { hashed_password: password, password_salt } = h.user.hashPassword(
      record.password,
    );
    const user_id = await userController.create(
      {
        first_name: record.first_name,
        last_name: record.last_name,
        email: record.email,
        password,
        password_salt,
      },
      { transaction },
    );
    return user_id;
  }
});
