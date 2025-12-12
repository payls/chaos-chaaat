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
const taskMessageAttachmentController =
  require('../../../controllers/taskMessageAttachment').makeTaskMessageAttachmentController(
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

const taskMessageInfo = {
  task_fk: '',
  type: constant.TASK.MESSAGE.TYPE.CLIENT_TO_STAFF,
  message: 'hello world',
};

const taskMessageAttachmentInfo = {
  task_message_fk: '',
  file_name: 'some random file name',
  file_url: 'https://somerandomfilename.com',
};

describe('Unit Test for taskMessageAttachmentController', function () {
  it('create: should create a task message attachment and return task message attachment ID newly created record', async function () {
    const { task_message_attachment_id } = await h.database.transaction(
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
        taskMessageAttachmentInfo.task_message_fk = task_message_id;
        const task_message_attachment_id =
          await taskMessageAttachmentController.create(
            taskMessageAttachmentInfo,
            { transaction },
          );
        await taskMessageAttachmentController.destroy(
          { task_message_attachment_id },
          { transaction },
        );
        await taskMessageController.destroy(
          { task_message_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_message_attachment_id };
      },
    );
    assert.isNotNull(task_message_attachment_id);
    assert.isString(task_message_attachment_id);
  });

  it('update: should update a task message attachment and return task message attachment ID updated record', async function () {
    const { task_message_attachment_id, updated_task_message_attachment } =
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
        taskMessageAttachmentInfo.task_message_fk = task_message_id;
        const task_message_attachment_id =
          await taskMessageAttachmentController.create(
            taskMessageAttachmentInfo,
            { transaction },
          );
        await taskMessageAttachmentController.update(
          task_message_attachment_id,
          { file_name: 'hello world (updated)' },
          { transaction },
        );
        const updated_task_message_attachment =
          await taskMessageAttachmentController.findOne(
            { task_message_attachment_id },
            { transaction },
          );
        await taskMessageAttachmentController.destroy(
          { task_message_attachment_id },
          { transaction },
        );
        await taskMessageController.destroy(
          { task_message_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_message_attachment_id, updated_task_message_attachment };
      });
    assert.isNotNull(task_message_attachment_id);
    assert.isNotNull(updated_task_message_attachment);
    assert.isString(updated_task_message_attachment.file_name);
    assert.strictEqual(
      updated_task_message_attachment.file_name,
      'hello world (updated)',
    );
  });

  it('findOne: by task_message_attachment_id', async function () {
    const { task_message_attachment_id, task_message_attachment } =
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
        taskMessageAttachmentInfo.task_message_fk = task_message_id;
        const task_message_attachment_id =
          await taskMessageAttachmentController.create(
            taskMessageAttachmentInfo,
            { transaction },
          );
        const task_message_attachment =
          await taskMessageAttachmentController.findOne(
            { task_message_attachment_id },
            { transaction },
          );
        await taskMessageAttachmentController.destroy(
          { task_message_attachment_id },
          { transaction },
        );
        await taskMessageController.destroy(
          { task_message_id },
          { transaction },
        );
        await taskController.destroy({ task_id }, { transaction });
        await userController.destroy({ user_id }, { transaction });
        return { task_message_attachment_id, task_message_attachment };
      });
    assert.isNotNull(task_message_attachment_id);
    assert.isNotNull(task_message_attachment);
    assert.strictEqual(
      task_message_attachment.task_message_attachment_id,
      task_message_attachment_id,
    );
  });
});
