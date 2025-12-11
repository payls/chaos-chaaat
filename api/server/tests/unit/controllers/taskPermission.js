const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const taskController = require('../../../controllers/task').makeTaskController(
  models,
);
const taskPermissionController =
  require('../../../controllers/taskPermission').makeTaskPermissionController(
    models,
  );
const h = require('../../../helpers');
h.test.init();

const userInfo = {
  first_name: 'Test',
  last_name: 'User',
  email: 'mervin+taskuser@yourpave.com',
};

const taskInfo = {
  owner_type: constant.OWNER.TYPE.CLIENT,
  owner_fk: '',
  subject: 'some random subject',
  type: constant.TASK.TYPE.TASK,
  type_sub: constant.TASK.TYPE_SUB.TASK_GENERAL,
  status: constant.TASK.STATUS.PENDING_CLIENT,
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

const taskPermissionInfo = {
  task_fk: '',
  owner_type: constant.OWNER.TYPE.SERVICE_PROVIDER,
  owner_fk: '',
  action: constant.PERMISSION.ACTION.CREATE,
  permission: 1,
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};

describe('Unit Test for taskPermissionController', function () {
  it('create: should create a task permission and return task permission ID newly created record', async function () {
    const { task_permission_id } = await h.database.transaction(
      async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        taskPermissionInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskPermissionInfo.task_fk = task_id;
        const task_permission_id = await taskPermissionController.create(
          taskPermissionInfo,
          { transaction },
        );
        await userController.destroy({ user_id }, { transaction });
        await taskController.destroy({ task_id }, { transaction });
        await taskPermissionController.destroy(
          { task_permission_id },
          { transaction },
        );
        return { task_permission_id };
      },
    );
    assert.isNotNull(task_permission_id);
    assert.isString(task_permission_id);
  });

  it('update: should update a task permission and return task permission ID updated record', async function () {
    const { task_permission_id, updated_task_permission } =
      await h.database.transaction(async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        taskPermissionInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskPermissionInfo.task_fk = task_id;
        const task_permission_id = await taskPermissionController.create(
          taskPermissionInfo,
          { transaction },
        );
        await taskPermissionController.update(
          task_permission_id,
          { permission: 0 },
          { transaction },
        );
        const updated_task_permission = await taskPermissionController.findOne(
          { task_permission_id },
          { transaction },
        );
        await taskPermissionController.destroy(
          { task_permission_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_permission_id, updated_task_permission };
      });
    assert.isNotNull(task_permission_id);
    assert.isNotNull(updated_task_permission);
    assert.isNumber(updated_task_permission.permission);
    assert.strictEqual(updated_task_permission.permission, 0);
  });

  it('findOne: by task_permission_id', async function () {
    const { task_permission_id, task_message } = await h.database.transaction(
      async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        taskPermissionInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskPermissionInfo.task_fk = task_id;
        const task_permission_id = await taskPermissionController.create(
          taskPermissionInfo,
          { transaction },
        );
        const task_message = await taskPermissionController.findOne(
          { task_permission_id },
          { transaction },
        );
        await taskPermissionController.destroy(
          { task_permission_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_permission_id, task_message };
      },
    );
    assert.isNotNull(task_permission_id);
    assert.isNotNull(task_message);
    assert.strictEqual(task_message.task_permission_id, task_permission_id);
  });
});
