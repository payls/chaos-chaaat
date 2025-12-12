const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const models = require('../../../models');
const shortlistPropertyCommentController =
  require('../../../controllers/shortlistedPropertyComment').makeShortListedPropertyCommentController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const commentInfo = {
  shortlisted_property_fk: '8ags21f8-78gf-98yv-h0op-hf81k29tv98',
  contact_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  agency_user_fk: 'e0965tyf5-66vb-pk98-zx51-f9d7093f44r',
  parent_comment_fk: 'pr76fu7g6-17kc-oi44-g8ui-f9r8t63f44r',
  message: 'I am commenting on this property.',
  status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for shortlistPropertyCommentController', function () {
  it('create: should create shortlisted property comment record and return shortlisted_property_comment_id', async function () {
    const { shortlisted_property_comment_id } = await h.database.transaction(
      async (transaction) => {
        const shortlisted_property_comment_id =
          await shortlistPropertyCommentController.create(commentInfo, {
            transaction,
          });
        await shortlistPropertyCommentController.destroy(
          { shortlisted_property_comment_id },
          { transaction },
        );
        return { shortlisted_property_comment_id };
      },
    );
    assert.isNotNull(shortlisted_property_comment_id);
    assert.isString(shortlisted_property_comment_id);
  });

  it('findOne: by shortlisted_property_comment_id', async function () {
    const { shortlisted_property_comment_id, commentRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_id =
          await shortlistPropertyCommentController.create(commentInfo, {
            transaction,
          });
        const commentRecord = await shortlistPropertyCommentController.findOne(
          { shortlisted_property_comment_id },
          { transaction },
        );
        await shortlistPropertyCommentController.destroy(
          { shortlisted_property_comment_id },
          { transaction },
        );
        return { shortlisted_property_comment_id, commentRecord };
      });
    assert.isNotNull(shortlisted_property_comment_id);
    assert.isNotNull(commentRecord);
    assert.isNotNull(commentRecord.shortlisted_property_fk);
    assert.isNotNull(commentRecord.contact_fk);
    assert.isNotNull(commentRecord.agency_user_fk);
    assert.isNotNull(commentRecord.message);
    assert.isNotNull(commentRecord.parent_comment_fk);
    assert.isNotNull(commentRecord.status);
    assert.strictEqual(
      commentRecord.shortlisted_property_comment_id,
      shortlisted_property_comment_id,
    );
  });

  it('update: should update shortlisted property comment record and return updated record', async function () {
    const { shortlisted_property_comment_id, updatedCommentRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_id =
          await shortlistPropertyCommentController.create(commentInfo, {
            transaction,
          });
        await shortlistPropertyCommentController.update(
          shortlisted_property_comment_id,
          { message: 'Updating comments...' },
          { transaction },
        );
        const updatedCommentRecord =
          await shortlistPropertyCommentController.findOne(
            { shortlisted_property_comment_id },
            { transaction },
          );
        await shortlistPropertyCommentController.destroy(
          { shortlisted_property_comment_id },
          { transaction },
        );
        return { shortlisted_property_comment_id, updatedCommentRecord };
      });
    assert.isNotNull(shortlisted_property_comment_id);
    assert.isNotNull(updatedCommentRecord);
    assert.isString(updatedCommentRecord.message);
    assert.strictEqual(updatedCommentRecord.message, 'Updating comments...');
  });
});
