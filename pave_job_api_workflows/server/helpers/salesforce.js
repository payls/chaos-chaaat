const constant = require('../constants/constant.json');
const cryptoHelper = require('./cryptoHelper');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const whatsappHelper = require('./whatsapp');
const appSyncHelper = require('./appsync');
const Axios = require('axios');
const BPromise = require('bluebird');
const jsforce = require('jsforce');
const config = require('../configs/config')(process.env.NODE_ENV);
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  test: {
    isTest: testHelper.isTest,
  },
  validation: {
    requiredParams: validationHelper.requiredParams,
  },
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
  sendEmail: emailHelper.sendEmail,
  generateId: generalHelper.generateId,
  sendGraphQLNotification: appSyncHelper.sendGraphQLNotification,
};

function addContactBasedOnProductId({ projectId, agencyConfig }) {
  let { salesforce_config } = agencyConfig;
  if (typeof salesforce_config === 'string') {
    try {
      salesforce_config = JSON.parse(salesforce_config);
    } catch (err) {
      return true;
    }
  }

  if (!salesforce_config) {
    return true;
  }

  const { add_contact_based_on_project, project_ids = [] } = salesforce_config;

  if (!add_contact_based_on_project) {
    return true;
  }

  return project_ids.filter((p) => p === projectId).length > 0;
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
  oauth,
  contact,
  contact_source,
  currentAgencyUser,
  full_message_body,
  messageType,
  platform,
  log,
  encryptionKeys,
}) {
  log.info({ message: 'checking transmission conditions' });
  const salesforceEnabled = liveChatSettings.dataValues.salesforce_enabled;
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
  let portalMessage;
  let message;
  let sender;
  if (generalHelper.cmpStr(messageType, 'text_frompave')) {
    portalMessage = full_message_body.split('</div>\n');
    message = generalHelper.unescapeData(portalMessage[1]);
    sender =
      currentAgencyUser.user.first_name +
      ' ' +
      currentAgencyUser.user.last_name;
  }

  if (generalHelper.cmpStr(messageType, 'plain_frompave')) {
    message = generalHelper.unescapeData(full_message_body);
    sender =
      currentAgencyUser.user.first_name +
      ' ' +
      currentAgencyUser.user.last_name;
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
    message = portalMessage[0];
    sender =
      currentAgencyUser.user.first_name +
      ' ' +
      currentAgencyUser.user.last_name;
  }

  if (generalHelper.cmpStr(messageType, 'template')) {
    if (full_message_body.includes('test-class')) {
      const portalMessage = full_message_body.split('</div>\n');
      message = generalHelper.unescapeData(portalMessage[1]);
    } else {
      message = generalHelper.unescapeData(full_message_body);
      message = generalHelper.unescapeData(message);
    }
    sender =
      currentAgencyUser.user.first_name +
      ' ' +
      currentAgencyUser.user.last_name;
  }

  if (
    [
      'text',
      'image',
      'video',
      'file',
      'document',
      'button',
      'audio',
      'audio_file',
    ].includes(messageType)
  ) {
    message = generalHelper.unescapeData(full_message_body);
    sender = contact.first_name + ' ' + contact.last_name;
  }

  log.info({
    message: 'checking of can transmit message',
    1:
      (generalHelper.cmpStr(platform, 'whatsapp') && whatsappEnabled) ||
      (generalHelper.cmpStr(platform, 'line') && lineEnabled),
    2: generalHelper.notEmpty(contact_source),
    3: generalHelper.cmpBool(transmitChat, true),
    4: generalHelper.notEmpty(commentField),
  });

  if (
    ((generalHelper.cmpStr(platform, 'whatsapp') && whatsappEnabled) ||
      (generalHelper.cmpStr(platform, 'line') && lineEnabled)) &&
    generalHelper.notEmpty(contact_source) &&
    generalHelper.cmpBool(transmitChat, true) &&
    generalHelper.notEmpty(commentField)
  ) {
    log.info({ message: 'can transmit message' });
    const updateData = {};
    updateData[commentField] = `${sender}: ${message}`;
    if (
      (generalHelper.cmpBool(hasOauth, true) ||
        generalHelper.notEmpty(liveChatSettings.dataValues.api_update_token)) &&
      generalHelper.notEmpty(liveChatSettings.dataValues.api_update_url)
    ) {
      log.info({ message: 'custom transmit message' });
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
      let update_url = `${liveChatSettings.dataValues.api_url}`;
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
        mobile,
        language,
        interested_product,
        interested_city,
        lead_source,
        lead_source_lv1,
        lead_source_lv2,
        enable_marketing,
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
      log.info({ endpoint_values: endpoint_values });
      const updateData = {};
      field_configurations.forEach((configuration) => {
        if (generalHelper.cmpBool(configuration.required, true)) {
          if (configuration.field in endpoint_values) {
            updateData[configuration.mappedTo] =
              endpoint_values[configuration.field];
          } else {
            if (generalHelper.cmpStr(configuration.field, 'comments')) {
              updateData[configuration.mappedTo] = `${sender}: ${message}`;
            }
          }
        }
      });
      log.info({ message: 'message update data', data: updateData });
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
          return error;
        });
      log.info({ sfResponse: sfResponse });
    } else {
      log.info({ message: 'standard transmit message' });
      let agencyOauth = oauth;

      agencyOauth =
        agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

      if (!agencyOauth) {
        // finish execution here
        log.warn({
          message: `No OAuth credentials`,
          processor: 'waba-process-webhook-payload',
          agency_id: contact.agency_fk,
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
              log.warn({
                message: `Invalid credentials`,
                processor: 'livechat-webhook-payload',
                agency_id: contact.agency_fk,
              });

              return resolve(null);
            }
            resolve(results);
          });
        });

        log.info({ message: 'creds and source', creds, contact_source });

        if (creds && generalHelper.notEmpty(contact_source)) {
          log.info({
            message: 'check if contact exists in sf',
            data: contact_source.source_contact_id,
          });
          const sfContact = await new BPromise((resolve, reject) => {
            conn
              .sobject(salesforceObject)
              .find({
                Id: contact_source.source_contact_id,
              })
              .execute((err, contact) => {
                if (err) {
                  log.error({
                    err,
                    message: `Unable to fetch Contact`,
                    processor: 'livechat-webhook-payload',
                    agency_id: contact.agency_fk,
                  });
                  resolve([]);
                }
                resolve(contact);
              });
          });
          log.info({ message: 'sf contact', data: sfContact });
          if (sfContact && !generalHelper.cmpInt(sfContact.length, 0)) {
            log.info({ message: 'record exists' });
            const sfContactCommentUpdate = await new BPromise(
              (resolve, reject) => {
                const comment = sfContact[0][commentField];
                const toRecordComment = comment + `\n ${sender}: ${message}`;
                const updateData = {
                  Id: contact_source.source_contact_id,
                };
                updateData[commentField] = toRecordComment;
                conn
                  .sobject(salesforceObject)
                  .update(updateData, function (err, ret) {
                    if (err || !ret.success) {
                      resolve([]);
                    }
                    resolve(ret);
                  });
              },
            );
            log.info({
              message: 'sfContactCommentUpdate',
              data: sfContactCommentUpdate,
            });
          }
        }
      }
    }
  }
}

async function generateSFRecord(
  liveChatSettings,
  sf_required_fields,
  agencyOauth,
  contact,
  thread,
  contactMessage,
  log,
  encryptionKeys,
) {
  const childLog = log.child({
    sub_function: 'generateSFRecord',
  });
  let sf_id;
  let token;
  let mode = 'standard';
  const hasOauth = !!(
    h.notEmpty(liveChatSettings.dataValues.api_oauth_url) &&
    h.notEmpty(liveChatSettings.dataValues.api_client_id) &&
    h.notEmpty(liveChatSettings.dataValues.api_client_secret)
  );
  const field_configurations = JSON.parse(
    liveChatSettings.dataValues.field_configuration,
  );
  const transmitChat =
    liveChatSettings.dataValues.salesforce_chat_logs_transmission_enabled;
  const commentField =
    liveChatSettings.dataValues.salesforce_chat_logs_transmission_field;
  const createData = {};

  if (
    h.cmpBool(liveChatSettings.dataValues.whatsapp_salesforce_enabled, true)
  ) {
    if (
      (h.cmpBool(hasOauth, true) ||
        h.notEmpty(liveChatSettings.dataValues.api_token)) &&
      h.notEmpty(liveChatSettings.dataValues.api_url)
    ) {
      childLog.info({
        message: 'livechat_credential_mode: custom',
      });
      mode = 'custom';
      if (h.isEmpty(liveChatSettings.dataValues.api_token) && hasOauth) {
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
        const decrypted_api_token = cryptoHelper.decrypt(
          {
            encryptionKey: encryptionKeys.encryption_key,
            encryptionIv: encryptionKeys.encryption_iv,
          },
          liveChatSettings.dataValues.api_token,
        );
        token = decrypted_api_token;
      }
    }

    const salesforce_data_map_fields = {
      first_name: 'first_name',
      last_name: 'last_name',
      email_address: 'email',
      mobile_number: 'mobile',
      phone: 'mobile',
      product: 'interested_product',
      city: 'interested_city',
      lead_source: 'lead_source',
      lead_channel: 'lead_source_lv1',
      origin: 'lead_source_lv2',
      language: 'language',
      marketing: 'enable_marketing',
      consent_date: 'tnc_date',
    };

    childLog.info({ message: 'sf_required_fields', data: sf_required_fields });

    field_configurations.forEach((configuration) => {
      if (h.cmpBool(configuration.required, true)) {
        childLog.info({ field: configuration.field });
        if (configuration.field in salesforce_data_map_fields) {
          createData[configuration.mappedTo] =
            sf_required_fields[salesforce_data_map_fields[configuration.field]];
        } else {
          if (h.cmpStr(configuration.field, 'comments')) {
            createData[configuration.mappedTo] = generalHelper.unescapeData(
              configuration.defaultValue,
            );
          }
        }
      }
    });

    childLog.info({ message: 'create data', data: createData });

    if (h.cmpBool(transmitChat, true) && !h.isEmpty(commentField)) {
      if (thread) {
        thread.forEach((message) => {
          childLog.info({ message_type: message.msg_type });
          let message_content;
          let sender_name;
          if (
            ['text', 'image', 'video', 'document', 'button'].includes(
              message.msg_type,
            )
          ) {
            if (['text', 'button'].includes(message.msg_type)) {
              message_content = generalHelper.unescapeData(message.msg_body);
              if (message.caption) {
                message_content +=
                  '\n' + generalHelper.unescapeData(message.caption) + '\n';
              }
              message_content += '\n-------------';
            }
            if (['image', 'document', 'video'].includes(message.msg_type)) {
              message_content = message.media_url;
              if (message.caption) {
                message_content +=
                  '\n' + generalHelper.unescapeData(message.caption) + '\n';
              }
              message_content += '\n-------------';
            }
            sender_name =
              message.contact.first_name + ' ' + message.contact.last_name;
            createData[commentField] += `\n${sender_name}: ${message_content}`;
          }

          if (
            [
              'frompave',
              'img_frompave',
              'video_frompave',
              'file_frompave',
            ].includes(message.msg_type)
          ) {
            if (['frompave'].includes(message.msg_type)) {
              const savedMessage = message.msg_body;

              if (savedMessage.includes('test-class')) {
                const portalMessage = savedMessage.split('</div>\n');
                message_content = generalHelper.unescapeData(portalMessage[1]);
                if (message.caption) {
                  message_content +=
                    '\n' + generalHelper.unescapeData(message.caption) + '\n';
                }
                message_content += '\n-------------';
              } else {
                message_content = generalHelper.unescapeData(savedMessage);
                if (message.caption) {
                  message_content +=
                    '\n' + generalHelper.unescapeData(message.caption) + '\n';
                }
                message_content += '\n-------------';
              }
            }
            if (
              ['img_frompave', 'file_frompave', 'video_frompave'].includes(
                message.msg_type,
              )
            ) {
              const message_parts = message.msg_body.split(' ');
              message_content = message_parts[0];
              if (message.caption) {
                message_content +=
                  '\n' + generalHelper.unescapeData(message.caption) + '\n';
              }
              message_content += '\n-------------';
            }
            sender_name =
              message.agency_user.user.first_name +
              ' ' +
              message.agency_user.user.last_name;
            createData[commentField] += `\n${sender_name}: ${message_content}`;
          }
        });
      }
    }

    childLog.info({ message: 'create data for SF', data: createData });

    if (h.cmpStr(mode, 'custom')) {
      const sfConfig = {
        method: 'post',
        url: `${liveChatSettings.dataValues.api_url}`,
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json',
        },
        data: createData,
      };
      const sfResponse = await Axios(sfConfig)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          return error;
        });
      childLog.info({ message: sfResponse, data: sfResponse });
      sf_id = sfResponse.id;
    } else {
      const oauth =
        agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;
      if (!agencyOauth) {
        // finish execution here
        childLog.warn({
          message: `No OAuth credentials`,
          processor: 'salesforce helper workflow',
          agency_id: contact.agency_fk,
        });
      } else {
        const { access_token, refresh_token, instance_url } = JSON.parse(
          oauth.access_info,
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
              childLog.warn({
                message: `Invalid credentials`,
                processor: 'salesforce helper workflow',
                agency_id: contact.agency_fk,
              });

              return resolve(null);
            }
            log.info({ message: 'BPromise result', result: results });
            resolve(results);
          });
        });

        const salesforceObject =
          liveChatSettings.dataValues.salesforce_transmission_type;
        log.info({
          message: 'creds and salesforceObject',
          creds: creds,
          salesforceObject: salesforceObject,
        });
        if (creds && !h.isEmpty(salesforceObject)) {
          childLog.info({ message: 'create data to push', data: createData });
          const createdSFContact = await new BPromise((resolve, reject) => {
            conn
              .sobject(salesforceObject)
              .create(createData, function (err, ret) {
                if (err || !ret.success) {
                  childLog.error({ response: err });
                  return resolve([]);
                }
                resolve(ret);
              });
          });
          childLog.info({
            message: 'sfcontact process',
            data: createdSFContact,
          });
          sf_id = createdSFContact.id;
        }
      }
    }

    return sf_id;
  }
}

/**
 * Description
 * Function to connect to salesforce account based on the integration oauth details
 * @async
 * @function
 * @name connectToSalesforce
 * @kind function
 * @param {object} agencyOauth current agency oauth session for salesforce
 * @returns {Promise} returns the successful connection and refresh token for
 * current salesforce session
 */
async function connectToSalesforce({ agencyOauth }) {
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

  return { conn, refresh_token };
}

module.exports = {
  addContactBasedOnProductId,
  transmitMessage,
  sanitizeHTML,
  sanitizeHTML2,
  generateSFRecord,
  connectToSalesforce,
};
