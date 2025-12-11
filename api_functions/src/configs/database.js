module.exports = {
  development: {
    username: 'pavewebmaster',
    password: 'ZM3z8LvwwQW6pmEePrz7NRUv8',
    database: 'pave_development',
    host: 'docker.for.mac.host.internal',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  dealz_development: {
    username: 'pavewebmaster',
    password: 'ZM3z8LvwwQW6pmEePrz7NRUv8',
    database: 'dealz_management',
    host: 'docker.for.mac.host.internal',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'dealz_api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  staging: {
    username: 'admin',
    password: 'VFltTNKoPHRjtqAdgIOa',
    database: 'chaaat_staging',
    host: 'chaaat-rds-instance-stg.cmp9x7ku6wdq.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  dealz_staging: {
    username: 'admin',
    password: 'VFltTNKoPHRjtqAdgIOa',
    database: 'dealz_staging',
    host: 'chaaat-rds-instance-stg.cmp9x7ku6wdq.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  dealz_production: {
    username: 'admin',
    password: 'z1Ipj2MOjDSwHSXkojRP',
    database: 'dealz_production',
    host: 'chaaat-rds-instance-prd.cagyeenebp0t.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  booking: {
    username: 'admin',
    password: 'VFltTNKoPHRjtqAdgIOa',
    database: 'v2booking',
    host: 'chaaat-rds-instance-stg.cmp9x7ku6wdq.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
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
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
  production: {
    username: 'admin',
    password: 'z1Ipj2MOjDSwHSXkojRP',
    database: 'pave_production',
    host: 'chaaat-rds-instance-prd.cagyeenebp0t.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: (msg) =>
      console.info(
        JSON.stringify({
          sql_log_app: 'api_functions',
          process: 'sequelize',
          msg,
        }),
      ),
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    },
  },
};
