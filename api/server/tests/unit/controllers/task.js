const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const taskController = require('../../../controllers/task').makeTaskController(
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

describe('Unit Test for taskController', function () {
  it('create: should create a task and return task ID newly created record', async function () {
    const { task_id } = await h.database.transaction(async (transaction) => {
      const user_id = await userController.create(userInfo, { transaction });
      taskInfo.owner_fk = user_id;
      const task_id = await taskController.create(taskInfo, { transaction });
      await userController.destroy({ user_id }, { transaction });
      await taskController.destroy({ task_id }, { transaction });
      return { task_id };
    });
    assert.isNotNull(task_id);
  });

  it('update: should update a task and return task ID updated record', async function () {
    const { task_id, updated_task } = await h.database.transaction(
      async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskInfo.subject = 'updated_subject';
        await taskController.update(task_id, taskInfo, { transaction });
        const updated_task = await taskController.findOne(
          { task_id },
          { transaction },
        );
        await userController.destroy({ user_id }, { transaction });
        await taskController.destroy({ task_id }, { transaction });
        return { task_id, updated_task };
      },
    );
    assert.isNotNull(task_id);
    assert.isNotNull(updated_task);
    assert.isString(updated_task.subject);
    assert.strictEqual(updated_task.subject, 'updated_subject');
  });

  it('findOne: by task_id', async function () {
    const { task_id, task } = await h.database.transaction(
      async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        const task = await taskController.findOne({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        await taskController.destroy({ task_id }, { transaction });
        return { task_id, task };
      },
    );
    assert.isNotNull(task_id);
    assert.isNotNull(task);
    assert.strictEqual(task.task_id, task_id);
  });
});
