const moment = require('moment');
const { Op } = require('sequelize');
const Sentry = require('@sentry/node');

const models = require('../../models');
const constant = require('../../constants/constant.json');
const cronJobName = constant.CRON_JOB.TYPES['3_MIN_AGENT_NOTIF'];
const processTask = async ({ fastify, cron_job_id, payload, num_try }) => {
  const cronJobCtl = require('../../controllers/cronJob').makeCronJobController(
    models,
  );
  const contactActivityCtl =
    require('../../controllers/contactActivity').makeContactActivityController(
      models,
      fastify,
    );
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      Sentry.captureException(e);
      fastify.log.warn({
        cron: cronJobName,
        message: 'Invalid Payload',
        err: e,
      });
      return undefined;
    }
  }
  const { previousContactValues, user } = payload;
  try {
    if (num_try < 5) {
      await contactActivityCtl.handle3MinuteActivityEmail(
        previousContactValues,
        user,
      );
      // making sure that nothing will be destroyed when things went wrong
      await cronJobCtl.destroy({ cron_job_id });
    }
    return undefined;
  } catch (err) {
    Sentry.captureException(err);
    fastify.log.warn({
      cron: cronJobName,
      cron_job_id,
      message: 'An error occured while running task.',
      err,
    });
    const tries = parseInt(num_try) + 1;
    await cronJobCtl.update(cron_job_id, { num_try: tries });
    return undefined;
  }
};

module.exports = async (fastify) => {
  const cronJobCtl = require('../../controllers/cronJob').makeCronJobController(
    models,
  );
  try {
    fastify.log.info({
      cron: cronJobName,
      message: `Running ${cronJobName} Scheduled Task.`,
    });

    const date3MinAgo = moment().subtract(3, 'minutes').toDate();

    const taskLists = await cronJobCtl.findAll({
      type: cronJobName,
      created_date: {
        [Op.lte]: date3MinAgo,
      },
    });
    fastify.log.info({
      cron: cronJobName,
      message: `Found ${taskLists.length} task(s)`,
    });
    if (taskLists.length > 0) {
      await Promise.all(
        taskLists.map(({ dataValues }) =>
          processTask({
            fastify,
            cron_job_id: dataValues.cron_job_id,
            payload: dataValues.payload,
            num_try: dataValues.num_try,
          }),
        ),
      );
    }
  } catch (err) {
    Sentry.captureException(err);
    fastify.log.error({
      cron: cronJobName,
      name: '3MinAgentNotif_ERR',
      err,
    });
  }
};
