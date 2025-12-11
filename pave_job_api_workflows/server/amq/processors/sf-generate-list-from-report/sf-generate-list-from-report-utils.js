const jsforce = require('jsforce');
const Axios = require('axios');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const constants = require('../../../constants/constant.json');
const models = require('../../../models');

async function _sfAuthenticateViaSecrets ({ encryptionKeys, api_oauth_url, api_client_id, api_client_secret, grant_type = 'client_credentials' }) {
  try {
    const decrypted_client_id = cryptoHelper.decrypt({
      encryptionKey: encryptionKeys.encryption_key,
      encryptionIv: encryptionKeys.encryption_iv
    }, api_client_id);

    const decrypted_client_secret = cryptoHelper.decrypt({
      encryptionKey: encryptionKeys.encryption_key,
      encryptionIv: encryptionKeys.encryption_iv
    }, api_client_secret);

    const requestInfo = new URLSearchParams();

    requestInfo.append('grant_type', grant_type);
    requestInfo.append('client_id', decrypted_client_id);
    requestInfo.append('client_secret',decrypted_client_secret);

    

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const sfOauthResponse = await Axios.post(api_oauth_url, requestInfo, { headers })
    return sfOauthResponse?.data;
   } catch (err) {
    return null;
   }
}

function parseSFReport (report_data, map) {

  const columns = report_data.reportMetadata.detailColumns;
  
  const detailColumn = report_data.reportExtendedMetadata.detailColumnInfo;

  const data = report_data.factMap['T!T'].rows;

  return data.map(d => {
    return columns.reduce((pv, cv, i) => {
      pv[detailColumn[cv].label] = d.dataCells[i].label;
      return pv;
    }, {});
  });
}

/**
 * Get the mapped fields value from report
 * @async
 * @param {Object} sfReportData - Options object.
 * @returns {Object} [sfReportData] values
 * @returns {string?} [sfReportData.first_name]
 * @returns {string?} [sfReportData.last_name]
 * @returns {string?} [sfReportData.email]
 * @returns {string?} [sfReportData.mobile_number]
 * @returns {string?} [sfReportData.lead_source]
 */
/* sample map
[
  {
    label: 'First Name',
    field: 'first_name',
    mappedTo: '',
    required: false,
    defaultValue: '',
  }
]
*/
function extractDataFromReportColumn (sfReportData, map) {
  const {
    CONTACT_ID,
    LEAD_ID,
    FIRST_NAME,
    LAST_NAME,
    EMAIL,
    PHONE,
    MOBILE,
    LANGUAGE,
    LEAD_SOURCE,
    LEAD_SOURCE_LV1,
    LEADE_SOURCE_LV2,
    ENABLE_MARKETING,
    INTERESTED_PRODUCT,
    INTERESTED_CITY,
    TNC_DATE,
    COMMENTS
  } = constants.SF.REPORT_MAP;
  if (!map || !Array.isArray(map) || map.length < 1) {
    return {
      id: sfReportData[CONTACT_ID] || sfReportData[LEAD_ID],
      first_name: sfReportData[FIRST_NAME],
      last_name: sfReportData[LAST_NAME],
      email: sfReportData[EMAIL],
      mobile_number: isSFReportFieldNotEmpty(sfReportData[MOBILE]) ? sfReportData[MOBILE]
        : isSFReportFieldNotEmpty(sfReportData[PHONE]) ? sfReportData[PHONE]
        : null,
      language: sfReportData[LANGUAGE],
      lead_source: sfReportData[LEAD_SOURCE],
      lead_source_lv1: sfReportData[LEAD_SOURCE_LV1],
      lead_source_lv2: sfReportData[LEADE_SOURCE_LV2],
      enable_marketing: sfReportData[ENABLE_MARKETING],
      interested_product: sfReportData[INTERESTED_PRODUCT],
      interested_city: sfReportData[INTERESTED_CITY],
      tnc_date: sfReportData[TNC_DATE],
      comments: sfReportData[COMMENTS]
    }
  }

  const mappedValue =  map.reduce((pv, cv) => {
    if (cv.field && `${cv.field}`.trim() !== '') {
      pv[cv.field] = sfReportData[cv.mappedTo];
    }

    return pv;
  }, {});

  return mappedValue;
}

async function createReportInstance (opts = {}) {
  const { access_info, report_id } = opts;
  const { access_token, refresh_token, instance_url } = JSON.parse(access_info);

  const oauthParams = {
    clientId: config.directIntegrations.salesforce.clientId,
    clientSecret: config.directIntegrations.salesforce.clientSecret,
    redirectUri: config.directIntegrations.salesforce.redirectUri,
  };

  if (instance_url.includes('sandbox')) {
    oauthParams.loginUrl = 'https://test.salesforce.com';
  }

  const oauth2 = new jsforce.OAuth2(oauthParams);

  const connParams = {
    oauth2,
    instanceUrl: instance_url,
    accessToken: access_token,
    refreshToken: refresh_token,
  };

  if (instance_url.includes('sandbox')) {
    connParams.loginUrl = 'https://test.salesforce.com';
  }

  const conn = new jsforce.Connection(connParams);

  const refresh =  () => {
    return new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);
    
        resolve(results);
      });
    });
  }

  const generateReport = async (reportId) => {
    return new Promise((resolve, reject) => {
      var report = conn.analytics.report(reportId);
      report.executeAsync({ details: true }, function (err, instance) {
        if (err) { return reject(err); }
        resolve(instance);
      });
    });
  }

  await refresh();
  return await generateReport(report_id);
}

async function createReportInstanceV2 (opts = {}) {
  const { access_info, report_id, live_chat_settings = {}, encryptionKeys = {} } = opts;
  const api_oauth_url = live_chat_settings?.api_oauth_url;
  const api_client_id = live_chat_settings?.api_client_id;
  const api_client_secret = live_chat_settings?.api_client_secret;

  let conn;
  let authData;

  if (
    live_chat_settings
    && api_client_id
    && api_client_secret
    && api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({ encryptionKeys, api_oauth_url, api_client_id, api_client_secret, grant_type: 'client_credentials' });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.access_token
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } = JSON.parse(access_info);
    
    const oauthParams = {
      clientId: config.directIntegrations.salesforce.clientId,
      clientSecret: config.directIntegrations.salesforce.clientSecret,
      redirectUri: config.directIntegrations.salesforce.redirectUri,
    };

    if (instance_url.includes('sandbox')) {
      oauthParams.loginUrl = 'https://test.salesforce.com';
    }

    const oauth2 = new jsforce.OAuth2(oauthParams);
  
    const connParams = {
      oauth2,
      instanceUrl: instance_url,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  
    if (instance_url.includes('sandbox')) {
      connParams.loginUrl = 'https://test.salesforce.com';
    }

    conn = new jsforce.Connection(connParams);

    await (() => {
      return new Promise((resolve, reject) => {
        conn.oauth2.refreshToken(refresh_token, async (err, results) => {
          if (err) return reject(err);
      
          resolve(results);
        });
      });
    })();
  }

  const generateReport = async (reportId) => {
    return new Promise((resolve, reject) => {
      var report = conn.analytics.report(reportId);
      report.executeAsync({ details: true }, function (err, instance) {
        if (err) { return reject(err); }
        resolve(instance);
      });
    });
  }

  return await generateReport(report_id);
}

async function retrieveSFReportData (opts = {}) {
  const { access_info, report_id, instance_id } = opts;
  const { access_token, refresh_token, instance_url } = JSON.parse(access_info);

  const oauthParams = {
    clientId: config.directIntegrations.salesforce.clientId,
    clientSecret: config.directIntegrations.salesforce.clientSecret,
    redirectUri: config.directIntegrations.salesforce.redirectUri,
  };

  if (instance_url.includes('sandbox')) {
    oauthParams.loginUrl = 'https://test.salesforce.com';
  }

  const oauth2 = new jsforce.OAuth2(oauthParams);

  const connParams = {
    oauth2,
    instanceUrl: instance_url,
    accessToken: access_token,
    refreshToken: refresh_token,
  };

  if (instance_url.includes('sandbox')) {
    connParams.loginUrl = 'https://test.salesforce.com';
  }

  const conn = new jsforce.Connection(connParams);

  const refresh =  () => {
    return new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);
    
        resolve(results);
      });
    });
  }

  const retriveReportData = async (reportId, instanceId) => {
    return new Promise((resolve, reject) => {
      var report = conn.analytics.report(reportId);
      report.instance(instanceId).retrieve(function (err, result) {
        if (err) { return reject(err); }
        resolve(result);
      });
    })
  }

  try {
    await refresh();
  
    const reportDataRaw = await retriveReportData(report_id, instance_id);
  
    const parsedReport = parseSFReport(reportDataRaw);
  
    return parsedReport;
  } catch (err) {
    return [];
  }
}

async function retrieveSFReportDataV2 (opts = {}) {
  const { access_info, report_id, instance_id, live_chat_settings = {}, encryptionKeys = {} } = opts;
  const api_oauth_url = live_chat_settings?.api_oauth_url;
  const api_client_id = live_chat_settings?.api_client_id;
  const api_client_secret = live_chat_settings?.api_client_secret;

  let conn;
  let authData;

  if (
    live_chat_settings
    && api_client_id
    && api_client_secret
    && api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({ encryptionKeys, api_oauth_url, api_client_id, api_client_secret, grant_type: 'client_credentials' });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.access_token
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } = JSON.parse(access_info);
    
    const oauthParams = {
      clientId: config.directIntegrations.salesforce.clientId,
      clientSecret: config.directIntegrations.salesforce.clientSecret,
      redirectUri: config.directIntegrations.salesforce.redirectUri,
    };

    if (instance_url.includes('sandbox')) {
      oauthParams.loginUrl = 'https://test.salesforce.com';
    }

    const oauth2 = new jsforce.OAuth2(oauthParams);
  
    const connParams = {
      oauth2,
      instanceUrl: instance_url,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  
    if (instance_url.includes('sandbox')) {
      connParams.loginUrl = 'https://test.salesforce.com';
    }

    conn = new jsforce.Connection(connParams);

    await (() => {
      return new Promise((resolve, reject) => {
        conn.oauth2.refreshToken(refresh_token, async (err, results) => {
          if (err) return reject(err);
      
          resolve(results);
        });
      });
    })();
  }

  const retriveReportData = async (reportId, instanceId) => {
    return new Promise((resolve, reject) => {
      var report = conn.analytics.report(reportId);
      report.instance(instanceId).retrieve(function (err, result) {
        if (err) { return reject(err); }
        resolve(result);
      });
    })
  }

  try {
    const reportDataRaw = await retriveReportData(report_id, instance_id);
  
    const parsedReport = parseSFReport(reportDataRaw);
  
    return parsedReport;
  } catch (err) {
    return [];
  }
}

async function upsertContactFromSfAndAddToList ({
  agency_id,
  agency_user_fk,
  contact_info,
  contact_list_id
}) {
  const {
    id,
    first_name,
    last_name,
    email,
    mobile_number,
    language,
    interested_product,
    interested_city,
    lead_source,
    lead_source_lv1,
    lead_source_lv2,
    enable_marketing,
    tnc_date,
    comments
  } = contact_info;
  const contactCtl = require('../../../controllers/contact').makeContactController(models);
  const contactSourceCtl = require('../../../controllers/contactSource').makeContactSourceController(models);
  const contactSfData = require('../../../controllers/contactSalesforceData').makeController(models);
  const contactListUserCtl = require('../../../controllers/contactListUser').makeController(models);

  // check if contact exists
  let contact_id;
  let contact_source_id;
  let contact_salesforce_id;
  let contact_list_user_id;

  // if has id, update else create

  // const hasContact = await contactCtl.findOne({
  //   agency_fk: agency_id,
  //   first_name,
  //   last_name,
  //   email
  // });

  // contact_id = hasContact?.contact_id;

  if (contact_id) {
    const hasContactSource = await contactSourceCtl.findOne({
      contact_fk: contact_id
    });

    contact_source_id = hasContactSource?.contact_source_id;

    const hasContactSfData = await contactSfData.findOne({
      agency_fk: agency_id,
      contact_fk: contact_id
    });

    contact_salesforce_id = hasContactSfData?.contact_salesforce_data_id;

    const hasContactListUser = await contactListUserCtl.findOne({
      contact_list_id,
      contact_id
    });

    contact_list_user_id = hasContactListUser?.contact_list_user_id;
  }

  // all updates and creation of data in one transaction
  const transaction = await models.sequelize.transaction();
  try {
    const contactRecord = {
      first_name,
      last_name,
      mobile_number,
      email,
      lead_source,
      agency_fk: agency_id,
      status: constants.CONTACT.STATUS.ACTIVE,
      agency_user_fk
    }
    if (!contact_id) {
      contact_id = await contactCtl.create(contactRecord, { transaction });
    } else {
      await contactCtl.update(contact_id, contactRecord, { transaction });
    }
  
    if (!contact_source_id) {
      contact_source_id = await contactSourceCtl.create({
        contact_fk: contact_id,
        source_type: 'SALESFORCE'
      }, { transaction });
    }

    const consentDate = new Date(tnc_date);

    const tncAgreed = consentDate.toString() !== 'Invalid Date' ? true : false;
    const tncValidAgreedDate = consentDate.toString() !== 'Invalid Date' ? consentDate : null;
  
    const contactSfRecord = {
      agency_fk: agency_id,
      contact_fk: contact_id,
      first_name,
      last_name,
      email,
      mobile: mobile_number,
      language,
      interested_product,
      interested_city,
      lead_source,
      lead_source_lv1,
      lead_source_lv2,
      enable_marketing: enable_marketing && enable_marketing.toLowerCase() === 'true' ? true : false,
      tnc_agree: tncAgreed,
      tnc_date: tncValidAgreedDate
    };

    if (!contact_salesforce_id) {
      contact_salesforce_id = await contactSfData.create(contactSfRecord, { transaction });
    } else {
      await contactSfData.update(contact_salesforce_id, contactSfRecord, null, { transaction });
    }

    if (!contact_list_user_id) {
      await contactListUserCtl.create({
        contact_id,
        contact_list_id,
        import_type: 'SALESFORCE_REPORT'
      }, { transaction });
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function updateContactListStatus (contact_list_id, status) {
  const contactListCtl = require('../../../controllers/contactList').makeController(models);

  await contactListCtl.update(contact_list_id, {
    status
  });
}

async function updateContactList (contact_list_id, update = {}) {
  const contactListCtl = require('../../../controllers/contactList').makeController(models);

  await contactListCtl.update(contact_list_id, update);
}

async function getContactListInfo (contact_list_id) {
  const contactListCtl = require('../../../controllers/contactList').makeController(models);

  const contact_list = await contactListCtl.findOne({ contact_list_id });

  return contact_list;
}

function isSFReportFieldNotEmpty (text) {
  if (!text) return false;

  if (text.trim() === '') return false;

  if (text.trim() === '-') return false;

  return true;
}

async function sleep(time = 1000) {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, time)
  });
}

module.exports.createReportInstance = createReportInstance;
module.exports.createReportInstanceV2 = createReportInstanceV2;
module.exports.retrieveSFReportData = retrieveSFReportData;
module.exports.retrieveSFReportDataV2 = retrieveSFReportDataV2;
module.exports.extractDataFromReportColumn = extractDataFromReportColumn;
module.exports.upsertContactFromSfAndAddToList = upsertContactFromSfAndAddToList;
module.exports.updateContactListStatus = updateContactListStatus;
module.exports.updateContactList = updateContactList;
module.exports.getContactListInfo = getContactListInfo;
module.exports.sleep = sleep;
