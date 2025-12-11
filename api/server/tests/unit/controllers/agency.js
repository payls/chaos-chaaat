const assert = require('chai').assert;
const models = require('../../../models');
const agencyController =
  require('../../../controllers/agency').makeAgencyController(models);
const h = require('../../../helpers');
h.test.init();

const agencyInfo = {
  agency_name: 'Agency Ltd',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for agencyController', function () {
  it('create: should create agency record and return agency_id', async function () {
    const { agency_id } = await h.database.transaction(async (transaction) => {
      const agency_id = await agencyController.create(agencyInfo, {
        transaction,
      });
      await agencyController.destroy({ agency_id }, { transaction });
      return { agency_id };
    });
    assert.isNotNull(agency_id);
    assert.isString(agency_id);
  });

  it('findOne: by agency_id', async function () {
    const { agency_id, agencyRecord } = await h.database.transaction(
      async (transaction) => {
        const agency_id = await agencyController.create(agencyInfo, {
          transaction,
        });
        const agencyRecord = await agencyController.findOne(
          { agency_id },
          { transaction },
        );
        await agencyController.destroy({ agency_id }, { transaction });
        return { agency_id, agencyRecord };
      },
    );
    assert.isNotNull(agency_id);
    assert.isNotNull(agencyRecord);
    assert.strictEqual(agencyRecord.agency_id, agency_id);
  });

  it('update: should update agency record and return updated record', async function () {
    const { agency_id, updatedAgencyRecord } = await h.database.transaction(
      async (transaction) => {
        const agency_id = await agencyController.create(agencyInfo, {
          transaction,
        });
        await agencyController.update(
          agency_id,
          {
            agency_name: 'New Agency LLC',
          },
          { transaction },
        );
        const updatedAgencyRecord = await agencyController.findOne(
          { agency_id },
          { transaction },
        );
        await agencyController.destroy({ agency_id }, { transaction });
        return { agency_id, updatedAgencyRecord };
      },
    );
    assert.isNotNull(agency_id);
    assert.isNotNull(updatedAgencyRecord);
    assert.isString(updatedAgencyRecord.agency_name);
    assert.strictEqual(updatedAgencyRecord.agency_name, 'New Agency LLC');
  });
});
