const MainService = require('./main');
const Promise = require('bluebird');
class StripeService extends MainService {
  constructor() {
    super();
    const AgencyService = require('./agency');
    const AgencySubscriptionService = require('./agency_subscription');
    const AgencySubscriptionProductService = require('./agency_subscription_product');
    const InventoryService = require('./inventory');
    const ProductMatrixService = require('./product_matrix');
    this.service = {
      agency: new AgencyService(),
      agencySubscription: new AgencySubscriptionService(),
      agencySubscriptionProduct: new AgencySubscriptionProductService(),
      inventory: new InventoryService(),
      productMatrix: new ProductMatrixService(),
    };
  }

  /**
   * Description
   * Service function to get the agency ID of the customer from stripe
   * @async
   * @method
   * @name getStripeSubscriptionAgencyID
   * @kind method
   * @memberof StripeService
   * @param {any} event payload data
   * @returns {Promise<string>}
   */
  async getStripeSubscriptionAgencyID(event) {
    let agency_id = this.helper.notEmpty(event.data.object.client_reference_id)
      ? event.data.object.client_reference_id
      : event.data.object.metadata.client_reference_id;

    // if no reference, check in database for agency connected to the stripe customer
    if (this.helper.isEmpty(agency_id)) {
      const agency = await this.service.agency.findOne({
        stripe_customer_id: event.data.object.customer,
      });
      agency_id = agency.agency_id;
    }

    return agency_id;
  }

  /**
   * Description
   * Service function to cancel all active subscriptions before a new subscription is created
   * @async
   * @method
   * @name cancelAllActiveSubscriptionBeforeNewSubscription
   * @kind method
   * @memberof StripeService
   * @param {any} agency_id
   * @param {any} subscription_id
   * @returns {Promise<boolean>}
   */
  async cancelAllActiveSubscriptionBeforeNewSubscription(
    agency_id,
    subscription_id,
  ) {
    // find all active subscriptions for the agency
    const subscriptions = await this.service.agencySubscription.findAll(
      {
        agency_fk: agency_id,
        stripe_subscription_id: {
          [this.Op.ne]: subscription_id,
        },
        status: 'active',
      },
      {
        order: [['created_date', 'DESC']],
      },
    );

    const transaction = await this.models.sequelize.transaction();
    try {
      // loop through all the active subscriptions and cancel them
      await Promise.mapSeries(subscriptions, async (subscription) => {
        const old_subscription = await this.stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id,
        );
        if (
          this.helper.notEmpty(old_subscription) &&
          !this.helper.cmpStr(old_subscription.status, 'canceled')
        ) {
          await this.stripe.subscriptions.cancel(
            subscription.stripe_subscription_id,
          );
        }
      });

      // update all the active subscriptions to inactive
      await this.service.agencySubscription.updateAgencySubscription(
        {
          agency_fk: agency_id,
          stripe_subscription_id: {
            [this.Op.ne]: subscription_id,
          },
          status: 'active',
        },
        { status: 'inactive' },
        { transaction },
      );

      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to retrieve a stripe subscription
   * @async
   * @method
   * @name retrieveStripeSubscription
   * @kind method
   * @memberof StripeService
   * @param {any} subscription_id
   * @returns {Promise<any>}
   */
  async retrieveStripeSubscription(subscription_id) {
    return await this.stripe.subscriptions.retrieve(subscription_id);
  }

  /**
   * Description
   * Service function to update a stripe subscription record
   * @async
   * @method
   * @name updateStripeSubscription
   * @kind method
   * @memberof StripeService
   * @param {any} subscription_id
   * @param {any} record
   * @returns {Promise<any>}
   */
  async updateStripeSubscription(subscription_id, record) {
    return this.stripe.subscriptions.update(subscription_id, record);
  }

  /**
   * Description
   * Service function to retrieve a stripe product record
   * @async
   * @method
   * @name retrieveStripeProduct
   * @kind method
   * @memberof StripeService
   * @param {any} product_id
   * @returns {Promise<any>}
   */
  async retrieveStripeProduct(product_id) {
    return await this.stripe.products.retrieve(product_id);
  }

  /**
   * Description
   * Service function to get subscription inclusion data based on product
   * @async
   * @method
   * @name getSubscriptionProductAdditionalData
   * @kind method
   * @memberof StripeService
   * @param {any} product_type
   * @param {any} product_name
   * @param {any} product_amount
   * @returns {Promise<{}>}
   */
  async getSubscriptionProductAdditionalData(
    product_type,
    product_name,
    product_amount,
  ) {
    let additional_data = {};
    // if its for subscription package
    if (this.helper.cmpStr(product_type, 'package')) {
      const { allowed_slot, banner_image, weekly_dealz, weekly_banner_dealz } =
        await this.service.productMatrix.findOne({ product_name });
      additional_data = {
        allowed_slot,
        banner_image,
        weekly_dealz,
        weekly_banner_dealz,
      };
    }

    // if its an addon and for additional slot
    if (
      this.helper.cmpStr(product_type, 'addon') &&
      this.helper.cmpStr(product_name, 'slot')
    ) {
      additional_data = {
        allowed_slot: product_amount,
      };
    }

    // if its an addon and for dealz banner
    if (
      this.helper.cmpStr(product_type, 'addon') &&
      this.helper.cmpStr(product_name, 'banner')
    ) {
      additional_data = {
        banner_image: product_amount,
      };
    }

    // if its an addon and for dealz weekly dealz
    if (
      this.helper.cmpStr(product_type, 'addon') &&
      this.helper.cmpStr(product_name, 'weekly_dealz')
    ) {
      additional_data = {
        weekly_dealz: product_amount,
      };
    }

    // if its an addon and for dealz weekly dealz
    if (
      this.helper.cmpStr(product_type, 'addon') &&
      this.helper.cmpStr(product_name, 'weekly_banner_dealz')
    ) {
      additional_data = {
        weekly_banner_dealz: product_amount,
      };
    }

    return additional_data;
  }

  /**
   * Description
   * Service function for creating records of the new agency subscription
   * @async
   * @method
   * @name createAgencySubscriptionRecord
   * @kind method
   * @memberof StripeService
   * @param {any} agency_id
   * @param {any} subscription_id
   * @param {any} transaction
   * @returns {Promise<void>}
   */
  async createAgencySubscriptionRecord(
    agency_id,
    subscription_id,
    transaction,
  ) {
    const subscription = await this.retrieveStripeSubscription(subscription_id);
    const subscriptionProducts = subscription.items.data;
    const matrixStripePriceID = this.matrixStripePriceID;
    console.log(matrixStripePriceID);
    const subscriptionPrice = subscriptionProducts.find((item) =>
      matrixStripePriceID.includes(item.price.id),
    );
    console.log(subscriptionPrice);
    const subscriptionProduct = subscriptionPrice.plan.product;
    const productDetails = await this.retrieveStripeProduct(
      subscriptionProduct,
    );
    const productMeta = productDetails.metadata;
    const subscription_name = productMeta.tier;
    try {
      const agency_subscription_id =
        await this.service.agencySubscription.createAgencySubscription(
          {
            agency_fk: agency_id,
            stripe_subscription_id: subscription_id,
            subscription_name,
            period_start: new Date(subscription.current_period_start * 1000),
            period_end: new Date(subscription.current_period_end * 1000),
            status: 'active',
          },
          { transaction },
        );
      return {
        agency_subscription_id,
        products: subscriptionProducts,
        period_start: new Date(subscription.current_period_start * 1000),
        period_end: new Date(subscription.current_period_end * 1000),
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to save the agency stripe subscription product
   * @async
   * @method
   * @name saveStripeSubscriptionProduct
   * @kind method
   * @memberof StripeService
   * @param {any} agency_id
   * @param {any} agency_subscription_id
   * @param {any} item
   * @param {any} period_start
   * @param {any} period_end
   * @param {any} transaction
   * @returns {Promise<string>}
   */
  async saveStripeSubscriptionProduct({
    agency_id,
    agency_subscription_id,
    stripe_subscription_id,
    item,
    period_start,
    period_end,
    transaction,
  }) {
    console.log('to save stripe product', item);
    console.log('product', item.plan.product);
    const productDetails = await this.retrieveStripeProduct(item.plan.product);
    const product_meta = productDetails.metadata;
    const product_type = product_meta.product_type;
    const product_name = product_meta.tier;
    const product_amount = item.quantity;

    // prepares the additional data for the subscription product
    const additional_data = await this.getSubscriptionProductAdditionalData(
      product_type,
      product_name,
      product_amount,
    );
    try {
      // save the product record
      const agency_subscription_product_id =
        await this.service.agencySubscriptionProduct.createAgencySubscriptionProduct(
          {
            agency_subscription_fk: agency_subscription_id,
            stripe_product_id: item.plan.product,
            product_name,
            ...additional_data,
          },
          { transaction },
        );

      // if subscription is basic, set cancel_at_period_end to true
      console.log({
        product_id_from_stripe: item.plan.product,
        recorded_product_id: process.env.DEALZ_BASIC_PRODUCT_ID,
        stripe_subscription_id,
      });
      if (
        this.helper.cmpStr(
          item.plan.product,
          process.env.DEALZ_BASIC_PRODUCT_ID,
        )
      ) {
        await this.updateStripeSubscription(stripe_subscription_id, {
          cancel_at_period_end: true,
          metadata: { is_subscription_recurring: 'false' },
        });
      }

      // save the initial inventory
      await this.service.inventory.createInventory(
        {
          agency_fk: agency_id,
          inventory_type: !this.helper.cmpStr(
            product_type,
            this.constants.AGENCY.INVENTORY.TYPE.ADDON,
          )
            ? this.constants.AGENCY.INVENTORY.TYPE.SUBSCRIPTION
            : product_type,
          agency_subscription_product_fk: agency_subscription_product_id,
          item_type: this.helper.cmpStr(
            product_type,
            this.constants.AGENCY.INVENTORY.TYPE.ADDON,
          )
            ? product_name
            : this.constants.AGENCY.INVENTORY.ITEM_TYPE.SLOT,
          period_start: !this.helper.cmpStr(
            product_type,
            this.constants.AGENCY.INVENTORY.TYPE.ADDON,
          )
            ? period_start
            : null,
          period_end: !this.helper.cmpStr(
            product_type,
            this.constants.AGENCY.INVENTORY.TYPE.ADDON,
          )
            ? period_end
            : null,
          inventory_count: !this.helper.cmpStr(
            product_type,
            this.constants.AGENCY.INVENTORY.TYPE.ADDON,
          )
            ? additional_data.allowed_slot
            : product_amount,
          used_count: 0,
        },
        { transaction },
      );
      return { agency_subscription_product_id, additional_data };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to update stripe invoice record
   * @async
   * @method
   * @name updateStripeInvoice
   * @kind method
   * @memberof StripeService
   * @param {any} invoice_id
   * @param {any} record
   * @returns {globalThis.Promise<any>}
   */
  async updateStripeInvoice(invoice_id, record) {
    return await this.stripe.invoices.update(invoice_id, record);
  }

  /**
   * Description
   * Service function for handling subscription period change event
   * @async
   * @method
   * @name updateSubscriptionFromPeriodChangeEvent
   * @kind method
   * @memberof StripeService
   * @param {any} agency_id
   * @param {any} subscription_id
   * @returns {globalThis.Promise<void>}
   */
  async updateSubscriptionFromPeriodChangeEvent(agency_id, subscription_id) {
    // retrieve the stripe subscription data
    const subscription = await this.retrieveStripeSubscription(subscription_id);
    const existing_subscription = await this.service.agencySubscription.findOne(
      {
        agency_fk: agency_id,
        stripe_subscription_id: subscription_id,
        period_start: new Date(subscription.current_period_start * 1000),
        period_end: new Date(subscription.current_period_end * 1000),
        status: 'active',
      },
    );

    const transaction = await this.models.sequelize.transaction();
    try {
      // set meta data for client reference ID
      await this.updateStripeSubscription(subscription_id, {
        metadata: {
          client_reference_id: agency_id,
        },
      });

      /**
       * cancel all active subscription including current subscription
       * with same subscription id of the updated
       */
      await this.service.agencySubscription.updateAgencySubscription(
        {
          agency_fk: agency_id,
          status: 'active',
        },
        { status: 'inactive' },
        { transaction },
      );

      if (this.helper.isEmpty(existing_subscription)) {
        await this.service.agencySubscription.updateAgencySubscription(
          {
            agency_fk: agency_id,
          },
          { status: 'inactive' },
          { transaction },
        );

        // Create subscription and product record
        const { agency_subscription_id, products, period_start, period_end } =
          await this.createAgencySubscriptionRecord(
            agency_id,
            subscription_id,
            transaction,
          );
        // saving subscription products
        for (const item of products) {
          const { agency_subscription_product_id, additional_data } =
            await this.saveStripeSubscriptionProduct({
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
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to handle item change event for subscription
   * @async
   * @method
   * @name updateSubscriptionFromItemChangeEvent
   * @kind method
   * @memberof StripeService
   * @param {any} event
   * @param {any} agency_id
   * @param {any} subscription_id
   * @returns {globalThis.Promise<void>}
   */
  async updateSubscriptionFromItemChangeEvent(
    event,
    agency_id,
    subscription_id,
  ) {
    // the given subscription items in the payload
    const newSubscriptionItems = event.data.object.items.data;

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

    if (
      this.helper.notEmpty(subscription) &&
      this.helper.notEmpty(newSubscriptionItems)
    ) {
      // get all recorded products for the current subscription from DB
      const subscriptionProducts =
        await this.service.agencySubscriptionProduct.findAll(
          {
            agency_subscription_fk: subscription.agency_subscription_id,
          },
          {
            order: [['created_date', 'DESC']],
          },
        );
      if (this.helper.notEmpty(subscriptionProducts)) {
        let existingProducts = [];
        // get the stripe product IDs recorded in DB for current subscription
        await Promise.mapSeries(subscriptionProducts, async (product) => {
          existingProducts.push(product.stripe_product_id);
        });

        const transaction = await this.models.sequelize.transaction();
        try {
          // process the new subscription item set
          await this.processSaveNewSubscriptionProducts(
            agency_id,
            newSubscriptionItems,
            existingProducts,
            subscription,
            transaction,
          );

          // process delete subscription product
          await this.processDeletedSubscriptionProducts(
            newSubscriptionItems,
            existingProducts,
            subscription,
            transaction,
          );

          // process any addon products in the payload set
          await this.processAddOnSubscriptionProducts(
            newSubscriptionItems,
            subscription,
            transaction,
          );
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw new Error(error);
        }
      }
    }
  }

  async processSaveNewSubscriptionProducts(
    agency_id,
    newSubscriptionItems,
    existingProducts,
    subscription,
    transaction,
  ) {
    const period_start = new Date(subscription.current_period_start * 1000);
    const period_end = new Date(subscription.current_period_end * 1000);
    // get the product IDs that are not yet recorded in DBfor current subscription
    const filteredNewItems = newSubscriptionItems.filter(
      (item) => !existingProducts.includes(item.plan.product),
    );

    // if there are new product IDs, save in DB
    if (this.helper.notEmpty(filteredNewItems)) {
      // add the new products in subscription product table
      for (const item of filteredNewItems) {
        const { agency_subscription_product_id, additional_data } =
          await this.saveStripeSubscriptionProduct({
            agency_id,
            agency_subscription_id: subscription.agency_subscription_id,
            stripe_subscription_id: subscription.id,
            item,
            period_start,
            period_end,
            transaction,
          });
        await this.service.stripe.saveAdditionalSubscriptionProductsInventory({
          agency_id,
          period_start,
          period_end,
          agency_subscription_product_id,
          additional_data,
          transaction,
        });
      }
    }

    return true;
  }

  /**
   * Description
   * Service function to delete subscription products
   * @async
   * @method
   * @name processDeletedSubscriptionProducts
   * @kind method
   * @memberof StripeService
   * @param {any} newSubscriptionItems
   * @param {any} existingProducts
   * @param {any} subscription
   * @param {any} transaction
   * @returns {globalThis.Promise<boolean>}
   */
  async processDeletedSubscriptionProducts(
    newSubscriptionItems,
    existingProducts,
    subscription,
    transaction,
  ) {
    let deletedProducts = [];
    // map the current stripe subscription product IDs
    const payloadSubscriptionItemIDs = newSubscriptionItems.map(
      (item) => item.plan.product,
    );

    // check if stripe provided products for the current subscription
    if (this.helper.notEmpty(payloadSubscriptionItemIDs)) {
      // if there are products from the stripe subscription product IDS, add to the deletedProducts array
      deletedProducts = existingProducts.filter(
        (dbProductId) => !payloadSubscriptionItemIDs.includes(dbProductId),
      );
    }

    // delete the removed product items
    if (this.helper.notEmpty(deletedProducts)) {
      await this.service.agencySubscriptionProduct.deleteAgencySubscriptionProduct(
        {
          agency_subscription_fk: subscription.agency_subscription_id, // limit to agency
          stripe_product_id: {
            [this.Op.in]: deletedProducts,
          },
        },
        { transaction },
      );
    }

    return true;
  }

  /**
   * Description
   * Service function to process checking addon products in the subscription payload
   * @async
   * @method
   * @name processAddOnSubscriptionProducts
   * @kind method
   * @memberof StripeService
   * @param {any} newSubscriptionItems
   * @param {any} subscription
   * @param {any} transaction
   * @returns {globalThis.Promise<boolean>}
   */
  async processAddOnSubscriptionProducts(
    newSubscriptionItems,
    subscription,
    transaction,
  ) {
    // check if there are any products from stripe payload that are addons
    const matrixStripePriceID = this.matrixStripePriceID;
    const filteredAddOnItems = newSubscriptionItems.filter(
      (item) => !matrixStripePriceID.includes(item.plan.id),
    );

    // process addon products
    if (this.helper.notEmpty(filteredAddOnItems)) {
      // check if there are changes with the addon amount
      for (const item of filteredAddOnItems) {
        await this.processAddOnProductIfAmountsHaveChanged(
          subscription.agency_subscription_id,
          item,
          transaction,
        );
      }
    }

    return true;
  }

  /**
   * Description
   * Service function to update addon product if the amounts have changed
   * @async
   * @method
   * @name processAddOnProductIfAmountsHaveChanged
   * @kind method
   * @memberof StripeService
   * @param {any} agency_subscription_id
   * @param {any} item
   * @param {any} transaction
   * @returns {globalThis.Promise<void>}
   */
  async processAddOnProductIfAmountsHaveChanged(
    agency_subscription_id,
    item,
    transaction,
  ) {
    const savedAddOn = await this.service.agencySubscriptionProduct.findOne({
      agency_subscription_fk: agency_subscription_id,
      stripe_product_id: item.plan.product,
    });
    /**
     * update addon quantity if the current and new addon does not match
     * this will be for conversation addon
     */
    if (
      this.helper.notEmpty(savedAddOn) &&
      this.helper.cmpStr(savedAddOn.product_name, 'conversation') &&
      !this.helper.cmpInt(savedAddOn.allowed_outgoing_messages, item.quantity)
    ) {
      await this.service.agencySubscriptionProduct.updateAgencySubscriptionProduct(
        {
          agency_subscription_product_id:
            savedAddOn.agency_subscription_product_id,
        },
        { allowed_outgoing_messages: item.quantity },
        { transaction },
      );
    }
  }

  /**
   * Description
   * Get checkout session based on given ID
   * @async
   * @method
   * @name getCheckoutSession
   * @kind method
   * @memberof StripeService
   * @param {any} checkout_session_id
   * @returns {globalThis.Promise<any>}
   */
  async getCheckoutSession(checkout_session_id) {
    const session = await this.stripe.checkout.sessions.retrieve(
      checkout_session_id,
      {
        expand: ['line_items.data.price.product'], // Ensure deep expansion
      },
    );
    return session;
  }

  /**
   * Description
   * Save additional inventory included for the subscription
   * @async
   * @method
   * @name saveAdditionalSubscriptionProductsInventory
   * @kind method
   * @memberof StripeService
   * @param {{ agency_id: any period_start: any period_end: any additional_data: any transaction: any }} { agency_id, period_start, period_end, additional_data, transaction, }
   * @returns {globalThis.Promise<void>}
   */
  async saveAdditionalSubscriptionProductsInventory({
    agency_id,
    period_start,
    period_end,
    agency_subscription_product_id,
    additional_data,
    transaction,
  }) {
    for (const item in additional_data) {
      const item_type = this.helper.cmpStr(item, 'allowed_slot')
        ? 'slot'
        : this.helper.cmpStr(item, 'banner_image')
        ? 'banner'
        : item;
      if (!this.helper.cmpStr(item_type, 'slot')) {
        const existingAdditionalProductInventory =
          await this.service.inventory.findOne({
            agency_fk: agency_id,
            inventory_type: 'subscription',
            agency_subscription_product_fk: agency_subscription_product_id,
            item_type,
            period_start,
            period_end,
          });
        if (this.helper.isEmpty(existingAdditionalProductInventory)) {
          await this.service.inventory.createInventory(
            {
              agency_fk: agency_id,
              inventory_type: 'subscription',
              agency_subscription_product_fk: agency_subscription_product_id,
              item_type,
              period_start,
              period_end,
              inventory_count: additional_data[item],
              used_count: 0,
            },
            { transaction },
          );
        }
      }
    }
  }
}
module.exports = StripeService;
