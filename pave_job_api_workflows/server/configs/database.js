const fastify = require('fastify')({
  logger: true
});

const logger = fastify.log.child({
  sql_log_app: 'pave_job_api_workflows',
  process: 'sequelize',
});

const loggingEnabled = (process.env.ENABLE_SQL_LOGS === 'true');

module.exports = {
  development: {
    username: 'pavewebmaster',
    password: 'ZM3z8LvwwQW6pmEePrz7NRUv8',
    database: 'pave_development',
    host: process.env.DOCKER_MYSQL_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: loggingEnabled ? (msg) => logger.info(msg) : false,
    // The retry config if Deadlock Happened
    retry: {
      match: [/Deadlock/i],
      max: 5, // Maximum rety 3 times
      backoffBase: 5000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
    pool: {
      max: 150,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  staging: {
    username: 'chaaatapiuser',
    password: 'CSuzzVaBwWmLssoGAkFt',
    database: 'chaaat_staging',
    host: 'chaaat-aurora-db-stg.cluster-cmp9x7ku6wdq.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: loggingEnabled ? (msg) => logger.info(msg) : false,
    // The retry config if Deadlock Happened
    retry: {
      match: [/Deadlock/i],
      max: 5, // Maximum rety 3 times
      backoffBase: 5000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
    pool: {
      max: 150,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  qa: {
    username: 'paveapiuser',
    password: 'FgbvtytewEiygG3AdxoauwzPs',
    database: 'pave_qa',
    host: 'pave-qa-api-db1.chjmbjtizziw.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: loggingEnabled ? (msg) => logger.info(msg) : false,
    // The retry config if Deadlock Happened
    retry: {
      match: [/Deadlock/i],
      max: 5, // Maximum rety 3 times
      backoffBase: 5000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
    pool: {
      max: 150,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  production: {
    username: 'paveapiuser',
    password: 'azJDFAbCWAxssPZQZLq2De67L',
    database: 'pave_production',
    host: 'chaaat-serverless-v2-cluster-cluster.cluster-cagyeenebp0t.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: loggingEnabled ? (msg) => logger.info(msg) : false,
    // The retry config if Deadlock Happened
    retry: {
      match: [/Deadlock/i],
      max: 5, // Maximum rety 3 times
      backoffBase: 5000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
    pool: {
      max: 150,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
};
