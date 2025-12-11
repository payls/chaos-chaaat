const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
const constant = require('../../../constants/constant.json');
h.test.init();

const projectMediaInfo = {
  project_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  type: constant.PROPERTY.MEDIA.TYPE.YOUTUBE,
  url: 'https://youtube.com/123%^@Jfw',
  title: 'Project Video Title',
  header_text: 'Project Intro Video',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectMediaController', function () {
  it('create: should create project media record and return project_media_id', async function () {
    const { project_media_id } = await h.database.transaction(
      async (transaction) => {
        const project_media_id = await c.projectMedia.create(projectMediaInfo, {
          transaction,
        });
        await c.projectMedia.destroy({ project_media_id }, { transaction });
        return { project_media_id };
      },
    );
    assert.isNotNull(project_media_id);
    assert.isString(project_media_id);
  });

  it('findOne: by project_media_id', async function () {
    const { project_media_id, mediaRecord } = await h.database.transaction(
      async (transaction) => {
        const project_media_id = await c.projectMedia.create(projectMediaInfo, {
          transaction,
        });
        const mediaRecord = await c.projectMedia.findOne(
          { project_media_id },
          { transaction },
        );
        await c.projectMedia.destroy({ project_media_id }, { transaction });
        return { project_media_id, mediaRecord };
      },
    );
    assert.isNotNull(project_media_id);
    assert.isNotNull(mediaRecord);
    assert.strictEqual(mediaRecord.project_media_id, project_media_id);
  });

  it('update: should update project media and return updated record', async function () {
    const { project_media_id, updatedRecord } = await h.database.transaction(
      async (transaction) => {
        const project_media_id = await c.projectMedia.create(projectMediaInfo, {
          transaction,
        });
        await c.projectMedia.update(
          project_media_id,
          { type: constant.PROPERTY.MEDIA.TYPE.IMAGE },
          { transaction },
        );
        const updatedRecord = await c.projectMedia.findOne(
          { project_media_id },
          { transaction },
        );
        await c.projectMedia.destroy({ project_media_id }, { transaction });
        return { project_media_id, updatedRecord };
      },
    );
    assert.isNotNull(project_media_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.type);
    assert.strictEqual(updatedRecord.type, constant.PROPERTY.MEDIA.TYPE.IMAGE);
  });
});
