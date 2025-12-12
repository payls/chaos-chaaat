const environment = process.env.NODE_ENV || 'development';
const config = require('../configs/config')(environment);
const stripe = require('stripe')(config.stripe.secretKey);
const constant = require('../constants/constant.json');
const models = require('../models');
const h = require('../helpers');
const c = require('../controllers');
const moment = require('moment');
const { Op } = require('sequelize');
// const { default: next } = require('next');

const agencyMiddleware = module.exports;

/**
 * Middleware function to check if an agency is still eligible of sending
 * a whatsapp message
 *
 * @async
 * @name canSendWhatsAppMessage
 */
agencyMiddleware.canSendWhatsAppMessage = async (type, request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // initial message request count
  let request_count = 1;
  const body = request.body;

  // request count will adjust if for immediate campaign
  if (h.cmpStr(type, 'campaign') && h.cmpInt(body.schedule.value, 0)) {
    request_count = body.contact_list[0].value.user_count;
  }

  // request count will adjust if for unstaggered scheduled campaign
  if (
    h.cmpStr(type, 'campaign') &&
    h.cmpInt(body.schedule.value, 1) &&
    h.cmpBool(body.staggered, false)
  ) {
    request_count = body.contact_list[0].value.user_count;
  }

  // request count will adjust if for staggered scheduled campaign
  if (
    h.cmpStr(type, 'campaign') &&
    h.cmpInt(body.schedule.value, 1) &&
    h.cmpBool(body.staggered, true)
  ) {
    const timing = body.timing;
    let current_count = 0;
    for (const time of timing) {
      const campaignDate = moment(time.datetime);
      if (!campaignDate.isAfter(moment(subscription?.subscription_end))) {
        current_count += time.recipient_count;
      }
    }
    request_count = current_count;
  }

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }

  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get message inventory
  const inventory = await c.messageInventory.findOne({
    agency_fk: agency_id,
    agency_subscription_fk: subscription?.agency_subscription_id,
  });

  // get subscription main product matrix
  const { allowed_outgoing_messages } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const used_credits = h.notEmpty(inventory) ? inventory?.virtual_count : 0;
  const remaining_credits = !h.cmpStr(allowed_outgoing_messages, 'unlimited')
    ? allowed_outgoing_messages - used_credits - request_count
    : 'Unlimited';

  // if no remaining credits
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isBefore(moment(subscription?.subscription_end)) &&
    !h.cmpStr(remaining_credits, 'Unlimited') &&
    remaining_credits <= 0
  ) {
    const reason = '2-no-message-credits-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating active contacts
 * @async
 * @name canAddActiveContact
 */
agencyMiddleware.canAddActiveContact = async (request, reply) => {
  if (h.cmpStr(request.body.status, 'active')) {
    const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
      request,
    );

    // if included in legacy agencies
    if (h.cmpBool(is_legacy, true)) {
      return true;
    }

    // if no subscription is found
    if (h.isEmpty(subscription)) {
      const reason = '2-contact-subscription-1688322115';
      return handleActionNotAllowed(request, reply, reason);
    }

    const currentDate = moment();
    // if with subscription but subscription is expired
    if (
      h.notEmpty(subscription) &&
      h.notEmpty(subscription?.subscription_end) &&
      currentDate.isAfter(moment(subscription?.subscription_end))
    ) {
      const reason = '2-subscription-contact-expired-1688322115';
      return handleActionNotAllowed(request, reply, reason);
    }

    // get subscription main product matrix
    const { allowed_contacts } =
      await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

    const where = {
      agency_fk: agency_id,
      status: 'active',
    };

    if (
      h.cmpStr(request.method, 'PUT') &&
      h.notEmpty(request.body.contact_id)
    ) {
      where.contact_id = {
        [Op.ne]: request.body.contact_id,
      };
    }

    const active_contact_count = await c.contact.count(where);

    if (
      !h.cmpStr(allowed_contacts, 'unlimited') &&
      active_contact_count >= allowed_contacts
    ) {
      const reason = h.cmpStr(request.method, 'POST')
        ? '2-active-contact-limit-1688322115'
        : '2-update-active-contact-limit-1688322115';
      return handleActionNotAllowed(request, reply, reason);
    }
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating active contacts
 * via contact page salesforce contact import function
 * @async
 * @name salesforceCanAddContacts
 */
agencyMiddleware.salesforceCanAddContacts = async (request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }
  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-contact-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-contact-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_contacts } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const where = {
    agency_fk: agency_id,
    status: 'active',
  };

  let active_contact_count = await c.contact.count(where);
  active_contact_count += request.body.sf_contact_ids.length;

  if (
    !h.cmpStr(allowed_contacts, 'unlimited') &&
    active_contact_count > allowed_contacts
  ) {
    const reason = '2-salesforce-active-contact-limit-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating active contacts
 * via contact csv upload feature
 * @async
 * @name canAddContactViaContactUpload
 */
agencyMiddleware.canAddContactViaContactUpload = async (request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }
  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-contact-list-upload-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-contact-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_contacts } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const where = {
    agency_fk: agency_id,
    status: 'active',
  };

  let active_contact_count = await c.contact.count(where);
  active_contact_count += request.body.contact_list.length;

  if (
    !h.cmpStr(allowed_contacts, 'unlimited') &&
    active_contact_count > allowed_contacts
  ) {
    const reason = '2-contact-list-upload-contact-limit-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating active contacts
 * via hubspot contact pulling
 * @async
 * @name canAddContactViaHubSpotPulling
 */
agencyMiddleware.canAddContactViaHubSpotPulling = async (request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }
  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-contact-list-hubspot-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-contact-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_contacts } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const where = {
    agency_fk: agency_id,
    status: 'active',
  };

  let active_contact_count = await c.contact.count(where);
  active_contact_count += request.body.contact_list.length;

  if (
    !h.cmpStr(allowed_contacts, 'unlimited') &&
    active_contact_count > allowed_contacts
  ) {
    const reason = '2-contact-list-hubspot-contact-limit-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating active contacts
 * via salesforce contact report mapping
 * @async
 * @name canSaveContactViaSalesforceReportMapping
 */
agencyMiddleware.canSaveContactViaSalesforceReportMapping = async (
  request,
  reply,
) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }
  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-contact-list-salesforce-report-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-contact-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_contacts } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const where = {
    agency_fk: agency_id,
    status: 'active',
  };

  let active_contact_count = await c.contact.count(where);
  active_contact_count += request.body.list_count;

  if (
    !h.cmpStr(allowed_contacts, 'unlimited') &&
    active_contact_count > allowed_contacts
  ) {
    const reason = '2-contact-list-salesforce-report-contact-limit-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating new
 * user
 * @async
 * @name canAddUser
 */
agencyMiddleware.canAddUser = async (request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }

  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-user-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-user-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_users } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const agency_users = await c.agencyUser.count(
    { agency_fk: agency_id },
    {
      include: [
        {
          model: models.user,
          required: true,
          include: [
            {
              model: models.user_role,
              where: {
                user_role: {
                  [Op.notIn]: [
                    constant.USER.ROLE.AGENCY_ADMIN,
                    constant.USER.ROLE.AGENCY_MARKETING,
                    constant.USER.ROLE.AGENCY_SALES,
                  ],
                },
              },
              required: true,
            },
          ],
        },
      ],
    },
  );

  if (!h.cmpStr(allowed_users, 'unlimited') && agency_users >= allowed_users) {
    const reason = '2-user-subscription-limit-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating new
 * automation rule
 * @async
 * @constant
 * @name canCreateActiveAutomationRule
 */
agencyMiddleware.canCreateActiveAutomationRule = async (request, reply) => {
  if (h.cmpStr(request.body.status, 'active')) {
    const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
      request,
    );

    // if included in legacy agencies
    if (h.cmpBool(is_legacy, true)) {
      return true;
    }

    // if no subscription is found
    if (h.isEmpty(subscription)) {
      const reason = '2-automation-subscription-1688322115';
      return handleActionNotAllowed(request, reply, reason);
    }

    const currentDate = moment();
    // if with subscription but subscription is expired
    if (
      h.notEmpty(subscription) &&
      h.notEmpty(subscription?.subscription_end) &&
      currentDate.isAfter(moment(subscription?.subscription_end))
    ) {
      const reason = '2-subscription-rule-expired-1688322115';
      return handleActionNotAllowed(request, reply, reason);
    }

    // get subscription main product matrix
    const { allowed_automations } =
      await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

    const active_rules = await c.automationRule.count(
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

    if (
      !h.cmpStr(allowed_automations, 'unlimited') &&
      active_rules >= allowed_automations
    ) {
      const reason = '2-automation-subscription-limit-1688322115';
      return handleActionNotAllowed(request, reply, reason);
    }
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of creating campaigns
 * @async
 * @constant
 * @name canCreateCampaign
 */
agencyMiddleware.canCreateCampaign = async (request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }

  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-campaign-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-campaign-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_campaigns } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  // get campaign inventory
  const inventory = await c.campaignInventory.findOne({
    agency_fk: agency_id,
    agency_subscription_fk: subscription?.agency_subscription_id,
  });

  const used_credits = h.notEmpty(inventory) ? inventory?.campaign_count : 0;
  const remaining_credits = !h.cmpStr(allowed_campaigns, 'unlimited')
    ? allowed_campaigns - used_credits
    : 'Unlimited';

  // if no remaining credits
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isBefore(moment(subscription?.subscription_end)) &&
    !h.cmpStr(remaining_credits, 'Unlimited') &&
    remaining_credits <= 0
  ) {
    const reason = '2-no-campaign-credits-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Description
 * Middleware function to check if an agency is still eligible of onboard
 * waba channels
 * @async
 * @constant
 * @name canOnboardWABAChannel
 */
agencyMiddleware.canOnboardWABAChannel = async (request, reply) => {
  const { agency_id, subscription, is_legacy } = await getCurrentSubscription(
    request,
  );

  // if included in legacy agencies
  if (h.cmpBool(is_legacy, true)) {
    return true;
  }

  // if no subscription is found
  if (h.isEmpty(subscription)) {
    const reason = '2-waba-subscription-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  const currentDate = moment();
  // if with subscription but subscription is expired
  if (
    h.notEmpty(subscription) &&
    h.notEmpty(subscription?.subscription_end) &&
    currentDate.isAfter(moment(subscription?.subscription_end))
  ) {
    const reason = '2-subscription-waba-expired-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }

  // get subscription main product matrix
  const { allowed_channels } =
    await c.agencySubscriptionProduct.getSubscriptionCredits(subscription);

  const where = {
    agency_fk: agency_id,
    trial_number_to_use: false,
  };

  const whatsapp_channels_count = await c.agencyWhatsAppConfig.count(where);

  if (
    !h.cmpStr(allowed_channels, 'unlimited') &&
    whatsapp_channels_count >= allowed_channels
  ) {
    const reason = '2-no-waba-credits-1688322115';
    return handleActionNotAllowed(request, reply, reason);
  }
};

/**
 * Generic handle not allowed to do action
 * @returns {FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>}
 */
function handleActionNotAllowed(
  request,
  reply,
  reason,
  additonalData = {},
  errCode = 401,
) {
  return h.api.createResponse(
    request,
    reply,
    errCode,
    { additonalData },
    reason,
  );
}

/**
 * Description
 * Function to get current subscription of an agency
 * @async
 * @function
 * @name getCurrentSubscription
 * @kind function
 * @param {any} request
 * @returns {Promise<{ agency_id: any; subscription: any; is_legacy: boolean, }>}
 * current subscription details and agency ID
 */
async function getCurrentSubscription(request) {
  const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
  const { user_id } = h.user.getCurrentUser(request);

  const currentAgencyUser = await c.agencyUser.findOne({
    user_fk: user_id,
  });

  const agency_id = currentAgencyUser?.agency_fk;
  const is_legacy = legacy_agencies.includes(agency_id);
  // get agency active subscription
  const subscription = await c.agencySubscription.findOne(
    {
      agency_fk: agency_id,
      status: 'active',
    },
    { order: [['created_date', 'DESC']] },
  );

  return { agency_id, subscription, is_legacy };
}
