const assert = require('chai').assert;
const models = require('../../../models');
const shortlistPropertyCommentAttachmentController =
  require('../../../controllers/shortlistedPropertyCommentAttachment').makeShortListedPropertyCommentAttachmentController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const commentAttachmentInfo = {
  shortlisted_property_comment_fk: '8ags21f8-78gf-98yv-h0op-hf81k29tv98',
  attachment_url: 'https://yourpave.com/attachment/mycommentattachment',
  attachment_title: 'My Attachment',
  file_name: 'My Attachment Name.jpg',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for shortlistPropertyCommentAttachmentController', function () {
  it('create: should create shortlisted property comment attachment record and return shortlisted_property_comment_attachment_id', async function () {
    const { shortlisted_property_comment_attachment_id } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_attachment_id =
          await shortlistPropertyCommentAttachmentController.create(
            commentAttachmentInfo,
            { transaction },
          );
        await shortlistPropertyCommentAttachmentController.destroy(
          { shortlisted_property_comment_attachment_id },
          { transaction },
        );
        return { shortlisted_property_comment_attachment_id };
      });
    assert.isNotNull(shortlisted_property_comment_attachment_id);
    assert.isString(shortlisted_property_comment_attachment_id);
  });

  it('findOne: by shortlisted_property_comment_attachment_id', async function () {
    const { shortlisted_property_comment_attachment_id, attachmentRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_property_comment_attachment_id =
          await shortlistPropertyCommentAttachmentController.create(
            commentAttachmentInfo,
            { transaction },
          );
        const attachmentRecord =
          await shortlistPropertyCommentAttachmentController.findOne(
            { shortlisted_property_comment_attachment_id },
            { transaction },
          );
        await shortlistPropertyCommentAttachmentController.destroy(
          { shortlisted_property_comment_attachment_id },
          { transaction },
        );
        return { shortlisted_property_comment_attachment_id, attachmentRecord };
      });
    assert.isNotNull(shortlisted_property_comment_attachment_id);
    assert.isNotNull(attachmentRecord);
    assert.strictEqual(
      attachmentRecord.shortlisted_property_comment_attachment_id,
      shortlisted_property_comment_attachment_id,
    );
  });

  it('update: should update shortlisted property comment attachment record and return updated record', async function () {
    const {
      shortlisted_property_comment_attachment_id,
      updatedAttachmentRecord,
    } = await h.database.transaction(async (transaction) => {
      const shortlisted_property_comment_attachment_id =
        await shortlistPropertyCommentAttachmentController.create(
          commentAttachmentInfo,
          { transaction },
        );
      await shortlistPropertyCommentAttachmentController.update(
        shortlisted_property_comment_attachment_id,
        {
          attachment_title: 'New Attachment Title',
        },
        { transaction },
      );
      const updatedAttachmentRecord =
        await shortlistPropertyCommentAttachmentController.findOne(
          { shortlisted_property_comment_attachment_id },
          { transaction },
        );
      await shortlistPropertyCommentAttachmentController.destroy(
        { shortlisted_property_comment_attachment_id },
        { transaction },
      );
      return {
        shortlisted_property_comment_attachment_id,
        updatedAttachmentRecord,
      };
    });
    assert.isNotNull(shortlisted_property_comment_attachment_id);
    assert.isNotNull(updatedAttachmentRecord);
    assert.isString(updatedAttachmentRecord.attachment_title);
    assert.strictEqual(
      updatedAttachmentRecord.attachment_title,
      'New Attachment Title',
    );
  });
});
