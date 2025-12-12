const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const moment = require('moment');

module.exports.makeContactController = (models) => {
  const {
    contact: contactModel,
    user: userModel,
    agency_user: agencyUserModel,
    contact_lead_score: contactLeadScoreModel,
  } = models;
  const contactController = {};
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const userController = require('./user').makeUserController(models);
  const cronJobController = require('./cronJob').makeCronJobController(models);
  const agencyNotification = require('./agencyNotification').makeController(
    models,
  );
  const agencySubscription = require('./agencySubscription').makeController(
    models,
  );
  const agencySubscriptionProduct =
    require('./agencySubscriptionProduct').makeController(models);
  const productMatrix = require('./chaaatProductMatrix').makeController(models);
  const automationRule = require('./automationRule').makeController(models);
  const wabaConfig = require('./agencyWhatsappConfig').makeController(models);
  const campaignInventory = require('./campaignInventory').makeController(
    models,
  );
  const messageInventory = require('./messageInventory').makeController(models);
  const contactSourceController =
    require('./contactSource').makeContactSourceController(models);

  /**
   * Create contact record
   * @param {{
   *  first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  permalink?: string,
   *  permalink_message?: string,
   *  permalink_sent_date?: Date,
   *  permalink_last_opened?: Date,
   *  lead_status?: string,
   *  buy_status?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   *  labels: string
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  last_24_hour_lead_score?: number,
   *  last_48_hour_lead_score?: number,
   *  last_24_hour_lead_score_diff?: number,
   *  enquiry_email_timestamp: Date,
   *  from_export: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *  whatsapp_engagement: boolean,
   *  paused_automation: boolean,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactController.create = async (record, { transaction } = {}) => {
    const funcName = 'contactController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      first_name,
      last_name,
      email,
      mobile_number,
      company,
      title,
      is_whatsapp,
      line_user_id,
      opt_out_line,
      opt_out_line_date,
      messenger_id,
      opt_out_messenger,
      opt_out_messenger_date,
      is_agency_sms_connection,
      permalink,
      permalink_message,
      permalink_sent_date,
      permalink_last_opened,
      priority,
      lead_status,
      lead_source,
      buy_status,
      subscriber_status,
      manual_label,
      is_general_enquiry,
      profile_picture_url,
      agency_fk,
      labels = '',
      agency_user_fk,
      status,
      agent_email_preference,
      contact_email_preference,
      enquiry_email_timestamp,
      from_export,
      has_appointment,
      appointment_date,
      opt_out_whatsapp,
      opt_out_whatsapp_date,
      created_by,
    } = record;
    const contact_id = h.general.generateId();
    await contactModel.create(
      {
        contact_id,
        first_name,
        last_name,
        email,
        mobile_number,
        company,
        title,
        priority,
        lead_source,
        subscriber_status,
        manual_label,
        has_appointment,
        is_whatsapp,
        line_user_id,
        opt_out_line,
        opt_out_line_date,
        messenger_id,
        opt_out_messenger,
        opt_out_messenger_date,
        is_agency_sms_connection,
        permalink,
        permalink_message,
        permalink_sent_date,
        permalink_last_opened,
        lead_status,
        buy_status,
        is_general_enquiry,
        profile_picture_url,
        agency_fk,
        labels,
        agency_user_fk,
        status,
        agent_email_preference,
        contact_email_preference,
        enquiry_email_timestamp,
        from_export,
        appointment_date,
        opt_out_whatsapp,
        opt_out_whatsapp_date,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_id;
  };

  /**
   * Update contact record
   * @param {string} contact_id
   * @param {{
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  permalink?: string,
   *  permalink_message?: string,
   *  permalink_sent_date?: dateTime,
   *  permalink_last_opened?: dateTime,
   *  lead_status?: string,
   *  buy_status?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * labels: string
   * 	agency_user_fk: string,
   * 	status: string,
   *  lead_score?: number,
   *  last_24_hour_lead_score?: number,
   *  last_48_hour_lead_score?: number,
   *  last_24_hour_lead_score_diff?: number,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  enquiry_email_timestamp?: Date,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	updated_by: string
   *  whatsapp_engagement: boolean,
   *  paused_automation: boolean,
   *  opt_out_whatsapp,
   *  opt_out_whatsapp_date,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactController.update = async (
    contact_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactController.update';
    h.validation.requiredParams(funcName, { contact_id, record });
    const {
      first_name,
      last_name,
      email,
      mobile_number,
      company,
      title,
      priority,
      lead_source,
      subscriber_status,
      manual_label,
      has_appointment,
      is_whatsapp,
      is_agency_sms_connection,
      line_user_id,
      opt_out_line,
      opt_out_line_date,
      messenger_id,
      opt_out_messenger,
      opt_out_messenger_date,
      lead_score,
      last_24_hour_lead_score,
      last_48_hour_lead_score,
      last_24_hour_lead_score_diff,
      permalink,
      permalink_message,
      permalink_sent_date,
      permalink_last_opened,
      permalink_template,
      lead_status,
      buy_status,
      is_general_enquiry,
      profile_picture_url,
      agency_fk,
      labels,
      agency_user_fk,
      status,
      whatsapp_engagement,
      paused_automation,
      agent_email_preference,
      contact_email_preference,
      enquiry_email_timestamp,
      from_export,
      appointment_date,
      opt_out_whatsapp,
      opt_out_whatsapp_date,
      updated_by,
    } = record;
    await contactModel.update(
      {
        first_name,
        last_name,
        email,
        mobile_number,
        company,
        title,
        priority,
        lead_source,
        subscriber_status,
        manual_label,
        has_appointment,
        is_whatsapp,
        is_agency_sms_connection,
        line_user_id,
        opt_out_line,
        opt_out_line_date,
        messenger_id,
        opt_out_messenger,
        opt_out_messenger_date,
        lead_score,
        last_24_hour_lead_score,
        last_48_hour_lead_score,
        last_24_hour_lead_score_diff,
        permalink,
        permalink_message,
        permalink_sent_date,
        permalink_last_opened,
        permalink_template,
        lead_status,
        buy_status,
        is_general_enquiry,
        profile_picture_url,
        agency_fk,
        labels,
        agency_user_fk,
        status,
        whatsapp_engagement,
        paused_automation,
        agent_email_preference,
        contact_email_preference,
        enquiry_email_timestamp,
        from_export,
        appointment_date,
        opt_out_whatsapp,
        opt_out_whatsapp_date,
        updated_by,
      },
      { where: { contact_id }, transaction },
    );
    return contact_id;
  };

  /**
   * Bulk Update contact records
   * @param {{
   *  contact_id?: string,
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  permalink?: string,
   *  permalink_message?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  enquiry_email_timestamp?: Date,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  permalink?: string,
   *  permalink_message?: string,
   *  permalink_sent_date?: dateTime,
   *  permalink_last_opened?: dateTime,
   *  lead_status?: string,
   *  buy_status?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactController.bulkUpdate = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactController.bulkUpdate';
    h.validation.requiredParams(funcName, { where, record });
    const {
      first_name,
      last_name,
      email,
      mobile_number,
      is_whatsapp,
      is_agency_sms_connection,
      lead_score,
      last_24_hour_lead_score,
      last_48_hour_lead_score,
      last_24_hour_lead_score_diff,
      permalink,
      permalink_message,
      permalink_sent_date,
      permalink_last_opened,
      lead_status,
      buy_status,
      is_general_enquiry,
      profile_picture_url,
      agency_fk,
      agency_user_fk,
      status,
      agent_email_preference,
      contact_email_preference,
      enquiry_email_timestamp,
      from_export,
      has_appointment,
      appointment_date,
      updated_by,
    } = record;
    return await contactModel.update(
      {
        first_name,
        last_name,
        email,
        mobile_number,
        is_whatsapp,
        is_agency_sms_connection,
        lead_score,
        last_24_hour_lead_score,
        last_48_hour_lead_score,
        last_24_hour_lead_score_diff,
        permalink,
        permalink_message,
        permalink_sent_date,
        permalink_last_opened,
        lead_status,
        buy_status,
        is_general_enquiry,
        profile_picture_url,
        agency_fk,
        agency_user_fk,
        status,
        agent_email_preference,
        contact_email_preference,
        enquiry_email_timestamp,
        from_export,
        has_appointment,
        appointment_date,
        updated_by,
      },
      { where: { ...where }, transaction },
    );
  };

  /**
   * Find all contact records
   * @param {{
   *  contact_id?: string,
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  opt_out_whatsapp?: boolean,
   *  opt_out_sms?: boolean,
   *  permalink?: string,
   *  permalink_message?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  enquiry_email_timestamp?: Date,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, attributes } = {},
  ) => {
    const funcName = 'contactController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      attributes,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one contact record
   * @param {{
   *  contact_id?: string,
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  opt_out_whatsapp?: boolean,
   *  opt_out_sms?: boolean,
   *  permalink?: string,
   *  permalink_message?: string
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  enquiry_email_timestamp?: Date,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'contactController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Count contacts
   * @param {{
   *  contact_id?: string,
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  opt_out_whatsapp?: boolean,
   *  opt_out_sms?: boolean,
   *  permalink?: string,
   *  permalink_message?: string
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  enquiry_email_timestamp?: Date,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactController.count = async (where, { include, transaction } = {}) => {
    const funcName = 'contactController.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Count contact permalinks that are not empty
   * @param {{
   *  contact_id?: string,
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  is_agency_sms_connection?: boolean,
   *  opt_out_whatsapp?: boolean,
   *  opt_out_sms?: boolean,
   *  permalink?: string,
   *  permalink_message?: string
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *  enquiry_email_timestamp?: Date,
   *  from_export?: boolean,
   *  has_appointment: boolean,
   *  appointment_date: Date,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactController.countPermaLinks = async (where, { transaction } = {}) => {
    const records = await contactModel.count({
      where: { ...where, permalink: { [Op.ne]: '' } },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete contact record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Add lead score to contact, can also be used for minusing
   * @param {int} amount
   * @param {string} contact
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactController.addLeadScore = async (
    amount,
    contact_id,
    { transaction },
  ) => {
    const funcName = 'contactController.addLeadScore';
    h.validation.requiredParams(funcName, { amount, contact_id });
    // insert record to contact_lead_score
    await contactLeadScoreModel.create(
      {
        contact_lead_score_id: h.general.generateId(),
        contact_fk: contact_id,
        score: amount,
      },
      { transaction },
    );
    // Preventing unsigned integer to go below 0
    if (amount < 0) {
      const contact = await contactController.findOne(
        { contact_id: contact_id },
        transaction,
      );
      if (contact.lead_score + amount < 0) {
        await contact.update({ lead_score: 0 });
        await contactModel.increment(
          {
            last_24_hour_lead_score: amount,
            last_24_hour_lead_score_diff: amount,
          },
          { where: { contact_id: contact_id }, transaction },
        );
        return;
      }
    }
    await contactModel.increment(
      {
        lead_score: amount,
        last_24_hour_lead_score: amount,
        last_24_hour_lead_score_diff: amount,
      },
      { where: { contact_id: contact_id }, transaction },
    );
  };

  /**
   * Send contact assignment notification email
   * Only triggers when an agency user is first assigned to a contact
   * also when the assignee is not the one being assigned
   * @param {string} contact
   */
  contactController.sendContactAssignmentNotificationEmail = async (
    contact_id,
  ) => {
    const funcName = 'contactController.sendContactAssignmentNotificationEmail';
    h.validation.requiredParams(funcName, { contact_id });

    const contact = await contactController.findOne({ contact_id: contact_id });

    const agencyId = contact.agency_fk;
    // retrieve agency_user incl user
    const agency_user_id = h.notEmpty(contact.dataValues)
      ? contact.dataValues.agency_user_fk
      : contact.agency_user_fk;

    const AGENCY_DISABLED_FOR_EMAIL_NOTIF =
      process.env.AGENCY_DISABLED_FOR_EMAIL_NOTIF || '';

    // @TODO need to add proper feature for email disabling, this is just a hotfix
    const EMAILS_DISABLED_FOR_EMAIL_NOTIF =
      process.env.EMAILS_DISABLED_FOR_EMAIL_NOTIF ||
      'john@yourpave.com,john+hubspot@yourpave.com';

    const blockedAgencies = AGENCY_DISABLED_FOR_EMAIL_NOTIF.split(',');
    const blockedEmails = EMAILS_DISABLED_FOR_EMAIL_NOTIF.split(',');

    const isAgencyBlocked = blockedAgencies.find(
      (_agency_id) => _agency_id === agencyId,
    );

    if (isAgencyBlocked)
      console.log(
        `AGENCY_ID: ${agencyId} is blocked to receive email notifications.`,
      );

    // Only send email if we manage to find agency_user_id
    if (!isAgencyBlocked && h.notEmpty(agency_user_id)) {
      const agency_user = await agencyUserController.findOne(
        { agency_user_id: agency_user_id },
        {
          include: {
            model: models.user,
            required: true,
          },
        },
      );

      const contact_name = h.notEmpty(contact.dataValues)
        ? h.user.formatFirstMiddleLastName(contact.dataValues)
        : h.user.formatFirstMiddleLastName(contact);

      const agent_name = h.notEmpty(agency_user.dataValues)
        ? h.user.capitalizeFirstLetter(
            agency_user.dataValues.user
              ? agency_user.dataValues.user.first_name
              : '',
          )
        : h.user.capitalizeFirstLetter(
            agency_user ? agency_user.user.first_name : '',
          );

      const subject_template =
        contact_name && contact_name.trim() !== ''
          ? 'template-request-contact-assignment-email-subject-1655190776633'
          : 'template-request-contact-assignment-email-subject-no-contact-name-1655190776633';

      const subject_message = h.getMessageByCode(subject_template, {
        CONTACT_NAME: contact_name,
      });
      const agent_email = h.notEmpty(agency_user.dataValues)
        ? agency_user.dataValues.user.email
        : agency_user.user.email;

      // check if email is blocked
      const isEmailIsBlocked = blockedEmails.find(
        (email) => email === agent_email,
      );

      if (isEmailIsBlocked) {
        console.log(
          `EMAIL: ${agent_email} is blocked to receive email notifications.`,
        );

        return undefined;
      }

      const template =
        contact_name && contact_name.trim() !== ''
          ? 'template-request-contact-assignment-email-body-1655190776633'
          : 'template-request-contact-assignment-email-body-no-contact-name-1655190776633';

      const body_message = h.getMessageByCode(template, {
        AGENT_NAME: agent_name && agent_name.trim(),
        CONTACT_NAME: contact_name && contact_name.trim(),
        CREATE_PROPOSAL_LINK: `${config.webAdminUrl}/dashboard/sales/create-link?contact_id=${contact_id}&form_mode=add`,
      });

      const payload = {
        agent_email,
        subject_message,
        body_message,
        contact_id,
        agency_user_id,
      };

      await cronJobController.create({
        type: constant.CRON_JOB.TYPES.CONTACT_ASSIGNMENT_NOTIF,
        payload,
      });
    } else {
      console.log(
        'Failed to find agency_user_id. Failed to send contact assignment notification email.',
      );
    }
  };

  /**
   * Description
   * Function to archive selected contacts
   * @async
   * @name archivedContacts
   * @param {array} contact_ids collection of contact IDs to be archived
   * @param {string} user_id current user ID that triggered the archive request
   * @returns {Promise} list of all contact IDs affected by the archive
   */
  contactController.archivedContacts = async (contact_ids, user_id) => {
    const archivedContactIds = await h.database.transaction(
      async (transaction) => {
        const archivedContactIds = [];
        for (const contact_id of contact_ids) {
          const archivedContactId = await contactController.update(
            contact_id,
            {
              status: constant.CONTACT.STATUS.ARCHIVED,
              updated_by: user_id,
            },
            { transaction },
          );
          archivedContactIds.push(archivedContactId);
        }
        return archivedContactIds;
      },
    );

    return archivedContactIds;
  };

  /**
   * Description
   * Function to check if an agency is still eligible to add new contacts
   * @async
   * @constant
   * @name checkIfCanAddNewContact
   * @param {string} agency_id Agency ID to check
   */
  contactController.checkIfCanAddNewContact = async (agency_id) => {
    const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
    const is_legacy = legacy_agencies.includes(agency_id);

    if (h.cmpBool(is_legacy, true)) {
      return { can_continue: true, reason: null };
    }
    const currentDate = moment();
    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );

    // if no subscription is found
    if (h.isEmpty(subscription)) {
      const reason = '2-subscription-contact-1688322115';
      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        null,
        constant.NOTIFICATION.ACTION.CREATE_CONTACT,
        constant.NOTIFICATION.TYPE.NO_SUBSCRIPTION,
        `${config.webAdminUrl}/billing`,
      );
      return { can_continue: false, reason };
    }

    // if with subscription but subscription is expired
    if (
      h.notEmpty(subscription) &&
      h.notEmpty(subscription?.subscription_end) &&
      currentDate.isAfter(moment(subscription?.subscription_end))
    ) {
      const reason = '2-subscription-expired-1688322115';
      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        subscription?.agency_subscription_id,
        constant.NOTIFICATION.ACTION.CREATE_CONTACT,
        constant.NOTIFICATION.TYPE.SUBSCRIPTION_EXPIRED,
        `${config.webAdminUrl}/billing`,
      );
      return { can_continue: false, reason };
    }

    // get subscription main product
    const usage_product_name = subscription?.subscription_name;
    const { allowed_contacts } =
      await agencySubscriptionProduct.getSubscriptionCredits(subscription);

    const where = {
      agency_fk: agency_id,
      status: 'active',
    };

    const active_contact_count = await contactController.count(where);

    if (
      !h.cmpStr(allowed_contacts, 'unlimited') &&
      active_contact_count >= allowed_contacts
    ) {
      const reason = '2-contact-limit-1688322115';
      // const stripe_subscription = await stripe.subscriptions.retrieve(
      //   subscription?.stripe_subscription_id,
      // );
      // const session = await stripe.billingPortal.sessions.create({
      //   customer: stripe_subscription?.customer,
      //   return_url: `${config.webAdminUrl}/dashboard`,
      // });

      const subscription_details =
        await contactController.getOtherEntityDetailsForEmail(
          agency_id,
          subscription,
          usage_product_name,
          active_contact_count,
        );

      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        subscription?.agency_subscription_id,
        constant.NOTIFICATION.ACTION.CREATE_CONTACT,
        constant.NOTIFICATION.TYPE.CONTACT_LIMIT_REACHED,
        `${config.webAdminUrl}/billing`,
        subscription_details,
      );
      return { can_continue: false, reason };
    }

    return { can_continue: true, reason: null };
  };

  /**
   * Description
   * Function to get subscription entity details to be used for email notification
   * @async
   * @constant
   * @name getOtherEntityDetailsForEmail
   * @param {string} agency_id Agency ID to check
   * @param {object} subscription Agency subscription details
   * @param {string} usage_product_name Subscription product name
   * @param {integer} active_contact_count Current active contact count
   */
  contactController.getOtherEntityDetailsForEmail = async (
    agency_id,
    subscription,
    usage_product_name,
    active_contact_count,
  ) => {
    // get matrix based on product name
    const { product_price } = await productMatrix.findOne({
      product_name: usage_product_name,
    });

    const {
      allowed_channels,
      allowed_users,
      allowed_contacts,
      allowed_campaigns,
      allowed_automations,
      allowed_outgoing_messages,
    } = await agencySubscriptionProduct.getSubscriptionCredits(subscription);

    // active rules count
    const active_rules = await automationRule.count(
      {
        status: 'active',
      },
      {
        include: [
          {
            model: models.automation_category,
            required: true,
            where: {
              agency_fk: agency_id,
            },
          },
        ],
      },
    );

    // waba count
    const waba_count = await wabaConfig.count({
      agency_fk: agency_id,
    });

    // total campaigns
    const campaign_inventory = await campaignInventory.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });

    // total outgoing mesages
    const message_inventory = await messageInventory.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });

    // total user count
    const user_count = await userController.count(
      { status: 'active' },
      {
        include: [
          {
            model: models.agency_user,
            where: {
              agency_fk: agency_id,
            },
            required: true,
          },
          {
            model: models.user_role,
            where: {
              user_role: {
                [Op.notIn]: ['super_admin', 'staff_admin'],
              },
            },
            required: true,
          },
        ],
      },
    );

    let subscription_details = '<ul>';
    subscription_details += `<li>Subscription: ${usage_product_name} ($${product_price} Monthly Plan)</li>`;
    subscription_details += `<li>Users: ${user_count}/${allowed_users}</li>`;
    subscription_details += `<li>Channels: ${waba_count}/${allowed_channels}</li>`;
    subscription_details += `<li>Campaigns Per Month: ${campaign_inventory?.campaign_count}/${allowed_campaigns}</li>`;
    subscription_details += `<li>Messages Per Month: ${message_inventory?.virtual_count}/${allowed_outgoing_messages}</li>`;
    subscription_details += `<li>Rules/Automations: ${active_rules}/${allowed_automations}</li>`;
    subscription_details += `<li><b>Active Contacts: ${active_contact_count}/${allowed_contacts}</b></li>`;
    subscription_details += '</ul>';

    return subscription_details;
  };

  /**
   * Description
   * Function to ubsubscribe dealz subscription
   * @async
   * @constant
   * @name unsubscribeDealz
   * @param {FastifyRequest} request server request
   * @param {string} contact_id contact id
   */
  contactController.unsubscribeDealz = async ({ request, contact_id }) => {
    const contactSource = await contactSourceController.findOne({
      contact_fk: contact_id,
      source_type: 'WIX',
    });
    if (h.notEmpty(contactSource)) {
      const data = {
        action: 'chaaat_unsubscribe',
        contactId: contact_id,
      };
      await request.rabbitmq.wixWebhookPayloadProcess({
        data,
        consumerType: constant.AMQ.CONSUMER_TYPES.WIX_PROCESS_WEBHOOK_PAYLOAD,
      });
    }
  };

  /**
   * Description
   * Function to update contact into wix
   * @async
   * @constant
   * @name updateContactToWix
   * @param {FastifyRequest} request server request
   * @param {string} contact_id contact id
   */
  contactController.updateContactToWix = async ({ request, contact_id }) => {
    const contactSource = await contactSourceController.findOne({
      contact_fk: contact_id,
      source_type: 'WIX',
    });
    if (h.notEmpty(contactSource)) {
      const data = {
        action: 'chaaat_contact_update',
        contactId: contact_id,
      };
      await request.rabbitmq.wixWebhookPayloadProcess({
        data,
        consumerType: constant.AMQ.CONSUMER_TYPES.WIX_PROCESS_WEBHOOK_PAYLOAD,
      });
    }
  };

  return contactController;
};
