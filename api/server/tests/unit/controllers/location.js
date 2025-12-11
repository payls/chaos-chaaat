const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const locationInfo = {
  project_location_map_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  project_location_nearby_fk: '',
  name: 'School',
  address: '23 Victoria Street',
  lat: 231.5,
  lng: 112.34,
  google_map_url: 'https://googlemaps/a@%!SFafgsd5321',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for locationController', function () {
  it('create: should create project location record and return location_id', async function () {
    const { location_id } = await h.database.transaction(
      async (transaction) => {
        const location_id = await c.location.create(locationInfo, {
          transaction,
        });
        await c.location.destroy({ location_id }, { transaction });
        return { location_id };
      },
    );
    assert.isNotNull(location_id);
    assert.isString(location_id);
  });

  it('findOne: by location_id', async function () {
    const { location_id, locationRecord } = await h.database.transaction(
      async (transaction) => {
        const location_id = await c.location.create(locationInfo, {
          transaction,
        });
        const locationRecord = await c.location.findOne(
          { location_id },
          { transaction },
        );
        await c.location.destroy({ location_id }, { transaction });
        return { location_id, locationRecord };
      },
    );
    assert.isNotNull(location_id);
    assert.isNotNull(locationRecord);
    assert.strictEqual(locationRecord.location_id, location_id);
  });

  it('update: should update location and return updated record', async function () {
    const projectLocationNearbyId = h.general.generateId();
    const { location_id, updatedRecord } = await h.database.transaction(
      async (transaction) => {
        const location_id = await c.location.create(locationInfo, {
          transaction,
        });
        await c.location.update(
          location_id,
          { project_location_nearby_fk: projectLocationNearbyId },
          { transaction },
        );
        const updatedRecord = await c.location.findOne(
          { location_id },
          { transaction },
        );
        await c.location.destroy({ location_id }, { transaction });
        return { location_id, updatedRecord };
      },
    );
    assert.isNotNull(location_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.project_location_nearby_fk);
    assert.strictEqual(
      updatedRecord.project_location_nearby_fk,
      projectLocationNearbyId,
    );
  });
});
