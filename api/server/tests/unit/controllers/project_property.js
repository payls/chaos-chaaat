const assert = require('chai').assert;
const models = require('../../../models');
const projectPropertyController =
  require('../../../controllers/projectProperty').makeProjectPropertyController(
    models,
  );
const constant = require('../../../constants/constant.json');
const h = require('../../../helpers');
const { mockProjectProperty } = require('../../fixtures/mockProjectProperty');
h.test.init();

const propertyInfo = mockProjectProperty;

describe('Unit Test for projectPropertyController', function () {
  it('create: should create project property record and return project_property_id', async function () {
    const { project_property_id } = await h.database.transaction(
      async (transaction) => {
        const project_property_id = await projectPropertyController.create(
          propertyInfo,
          { transaction },
        );
        await projectPropertyController.destroy(
          { project_property_id },
          { transaction },
        );
        return { project_property_id };
      },
    );
    assert.isNotNull(project_property_id);
    assert.isString(project_property_id);
  });

  it('findOne: by project_property_id', async function () {
    const { project_property_id, propertyRecord } =
      await h.database.transaction(async (transaction) => {
        const project_property_id = await projectPropertyController.create(
          propertyInfo,
          { transaction },
        );
        const propertyRecord = await projectPropertyController.findOne(
          { project_property_id },
          { transaction },
        );
        await projectPropertyController.destroy(
          { project_property_id },
          { transaction },
        );
        return { project_property_id, propertyRecord };
      });
    assert.isNotNull(project_property_id);
    assert.isNotNull(propertyRecord);
    assert.strictEqual(propertyRecord.project_property_id, project_property_id);
  });

  it('update: should update project property record and return updated record', async function () {
    const { project_property_id, updatedPropertyRecord } =
      await h.database.transaction(async (transaction) => {
        const project_property_id = await projectPropertyController.create(
          propertyInfo,
          { transaction },
        );
        await projectPropertyController.update(
          project_property_id,
          { unit_number: '2', direction_facing: constant.DIRECTION.EAST },
          { transaction },
        );
        const updatedPropertyRecord = await projectPropertyController.findOne(
          { project_property_id },
          { transaction },
        );
        await projectPropertyController.destroy(
          { project_property_id },
          { transaction },
        );
        return { project_property_id, updatedPropertyRecord };
      });
    assert.isNotNull(project_property_id);
    assert.isNotNull(updatedPropertyRecord);
    assert.isString(updatedPropertyRecord.unit_number);
    assert.isString(updatedPropertyRecord.direction_facing);
    assert.strictEqual(
      updatedPropertyRecord.direction_facing,
      constant.DIRECTION.EAST,
    );
    assert.strictEqual(updatedPropertyRecord.unit_number, '2');
  });
});
