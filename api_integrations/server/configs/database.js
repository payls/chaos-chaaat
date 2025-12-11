module.exports = {
  development: {
    username: process.env.DEV_USERNAME || 'pavewebmaster',
    password: process.env.DEV_PASSWORD || 'ZM3z8LvwwQW6pmEePrz7NRUv8',
    database: process.env.DEV_DATABASE || 'pave_development',
    host: process.env.DOCKER_MYSQL_HOST || '127.0.0.1',
    dialect: 'mysql',
    pool: {
      max: 100,
      min: 0,
      // idle: 200000,
      // // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
      // acquire: 1000000,
    },
  },
  staging: {
    username: 'paveapiuser',
    password: 'w4roTTMqrWcWEbJGYmsre8Ft4',
    database: 'pave_staging',
    host: 'pave-stg-api-db1.cmp9x7ku6wdq.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    pool: {
      max: 100,
      min: 0,
      // idle: 200000,
      // // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
      // acquire: 1000000,
    },
  },
  qa: {
    username: 'paveapiuser',
    password: 'FgbvtytewEiygG3AdxoauwzPs',
    database: 'pave_qa',
    host: 'pave-qa-api-db1.chjmbjtizziw.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    pool: {
      max: 100,
      min: 0,
      // idle: 200000,
      // // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
      // acquire: 1000000,
    },
  },
  production: {
    username: 'paveapiuser',
    password: 'azJDFAbCWAxssPZQZLq2De67L',
    database: 'pave_production',
    host: 'pave-prd-api-db1.cagyeenebp0t.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    // pool: {
    //   max: 100,
    //   min: 0,
    //   // idle: 200000,
    //   // // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
    //   // acquire: 1000000,
    // },
  },
};
