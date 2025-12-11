const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const projectTeamBehindInfo = {
  project_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  type: 'developer',
  logo_url: 'https://developer_logo.com/123%^@Jfw',
  name: 'Isaki V',
  description: 'Project Developer',
  title: 'Isaki Logo',
  filename: 'developer_brand_logo1',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectTeamBehindController', function () {
  it('create: should create project team behind record and return project_team_behind_id', async function () {
    const { project_team_behind_id } = await h.database.transaction(
      async (transaction) => {
        const project_team_behind_id = await c.projectTeamBehind.create(
          projectTeamBehindInfo,
          { transaction },
        );
        await c.projectTeamBehind.destroy(
          { project_team_behind_id },
          { transaction },
        );
        return { project_team_behind_id };
      },
    );
    assert.isNotNull(project_team_behind_id);
    assert.isString(project_team_behind_id);
  });

  it('findOne: by project_team_behind_id', async function () {
    const { project_team_behind_id, teamBehindRecord } =
      await h.database.transaction(async (transaction) => {
        const project_team_behind_id = await c.projectTeamBehind.create(
          projectTeamBehindInfo,
          { transaction },
        );
        const teamBehindRecord = await c.projectTeamBehind.findOne(
          { project_team_behind_id },
          { transaction },
        );
        await c.projectTeamBehind.destroy(
          { project_team_behind_id },
          { transaction },
        );
        return { project_team_behind_id, teamBehindRecord };
      });
    assert.isNotNull(project_team_behind_id);
    assert.isNotNull(teamBehindRecord);
    assert.strictEqual(
      teamBehindRecord.project_team_behind_id,
      project_team_behind_id,
    );
  });

  it('update: should update project team behind and return updated record', async function () {
    const { project_team_behind_id, updatedRecord } =
      await h.database.transaction(async (transaction) => {
        const project_team_behind_id = await c.projectTeamBehind.create(
          projectTeamBehindInfo,
          { transaction },
        );
        await c.projectTeamBehind.update(
          project_team_behind_id,
          { type: 'architect' },
          { transaction },
        );
        const updatedRecord = await c.projectTeamBehind.findOne(
          { project_team_behind_id },
          { transaction },
        );
        await c.projectTeamBehind.destroy(
          { project_team_behind_id },
          { transaction },
        );
        return { project_team_behind_id, updatedRecord };
      });
    assert.isNotNull(project_team_behind_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.type);
    assert.strictEqual(updatedRecord.type, 'architect');
  });
});
