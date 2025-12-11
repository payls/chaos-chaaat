const testHelper = module.exports;
const generalHelper = require('../helpers/general');

/**
 * Initialize test
 */
testHelper.init = () => {
  require('dotenv').config({ path: '.env' });
};

/**
 * Returns whether current execution instance is test environment or not
 * @returns {boolean}
 */
testHelper.isTest = () => {
  return (
    generalHelper.notEmpty(process.env.IS_TEST) &&
    parseInt(process.env.IS_TEST) === 1
  );
};
