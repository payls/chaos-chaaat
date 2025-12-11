const Sentry = require('@sentry/node');
const h = require('../helpers');
const { Op } = require('sequelize');
const jsforce = require('jsforce');
const config = require('../configs/config')(process.env.NODE_ENV);
const BPromise = require('bluebird');
const Axios = require('axios');
const contact_salesforce_data = require('../models/contact_salesforce_data');
const constant = require('../constants/constant.json');
const moment = require('moment');

module.exports.makeController = (models) => {
  const { live_chat: liveChatModel } = models;

  const liveChatCtl = {};

  /**
   * Create live_chat record
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  liveChatCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'liveChatCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      session_id,
      msg_type,
      msg_body,
      media_url,
      content_type,
      file_name,
      reply_to_live_chat_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_timestamp,
      sender_number,
      receiver_number,
      delivered,
      sent,
      failed,
      read,
      replied,
      created_by,
    } = record;
    const live_chat_id = h.general.generateId();
    await liveChatModel.create(
      {
        live_chat_id,
        agency_fk,
        contact_fk,
        agency_user_fk,
        session_id,
        msg_type,
        msg_body,
        media_url,
        content_type,
        file_name,
        reply_to_live_chat_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_timestamp,
        sender_number,
        receiver_number,
        delivered,
        sent,
        failed,
        read,
        replied,
        created_by,
      },
      { transaction },
    );

    return live_chat_id;
  };

  /**
   * Update live_chat record
   * @param {string} live_chat_id
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  liveChatCtl.update = async (
    live_chat_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'liveChatCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      session_id,
      msg_type,
      msg_body,
      media_url,
      content_type,
      file_name,
      reply_to_live_chat_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_timestamp,
      sender_number,
      receiver_number,
      delivered,
      sent,
      failed,
      read,
      replied,
    } = record;

    await liveChatModel.update(
      {
        agency_fk,
        contact_fk,
        agency_user_fk,
        session_id,
        msg_type,
        msg_body,
        media_url,
        content_type,
        file_name,
        reply_to_live_chat_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_timestamp,
        sender_number,
        receiver_number,
        delivered,
        sent,
        failed,
        read,
        replied,
        updated_by,
      },
      {
        where: { live_chat_id },
        transaction,
      },
    );

    return live_chat_id;
  };

  /**
   * Find all live_chat records
   * @param {{
   *  live_chat_id: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  liveChatCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'liveChatCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await liveChatModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one live_chat record
   * @param {{
   *  live_chat_id: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  liveChatCtl.findOne = async (where, { include, order, transaction } = {}) => {
    const funcName = 'liveChatCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await liveChatModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete live_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'liveChatCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await liveChatModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Description
   * Function to start live chat session
   * @async
   * @constant
   * @name liveChatCtl.start_session
   * @param {string} first_name contact first name
   * @param {string} last_name contact last name
   * @param {string} email_address contact email
   * @param {string} contact_phone contact phone
   * @param {string} product selected product
   * @param {string} city_code selected city
   * @param {boolean} marketing_optin allow marketing email
   * @param {string} selected_language selected language
   * @param {string} agency_id agency id
   * @param {object} encryptionKeys addition encryption data
   * @param {object} transaction database transaction
   */
  liveChatCtl.start_session = async (
    first_name,
    last_name,
    email_address,
    contact_phone,
    product,
    city_code,
    marketing_optin,
    selected_language,
    agency_id,
    encryptionKeys = {},
    { transaction } = {},
  ) => {
    const funcName = 'liveChatCtl.start_session';
    await h.validation.requiredParams(funcName, {
      first_name,
      email_address,
      agency_id,
    });
    const [agency, paveSupport, existingContact, liveChatSettings] =
      await Promise.all([
        models.agency.findOne({
          where: {
            agency_id: agency_id,
          },
        }),
        models.user.findOne({
          where: {
            email: {
              [Op.like]: `%support%`,
            },
          },
          include: [
            {
              model: models.agency_user,
              where: {
                agency_fk: agency_id,
              },
              include: [
                {
                  model: models.agency,
                },
              ],
            },
          ],
        }),
        models.contact.findOne({
          where: {
            agency_fk: agency_id,
            email: email_address,
          },
        }),
        models.live_chat_settings.findOne({
          where: {
            agency_fk: agency_id,
          },
        }),
      ]);

    let contactOwner = liveChatSettings.dataValues.agency_user_fk;
    const hasOauth = !!(
      h.notEmpty(liveChatSettings.dataValues.api_oauth_url) &&
      h.notEmpty(liveChatSettings.dataValues.api_client_id) &&
      h.notEmpty(liveChatSettings.dataValues.api_client_secret)
    );
    const languageArr = constant.LIVE_CHAT_LANGUAGE;
    const language = !h.isEmpty(selected_language)
      ? languageArr[selected_language]
      : 'English';
    const tec_agencies = constant.TEC_AGENCIES;

    if (h.isEmpty(contactOwner)) {
      contactOwner = !h.isEmpty(
        agency.dataValues.default_outsider_contact_owner,
      )
        ? agency.dataValues.default_outsider_contact_owner
        : paveSupport?.agency_user?.dataValues?.agency_user_id;
    }

    const contactOwnerDetails = await models.agency_user.findOne({
      where: {
        agency_fk: agency_id,
        agency_user_id: contactOwner,
      },
      include: [
        {
          model: models.user,
          required: true,
        },
      ],
    });

    const contactOwnerUserDetails = contactOwnerDetails.user.dataValues;

    let contact_sf_id = null;
    let city;
    const tnCDate = new Date();
    const formattedTnCDate = tnCDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const parsedDate = moment(formattedTnCDate, 'YYYY-MM-DD HH:mm:ss');
    const finalParsedDate = parsedDate.toDate();
    const marketing =
      h.notEmpty(marketing_optin) && h.cmpBool(marketing_optin, true);
    let mobile_number = contact_phone;
    if (!h.isEmpty(contact_phone)) {
      mobile_number = contact_phone.replaceAll('+', '');
      mobile_number = mobile_number.replaceAll('(', '');
      mobile_number = mobile_number.replaceAll(')', '');
      mobile_number = mobile_number.replaceAll('-', '');
      mobile_number = mobile_number.replaceAll('.', '');
    }
    let tec_data = {};
    let lead_source, lead_source_lv1, lead_source_lv2;
    const field_configurations = JSON.parse(
      liveChatSettings.dataValues.field_configuration,
    );
    // check if salesforce settings is enabled for live chat
    if (h.cmpBool(liveChatSettings.dataValues.salesforce_enabled, true)) {
      // if with custom
      if (
        (h.cmpBool(hasOauth, true) ||
          h.notEmpty(liveChatSettings.dataValues.api_token)) &&
        h.notEmpty(liveChatSettings.dataValues.api_url)
      ) {
        if (!h.isEmpty(city_code)) {
          const cityDetails = await models.agency_salesforce_city.findOne({
            where: {
              agency_fk: agency_id,
              sf_city_id: city_code,
              language: 'en',
            },
          });
          city = cityDetails.dataValues.code;
        }
        let token;
        const contact_fields = constant.CONTACT_FIELDS;
        if (h.isEmpty(liveChatSettings.dataValues.api_token) && hasOauth) {
          const decrypted_client_id = h.crypto.decrypt(
            {
              encryptionKey: encryptionKeys.encryption_key,
              encryptionIv: encryptionKeys.encryption_iv,
            },
            liveChatSettings.dataValues.api_client_id,
          );

          const decrypted_client_secret = h.crypto.decrypt(
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
          const decrypted_api_token = h.crypto.decrypt(
            {
              encryptionKey: encryptionKeys.encryption_key,
              encryptionIv: encryptionKeys.encryption_iv,
            },
            liveChatSettings.dataValues.api_token,
          );
          token = decrypted_api_token;
        }

        const createData = {};
        const endpoint_values = {
          first_name: first_name,
          last_name: last_name,
          email_address: email_address,
          phone: mobile_number,
          product: product,
          city: city,
          marketing: marketing,
          language: language,
          consent_date: finalParsedDate,
        };
        console.log('endpoint values', endpoint_values);
        console.log('field configurations', field_configurations);
        field_configurations.forEach((configuration) => {
          if (h.cmpBool(configuration.required, true)) {
            if (configuration.field in endpoint_values) {
              createData[configuration.mappedTo] =
                endpoint_values[configuration.field];
            } else {
              if (h.notEmpty(configuration.defaultValue)) {
                createData[configuration.mappedTo] = configuration.defaultValue;
                if (h.cmpStr(configuration.field, 'lead_source')) {
                  lead_source = configuration.defaultValue;
                }
                if (h.cmpStr(configuration.field, 'lead_channel')) {
                  lead_source_lv1 = configuration.defaultValue;
                }
                if (h.cmpStr(configuration.field, 'origin')) {
                  lead_source_lv2 = configuration.defaultValue;
                }
              } else {
                if (h.cmpStr(configuration.field, 'lead_channel')) {
                  createData[configuration.mappedTo] = 'Live Chat';
                  lead_source_lv1 = 'Live Chat';
                }
              }
            }
          }
        });
        console.log('to submit', createData);

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
            Sentry.captureException(error);
            return error;
          });
        console.log(sfResponse);
        contact_sf_id = sfResponse.id;
      } else {
        // if generic
        let agencyOauth = await models.agency_oauth.findOne({
          where: {
            agency_fk: agency_id,
            status: 'active',
            source: 'SALESFORCE',
          },
        });

        agencyOauth =
          agencyOauth && agencyOauth.toJSON
            ? agencyOauth.toJSON()
            : agencyOauth;

        if (!agencyOauth) {
          // finish execution here
          console.log({
            message: `No OAuth credentials`,
            processor: funcName,
            agency_id,
          });
        } else {
          const salesforceData = {};
          if (!h.isEmpty(city_code)) {
            const cityDetails = await models.agency_salesforce_city.findOne({
              where: {
                agency_fk: agency_id,
                sf_city_id: city_code,
                language: 'en',
              },
            });
            city = cityDetails.dataValues.code;
          }
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
                  processor: funcName,
                  agency_id,
                });

                return resolve(null);
              }
              resolve(results);
            });
          });

          const salesforceObject =
            liveChatSettings.dataValues.salesforce_transmission_type;
          if (creds && !h.isEmpty(salesforceObject)) {
            const endpoint_values = {
              first_name: first_name,
              last_name: last_name,
              email_address: email_address,
              mobile_number: mobile_number,
              product: product,
              city: city,
              marketing: marketing,
              language: language,
              consent_date: finalParsedDate,
            };
            if (h.notEmpty(field_configurations)) {
              field_configurations.forEach((configuration) => {
                if (h.cmpBool(configuration.required, true)) {
                  if (configuration.field in endpoint_values) {
                    salesforceData[configuration.mappedTo] =
                      endpoint_values[configuration.field];
                  } else {
                    if (h.notEmpty(configuration.defaultValue)) {
                      salesforceData[configuration.mappedTo] =
                        configuration.defaultValue;
                      if (h.cmpStr(configuration.field, 'lead_source')) {
                        lead_source = configuration.defaultValue;
                      }
                      if (h.cmpStr(configuration.field, 'lead_channel')) {
                        lead_source_lv1 = configuration.defaultValue;
                      }
                      if (h.cmpStr(configuration.field, 'origin')) {
                        lead_source_lv2 = configuration.defaultValue;
                      }
                    } else {
                      if (h.cmpStr(configuration.field, 'lead_channel')) {
                        salesforceData[configuration.mappedTo] = 'Live Chat';
                        lead_source_lv1 = 'Live Chat';
                      }
                    }
                  }
                }
              });
            }
            console.log('data', salesforceData);
            const createdSFContact = await new BPromise((resolve, reject) => {
              conn
                .sobject(salesforceObject)
                .create(salesforceData, function (err, ret) {
                  if (err || !ret.success) {
                    console.log(err);
                    resolve([]);
                  }
                  resolve(ret);
                });
            });
            console.log('sfcontact process', createdSFContact);
            contact_sf_id = createdSFContact.id;
          }
        }
      }
    }

    let contact_id;
    let liveChatInbox;
    let has_unified_inbox = false;
    let existingSFContact = null;
    if (h.notEmpty(contact_sf_id)) {
      existingSFContact = await models.contact_source.findOne({
        where: {
          source_contact_id: contact_sf_id,
          source_type: 'SALESFORCE',
        },
      });
    }
    let mobile_for_chaaat;
    if (!h.isEmpty(mobile_number)) {
      mobile_for_chaaat = mobile_number.replaceAll('+', '');
      mobile_for_chaaat = mobile_for_chaaat.replaceAll('(', '');
      mobile_for_chaaat = mobile_for_chaaat.replaceAll(')', '');
      mobile_for_chaaat = mobile_for_chaaat.replaceAll('-', '');
      mobile_for_chaaat = mobile_for_chaaat.replaceAll('.', '');
      mobile_for_chaaat = mobile_for_chaaat.replaceAll(' ', '');
    }
    if (
      existingSFContact &&
      existingSFContact.dataValues &&
      existingSFContact.dataValues.contact_fk
    ) {
      contact_id = existingSFContact.dataValues.contact_fk;
      await models.contact.update(
        {
          first_name: first_name,
          last_name: last_name,
          email: email_address,
          mobile_number: mobile_for_chaaat,
        },
        {
          where: {
            contact_id: contact_id,
          },
        },
        {
          transaction,
        },
      );
      liveChatInbox = await models.unified_inbox.findOne({
        where: {
          agency_fk: agency_id,
          contact_fk: contact_id,
          msg_platform: 'livechat',
        },
        order: [['created_date', 'DESC']],
      });
      if (!h.isEmpty(liveChatInbox)) {
        has_unified_inbox = true;
      }
    } else {
      contact_id = h.general.generateId();
      await models.contact.create(
        {
          contact_id,
          first_name: first_name,
          last_name: last_name,
          email: email_address,
          mobile_number: mobile_for_chaaat,
          is_whatsapp: 0,
          agency_fk: agency_id,
          agency_user_fk: contactOwner,
          from_export: false,
          manual_label: 'sf_lead_contact',
          status: 'active',
        },
        { transaction },
      );
      const contact_source_id = h.general.generateId();
      await models.contact_source.create(
        {
          contact_source_id,
          contact_fk: contact_id,
          source_contact_id: contact_sf_id,
          source_type: !h.isEmpty(contact_sf_id) ? 'SALESFORCE' : 'LIVECHAT',
        },
        { transaction },
      );
      console.log('SOURCE', contact_source_id, contact_sf_id);
    }

    const contact_salesforce_data_id = h.general.generateId();
    tec_data = {
      contact_salesforce_data_id: contact_salesforce_data_id,
      agency_fk: agency_id,
      first_name: first_name,
      last_name: last_name,
      email: email_address,
      mobile: mobile_number,
      language: language,
      interested_city: city,
      interested_product: product,
      enable_marketing: h.cmpBool(marketing_optin, true),
      tnc_agree: true,
      tnc_date: finalParsedDate,
      lead_source: lead_source,
      lead_source_lv1: lead_source_lv1,
      lead_source_lv2: lead_source_lv2,
    };
    tec_data.contact_fk = contact_id;
    tec_data.created_by = null;
    console.log('teccccc', tec_data);
    const contact_note = `First Name: ${tec_data.first_name}<br/>
      Last Name: ${tec_data.last_name}<br/>
      Email: ${tec_data.email}<br/>
      Mobile: ${tec_data.mobile}<br/>
      Language: ${tec_data.language}<br/>
      Interested Product: ${tec_data.interested_product}<br/>
      Interested City: ${tec_data.interested_city}<br/>
      Lead Source: ${lead_source}<br/>
      Lead Channel: ${lead_source_lv1}<br/>
      Origin: ${lead_source_lv2}<br/>
      Marketing Enabled: ${
        h.cmpBool(tec_data.enable_marketing, true) ? 'Yes' : 'No'
      }<br/>
      TNC Agreed: ${
        h.cmpBool(tec_data.tnc_agree, true) ? `${finalParsedDate}` : 'No'
      }`;

    try {
      await models.contact_salesforce_data.create(tec_data, {
        transaction,
      });
      const note_data = {
        contact_note_id: h.general.generateId(),
        contact_fk: contact_id,
        agency_user_fk: contactOwner,
        note: contact_note,
      };
      await models.contact_note.create(note_data, {
        transaction,
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log('error', e);
    }

    const live_chat_session_id = h.general.generateId();
    await models.live_chat_session.create(
      {
        live_chat_session_id,
        contact_fk: contact_id,
        status: 'active',
        created_by: null,
      },
      { transaction },
    );

    const live_chat_id = h.general.generateId();
    const timestamp = Math.floor(Date.now() / 1000);
    await models.live_chat.create(
      {
        live_chat_id,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: contactOwner,
        session_id: live_chat_session_id,
        msg_type: 'start_session',
        msg_body: 'Live chat session started',
        msg_timestamp: timestamp,
        sender_number: contact_id,
        receiver_number: contactOwner,
        delivered: 1,
        sent: 1,
        failed: 0,
        read: 1,
        replied: 0,
        created_by: null,
      },
      { transaction },
    );

    if (h.cmpBool(has_unified_inbox, false)) {
      const unified_inbox_id = h.general.generateId();
      await models.unified_inbox.create(
        {
          unified_inbox_id: unified_inbox_id,
          tracker_id: live_chat_session_id,
          campaign_name: 'Live Chat',
          tracker_ref_name: live_chat_session_id,
          agency_fk: agency_id,
          contact_fk: contact_id,
          agency_user_fk: contactOwner,
          event_id: null,
          msg_body: 'Live chat session started',
          msg_type: 'start_session',
          msg_platform: 'livechat',
          pending: 0,
          failed: 0,
          delivered: 1,
          sent: 1,
          read: 1,
          batch_count: 1,
          created_by: null,
          broadcast_date: new Date(),
          last_msg_date: new Date(),
          template_count: 0,
          tracker_type: 'main',
          sender: contact_id,
          receiver: contactOwner,
        },
        {
          transaction,
        },
      );
    } else {
      await models.unified_inbox.update(
        {
          campaign_name: 'Live Chat',
          tracker_ref_name: live_chat_session_id,
          agency_fk: agency_id,
          contact_fk: contact_id,
          agency_user_fk: contactOwner,
          event_id: null,
          msg_body: 'Live chat session started',
          msg_type: 'start_session',
          msg_platform: 'livechat',
          pending: 0,
          failed: 0,
          batch_count: 1,
          created_by: null,
          broadcast_date: new Date(),
          last_msg_date: new Date(),
          template_count: 0,
          tracker_type: 'main',
          sender: contact_id,
          receiver: contactOwner,
        },
        {
          where: {
            unified_inbox_id: liveChatInbox.dataValues.unified_inbox_id,
          },
        },
        {
          transaction,
        },
      );
    }

    const contactDetails = {
      contact_id: contact_id,
      first_name,
      last_name,
      email_address,
      agency_fk: agency_id,
      agency_user_fk: contactOwner,
    };

    return { live_chat_session_id, contact: contactDetails };
  };

  /**
   * End live cat session
   * @param session_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatCtl.end_session = async (session_id, { transaction } = {}) => {
    const funcName = 'liveChatCtl.end_session';
    h.validation.requiredParams(funcName, {
      session_id,
    });
    const latestChat = await models.live_chat.findOne({
      where: {
        session_id: session_id,
      },
      order: [['created_date', 'DESC']],
    });
    const liveChatInbox = await models.unified_inbox.findOne({
      where: {
        agency_fk: latestChat.dataValues.agency_fk,
        contact_fk: latestChat.dataValues.contact_fk,
        msg_platform: 'livechat',
      },
      order: [['created_date', 'DESC']],
    });
    const live_chat_id = h.general.generateId();
    const timestamp = Math.floor(Date.now() / 1000);
    await models.live_chat.create(
      {
        live_chat_id,
        agency_fk: latestChat.dataValues.agency_fk,
        contact_fk: latestChat.dataValues.contact_fk,
        agency_user_fk: latestChat.dataValues.agency_user_fk,
        session_id: session_id,
        msg_type: 'end_session',
        msg_body: 'Live chat session ended',
        msg_timestamp: timestamp,
        sender_number: latestChat.dataValues.contact_fk,
        receiver_number: latestChat.dataValues.agency_user_fk,
        delivered: 1,
        sent: 1,
        failed: 0,
        read: 1,
        replied: 0,
        created_by: null,
      },
      { transaction },
    );
    await models.unified_inbox.update(
      {
        campaign_name: 'Live Chat',
        tracker_ref_name: session_id,
        agency_fk: latestChat.dataValues.agency_fk,
        contact_fk: latestChat.dataValues.contact_fk,
        agency_user_fk: latestChat.dataValues.agency_user_fk,
        event_id: null,
        msg_body: 'Live chat session ended',
        msg_type: 'end_session',
        msg_platform: 'livechat',
        pending: 0,
        failed: 0,
        delivered: 1,
        sent: 1,
        read: 1,
        batch_count: 1,
        created_by: null,
        broadcast_date: new Date(),
        last_msg_date: new Date(),
        template_count: 0,
        tracker_type: 'main',
        sender: latestChat.dataValues.contact_fk,
        receiver: latestChat.dataValues.agency_user_fk,
      },
      {
        where: {
          unified_inbox_id: liveChatInbox.dataValues.unified_inbox_id,
        },
      },
      {
        transaction,
      },
    );
    await models.live_chat_session.update(
      {
        status: 'inactive',
      },
      {
        where: {
          live_chat_session_id: session_id,
        },
        transaction,
      },
    );
  };

  /**
   * Count live_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatCtl.count = async (where, { include, transaction } = {}) => {
    const funcName = 'liveChatCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await liveChatModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return liveChatCtl;
};
