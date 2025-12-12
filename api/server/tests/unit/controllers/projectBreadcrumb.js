const assert = require('chai').assert;
const c = require('../../../controllers');
const h = require('../../../helpers');
h.test.init();

const projectBreadcrumbInfo = {
  project_fk: 'ebe55bb6-49e8-11eb-a0fc-hf7754db1de0',
  text: 'Australia',
  url: '/australia',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for projectBreadcrumbController', function () {
  it('create: should create project breadcrumb record and return project_breadcrumb_id', async function () {
    const { project_breadcrumb_id } = await h.database.transaction(
      async (transaction) => {
        const project_breadcrumb_id = await c.projectBreadcrumb.create(
          projectBreadcrumbInfo,
          { transaction },
        );
        await c.projectBreadcrumb.destroy(
          { project_breadcrumb_id },
          { transaction },
        );
        return { project_breadcrumb_id };
      },
    );
    assert.isNotNull(project_breadcrumb_id);
    assert.isString(project_breadcrumb_id);
  });

  it('findOne: by project_breadcrumb_id', async function () {
    const { project_breadcrumb_id, breadcrumbRecord } =
      await h.database.transaction(async (transaction) => {
        const project_breadcrumb_id = await c.projectBreadcrumb.create(
          projectBreadcrumbInfo,
          { transaction },
        );
        const breadcrumbRecord = await c.projectBreadcrumb.findOne(
          { project_breadcrumb_id },
          { transaction },
        );
        await c.projectBreadcrumb.destroy(
          { project_breadcrumb_id },
          { transaction },
        );
        return { project_breadcrumb_id, breadcrumbRecord };
      });
    assert.isNotNull(project_breadcrumb_id);
    assert.isNotNull(breadcrumbRecord);
    assert.strictEqual(
      breadcrumbRecord.project_breadcrumb_id,
      project_breadcrumb_id,
    );
  });

  it('update: should update project breadcrumb and return updated record', async function () {
    const { project_breadcrumb_id, updatedRecord } =
      await h.database.transaction(async (transaction) => {
        const project_breadcrumb_id = await c.projectBreadcrumb.create(
          projectBreadcrumbInfo,
          { transaction },
        );
        await c.projectBreadcrumb.update(
          project_breadcrumb_id,
          { text: 'Thailand' },
          { transaction },
        );
        const updatedRecord = await c.projectBreadcrumb.findOne(
          { project_breadcrumb_id },
          { transaction },
        );
        await c.projectBreadcrumb.destroy(
          { project_breadcrumb_id },
          { transaction },
        );
        return { project_breadcrumb_id, updatedRecord };
      });
    assert.isNotNull(project_breadcrumb_id);
    assert.isNotNull(updatedRecord);
    assert.isString(updatedRecord.text);
    assert.strictEqual(updatedRecord.text, 'Thailand');
  });
});
