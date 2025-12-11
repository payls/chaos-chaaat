const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const featureInfo = {
  name: 'Indoor Gym',
  type: 'fitness',
  project_fk: 'hus8912-98fh-12eh-a0fc-214789fu1de0',
  feature_fk: 'test-feature-fk',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for featureController', function () {
  it('create: should create feature record and return feature_id', async function () {
    const { feature_id } = await h.database.transaction(async (transaction) => {
      const feature_id = await c.feature.create(featureInfo, { transaction });
      await c.feature.destroy({ feature_id }, { transaction });
      return { feature_id };
    });
    assert.isNotNull(feature_id);
    assert.isString(feature_id);
  });

  it('findOne: by feature_id', async function () {
    const { feature_id, featureRecord } = await h.database.transaction(
      async (transaction) => {
        const feature_id = await c.feature.create(featureInfo, { transaction });
        const featureRecord = await c.feature.findOne(
          { feature_id },
          { transaction },
        );
        await c.feature.destroy({ feature_id }, { transaction });
        return { feature_id, featureRecord };
      },
    );
    assert.isNotNull(feature_id);
    assert.isNotNull(featureRecord);
    assert.strictEqual(featureRecord.feature_id, feature_id);
  });

  it('update: should update feature and return updated record', async function () {
    const { feature_id, updatedRecord } = await h.database.transaction(
      async (transaction) => {
        const feature_id = await c.feature.create(featureInfo, { transaction });
        await c.feature.update(
          feature_id,
          { name: 'Yoga studio' },
          { transaction },
        );
        const updatedRecord = await c.feature.findOne(
          { feature_id },
          { transaction },
        );
        await c.feature.destroy({ feature_id }, { transaction });
        return { feature_id, updatedRecord };
      },
    );
    assert.isNotNull(feature_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.name);
    assert.strictEqual(updatedRecord.name, 'Yoga studio');
  });
});
