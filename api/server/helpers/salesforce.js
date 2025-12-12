const Sentry = require('@sentry/node');
const constant = require('../constants/constant.json');
const generalHelper = require('../helpers/general');
const cryptoHelper = require('../helpers/cryptoHelper');
const Axios = require('axios');
const BPromise = require('bluebird');
const jsforce = require('jsforce');

const config = require('../configs/config')(process.env.NODE_ENV);

async function _sfAuthenticateViaSecrets({
  encryptionKeys,
  api_oauth_url,
  api_client_id,
  api_client_secret,
  grant_type = 'client_credentials',
}) {
  try {
    const decrypted_client_id = cryptoHelper.decrypt(
      {
        encryptionKey: encryptionKeys.encryption_key,
        encryptionIv: encryptionKeys.encryption_iv,
      },
      api_client_id,
    );

    const decrypted_client_secret = cryptoHelper.decrypt(
      {
        encryptionKey: encryptionKeys.encryption_key,
        encryptionIv: encryptionKeys.encryption_iv,
      },
      api_client_secret,
    );

    const data = JSON.stringify({
      grant_type,
      client_id: decrypted_client_id,
      client_secret: decrypted_client_secret,
    });

    const requestInfo = new URLSearchParams();

    requestInfo.append('grant_type', grant_type);
    requestInfo.append('client_id', decrypted_client_id);
    requestInfo.append('client_secret', decrypted_client_secret);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const sfOauthResponse = await Axios.post(api_oauth_url, requestInfo, {
      headers,
    });
    return sfOauthResponse?.data;
  } catch (err) {
    Sentry.captureException(err);
    return null;
  }
}

async function sendSalesforceContactNote(req, agency_id, payload) {
  /*
  sample payload
  {
      ParentId: Id,
      Title: 'Pave - Contact updated',
      Body: 'Contact Successfully updated on Pave',
    }
  */
  const result = await req.rabbitmq.pubSfAdhocProcess({
    data: {
      agency_id,
      payload,
    },
    consumerType: constant.AMQ.CONSUMER_TYPES.SF_SEND_CONTACT_NOTE,
  });

  req.log.info({
    message: 'Queuing salesforce contact note',
    data: {
      agency_id,
      notes: payload,
    },
    success: result,
  });
}

function sanitizeHTML(htmlContent) {
  // Encode special characters to prevent XSS attacks
  return htmlContent.replace(/<[^>]*>/g, '\n');
}

function sanitizeHTML2(htmlContent) {
  // Encode special characters to prevent XSS attacks
  return htmlContent.replace(/<.*?\n/g, '');
}

async function transmitMessage({
  liveChatSettings,
  contactSalesforceData,
  agencyOauth,
  contact,
  contact_source,
  currentAgencyUser,
  full_message_body,
  messageType,
  platform,
  encryptionKeys = {},
}) {
  const salesforceEnabled = generalHelper.cmpStr(platform, 'whatsapp')
    ? liveChatSettings.dataValues.whatsapp_salesforce_enabled
    : liveChatSettings.dataValues.line_salesforce_enabled;
  const salesforceObject =
    liveChatSettings.dataValues.salesforce_transmission_type;
  const transmitChat =
    liveChatSettings.dataValues.salesforce_chat_logs_transmission_enabled;
  const commentField =
    liveChatSettings.dataValues.salesforce_chat_logs_transmission_field;
  const whatsappEnabled =
    liveChatSettings.dataValues.whatsapp_salesforce_enabled;
  const lineEnabled = liveChatSettings.dataValues.line_salesforce_enabled;
  const hasOauth = !!(
    generalHelper.notEmpty(liveChatSettings.dataValues.api_oauth_url) &&
    generalHelper.notEmpty(liveChatSettings.dataValues.api_client_id) &&
    generalHelper.notEmpty(liveChatSettings.dataValues.api_client_secret)
  );
  const addSalesforceID = liveChatSettings.dataValues.add_salesforce_id;
  const tec_agencies = [
    '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
    'cf0c1702-23f7-4b0a-9e75-c87bc4c580bd',
    'fcb9edcc-20b3-4103-85e3-dbc50907ae5b',
  ];

  let portalMessage;
  let message;
  if (generalHelper.cmpStr(messageType, 'text_frompave')) {
    portalMessage = full_message_body.split('</div>\n');
    message = generalHelper.unescapeData(portalMessage[1]);
  }

  if (
    [
      'image_frompave',
      'video_frompave',
      'file_frompave',
      'audio_frompave',
    ].includes(messageType)
  ) {
    portalMessage = full_message_body.split(' ');
    message = generalHelper.unescapeData(portalMessage[0]);
  }

  if (generalHelper.cmpStr(messageType, 'template')) {
    if (full_message_body.includes('test-class')) {
      const portalMessage = full_message_body.split('</div>\n');
      message = generalHelper.unescapeData(portalMessage[1]);
    } else {
      message = generalHelper.unescapeData(full_message_body);
      message = generalHelper.unescapeData(message);
    }
  }

  if (
    ((generalHelper.cmpStr(platform, 'whatsapp') && whatsappEnabled) ||
      (generalHelper.cmpStr(platform, 'line') && lineEnabled)) &&
    generalHelper.notEmpty(contact_source) &&
    generalHelper.cmpBool(salesforceEnabled, true) &&
    generalHelper.cmpBool(transmitChat, true) &&
    generalHelper.notEmpty(commentField)
  ) {
    console.log('can transmit message');
    const updateData = {};
    updateData[
      commentField
    ] = `${currentAgencyUser.user.first_name} ${currentAgencyUser.user.last_name}: ${message}`;
    if (
      (generalHelper.cmpBool(hasOauth, true) ||
        generalHelper.notEmpty(liveChatSettings.dataValues.api_update_token)) &&
      generalHelper.notEmpty(liveChatSettings.dataValues.api_update_url)
    ) {
      console.log('custom transmit message');
      let token;
      if (
        generalHelper.isEmpty(liveChatSettings.dataValues.api_update_token) &&
        hasOauth
      ) {
        const decrypted_client_id = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_client_id,
        );

        const decrypted_client_secret = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_client_secret,
        );

        const requestInfo = new URLSearchParams();

        requestInfo.append('grant_type', 'client_credentials');
        requestInfo.append('client_id', decrypted_client_id);
        requestInfo.append('client_secret', decrypted_client_secret);

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };

        const sfOauthResponse = await Axios.post(
          liveChatSettings.dataValues.api_oauth_url,
          requestInfo,
          {
            headers,
          },
        );
        token = sfOauthResponse.data.access_token;
      } else {
        const decrypted_api_update_token = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_update_token,
        );

        token = decrypted_api_update_token;
      }
      let update_url = `${liveChatSettings.dataValues.api_update_url}`;
      update_url = generalHelper.cmpBool(addSalesforceID, true)
        ? `${update_url}/${contact_source.source_contact_id}`
        : update_url;

      const field_configurations = JSON.parse(
        liveChatSettings.dataValues.field_configuration,
      );
      const {
        first_name,
        last_name,
        email,
        language,
        interested_product,
        interested_city,
        mobile,
        enable_marketing,
        lead_source,
        lead_source_lv1,
        lead_source_lv2,
        tnc_date,
      } = contactSalesforceData;
      const endpoint_values = {
        first_name: first_name,
        last_name: last_name,
        email_address: email,
        product: interested_product,
        city: interested_city,
        language: language,
        phone: mobile,
        marketing: enable_marketing,
        lead_source: lead_source,
        lead_channel: lead_source_lv1,
        origin: lead_source_lv2,
        consent_date: tnc_date,
      };
      console.log(endpoint_values);
      const updateData = {};
      field_configurations.forEach((configuration) => {
        if (generalHelper.cmpBool(configuration.required, true)) {
          if (configuration.field in endpoint_values) {
            updateData[configuration.mappedTo] =
              endpoint_values[configuration.field];
          } else {
            if (generalHelper.cmpStr(configuration.field, 'comments')) {
              updateData[configuration.mappedTo] = `${
                currentAgencyUser.user.first_name
              } ${
                currentAgencyUser.user.last_name
              }: ${generalHelper.unescapeData(message)}`;
            }
          }
        }
      });
      const sfConfig = {
        method: 'put',
        url: update_url,
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json',
        },
        data: updateData,
      };
      const sfResponse = await Axios(sfConfig)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          Sentry.captureException(error);
          return error;
        });
      console.log(sfResponse);
    } else {
      console.log('using standard setup');
      agencyOauth =
        agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;
      if (!agencyOauth) {
        // finish execution here
        console.log({
          message: `No OAuth credentials`,
          processor: 'waba-process-send-message-from-agent',
          agency_id: currentAgencyUser.agency.agency_id,
        });
      } else {
        const { access_token, refresh_token, instance_url } = JSON.parse(
          agencyOauth.access_info,
        );

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

        const creds = await new BPromise((resolve, reject) => {
          conn.oauth2.refreshToken(refresh_token, async (err, results) => {
            if (err) {
              console.log({
                message: `Invalid credentials`,
                agency_id: currentAgencyUser.agency.agency_id,
              });

              return resolve(null);
            }
            resolve(results);
          });
        });

        if (creds) {
          const sfContact = await new BPromise((resolve, reject) => {
            conn
              .sobject(salesforceObject)
              .find(
                // conditions in JSON object
                {
                  Id: contact_source.source_contact_id,
                },
              )
              .execute((err, contact) => {
                if (err) {
                  // log error
                  console.log({
                    err,
                    message: `Unable to fetch Contact`,
                    agency_id: currentAgencyUser.agency.agency_id,
                  });
                  resolve([]);
                }
                resolve(contact);
              });
          });
          if (sfContact && !generalHelper.cmpInt(sfContact.length, 0)) {
            const sfContactCommentUpdate = await new BPromise(
              (resolve, reject) => {
                const comment = sfContact[0][commentField];
                const toRecordComment =
                  comment +
                  `\n ${currentAgencyUser.user.first_name} ${
                    currentAgencyUser.user.last_name
                  }: ${generalHelper.unescapeData(message)}`;
                const commentUpdate = {
                  Id: contact_source.source_contact_id,
                };
                commentUpdate[commentField] = toRecordComment;
                conn
                  .sobject(salesforceObject)
                  .update(commentUpdate, function (err, ret) {
                    if (err || !ret.success) {
                      console.log('comment error', err);
                      resolve([]);
                    }
                    resolve(ret);
                  });
              },
            );
            console.log(sfContactCommentUpdate);
          }
        }
      }
    }
  }
}

async function updateSalesforceRecord(
  liveChatSettings,
  contactSalesforceData,
  agencyOauth,
  contactSource,
  encryptionKeys = {},
) {
  if (generalHelper.isEmpty(contactSalesforceData.lead_source_lv1)) {
    return false;
  }
  const platform = contactSalesforceData.lead_source_lv1;

  const salesforceEnabled = generalHelper.cmpStr(platform, 'WhatsApp')
    ? liveChatSettings.whatsapp_salesforce_enabled
    : generalHelper.cmpStr(platform, 'Live Chat')
    ? liveChatSettings.salesforce_enabled
    : liveChatSettings.line_salesforce_enabled;

  const hasOauth = !!(
    generalHelper.notEmpty(liveChatSettings.api_oauth_url) &&
    generalHelper.notEmpty(liveChatSettings.api_client_id) &&
    generalHelper.notEmpty(liveChatSettings.api_client_secret)
  );
  const addSalesforceID = liveChatSettings.add_salesforce_id;

  const {
    first_name,
    last_name,
    email,
    language,
    interested_product,
    interested_city,
    mobile,
    enable_marketing,
    lead_source,
    lead_source_lv1,
    lead_source_lv2,
    tnc_date,
  } = contactSalesforceData;
  const endpoint_values = {
    first_name: first_name,
    last_name: last_name,
    email_address: email,
    product: interested_product,
    city: interested_city,
    language: language,
    phone: mobile,
    marketing: enable_marketing,
    lead_source: lead_source,
    lead_channel: lead_source_lv1,
    origin: lead_source_lv2,
    consent_date: tnc_date,
  };
  const field_configurations = JSON.parse(liveChatSettings.field_configuration);
  const updateData = {};
  field_configurations.forEach((configuration) => {
    if (generalHelper.cmpBool(configuration.required, true)) {
      if (configuration.field in endpoint_values) {
        updateData[configuration.mappedTo] =
          endpoint_values[configuration.field];
      }
    }
  });

  if (generalHelper.notEmpty(contactSource) && salesforceEnabled) {
    if (
      (generalHelper.cmpBool(hasOauth, true) ||
        generalHelper.notEmpty(liveChatSettings.dataValues.api_update_token)) &&
      generalHelper.notEmpty(liveChatSettings.dataValues.api_update_url)
    ) {
      let token;
      if (
        generalHelper.isEmpty(liveChatSettings.api_update_token) &&
        hasOauth
      ) {
        const decrypted_client_id = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_client_id,
        );

        const decrypted_client_secret = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_client_secret,
        );

        const requestInfo = new URLSearchParams();

        requestInfo.append('grant_type', 'client_credentials');
        requestInfo.append('client_id', decrypted_client_id);
        requestInfo.append('client_secret', decrypted_client_secret);

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };

        const sfOauthResponse = await Axios.post(
          liveChatSettings.dataValues.api_oauth_url,
          requestInfo,
          {
            headers,
          },
        );
        token = sfOauthResponse.data.access_token;
      } else {
        const decrypted_api_update_token = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_update_token,
        );
        token = decrypted_api_update_token;
      }
      let update_url = `${liveChatSettings.dataValues.api_update_url}`;
      update_url = generalHelper.cmpBool(addSalesforceID, true)
        ? `${update_url}/${contactSource.source_contact_id}`
        : update_url;

      const sfConfig = {
        method: 'put',
        url: update_url,
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json',
        },
        data: updateData,
      };
      const sfResponse = await Axios(sfConfig)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          Sentry.captureException(error);
          return error;
        });
      console.log(sfResponse);
    } else {
      const salesforceObject = liveChatSettings.salesforce_transmission_type;
      agencyOauth =
        agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;
      if (!agencyOauth) {
        // finish execution here
        console.log({
          message: `No OAuth credentials`,
          processor: 'update contact salesforce',
          agency_id: liveChatSettings.agency_fk,
        });
      } else {
        const { access_token, refresh_token, instance_url } = JSON.parse(
          agencyOauth.access_info,
        );

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

        const creds = await new BPromise((resolve, reject) => {
          conn.oauth2.refreshToken(refresh_token, async (err, results) => {
            if (err) {
              console.log({
                message: `Invalid credentials`,
                processor: 'update contact salesforce',
                agency_id: liveChatSettings.agency_fk,
              });

              return resolve(null);
            }
            resolve(results);
          });
        });

        if (creds) {
          const sfContact = await new BPromise((resolve, reject) => {
            conn
              .sobject(salesforceObject)
              .find(
                // conditions in JSON object
                {
                  Id: contactSource.source_contact_id,
                },
              )
              .execute((err, contact) => {
                if (err) {
                  // log error
                  console.log({
                    err,
                    message: `Unable to fetch Contact`,
                    processor: 'update contact salesforce',
                    agency_id: liveChatSettings.agency_fk,
                  });
                  resolve([]);
                }
                resolve(contact);
              });
          });
          if (sfContact && !generalHelper.cmpInt(sfContact.length, 0)) {
            const sfContactUpdate = await new BPromise((resolve, reject) => {
              conn
                .sobject(salesforceObject)
                .update(updateData, function (err, ret) {
                  if (err || !ret.success) {
                    console.log('comment error', err);
                    resolve([]);
                  }
                  resolve(ret);
                });
            });
            console.log(sfContactUpdate);
          }
        }
      }
    }
  }
}

function parseSFReport(report_data) {
  const columns = report_data.reportMetadata.detailColumns;

  const detailColumn = report_data.reportExtendedMetadata.detailColumnInfo;

  const data = report_data.factMap['T!T'].rows;

  return data.map((d) => {
    return columns.reduce((pv, cv, i) => {
      pv[detailColumn[cv].label] = d.dataCells[i].label;
      return pv;
    }, {});
  });
}

/**
 * Retrieves a Salesforce OAuth2 connection using provided access information.
 * It also automatically refresh the connection
 * @async
 * @param {Object} options - Options object.
 * @param {string} [options.access_info='{}'] - JSON string containing access token, refresh token, and instance URL.
 * @returns {Promise<jsforce.Connection>} A Promise that resolves to a Salesforce connection object.
 */
async function getSfOauth2Conn({ access_info = '{}' }) {
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

  // await sfConnectionRefresh(conn, { refresh_token });

  return conn;
}

/**
 * Retrieves a Salesforce OAuth2 connection using provided access information.
 * It also automatically refresh the connection
 * @async
 * @param {jsforce.Connection} conn - Options object.
 * @param {Object} options - Options object.
 * @param {string} [options.access_info='{}'] - JSON string containing access token, refresh token, and instance URL.
 * @returns {Promise<Array<Object>>} A Promise that resolves to a Salesforce connection object.
 */
async function retrieveSfReports(opts = {}) {
  const { access_info } = opts;
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

  const refresh = () => {
    return new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);

        resolve(results);
      });
    });
  };

  const getReportMetaData = (reportId) => {
    return new Promise((resolve, reject) => {
      conn
        .sobject('Report')
        .retrieve(
          reportId,
          'Name, Description, CreatedById, CreatedDate, FolderName',
          (err, report) => {
            if (err) {
              return reject(err);
            }
            // Retrieve the name of the creator
            conn
              .sobject('User')
              .retrieve(report.CreatedById, 'Name', (err, user) => {
                if (err) {
                  return reject(err);
                }

                // Append the creator's name to the report object
                report.CreatedByName = user.Name;
                resolve(report);
              });
          },
        );
    });
  };

  const getReportList = () => {
    return new Promise((resolve, reject) => {
      conn.analytics.reports(function (err, reports) {
        if (err) {
          return reject(err);
        }
        resolve(reports);
      });
    });
  };

  await refresh();
  const reportList = await getReportList();
  const reportListWithInfo = await Promise.all(
    reportList.map((report) => getReportMetaData(report.id)),
  );

  return reportListWithInfo;
}

async function retrieveSFReportData(opts = {}) {
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

  const refresh = () => {
    return new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);

        resolve(results);
      });
    });
  };

  const generateReport = async (reportId) => {
    return new Promise((resolve, reject) => {
      const report = conn.analytics.report(reportId);
      report.executeAsync({ details: true }, function (err, instance) {
        if (err) {
          return reject(err);
        }
        resolve(instance);
      });
    });
  };

  const retriveReportData = async (reportId, instanceId) => {
    return new Promise((resolve, reject) => {
      const report = conn.analytics.report(reportId);
      report.instance(instanceId).retrieve(function (err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  };

  await refresh();

  const newReportInstance = await generateReport(report_id);

  // set a quick timeout
  await new Promise((resolve) => {
    setTimeout(() => {
      return resolve();
    }, 1000);
  });

  const reportDataRaw = await retriveReportData(
    report_id,
    newReportInstance.id,
  );

  const parsedReport = parseSFReport(reportDataRaw);

  return parsedReport;
}

async function checkAndCreateReportInstance(opts = {}) {
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

  const refresh = () => {
    return new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);

        resolve(results);
      });
    });
  };

  const generateReport = async (reportId) => {
    return new Promise((resolve, reject) => {
      const report = conn.analytics.report(reportId);
      report.executeAsync({ details: true }, function (err, instance) {
        if (err) {
          return reject(err);
        }
        resolve(instance);
      });
    });
  };

  await refresh();
  const reportInstance = await generateReport(report_id);

  return reportInstance;
}

async function retrieveSfReportsV2(opts = {}) {
  const { access_info, live_chat_settings = {}, encryptionKeys = {} } = opts;

  const api_oauth_url = live_chat_settings?.api_oauth_url;
  const api_client_id = live_chat_settings?.api_client_id;
  const api_client_secret = live_chat_settings?.api_client_secret;

  let conn;
  let authData;

  if (
    live_chat_settings &&
    api_client_id &&
    api_client_secret &&
    api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({
      encryptionKeys,
      api_oauth_url,
      api_client_id,
      api_client_secret,
      grant_type: 'client_credentials',
    });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.access_token,
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } =
      JSON.parse(access_info);

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

  const getReportMetaData = (reportId) => {
    return new Promise((resolve, reject) => {
      conn
        .sobject('Report')
        .retrieve(
          reportId,
          'Name, Description, CreatedById, CreatedDate, FolderName',
          (err, report) => {
            if (err) {
              return reject(err);
            }
            // Retrieve the name of the creator
            conn
              .sobject('User')
              .retrieve(report.CreatedById, 'Name', (err, user) => {
                if (err) {
                  return reject(err);
                }

                // Append the creator's name to the report object
                report.CreatedByName = user.Name;
                resolve(report);
              });
          },
        );
    });
  };

  const getReportList = () => {
    return new Promise((resolve, reject) => {
      conn.analytics.reports(function (err, reports) {
        if (err) {
          return reject(err);
        }
        resolve(reports);
      });
    });
  };

  // const contactList = await (() => {
  //   return new Promise((res, rej) => {
  //     conn.sobject("Lead").find().execute(function(err, result) {
  //       if (err) { return rej(err) }
  //       // ...
  //       res(result);
  //     });
  //   })
  // })();

  const reportList = await getReportList();
  const reportListWithInfo = await Promise.all(
    reportList.map((report) => getReportMetaData(report.id)),
  );

  return reportListWithInfo;
}

async function retrieveSFReportDataV2(opts = {}) {
  const {
    access_info,
    live_chat_settings = {},
    encryptionKeys = {},
    report_id,
  } = opts;

  const api_oauth_url = live_chat_settings?.api_oauth_url;
  const api_client_id = live_chat_settings?.api_client_id;
  const api_client_secret = live_chat_settings?.api_client_secret;

  let conn;
  let authData;

  if (
    live_chat_settings &&
    api_client_id &&
    api_client_secret &&
    api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({
      encryptionKeys,
      api_oauth_url,
      api_client_id,
      api_client_secret,
      grant_type: 'client_credentials',
    });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.accessToken,
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } =
      JSON.parse(access_info);

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
      const report = conn.analytics.report(reportId);
      report.executeAsync({ details: true }, function (err, instance) {
        if (err) {
          return reject(err);
        }
        resolve(instance);
      });
    });
  };

  const retriveReportData = async (reportId, instanceId) => {
    return new Promise((resolve, reject) => {
      const report = conn.analytics.report(reportId);
      report.instance(instanceId).retrieve(function (err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  };

  const newReportInstance = await generateReport(report_id);

  // set a quick timeout
  await new Promise((resolve) => {
    setTimeout(() => {
      return resolve();
    }, 1000);
  });

  const reportDataRaw = await retriveReportData(
    report_id,
    newReportInstance.id,
  );

  const parsedReport = parseSFReport(reportDataRaw);

  return parsedReport;
}

async function checkAndCreateReportInstanceV2(opts = {}) {
  const {
    access_info,
    live_chat_settings = {},
    encryptionKeys = {},
    report_id,
  } = opts;
  const api_oauth_url = live_chat_settings?.api_oauth_url;
  const api_client_id = live_chat_settings?.api_client_id;
  const api_client_secret = live_chat_settings?.api_client_secret;

  let conn;
  let authData;

  if (
    live_chat_settings &&
    api_client_id &&
    api_client_secret &&
    api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({
      encryptionKeys,
      api_oauth_url,
      api_client_id,
      api_client_secret,
      grant_type: 'client_credentials',
    });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.accessToken,
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } =
      JSON.parse(access_info);

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
      const report = conn.analytics.report(reportId);
      report.executeAsync({ details: true }, function (err, instance) {
        if (err) {
          return reject(err);
        }
        resolve(instance);
      });
    });
  };

  const reportInstance = await generateReport(report_id);

  return reportInstance;
}

async function retrieveContact(opts = {}) {
  const {
    access_info,
    live_chat_settings = {},
    encryptionKeys = {},
    report_id,
    filter = {},
    sort = {},
  } = opts;
  const { api_oauth_url, api_client_id, api_client_secret } =
    live_chat_settings;

  const orQuery = [];

  let conn;
  let authData;

  const {
    LastName,
    FirstName,
    Name,
    Phone,
    skip = 0,
    startDate,
    endDate,
    sfObject = 'Lead',
    count,
  } = filter;

  if (
    live_chat_settings &&
    api_client_id &&
    api_client_secret &&
    api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({
      encryptionKeys,
      api_oauth_url,
      api_client_id,
      api_client_secret,
      grant_type: 'client_credentials',
    });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.accessToken,
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } =
      JSON.parse(access_info);

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

  if (LastName)
    orQuery.push({
      LastName: { $like: `%${LastName}%` },
    });

  if (FirstName)
    orQuery.push({
      FirstName: { $like: `%${FirstName}%` },
    });

  if (Name)
    orQuery.push({
      Name: { $like: `%${Name}%` },
    });

  if (Phone) {
    orQuery.push({
      Phone: { $like: `%${Phone}%` },
    });
    orQuery.push({
      MobilePhone: { $like: `%${Phone}%` },
    });
  }

  const query = {
    $and: [],
  };

  if (startDate && endDate) {
    query.$and.push({
      CreatedDate: {
        $gte: jsforce.SfDate.toDateTimeLiteral(startDate),
        $lte: jsforce.SfDate.toDateTimeLiteral(endDate),
      },
    });
  } else {
    // last 4 months
    const today = new Date();

    // Subtract four months
    const fourMonthsAgo = today.setMonth(today.getMonth() - 4);
    query.$and.push({
      CreatedDate: {
        $gte: jsforce.SfDate.toDateTimeLiteral(new Date()),
        $lte: jsforce.SfDate.toDateTimeLiteral(fourMonthsAgo),
      },
    });
  }

  if (orQuery.length > 0) query.$and.push({ $or: orQuery });

  const recordPromise = new Promise((resolve, reject) => {
    conn
      .sobject(sfObject)
      .find(query)
      .skip(skip)
      .limit(count)
      .sort(sort)
      .execute((err, records) => {
        if (err) return reject(err);
        return resolve(records);
      });
  });

  const countPromise = new Promise((resolve, reject) => {
    conn
      .sobject(sfObject)
      .count(query)
      .execute((err, records) => {
        if (err) return reject(err);
        return resolve(records);
      });
  });

  const [records, totalCount] = await Promise.all([
    recordPromise,
    countPromise,
  ]);

  return { records, count: totalCount };
}

async function retrieveContactByIds(opts = {}) {
  const {
    access_info,
    live_chat_settings = {},
    encryptionKeys = {},
    report_id,
    filter = {},
  } = opts;
  const { api_oauth_url, api_client_id, api_client_secret } =
    live_chat_settings;

  const orQuery = [];

  let conn;
  let authData;

  const { sf_contact_ids, sfObject = 'Lead' } = filter;

  if (
    live_chat_settings &&
    api_client_id &&
    api_client_secret &&
    api_oauth_url
  ) {
    authData = await _sfAuthenticateViaSecrets({
      encryptionKeys,
      api_oauth_url,
      api_client_id,
      api_client_secret,
      grant_type: 'client_credentials',
    });
  }

  if (authData && authData.access_token && authData.instance_url) {
    conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.accessToken,
    });
  }

  if (!conn) {
    const { access_token, refresh_token, instance_url } =
      JSON.parse(access_info);

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

  const recordPromise = () => {
    return new Promise((resolve, reject) => {
      conn
        .sobject(sfObject)
        .find({
          Id: {
            $in: sf_contact_ids,
          },
        })
        .execute((err, records) => {
          if (err) return reject(err);
          return resolve(records);
        });
      // .retrieve(sf_contact_ids, (err, records) => {
      //   if (err) return reject(err)
      //   return resolve(records);
      // })
    });
  };

  const records = await recordPromise();

  return records;
}

async function upsertContact({
  agency_id,
  agency_user_fk,
  contact_info,
  models,
}) {
  const contactCtl = require('../controllers/contact').makeContactController(
    models,
  );
  const contactSourceCtl =
    require('../controllers/contactSource').makeContactSourceController(models);
  const contactSfDataCtl =
    require('../controllers/contactSalesforceData').makeController(models);

  const {
    id,
    first_name,
    last_name,
    email,
    mobile_number,
    language,
    lead_source,
    lead_source_lv1,
    lead_source_lv2,
    enable_marketing,
    interested_product,
    interested_city,
    tnc_date,
    comments,
  } = contact_info;

  // check if contact exists
  let contact_id;
  let contact_source_id;
  let contact_salesforce_data_id;

  let possible_contact_source;
  let has_agency_match;
  let has_contact_sf_data;

  // find contact_source
  if (contact_info.id) {
    possible_contact_source = await contactSourceCtl.findOne({
      source_contact_id: contact_info.id,
    });
  }

  if (possible_contact_source) {
    has_agency_match = await contactCtl.findOne({
      contact_id: possible_contact_source.contact_fk,
      agency_fk: agency_id,
    });
  }

  if (has_agency_match) {
    // update contact
    contact_id = has_agency_match.contact_id;
    contact_source_id = possible_contact_source.contact_source_id;
    // contact_id = await contactCtl.update(has_agency_match.contact_id, {
    //   first_name: contact_info.first_name,
    //   last_name: contact_info.last_name,
    //   email: contact_info.email,
    //   mobile_number: contact_info.mobile
    // })
  }

  if (contact_id) {
    has_contact_sf_data = await contactSfDataCtl.findOne({
      agency_fk: agency_id,
      contact_fk: contact_id,
    });
  }

  if (has_contact_sf_data) {
    contact_salesforce_data_id = has_contact_sf_data.contact_salesforce_data_id;
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
      agency_user_fk,
      status: constant.CONTACT.STATUS.ACTIVE,
    };

    if (contact_id) {
      await contactCtl.update(contact_id, contactRecord, { transaction });
    } else {
      contact_id = await contactCtl.create(contactRecord, { transaction });
    }

    const contactSourceRecord = {
      contact_fk: contact_id,
      source_type: 'SALESFORCE',
      source_contact_id: id,
      source_original_payload: JSON.stringify(contact_info),
    };

    if (!contact_source_id) {
      contact_source_id = await contactSourceCtl.create(contactSourceRecord, {
        transaction,
      });
    } else {
      await contactSourceCtl.update(contact_source_id, contactSourceRecord, {
        transaction,
      });
    }

    const consentDate = new Date(tnc_date);
    const tncAgreed = consentDate.toString() !== 'Invalid Date';
    const tncValidAgreedDate =
      consentDate.toString() !== 'Invalid Date' ? consentDate : null;

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
      enable_marketing: !!enable_marketing,
      tnc_agree: tncAgreed,
      tnc_date: tncValidAgreedDate,
    };

    if (contact_salesforce_data_id) {
      await contactSfDataCtl.update(
        contact_salesforce_data_id,
        contactSfRecord,
        null,
        { transaction },
      );
    } else {
      contact_salesforce_data_id = await contactSfDataCtl.create(
        contactSfRecord,
        { transaction },
      );
    }

    await transaction.commit();
    return {
      contact_id,
      contact_source_id,
      contact_salesforce_data_id,
    };
  } catch (err) {
    Sentry.captureException(err);
    await transaction.commit();
    throw err;
  }
}

async function addSfRecords({
  sf_contacts = [],
  agency_user_fk,
  agency_id,
  log,
  models,
}) {
  // get the record map
  const map = constant.SALESFORCE.SF_OBJECT_MAP;
  // remap contact records
  const mappedContacts = sf_contacts.map((contact) => ({
    id: contact[map.ID],
    first_name: contact[map.FIRST_NAME],
    last_name: contact[map.LAST_NAME],
    email: contact[map.EMAIL],
    mobile_number: contact[map.MOBILE] || contact[map.PHONE],
    language: contact[map.LANGUAGE],
    lead_source: contact[map.LEAD_SOURCE],
    lead_source_lv1: contact[map.LEAD_SOURCE_LV1],
    lead_source_lv2: contact[map.LEAD_SOURCE_LV2],
    enable_marketing: contact[map.ENABLE_MARKETING],
    interested_product: contact[map.INTERESTED_PRODUCT],
    interested_city: contact[map.INTERESTED_CITY],
    tnc_date: contact[map.TNC_DATE],
    comments: contact[map.COMMENTS],
  }));
  let success = 0;
  let failed = 0;
  for (const contact_info of mappedContacts) {
    try {
      await upsertContact({ agency_id, contact_info, agency_user_fk, models });
      success += 1;
    } catch (err) {
      Sentry.captureException(err);
      log &&
        log.warn({
          lib: 'salesforce',
          method: 'addSfRecords',
          error: err,
          error_txt: String(err),
        });
      failed += 1;
    }
  }

  return {
    success,
    failed,
  };
}

module.exports = {
  sendSalesforceContactNote,
  sanitizeHTML,
  sanitizeHTML2,
  transmitMessage,
  updateSalesforceRecord,
  getSfOauth2Conn,
  retrieveSfReports,
  retrieveSfReportsV2,
  retrieveSFReportData,
  retrieveSFReportDataV2,
  checkAndCreateReportInstance,
  checkAndCreateReportInstanceV2,
  retrieveContact,
  retrieveContactByIds,
  addSfRecords,
};
