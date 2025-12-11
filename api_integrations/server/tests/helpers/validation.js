const assert = require('chai').assert;
const h = require('../../helpers');
h.test.init();

describe('Unit Test for validation helper', function () {
  it('requiredParams: should throw error if one of params is empty', function () {
    try {
      h.validation.requiredParams('isObjectOrArray.test', {
        hello: { my: 'world' },
        test: { your: 'world' },
      });
    } catch (err) {
      assert.isNull(err);
    }
  });

  it('isObjectOrArray: should return true if an object or an array is passed', function () {
    try {
      h.validation.isObjectOrArray('isObjectOrArray.test', {
        hello: { my: 'world' },
        test: { your: 'world' },
      });
    } catch (err) {
      assert.isNull(err);
    }
  });
});
