const Sentry = require('@sentry/node');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const models = require('../../models');
const config = require('../../configs/config')(process.env.NODE_ENV);
const userController = require('../../controllers/user').makeUserController(
  models,
);
const agencyController =
  require('../../controllers/agency').makeAgencyController(models);
const agencyUserController =
  require('../../controllers/agencyUser').makeAgencyUserController(models);
const whatsappPricingMatrix =
  require('../../controllers/whatsappMessagePricing').makeController(models);
const agencySubscriptionController =
  require('../../controllers/agencySubscription').makeController(models);

const userEmailVerificationController =
  require('../../controllers/userEmailVerification').makeUserEmailVerificationController(
    models,
  );
const messageInventory =
  require('../../controllers/messageInventory').makeController(models);
const campaignInventory =
  require('../../controllers/campaignInventory').makeController(models);
const agencySubscriptionProduct =
  require('../../controllers/agencySubscriptionProduct').makeController(models);
const chaaatProductMatrix =
  require('../../controllers/chaaatProductMatrix').makeController(models);
// routes for industry, company_website, company_name, company_size
const stripe = require('stripe')(config.stripe.secretKey);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/agency/company register company details for agency
   * @apiName registerCompany
   * @apiVersion 1.0.0
   * @apiGroup RegisterCompany
   *
   * @apiParam {string} email user email
   * @apiParam {string} company_name name of company
   * @apiParam {string} real_estate_type of company
   * @apiParam {string} company_size of company
   * @apiParam {string} company_website of company
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_id Agency Id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/agency/company',
    schema: {
      body: {
        type: 'object',
        required: [
          'email',
          'company_name',
          'real_estate_type',
          'company_size',
          'company_website',
        ],
        properties: {
          email: { type: 'string' },
          company_name: { type: 'string' },
          real_estate_type: { type: 'string' },
          company_size: { type: 'string' },
          company_website: { type: 'string' },
          register_method: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const {
        email,
        company_name,
        real_estate_type,
        company_size,
        company_website,
        register_method,
      } = request.body;

      // find user by email
      const user_exists = await userController.findOne({ email: email });

      // user doesn't exist (never completed step 1 of signup)
      if (h.isEmpty(user_exists)) {
        return h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-auth-1608510138480',
        );
      }

      const company_name_taken = await agencyController.findOne({
        agency_name: company_name,
      });

      if (h.notEmpty(company_name_taken)) {
        return h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-auth-company-name-1608510138480',
        );
      } else {
        // execute generation of trial code
        const trial_code = await agencyController.genereteTrialCode();

        // creating agency record
        const agency_id = await generateAgency(
          user_exists,
          company_name,
          company_size,
          company_website,
          real_estate_type,
          trial_code,
        );

        await h.database.transaction(async (transaction) => {
          // creating chaaat support account
          await agencyController.createSupportAccounts(
            { agency_id, company_name, user: 'support' },
            { transaction },
          );
        });

        const { agency_user_id } = await h.database.transaction(
          async (transaction) => {
            // processing adding trial WABA number
            const { agency_whatsapp_config_id, trial_waba_template } =
              await agencyController.setTrialWABANumberForAgency(
                {
                  agency_id,
                  company_name,
                  trial_code,
                },
                {
                  transaction,
                },
              );

            // creates agency_user record with each registration of agency
            const agency_user_id = await agencyUserController.create(
              {
                agency_fk: agency_id,
                user_fk: user_exists.user_id,
              },
              { transaction },
            );

            if (h.cmpStr(register_method, constant.USER.AUTH_TYPE.EMAIL)) {
              // send the verification email to the user
              await userEmailVerificationController.create(
                user_exists.user_id,
                user_exists.user_id,
                {
                  transaction,
                },
              );
              await userEmailVerificationController.sendEmailVerification(
                user_exists.user_id,
                { transaction },
              );
            }

            return {
              agency_user_id,
              agency_whatsapp_config_id,
              trial_waba_template,
            };
          },
        );

        const response_code = '1-agency-1622178043';

        // update default contact owner for agency
        await h.database.transaction(async (transaction) => {
          await models.agency.update(
            {
              default_outsider_contact_owner: agency_user_id,
              campaign_approval_agent: agency_user_id,
            },
            { where: { agency_id }, transaction },
          );
        });

        const { agency_subscription_id, period_from, period_to } =
          await processAgencyStripeTrialSubscription(
            agency_id,
            email,
            agency_user_id,
          );

        // update inventory count for users - this will not include chaaat admins
        await h.database.transaction(async (transaction) => {
          await messageInventory.create(
            {
              agency_fk: agency_id,
              agency_subscription_fk: agency_subscription_id,
              message_count: 0,
              period_from,
              period_to,
            },
            { transaction },
          );
          await campaignInventory.create(
            {
              agency_fk: agency_id,
              agency_subscription_fk: agency_subscription_id,
              campaign_count: 0,
              period_from,
              period_to,
            },
            { transaction },
          );
        });

        h.api.createResponse(
          request,
          reply,
          200,
          { agency_id: agency_id },
          response_code,
        );
      }
    },
  });

  /**
   * @api {post} /v1/agency/company-name register company name for agency
   * @apiName registerCompanyName
   * @apiVersion 1.0.0
   * @apiGroup RegisterCompanyName
   *
   * @apiParam {string} email user email
   * @apiParam {string} company_name name of company
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_id Agency Id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/agency/company-name',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'company_name'],
        properties: {
          email: { type: 'string' },
          company_name: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, company_name } = request.body;

      // find user by email
      const user_exists = await userController.findOne({ email: email });

      // user doesn't exist (never completed step 1 of signup)
      if (h.isEmpty(user_exists)) {
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
      }
      // check if company name already taken
      const company_name_taken = await agencyController.findOne({
        agency_name: company_name,
      });

      if (h.notEmpty(company_name_taken)) {
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-auth-company-name-1608510138480',
        );
      }

      const { agency_id, agency_user_id, response_code } =
        await h.database.transaction(async (transaction) => {
          // create agency
          const agency_id = await agencyController.create(
            {
              agency_name: company_name,
              created_by: user_exists.user_id,
            },
            { transaction },
          );
          const response_code = '1-agency-1622178043';

          // creates agency_user record with each registration of agency
          const agency_user_id = await agencyUserController.create(
            {
              agency_fk: agency_id,
              user_fk: user_exists.user_id,
            },
            { transaction },
          );
          return { agency_id, agency_user_id, response_code };
        });

      // update default contact owner for agency
      await h.database.transaction(async (transaction) => {
        await models.agency.update(
          {
            default_outsider_contact_owner: agency_user_id,
          },
          { where: { agency_id }, transaction },
        );
      });

      // method to send email to alan and charlie on agency creation
      await h.misc.sendEmailToAlanAndCharlie(
        'New agency created',
        'New agency created',
        company_name,
        user_exists.first_name + ' ' + user_exists.last_name,
        email,
      );

      h.api.createResponse(
        request,
        reply,
        200,
        { agency_id: agency_id },
        response_code,
      );
    },
  });

  /**
   * @api {post} /v1/agency/industry register company type(industry) for agency
   * @apiName registerIndustry
   * @apiVersion 1.0.0
   * @apiGroup RegisterCompanyType
   *
   * @apiParam {string} email user email
   * @apiParam {string} industry the company type of agency
   * @apiParam {string} agency_id agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/agency/industry',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'industry'],
        properties: {
          email: { type: 'string' },
          industry: { type: 'string' },
          agency_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, industry } = request.body;
      let { agency_id } = request.body;

      const user_exists = await userController.findOne({ email: email });

      if (h.isEmpty(user_exists)) {
        // user doesn't exist
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
      }

      // get agency_id if not provided
      if (!agency_id) {
        const agency_user = await agencyUserController.findOne({
          user_fk: user_exists.user_id,
        });
        agency_id = agency_user.agency_fk;
      }

      // get agency
      const agency = await agencyController.findOne({ agency_id: agency_id });

      if (h.isEmpty(agency)) {
        h.api.createResponse(
          request,
          reply,
          500,
          { agency_id: agency_id },
          '2-agency-1622176528',
        );
      } else {
        const updated_agency_id = await h.database.transaction(
          async (transaction) => {
            return await agencyController.update(
              agency_id,
              { agency_type: industry },
              { transaction },
            );
          },
        );

        // send email that the Industry was updated for an agency.
        await h.misc.sendEmailToAlanAndCharlie(
          `Industry added to agency: ${agency.agency_name}`,
          `Industry is updated to ${industry}`,
          agency.agency_name,
          user_exists.first_name + ' ' + user_exists.last_name,
          email,
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { agency_id: updated_agency_id },
          '1-agency-1622176515',
        );
      }
    },
  });

  /**
   * @api {post} /v1/agency/company-website register company website for agency
   * @apiName registerCompanyWebsite
   * @apiVersion 1.0.0
   * @apiGroup RegisterCompanyWebsite
   *
   * @apiParam {string} email user email
   * @apiParam {string} company_website the company website of agency
   * @apiParam {string} agency_id agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/agency/company-website',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'company_website'],
        properties: {
          email: { type: 'string' },
          company_website: { type: 'string' },
          agency_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },

    handler: async (request, reply) => {
      const { email, company_website } = request.body;
      let { agency_id } = request.body;

      const user_exists = await userController.findOne({ email: email });
      if (h.isEmpty(user_exists)) {
        // user doesn't exist
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
      }

      if (!agency_id) {
        const agency_user = await agencyUserController.findOne({
          user_fk: user_exists.user_id,
        });
        agency_id = agency_user.agency_fk;
      }

      // get agency
      const agency = await agencyController.findOne({ agency_id: agency_id });
      if (h.isEmpty(agency)) {
        h.api.createResponse(
          request,
          reply,
          500,
          { agency_id: agency_id },
          '2-agency-1622176528',
        );
      } else {
        const updated_agency_id = await h.database.transaction(
          async (transaction) => {
            const updated_agency_id = await agencyController.update(
              agency_id,
              { agency_website: company_website },
              { transaction },
            );

            await agencyController.createSupportAccounts(
              { agency_id, company_name: agency.agency_name },
              { transaction },
            );

            return updated_agency_id;
          },
        );

        // send email that the company_website was updated for an agency.
        await h.misc.sendEmailToAlanAndCharlie(
          `Website added to agency: ${agency.agency_name}`,
          `Company website is updated to ${company_website}`,
          agency.agency_name,
          user_exists.first_name + ' ' + user_exists.last_name,
          email,
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { agency_id: updated_agency_id },
          '1-agency-1622176515',
        );
      }
    },
  });

  /**
   * @api {post} /v1/agency/company-size register company size for agency
   * @apiName registerCompanySize
   * @apiVersion 1.0.0
   * @apiGroup RegisterCompanySize
   *
   * @apiParam {string} email user email
   * @apiParam {string} company_size the company size of agency
   * @apiParam {string} agency_id agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/agency/company-size',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'company_size'],
        properties: {
          email: { type: 'string' },
          company_size: { type: 'string' },
          agency_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_id: { type: 'string' },
          },
        },
      },
    },

    handler: async (request, reply) => {
      const { email, company_size } = request.body;
      let { agency_id } = request.body;

      const user_exists = await userController.findOne({ email: email });
      if (h.isEmpty(user_exists)) {
        // user doesn't exist
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
      }

      // get agency_id if not provided
      if (!agency_id) {
        const agency_user = await agencyUserController.findOne({
          user_fk: user_exists.user_id,
        });
        agency_id = agency_user.agency_fk;
      }

      // get agency
      const agency = await agencyController.findOne({ agency_id: agency_id });

      if (h.isEmpty(agency)) {
        h.api.createResponse(
          request,
          reply,
          500,
          { agency_id: agency_id },
          '2-agency-1622176528',
        );
      } else {
        const updated_agency_id = await h.database.transaction(
          async (transaction) => {
            return await agencyController.update(
              agency_id,
              { agency_size: company_size },
              { transaction },
            );
          },
        );
        // send email that the company size was updated for the agency.
        await h.misc.sendEmailToAlanAndCharlie(
          `Company size added to agency: ${agency.agency_name}`,
          `company size is updated to ${company_size}`,
          agency.agency_name,
          user_exists.first_name + ' ' + user_exists.last_name,
          email,
        );
        h.api.createResponse(
          request,
          reply,
          200,
          { agency_id: updated_agency_id },
          '1-agency-1622176515',
        );
      }
    },
  });

  /**
   * @api {post} /v1/agency/real-estate-type register company type(real-estate-type) for agency
   * @apiName registerRealEstateType
   * @apiVersion 1.0.0
   * @apiGroup RegisterCompanyType
   *
   * @apiParam {string} email user email
   * @apiParam {string} real estate type of agency
   * @apiParam {string} agency_id agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/agency/real-estate-type',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'real_estate_type'],
        properties: {
          email: { type: 'string' },
          real_estate_type: { type: 'string' },
          agency_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, real_estate_type } = request.body;
      let { agency_id } = request.body;

      const user_exists = await userController.findOne({ email: email });

      if (h.isEmpty(user_exists)) {
        // user doesn't exist
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
      }

      // get agency_id if not provided
      if (!agency_id) {
        const agency_user = await agencyUserController.findOne({
          user_fk: user_exists.user_id,
        });
        agency_id = agency_user.agency_fk;
      }

      // get agency
      const agency = await agencyController.findOne({ agency_id: agency_id });

      if (h.isEmpty(agency)) {
        h.api.createResponse(
          request,
          reply,
          500,
          { agency_id: agency_id },
          '2-agency-1622176528',
        );
      } else {
        const updated_agency_id = await h.database.transaction(
          async (transaction) => {
            return await agencyController.update(
              agency_id,
              { real_estate_type },
              { transaction },
            );
          },
        );

        // // send email that the real estate type was updated for an agency.
        // await h.misc.sendEmailToAlanAndCharlie(
        //   `Real estate type added to agency: ${agency.agency_name}`,
        //   `Real estate type is updated to ${real_estate_type}`,
        //   agency.agency_name,
        //   user_exists.first_name + ' ' + user_exists.last_name,
        //   email,
        // );

        h.api.createResponse(
          request,
          reply,
          200,
          { agency_id: updated_agency_id },
          '1-agency-1622176515',
        );
      }
    },
  });

  /**
   * @api {get} /agency/message-pricing-matrix
   * API Endpoint to get pricing matrix based on country, type, and currency
   * Will require use of {get} /v1/services/csrf to generate csrf token
   * @apiName messagePricingMatrix
   * @apiVersion 1.0.0
   * @apiGroup Agency
   *
   * @param {string} country country to check pricing
   * @param {string} type message type (marketing, utility, authentication,
   * authentication_intl, service)
   * @param {string} currency pricing currency
   *
   * @sampleResponse
   * {
   *    "data": {
   *      "whatsapp_message_pricing_id": "",
   *       "market": "",
   *      "currency": "",
   *       "authentication_intl": null // depends on the type parameter
   *     },
   *     "status": "",
   *     "message": "",
   *     "message_code": ""
   *   }
   */
  fastify.route({
    method: 'GET',
    url: '/agency/message-pricing-matrix',
    schema: {
      query: {
        type: 'object',
        required: ['country', 'type', 'currency'],
        properties: {
          country: { type: 'string' },
          type: { type: 'string' },
          currency: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { country, type, currency } = request.query;
      try {
        let data = await whatsappPricingMatrix.getTypeCountryCurrencyMatrix({
          country,
          type,
          currency,
        });
        data = h.isEmpty(data) ? {} : data;
        h.api.createResponse(
          request,
          reply,
          200,
          { data },
          '1-matrix-1608509359974',
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error(err);
        h.api.createResponse(
          request,
          reply,
          500,
          { err },
          '2-matrix-1608510138480',
        );
      }
    },
  });
  next();
};

/**
 * Description
 * Function to generate agency record
 * @async
 * @function
 * @name generateAgency
 * @kind function
 * @param {any} user_exists
 * @param {string} company_name
 * @param {string} company_size
 * @param {string} real_estate_type
 * @param {string} trial_code
 * @returns {Promise} agency id
 */
async function generateAgency(
  user_exists,
  company_name,
  company_size,
  company_website,
  real_estate_type,
  trial_code,
) {
  const transaction = await models.sequelize.transaction();

  try {
    // create agency
    const agency_id = await agencyController.create(
      {
        agency_name: company_name,
        real_estate_type,
        agency_size: company_size,
        agency_website: company_website,
        trial_code,
        agency_whatsapp_api_token: 1,
        agency_whatsapp_api_secret: 1,
        agency_waba_id: 1,
        agency_waba_template_token: 1,
        agency_waba_template_secret: 1,
        created_by: user_exists.user_id,
      },
      { transaction },
    );

    await transaction.commit();

    return agency_id;
  } catch (error) {
    await transaction.rollback();
    Sentry.captureException(error);
  }
}

/**
 * Description
 * Function to process agency trial subscription in stripe
 * @async
 * @function
 * @name processAgencyStripeTrialSubscription
 * @kind function
 * @param {string} agency_id
 * @param {string} email
 * @param {string} agency_user_id
 */
async function processAgencyStripeTrialSubscription(
  agency_id,
  email,
  agency_user_id,
) {
  const agency = await agencyController.findOne({ agency_id });

  // Create a customer
  const customer = await stripe.customers.create({
    email,
    phone: agency?.mobile_number,
    name: agency?.agency_name,
    tax_exempt: 'exempt',
  });

  // Create a subscription with a trial period
  const currentPeriodStart = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
  const currentPeriodEnd = currentPeriodStart + 7 * 24 * 60 * 60; // 7 days later

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.SUBSCRIPTION_TRIAL_PRICE }],
    metadata: { client_reference_id: agency_id },
    cancel_at_period_end: true,
  });

  const subscriptionProducts = subscription.items.data;

  const subscription_transaction = await models.sequelize.transaction();
  try {
    await agencyController.update(
      agency_id,
      {
        agency_stripe_customer_id: customer.id,
      },
      { transaction: subscription_transaction },
    );

    // Create trial subscription
    const agency_subscription_id = await agencySubscriptionController.create(
      {
        agency_fk: agency_id,
        stripe_subscription_id: subscription.id,
        subscription_name: 'Trial',
        subscription_start: new Date(currentPeriodStart * 1000),
        subscription_end: new Date(currentPeriodEnd * 1000),
        status: 'active',
        agency_user_fk: agency_user_id,
      },
      { transaction: subscription_transaction },
    );
    await subscription_transaction.commit();

    // loop through the associated subscription products
    for (const item of subscriptionProducts) {
      await saveSubscriptionProduct(agency_subscription_id, item);
    }

    return {
      agency_subscription_id,
      period_from: new Date(currentPeriodStart * 1000),
      period_to: new Date(currentPeriodEnd * 1000),
    };
  } catch (error) {
    await subscription_transaction.rollback();
    Sentry.captureException(error);
    throw new Error(error);
  }
}

/**
 * Description
 * Function to save the product associated with the subscription
 * @async
 * @function
 * @name saveSubscriptionProduct
 * @kind function
 * @param {any} agency_subscription_id
 * @param {any} item
 * @returns {Promise<void>}
 */
async function saveSubscriptionProduct(agency_subscription_id, item) {
  const productDetails = await stripe.products.retrieve(item?.plan?.product);
  const product_meta = productDetails?.metadata;
  const product_type = product_meta?.product_type;
  const product_name = product_meta?.tier;
  const product_amount = h.cmpStr(product_name, 'contact')
    ? product_meta?.unit
    : item?.quantity;
  const additional_data = await prepareSubscriptionProductAdditionalData(
    product_type,
    product_name,
    product_amount,
  );
  const transaction = await models.sequelize.transaction();
  try {
    await agencySubscriptionProduct.create(
      {
        agency_subscription_fk: agency_subscription_id,
        stripe_product_id: item.plan.product,
        subscription_data: JSON.stringify(item),
        product_name,
        ...additional_data,
      },
      { transaction },
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    Sentry.captureException(error);
    throw new Error(error);
  }
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
    } = await chaaatProductMatrix.findOne({ product_name });
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
