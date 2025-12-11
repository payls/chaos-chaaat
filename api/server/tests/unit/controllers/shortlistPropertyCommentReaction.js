const assert = require('chai').assert;
const models = require('../../../models');
const shortlistPropertyCommentReactionController =
  require('../../../controllers/shortlistedPropertyCommentReaction').makeShortListedPropertyCommentReactionController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const commentReactionInfo = {
  shortlisted_property_comment_fk: '8ags21f8-78gf-98yv-h0op-hf81k29tv98',
  contact_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  agency_user_fk: 'e0965tyf5-66vb-pk98-zx51-f9d7093f44r',
  emoji: ':)',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for shortlistPropertyCommentReactionController', function () {
  it('create: should create shortlisted property comment reaction record and return shortlisted_property_comment_reaction_id', async function () {
    const { shortlisted_property_comment_reaction_id } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_reaction_id =
          await shortlistPropertyCommentReactionController.create(
            commentReactionInfo,
            { transaction },
          );
        await shortlistPropertyCommentReactionController.destroy(
          { shortlisted_property_comment_reaction_id },
          { transaction },
        );
        return { shortlisted_property_comment_reaction_id };
      });
    assert.isNotNull(shortlisted_property_comment_reaction_id);
    assert.isString(shortlisted_property_comment_reaction_id);
  });

  it('findOne: by shortlisted_property_comment_reaction_id', async function () {
    const { shortlisted_property_comment_reaction_id, reactionRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_reaction_id =
          await shortlistPropertyCommentReactionController.create(
            commentReactionInfo,
            { transaction },
          );
        const reactionRecord =
          await shortlistPropertyCommentReactionController.findOne(
            { shortlisted_property_comment_reaction_id },
            { transaction },
          );
        await shortlistPropertyCommentReactionController.destroy(
          { shortlisted_property_comment_reaction_id },
          { transaction },
        );
        return { shortlisted_property_comment_reaction_id, reactionRecord };
      });
    assert.isNotNull(shortlisted_property_comment_reaction_id);
    assert.isNotNull(reactionRecord);
    assert.isNotNull(reactionRecord.shortlisted_property_comment_fk);
    assert.isNotNull(reactionRecord.contact_fk);
    assert.isNotNull(reactionRecord.agency_user_fk);
    assert.isNotNull(reactionRecord.emoji);
    assert.strictEqual(
      reactionRecord.shortlisted_property_comment_reaction_id,
      shortlisted_property_comment_reaction_id,
    );
  });

  it('update: should update shortlisted property comment reaction record and return updated record', async function () {
    const { shortlisted_property_comment_reaction_id, updatedReaction } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_reaction_id =
          await shortlistPropertyCommentReactionController.create(
            commentReactionInfo,
            { transaction },
          );
        await shortlistPropertyCommentReactionController.update(
          shortlisted_property_comment_reaction_id,
          { emoji: ':=(' },
          { transaction },
        );
        const updatedReaction =
          await shortlistPropertyCommentReactionController.findOne(
            { shortlisted_property_comment_reaction_id },
            { transaction },
          );
        await shortlistPropertyCommentReactionController.destroy(
          { shortlisted_property_comment_reaction_id },
          { transaction },
        );
        return { shortlisted_property_comment_reaction_id, updatedReaction };
      });
    assert.isNotNull(shortlisted_property_comment_reaction_id);
    assert.isNotNull(updatedReaction);
    assert.isString(updatedReaction.emoji);
    assert.strictEqual(updatedReaction.emoji, ':=(');
  });
});
