const constant = require('../../../constants/constant.json');
const jwt = require('jsonwebtoken');
const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const userAccessTokenController =
  require('../../../controllers/userAccessToken').makeUserAccessTokenController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+testuser@yourpave.com',
};
const userAccessTokenInfo = {
  access_token: h.general.generateHash(`kjahsdfjkhaskdjf-${userInfo.email}`),
  type: constant.USER.ACCESS_TOKEN.TYPE.SESSION,
  status: constant.USER.ACCESS_TOKEN.STATUS.ACTIVE,
};

describe('Unit Test for userAccessTokenController', function () {
  let user_id = '';
  let user_access_token_id = '';

  before(async function () {
    await userController.destroy({ email: userInfo.email });
    await userAccessTokenController.destroy({
      access_token: userAccessTokenInfo.access_token,
    });
    user_id = await userController.create(userInfo);
    user_access_token_id = await userAccessTokenController.create({
      user_fk: user_id,
      access_token: userAccessTokenInfo.access_token,
      type: userAccessTokenInfo.type,
      status: userAccessTokenInfo.status,
      created_by: user_id,
    });
  });

  it('findOne: by user_access_token_id', async function () {
    const { record } = await h.database.transaction(async (transaction) => {
      const record = await userAccessTokenController.findOne(
        { user_access_token_id },
        { transaction },
      );
      return { record };
    });
    assert.isNotNull(record);
    assert.strictEqual(record.user_access_token_id, user_access_token_id);
  });

  it('findOne: by user_fk', async function () {
    const { record } = await h.database.transaction(async (transaction) => {
      const record = await userAccessTokenController.findOne(
        { user_fk: user_id },
        { transaction },
      );
      return { record };
    });
    assert.isNotNull(record);
    assert.strictEqual(record.user_access_token_id, user_access_token_id);
  });

  it('create: should create a new user_access_token record and return user_access_token_id', async function () {
    const { _user_access_token_id } = await h.database.transaction(
      async (transaction) => {
        const randomUserId = 'hello_user_fk';
        const _user_access_token_id = await userAccessTokenController.create(
          {
            user_fk: randomUserId,
            ...userAccessTokenInfo,
            created_by: randomUserId,
          },
          { transaction },
        );
        return { _user_access_token_id };
      },
    );
    assert.isNotNull(_user_access_token_id);
    await userAccessTokenController.destroy({
      user_access_token_id: _user_access_token_id,
    });
  });

  it('update: should update user_access_token record and return user_access_token_id', async function () {
    const { _user_access_token_id, updatedUserAccessToken } =
      await h.database.transaction(async (transaction) => {
        const _user_access_token_id = await userAccessTokenController.update(
          user_access_token_id,
          {
            user_fk: 'hello world',
            ...userAccessTokenInfo,
            created_by: user_id,
          },
          { transaction },
        );
        const updatedUserAccessToken = await userAccessTokenController.findOne(
          { user_access_token_id: _user_access_token_id },
          { transaction },
        );
        return { _user_access_token_id, updatedUserAccessToken };
      });
    assert.isNotNull(_user_access_token_id);
    assert.strictEqual(_user_access_token_id, user_access_token_id);
    assert.isNotNull(updatedUserAccessToken);
    assert.strictEqual(updatedUserAccessToken.user_fk, 'hello world');
  });

  it('generateAccessToken: should return generated json web token', async function () {
    const { accessToken, decodedAccessToken } = await h.database.transaction(
      async (transaction) => {
        const accessToken = await userAccessTokenController.generateAccessToken(
          user_id,
          { transaction },
        );
        const decodedAccessToken = await new Promise((resolve, reject) => {
          jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) reject(err);
            resolve(decoded);
          });
        });
        return { accessToken, decodedAccessToken };
      },
    );
    assert.isNotNull(accessToken);
    assert.isNotNull(decodedAccessToken);
    assert.strictEqual(decodedAccessToken.user_id, user_id);
    assert.strictEqual(decodedAccessToken.first_name, userInfo.first_name);
    assert.strictEqual(decodedAccessToken.last_name, userInfo.last_name);
    assert.strictEqual(decodedAccessToken.email, userInfo.email);
  });

  after(async function () {
    await userController.destroy({ user_id });
    await userAccessTokenController.destroy({ user_access_token_id });
  });
});
