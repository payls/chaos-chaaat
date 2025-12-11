const Sentry = require('@sentry/serverless');
const { Op } = require('sequelize');
const models = require('../models');
// const dealz_models = require('../dealz_models');
const h = require('../helpers');
const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);
const stripe = require('stripe')(config.stripe.secretKey);
const Promise = require('bluebird');
const moment = require('moment-timezone');
const RedisDB = require('../redis');
const RedisClient = new RedisDB();

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const matrixStripePriceID = [
  process.env.SUBSCRIPTION_TRIAL_PRICE,
  process.env.SUBSCRIPTION_BETA_USER_PRICE,
  process.env.SUBSCRIPTION_STARTER_PRICE,
  process.env.SUBSCRIPTION_PRO_PRICE,
];

/**
 * Description
 * Function for receiving event payload for stripe
 * @async
 * @property
 * @name receivePayload
 * @param {object} event api request data
 * @returns {Promise<{ statusCode: number; body: string; }>}
 *  returns status 200 when success, including info message
 */
exports.receivePayload = async (webhookEvent = {}) => {
  const functionName = 'RECEIVE STRIPE PAYLOAD';
  try {
    const parsedBody = JSON.parse(webhookEvent.body);
    webhookEvent.body = parsedBody;
    const event = h.data.sanitizeRequest(webhookEvent);
    console.info(`START ${functionName}`);
    console.info('ENV: ', process.env.NODE_ENV);

    let body = event.body;
    let toPaid = false;

    switch (body.type) {
      case 'customer.subscription.created':
        toPaid = await handleCustomerSubscriptionCreated(body);
        break;
      case 'customer.subscription.updated':
        toPaid = await handleCustomerSubscriptionUpdated(body);
        break;
      case 'invoice.created':
        {
          console.log('INVOICE DATA', body);
          const invoice_id = body.data.object.id;
          const invoice_status = body.data.object.status;
          // if status is draft - set auto advance to false
          if (h.cmpStr(invoice_status, 'draft')) {
            await stripe.invoices.update(invoice_id, {
              auto_advance: false,
            });
          }
          toPaid = true;
        }
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(body);
        break;
      case 'invoiceitem.created':
        await handleSubscriptionInvoiceItemCreated(body);
        break;
      case 'invoiceitem.deleted':
        await handleSubscriptionInvoiceItemDeleted(body);
        break;
      default:
        {
          console.log(`Unsupported Event Type ${body.type}`);
          console.log(body);
        }
        break;
    }

    const stripe_customer_id = body.data.object.customer;
    const stripeAgency = await models.agency.findOne({
      where: {
        agency_stripe_customer_id: stripe_customer_id,
      },
    });

    if (h.notEmpty(stripeAgency)) {
      // marking agency customer as a paid customer
      if (toPaid) {
        await updateAgencyData({
          record: {
            is_paid: 1,
          },
          where: {
            agency_stripe_customer_id: stripe_customer_id,
          },
        });
      }
      await updateAgencySubscriptionState(stripeAgency.agency_id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 200, info: 'OK' }),
    };
  } catch (err) {
    Sentry.captureException(err);
    console.log(JSON.stringify(err));
    console.error({
      function: functionName,
      err,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 500, info: err }),
    };
  }
};

/**
 * Description
 * Function to handle customer.subscription.created stripe payload
 * @async
 * @function
 * @name handleCustomerSubscriptionCreated
 * @kind function
 * @param {object} event stripe webhook event
 * @returns {Promise<boolean>} return toPaid status to check if will need to
 * mark agency as paid or not
 */
async function handleCustomerSubscriptionCreated(event) {
  console.log('CREATE', event);
  try {
    let toPaid = false;
    const stripe = require('stripe')(config.stripe.secretKey);
    const subscription_id = event.data.object.id;
    // check if there is customer reference id in stripe for the agency
    const agency_id = await getSubscriptionAgency(event);

    /**
     * process only the create if the agency stripe customer is found
     */
    if (h.notEmpty(agency_id)) {
      /**
       * cancels all the subscription before the new subscription is saved
       */
      await cancelAllActiveSubscriptionBeforeNewSubscription(
        agency_id,
        subscription_id,
      );
      const subscription = await stripe.subscriptions.retrieve(subscription_id);

      // set meta data for client reference ID
      await stripe.subscriptions.update(subscription_id, {
        metadata: {
          client_reference_id: agency_id,
        },
      });

      /**
       * checks if the subscription is already existing
       */
      const subscription_exists = await models.agency_subscription.findOne({
        where: {
          agency_fk: agency_id,
          stripe_subscription_id: subscription_id,
          subscription_start: new Date(
            subscription.current_period_start * 1000,
          ),
          subscription_end: new Date(subscription.current_period_end * 1000),
          status: 'active',
        },
      });

      console.log('CHECK SUBSCRIPTION', subscription_exists);

      // check if no subscription record exists in database
      if (h.isEmpty(subscription_exists)) {
        // update existing subscriptions of agency and set to inactive
        await updateSubscriptionData({
          record: {
            status: 'inactive',
          },
          where: {
            agency_fk: agency_id,
            stripe_subscription_id: {
              [Op.ne]: subscription_id,
            },
          },
        });

        // Create subscription
        toPaid = await createSubscriptionRecord(agency_id, subscription_id);
      }
    }

    return toPaid;
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    throw new Error(err);
  }
}

/**
 * Description
 * Function to set subscription as inactive when stripe sends a delete webhook
 * @async
 * @function
 * @name handleCustomerSubscriptionDeleted
 * @kind function
 * @param {object} event stripe event data
 */
async function handleCustomerSubscriptionDeleted(event) {
  console.log('CANCEL EVENT', event);
  try {
    const subscription_id = event.data.object.id;
    // check if there is customer reference id in stripe for the agency
    const agency_id = await getSubscriptionAgency(event);

    /**
     * process only the cancel event if the agency stripe customer is found
     */
    if (h.notEmpty(agency_id)) {
      const subscription = await models.agency_subscription.findOne({
        where: {
          agency_fk: agency_id,
          stripe_subscription_id: subscription_id,
        },
        order: [['created_date', 'DESC']],
      });

      /**
       * continue cancellation if the subscription exists in database
       */
      if (h.notEmpty(subscription)) {
        await updateAgencyData({
          record: {
            is_paid: 0,
          },
          where: {
            agency_id: agency_id,
          },
        });
        await updateSubscriptionData({
          record: {
            status: 'inactive',
          },
          where: {
            agency_subscription_id: subscription.agency_subscription_id,
          },
        });
        await updateAgencyWhatsAppConfigData({
          record: {
            is_active: false,
          },
          where: {
            agency_fk: agency_id,
            trial_number_to_use: true,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    throw new Error(err);
  }
}

/**
 * Description
 * Function to handle customer.subscription.updated stripe payload
 * This will only handle event if the update is for the subscription date
 * @async
 * @function
 * @name handleCustomerSubscriptionUpdated
 * @kind function
 * @param {object} event stripe webhook event
 * @returns {Promise<boolean>} return toPaid status to check if will need to
 * mark agency as paid or not
 */
async function handleCustomerSubscriptionUpdated(event) {
  console.log('UPDATE', event);
  try {
    let toPaid = false;
    const subscription_id = event.data.object.id;

    // check if there is customer reference id in stripe for the agency
    const agency_id = await getSubscriptionAgency(event);

    /**
     * process the update event webhook if there changes in the period dates
     */
    if (
      h.notEmpty(agency_id) &&
      h.notEmpty(event.data.previous_attributes.current_period_start) &&
      h.notEmpty(event.data.previous_attributes.current_period_end)
    ) {
      toPaid = await updateSubscriptionFromPeriodChangeEvent(
        agency_id,
        subscription_id,
      );
    }

    /**
     * process the update event webhook if there are changes in the items
     */
    if (
      h.notEmpty(agency_id) &&
      h.notEmpty(event.data.previous_attributes.items)
    ) {
      toPaid = await updateSubscriptionFromItemChangeEvent(
        event,
        agency_id,
        subscription_id,
      );
    }
    return toPaid;
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    throw new Error(err);
  }
}

/**
 * Description
 * Check and retrieves the agency id for a stripe customer
 * @async
 * @function
 * @name getSubscriptionAgency
 * @kind function
 * @param {object} event subscription event
 * @returns {Promise<string>} returns the ID of the agency if there is a linked stripe customer
 */
async function getSubscriptionAgency(event) {
  let agency_id = null;
  agency_id = h.notEmpty(event.data.object.client_reference_id)
    ? event.data.object.client_reference_id
    : event.data.object.metadata.client_reference_id;
  console.info(`getting the agency ID from event: value is ${agency_id}`);
  // if no reference, check in database for agency connected to the stripe customer
  if (h.isEmpty(agency_id)) {
    const agency = await models.agency.findOne({
      where: {
        agency_stripe_customer_id: event.data.object.customer,
      },
    });
    if (h.notEmpty(agency)) {
      agency_id = agency.agency_id;
      console.info(`stripe customer ID is ${event.data.object.customer}`);
      console.info(
        `getting the agency ID from database based on agency_stripe_customer_id: value is ${agency_id}`,
      );
    }
  }

  console.info(`agency_id to use is ${agency_id}`);

  return agency_id;
}

/**
 * Description
 * Function to save subscription product
 * @async
 * @function
 * @name saveSubscriptionProduct
 * @kind function
 * @param {any} agency_subscription_id
 * @param {any} item
 * @returns {Promise<void>}
 */
async function saveSubscriptionProduct(agency_subscription_id, item) {
  const productDetails = await stripe.products.retrieve(item.plan.product);
  const product_meta = productDetails.metadata;
  const product_type = product_meta.product_type;
  const product_name = product_meta.tier;
  const product_amount = h.cmpStr(product_name, 'contact')
    ? product_meta.unit * item.quantity
    : item.quantity;

  // prepares the additional data for the subscription product
  const additional_data = await prepareSubscriptionProductAdditionalData(
    product_type,
    product_name,
    product_amount,
  );

  const agency_subscription_product_id = h.general.generateId();
  await createAgencySubscriptionProductData({
    record: {
      agency_subscription_product_id,
      agency_subscription_fk: agency_subscription_id,
      stripe_product_id: item.plan.product,
      subscription_data: JSON.stringify(item),
      product_name,
      ...additional_data,
    },
  });
}

/**
 * Description
 * Function to cancel all active subscriptions for an agency before proceeding
 * to subscribe to new subscription
 * @async
 * @function
 * @name cancelAllActiveSubscriptionBeforeNewSubscription
 * @kind function
 * @param {any} agency_id
 * @returns {Promise<void>}
 */
async function cancelAllActiveSubscriptionBeforeNewSubscription(
  agency_id,
  subscription_id,
) {
  const stripe = require('stripe')(config.stripe.secretKey);
  const subscriptions = await models.agency_subscription.findAll({
    where: {
      agency_fk: agency_id,
      stripe_subscription_id: {
        [Op.ne]: subscription_id,
      },
      status: 'active',
    },
    order: [['created_date', 'DESC']],
  });

  await Promise.mapSeries(subscriptions, async (subscription) => {
    const old_subscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id,
    );
    if (
      h.notEmpty(old_subscription) &&
      !h.cmpStr(old_subscription.status, 'canceled')
    ) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    }
  });
  await updateSubscriptionData({
    record: {
      status: 'inactive',
    },
    where: {
      agency_fk: agency_id,
      stripe_subscription_id: {
        [Op.ne]: subscription_id,
      },
      status: 'active',
    },
  });
}

/**
 * Description
 * Function to create new subscription record for the create and update subscription event
 * @async
 * @function
 * @name createSubscriptionRecord
 * @kind function
 * @param {string} agency_id ID of agency involved
 * @param {string} subscription_id ID of stripe subscription
 * @returns {Promise<boolean>} return true, meaning must mark as paid
 */
async function createSubscriptionRecord(agency_id, subscription_id) {
  const subscription = await stripe.subscriptions.retrieve(subscription_id);
  const subscriptionProducts = subscription.items.data;
  const subscriptionPrice = subscriptionProducts.find((item) =>
    matrixStripePriceID.includes(item.price.id),
  );
  const subscriptionProduct = subscriptionPrice.plan.product;
  const productDetails = await stripe.products.retrieve(subscriptionProduct);
  const productMeta = productDetails.metadata;
  const subscription_name = productMeta.tier;
  try {
    // creating new subscription record
    const agency_subscription_id = h.general.generateId();
    await createAgencySubscriptionData({
      record: {
        agency_subscription_id,
        agency_fk: agency_id,
        stripe_subscription_id: subscription_id,
        subscription_name,
        subscription_start: new Date(subscription.current_period_start * 1000),
        subscription_end: new Date(subscription.current_period_end * 1000),
        status: 'active',
      },
    });

    // saving subscription products
    for (const item of subscriptionProducts) {
      await saveSubscriptionProduct(agency_subscription_id, item);
    }

    // check if need to disable trial
    let usage_product_name = null;
    for (const product of subscriptionProducts) {
      const stripeProduct = await stripe.products.retrieve(
        product.plan.product,
      );
      if (h.cmpStr(stripeProduct.metadata.product_type, 'package')) {
        usage_product_name = stripeProduct.metadata.tier;
        break;
      }
    }

    // if subscription is no longer trial, deactivate the trial number
    if (!h.cmpStr(usage_product_name, 'Trial')) {
      await updateAgencyWhatsAppConfigData({
        record: {
          is_active: false,
        },
        where: {
          agency_fk: agency_id,
          trial_number_to_use: true,
        },
      });
    } else {
      await updateAgencyWhatsAppConfigData({
        record: {
          is_active: true,
        },
        where: {
          agency_fk: agency_id,
          trial_number_to_use: true,
        },
      });
    }

    await updateAgencyData({
      record: {
        is_paid: 1,
      },
      where: {
        agency_id: agency_id,
      },
    });

    // create campaign inventory record for new subscription details
    const campaign_inventory_id = h.general.generateId();
    await createCampaignInventoryData({
      record: {
        campaign_inventory_id,
        agency_fk: agency_id,
        agency_subscription_fk: agency_subscription_id,
        period_from: new Date(subscription.current_period_start * 1000),
        period_to: new Date(subscription.current_period_end * 1000),
        campaign_count: 0,
      },
    });

    // create message inventory record for new subscription details
    const message_inventory_id = h.general.generateId();
    let virtual_count = 0;

    // get campaigns within the new subscription coverage
    virtual_count = await checkNewSubscriptionRangeCampaigns(
      agency_id,
      subscription.current_period_start,
      subscription.current_period_end,
    );
    await createMessageInventoryData({
      record: {
        message_inventory_id,
        agency_fk: agency_id,
        agency_subscription_fk: agency_subscription_id,
        period_from: new Date(subscription.current_period_start * 1000),
        period_to: new Date(subscription.current_period_end * 1000),
        message_count: 0,
        virtual_count,
      },
    });

    return true;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Description
 * Function to get future campaigns of agency within new subscription range
 * @async
 * @function
 * @name checkNewSubscriptionRangeCampaigns
 * @kind function
 * @param {string} agency_id agency ID
 * @param {date} period_start subscription period start
 * @param {date} period_end subscription period end
 * @returns {globalThis.Promise<number>}
 */
async function checkNewSubscriptionRangeCampaigns(
  agency_id,
  period_start,
  period_end,
) {
  console.info({
    message: 'CHECK IF THERE ARE CAMPAIGNS FOR THE SUBSCRIPTION RANGE',
  });
  let count = 0;
  // get scheduled campaigns for the agency not yet triggered
  const schedules = await models.campaign_schedule.findAll({
    where: {
      agency_fk: agency_id,
      platform: 'whatsapp',
      slack_notification: 'campaign',
      status: 1,
      triggered: 0,
    },
    order: [['created_date', 'DESC']],
  });

  if (h.notEmpty(schedules)) {
    // loop through the campaigns to check which is within the new subscription period
    await Promise.mapSeries(schedules, async (schedule) => {
      const periodStartTime = moment.tz(
        new Date(period_start * 1000),
        schedule.time_zone,
      );
      const periodEndTime = moment.tz(
        new Date(period_end * 1000),
        schedule.time_zone,
      );
      const scheduledTime = moment(schedule.send_date);
      const periodStart = moment(periodStartTime);
      const periodEnd = moment(periodEndTime);
      console.log(periodStart, periodEnd, scheduledTime);

      // if date is same or after the subscription start date
      if (
        scheduledTime.isSameOrAfter(periodStart) &&
        scheduledTime.isBefore(periodEnd)
      ) {
        count += schedule.recipient_count;
      }
    });
  }

  return count;
}

/**
 * Description
 * Function to prepare additional subscription product data for saving based
 * on the product type and name
 * @async
 * @function
 * @name prepareSubscriptionProductAdditionalData
 * @kind function
 * @param {any} product_type
 * @param {any} product_name
 * @param {any} product_amount
 * @returns {Promise<void>}
 */
async function prepareSubscriptionProductAdditionalData(
  product_type,
  product_name,
  product_amount,
) {
  let additional_data = {};
  // if its for subscription package
  if (h.cmpStr(product_type, 'package')) {
    const {
      allowed_channels,
      allowed_users,
      allowed_contacts,
      allowed_campaigns,
      allowed_automations,
      allowed_outgoing_messages,
    } = await models.chaaat_product_matrix.findOne({
      where: { product_name },
    });
    additional_data = {
      allowed_channels,
      allowed_users,
      allowed_contacts,
      allowed_campaigns,
      allowed_automations,
      allowed_outgoing_messages,
    };
  }

  // if its an addon and for conversation
  if (
    h.cmpStr(product_type, 'addon') &&
    h.cmpStr(product_name, 'conversation')
  ) {
    additional_data = {
      allowed_outgoing_messages: product_amount,
    };
  }

  // if its an addon and for contact
  if (h.cmpStr(product_type, 'addon') && h.cmpStr(product_name, 'contact')) {
    additional_data = {
      allowed_contacts: product_amount,
    };
  }
  return additional_data;
}

/**
 * Description
 * Update subscription triggered from period change event
 * @async
 * @function
 * @name updateSubscriptionFromPeriodChangeEvent
 * @kind function
 * @param {any} agency_id
 * @param {any} subscription_id
 * @returns {globalThis.Promise<boolean>}
 */
async function updateSubscriptionFromPeriodChangeEvent(
  agency_id,
  subscription_id,
) {
  let toPaid = false;
  /**
   * cancel all active subscription including current subscription
   * with same subscription id of the updated
   */
  await updateSubscriptionData({
    record: {
      status: 'inactive',
    },
    where: {
      agency_fk: agency_id,
      status: 'active',
    },
  });

  // retrieve the stripe subscription data
  const subscription = await stripe.subscriptions.retrieve(subscription_id);

  // set meta data for client reference ID
  await stripe.subscriptions.update(subscription_id, {
    metadata: {
      client_reference_id: agency_id,
    },
  });

  const subscription_exists = await models.agency_subscription.findOne({
    where: {
      agency_fk: agency_id,
      stripe_subscription_id: subscription_id,
      subscription_start: new Date(subscription.current_period_start * 1000),
      subscription_end: new Date(subscription.current_period_end * 1000),
      status: 'active',
    },
  });

  // check if no subscription record exists in database
  if (h.isEmpty(subscription_exists)) {
    // update existing subscriptions of agency and set to inactive
    await updateSubscriptionData({
      record: {
        status: 'inactive',
      },
      where: {
        agency_fk: agency_id,
      },
    });

    // Create subscription
    toPaid = await createSubscriptionRecord(agency_id, subscription_id);
  }

  return toPaid;
}

/**
 * Description
 * Process subscription event payload if for item change event
 * @async
 * @function
 * @name updateSubscriptionFromItemChangeEvent
 * @kind function
 * @param {object} event subscription event
 * @param {string} agency_id agency ID
 * @param {string} subscription_id current subscription ID
 * @returns {globalThis.Promise<boolean>}
 */
async function updateSubscriptionFromItemChangeEvent(
  event,
  agency_id,
  subscription_id,
) {
  let toPaid = false;
  // the given subscription items in the payload
  const newSubscriptionItems = event.data.object.items.data;

  // get the current subscription
  const subscription = await models.agency_subscription.findOne({
    where: {
      agency_fk: agency_id,
      stripe_subscription_id: subscription_id,
      status: 'active',
    },
    order: [['created_date', 'DESC']],
  });

  if (h.notEmpty(subscription) && h.notEmpty(newSubscriptionItems)) {
    // get all recorded products for the current subscription from DB
    const subscriptionProducts =
      await models.agency_subscription_product.findAll({
        where: {
          agency_subscription_fk: subscription.agency_subscription_id,
        },
        order: [['created_date', 'DESC']],
      });

    if (h.notEmpty(subscriptionProducts)) {
      let existingProducts = [];
      // get the stripe product IDs recorded in DB for current subscription
      await Promise.mapSeries(subscriptionProducts, async (product) => {
        existingProducts.push(product.stripe_product_id);
      });

      // process the new subscription item set
      await processSaveNewSubscriptionProducts(
        newSubscriptionItems,
        existingProducts,
        subscription,
      );

      // process delete subscription product
      await processDeletedSubscriptionProducts(
        newSubscriptionItems,
        existingProducts,
        subscription,
      );

      // process any addon products in the payload set
      await processAddOnSubscriptionProducts(
        newSubscriptionItems,
        subscription,
      );
    }

    toPaid = true;
  }

  return toPaid;
}

/**
 * Description
 * Function to handle addons if the item quantities have changed
 * @async
 * @function
 * @name processAddOnProductIfAmountsHaveChanged
 * @kind function
 * @param {any} agency_subscription_id
 * @param {any} item
 * @returns {globalThis.Promise<void>}
 */
async function processAddOnProductIfAmountsHaveChanged(
  agency_subscription_id,
  item,
) {
  const savedAddOn = await models.agency_subscription_product.findOne({
    where: {
      agency_subscription_fk: agency_subscription_id,
      stripe_product_id: item.plan.product,
    },
  });

  /**
   * update addon quantity if the current and new addon does not match
   * this will be for conversation addon
   */
  if (
    h.notEmpty(savedAddOn) &&
    h.cmpStr(savedAddOn.product_name, 'conversation') &&
    !h.cmpInt(savedAddOn.allowed_outgoing_messages, item.quantity)
  ) {
    await updateAgencySubscriptionProductData({
      record: {
        allowed_outgoing_messages: item.quantity,
      },
      where: {
        agency_subscription_product_id:
          savedAddOn.agency_subscription_product_id,
      },
    });
  }
}

/**
 * Description
 * Process new subscription items set and save the new items in DB
 * @async
 * @function
 * @name processSaveNewSubscriptionProducts
 * @kind function
 * @param {object} newSubscriptionItems stripe new subscription item set
 * @param {array} existingProducts DB subscription items
 * @param {object} subscription current subscription
 * @returns {globalThis.Promise<boolean>}
 */
async function processSaveNewSubscriptionProducts(
  newSubscriptionItems,
  existingProducts,
  subscription,
) {
  // get the product IDs that are not yet recorded in DBfor current subscription
  const filteredNewItems = newSubscriptionItems.filter(
    (item) => !existingProducts.includes(item.plan.product),
  );

  // if there are new product IDs, save in DB
  if (h.notEmpty(filteredNewItems)) {
    // add the new products in subscription product table
    for (const item of filteredNewItems) {
      await saveSubscriptionProduct(subscription.agency_subscription_id, item);
    }
  }

  return true;
}

/**
 * Description
 * Delete from database removed products in stripe subscription
 * @async
 * @function
 * @name processDeletedSubscriptionProducts
 * @kind function
 * @param {object} newSubscriptionItems payload products
 * @param {array} existingProducts db products
 * @param {object} subscription current subscription
 * @returns {globalThis.Promise<boolean>}
 */
async function processDeletedSubscriptionProducts(
  newSubscriptionItems,
  existingProducts,
  subscription,
) {
  let deletedProducts = [];
  // map the current stripe subscription product IDs
  const payloadSubscriptionItemIDs = newSubscriptionItems.map(
    (item) => item.plan.product,
  );

  // check if stripe provided products for the current subscription
  if (h.notEmpty(payloadSubscriptionItemIDs)) {
    // if there are products from the stripe subscription product IDS, add to the deletedProducts array
    deletedProducts = existingProducts.filter(
      (dbProductId) => !payloadSubscriptionItemIDs.includes(dbProductId),
    );
  }

  // delete the removed product items
  if (h.notEmpty(deletedProducts)) {
    const transaction = await models.sequelize.transaction();
    try {
      await models.agency_subscription_product.destroy({
        where: {
          agency_subscription_fk: subscription.agency_subscription_id,
          stripe_product_id: {
            [Op.in]: deletedProducts,
          },
          product_name: {
            [Op.notIn]: ['contact'],
          },
        },
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log('Error deleting removed subscription product');
      throw new Error(error);
    }
  }

  return true;
}

/**
 * Description
 * Process handling of subscription addon products
 * @async
 * @function
 * @name processAddOnSubscriptionProducts
 * @kind function
 * @param {object} newSubscriptionItems stripe new subscription item set
 * @param {object} subscription current subscription
 * @returns {globalThis.Promise<boolean>}
 */
async function processAddOnSubscriptionProducts(
  newSubscriptionItems,
  subscription,
) {
  // check if there are any products from stripe payload that are addons
  const filteredAddOnItems = newSubscriptionItems.filter(
    (item) => !matrixStripePriceID.includes(item.plan.id),
  );

  // process addon products
  if (h.notEmpty(filteredAddOnItems)) {
    // check if there are changes with the addon amount
    for (const item of filteredAddOnItems) {
      await processAddOnProductIfAmountsHaveChanged(
        subscription.agency_subscription_id,
        item,
      );
    }
  }

  return true;
}

/**
 * Description
 * Update agency table data
 * @async
 * @function
 * @name updateAgencyData
 * @kind function
 * @param {any} record
 * @param {any} where
 * @returns {globalThis.Promise<void>}
 */
async function updateAgencyData({ record, where }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency.update(record, {
      where,
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log('Error updating agency data');
    throw new Error(error);
  }
}

/**
 * Description
 * Create new agency subscription data
 * @async
 * @function
 * @name createAgencySubscriptionData
 * @kind function
 * @param {any} record
 * @returns {globalThis.Promise<void>}
 */
async function createAgencySubscriptionData({ record }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency_subscription.create(record, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    Sentry.captureException(error);
    console.error('Error saving agency subscription', error);
  }
}

/**
 * Description
 * Update agency subscription table data
 * @async
 * @function
 * @name updateSubscriptionData
 * @kind function
 * @param {any} record
 * @param {any} where
 * @returns {globalThis.Promise<void>}
 */
async function updateSubscriptionData({ record, where }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency_subscription.update(record, {
      where,
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log('Error updating subscription data');
    throw new Error(error);
  }
}

/**
 * Description
 * Update agency whatsapp config table data
 * @async
 * @function
 * @name updateAgencyWhatsAppConfigData
 * @kind function
 * @param {any} record
 * @param {any} where
 * @returns {globalThis.Promise<void>}
 */
async function updateAgencyWhatsAppConfigData({ record, where }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency_whatsapp_config.update(record, {
      where,
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log('Error updating whatsapp config data');
    throw new Error(error);
  }
}

/**
 * Description
 * Create product record connected to the current agency subscription
 * @async
 * @function
 * @name createAgencySubscriptionProductData
 * @kind function
 * @param {any} record
 * @returns {globalThis.Promise<void>}
 */
async function createAgencySubscriptionProductData({ record }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency_subscription_product.create(record, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    Sentry.captureException(error);
    console.error('Error saving agency subscription product', error);
  }
}

/**
 * Description
 * Update agency subscription product table data
 * @async
 * @function
 * @name updateAgencySubscriptionProductData
 * @kind function
 * @param {any} record
 * @param {any} where
 * @returns {globalThis.Promise<void>}
 */
async function updateAgencySubscriptionProductData({ record, where }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency_subscription_product.update(record, {
      where,
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log('Error updating subscription product data');
    throw new Error(error);
  }
}

/**
 * Description
 * Create campaign inventory record
 * @async
 * @function
 * @name createCampaignInventoryData
 * @kind function
 * @param {any} record
 * @returns {globalThis.Promise<void>}
 */
async function createCampaignInventoryData({ record }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.campaign_inventory.create(record, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    Sentry.captureException(error);
    console.error('Error saving campaign inventory', error);
  }
}

/**
 * Description
 * Create message inventory record
 * @async
 * @function
 * @name createMessageInventoryData
 * @kind function
 * @param {any} record
 * @returns {globalThis.Promise<void>}
 */
async function createMessageInventoryData({ record }) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.message_inventory.create(record, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    Sentry.captureException(error);
    console.error('Error saving message inventory', error);
  }
}

/**
 * Description
 * Process handling invoice item create event
 * Usually for one time purchase items
 * @async
 * @function
 * @name handleSubscriptionInvoiceItemCreated
 * @kind function
 * @param {any} event
 * @returns {globalThis.Promise<void>}
 */
async function handleSubscriptionInvoiceItemCreated(event) {
  console.log('INVOICE ITEM CREATED', event);
  const data = event.data.object;
  try {
    const stripe = require('stripe')(config.stripe.secretKey);
    const subscription_id = data.subscription;
    // check if there is customer reference id in stripe for the agency
    const agency_id = await getSubscriptionAgency(event);

    // get the current subscription
    let subscription = null;

    // get subscription if agency id is found
    if (h.notEmpty(agency_id)) {
      subscription = await models.agency_subscription.findOne({
        where: {
          agency_fk: agency_id,
          stripe_subscription_id: subscription_id,
          status: 'active',
        },
        order: [['created_date', 'DESC']],
      });
    }

    /**
     * process the invoice create item event
     */
    if (h.notEmpty(agency_id) && h.notEmpty(subscription)) {
      const productDetails = await stripe.products.retrieve(data.price.product);
      if (h.notEmpty(productDetails)) {
        const product_meta = productDetails.metadata;
        const product_type = product_meta.product_type;
        const product_name = product_meta.tier;
        const product_amount = product_meta.unit * data.quantity;

        // prepares the additional data for the subscription product
        const additional_data = await prepareSubscriptionProductAdditionalData(
          product_type,
          product_name,
          product_amount,
        );

        const agency_subscription_product_id = h.general.generateId();
        await createAgencySubscriptionProductData({
          record: {
            agency_subscription_product_id,
            agency_subscription_fk: subscription.agency_subscription_id,
            stripe_product_id: data.price.product,
            subscription_data: JSON.stringify(productDetails),
            product_name,
            ...additional_data,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    throw new Error(err);
  }
}

/**
 * Description
 * Process handling invoice item delete event
 * Usually for one time purchase items
 * @async
 * @function
 * @name handleSubscriptionInvoiceItemDeleted
 * @kind function
 * @param {any} event
 * @returns {globalThis.Promise<void>}
 */
async function handleSubscriptionInvoiceItemDeleted(event) {
  console.log('INVOICE ITEM DELETED', event);
  const data = event.data.object;
  const subscription_id = data.subscription;
  // check if there is customer reference id in stripe for the agency
  const agency_id = await getSubscriptionAgency(event);

  // get the current subscription
  let subscription = null;
  // get subscription if agency id is found
  if (h.notEmpty(agency_id)) {
    subscription = await models.agency_subscription.findOne({
      where: {
        agency_fk: agency_id,
        stripe_subscription_id: subscription_id,
        status: 'active',
      },
      order: [['created_date', 'DESC']],
    });
  }
  if (h.notEmpty(agency_id) && h.notEmpty(subscription)) {
    const transaction = await models.sequelize.transaction();
    try {
      /**
       * process the invoice delete item event
       */
      await models.agency_subscription_product.destroy({
        where: {
          agency_subscription_fk: subscription.agency_subscription_id, // limit to agency
          stripe_product_id: data.price.product,
        },
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      Sentry.captureException(err);
      throw new Error(err);
    }
  }
}

/**
 * Description
 * Update agency state data
 * @async
 * @function
 * @name updateAgencySubscriptionState
 * @kind function
 * @param {any} agency_id
 * @returns {globalThis.Promise<void>}
 */
async function updateAgencySubscriptionState(agency_id) {
  console.info(`Updating agency state data for ${agency_id}`);
  const agencyData = await RedisClient.getRecord(`agency:${agency_id}`);
  if (h.notEmpty(agencyData)) {
    const subscription = await models.agency_subscription.findOne({
      where: {
        agency_fk: agency_id,
        status: 'active',
      },
      order: [['created_date', 'DESC']],
    });
    let newSubscriptionData = {};

    if (h.notEmpty(subscription)) {
      const total_active_contact_count = await models.contact.count({
        where: {
          agency_fk: agency_id,
          status: 'active',
        },
      });
      newSubscriptionData = {
        agency_subscription_id: subscription.agency_subscription_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        subscription_name: subscription.subscription_name,
        subscription_start: subscription.subscription_start,
        subscription_end: subscription.subscription_end,
        products: [],
        message_inventory: {},
        campaign_inventory: {},
        total_active_contact_count: total_active_contact_count,
      };
      const subscriptionProducts =
        await models.agency_subscription_product.findAll({
          where: {
            agency_subscription_fk: subscription.agency_subscription_id,
            product_name: {
              [Op.ne]: 'contact',
            },
          },
          order: [['created_date', 'DESC']],
        });
      const subscriptionContactProducts =
        await models.agency_subscription_product.findAll({
          where: {
            product_name: 'contact',
          },
          include: [
            {
              model: models.agency_subscription,
              where: {
                agency_fk: agency_id,
              },
              required: true,
            },
          ],
        });
      await Promise.mapSeries(subscriptionProducts, async (product) => {
        const productData = {
          agency_subscription_product_id:
            product.agency_subscription_product_id,
          product_name: product.product_name,
          allowed_channels: product.allowed_channels,
          allowed_users: product.allowed_users,
          allowed_contacts: product.allowed_contacts,
          allowed_campaigns: product.allowed_campaigns,
          allowed_automations: product.allowed_automations,
          allowed_outgoing_messages: product.allowed_outgoing_messages,
        };
        newSubscriptionData.products.push(productData);
      });
      await Promise.mapSeries(subscriptionContactProducts, async (product) => {
        const productData = {
          agency_subscription_product_id:
            product.agency_subscription_product_id,
          product_name: product.product_name,
          allowed_channels: product.allowed_channels,
          allowed_users: product.allowed_users,
          allowed_contacts: product.allowed_contacts,
          allowed_campaigns: product.allowed_campaigns,
          allowed_automations: product.allowed_automations,
          allowed_outgoing_messages: product.allowed_outgoing_messages,
        };
        newSubscriptionData.products.push(productData);
      });
      const messageInventory = await models.message_inventory.findOne({
        where: {
          agency_fk: agency_id,
          agency_subscription_fk: subscription.agency_subscription_id,
        },
        order: [['created_date', 'DESC']],
      });
      const campaignInventory = await models.campaign_inventory.findOne({
        where: {
          agency_fk: agency_id,
          agency_subscription_fk: subscription.agency_subscription_id,
        },
        order: [['created_date', 'DESC']],
      });
      newSubscriptionData.message_inventory = {
        message_inventory_id: messageInventory.message_inventory_id,
        virtual_count: messageInventory.virtual_count,
        message_count: messageInventory.message_count,
      };
      newSubscriptionData.campaign_inventory = {
        campaign_inventory_id: campaignInventory.campaign_inventory_id,
        campaign_count: campaignInventory.campaign_count,
      };
    }
    agencyData.subscription = newSubscriptionData;
    await RedisClient.setRecord({
      id: `agency:${agency_id}`,
      data: agencyData,
    });
  }
}
