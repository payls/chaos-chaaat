const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const axios = require('axios');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /staff/whatsapp-template/:waba_id/:credentials/list-templates List UIB templates
   * @apiName ListUIBWABATemplates
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-template/:waba_id/:credentials/list-templates',
    schema: {
      params: {
        waba_id: { type: 'string' },
        credentials: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { waba_id, credentials } = req.params;

      try {
        const message_templates = await h.whatsapp.retrieveTemplates({
          waba_id,
          credentials,
          log: req.log,
        });
        if (h.cmpBool(message_templates.success, false))
          throw new Error(`Failed to retrieve list from WA api`);
        const templates = message_templates.templates;

        h.api.createResponse(
          req,
          res,
          200,
          { templates },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/whatsapp-template/:agency_id/list-agency-templates List UIB templates per agency
   * @apiName ListAgencyUIBWABATemplates
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-template/:agency_id/list-agency-templates',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id } = req.params;

      try {
        const templates = [];
        const whatsAppConfig = await c.agencyWhatsAppConfig.findAll(
          {
            agency_fk: agency_id,
          },
          {
            order: [['waba_name', 'ASC']],
          },
        );

        for (const whatsapp of whatsAppConfig) {
          const waba_credentials =
            whatsapp?.agency_waba_template_token +
            ':' +
            whatsapp?.agency_waba_template_secret;
          const credentials = Buffer.from(waba_credentials, 'utf8').toString(
            'base64',
          );
          console.log(whatsapp?.waba_id);
          const message_templates = await h.whatsapp.retrieveTemplates({
            waba_id: whatsapp?.agency_waba_id,
            credentials,
            log: req.log,
          });

          const wa_templates = message_templates.templates;

          for (const template of wa_templates) {
            template.waba = whatsapp?.waba_name;
            templates.push(template);
          }
        }

        h.api.createResponse(
          req,
          res,
          200,
          { templates },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/whatsapp-template/:waba_number/template/:template_id Get UIB template by template ID
   * @apiName GetUIBWABATemplateByID
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} selected_template UIB selected template data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-template/:waba_number/template/:template_id',
    schema: {
      params: {
        waba_number: { type: 'string' },
        template_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { waba_number, template_id } = req.params;
      const { user_id } = h.user.getCurrentUser(req);

      try {
        const currentAgencyUser = await c.agencyUser.findOne({
          user_fk: user_id,
        });

        const agency_id = currentAgencyUser?.agency_fk;
        const whatsAppConfig = await c.agencyWhatsAppConfig.findOne(
          {
            agency_fk: agency_id,
            waba_number: waba_number,
          },
          {
            order: [['waba_name', 'ASC']],
          },
        );

        const waba_credentials =
          whatsAppConfig?.agency_waba_template_token +
          ':' +
          whatsAppConfig?.agency_waba_template_secret;
        const credentials = Buffer.from(waba_credentials, 'utf8').toString(
          'base64',
        );
        const waba_id = whatsAppConfig?.agency_waba_id;

        const message_templates = await h.whatsapp.retrieveTemplates({
          waba_id,
          credentials,
          log: req.log,
        });
        if (h.cmpBool(message_templates.success, false))
          throw new Error(`Failed to retrieve list from WA api`);

        const whatsapp_templates = message_templates;

        const selected_template = whatsapp_templates.templates.find(
          (template) => template.id === template_id,
        );

        h.api.createResponse(
          req,
          res,
          200,
          { selected_template },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/whatsapp-template/:agency_id/sync-agency-templates Sync UIB agency templates to Pave DB
   * @apiName SyncAgencyUIBTemplates
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-template/:agency_id/sync-agency-templates',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id } = req.params;

      try {
        const whatsAppConfig = await c.agencyWhatsAppConfig.findAll(
          {
            agency_fk: agency_id,
          },
          {
            order: [['waba_name', 'ASC']],
          },
        );

        // Map each WhatsApp configuration to a processing promise
        const promises = whatsAppConfig.map(async (whatsapp) => {
          const waba_credentials =
            whatsapp?.agency_waba_template_token +
            ':' +
            whatsapp?.agency_waba_template_secret;
          const credentials = Buffer.from(waba_credentials, 'utf8').toString(
            'base64',
          );
          // get meta templates for WABA account
          const message_templates = await h.whatsapp.retrieveTemplates({
            waba_id: whatsapp?.agency_waba_id,
            credentials,
            log: req.log,
          });

          const wa_templates = message_templates?.success
            ? message_templates.templates
            : [];
          // Process templates in parallel
          const templatePromises = wa_templates.map(async (template) => {
            const curr_template = h.whatsapp.sanitizeData(template);
            const db_template = await models.waba_template.findOne({
              where: {
                agency_fk: whatsapp?.agency_fk,
                template_id: template.id,
                waba_number: whatsapp?.waba_number,
              },
            });

            // define template data object
            const template_data = {
              agency_fk: whatsapp?.agency_fk,
              template_id: curr_template.id,
              template_name: curr_template.name,
              waba_number: whatsapp?.waba_number,
              content: JSON.stringify(curr_template),
              category: curr_template.category,
              language: curr_template.language,
              status: curr_template.status,
              template_order: curr_template.name.includes('quick') ? 2 : 1,
            };

            // Process WhatsApp template sync
            await c.wabaTemplate.processWhatsAppTemplateSync(
              db_template,
              template_data,
            );

            return template.id; // Collect meta template IDs
          });

          const meta_templates = await Promise.all(templatePromises);

          /**
           * deleting waba template records in the database under the waba number of
           * the agency being processed
           */
          if (h.notEmpty(meta_templates)) {
            await c.wabaTemplate.deleteNonMetaTemplates({
              agency_id: whatsapp?.agency_fk,
              waba_number: whatsapp?.waba_number,
              meta_templates,
            });
          }
        });

        // Wait for all WhatsApp configurations to complete
        await Promise.all(promises);

        return h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-whatsapp-message-template-sync-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/staff/whatsapp-template/:agency_id/sync-agency-templates',
        });
        return h.api.createResponse(
          req,
          res,
          500,
          { err },
          '2-whatsapp-message-template-sync-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/agency-whatsapp-template/:agency_id/:waba_number/list Get templates from Pave DB by waba number
   * @apiName GetPaveNumberTemplates
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB selected template data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency-whatsapp-template/:agency_id/:waba_number/list',
    schema: {
      params: {
        agency_fk: { type: 'string' },
        waba_number: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, waba_number } = req.params;

      try {
        const db_templates = await models.waba_template.findAll({
          where: {
            agency_fk: agency_id,
            waba_number: waba_number,
          },
          order: [[Sequelize.literal('template_order'), 'ASC']],
        });

        h.api.createResponse(
          req,
          res,
          200,
          { templates: db_templates },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/whatsapp-template/create Staff create WA template
   * @apiName StaffWhatsAppTemplateCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-template/create',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const {
          waba_number,
          template_category,
          template_name,
          template_language,
          template_header,
          template_image: template_media, // image or video data
          template_body,
          template_button,
          quick_replies,
          cta_btn,
          body_variables,
          body_variables_type,
          is_draft,
        } = request.body;
        let error_message = 'Error creating template. Please check form';

        if (h.isEmpty(waba_number)) {
          return h.api.createResponse(
            request,
            reply,
            400,
            {},
            '2-template-creation-business-account-1620396470',
            {
              portal,
            },
          );
        }

        if (h.isEmpty(template_name)) {
          return h.api.createResponse(
            request,
            reply,
            400,
            {},
            '2-template-creation-template-name-1620396470',
            {
              portal,
            },
          );
        }

        let waba_id = null;
        const waba = await c.agencyWhatsAppConfig.findOne({
          agency_whatsapp_config_id: waba_number,
        });

        const agency_id = waba?.agency_fk;

        waba_id = waba?.agency_waba_id;
        const credentials = h.notEmpty(waba?.agency_waba_id)
          ? waba?.agency_waba_template_token +
            ':' +
            waba?.agency_waba_template_secret
          : null;
        const agencyBufferedTemplateCredentials = Buffer.from(
          credentials,
          'utf8',
        ).toString('base64');

        let category = null;
        let language = null;

        if (h.notEmpty(template_category)) {
          category = Object.keys(template_category)[0];
        }
        if (h.notEmpty(template_language)) {
          language = Object.keys(template_language)[0];
        }

        const template = {
          category: category,
          name: template_name,
          access_token: waba_id,
          language: language,
          components: [],
        };

        if (['image', 'video'].includes(template_header)) {
          const mediaData = {
            access_token: waba_id,
            media_url: template_media,
            mime_type: await h.general.getMimeType(template_media),
          };
          console.log(mediaData);
          const imageUploadConfig = {
            method: 'post',
            url: 'https://template.unificationengine.com/upload',
            headers: {
              Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
              'Content-Type': 'application/json',
            },
            data: mediaData,
          };

          const mediaUploadResponse = await axios(imageUploadConfig)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              Sentry.captureException(error);
              return error;
            });

          console.log(
            '💥💥💥💥💥💥💥💥💥💥💥💥💥 UPLOAD RESPONSE 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥',
          );

          console.log(mediaUploadResponse);

          console.log(
            '💥💥💥💥💥💥💥💥💥💥💥💥💥 UPLOAD RESPONSE 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥',
          );

          if (!h.cmpInt(mediaUploadResponse.status, 200)) {
            const error_message_title =
              mediaUploadResponse?.response?.data?.info?.error_user_title;
            const error_message_content =
              mediaUploadResponse?.response?.data?.info?.error_user_msg;
            if (
              h.notEmpty(error_message_title) &&
              h.notEmpty(error_message_content)
            ) {
              error_message = `${error_message_title}, ${error_message_content}`;
            } else {
              error_message =
                'Error creating template. Failed to upload media header';
            }
            throw new Error(error_message);
          }

          const file_handle = mediaUploadResponse.file_handle;
          const media_example = { header_handle: [file_handle] };
          const mediaFormat = template_header.toUpperCase();
          template.components.push({
            type: 'HEADER',
            format: mediaFormat,
            example: media_example,
          });
        }

        if (template_body) {
          const updated_template_body = template_body.replaceAll('&nbsp;', ' ');
          const body = { type: 'BODY', text: updated_template_body };
          if (!h.isEmpty(body_variables)) {
            const template_body_variables = [];
            for (const key in body_variables) {
              template_body_variables.push(body_variables[key]);
            }
            body.example = { body_text: [template_body_variables] };
          }
          template.components.push(body);
        }

        if (h.cmpStr(template_button, 'QUICK_REPLY')) {
          const buttons = [];
          const { agency_config_id, whatsapp_config } =
            await models.agency_config.findOne({
              where: { agency_fk: waba?.agency_fk },
            });
          const wa_config = JSON.parse(whatsapp_config);
          for (const reply of quick_replies) {
            buttons.push({ type: 'QUICK_REPLY', text: reply });
          }
          template.components.push({ type: 'BUTTONS', buttons: buttons });
        }

        if (h.cmpStr(template_button, 'CTA')) {
          const cta_action = cta_btn[0].action.value;
          if (h.cmpStr(cta_action, 'visit_website')) {
            const url_type = cta_btn[0].type.value;
            const url_text = cta_btn[0].value;
            const url = cta_btn[0].web_url;
            const buttons = [];
            if (h.cmpStr(url_type, 'dynamic')) {
              buttons.push({
                type: 'URL',
                text: url_text,
                url: url + '/{{1}}',
                example: [url + '/Sample-Proposal-for-Test-Contact'],
              });
            } else if (h.cmpStr(url_type, 'contact_email')) {
              if (
                [
                  '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
                  '36f64032-bdf9-4cdc-b980-cdcdec944fb8',
                ].includes(agency_id)
              ) {
                buttons.push({
                  type: 'URL',
                  text: url_text,
                  url: url + '/{{1}}',
                  example: [url + '/?referred_by=sample_email@domain.com'],
                });
              } else {
                buttons.push({
                  type: 'URL',
                  text: url_text,
                  url: url + '/{{1}}',
                  example: [url + '/sample_email@domain.com'],
                });
              }
            } else {
              buttons.push({
                type: 'URL',
                text: url_text,
                url: url,
              });
            }
            template.components.push({ type: 'BUTTONS', buttons: buttons });
          }
        }

        let submitTempateResponse = null;
        let selected_template = null;

        console.log('the template', JSON.stringify(template));

        const templateToSubmit = h.whatsapp.unescapeData(template);

        if (h.cmpBool(is_draft, false)) {
          const submitTemplateConfig = {
            method: 'post',
            url: 'https://template.unificationengine.com/create',
            headers: {
              Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
              'Content-Type': 'application/json',
            },
            data: templateToSubmit,
          };

          submitTempateResponse = await axios(submitTemplateConfig)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              Sentry.captureException(error);
              return error;
            });

          if (!h.cmpInt(submitTempateResponse.status, 200)) {
            const error_message_title =
              submitTempateResponse?.response?.data?.info?.error_user_title;
            const error_message_content =
              submitTempateResponse?.response?.data?.info?.error_user_msg;

            if (
              h.notEmpty(error_message_title) &&
              h.notEmpty(error_message_content)
            ) {
              error_message = `${error_message_title}, ${error_message_content}`;
            } else {
              error_message = 'Error creating template. Please check form';
            }

            throw new Error(error_message);
          }

          const message_templates = await h.whatsapp.retrieveTemplates({
            waba_id,
            credentials: agencyBufferedTemplateCredentials,
            log: null,
          });

          const whatsapp_templates = message_templates;

          selected_template = whatsapp_templates.templates.find(
            (template) => template.id === submitTempateResponse.id,
          );

          selected_template = h.whatsapp.sanitizeData(selected_template);

          if (!selected_template.name.includes('sample')) {
            const db_template = await models.waba_template.findOne({
              where: {
                agency_fk: waba?.agency_fk,
                template_id: submitTempateResponse.id,
                waba_number: waba?.waba_number,
              },
            });

            if (
              (h.cmpStr(waba?.waba_name, 'One Global MY') &&
                selected_template.name.includes('ogps_my')) ||
              (!h.cmpStr(waba?.waba_name, 'One Global MY') &&
                !selected_template.name.includes('ogps_my'))
            ) {
              if (db_template) {
                await models.waba_template.update(
                  {
                    agency_fk: waba?.agency_fk,
                    template_id: selected_template.id,
                    template_name: selected_template.name,
                    waba_number: waba?.waba_number,
                    content: JSON.stringify(selected_template),
                    header_image: template_media,
                    category: selected_template.category,
                    language: selected_template.language,
                    status: selected_template.status,
                    is_draft: false,
                    variable_identifier: body_variables_type,
                    template_order: selected_template.name.includes('quick')
                      ? 2
                      : 1,
                  },
                  {
                    where: {
                      waba_template_id: db_template?.waba_template_id,
                    },
                  },
                );
              } else {
                if (submitTempateResponse.id === selected_template.id) {
                  const waba_template_id = h.general.generateId();
                  await models.waba_template.create({
                    waba_template_id: waba_template_id,
                    agency_fk: waba?.agency_fk,
                    template_id: selected_template.id,
                    template_name: selected_template.name,
                    waba_number: waba?.waba_number,
                    content: JSON.stringify(selected_template),
                    header_image: template_media,
                    category: selected_template.category,
                    language: selected_template.language,
                    status: selected_template.status,
                    variable_identifier: body_variables_type,
                    is_draft: false,
                    visible: true,
                    template_order: selected_template.name.includes('quick')
                      ? 2
                      : 1,
                  });
                }
              }
            }
          }
        } else {
          const draft_template = template;
          draft_template.id = null;
          draft_template.status = 'DRAFT';
          const waba_template_id = h.general.generateId();
          console.log({
            waba_template_id: waba_template_id,
            agency_fk: waba?.agency_fk,
            template_id: null,
            template_name: draft_template.name,
            waba_number: waba?.waba_number,
            content: JSON.stringify(draft_template),
            header_image: template_media,
            category: draft_template.category,
            language: draft_template.language,
            status: draft_template.status,
            variable_identifier: body_variables_type,
            is_draft: true,
            visible: true,
            template_order: draft_template.name.includes('quick') ? 2 : 1,
          });
          await models.waba_template.create({
            waba_template_id: waba_template_id,
            agency_fk: waba?.agency_fk,
            template_id: null,
            template_name: draft_template.name,
            waba_number: waba?.waba_number,
            content: JSON.stringify(draft_template),
            header_image: template_media,
            category: draft_template.category,
            language: draft_template.language,
            status: draft_template.status,
            variable_identifier: body_variables_type,
            is_draft: true,
            visible: true,
            template_order: draft_template.name.includes('quick') ? 2 : 1,
          });
          const agency_id = waba?.agency_fk;
          const agency = await c.agency.findOne({ agency_id });
          const { agency_name } = agency;

          const data = JSON.stringify({
            text: `<!here> Template draft for ${agency_name} with name ${draft_template.name} is saved and ready for approval. Thank you.`,
          });

          const review_config = {
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          };

          await axios(review_config)
            // eslint-disable-next-line promise/always-return
            .then(function (response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
              Sentry.captureException(error);
              console.log(error);
            });
        }
        h.api.createResponse(
          request,
          reply,
          200,
          { template, submitTempateResponse, selected_template },
          '1-template-creation-1620396460',
          portal,
        );
      } catch (err) {
        console.log(`${request.url}: failed to create template.`, { err });
        Sentry.captureException(err);
        h.api.createResponse(
          request,
          reply,
          500,
          { message: err.message },
          '2-template-creation-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/whatsapp-template/list-db-agency-templates List UIB DB templates per agency
   * @apiName ListAgencyUIBWABATemplatesFromDB
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-template/list-db-agency-templates',
    schema: {
      query: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          waba_number: { type: 'string' },
          template_name: { type: 'string' },
          status: { type: 'string' },
        },
        required: ['agency_id'],
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const {
        agency_id,
        waba_number,
        template_name,
        status = null,
      } = req.query;

      try {
        const where = {
          agency_fk: agency_id,
        };
        if (!h.isEmpty(waba_number)) {
          where.waba_number = waba_number;
        }
        if (status) {
          where.status = status;
        }
        if (!h.isEmpty(template_name)) {
          where.template_name = { [Op.like]: `%${template_name.trim()}%` };
        }
        const agency_waba_templates = await c.wabaTemplate.findAll(where, {
          include: {
            model: models.agency_whatsapp_config,
            where: {
              is_active: true,
            },
            required: true,
            attributes: [
              'waba_name',
              'waba_number',
              'agency_waba_id',
              'waba_status',
              'waba_quality',
            ],
          },
          group: ['template_id'],
          order: [
            ['template_name', 'ASC'],
            ['template_order', 'ASC'],
          ],
        });

        h.api.createResponse(
          req,
          res,
          200,
          { agency_waba_templates },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/whatsapp-template/db-template/:waba_template_id Get UIB template from DB using waba_template_id
   * @apiName GetUIBWABATemplateByID
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} selected_template UIB selected template data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-template/db-template/:waba_template_id',
    schema: {
      params: {
        waba_template_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { waba_template_id } = req.params;

      try {
        const waba_template = await c.wabaTemplate.findOne({
          waba_template_id: waba_template_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { waba_template },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /staff/whatsapp-template/:waba_template_id Delete template
   * @apiName DeleteWABATemplate
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/whatsapp-template/:waba_template_id',
    schema: {
      params: {
        waba_template_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { waba_template_id } = req.params;

      try {
        const db_template = await c.wabaTemplate.findOne({
          waba_template_id: waba_template_id,
        });

        if (db_template) {
          const waba = await c.agencyWhatsAppConfig.findOne({
            waba_number: db_template?.waba_number,
          });

          const waba_id = waba?.agency_waba_id;
          const credentials = h.notEmpty(waba?.agency_waba_id)
            ? waba?.agency_waba_template_token +
              ':' +
              waba?.agency_waba_template_secret
            : null;
          const agencyBufferedTemplateCredentials = Buffer.from(
            credentials,
            'utf8',
          ).toString('base64');

          const templateData = {
            access_token: waba_id,
            name: db_template?.template_name,
          };

          const deleteTemplateConfig = {
            method: 'delete',
            url: 'https://template.unificationengine.com/delete',
            headers: {
              Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
              'Content-Type': 'application/json',
            },
            data: templateData,
          };

          let deleteTemplateResponse = null;
          if (!h.isEmpty(db_template.template_id)) {
            deleteTemplateResponse = await axios(deleteTemplateConfig)
              .then(function (response) {
                return response.data;
              })
              .catch(function (error) {
                Sentry.captureException(error);
                return error;
              });

            if (!h.cmpInt(deleteTemplateResponse.status, 200))
              throw new Error(`Error deleting template.`);
          }

          await c.wabaTemplate.destroy({
            waba_template_id: waba_template_id,
          });

          h.api.createResponse(
            req,
            res,
            200,
            { deleteTemplateResponse },
            '1-delete-whatsapp-message-template-1663834299369',
            {
              portal,
            },
          );
        } else {
          throw new Error(`Template not found.`);
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/whatsapp-template/update Staff update WA template
   * @apiName StaffWhatsAppTemplateUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-template/update',
    schema: {
      body: {
        type: 'object',
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const {
          waba_template_id,
          template_id,
          waba_number,
          template_category,
          template_name,
          template_language,
          template_header,
          template_image: template_media, // image or video data
          template_body,
          template_button,
          quick_replies,
          cta_btn,
          body_variables,
          body_variables_type,
          is_draft,
        } = request.body;

        const waba = await c.agencyWhatsAppConfig.findOne({
          agency_whatsapp_config_id: waba_number,
        });

        const body_variables_type_str = h.general.isArray(body_variables_type)
          ? body_variables_type.join(',')
          : body_variables_type;

        const agency_id = waba?.agency_fk;

        const waba_id = waba?.agency_waba_id;
        const credentials = h.notEmpty(waba?.agency_waba_id)
          ? waba?.agency_waba_template_token +
            ':' +
            waba?.agency_waba_template_secret
          : null;
        const agencyBufferedTemplateCredentials = Buffer.from(
          credentials,
          'utf8',
        ).toString('base64');

        let category = null;
        let language = null;
        if (h.notEmpty(template_category)) {
          category = Object.keys(template_category)[0];
        }
        if (h.notEmpty(template_language)) {
          language = Object.keys(template_language)[0];
        }

        const template = {
          template_id: template_id,
          category: category,
          name: template_name,
          access_token: waba_id,
          language: language,
          components: [],
        };

        const whatsapp_content_string = 'scontent.whatsapp.net';
        if (
          ['image', 'video'].includes(template_header) &&
          !template_media.includes(whatsapp_content_string)
        ) {
          const mediaData = {
            access_token: waba_id,
            media_url: template_media,
            mime_type: await h.general.getMimeType(template_media),
          };
          const imageUploadConfig = {
            method: 'post',
            url: 'https://template.unificationengine.com/upload',
            headers: {
              Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
              'Content-Type': 'application/json',
            },
            data: mediaData,
          };

          const mediaUploadResponse = await axios(imageUploadConfig)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              Sentry.captureException(error);
              return error;
            });

          if (!h.cmpInt(mediaUploadResponse.status, 200)) {
            const error_message_title =
              mediaUploadResponse?.response?.data?.info?.error_user_title;
            const error_message_content =
              mediaUploadResponse?.response?.data?.info?.error_user_msg;
            let error_message;
            if (
              h.notEmpty(error_message_title) &&
              h.notEmpty(error_message_content)
            ) {
              error_message = `${error_message_title}, ${error_message_content}`;
            } else {
              error_message =
                'Error updating template. Failed to upload media header';
            }

            throw new Error(error_message);
          }

          const file_handle = mediaUploadResponse.file_handle;
          const media_example = { header_handle: [file_handle] };
          const mediaFormat = template_header.toUpperCase();
          template.components.push({
            type: 'HEADER',
            format: mediaFormat,
            example: media_example,
          });
        }

        if (template_body) {
          const updated_template_body = template_body.replaceAll('&nbsp;', ' ');
          const body = { type: 'BODY', text: updated_template_body };
          if (!h.isEmpty(body_variables)) {
            const template_body_variables = [];
            for (const key in body_variables) {
              template_body_variables.push(body_variables[key]);
            }
            body.example = { body_text: [template_body_variables] };
          }
          template.components.push(body);
        }

        if (h.cmpStr(template_button, 'QUICK_REPLY')) {
          const buttons = [];
          for (const reply of quick_replies) {
            buttons.push({ type: 'QUICK_REPLY', text: reply });
          }
          template.components.push({ type: 'BUTTONS', buttons: buttons });
        }

        if (h.cmpStr(template_button, 'CTA')) {
          const cta_action = cta_btn[0].action.value;
          if (h.cmpStr(cta_action, 'visit_website')) {
            const url_type = cta_btn[0].type.value;
            const url_text = cta_btn[0].value;
            const url = cta_btn[0].web_url;
            const buttons = [];
            if (h.cmpStr(url_type, 'dynamic')) {
              buttons.push({
                type: 'URL',
                text: url_text,
                url: url + '/{{1}}',
                example: [url + '/Sample-Proposal-for-Test-Contact'],
              });
            } else if (h.cmpStr(url_type, 'contact_email')) {
              if (
                [
                  '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
                  '36f64032-bdf9-4cdc-b980-cdcdec944fb8',
                ].includes(agency_id)
              ) {
                buttons.push({
                  type: 'URL',
                  text: url_text,
                  url: url + '/{{1}}',
                  example: [url + '/?referred_by=sample_email@domain.com'],
                });
              } else {
                buttons.push({
                  type: 'URL',
                  text: url_text,
                  url: url + '/{{1}}',
                  example: [url + '/sample_email@domain.com'],
                });
              }
            } else {
              buttons.push({
                type: 'URL',
                text: url_text,
                url: url,
              });
            }
            template.components.push({ type: 'BUTTONS', buttons: buttons });
          }
        }

        const db_template = await models.waba_template.findOne({
          where: {
            waba_template_id: waba_template_id,
          },
        });

        const template_url = h.cmpBool(db_template?.is_draft, true)
          ? 'https://template.unificationengine.com/create'
          : 'https://template.unificationengine.com/update';

        const templateToSubmit = h.whatsapp.unescapeData(template);

        const submitTemplateConfig = {
          method: 'post',
          url: template_url,
          headers: {
            Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
            'Content-Type': 'application/json',
          },
          data: templateToSubmit,
        };

        let submitTemplateResponse = null;
        let selected_template = null;

        if (!is_draft) {
          submitTemplateResponse = await axios(submitTemplateConfig)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              Sentry.captureException(error);
              return error;
            });

          if (!h.cmpInt(submitTemplateResponse.status, 200)) {
            const error_message_title =
              submitTemplateResponse?.response?.data?.info?.error_user_title;
            const error_message_content =
              submitTemplateResponse?.response?.data?.info?.error_user_msg;
            let error_message;
            if (
              h.notEmpty(error_message_title) &&
              h.notEmpty(error_message_content)
            ) {
              error_message = `${error_message_title}, ${error_message_content}`;
            } else {
              error_message = 'Error updasting template. Please check form';
            }

            throw new Error(error_message);
          }

          const message_templates = await h.whatsapp.retrieveTemplates({
            waba_id,
            credentials: agencyBufferedTemplateCredentials,
            log: null,
          });

          const whatsapp_templates = message_templates;

          selected_template = whatsapp_templates.templates.find(
            (template) => template.id === submitTemplateResponse.id,
          );

          selected_template = h.whatsapp.sanitizeData(selected_template);

          if (!selected_template.name.includes('sample')) {
            const db_template = await models.waba_template.findOne({
              where: {
                waba_template_id: waba_template_id,
              },
            });

            if (
              (h.cmpStr(waba?.waba_name, 'One Global MY') &&
                selected_template.name.includes('ogps_my')) ||
              (!h.cmpStr(waba?.waba_name, 'One Global MY') &&
                !selected_template.name.includes('ogps_my'))
            ) {
              if (db_template) {
                await models.waba_template.update(
                  {
                    agency_fk: waba?.agency_fk,
                    template_id: selected_template.id,
                    template_name: selected_template.name,
                    waba_number: waba?.waba_number,
                    content: JSON.stringify(selected_template),
                    header_image:
                      h.cmpStr(template_header, 'image') &&
                      !template_media.includes(whatsapp_content_string)
                        ? template_media
                        : null,
                    category: selected_template.category,
                    language: selected_template.language,
                    status: selected_template.status,
                    variable_identifier: body_variables_type_str,
                    template_order: selected_template.name.includes('quick')
                      ? 2
                      : 1,
                    is_edited: !h.cmpBool(db_template?.is_draft, true),
                    last_edit_date: h.cmpBool(db_template?.is_draft, true)
                      ? null
                      : new Date(),
                    is_draft: false,
                  },
                  {
                    where: {
                      waba_template_id: db_template?.waba_template_id,
                    },
                  },
                );
              }
            }
          }
        } else {
          template.id = null;
          template.status = 'DRAFT';
          console.log(template);
          await models.waba_template.update(
            {
              agency_fk: waba?.agency_fk,
              template_id: null,
              template_name: template.name,
              waba_number: waba?.waba_number,
              content: JSON.stringify(template),
              header_image:
                h.cmpStr(template_header, 'image') &&
                !template_media.includes(whatsapp_content_string)
                  ? template_media
                  : null,
              category: template.category,
              language: template.language,
              status: template.status,
              variable_identifier: body_variables_type_str,
              template_order: template.name.includes('quick') ? 2 : 1,
              is_edited: true,
              last_edit_date: new Date(),
              is_draft: true,
            },
            {
              where: {
                waba_template_id: waba_template_id,
              },
            },
          );
        }
        h.api.createResponse(
          request,
          reply,
          200,
          { template, submitTemplateResponse, selected_template },
          '1-template-update-1620396460',
          portal,
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to update template.`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          { message: err.message },
          '2-template-update-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/whatsapp/template List WhatsApp Templates
   * @apiName ListAgencyUIBWABATemplates
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp/template',
    schema: {
      query: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          waba_number: { type: 'string' },
          template_name: { type: 'string' },
          category: { type: 'string' },
          language: { type: 'string' },
          status: { type: 'string' },
        },
        required: ['agency_id'],
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const {
        agency_id,
        waba_number,
        template_name,
        category,
        language,
        status,
      } = req.query;

      try {
        const where = {
          agency_fk: agency_id,
        };
        if (h.notEmpty(waba_number)) {
          where.waba_number = waba_number;
        }
        if (h.notEmpty(status)) {
          where.status = status;
        }
        if (h.notEmpty(template_name)) {
          where[Op.and] = [
            Sequelize.where(
              Sequelize.fn(
                'LOWER',
                Sequelize.fn(
                  'REPLACE',
                  Sequelize.col('template_name'),
                  '_',
                  ' ',
                ),
              ),
              {
                [Op.like]: `%${template_name.trim().toLowerCase()}%`,
              },
            ),
          ];
        }

        if (h.notEmpty(category)) {
          where.category = category;
        }

        if (h.notEmpty(language)) {
          where.language = language;
        }

        console.log(where);

        const agency_waba_templates = await c.wabaTemplate.findAll(where, {
          include: {
            model: models.agency_whatsapp_config,
            where: {
              is_active: true,
            },
            required: true,
            attributes: [
              'waba_name',
              'waba_number',
              'agency_waba_id',
              'waba_status',
              'waba_quality',
            ],
          },
          order: [['updated_date', 'DESC']],
          group: ['template_id', 'template_name', 'updated_date'],
        });

        const pending_templates_count = await c.wabaTemplate.count({
          agency_fk: agency_id,
          status: 'PENDING',
        });

        h.api.createResponse(
          req,
          res,
          200,
          { agency_waba_templates, pending_templates_count },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp/template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
