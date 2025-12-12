const constant = require('../constants/constant.json');
const h = require('../helpers');
module.exports.makeAgencyController = (models) => {
  const { agency: agencyModel } = models;
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const authController = require('./auth').makeAuthController(models);
  const userController = require('./user').makeUserController(models);
  const userRoleController =
    require('./userRole').makeUserRoleController(models);
  const agencyConfigController =
    require('./agencyConfig').makeController(models);
  const agencyWhatsAppConfigController =
    require('./agencyWhatsappConfig').makeController(models);
  const unsubscribeTextController =
    require('./unsubscribeText').makeController(models);

  const agencyController = {};

  /**
   * Create agency record
   * @param {{
   * 	agency_name: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyController.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_name,
      agency_logo_url,
      agency_size,
      agency_type,
      agency_website,
      agency_stripe_customer_id,
      agency_subscription_fk,
      agency_logo_whitebg_url,
      agency_subdomain,
      agency_whatsapp_api_token,
      agency_whatsapp_api_secret,
      agency_waba_id,
      agency_waba_template_token,
      agency_waba_template_secret,
      agency_campaign_additional_recipient,
      campaign_approval_agent,
      default_outsider_contact_owner,
      hubspot_id,
      trial_code,
      created_by,
    } = record;
    const agency_id = h.general.generateId();
    await agencyModel.create(
      {
        agency_id,
        agency_name,
        agency_logo_url,
        agency_size,
        agency_type,
        agency_website,
        agency_stripe_customer_id,
        agency_subscription_fk,
        agency_logo_whitebg_url,
        agency_subdomain,
        agency_whatsapp_api_token,
        agency_whatsapp_api_secret,
        agency_waba_id,
        agency_waba_template_token,
        agency_waba_template_secret,
        agency_campaign_additional_recipient,
        campaign_approval_agent,
        default_outsider_contact_owner,
        hubspot_id,
        trial_code,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return agency_id;
  };

  /**
   * Update agency record
   * @param {string} agency_id
   * @param {{
   * 	agency_name: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyController.update = async (agency_id, record, { transaction } = {}) => {
    const funcName = 'agencyController.update';
    h.validation.requiredParams(funcName, { agency_id, record });
    const {
      agency_name,
      agency_logo_url,
      agency_size,
      agency_type,
      real_estate_type,
      agency_website,
      agency_stripe_customer_id,
      agency_subscription_fk,
      agency_logo_whitebg_url,
      agency_subdomain,
      agency_whatsapp_api_token,
      agency_whatsapp_api_secret,
      agency_waba_id,
      agency_waba_template_token,
      agency_waba_template_secret,
      agency_campaign_additional_recipient,
      campaign_approval_agent,
      default_outsider_contact_owner,
      is_paid,
      hubspot_id,
      updated_by,
      campaign_notification_disable,
    } = record;
    await agencyModel.update(
      {
        agency_name,
        agency_logo_url,
        agency_size,
        agency_type,
        real_estate_type,
        agency_website,
        agency_stripe_customer_id,
        agency_subscription_fk,
        agency_logo_whitebg_url,
        agency_subdomain,
        agency_whatsapp_api_token,
        agency_whatsapp_api_secret,
        agency_waba_id,
        agency_waba_template_token,
        agency_waba_template_secret,
        agency_campaign_additional_recipient,
        campaign_approval_agent,
        default_outsider_contact_owner,
        is_paid,
        hubspot_id,
        updated_by,
        campaign_notification_disable,
      },
      { where: { agency_id }, transaction },
    );
    return agency_id;
  };

  /**
   * Find all agency records
   * @param {{
   *  agency_id?: string,
   * 	agency_name?: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	created_by?: string,
   *  updated_by?: string,
   * agency_whatsapp_api_token?: string,
   * agency_whatsapp_api_secret?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyController.findAll = async (where, { transaction } = {}) => {
    const funcName = 'agencyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one agency record
   * @param {{
   *  agency_id?: string,
   * 	agency_name?: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	created_by?: string,
   *  updated_by?: string,
   * agency_whatsapp_api_token?: string,
   * agency_whatsapp_api_secret?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'agencyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'agencyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Check if a user has registered agency
   * @param user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<>}
   */
  agencyController.getAgencyNameByUserId = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'agencyController.getAgencyNameByUserId';
    h.validation.requiredParams(funcName, { user_id });
    const agency_user = await agencyUserController.findOne(
      { user_fk: user_id },
      { transaction },
    );
    let agency_name = null;
    if (!h.isEmpty(agency_user)) {
      const agency = await agencyController.findOne(
        { agency_id: agency_user.agency_fk },
        { transaction },
      );
      if (!h.isEmpty(agency)) agency_name = agency.agency_name;
    }
    return agency_name;
  };

  /**
   * Check if a user has paid agency
   * @param user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<>}
   */
  agencyController.getAgencyByUserId = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'agencyController.getAgencyByUserId';
    h.validation.requiredParams(funcName, { user_id });
    const agency_user = await agencyUserController.findOne(
      { user_fk: user_id },
      { transaction },
    );
    let agency_name = null;
    let is_paid = 0;
    if (!h.isEmpty(agency_user)) {
      const agency = await agencyController.findOne(
        { agency_id: agency_user.agency_fk },
        { transaction },
      );
      if (!h.isEmpty(agency)) {
        agency_name = agency.agency_name;
        is_paid = agency.is_paid;
      }
    }
    return { agency_name, is_paid };
  };

  /**
   * Description
   * Function for creating Chaaat Support accounts
   * @async
   * @constant
   * @name createSupportAccounts
   * @param {object} data agency data
   */
  agencyController.createSupportAccounts = async (
    data,
    { transaction } = {},
  ) => {
    const support_user = data.user;
    const support = {
      support: {
        first_name: 'Chaaat',
        last_name: 'Support',
      },
    };

    const { agency_id, company_name } = data;

    const password = h.general.generateSupportPassword();
    // for creating an ops user account
    const agencyName = company_name;
    let formattedAgencyName = agencyName
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '');
    // Convert to lowercase
    formattedAgencyName = formattedAgencyName.toLowerCase();
    // Assign 'agency_id' as a default if formattedAgencyName is empty
    if (h.isEmpty(formattedAgencyName)) {
      formattedAgencyName = agency_id;
    }

    // for support account
    const supportEmail = `${support_user}+${formattedAgencyName}@chaaat.io`;
    const supportEmailAuthRes = await authController.registerClientSupportEmail(
      support[support_user].first_name,
      support[support_user].last_name,
      supportEmail,
      password,
      agency_id,
      agencyName,
      {
        buyert_type: null,
        invitee: null,
        transaction,
      },
    );
    const supportUserId = supportEmailAuthRes.record.user_id;
    const supportUser = await userController.findOne(
      { email: supportEmail },
      { transaction },
    );

    if (h.isEmpty(supportUser.password)) {
      await userController.updatePassword(supportUserId, password, undefined, {
        transaction,
      });
    }

    await userRoleController.findOrCreate(
      { user_fk: supportUserId },
      {
        user_fk: supportUserId,
        user_role: constant.USER.ROLE.SUPER_ADMIN,
      },
      { transaction },
    );
  };

  /**
   * Description
   * The function is responsible for setting up trial number and configuration
   * for the newly created agency.
   *
   * @async
   * @constant
   * @name setTrialWABANumberForAgency
   * @param {string} agency_id agency id
   * @param {string} company_name company name
   * @param {string} trial_code trial code
   */
  agencyController.setTrialWABANumberForAgency = async (
    { agency_id, company_name, trial_code },
    { transaction } = {},
  ) => {
    const env_trial_numbers = process.env.CHAAAT_TRIAL_NUMBERS;
    const trial_numbers = env_trial_numbers.split(',');
    // randomize selection of trial number
    const selected_trial_number =
      trial_numbers[Math.floor(Math.random() * trial_numbers.length)];
    // fetch trial number
    const trial_waba_template = await agencyWhatsAppConfigController.findOne({
      waba_number: selected_trial_number,
      trial_number: true,
    });
    const waba_trial_name = `${company_name} Trial WABA`;
    const {
      waba_number,
      agency_whatsapp_api_token,
      agency_whatsapp_api_secret,
      agency_waba_id,
      agency_waba_template_token,
      agency_waba_template_secret,
    } = trial_waba_template;

    // creating trial number record
    const agency_whatsapp_config_id =
      await agencyWhatsAppConfigController.create(
        {
          agency_fk: agency_id,
          waba_name: waba_trial_name,
          waba_number,
          agency_whatsapp_api_token,
          agency_whatsapp_api_secret,
          agency_waba_id,
          agency_waba_template_token,
          agency_waba_template_secret,
          trial_number_to_use: true,
          trial_code,
        },
        { transaction: transaction },
      );

    // add initial unsubscribe text
    await unsubscribeTextController.create(
      {
        agency_fk: agency_id,
        content: 'Unsubscribe',
      },
      { transaction: transaction },
    );

    // create agency config entry with whatsapp configurations
    await agencyConfigController.create(
      {
        agency_fk: agency_id,
        whatsapp_config: JSON.stringify({
          is_enabled: true,
          environment: 'whatsappcloud',
          quick_replies: [
            {
              type: 'template',
              name: 'Interested',
              value: 'interested',
              response: "Great, we'll contact you for more details.",
              send_reply: true,
              opt_out: false,
              email: true,
              cta_reply: 1,
            },
            {
              type: 'template',
              name: 'Not Interested',
              value: 'not interested',
              response:
                'Understand, was there another better timing that may work better for you?',
              send_reply: true,
              opt_out: false,
              email: true,
              cta_reply: 2,
            },
            {
              type: 'template',
              name: 'Unsubscribe',
              value: 'unsubscribe',
              response:
                'Noted! We will not send marketing messages via Whatsapp going forward to you. Do let us know if you change your mind.',
              send_reply: true,
              opt_out: true,
              email: false,
              cta_reply: 3,
            },
            {
              type: 'default',
              name: 'Replied with Text',
              value: 'manual_reply',
              response: '',
              send_reply: false,
              opt_out: false,
              email: true,
              cta_reply: 0,
            },
          ],
        }),
      },
      { transaction: transaction },
    );

    return { agency_whatsapp_config_id, trial_waba_template };
  };

  /**
   * Description
   * Function to generate trial code for a new agency
   * @async
   * @constant
   * @name genereteTrialCode
   * @param {string} trial_code agency trial code
   * @returns {Promise} unique trial code for the agency
   */
  agencyController.genereteTrialCode = async () => {
    let trial_code;
    let agencyCode;

    do {
      trial_code = generateTrialCode();
      agencyCode = await agencyController.findOne({ trial_code });
    } while (agencyCode);

    return trial_code;
  };

  return agencyController;
};

function generateTrialCode() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
