class MainService {
  constructor() {
    this.config = require('../configs/config')(
      process.env.NODE_ENV || 'development',
    );
    this.helper = require('../helpers');
    this.models = require('../dealz_models');
    this.constants = require('../constants/dealz.constant.json');
    this.Sentry = require('@sentry/node');
    this.sequelize = require('sequelize');
    const { Op } = require('sequelize');
    this.Op = Op;
    this.stripe = require('stripe')(process.env.DEALZ_STRIPE_SECRET_KEY);
    this.matrixStripePriceID = [
      process.env.DEALZ_STARTER_PRICE,
      process.env.DEALZ_PRO_PRICE,
      process.env.DEALZ_BASIC_PRICE,
    ];
  }
}

// Directly export the class
module.exports = MainService;
