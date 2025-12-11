const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const projectLocationNearbyInfo = {
  project_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  type: 'Nearby',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectLocationNearbyController', function () {
  it('create: should create project location nearby record and return project_location_nearby_id', async function () {
    const { project_location_nearby_id } = await h.database.transaction(
      async (transaction) => {
        const project_location_nearby_id = await c.projectLocationNearby.create(
          projectLocationNearbyInfo,
          { transaction },
        );
        await c.projectLocationNearby.destroy(
          { project_location_nearby_id },
          { transaction },
        );
        return { project_location_nearby_id };
      },
    );
    assert.isNotNull(project_location_nearby_id);
    assert.isString(project_location_nearby_id);
  });

  it('findOne: by project_location_nearby_id', async function () {
    const { project_location_nearby_id, locationNearbyRecord } =
      await h.database.transaction(async (transaction) => {
        const project_location_nearby_id = await c.projectLocationNearby.create(
          projectLocationNearbyInfo,
          { transaction },
        );
        const locationNearbyRecord = await c.projectLocationNearby.findOne(
          { project_location_nearby_id },
          { transaction },
        );
        await c.projectLocationNearby.destroy(
          { project_location_nearby_id },
          { transaction },
        );
        return { project_location_nearby_id, locationNearbyRecord };
      });
    assert.isNotNull(project_location_nearby_id);
    assert.isNotNull(locationNearbyRecord);
    assert.strictEqual(
      locationNearbyRecord.project_location_nearby_id,
      project_location_nearby_id,
    );
  });

  it('update: should update project location nearby and return updated record', async function () {
    const { project_location_nearby_id, updatedRecord } =
      await h.database.transaction(async (transaction) => {
        const project_location_nearby_id = await c.projectLocationNearby.create(
          projectLocationNearbyInfo,
          { transaction },
        );
        await c.projectLocationNearby.update(
          project_location_nearby_id,
          { type: 'School' },
          { transaction },
        );
        const updatedRecord = await c.projectLocationNearby.findOne(
          { project_location_nearby_id },
          { transaction },
        );
        await c.projectLocationNearby.destroy(
          { project_location_nearby_id },
          { transaction },
        );
        return { project_location_nearby_id, updatedRecord };
      });
    assert.isNotNull(project_location_nearby_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.type);
    assert.strictEqual(updatedRecord.type, 'School');
  });
});
