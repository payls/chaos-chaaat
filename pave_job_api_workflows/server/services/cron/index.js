const cron = require('node-cron');
const constant = require('../../constants/constant.json');
const threeMinAgentNotifJob = require('./3minAgentNotif');

module.exports = async (fastify) => {
  const cronService = {};

  cronService.jobWatch = () => {
    fastify.log.info('INITIALIZING CRON JOBS...');

    cron.schedule(constant.CRON_JOB.SCHEDULES['3_MIN_AGENT_NOTIF'], () => {
      threeMinAgentNotifJob(fastify);
    });
  };

  cronService.jobWatch();
};
