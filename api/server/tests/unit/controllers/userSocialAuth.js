const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const userSocialAuthController =
  require('../../../controllers/userSocialAuth').makeUserSocialAuthController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+testuser@yourpave.com',
};
const userSocialAuthInfo = {
  auth_type: constant.USER.AUTH_TYPE.GOOGLE,
  auth_data: {
    profileObj: {
      googleId: '8172389478932',
      imageUrl:
        'https://lh3.googleusercontent.com/a-/AOh14GhxwscLhuVbZCUnPCBY3712ZIIV_GKvQnvS7HVloXQ=s96-c',
      email: 'mervin@yourpave.com',
      name: 'Mervin Tan',
      givenName: 'Mervin',
      familyName: 'Tan',
    },
    tokenId: 'some_random_token_id_from_google',
  },
};

describe('Unit Test for userSocialAuthController', function () {
  let userId = '';
  let user_social_auth_id = '';

  before(async function () {
    await userController.destroy({ email: userInfo.email });
    await userSocialAuthController.destroy({ user_social_auth_id });
    userId = await userController.create(userInfo);
    user_social_auth_id = await userSocialAuthController.create({
      user_fk: userId,
      auth_type: userSocialAuthInfo.auth_type,
      auth_data: userSocialAuthInfo.auth_data,
      created_by: userId,
    });
  });

  it('findOne: should return user_social_auth record', async function () {
    const { userSocialAuth } = await h.database.transaction(
      async (transaction) => {
        const userSocialAuth = await userSocialAuthController.findOne(
          { user_fk: userId },
          { transaction },
        );
        return { userSocialAuth };
      },
    );
    assert.isNotNull(userSocialAuth);
    assert.strictEqual(userSocialAuth.user_fk, userId);
  });

  it('create: should create a new user_social_auth record and return user_social_auth_id', async function () {
    const { userSocialAuthId } = await h.database.transaction(
      async (transaction) => {
        const randomUserId = 'hello_user_fk';
        const userSocialAuthId = await userSocialAuthController.create(
          {
            user_fk: randomUserId,
            ...userSocialAuthInfo,
            created_by: randomUserId,
          },
          { transaction },
        );
        await userSocialAuthController.destroy(
          { user_social_auth_id: userSocialAuthId },
          { transaction },
        );
        return { userSocialAuthId };
      },
    );
    assert.isNotNull(userSocialAuthId);
  });

  it('update: should update user_social_auth record and return user_social_auth_id', async function () {
    const { userSocialAuthId, updatedUserSocialAuth } =
      await h.database.transaction(async (transaction) => {
        const userSocialAuthId = await userSocialAuthController.update(
          user_social_auth_id,
          { user_fk: 'hello world', ...userSocialAuthInfo, created_by: userId },
          { transaction },
        );
        const updatedUserSocialAuth = await userSocialAuthController.findOne(
          { user_social_auth_id: userSocialAuthId },
          { transaction },
        );
        return { userSocialAuthId, updatedUserSocialAuth };
      });
    assert.isNotNull(userSocialAuthId);
    assert.strictEqual(userSocialAuthId, user_social_auth_id);
    assert.isNotNull(updatedUserSocialAuth);
    assert.strictEqual(updatedUserSocialAuth.user_fk, 'hello world');
  });

  after(async function () {
    await userController.destroy({ user_id: userId });
    await userSocialAuthController.destroy({ user_social_auth_id });
  });
});
