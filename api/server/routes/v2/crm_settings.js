const models = require('../../models');
const h = require('../../helpers');
const userMiddleware = require('../../middlewares/user');
const c = require('../../controllers');
const constants = require('../../constants/constant.json');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/crm-setting',
    prevalidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
      ]);
    },
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'agency_user_id', 'automation_rule_template_id', 'crm_type'],
        properties: {
          agency_id: { type: 'string' },
          agency_user_id: { type: 'string' },
          automation_rule_template_id: { type: 'string' },
          crm_type: { type: 'string', enum: ['GCALENDAR', 'OUTLOOKCALENDAR'] },
          screens_data: {
            type: 'array',
            items: {
              type: 'object',
            }
          },
        }
      }
    },
    handler: async (req, res) => {
      const portal = h.request.getPortal(req);
      const reqBody = req.body;
      const {
        agency_id,
        agency_user_id,
        automation_rule_template_id,
        screens_data,
        crm_type,
      } = req.body;

      const agencyOauth = await c.agencyOauthCtlr.findOne({
        source: crm_type,
        agency_fk: agency_id,
        status: 'active',
      });

      if (!agencyOauth) {
        return h.api.createResponse(
          req,
          res,
          400,
          {
            message: `CRM not active for ${crm_type}`
          },
          '2-crm-setting-create-1622179877',
        );
      }

      let upsertBody = {
        agency_fk: agency_id,
        updated_by: agency_user_id,
        crm_type,
        automation_rule_template_fk: automation_rule_template_id,
        agency_oauth_fk: agencyOauth.agency_oauth_id,
      };

      if (screens_data) {
        upsertBody.screens_data = JSON.stringify(screens_data);
      }

      if (agencyOauth.crm_timeslot_settings) {
        upsertBody.crm_timeslot_settings = agencyOauth.crm_timeslot_settings
      }

      try {
        let crmSettignsId
        let crmData = await c.crmSettings.findOne({
          agency_fk: agency_id,
          automation_rule_template_fk: automation_rule_template_id,
        });
        if (crmData) {
          crmSettignsId = await c.crmSettings.update(
            crmData.crm_settings_id,
            upsertBody,
          );

          return h.api.createResponse(
            req,
            res,
            200,
            {
              crm_settings_id: crmSettignsId,
            },
            '1-crm-setting-create-1622179877',
          );
        }
        const createBody = {
          ...upsertBody,
          created_by: agency_user_id,
          crm_timeslot_settings: upsertBody.crm_timeslot_settings ? upsertBody.crm_timeslot_settings : JSON.stringify(constants.DEFAULT_CRM_TIMESLOT_SETTING)
        };

        crmSettignsId = await c.crmSettings.create(createBody);
        h.api.createResponse(
          req,
          res,
          200,
          {
            crm_settings_id: crmSettignsId,
          },
          '1-crm-setting-create-1622179877',
        );
      } catch (error) {
        console.log(error)
        req.log.error({
          err,
          url: '/v2/crm-setting',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-crm-setting-create-1622179878',
          {
            portal,
          },
        );
      }
    }
  });

  fastify.route({
    method: 'GET',
    url: '/crm-setting',
    schema: {
      query: {
        type: 'object',
        required: ['agency_id', 'automation_rule_template_id'],
        properties: {
          agency_id: { type: 'string' },
          automation_rule_template_id: { type: 'string' },
        }
      }
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, automation_rule_template_id } = req.query;
        let crmData = await c.crmSettings.findOne({
          agency_fk: agency_id,
          automation_rule_template_fk: automation_rule_template_id,
        });
        if (!crmData) {
          return h.api.createResponse(
            req,
            res,
            400,
            {
              message: `Cannot find crm settings`,
            },
            '2-crm-setting-1622179876',
          );
        }
        h.api.createResponse(
          req,
          res,
          200,
          crmData,
          '1-crm-setting-1622179876',
        );
      } catch (err) {
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-crm-setting-1622179875',
        );
      }
    },
  });
  
  fastify.route({
    method: 'GET',
    url: '/crm-setting/:crm_settings_id',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { crm_settings_id } = req.params;
        let crmData = await c.crmSettings.findOne({
          crm_settings_id,
        });
        if (!crmData) {
          return h.api.createResponse(
            req,
            res,
            400,
            {
              message: `Cannot find crm settings`,
            },
            '2-crm-setting-1622179876',
          );
        }
        h.api.createResponse(
          req,
          res,
          200,
          crmData,
          '1-crm-setting-1622179876',
        );
      } catch (err) {
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-crm-setting-1622179875',
        );
      }
    },
  });

  next();
}