const MainController = require('./main');
const Promise = require('bluebird');
class StripeController extends MainController {
  construct() {}

  async processWebhookPayload({ type, event }) {
    console.info('START HANDLING DEALZ STRIPE WEBHOOK PAYLOAD', event);
    console.info('PAYLOAD TYPE', type);

    try {
      switch (type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreatePayload(event);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdatePayload(event);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeletePayload(event);
          break;
        // case 'invoice.created':
        //   {
        //     console.log('INVOICE DATA', event);
        //     const invoice_id = event.data.object.id;
        //     const invoice_status = event.data.object.status;
        //     // if status is draft - set auto advance to false
        //     if (this.helper.cmpStr(invoice_status, 'draft')) {
        //       await this.service.stripe.updateStripeInvoice(invoice_id, {
        //         auto_advance: false,
        //       });
        //     }
        //   }
        //   break;
        case 'invoiceitem.created':
          await this.handleSubscriptionInvoiceItemCreated(event);
          break;
        case 'checkout.session.completed':
          await this.handleCompletedAddonCheckoutSession(event);
          break;
        default:
          {
            console.log(`Unsupported Event Type ${type}`);
            console.log(event);
          }
          break;
      }

      return true;
    } catch (error) {
      console.error('ERROR', error);
      this.Sentry.captureException(error);
      throw new Error(error);
    }
  }

  /**
   * Description
   * Controller function for processing stripe subscription create payload
   * @async
   * @method
   * @name handleSubscriptionCreatePayload
   * @kind method
   * @memberof StripeController
   * @param {any} event
   * @returns {Promise<void>}
   */
  async handleSubscriptionCreatePayload(event) {
    console.log('CREATE SUBSCRIPTION EVENT', event);
    const subscription_id = event.data.object.id;
    // check if there is customer reference id in stripe for the agency
    const agency_id = await this.service.stripe.getStripeSubscriptionAgencyID(
      event,
    );

    /**
     * process only the create if the agency stripe customer is found
     */
    if (this.helper.notEmpty(agency_id)) {
      /**
       * cancels all the subscription before the new subscription is saved
       */
      await this.service.stripe.cancelAllActiveSubscriptionBeforeNewSubscription(
        agency_id,
        subscription_id,
      );

      const subscription = await this.service.stripe.retrieveStripeSubscription(
        subscription_id,
      );

      /**
       * checks if the subscription is already existing
       */
      const existing_subscription =
        await this.service.agencySubscription.findOne({
          agency_fk: agency_id,
          stripe_subscription_id: subscription_id,
          period_start: new Date(subscription.current_period_start * 1000),
          period_end: new Date(subscription.current_period_end * 1000),
          status: 'active',
        });

      // set meta data for client reference ID
      await this.service.stripe.updateStripeSubscription(subscription_id, {
        metadata: {
          client_reference_id: agency_id,
        },
      });

      const transaction = await this.models.sequelize.transaction();
      try {
        // check if no subscription record exists in database
        if (this.helper.isEmpty(existing_subscription)) {
          // update existing subscriptions of agency and set to inactive
          await this.service.agencySubscription.updateAgencySubscription(
            {
              agency_fk: agency_id,
              stripe_subscription_id: {
                [this.Op.ne]: subscription_id,
              },
            },
            { status: 'inactive' },
            { transaction },
          );

          // Create subscription and product record
          const { agency_subscription_id, products, period_start, period_end } =
            await this.service.stripe.createAgencySubscriptionRecord(
              agency_id,
              subscription_id,
              transaction,
            );
          // saving subscription products
          for (const item of products) {
            console.log('item', JSON.stringify(item));
            const { agency_subscription_product_id, additional_data } =
              await this.service.stripe.saveStripeSubscriptionProduct({
                agency_id,
                agency_subscription_id,
                stripe_subscription_id: subscription_id,
                item,
                period_start,
                period_end,
                transaction,
              });
            await this.service.stripe.saveAdditionalSubscriptionProductsInventory(
              {
                agency_id,
                period_start,
                period_end,
                agency_subscription_product_id,
                additional_data,
                transaction,
              },
            );
          }
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        this.Sentry.captureException(error);
        throw new Error(error);
      }
    }
  }

  /**
   * Description
   * Controller function to process stripe subscription delete payload
   * @async
   * @method
   * @name handleSubscriptionDeletePayload
   * @kind method
   * @memberof StripeController
   * @param {any} event
   * @returns {Promise<void>}
   */
  async handleSubscriptionDeletePayload(event) {
    console.log('DELETE SUBSCRIPTION EVENT', event);
    const subscription_id = event.data.object.id;

    // check if there is customer reference id in stripe for the agency
    const agency_id = await this.service.stripe.getStripeSubscriptionAgencyID(
      event,
    );

    /**
     * process only the delete if the agency stripe customer is found
     */
    if (this.helper.notEmpty(agency_id)) {
      // get the current subscription record for the agency
      const subscription = await this.service.agencySubscription.findOne(
        {
          agency_fk: agency_id,
          stripe_subscription_id: subscription_id,
        },
        {
          order: [['created_date', 'DESC']],
        },
      );

      // continue cancellation process if subscription record exists
      if (this.helper.notEmpty(subscription)) {
        const transaction = await this.models.sequelize.transaction();
        try {
          // set subscription record to inactive
          await this.service.agencySubscription.updateAgencySubscription(
            {
              agency_fk: agency_id,
              stripe_subscription_id: subscription_id,
            },
            { status: 'inactive' },
            { transaction },
          );
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.log(error);
          this.Sentry.captureException(error);
          throw new Error(error);
        }
      }
    }
  }

  /**
   * Description
   * Controller function for processing stripe subscription update payload
   * @async
   * @method
   * @name handleSubscriptionUpdatePayload
   * @kind method
   * @memberof StripeController
   * @param {any} event
   * @returns {Promise<void>}
   */
  async handleSubscriptionUpdatePayload(event) {
    console.log('UPDATE SUBSCRIPTION EVENT', event);
    const subscription_id = event.data.object.id;
    const is_subscription_recurring =
      event.data.object.metadata.is_subscription_recurring;
    console.log({ is_subscription_recurring });

    if (
      this.helper.notEmpty(is_subscription_recurring) &&
      this.helper.cmpStr(is_subscription_recurring, 'false')
    ) {
      console.log('Skipping payload', {
        subscription_id,
        is_subscription_recurring,
      });
      return true;
    }

    // check if there is customer reference id in stripe for the agency
    const agency_id = await this.service.stripe.getStripeSubscriptionAgencyID(
      event,
    );
    try {
      /**
       * process the update event webhook if there changes in the period dates
       */
      if (
        this.helper.notEmpty(agency_id) &&
        this.helper.notEmpty(
          event.data.previous_attributes.current_period_start,
        ) &&
        this.helper.notEmpty(event.data.previous_attributes.current_period_end)
      ) {
        await this.service.stripe.updateSubscriptionFromPeriodChangeEvent(
          agency_id,
          subscription_id,
        );
      }

      /**
       * process the update event webhook if there are changes in the items
       */
      if (
        this.helper.notEmpty(agency_id) &&
        this.helper.notEmpty(event.data.previous_attributes.items)
      ) {
        await this.service.stripe.updateSubscriptionFromItemChangeEvent(
          event,
          agency_id,
          subscription_id,
        );
      }
    } catch (error) {
      console.log('ERROR', error);
      this.Sentry.captureException(error);
      throw new Error(error);
    }
  }

  /**
   * Description
   * Controller function for processing stripe subscription invoice item create payload
   * @async
   * @method
   * @name handleSubscriptionInvoiceItemCreated
   * @kind method
   * @memberof StripeController
   * @param {any} event
   * @returns {Promise<void>}
   */
  async handleSubscriptionInvoiceItemCreated(event) {
    console.log('INVOICE ITEM CREATED', event);
    const data = event.data.object;
    const subscription_id = data.subscription;
    // check if there is customer reference id in stripe for the agency
    const agency_id = await this.service.stripe.getStripeSubscriptionAgencyID(
      event,
    );
    // get the current subscription
    const subscription = await this.service.agencySubscription.findOne(
      {
        agency_fk: agency_id,
        stripe_subscription_id: subscription_id,
        status: 'active',
      },
      {
        order: [['created_date', 'DESC']],
      },
    );
    const productDetails = await this.service.stripe.retrieveStripeProduct(
      data.price.product,
    );

    const transaction = await this.models.sequelize.transaction();
    try {
      /**
       * process the invoice create item event
       */
      if (
        this.helper.notEmpty(agency_id) &&
        this.helper.notEmpty(subscription)
      ) {
        if (this.helper.notEmpty(productDetails)) {
          const product_meta = productDetails.metadata;
          const product_type = product_meta.product_type;
          const product_name = product_meta.tier;
          const product_amount = product_meta.unit * data.quantity;

          // prepares the additional data for the subscription product
          const additional_data =
            await this.service.stripe.getSubscriptionProductAdditionalData(
              product_type,
              product_name,
              product_amount,
            );

          const agency_subscription_product_id =
            await this.service.agencySubscriptionProduct.createAgencySubscriptionProduct(
              {
                agency_subscription_fk: subscription.agency_subscription_id,
                stripe_product_id: data.price.product,
                product_name,
                ...additional_data,
              },
              { transaction },
            );

          await this.service.inventory.createInventory(
            {
              agency_fk: agency_id,
              inventory_type: this.constants.AGENCY.INVENTORY.TYPE.ADDON,
              agency_subscription_product_fk: agency_subscription_product_id,
              item_type: product_name,
              period_start: null,
              period_end: null,
              inventory_count: product_amount,
              used_count: 0,
            },
            { transaction },
          );
        }
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      this.Sentry.captureException(err);
      throw new Error(err);
    }
  }

  async handleCompletedAddonCheckoutSession(event) {
    console.log('COMPLETED CHECKOUT SESSION', event);
    const data = event.data.object;
    const checkout_session_id = data.id;
    const agency_id = data.metadata.client_reference_id;
    // if agency ID is not empty and mode is payment - meaning it is for addon product
    if (
      this.helper.notEmpty(agency_id) &&
      this.helper.cmpStr(data.mode, 'payment')
    ) {
      const subscription = await this.service.agencySubscription.findOne(
        {
          agency_fk: agency_id,
          status: 'active',
        },
        {
          order: [['created_date', 'DESC']],
        },
      );
      const session = await this.service.stripe.getCheckoutSession(
        checkout_session_id,
      );
      // if line item is not empty, continue processing
      if (this.helper.notEmpty(session.line_items)) {
        await Promise.mapSeries(session.line_items.data, async (item) => {
          const product_name = item.price.product.metadata.tier;
          const product_type = item.price.product.metadata.product_type;
          const product_amount = item.quantity;

          // get additional data based on line item
          const additional_data =
            await this.service.stripe.getSubscriptionProductAdditionalData(
              product_type,
              product_name,
              product_amount,
            );

          const transaction = await this.models.sequelize.transaction();
          try {
            const agency_subscription_product_id =
              await this.service.agencySubscriptionProduct.createAgencySubscriptionProduct(
                {
                  agency_subscription_fk: subscription.agency_subscription_id,
                  stripe_product_id: item.price.product.id,
                  product_name,
                  ...additional_data,
                },
                { transaction },
              );

            await this.service.inventory.createInventory(
              {
                agency_fk: agency_id,
                inventory_type: this.constants.AGENCY.INVENTORY.TYPE.ADDON,
                agency_subscription_product_fk: agency_subscription_product_id,
                item_type: product_name,
                period_start: null,
                period_end: null,
                inventory_count: product_amount,
                used_count: 0,
              },
              { transaction },
            );
            await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            this.Sentry.captureException(error);
            throw new Error(error);
          }
        });
      }
    }
  }
}

module.exports = StripeController;
