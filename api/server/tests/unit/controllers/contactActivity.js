const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const expect = require('chai').assert;
const models = require('../../../models');
const contactActivityController =
  require('../../../controllers/contactActivity').makeContactActivityController(
    models,
  );
const contactController =
  require('../../../controllers/contact').makeContactController(models);
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const h = require('../../../helpers');
const { mockUser } = require('../../fixtures/mockUser');
const { mockContactActivity } = require('../../fixtures/mockContactActivity');
const { catchError } = require('../../../helpers/error');
const { mockContact } = require('../../fixtures/mockContact');
h.test.init();

const contactActivityInfo = mockContactActivity;

describe('Unit Test for contactActivityController', function () {
  describe('.handle3MinuteActivityEmail()', function () {
    it('empty contact activity list should not send and email & should throw an error', async function () {
      await h.database.transaction(async (transaction) => {
        const contact_id = await contactController.create(mockContact, {
          transaction,
        });
        const user_id = await userController.create(mockUser, {
          transaction,
        });

        const [err] = await catchError(
          contactActivityController.handle3MinuteActivityEmail(
            contact_id,
            user_id,
          ),
        );

        assert.isNotNull(err);
        await contactController.destroy({ contact_id }, { transaction });
        await userController.destroy({ user_id: user_id }, { transaction });
      });
    });
  });

  it('create: should create contact activity record and return contact_activity_id', async function () {
    const { contact_activity_id } = await h.database.transaction(
      async (transaction) => {
        const contact_activity_id = await contactActivityController.create(
          contactActivityInfo,
          { transaction },
        );
        await contactActivityController.destroy(
          { contact_activity_id },
          { transaction },
        );
        return { contact_activity_id };
      },
    );
    assert.isNotNull(contact_activity_id);
    assert.isString(contact_activity_id);
  });

  it('findOne: by contact_activity_id', async function () {
    const { contact_activity_id, contactActivityRecord } =
      await h.database.transaction(async (transaction) => {
        const contact_activity_id = await contactActivityController.create(
          contactActivityInfo,
          { transaction },
        );
        const contactActivityRecord = await contactActivityController.findOne(
          { contact_activity_id },
          { transaction },
        );
        await contactActivityController.destroy(
          { contact_activity_id },
          { transaction },
        );
        return { contact_activity_id, contactActivityRecord };
      });
    assert.isNotNull(contact_activity_id);
    assert.isNotNull(contactActivityRecord);
    assert.strictEqual(
      contactActivityRecord.contact_activity_id,
      contact_activity_id,
    );
  });

  it('update: should update contact activity record and return updated record', async function () {
    const { contact_activity_id, updatedRecord } = await h.database.transaction(
      async (transaction) => {
        const contact_activity_id = await contactActivityController.create(
          contactActivityInfo,
          { transaction },
        );
        await contactActivityController.update(
          contact_activity_id,
          {
            activity_type:
              constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED,
          },
          { transaction },
        );
        const updatedRecord = await contactActivityController.findOne(
          { contact_activity_id },
          { transaction },
        );
        await contactActivityController.destroy(
          { contact_activity_id },
          { transaction },
        );
        return { contact_activity_id, updatedRecord };
      },
    );
    assert.isNotNull(contact_activity_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.activity_type);
    assert.strictEqual(
      updatedRecord.activity_type,
      constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED,
    );
  });

  describe('.logActivityToHubSpot()', function () {
    it('logActivityToHubSpot: should not throw error if hubspot_bcc_id is not present', async function () {
      await h.database.transaction(async (transaction) => {
        const contact_id = await contactController.create(mockContact, {
          transaction,
        });
        const [err] = await catchError(
          contactActivityController.logActivityToHubSpot(
            {
              contact_fk: contact_id,
              activity_type:
                constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED,
              activity_meta: JSON.stringify({
                media_type: 'image',
                url: 'https://content.chaaat.io/wp-content/uploads/2021/07/2021-03-26_gallery_documents_20210326175750.jpg',
                shortlisted_property_id: 'ab06a3a3-09e1-48db-b868-ebc8364f590d',
              }),
            },
            { transaction },
          ),
        );
        assert.isNull(err);
        await contactController.destroy({ contact_id }, { transaction });
      });
    });
  });

  it('logActivityToHubSpot: should not throw error if contact has no agency_user', async function () {
    await h.database.transaction(async (transaction) => {
      const contact_id = await contactController.create(
        { ...mockContact, agency_user_fk: null },
        {
          transaction,
        },
      );
      const [err] = await catchError(
        contactActivityController.logActivityToHubSpot(
          {
            contact_fk: contact_id,
            activity_type:
              constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED,
            activity_meta: JSON.stringify({
              media_type: 'image',
              url: 'https://content.chaaat.io/wp-content/uploads/2021/07/2021-03-26_gallery_documents_20210326175750.jpg',
              shortlisted_property_id: 'ab06a3a3-09e1-48db-b868-ebc8364f590d',
            }),
          },
          { transaction },
        ),
      );
      assert.isNull(err);
      await contactController.destroy({ contact_id }, { transaction });
    });
  });
});
