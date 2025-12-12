const fastify = require('fastify')({
  logger: true,
});

const logger = fastify.log.child({
  sql_log_app: 'api',
  process: 'sequelize',
});

const loggingEnabled = process.env.ENABLE_SQL_LOGS === 'true';

module.exports = {
  development: {
    username: process.env.DEV_USERNAME || 'pavewebmaster',
    password: process.env.DEV_PASSWORD || 'ZM3z8LvwwQW6pmEePrz7NRUv8',
    database: process.env.DEV_DATABASE || 'pave_development',
    host: process.env.DOCKER_MYSQL_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: loggingEnabled ? (msg) => logger.info(msg) : false,
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
    pool: {
      max: 150,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
};
