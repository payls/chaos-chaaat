const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
const { Op } = require('sequelize');
const constant = require('../constants/constant.json');
const moment = require('moment');
module.exports.makeController = (models) => {
  const { agency_notification: model } = models;

  const agency = require('./agency').makeAgencyController(models);
  const agencyUser = require('./agencyUser').makeAgencyUserController(models);
  const user = require('./user').makeUserController(models);

  const agencyNotification = {};

  /**
   * Description
   * Function to create an agency_notification record
   * @async
   * @name agencyNotification.create
   * @param {object} record
   *    agency_fk - agency ID
   *    agency_subscription_fk subscription ID if needed
   *    notification_type notification type
   *    notification_subject subject
   *    message notification content
   */
  agencyNotification.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyNotification.create';
    h.validation.requiredParams(funcName, { record });
    const agency_notification_id = h.general.generateId();
    await model.create(
      {
        agency_notification_id,
        ...record,
      },
      { transaction },
    );
    return agency_notification_id;
  };

  /**
   * Description
   * Function to update an agency_notification record
   * @async
   * @name agencyNotification.update
   * @param {object} record
   *    agency_fk - agency ID
   *    agency_subscription_fk subscription ID if needed
   *    notification_type notification type
   *    notification_subject subject
   *    message notification content
   */
  agencyNotification.update = async (
    agency_notification_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyNotification.update';
    h.validation.requiredParams(funcName, {
      agency_notification_id,
      record,
    });
    await model.update(record, {
      where: { agency_notification_id },
      transaction,
    });
    return agency_notification_id;
  };

  agencyNotification.findAll = async (
    where,
    { order, include, transaction } = {},
  ) => {
    const funcName = 'agencyNotification.findAll';
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
   * Find one agency_notification record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyNotification.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'agencyNotification.findOne';
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
  agencyNotification.destroy = async (where, { transaction } = {}) => {
    const funcName = 'agencyNotification.destroy';
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
  agencyNotification.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'agencyNotification.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findAll({
      where: { ...where },
      transaction,
    });
    if (record) await model.destroy({ where: { ...where } }, { transaction });
  };

  /**
   * Count agency_notification record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyNotification.count = async (where, { include, transaction } = {}) => {
    const funcName = 'agencyNotification.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Description
   * Function to send email notification for errors related to subscription
   * @async
   * @constant
   * @name sendSubscriptionErrorEmailNotification
   * @param {string} agency_id
   * @param {string} subscription_id
   * @param {string} subscription_action
   * @param {string} notification_type
   */
  agencyNotification.sendSubscriptionErrorEmailNotification = async (
    agency_id,
    subscription_id,
    subscription_action,
    notification_type,
    url,
    other_details = null,
  ) => {
    return true;
    // const todayNoSubscriptionNotificationCount =
    //   await agencyNotification.checkNotification(agency_id, notification_type);

    // // same notification type is already sent to the specific date, do not send
    // if (todayNoSubscriptionNotificationCount > 0) {
    //   return true;
    // }

    // const { to, cc } = await agencyNotification.getAgencyRecipients(agency_id);

    // const notificationAgency = await agency.findOne({
    //   agency_id,
    // });
    // console.log(`subscription-${notification_type}-subject`);
    // console.log(`subscription-${notification_type}-body`);
    // if (h.notEmpty(to)) {
    //   await h.email.sendEmail(
    //     `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
    //     to,
    //     cc,
    //     h.getMessageByCode(`subscription-${notification_type}-subject`, {
    //       AGENCY_NAME: notificationAgency?.agency_name,
    //     }),
    //     h.getMessageByCode(`subscription-${notification_type}-body`, {
    //       AGENCY_NAME: notificationAgency?.agency_name,
    //       ACTION: subscription_action,
    //       URL: url,
    //       OTHER: other_details,
    //     }),
    //   );
    // }

    // // save notification
    // await agencyNotification.create({
    //   agency_fk: agency_id,
    //   agency_subscription_fk: subscription_id,
    //   notification_type,
    //   notification_subject: h.getMessageByCode(
    //     `subscription-${notification_type}-subject`,
    //     {
    //       AGENCY_NAME: notificationAgency?.agency_name,
    //     },
    //   ),
    //   message: h.getMessageByCode(`subscription-${notification_type}-body`, {
    //     AGENCY_NAME: notificationAgency?.agency_name,
    //     ACTION: subscription_action,
    //     URL: url,
    //     OTHER: other_details,
    //   }),
    // });
  };

  /**
   * Description
   * Function to get notification count based on type
   * @async
   * @constant
   * @name checkNotification
   */
  agencyNotification.checkNotification = async (
    agency_id,
    notification_type,
  ) => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const notificationCount = await agencyNotification.count({
      agency_fk: agency_id,
      notification_type,
      created_date: { [Op.between]: [startOfDay, endOfDay] },
    });

    return notificationCount;
  };

  /**
   * Description
   * Function to prepare agency email to and cc recipients
   * @async
   * @constant
   * @name getAgencyRecipients
   */
  agencyNotification.getAgencyRecipients = async (agency_id) => {
    const agencyUsers = await agencyUser.findAll({
      agency_fk: agency_id,
    });
    const userIds = agencyUsers.map((m) => m.user_fk);
    const users = await user.findAll(
      {
        user_id: {
          [Op.in]: userIds,
        },
        status: 'active',
      },
      {
        include: {
          model: models.user_role,
          where: {
            user_role: {
              [Op.in]: ['super_admin', 'staff_admin', 'agency_admin'],
            },
          },
          required: true,
        },
        order: [['created_date', 'ASC']],
      },
    );

    let index = 1;
    let to = null;
    const cc_emails = [];
    let cc = null;
    for (const user of users) {
      if (h.cmpInt(index, 1)) {
        to = user?.email;
      } else {
        cc_emails.push(user?.email);
      }
      index++;
    }

    if (cc_emails.length > 0) {
      cc = cc_emails.join(', ');
    }

    return { to, cc };
  };

  /**
   * Description
   * Function to check if message percentage reached 80, 90, or 100
   * If reached - send email notification
   * @async
   * @constant
   * @name checkMessageCapacityAfterUpdate
   */
  agencyNotification.checkMessageCapacityAfterUpdate = async (agency_id) => {
    const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
    const is_legacy = legacy_agencies.includes(agency_id);

    if (h.cmpBool(is_legacy, true)) {
      return true;
    }

    const agencySubscription = require('./agencySubscription').makeController(
      models,
    );
    const subscriptionProduct =
      require('./agencySubscriptionProduct').makeController(models);
    const messageInventory =
      require('./messageInventory').makeController(models);

    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );

    if (h.isEmpty(subscription)) {
      return true;
    }

    const inventory = await messageInventory.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });

    const used_credits = h.notEmpty(inventory) ? inventory?.virtual_count : 0;

    // get subscription main product
    const usage_product_name = subscription?.subscription_name;

    // get subscription products allowed outgoing messages entries
    const { allowed_outgoing_messages } =
      await subscriptionProduct.getSubscriptionCredits(subscription);

    if (h.cmpStr(allowed_outgoing_messages, 'unlimited')) {
      return true;
    }

    const message_percentage = getRoundedPercentage(
      used_credits,
      allowed_outgoing_messages,
    );

    // if percentage hit 80, 90, or 100
    if (message_percentage >= 80) {
      const subscription_details =
        await messageInventory.getOtherEntityDetailsForEmail(
          agency_id,
          subscription,
          usage_product_name,
          used_credits,
        );

      const notification_type = `${message_percentage}-${constant.NOTIFICATION.TYPE.MESSAGE_LIMIT_REACHED}`;
      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        subscription?.agency_subscription_id,
        constant.NOTIFICATION.ACTION.SEND_AUTOMATION_MESSAGE,
        notification_type,
        `${config.webAdminUrl}/billing`,
        subscription_details,
      );
    }
  };

  /**
   * Description
   * Function to check if contact percentage reached 80, 90, or 100
   * If reached - send email notification
   * @async
   * @constant
   * @name checkContactCapacityAfterUpdate
   */
  agencyNotification.checkContactCapacityAfterUpdate = async (agency_id) => {
    const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
    const is_legacy = legacy_agencies.includes(agency_id);

    if (h.cmpBool(is_legacy, true)) {
      return true;
    }

    const agencySubscription = require('./agencySubscription').makeController(
      models,
    );
    const subscriptionProduct =
      require('./agencySubscriptionProduct').makeController(models);
    const contact = require('./contact').makeContactController(models);

    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );

    const where = {
      agency_fk: agency_id,
      status: 'active',
    };

    if (h.isEmpty(subscription)) {
      return true;
    }

    const active_contact_count = await contact.count(where);

    // get subscription main product
    const usage_product_name = subscription?.subscription_name;

    const { allowed_contacts } =
      await subscriptionProduct.getSubscriptionCredits(subscription);

    if (h.cmpStr(allowed_contacts, 'unlimited')) {
      return true;
    }

    const message_percentage = getRoundedPercentage(
      active_contact_count,
      allowed_contacts,
    );

    // if percentage hit 80, 90, or 100
    if (message_percentage >= 80) {
      const subscription_details = await contact.getOtherEntityDetailsForEmail(
        agency_id,
        subscription,
        usage_product_name,
        active_contact_count,
      );

      const notification_type = `${message_percentage}-${constant.NOTIFICATION.TYPE.CONTACT_LIMIT_REACHED}`;
      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        subscription?.agency_subscription_id,
        constant.NOTIFICATION.ACTION.CREATE_CONTACT,
        notification_type,
        `${config.webAdminUrl}/billing`,
        subscription_details,
      );
    }
  };

  /**
   * Description
   * Function to check for agencies where credits are already in full capacity
   * @async
   * @constant
   * @name checkFullCapacityAgencySubscription
   */
  agencyNotification.checkFullCapacityAgencySubscription = async () => {
    const agencySubscription = require('./agencySubscription').makeController(
      models,
    );
    const subscriptionProduct =
      require('./agencySubscriptionProduct').makeController(models);
    const contact = require('./contact').makeContactController(models);
    const messageInventory =
      require('./messageInventory').makeController(models);

    const subscriptions = await agencySubscription.findAll(
      {
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );

    const currentDate = moment();
    for (const subscription of subscriptions) {
      const agency_id = subscription?.agency_fk;

      const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
      const is_legacy = legacy_agencies.includes(agency_id);

      if (h.cmpBool(is_legacy, true)) {
        continue;
      }

      // if with subscription but subscription is expired
      if (
        h.notEmpty(subscription) &&
        h.notEmpty(subscription?.subscription_end) &&
        currentDate.isAfter(moment(subscription?.subscription_end))
      ) {
        continue;
      }

      // check contact count
      const active_contact_count = await contact.count({
        agency_fk: agency_id,
        status: 'active',
      });

      // check message inventory
      const inventory = await messageInventory.findOne({
        agency_fk: agency_id,
        agency_subscription_fk: subscription?.agency_subscription_id,
      });
      const used_credits = h.notEmpty(inventory) ? inventory?.virtual_count : 0;

      // get subscription main product
      const usage_product_name = subscription?.subscription_name;

      const { allowed_contacts, allowed_outgoing_messages } =
        await subscriptionProduct.getSubscriptionCredits(subscription);

      if (
        (!h.cmpStr(allowed_contacts, 'unlimited') &&
          active_contact_count >= allowed_contacts) ||
        (!h.cmpStr(allowed_outgoing_messages, 'unlimited') &&
          used_credits >= allowed_outgoing_messages)
      ) {
        const subscription_details = await agencyNotification.getEntityDetails(
          agency_id,
          subscription,
          usage_product_name,
          active_contact_count,
          used_credits,
        );

        await agencyNotification.sendSubscriptionErrorEmailNotification(
          agency_id,
          subscription?.agency_subscription_id,
          constant.NOTIFICATION.ACTION.SUBSCRIPTION_CHECKING,
          constant.NOTIFICATION.TYPE.SUBSCRIPTION_CONTACT_MESSAGE_LIMIT_REACHED,
          `${config.webAdminUrl}/billing`,
          subscription_details,
        );
      }
    }
  };

  /**
   * Description
   * Function to get subscription entity details to be used for email notification
   * @async
   * @constant
   * @name getEntityDetails
   * @param {string} agency_id Agency ID to check
   * @param {object} subscription Agency subscription details
   * @param {string} usage_product_name Subscription product name
   * @param {integer} active_contact_count Current active contact count
   * @param {integer} used_credits Current message credits used
   */
  agencyNotification.getEntityDetails = async (
    agency_id,
    subscription,
    usage_product_name,
    active_contact_count,
    used_credits,
  ) => {
    const user = require('./user').makeUserController(models);
    const automationRule = require('./automationRule').makeController(models);
    const wabaConfig = require('./agencyWhatsappConfig').makeController(models);
    const campaignInventory = require('./campaignInventory').makeController(
      models,
    );
    const productMatrix = require('./chaaatProductMatrix').makeController(
      models,
    );
    const subscriptionProduct =
      require('./agencySubscriptionProduct').makeController(models);
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
    } = await subscriptionProduct.getSubscriptionCredits(subscription);

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

    // total user count
    const user_count = await user.count(
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
    if (used_credits >= allowed_outgoing_messages) {
      subscription_details += `<li><b>Messages Per Month: ${used_credits}/${allowed_outgoing_messages}</b></li>`;
    } else {
      subscription_details += `<li>Messages Per Month: ${used_credits}/${allowed_outgoing_messages}</li>`;
    }
    subscription_details += `<li>Rules/Automations: ${active_rules}/${allowed_automations}</li>`;
    if (active_contact_count >= allowed_contacts) {
      subscription_details += `<li><b>Active Contacts: ${active_contact_count}/${allowed_contacts}</b></li>`;
    } else {
      subscription_details += `<li>Active Contacts: ${active_contact_count}/${allowed_contacts}</li>`;
    }
    subscription_details += '</ul>';

    return subscription_details;
  };

  /**
   * Description
   * Function to check all trial agencies where subscription will lapse the next day
   * Will send email to agency if true
   * @async
   * @constant
   * @name checkTrialAgencyToLapseTomorrow
   */
  agencyNotification.checkTrialAgencyToLapseTomorrow = async () => {
    const agencySubscription = require('./agencySubscription').makeController(
      models,
    );
    const startOfTomorrow = new Date();
    startOfTomorrow.setHours(0, 0, 0, 0); // Set to midnight today
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1); // Move to tomorrow

    // Get the start of the day after tomorrow
    const startOfDayAfterTomorrow = new Date(startOfTomorrow);
    startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 1); // Move to the day after tomorrow

    const subscriptions = await agencySubscription.findAll(
      {
        status: 'active',
        subscription_end: {
          [Op.gte]: startOfTomorrow,
          [Op.lt]: startOfDayAfterTomorrow,
        },
      },
      { order: [['created_date', 'DESC']] },
    );

    for (const subscription of subscriptions) {
      const agency_id = subscription?.agency_fk;

      const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
      const is_legacy = legacy_agencies.includes(agency_id);

      if (h.cmpBool(is_legacy, true)) {
        continue;
      }

      // get subscription main product
      const usage_product_name = subscription?.subscription_name;

      if (!h.cmpStr(usage_product_name, 'Trial')) {
        continue;
      }

      // Create a new Date object from the string
      const date = new Date(subscription?.subscription_end);

      // Format the date to 'August 29 2024'
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);
      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        subscription?.agency_subscription_id,
        null,
        constant.NOTIFICATION.TYPE.TRIAL_SUBSCRIPTION_LAPSE_TOMORROW,
        `${config.webAdminUrl}/billing`,
        formattedDate,
      );
    }
  };

  return agencyNotification;
};

/**
 * Description
 * Gets percentage in 10s
 * @function
 * @name getRoundedPercentage
 * @kind function
 * @param {number} current
 * @param {number} allowed
 * @returns {number} the percentage
 */
function getRoundedPercentage(current, allowed) {
  if (allowed === 0) return 100; // Return 100% if allowed is 0
  if (current >= allowed) return 100;
  const percentage = (current / allowed) * 100;
  return Math.round(percentage / 10) * 10;
}
