const config = require('../configs/config')(process.env.NODE_ENV);
const generalHelper = require('../helpers/general');
const dateHelper = require('../helpers/date');
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  date: {
    formatDateToSeconds: dateHelper.formatDateToSeconds,
    formatDateTime: dateHelper.formatDateTime,
    formatTimeAgo: dateHelper.formatTimeAgo,
  },
};
const databaseHelper = module.exports;

/**
 * Attach common fields to model definition
 * @param {object} fields
 * @param {object} DataTypes
 * @returns {*}
 */
databaseHelper.attachModelDefinition = (fields, DataTypes) => {
  const customFields = {
    created_by: { type: DataTypes.STRING },
    created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_by: { type: DataTypes.STRING },
    updated_date: { type: DataTypes.DATE },
  };
  customFields.created_date_seconds = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatDateToSeconds(this.created_date, true);
    },
  };
  customFields.created_date_time_ago = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatTimeAgo(this.created_date, true);
    },
  };
  customFields.updated_date_seconds = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatDateToSeconds(this.updated_date, true);
    },
  };
  customFields.updated_date_time_ago = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatTimeAgo(this.updated_date, true);
    },
  };
  fields = Object.assign(fields, customFields);
  return fields;
};

/**
 * Attach common fields to model definition without created_by and updated_by
 * @param {object} fields
 * @param {object} DataTypes
 * @returns {*}
 */
databaseHelper.attachNoCreatedByAndUpdatedByModelDefinition = (
  fields,
  DataTypes,
) => {
  const customFields = {
    created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_date: { type: DataTypes.DATE },
  };
  customFields.created_date_seconds = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatDateToSeconds(this.created_date, true);
    },
  };
  customFields.created_date_time_ago = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatTimeAgo(this.created_date, true);
    },
  };
  customFields.updated_date_seconds = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatDateToSeconds(this.updated_date, true);
    },
  };
  customFields.updated_date_time_ago = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatTimeAgo(this.updated_date, true);
    },
  };
  fields = Object.assign(fields, customFields);
  return fields;
};

/**
 * Generic data formatting function
 * @param {object|array} result
 * @returns {object|array}
 */
databaseHelper.formatData = (result) => {
  if (h.isEmpty(result)) return result;

  const processObject = (result) => {
    if (
      h.notEmpty(result) &&
      (Object.keys(result).length > 0 ||
        (h.notEmpty(result.dataValues) &&
          Object.keys(result.dataValues).length > 0))
    ) {
      const innerResult = h.notEmpty(result.dataValues)
        ? result.dataValues
        : result;
      /** =================================================================================================
       * formatting by object key
       *================================================================================================ */

      /** =================================================================================================
       * formatting by individual key
       *================================================================================================ */
      for (const key in innerResult) {
        if (
          h.notEmpty(innerResult[key]) &&
          (innerResult[key] instanceof Object ||
            typeof innerResult[key] === typeof Object)
        ) {
          innerResult[key] = processObject(innerResult[key]);
        }

        switch (key) {
          case 'featured_image_url':
          case 'profile_picture_url':
          case 'agency_logo_url':
          case 'attachment_url':
          case 'logo_url':
          case 'property_header_info_cover_picture_url':
            innerResult[key] = formatImageCdnUrl(innerResult[key]);
            break;
        }

        // Generic date field formatting
        if (key.indexOf('_date') > -1) {
          innerResult[key + '_raw'] = result[key];
          innerResult[key + '_seconds'] = h.date.formatDateToSeconds(
            result[key],
            true,
          );
          innerResult[key + '_time_ago'] = h.date.formatTimeAgo(
            result[key],
            true,
          );
          innerResult[key] = h.date.formatDateTime(result[key], true);
        }
      }
      if (h.notEmpty(result.dataValues)) result.dataValues = innerResult;
      else result = innerResult;
    }
    return result;
  };

  if (Object.keys(result).length > 0 && result) {
    // process array based data
    if (result instanceof Array || typeof result === typeof Array) {
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          result[i] = processObject(result[i]);
        }
      }
    }
    // process object based data
    else if (result instanceof Object || typeof result === typeof Object) {
      result = processObject(result);
    }
  }

  return result;
};

/**
 * Generic Sequelize transaction wrapper
 * @param {object} sequelize
 * @param {function} func
 * @returns {Promise<*>}
 */
databaseHelper.transaction = async (func) => {
  const funcName = 'databaseHelper.transaction';
  if (!func) throw new Error(`${funcName}: missing params sequelize / func`);
  const { sequelize } = require('../models');
  return sequelize.transaction(func);
};

/**
 * Generic function to append CDN URL to URLs with no https:// or http:// prefix
 * @param {string} image_url
 * @returns {string}
 */
function formatImageCdnUrl(image_url) {
  if (!image_url) return image_url;
  if (image_url.indexOf('https://') > -1 || image_url.indexOf('http://') > -1)
    return image_url;
  return `${config.cdnUrls[0]}/${image_url}`;
}

/**
 * Attach common fields to model definition without created_by and updated_by
 * @param {object} fields
 * @param {object} DataTypes
 * @returns {*}
 */
databaseHelper.attachNoCreatedByAndUpdatedByModelDefinition = (
  fields,
  DataTypes,
) => {
  const customFields = {
    created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_date: { type: DataTypes.DATE },
  };
  customFields.created_date_seconds = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatDateToSeconds(this.created_date, true);
    },
  };
  customFields.created_date_time_ago = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatTimeAgo(this.created_date, true);
    },
  };
  customFields.updated_date_seconds = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatDateToSeconds(this.updated_date, true);
    },
  };
  customFields.updated_date_time_ago = {
    type: DataTypes.VIRTUAL,
    get() {
      return h.date.formatTimeAgo(this.updated_date, true);
    },
  };
  fields = Object.assign(fields, customFields);
  return fields;
};
