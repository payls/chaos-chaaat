const testHelper = module.exports;

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
  return process.env.IS_TEST && process.env.IS_TEST === 1;
};
