const constant = require('../constants/constant.json');
const h = require('../helpers');
const { Op } = require('sequelize');
const moment = require('moment');
const config = require('../configs/config')(process.env.NODE_ENV);
const stripe = require('stripe')(config.stripe.secretKey);
module.exports.makeController = (models) => {
  const { message_inventory: messageInventoryModel } = models;
  const agencySubscription = require('./agencySubscription').makeController(
    models,
  );
  const productMatrix = require('./chaaatProductMatrix').makeController(models);
  const userController = require('./user').makeUserController(models);
  const automationRule = require('./automationRule').makeController(models);
  const wabaConfig = require('./agencyWhatsappConfig').makeController(models);
  const campaignInventory = require('./campaignInventory').makeController(
    models,
  );
  const subscriptionProductCtl =
    require('./agencySubscriptionProduct').makeController(models);
  const agencyNotification = require('./agencyNotification').makeController(
    models,
  );
  const messageInventoryController = {};

  /**
   * Create message_inventory record
   * @param {{
   * 	agency_fk:string,
   *	agency_subscription_fk:string,
   *  message_count:integer,
   *  period_from
   *  period_to
   *	created_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  messageInventoryController.create = async (record, { transaction } = {}) => {
    const funcName = 'messageInventoryController.create';
    console.log(record);
    const {
      agency_fk,
      agency_subscription_fk,
      period_from,
      period_to,
      message_count,
      virtual_count,
      created_by,
    } = record;
    h.validation.requiredParams(funcName, {
      agency_fk,
      agency_subscription_fk,
      period_from,
      period_to,
    });
    const message_inventory_id = h.general.generateId();
    await messageInventoryModel.create(
      {
        message_inventory_id,
        agency_fk,
        agency_subscription_fk,
        period_from,
        period_to,
        message_count,
        virtual_count,
        created_by: created_by,
      },
      { transaction },
    );
    return message_inventory_id;
  };

  /**
   * Update message_inventory record by message_inventory_id
   * @param {string} message_inventory_id
   * @param {{
   * 	agency_fk:string,
   *  agency_subscription_fk: string,
   *  message_count:integer,
   *	updated_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  messageInventoryController.update = async (
    message_inventory_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'messageInventoryController.update';
    h.validation.requiredParams(funcName, { message_inventory_id, record });
    await messageInventoryModel.update(record, {
      where: { message_inventory_id },
      transaction,
    });
    return message_inventory_id;
  };

  /**
   * Find one message_inventory record
   * @param where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object|Array>}
   */
  messageInventoryController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'messageInventoryController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await messageInventoryModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete message_inventory record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  messageInventoryController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'messageInventoryController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await messageInventoryModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count message_inventory record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  messageInventoryController.count = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'messageInventoryModel.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await messageInventoryModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Check if can send automation message
   * Function to call if middleware can't be used
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  messageInventoryController.checkIfCanSendMessage = async (
    agency_id,
    { transaction } = {},
  ) => {
    const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
    const is_legacy = legacy_agencies.includes(agency_id);
    const request_count = 1;

    if (h.cmpBool(is_legacy, true)) {
      return { can_continue: true, reason: null };
    }
    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );

    // if no subscription is found
    if (h.isEmpty(subscription)) {
      const reason = '2-subscription-1688322115';
      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        null,
        constant.NOTIFICATION.ACTION.SEND_AUTOMATION_MESSAGE,
        constant.NOTIFICATION.TYPE.NO_SUBSCRIPTION,
        `${config.webAdminUrl}/billing`,
      );
      return { can_continue: false, reason };
    }

    const inventory = await messageInventoryController.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });

    // get subscription main product
    const usage_product_name = subscription?.subscription_name;
    // get subscription products allowed outgoing messages entries
    const { allowed_outgoing_messages } =
      await subscriptionProductCtl.getSubscriptionCredits(subscription);

    const currentDate = moment();
    const used_credits = h.notEmpty(inventory) ? inventory?.virtual_count : 0;
    const remaining_credits = !h.cmpStr(allowed_outgoing_messages, 'unlimited')
      ? allowed_outgoing_messages - used_credits - request_count
      : 'Unlimited';

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
        constant.NOTIFICATION.ACTION.SEND_AUTOMATION_MESSAGE,
        constant.NOTIFICATION.TYPE.SUBSCRIPTION_EXPIRED,
        `${config.webAdminUrl}/billing`,
      );
      return { can_continue: false, reason };
    }

    // if no remaining credits
    if (
      h.notEmpty(subscription) &&
      h.notEmpty(subscription?.subscription_end) &&
      currentDate.isBefore(moment(subscription?.subscription_end)) &&
      !h.cmpStr(remaining_credits, 'Unlimited') &&
      remaining_credits <= 0
    ) {
      const reason = '2-no-message-credits-1688322115';
      // const stripe_subscription = await stripe.subscriptions.retrieve(
      //   subscription?.stripe_subscription_id,
      // );
      // const session = await stripe.billingPortal.sessions.create({
      //   customer: stripe_subscription?.customer,
      //   return_url: `${config.webAdminUrl}/dashboard`,
      // });

      const subscription_details =
        await messageInventoryController.getOtherEntityDetailsForEmail(
          agency_id,
          subscription,
          usage_product_name,
          used_credits,
        );

      await agencyNotification.sendSubscriptionErrorEmailNotification(
        agency_id,
        subscription?.agency_subscription_id,
        constant.NOTIFICATION.ACTION.SEND_AUTOMATION_MESSAGE,
        constant.NOTIFICATION.TYPE.MESSAGE_LIMIT_REACHED,
        `${config.webAdminUrl}/billing`,
        subscription_details,
      );
      return { can_continue: false, reason };
    }

    return { can_continue: true, reason: null };
  };

  /**
   * Function to add message count in agency message inventory
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  messageInventoryController.addMessageCount = async (agency_id) => {
    const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
    const is_legacy = legacy_agencies.includes(agency_id);

    if (h.cmpBool(is_legacy, true)) {
      return true;
    }
    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );
    const inventory = await messageInventoryController.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });
    const transaction = await models.sequelize.transaction();
    try {
      if (h.notEmpty(inventory)) {
        await messageInventoryModel.increment(
          {
            message_count: 1,
            virtual_count: 1,
          },
          {
            where: {
              agency_fk: agency_id,
              agency_subscription_fk: subscription?.agency_subscription_id,
            },
            transaction,
          },
        );
      } else {
        const message_inventory_id = h.general.generateId();
        await messageInventoryModel.create(
          {
            message_inventory_id,
            agency_fk: agency_id,
            agency_subscription_fk: subscription?.agency_subscription_id,
            period_from: subscription?.subscription_start,
            period_to: subscription?.subscription_end,
            message_count: 1,
            virtual_count: 1,
          },
          { transaction },
        );
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
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
   * @param {integer} used_credits Current message usage
   */
  messageInventoryController.getOtherEntityDetailsForEmail = async (
    agency_id,
    subscription,
    usage_product_name,
    used_credits,
  ) => {
    const contactController =
      require('./contact').makeContactController(models);
    const agencySubscriptionProduct =
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
    const where = {
      agency_fk: agency_id,
      status: 'active',
    };
    const active_contact_count = await contactController.count(where);

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
    subscription_details += `<li><b>Messages Per Month: ${used_credits}/${allowed_outgoing_messages}</b></li>`;
    subscription_details += `<li>Rules/Automations: ${active_rules}/${allowed_automations}</li>`;
    subscription_details += `<li>Active Contacts: ${active_contact_count}/${allowed_contacts}</li>`;
    subscription_details += '</ul>';

    return subscription_details;
  };

  /**
   * Description
   * Function to increment an agency's message virtual count
   * @name addToVirtualCount
   * @param {string} agency_id agency to manage virtual count
   * @param {number} count number of message to increment to the virtual count
   */
  messageInventoryController.addToVirtualCount = async (agency_id, count) => {
    const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
    const is_legacy = legacy_agencies.includes(agency_id);

    if (h.cmpBool(is_legacy, true)) {
      return true;
    }
    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );
    const inventory = await messageInventoryController.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });
    const transaction = await models.sequelize.transaction();
    try {
      if (h.notEmpty(inventory)) {
        await messageInventoryModel.increment(
          {
            virtual_count: count,
          },
          {
            where: {
              agency_fk: agency_id,
              agency_subscription_fk: subscription?.agency_subscription_id,
            },
            transaction,
          },
        );
      } else {
        const message_inventory_id = h.general.generateId();
        await messageInventoryModel.create(
          {
            message_inventory_id,
            agency_fk: agency_id,
            agency_subscription_fk: subscription?.agency_subscription_id,
            period_from: subscription?.subscription_start,
            period_to: subscription?.subscription_end,
            virtual_count: count,
          },
          { transaction },
        );
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  return messageInventoryController;
};
