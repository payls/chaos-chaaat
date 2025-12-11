const h = require('../helpers');

module.exports.makeController = (models) => {
  const { live_chat_settings: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      agency_user_fk,
      allowed_domain,
      chat_start_time,
      chat_end_time,
      chat_frequency,
      styles,
      salesforce_enabled,
      salesforce_transmission_type,
      salesforce_chat_logs_transmission_enabled,
      salesforce_chat_logs_transmission_field,
      api_url,
      api_oauth_url,
      api_update_url,
      api_message_url,
      api_data_pull_url,
      oauth_method,
      create_method,
      update_method,
      message_method,
      add_salesforce_id,
      pull_method,
      api_client_id,
      api_client_secret,
      api_token,
      api_update_token,
      api_message_token,
      field_configuration,
      waba_number,
      whatsapp_salesforce_enabled,
      line_salesforce_enabled,
      created_by,
    } = record;
    const live_chat_settings_id = h.general.generateId();
    await model.create(
      {
        live_chat_settings_id,
        agency_fk,
        agency_user_fk,
        allowed_domain,
        chat_start_time,
        chat_end_time,
        chat_frequency,
        styles,
        salesforce_enabled,
        salesforce_transmission_type,
        salesforce_chat_logs_transmission_enabled,
        salesforce_chat_logs_transmission_field,
        api_url,
        api_oauth_url,
        api_update_url,
        api_message_url,
        api_data_pull_url,
        oauth_method,
        create_method,
        update_method,
        message_method,
        add_salesforce_id,
        pull_method,
        api_client_id,
        api_client_secret,
        api_token,
        api_update_token,
        api_message_token,
        field_configuration,
        waba_number,
        whatsapp_salesforce_enabled,
        line_salesforce_enabled,
        created_by,
      },
      { transaction },
    );
    return live_chat_settings_id;
  };

  ctr.update = async (live_chat_settings_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      live_chat_settings_id,
      record,
    });
    await model.update(record, {
      where: { live_chat_settings_id },
      transaction,
    });
    return live_chat_settings_id;
  };

  ctr.findAll = async (where, { order, include, transaction } = {}) => {
    const funcName = 'ctr.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one landing page record
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_slug: string
   * 	status: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  ctr.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'ctr.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroy = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete All
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findAll({
      where: { ...where },
      transaction,
    });
    if (record) await model.destroy({ where: { ...where } }, { transaction });
  };

  /**
   * Function used to get live chat settings data for public use
   *
   * @async
   * @constant
   * @name getPublicData
   */
  ctr.getPublicData = async (where, { order, transaction } = {}) => {
    const funcName = 'ctr.getPublicData';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });

    const record = await model.findOne({
      where: { ...where },
      attributes: [
        'live_chat_settings_id',
        'agency_fk',
        'agency_user_fk',
        'chat_start_time',
        'chat_end_time',
        'chat_frequency',
        'styles',
        'field_configuration',
      ],
      include: [
        {
          model: models.agency_user,
          attributes: ['agency_user_id', 'user_fk', 'agency_fk'],
          include: [
            {
              model: models.user,
              attributes: [
                'user_id',
                'full_name',
                'first_name',
                'middle_name',
                'last_name',
                'profile_picture_url',
              ],
            },
          ],
        },
      ],
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Function used to get live chat settings data for logged in session use
   *
   * @async
   * @constant
   * @name getSettingsData
   */
  ctr.getSettingsData = async (where, { transaction } = {}) => {
    const funcName = 'ctr.getSettingsData';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });

    const record = await model.findOne({
      where: { ...where },
      attributes: [
        'live_chat_settings_id',
        'agency_fk',
        'agency_user_fk',
        'allowed_domain',
        'chat_start_time',
        'chat_end_time',
        'chat_frequency',
        'styles',
        'field_configuration',
        'salesforce_enabled',
        'whatsapp_salesforce_enabled',
        'line_salesforce_enabled',
        'salesforce_transmission_type',
        'salesforce_chat_logs_transmission_enabled',
        'salesforce_chat_logs_transmission_field',
        'api_oauth_url',
        'api_url',
        'api_update_url',
        'add_salesforce_id',
        'api_data_pull_url',
        'api_client_id',
        'api_client_secret',
        'api_token',
        'api_update_token',
        'waba_number',
        'status',
      ],
      include: [
        {
          model: models.agency_user,
          attributes: ['agency_user_id', 'user_fk', 'agency_fk'],
          include: [
            {
              model: models.user,
              attributes: [
                'user_id',
                'full_name',
                'first_name',
                'middle_name',
                'last_name',
                'profile_picture_url',
              ],
            },
          ],
        },
      ],
      transaction,
    });

    if (h.isEmpty(record)) {
      return h.database.formatData(record);
    }

    record.api_client_id = h.notEmpty(record.api_client_id);
    record.api_client_secret = h.notEmpty(record.api_client_secret);
    record.api_token = h.notEmpty(record.api_token);
    record.api_update_token = h.notEmpty(record.api_update_token);

    return h.database.formatData(record);
  };

  ctr.validateUpdateCredentialValues = async ({ to_save, db_values, log }) => {
    const {
      api_oauth_url,
      api_client_id,
      api_client_secret,
      api_url,
      api_token,
      api_update_url,
      api_update_token,
      api_data_pull_url,
      add_salesforce_id,
    } = db_values;

    // checking the create endpoint
    const finalCreateURL =
      to_save.api_url !== undefined ? to_save.api_url : api_url;
    const finalCreateToken =
      to_save.api_token !== undefined ? to_save.api_token : api_token;
    const createWithValues =
      h.notEmpty(finalCreateURL) && h.notEmpty(finalCreateToken);
    const createWithoutValues =
      h.isEmpty(finalCreateURL) && h.isEmpty(finalCreateToken);
    console.log(
      'CREAAAAATEEEE',
      finalCreateURL,
      finalCreateToken,
      createWithValues,
      createWithoutValues,
    );
    if (
      (to_save.api_url !== undefined || to_save.api_token !== undefined) &&
      !createWithValues &&
      !createWithoutValues
    ) {
      return {
        allowed: false,
        endpoint: 'create',
        message: '2-live-chat-settings-1692757100-create-endpoint-incomplete',
      };
    }

    // checking the update endpoint
    const finalUpdateURL =
      to_save.api_update_url !== undefined
        ? to_save.api_update_url
        : api_update_url;
    const finalUpdateToken =
      to_save.api_update_token !== undefined
        ? to_save.api_update_token
        : api_update_token;
    const updateWithValues =
      h.notEmpty(finalUpdateURL) && h.notEmpty(finalUpdateToken);
    const updateWithoutValues =
      h.isEmpty(finalUpdateURL) && h.isEmpty(finalUpdateToken);
    if (
      (to_save.api_update_url !== undefined ||
        to_save.api_update_token !== undefined) &&
      !updateWithValues &&
      !updateWithoutValues
    ) {
      return {
        allowed: false,
        endpoint: 'update',
        message: '2-live-chat-settings-1692757100-update-endpoint-incomplete',
      };
    }

    const finalAddToSFID =
      to_save.add_salesforce_id !== undefined
        ? to_save.add_salesforce_id
        : add_salesforce_id;
    if (h.cmpBool(finalAddToSFID, true)) {
      if (
        (to_save.add_salesforce_id !== undefined ||
          to_save.api_update_url !== undefined ||
          to_save.api_update_token !== undefined) &&
        !updateWithValues &&
        !updateWithoutValues
      ) {
        return {
          allowed: false,
          endpoint: 'update',
          message: '2-live-chat-settings-1692757100-update-endpoint-incomplete',
        };
      }
    }

    // checking the oauth endpoint
    const finalOauthURL =
      to_save.api_oauth_url !== undefined
        ? to_save.api_oauth_url
        : api_oauth_url;
    const finalClientID =
      to_save.api_client_id !== undefined
        ? to_save.api_client_id
        : api_client_id;
    const finalClientSecret =
      to_save.api_client_secret !== undefined
        ? to_save.api_client_secret
        : api_client_secret;
    const oauthWithValues =
      h.notEmpty(finalOauthURL) &&
      h.notEmpty(finalClientID) &&
      h.notEmpty(finalClientSecret);
    const oauthWithoutValues =
      h.isEmpty(finalOauthURL) &&
      h.isEmpty(finalClientID) &&
      h.isEmpty(finalClientSecret);
    if (
      (to_save.api_oauth_url !== undefined ||
        to_save.api_client_id !== undefined ||
        to_save.api_client_secret !== undefined) &&
      !oauthWithValues &&
      !oauthWithoutValues
    ) {
      return {
        allowed: false,
        endpoint: 'oauth',
        message: '2-live-chat-settings-1692757100-oauth-endpoint-incomplete',
      };
    }

    const finalPullURL =
      to_save.api_data_pull_url !== undefined
        ? to_save.api_data_pull_url
        : api_data_pull_url;
    if (h.notEmpty(finalPullURL)) {
      if (
        (to_save.api_data_pull_url !== undefined ||
          to_save.api_oauth_url !== undefined ||
          to_save.api_client_id !== undefined ||
          to_save.api_client_secret !== undefined) &&
        !oauthWithValues &&
        !oauthWithoutValues
      ) {
        return {
          allowed: false,
          endpoint: 'oauth',
          message: '2-live-chat-settings-1692757100-oauth-endpoint-incomplete',
        };
      }
    }

    return { allowed: true };
  };

  return ctr;
};
