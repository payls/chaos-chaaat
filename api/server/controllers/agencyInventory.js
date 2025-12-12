const constant = require('../constants/constant.json');
const h = require('../helpers');
const { Op } = require('sequelize');
const moment = require('moment');
const config = require('../configs/config')(process.env.NODE_ENV);
const stripe = require('stripe')(config.stripe.secretKey);
module.exports.makeController = (models) => {
  const agency = require('./agency').makeAgencyController(models);
  const whatsAppChat = require('./whatsappChat').makeController(models);
  const agencyWhatsAppConfig = require('./agencyWhatsappConfig').makeController(
    models,
  );
  const agencySubscription = require('./agencySubscription').makeController(
    models,
  );
  const productMatrix = require('./chaaatProductMatrix').makeController(models);
  const user = require('./user').makeUserController(models);
  const subscriptionProductCtl =
    require('./agencySubscriptionProduct').makeController(models);
  const messageInventoryCtl =
    require('./messageInventory').makeController(models);
  const agencyInventoryController = {};

  /**
   * The function `agencyInventoryController.getAgencyInventoryInsight` is calculating various insights related to agency
   * inventory. It retrieves data such as total contacts, total WhatsApp messages, total WhatsApp messages sent, total
   * WhatsApp messages received, agency WABAs, and current subscription details. It then calculates remaining WhatsApp
   * credits based on the subscription status and total WhatsApp messages count. Additionally, it fetches information about
   * each WABA including total messages, messages sent, and messages received. Finally, it returns an object containing all
   * these insights.
   *
   * @name getAgencyInventoryInsight
   */
  agencyInventoryController.getAgencyInventoryInsight = async (data) => {
    const stripe = require('stripe')(config.stripe.secretKey);
    const { agency_id } = data;
    const current_date = new Date(h.date.getSqlCurrentDate());
    const {
      inventory_agency,
      total_contacts,
      total_csers,
      agency_wabas,
      trial_waba,
      current_subscription,
    } = await agencyInventoryController.getInventoryDetailsReference(agency_id);

    const agency_code = h.notEmpty(inventory_agency.trial_code)
      ? inventory_agency.trial_code
      : await agency.genereteTrialCode();
    if (h.isEmpty(inventory_agency.trial_code)) {
      await agency.update(agency_id, {
        trial_code: agency_code,
      });
    }

    // getting details per WABA assigned to agency
    const waba_info = [];
    for (const waba of agency_wabas) {
      const { waba_number, waba_name, trial_number_to_use } = waba;
      const { total_waba_messages, total_waba_sent, total_waba_received } =
        await agencyInventoryController.getWABAInventoryDetails(
          agency_id,
          waba_number,
        );
      waba_info.push({
        waba_name: waba_name,
        waba_number: waba_number,
        is_trial_number: trial_number_to_use,
        total_waba_messages,
        total_waba_sent,
        total_waba_received,
      });
    }

    // getting details per WABA assigned to agency
    const trial_waba_info = [];
    for (const waba of trial_waba) {
      const { waba_number, waba_name, trial_number_to_use } = waba;
      const { total_waba_messages, total_waba_sent, total_waba_received } =
        await agencyInventoryController.getWABAInventoryDetails(
          agency_id,
          waba_number,
        );
      trial_waba_info.push({
        waba_name: waba_name,
        waba_number: waba_number,
        is_trial_number: trial_number_to_use,
        total_waba_messages,
        total_waba_sent,
        total_waba_received,
      });
    }

    if (h.isEmpty(current_subscription)) {
      return {
        current_subscription: current_subscription,
        total_contact_inventory_count: h.notEmpty(total_contacts)
          ? total_contacts.inventory_count
          : 0,
        total_whatsapp_messages_inventory_count: 0,
        total_whatsapp_sent: 0,
        total_whatsapp_received: 0,
        agency_code: agency_code,
        whatsapp_message_sending_limit: 0,
        remaining_whatsapp_credits: 0,
        waba_info,
        trial_waba_info,
      };
    }

    const subscriptionProducts = await subscriptionProductCtl.findAll({
      agency_subscription_fk: current_subscription.agency_subscription_id,
    });
    const messageInventory = await messageInventoryCtl.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: current_subscription.agency_subscription_id,
    });
    let usage_product_name = null;
    for (const product of subscriptionProducts) {
      const stripeProduct = await stripe.products.retrieve(
        product.stripe_product_id,
      );
      console.log(stripeProduct);
      if (h.cmpStr(stripeProduct.metadata.product_type, 'package')) {
        usage_product_name = stripeProduct.metadata.tier;
        break;
      }
    }

    // get matrix based on type
    const { allowed_outgoing_messages } = await productMatrix.findOne({
      product_name: usage_product_name,
    });

    // get total whatsapp sent message count
    const total_inventory_whatsapp_messages_count = h.notEmpty(messageInventory)
      ? messageInventory.message_count
      : 0;

    console.log(messageInventory.period_from, messageInventory.period_to);
    // get total sent based on whatsapp records
    const total_whatsapp_sent = await whatsAppChat.count({
      agency_fk: agency_id,
      msg_type: {
        [Op.like]: `%frompave%`,
      },
      created_date: {
        [Op.between]: [
          messageInventory.period_from,
          messageInventory.period_to,
        ],
      },
    });

    const total_whatsapp_received = await whatsAppChat.count({
      agency_fk: agency_id,
      msg_type: {
        [Op.in]: [
          'text',
          'button',
          'interactive',
          'image',
          'video',
          'document',
          'file',
        ],
      },
      created_date: {
        [Op.between]: [
          messageInventory.period_from,
          messageInventory.period_to,
        ],
      },
    });

    // getting remaining whatsapp message send credits
    const remaining_whatsapp_credits = !h.cmpStr(
      allowed_outgoing_messages,
      'unlimited',
    )
      ? allowed_outgoing_messages - total_inventory_whatsapp_messages_count
      : 'Unlimited';

    return {
      subscription_name: usage_product_name,
      current_subscription: current_subscription,
      total_contact_inventory_count: h.notEmpty(total_contacts)
        ? total_contacts.inventory_count
        : 0,
      total_whatsapp_messages_inventory_count:
        total_inventory_whatsapp_messages_count,
      total_whatsapp_sent,
      total_whatsapp_received,
      agency_code: agency_code,
      whatsapp_message_sending_limit: allowed_outgoing_messages,
      remaining_whatsapp_credits,
      waba_info,
      trial_waba_info,
    };
  };

  /**
   * Description
   * Function to get initial agency data for determining inventory details
   * @async
   * @name getInventoryDetailsReference
   * @param agency_id agency ID
   * @returns {Promise} returns agency inventory details
   */
  agencyInventoryController.getInventoryDetailsReference = async (
    agency_id,
  ) => {
    const contactCtl = require('./contact').makeContactController(models);
    const [
      inventory_agency,
      total_contacts,
      total_csers,
      agency_wabas,
      trial_waba,
      current_subscription,
    ] = await Promise.all([
      agency.findOne({
        agency_id: agency_id,
      }),
      contactCtl.count({
        agency_fk: agency_id,
        status: 'active',
      }),
      user.count(
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
      ),
      agencyWhatsAppConfig.findAll({
        agency_fk: agency_id,
        trial_number_to_use: false,
      }),
      agencyWhatsAppConfig.findAll({
        agency_fk: agency_id,
        trial_number_to_use: true,
      }),
      agencySubscription.findOne(
        {
          agency_fk: agency_id,
          status: 'active',
        },
        { order: [['created_date', 'DESC']] },
      ),
    ]);

    return {
      inventory_agency,
      total_contacts,
      total_csers,
      agency_wabas,
      trial_waba,
      current_subscription,
    };
  };

  /**
   * Description
   * Function to get waba inventory details for certain agency waba
   * @async
   * @name getWABAInventoryDetails
   * @param agency_id agency ID
   * @param waba_number whatsapp business number
   * @returns {Promise} returns waba inventory details
   */
  agencyInventoryController.getWABAInventoryDetails = async (
    agency_id,
    waba_number,
  ) => {
    const [total_waba_messages, total_waba_sent, total_waba_received] =
      await Promise.all([
        whatsAppChat.count({
          agency_fk: agency_id,
          sender_number: waba_number,
          sent: 1,
          failed: 0,
        }),
        whatsAppChat.count({
          agency_fk: agency_id,
          sender_number: waba_number,
          sent: 1,
          failed: 0,
          msg_type: {
            [Op.like]: `%frompave%`,
          },
        }),
        whatsAppChat.count({
          agency_fk: agency_id,
          sender_number: waba_number,
          sent: 1,
          failed: 0,
          msg_type: {
            [Op.notLike]: `%frompave%`,
          },
        }),
      ]);

    return { total_waba_messages, total_waba_sent, total_waba_received };
  };

  return agencyInventoryController;
};
