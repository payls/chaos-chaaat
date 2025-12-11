const generalHelper = require('../helpers/general');
const validationHelper = module.exports;

/**
 * Validate function required paramters
 * @param {string} inFuncName
 * @param {object} params
 */
validationHelper.requiredParams = (inFuncName, params) => {
  const funcName = 'validationHelper.requiredParams';
  if (!inFuncName) throw new Error(`${funcName}: missing param inFuncName`);
  if (!params) throw new Error(`${funcName}: missing param params`);
  if (typeof params !== 'object')
    throw new Error(`${funcName}: invalid param params`);
  for (let i = 0; i < Object.keys(params).length; i++) {
    const key = Object.keys(params)[i];
    if (!key || !params[key] || params[key].length === 0)
      throw new Error(`${inFuncName}: missing param ${key}`);
  }
};

/**
 * Validate if constant value is valid
 * @param {string} inFuncName
 * @param {object} constants
 * @param {object} params
 */
validationHelper.validateConstantValue = (inFuncName, constants, params) => {
  const funcName = 'validationHelper.validateConstantValue';
  validationHelper.requiredParams(funcName, { inFuncName, constants, params });
  if (typeof constants !== 'object')
    throw new Error(`${funcName}: invalid param params. funcName: ${funcName}`);
  if (typeof params !== 'object')
    throw new Error(`${funcName}: invalid param params. funcName: ${funcName}`);
  if (Object.keys(constants).length !== Object.keys(params).length)
    throw new Error(
      `${funcName}: number of constants vs params doesn't match. funcName: ${funcName}`,
    );
  for (let i = 0; i < Object.keys(constants).length; i++) {
    const key = Object.keys(constants)[i];
    // Only proceed with check if param has value
    if (params[key]) {
      if (!key || !constants[key])
        throw new Error(`${inFuncName}: invalid param ${key}`);
      let valueFound = false;
      for (const constantKey in constants[key]) {
        if (generalHelper.cmpStr(constants[key][constantKey], params[key]))
          valueFound = true;
      }
      if (!valueFound) throw new Error(`${inFuncName}: invalid param ${key}`);
    }
  }
};

/**
 * Validate if paramter is an object or an array
 * @param {string} inFuncName
 * @param {object} params
 */
validationHelper.isObjectOrArray = (inFuncName, params) => {
  const funcName = 'validationHelper.isObjectOrArray';
  validationHelper.requiredParams(funcName, { inFuncName, params });
  if (typeof params !== 'object')
    throw new Error(`${funcName}: invalid param params`);
  for (let i = 0; i < Object.keys(params).length; i++) {
    const key = Object.keys(params)[i];
    if (
      !key ||
      !params[key] ||
      params[key].length === 0 ||
      (typeof params[key] !== 'object' && !Array.isArray(params[key]))
    )
      throw new Error(
        `${inFuncName}: param ${key} is not an object or an array`,
      );
  }
};

/**
 * Validate if only one of the parameters is not null(for contactPropertyValuesTable)
 * @param inFuncName
 * @param {{
 *   attribute_value_int?: double,
 *   attribute_value_string?: text,
 *   attribute_value_date?: date
 * }}params
 */
validationHelper.onlyOneValueIsNotNull = (inFuncName, params) => {
  const funcName = 'validationHelper.onlyOneValueIsNotNull';
  validationHelper.requiredParams(funcName, { inFuncName, params });

  let countOfNonNullParams = 0;
  for (let i = 0; i < Object.keys(params).length; i++) {
    const key = Object.keys(params)[i];
    if (generalHelper.notEmpty(params[key])) {
      countOfNonNullParams++;
    }
  }
  if (countOfNonNullParams !== 1) {
    if (countOfNonNullParams === 0) {
      throw new Error(
        `${inFuncName}: all of the required params are null, One needs to be non-null`,
      );
    } else if (countOfNonNullParams > 1) {
      throw new Error(
        `${inFuncName}: More than one of the required params are non-null, Only one needs to be non-null`,
      );
    }
  }
};
