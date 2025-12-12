// const config = require('../configs/config')(process.env.NODE_ENV);
const Redis = require('ioredis');
const Sentry = require('@sentry/node');

function parseConfig(conf) {
  if (conf.url) {
    return conf.url;
  }

  return {
    port: conf.port,
    host: conf.host,
    password: conf.password,
    db: conf.db || 0,
  };
}

function createClient(config) {
  const redisConfig = parseConfig(config);

  const log = config.log || {
    debug: console.log,
    info: console.log,
    error: console.error,
  };

  const client = new Redis(redisConfig);

  client.on('connect', async () => {
    try {
      await client.ping();
    } catch (err) {
      Sentry.captureException(err);
      log.error({ err }, 'Ping Error');
    }
    log.info(`Redis client connected to database ${redisConfig.db}.`);
  });

  client.on('error', (err) => {
    Sentry.captureException(err);
    log.error({ err }, 'Redis client error');
  });

  client.on('reconnecting', () => {
    log.info('Redis client reconnecting');
  });

  client.on('end', () => {
    log.info('Redis client disconnected.');
  });

  return client;
}

module.exports = {
  createClient: (config) => createClient(config),
};
