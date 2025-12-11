class MainController {
  constructor() {
    this.config = require('../configs/config')(
      process.env.NODE_ENV || 'development',
    );
    this.helper = require('../helpers');
    this.models = require('../dealz_models');
    this.constants = require('../constants/dealz.constant.json');
    const services = require('../services');
    this.service = services();
    this.Sentry = require('@sentry/node');
    this.sequelize = require('sequelize');
    const { Op } = require('sequelize');
    this.Op = Op;
  }
}

// Directly export the class
module.exports = MainController;
