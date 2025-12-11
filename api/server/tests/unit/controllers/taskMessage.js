const constant = require('../../../constants/constant.json');
const assert = require('chai').assert;
const models = require('../../../models');
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const taskController = require('../../../controllers/task').makeTaskController(
  models,
);
const taskMessageController =
  require('../../../controllers/taskMessage').makeTaskMessageController(models);
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

const taskMessageInfo = {
  task_fk: '',
  type: constant.TASK.MESSAGE.TYPE.CLIENT_TO_STAFF,
  message: 'hello world',
};

describe('Unit Test for taskMessageController', function () {
  it('create: should create a task message and return task message ID newly created record', async function () {
    const { task_message_id } = await h.database.transaction(
      async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskMessageInfo.task_fk = task_id;
        taskMessageInfo.user_fk = user_id;
        const task_message_id = await taskMessageController.create(
          taskMessageInfo,
          { transaction },
        );
        await userController.destroy({ user_id }, { transaction });
        await taskController.destroy({ task_id }, { transaction });
        await taskMessageController.destroy(
          { task_message_id },
          { transaction },
        );
        return { task_message_id };
      },
    );
    assert.isNotNull(task_message_id);
    assert.isString(task_message_id);
  });

  it('update: should update a task message and return task message ID updated record', async function () {
    const { task_message_id, updated_task_message } =
      await h.database.transaction(async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskMessageInfo.task_fk = task_id;
        taskMessageInfo.user_fk = user_id;
        const task_message_id = await taskMessageController.create(
          taskMessageInfo,
          { transaction },
        );
        await taskMessageController.update(
          task_message_id,
          { message: 'hello world (updated)' },
          { transaction },
        );
        const updated_task_message = await taskMessageController.findOne(
          { task_message_id },
          { transaction },
        );
        await taskMessageController.destroy(
          { task_message_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_message_id, updated_task_message };
      });
    assert.isNotNull(task_message_id);
    assert.isNotNull(updated_task_message);
    assert.isString(updated_task_message.message);
    assert.strictEqual(updated_task_message.message, 'hello world (updated)');
  });

  it('findOne: by task_message_id', async function () {
    const { task_message_id, task_message } = await h.database.transaction(
      async (transaction) => {
        const user_id = await userController.create(userInfo, { transaction });
        taskInfo.owner_fk = user_id;
        const task_id = await taskController.create(taskInfo, { transaction });
        taskMessageInfo.task_fk = task_id;
        taskMessageInfo.user_fk = user_id;
        const task_message_id = await taskMessageController.create(
          taskMessageInfo,
          { transaction },
        );
        const task_message = await taskMessageController.findOne(
          { task_message_id },
          { transaction },
        );
        await taskMessageController.destroy(
          { task_message_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_message_id, task_message };
      },
    );
    assert.isNotNull(task_message_id);
    assert.isNotNull(task_message);
    assert.strictEqual(task_message.task_message_id, task_message_id);
  });
});
