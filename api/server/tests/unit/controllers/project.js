const assert = require('chai').assert;
const models = require('../../../models');
const projectController =
  require('../../../controllers/project').makeProjectController(models);
const constant = require('../../../constants/constant.json');
const h = require('../../../helpers');
h.test.init();

const projectInfo = {
  property_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  name: 'The Promenade',
  description: 'This is the Promenade',
  currency_code: 'USD',
  size_format: constant.SIZE_FORMAT.SQFT,
  completion_date: h.date.format(new Date().toISOString(), 'l'),
  location_address_1: 'Address 1',
  location_address_2: 'Address 2',
  location_address_3: 'Address 3',
  location_latitude: 101.39,
  location_longitude: 211.7,
  location_google_map_url: 'https://googleURL',
  status: constant.PROJECT.STATUS.COMPLETED,
  is_deleted: 0,
  country_fk: 'df127ju7-26a8-47c1-a3a6-3d00y160hsg9',
  slug: 'Yarra One',
  property_header_info_name: 'Header name',
  property_header_info_descriptions: 'Header description',
  property_header_info_short_description: 'Header short description',
  property_header_info_cover_picture_url: 'https://cover_pic/url',
  completion_status: 2,
  availability_status: 8,
  bedrooms_description: '3 bedrooms',
  pricing_description: 'Starts from USD 800,000',
  residences_description: 'Yarra One residence',
  estimated_completion: '4th Quarter 2022',
  units_available_description: '120',
  brochure_url: 'https://brochure_url/link',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectController', function () {
  it('create: should create project record and return project_id', async function () {
    const { project_id } = await h.database.transaction(async (transaction) => {
      const project_id = await projectController.create(projectInfo, {
        transaction,
      });
      await projectController.destroy({ project_id }, { transaction });
      return { project_id };
    });
    assert.isNotNull(project_id);
    assert.isString(project_id);
  });

  it('findOne: by project_id', async function () {
    const { project_id, projectRecord } = await h.database.transaction(
      async (transaction) => {
        const project_id = await projectController.create(projectInfo, {
          transaction,
        });
        const projectRecord = await projectController.findOne(
          { project_id },
          { transaction },
        );
        await projectController.destroy({ project_id }, { transaction });
        return { project_id, projectRecord };
      },
    );
    assert.isNotNull(project_id);
    assert.isNotNull(projectRecord);
    assert.strictEqual(projectRecord.project_id, project_id);
  });

  it('update: should update project status and return updated record', async function () {
    const { project_id, updatedRecord } = await h.database.transaction(
      async (transaction) => {
        const project_id = await projectController.create(projectInfo, {
          transaction,
        });
        await projectController.update(
          project_id,
          { status: constant.PROJECT.STATUS.NOT_STARTED },
          { transaction },
        );
        const updatedRecord = await projectController.findOne(
          { project_id },
          { transaction },
        );
        await projectController.destroy({ project_id }, { transaction });
        return { project_id, updatedRecord };
      },
    );
    assert.isNotNull(project_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.status);
    assert.strictEqual(
      updatedRecord.status,
      constant.PROJECT.STATUS.NOT_STARTED,
    );
  });

  it('update: should update project key_stats, project_highlights, etc. and return updated record', async function () {
    const key_stats = 'key_stats';
    const project_highlights = 'project_highlights';
    const why_invest = 'why_invest';
    const shopping = 'shopping';
    const transport = 'transport';
    const education = 'education';

    const { project_id, updatedRecord } = await h.database.transaction(
      async (transaction) => {
        const project_id = await projectController.create(projectInfo, {
          transaction,
        });
        await projectController.update(
          project_id,
          {
            key_stats,
            project_highlights,
            why_invest,
            shopping,
            transport,
            education,
          },
          { transaction },
        );
        let updatedRecord = await projectController.findOne(
          { project_id },
          { transaction },
        );

        assert.isNotNull(project_id);
        assert.isNotNull(updatedRecord);
        assert.isString(updatedRecord.key_stats);
        assert.strictEqual(updatedRecord.key_stats, key_stats);
        assert.isString(updatedRecord.project_highlights);
        assert.strictEqual(
          updatedRecord.project_highlights,
          project_highlights,
        );
        assert.isString(updatedRecord.why_invest);
        assert.strictEqual(updatedRecord.why_invest, why_invest);
        assert.isString(updatedRecord.shopping);
        assert.strictEqual(updatedRecord.shopping, shopping);
        assert.isString(updatedRecord.transport);
        assert.strictEqual(updatedRecord.transport, transport);
        assert.isString(updatedRecord.education);
        assert.strictEqual(updatedRecord.education, education);

        await projectController.update(
          project_id,
          {
            key_stats: null,
            project_highlights: null,
            why_invest: null,
            shopping: null,
            transport: null,
            education: null,
          },
          { transaction },
        );
        updatedRecord = await projectController.findOne(
          { project_id },
          { transaction },
        );

        await projectController.destroy({ project_id }, { transaction });
        return { project_id, updatedRecord };
      },
    );

    assert.isNull(updatedRecord.key_stats);
    assert.isNull(updatedRecord.project_highlights);
    assert.isNull(updatedRecord.why_invest);
    assert.isNull(updatedRecord.shopping);
    assert.isNull(updatedRecord.transport);
    assert.isNull(updatedRecord.education);
  });
});
