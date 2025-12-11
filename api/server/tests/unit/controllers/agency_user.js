const assert = require('chai').assert;
const models = require('../../../models');
const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);
const h = require('../../../helpers');
h.test.init();

const agencyUserInfo = {
  agency_fk: '9be98bb6-49e8-11eb-a0fc-2147043b1de0',
  user_fk: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for agencyUserController', function () {
  it('create: should create agency user record and return agency_user_id', async function () {
    const { agency_user_id } = await h.database.transaction(
      async (transaction) => {
        const agency_user_id = await agencyUserController.create(
          agencyUserInfo,
          { transaction },
        );
        await agencyUserController.destroy({ agency_user_id }, { transaction });
        return { agency_user_id };
      },
    );
    assert.isNotNull(agency_user_id);
    assert.isString(agency_user_id);
  });

  it('findOne: by agency_user_id', async function () {
    const { agency_user_id, agencyUserRecord } = await h.database.transaction(
      async (transaction) => {
        const agency_user_id = await agencyUserController.create(
          agencyUserInfo,
          { transaction },
        );
        const agencyUserRecord = await agencyUserController.findOne(
          { agency_user_id },
          { transaction },
        );
        await agencyUserController.destroy({ agency_user_id }, { transaction });
        return { agency_user_id, agencyUserRecord };
      },
    );
    assert.isNotNull(agency_user_id);
    assert.isNotNull(agencyUserRecord);
    assert.strictEqual(agencyUserRecord.agency_user_id, agency_user_id);
  });

  it('update: should update agency user record and return updated record', async function () {
    const newAgencyFk = h.general.generateId();
    const { agency_user_id, updatedAgencyUserRecord } =
      await h.database.transaction(async (transaction) => {
        const agency_user_id = await agencyUserController.create(
          agencyUserInfo,
          { transaction },
        );
        await agencyUserController.update(
          agency_user_id,
          { agency_fk: newAgencyFk },
          { transaction },
        );
        const updatedAgencyUserRecord = await agencyUserController.findOne(
          { agency_user_id },
          { transaction },
        );
        await agencyUserController.destroy({ agency_user_id }, { transaction });
        return { agency_user_id, updatedAgencyUserRecord };
      });
    assert.isNotNull(agency_user_id);
    assert.isNotNull(updatedAgencyUserRecord);
    assert.isString(updatedAgencyUserRecord.agency_fk);
    assert.strictEqual(updatedAgencyUserRecord.agency_fk, newAgencyFk);
  });
});
