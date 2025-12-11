const assert = require('chai').assert;
const models = require('../../../models');
const shortListedProjectController =
  require('../../../controllers/shortlistedProject').makeShortListedProjectController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const shortListedProjectInfo = {
  project_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  contact_fk: 'asy112e3-49e8-03fr-l9ic-2747223b1gv9',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for shortListedProjectController', function () {
  it('create: should create shortlisted_project record and return shortlisted_project_id', async function () {
    const { shortlisted_project_id } = await h.database.transaction(
      async (transaction) => {
        const shortlisted_project_id =
          await shortListedProjectController.create(shortListedProjectInfo, {
            transaction,
          });
        await shortListedProjectController.destroy(
          { shortlisted_project_id },
          { transaction },
        );
        return { shortlisted_project_id };
      },
    );
    assert.isNotNull(shortlisted_project_id);
    assert.isString(shortlisted_project_id);
  });

  it('findOne: by shortlisted_project_id', async function () {
    const { shortlisted_project_id, shortListedRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_project_id =
          await shortListedProjectController.create(shortListedProjectInfo, {
            transaction,
          });
        const shortListedRecord = await shortListedProjectController.findOne(
          { shortlisted_project_id },
          { transaction },
        );
        await shortListedProjectController.destroy(
          { shortlisted_project_id },
          { transaction },
        );
        return { shortlisted_project_id, shortListedRecord };
      });
    assert.isNotNull(shortlisted_project_id);
    assert.isNotNull(shortListedRecord);
    assert.strictEqual(
      shortListedRecord.shortlisted_project_id,
      shortlisted_project_id,
    );
  });

  it('update: should update shortlisted_project record and return updated record', async function () {
    const newProjectFk = h.general.generateId();
    const { shortlisted_project_id, updatedShortListedRecord } =
      await h.database.transaction(async (transaction) => {
        const shortlisted_project_id =
          await shortListedProjectController.create(shortListedProjectInfo, {
            transaction,
          });
        await shortListedProjectController.update(
          shortlisted_project_id,
          { project_fk: newProjectFk },
          { transaction },
        );
        const updatedShortListedRecord =
          await shortListedProjectController.findOne(
            { shortlisted_project_id },
            { transaction },
          );
        await shortListedProjectController.destroy(
          { shortlisted_project_id },
          { transaction },
        );
        return { shortlisted_project_id, updatedShortListedRecord };
      });
    assert.isNotNull(shortlisted_project_id);
    assert.isNotNull(updatedShortListedRecord);
    assert.isString(updatedShortListedRecord.project_fk);
    assert.strictEqual(updatedShortListedRecord.project_fk, newProjectFk);
  });
});
