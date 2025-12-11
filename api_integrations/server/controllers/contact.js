const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');

module.exports.makeContactController = (models) => {
  const { contact: contactModel } = models;
  const contactController = {};
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const cronJobController = require('./cronJob').makeCronJobController(models);

  /**
   * Create contact record
   * @param {{
   *  first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  permalink?: string,
   *  permalink_message?: string,
   *  permalink_sent_date?: Date,
   *  permalink_last_opened?: Date,
   *  lead_status?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
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
      permalink,
      permalink_message,
      permalink_sent_date,
      permalink_last_opened,
      lead_status,
      is_general_enquiry,
      profile_picture_url,
      agency_fk,
      agency_user_fk,
      status,
      agent_email_preference,
      contact_email_preference,
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
        permalink,
        permalink_message,
        permalink_sent_date,
        permalink_last_opened,
        lead_status,
        is_general_enquiry,
        profile_picture_url,
        agency_fk,
        agency_user_fk,
        status,
        agent_email_preference,
        contact_email_preference,
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
   *  permalink?: string,
   *  permalink_message?: string,
   *  permalink_sent_date?: dateTime,
   *  permalink_last_opened?: dateTime,
   *  lead_status?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *	updated_by: string
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
      lead_score,
      permalink,
      permalink_message,
      permalink_sent_date,
      permalink_last_opened,
      lead_status,
      is_general_enquiry,
      profile_picture_url,
      agency_fk,
      agency_user_fk,
      status,
      agent_email_preference,
      contact_email_preference,
      updated_by,
    } = record;
    await contactModel.update(
      {
        first_name,
        last_name,
        email,
        mobile_number,
        lead_score,
        permalink,
        permalink_message,
        permalink_sent_date,
        permalink_last_opened,
        lead_status,
        is_general_enquiry,
        profile_picture_url,
        agency_fk,
        agency_user_fk,
        status,
        agent_email_preference,
        contact_email_preference,
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
   *  permalink?: string,
   *  permalink_message?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{
   * 	first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  permalink?: string,
   *  permalink_message?: string,
   *  permalink_sent_date?: dateTime,
   *  permalink_last_opened?: dateTime,
   *  lead_status?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
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
      lead_score,
      permalink,
      permalink_message,
      permalink_sent_date,
      permalink_last_opened,
      lead_status,
      is_general_enquiry,
      profile_picture_url,
      agency_fk,
      agency_user_fk,
      status,
      agent_email_preference,
      contact_email_preference,
      updated_by,
    } = record;
    return await contactModel.update(
      {
        first_name,
        last_name,
        email,
        mobile_number,
        lead_score,
        permalink,
        permalink_message,
        permalink_sent_date,
        permalink_last_opened,
        lead_status,
        is_general_enquiry,
        profile_picture_url,
        agency_fk,
        agency_user_fk,
        status,
        agent_email_preference,
        contact_email_preference,
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
   *  permalink?: string,
   *  permalink_message?: string,
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
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
   *  mobile_number?: string
   *  permalink?: string,
   *  permalink_message?: string
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
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
   *  mobile_number?: string
   *  permalink?: string,
   *  permalink_message?: string
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
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
   *  mobile_number?: string
   *  permalink?: string,
   *  permalink_message?: string
   *  is_general_enquiry?: boolean,
   *  profile_picture_url?: string
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   * 	agent_email_preference?: boolean,
   * 	contact_email_preference?: boolean,
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
    // Preventing unsigned integer to go below 0
    if (amount < 0) {
      const contact = await contactController.findOne(
        { contact_id: contact_id },
        transaction,
      );
      if (contact.lead_score + amount < 0) {
        await contact.update({ lead_score: 0 });
        return;
      }
    }
    await contactModel.increment(
      { lead_score: amount },
      { where: { contact_id: contact_id }, transaction },
    );
  };

  /**
   * Send contact assignment notification email
   * Only triggers when an agency user is first assigned to a contact
   * also when the assignee is not the one being assigned
   * @param {string} contact
   * @param { obj } hubspot_contact_owner
   */
  contactController.sendContactAssignmentNotificationEmail = async (
    contact_id,
    contact_owner = {},
  ) => {
    const funcName = 'contactController.sendContactAssignmentNotificationEmail';
    h.validation.requiredParams(funcName, { contact_id });
    console.log('Executing ' + funcName + '......');

    const contact = await contactController.findOne({ contact_id: contact_id });
    if (h.isEmpty(contact)) {
      console.log("Can't find newly created contact");
      console.log(
        'Skipping Email Notification because contact cannot be found.',
      );

      return undefined;
    }

    const contact_name = h.notEmpty(contact.dataValues)
      ? h.user.formatFirstMiddleLastName(contact.dataValues)
      : h.user.formatFirstMiddleLastName(contact);

    // predefine contact owner email and name
    let agent_name = '';
    let agent_email = '';

    // retrieve agency_user incl user
    const agency_user_id = h.notEmpty(contact.dataValues)
      ? contact.dataValues.agency_user_fk
      : contact.agency_user_fk;

    // Only send email if we manage to find agency_user_id
    if (h.notEmpty(agency_user_id)) {
      const agency_user = await agencyUserController.findOne(
        { agency_user_id: agency_user_id },
        {
          include: {
            model: models.user,
            required: true,
          },
        },
      );
      agent_name = h.notEmpty(agency_user.dataValues)
        ? h.user.capitalizeFirstLetter(
            (agency_user.dataValues &&
              agency_user.dataValues.user &&
              agency_user.dataValues.user.first_name) ||
              '',
          )
        : h.user.capitalizeFirstLetter(
            (agency_user.user && agency_user.user.first_name) || '',
          );

      agent_email = h.notEmpty(agency_user.dataValues)
        ? agency_user.dataValues.user.email
        : agency_user.user.email;
    } else if (h.notEmpty(contact_owner)) {
      agent_name = contact_owner.firstName ? contact_owner.firstName : '';
      agent_email = contact_owner.email;
    }

    if (h.notEmpty(agent_email)) {
      const subject_template =
        contact_name && contact_name.trim() !== ''
          ? 'template-request-contact-assignment-email-subject-1655190776633'
          : 'template-request-contact-assignment-email-subject-no-contact-name-1655190776633';

      const subject_message = h.getMessageByCode(subject_template, {
        CONTACT_NAME: contact_name,
      });

      const template =
        contact_name && contact_name.trim() !== ''
          ? 'template-request-contact-assignment-email-body-1655190776633'
          : 'template-request-contact-assignment-email-body-no-contact-name-1655190776633';

      const body_message = h.getMessageByCode(template, {
        AGENT_NAME: agent_name && agent_name.trim(),
        CONTACT_NAME: contact_name && contact_name.trim(),
        CREATE_PROPOSAL_LINK: `${config.webAdminUrl}/dashboard/sales/create-link?contact_id=${contact_id}&form_mode=add`,
      });

      const contactId = contact_id;
      const agencyUserId = agency_user_id || contact.agency_user_fk;
      const agencyId = contact.agency_fk;

      const AGENCY_DISABLED_FOR_EMAIL_NOTIF =
        process.env.AGENCY_DISABLED_FOR_EMAIL_NOTIF || '';

      // @TODO need to add proper feature for email disabling, this is just a hotfix
      const EMAILS_DISABLED_FOR_EMAIL_NOTIF =
        process.env.EMAILS_DISABLED_FOR_EMAIL_NOTIF || '';

      const blockedAgencies = AGENCY_DISABLED_FOR_EMAIL_NOTIF.split(',');
      const blockedEmails = EMAILS_DISABLED_FOR_EMAIL_NOTIF.split(',');

      const isAgencyBlocked = blockedAgencies.find(
        (_agency_id) => _agency_id === agencyId,
      );

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

      if (isAgencyBlocked)
        console.log(
          `AGENCY_ID: ${agencyId} is blocked to receive email notifications.`,
        );

      if (!isAgencyBlocked && contactId && agencyUserId) {
        const payload = {
          agent_email,
          subject_message,
          body_message,
          contact_id: contactId,
          agency_user_id: agencyUserId,
        };

        await cronJobController.create({
          type: constant.CRON_JOB.TYPES.CONTACT_ASSIGNMENT_NOTIF,
          payload,
        });
      }
    } else {
      console.log(
        'Failed to find contact owner email. Failed to send contact assignment notification email.',
      );
    }
  };

  return contactController;
};
