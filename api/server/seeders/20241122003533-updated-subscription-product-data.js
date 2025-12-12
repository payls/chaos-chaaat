'use strict';
const environment = process.env.NODE_ENV || 'development';
const config = require('../configs/config')(environment);
const h = require('../helpers');
const models = require('../models');

module.exports = {
  up: async (queryInterface) => {
    const { agency_subscription_product: subscriptionProductModel } = models;

    const records = await subscriptionProductModel.findAll();

    // loop through all the records to determine data
    for (const data of records) {
      if (h.notEmpty(data?.subscription_data)) {
        const subData = JSON.parse(data?.subscription_data);
        const subscription_id = subData?.subscription;
        const product_id = subData?.price?.product;
        const product_name = checkSubscriptionProducName(subData);
        if (h.notEmpty(product_name)) {
          await updateSubscriptionAndProductDetails(
            subscription_id,
            product_id,
            product_name,
            queryInterface,
            models,
          );
        }
      }
    }
  },

  down: async (queryInterface) => {},
};

function checkSubscriptionProducName(subData) {
  let product_name;
  const price_id = subData?.price?.id;
  switch (price_id) {
    case process.env.SUBSCRIPTION_TRIAL_PRICE:
      product_name = 'Trial';
      break;
    case process.env.SUBSCRIPTION_BETA_USER_PRICE:
      product_name = 'Beta User';
      break;
    case process.env.SUBSCRIPTION_STARTER_PRICE:
      product_name = 'Starter';
      break;
    case process.env.SUBSCRIPTION_PRO_PRICE:
      product_name = 'Pro';
      break;
    default:
      product_name = null;
      break;
  }
  return product_name;
}

async function updateSubscriptionAndProductDetails(
  subscription_id,
  product_id,
  product_name,
  queryInterface,
  models,
) {
  const {
    agency_subscription: subscriptionModel,
    agency_subscription_product: subscriptionProductModel,
    chaaat_product_matrix: matrixModel,
  } = models;
  const product_details = await matrixModel.findOne({
    where: {
      product_name,
    },
  });
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Populate contact_source table
    await subscriptionModel.update(
      { subscription_name: product_name },
      {
        where: {
          stripe_subscription_id: subscription_id,
          subscription_name: null,
        },
        transaction,
      },
    );

    if (h.notEmpty(product_details)) {
      await subscriptionProductModel.update(
        {
          product_name,
          allowed_channels: product_details?.allowed_channels,
          allowed_users: product_details?.allowed_users,
          allowed_contacts: product_details?.allowed_contacts,
          allowed_campaigns: product_details?.allowed_campaigns,
          allowed_automations: product_details?.allowed_automations,
          allowed_outgoing_messages: product_details?.allowed_outgoing_messages,
        },
        {
          where: { stripe_product_id: product_id, product_name: null },
          transaction,
        },
      );
    }
  });
}
