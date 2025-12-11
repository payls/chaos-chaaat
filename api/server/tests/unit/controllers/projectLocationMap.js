const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const projectLocationMapInfo = {
  project_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  name: 'Cafe',
  slug: 'food',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectLocationMapController', function () {
  it('create: should create project location map record and return project_location_map_id', async function () {
    const { project_location_map_id } = await h.database.transaction(
      async (transaction) => {
        const project_location_map_id = await c.projectLocationMap.create(
          projectLocationMapInfo,
          { transaction },
        );
        await c.projectLocationMap.destroy(
          { project_location_map_id },
          { transaction },
        );
        return { project_location_map_id };
      },
    );
    assert.isNotNull(project_location_map_id);
    assert.isString(project_location_map_id);
  });

  it('findOne: by project_location_map_id', async function () {
    const { project_location_map_id, locationMapRecord } =
      await h.database.transaction(async (transaction) => {
        const project_location_map_id = await c.projectLocationMap.create(
          projectLocationMapInfo,
          { transaction },
        );
        const locationMapRecord = await c.projectLocationMap.findOne(
          { project_location_map_id },
          { transaction },
        );
        await c.projectLocationMap.destroy(
          { project_location_map_id },
          { transaction },
        );
        return { project_location_map_id, locationMapRecord };
      });
    assert.isNotNull(project_location_map_id);
    assert.isNotNull(locationMapRecord);
    assert.strictEqual(
      locationMapRecord.project_location_map_id,
      project_location_map_id,
    );
  });

  it('update: should update project location map and return updated record', async function () {
    const { project_location_map_id, updatedRecord } =
      await h.database.transaction(async (transaction) => {
        const project_location_map_id = await c.projectLocationMap.create(
          projectLocationMapInfo,
          { transaction },
        );
        await c.projectLocationMap.update(
          project_location_map_id,
          { slug: 'cafe' },
          { transaction },
        );
        const updatedRecord = await c.projectLocationMap.findOne(
          { project_location_map_id },
          { transaction },
        );
        await c.projectLocationMap.destroy(
          { project_location_map_id },
          { transaction },
        );
        return { project_location_map_id, updatedRecord };
      });
    assert.isNotNull(project_location_map_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.slug);
    assert.strictEqual(updatedRecord.slug, 'cafe');
  });
});
