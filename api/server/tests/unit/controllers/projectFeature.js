const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const projectFeatureInfo = {
  project_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  feature_fk: 'test-feature-fk',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectFeatureController', function () {
  it('create: should create project feature record and return project_feature_id', async function () {
    const { project_feature_id } = await h.database.transaction(
      async (transaction) => {
        const project_feature_id = await c.projectFeature.create(
          projectFeatureInfo,
          { transaction },
        );
        await c.projectFeature.destroy({ project_feature_id }, { transaction });
        return { project_feature_id };
      },
    );
    assert.isNotNull(project_feature_id);
    assert.isString(project_feature_id);
  });

  it('findOne: by project_feature_id', async function () {
    const { project_feature_id, featureRecord } = await h.database.transaction(
      async (transaction) => {
        const project_feature_id = await c.projectFeature.create(
          projectFeatureInfo,
          { transaction },
        );
        const featureRecord = await c.projectFeature.findOne(
          { project_feature_id },
          { transaction },
        );
        await c.projectFeature.destroy({ project_feature_id }, { transaction });
        return { project_feature_id, featureRecord };
      },
    );
    assert.isNotNull(project_feature_id);
    assert.isNotNull(featureRecord);
    assert.strictEqual(featureRecord.project_feature_id, project_feature_id);
  });
});
