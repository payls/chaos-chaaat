const Redis = require('ioredis');
const Sentry = require('@sentry/node');
const h = require('../helpers');

class RedisDB {
  constructor() {
    this.client = null;
    let redisConfig = process.env.REDIS_URL;
    if (!redisConfig || redisConfig.trim() === '') {
      redisConfig = {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'host.docker.internal',
        password: process.env.REDIS_PASSWORD || null,
        db: process.env.REDIS_DB || 0,
      };
    }
    this.redisDBConfig = redisConfig;
    this._initializeCreateClient();
  }

  /**
   * Description
   * Initialize redis connection
   * @async
   * @method
   * @name _initializeCreateClient
   * @kind method
   * @memberof RedisDB
   * @returns {Promise<any>}
   */
  async _initializeCreateClient() {
    if (process.env.REDIS_CLUSTER_MODE === 'true') {
      this.client = new Redis.Cluster(
        [
          {
            host: process.env.REDIS_CLUSTER_HOST,
            port: process.env.REDIS_PORT || 6379,
          },
        ],
        {
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            tls: {},
          },
        },
      );
    } else {
      this.client = new Redis(this.redisDBConfig);
    }

    this.client.on('connect', async () => {
      try {
        await this.client.ping();
      } catch (err) {
        Sentry.captureException(err);
        console.error({ err }, 'Ping Error');
      }
      console.log(
        `Redis client connected to database ${process.env.REDIS_DB}.`,
      );
    });

    this.client.on('error', (err) => {
      Sentry.captureException(err);
      console.error({ err }, 'Redis client error');
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting');
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected.');
    });

    return this.client;
  }

  /**
   * Description
   * Set redis state data for a given id
   * @async
   * @method
   * @name setRecord
   * @kind method
   * @memberof RedisDB
   * @param {string} id
   * @param {object} data
   * @param {object} isCreate
   * @returns {Promise<any>}
   */
  async setRecord({ id, data, isCreate = false }) {
    try {
      const savedDataRecord = await this.getRecord(id);
      // If creating a new record or an existing record is found, save the new data
      if (h.cmpBool(isCreate, true) || h.notEmpty(savedDataRecord)) {
        return this.client.set(id, JSON.stringify(data));
      }
      return false;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * Description
   * Get state redis record
   * @async
   * @method
   * @name getRecord
   * @kind method
   * @memberof RedisDB
   * @param {string} id
   * @returns {Promise<any>}
   */
  async getRecord(id) {
    try {
      const stateData = await this.client.get(id);
      if (h.notEmpty(stateData)) {
        return JSON.parse(stateData);
      }
      return {};
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}

module.exports = RedisDB;
