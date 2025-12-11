const models = require('../models');
const h = require('../helpers');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const Promise = require('bluebird');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

/**
 * Description
 * Cronjob function to sync meta whatsapp templates
 * @function
 * @name syncTemplates
 * @param {object} event cron job event data
 */
const syncTemplates = async (event = {}) => {
  const functionName = 'SYNC_WABA_TEMPLATES';
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    console.info('START SYNC_WABA_TEMPLATES', event);
    console.info(JSON.stringify(event));
    console.info('ENV: ', process.env.NODE_ENV);

    const whatsAppConfig = await models.agency_whatsapp_config.findAll();

    await Promise.mapSeries(whatsAppConfig, async (whatsappData) => {
      const whatsapp = whatsappData.dataValues;
      console.info('WHATSAPP_TEMPLATE_SYNC_EXECUTE_WABA');
      console.info('Running WhatsApp Template Sync for', whatsapp);
      let meta_templates = [];
      if (
        !h.isEmpty(whatsapp.agency_waba_template_token) &&
        !h.isEmpty(whatsapp.agency_waba_template_secret)
      ) {
        const { agency_id, waba_number, message_templates } =
          await retrieveAgencyTemplates(whatsapp);
        const wa_templates = message_templates.templates;
        if (h.isEmpty(wa_templates)) {
          console.warn('TEMPLATE LIST EMPTY. NOTHING TO DO.', wa_templates);
        } else {
          meta_templates = await processSyncTemplates(wa_templates, whatsapp);
        }
        // delete non meta templates
        await deleteNonMetaTemplates(agency_id, waba_number, meta_templates);
      }
      console.info('Will run next WAB after a minute');
      await delay(60000);
    });

    console.info('END SYNC_WABA_TEMPLATES', event);
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.error({
      function: functionName,
      err,
    });
    return { success: false, function: functionName, error: err };
  }
};

/**
 * Description
 * Function to get agency selected waba templates
 * @async
 * @function
 * @name retrieveAgencyTemplates
 * @kind function
 * @param {object} whatsapp agency current whatsapp object
 * @returns {Promise} agency ID, waba number, message templates
 */
async function retrieveAgencyTemplates(whatsapp) {
  console.info('ATTTEMPT TO GET WABA TEMPLATES');
  const waba_credentials =
    whatsapp.agency_waba_template_token +
    ':' +
    whatsapp.agency_waba_template_secret;
  const credentials = Buffer.from(waba_credentials, 'utf8').toString('base64');
  const agency_id = whatsapp.agency_fk;
  const waba_number = whatsapp.waba_number;

  const message_templates = await h.whatsapp.retrieveTemplates({
    waba_id: whatsapp.agency_waba_id,
    credentials,
    log: null,
  });

  console.info('TEMPLATES RETRIEVED', {
    agency_id,
    waba_number,
    message_templates,
  });

  return { agency_id, waba_number, message_templates };
}

/**
 * Description
 * Function to create or update waba templates
 * @async
 * @function
 * @name processSyncTemplates
 * @kind function
 * @param {object} wa_templates list of templates from current waba
 * @param {object} whatsapp waba details
 * @returns {Promise} meta_templates list of templates with valid template id
 * from meta
 */
async function processSyncTemplates(wa_templates, whatsapp) {
  console.info('ATTTEMPT TO SYNC WABA TEMPLATES');
  const meta_templates = [];
  for (const template of wa_templates) {
    const curr_template = h.whatsapp.sanitizeData(template);
    // check if there is an existing template record linked to waba number
    const db_template = await models.waba_template.findOne({
      where: {
        agency_fk: whatsapp.agency_fk,
        template_id: template.id,
        waba_number: whatsapp.waba_number,
      },
    });

    // define template data
    const template_data = {
      agency_fk: whatsapp.agency_fk,
      template_id: curr_template.id,
      template_name: curr_template.name,
      waba_number: whatsapp.waba_number,
      content: JSON.stringify(curr_template),
      category: curr_template.category,
      language: curr_template.language,
      status: curr_template.status,
      template_order: template.name.includes('quick') ? 2 : 1,
    };
    const template_tx = await models.sequelize.transaction();
    try {
      // if with existing template record, allow update
      if (db_template) {
        await models.waba_template.update(template_data, {
          where: {
            waba_template_id: db_template.waba_template_id,
          },
          transaction: template_tx,
        });
        await updateAutomationCustomTemplateStatus(
          template.id,
          template.status,
        );
      }
      meta_templates.push(template.id);
      await template_tx.commit();
    } catch (templateErr) {
      await template_tx.rollback();
      Sentry.captureException(templateErr);
      console.error({
        function: 'processSyncTemplates',
        record: template,
        templateErr,
      });
      throw new Error('processSyncTemplates');
    }
  }

  console.info('META TEMPLATES ID RETRIEVED', meta_templates);
  return meta_templates;
}

/**
 * Description
 * Function to delete templates where IDs are not in meta
 * @async
 * @function
 * @name deleteNonMetaTemplates
 * @kind function
 * @param {string} agency_id agency ID
 * @param {string} waba_number waba number
 * @param {array} meta_templates meta template IDs
 */
async function deleteNonMetaTemplates(agency_id, waba_number, meta_templates) {
  console.info('ATTTEMPT TO DELETE WABA TEMPLATES NOT IN META');
  /**
   * deleting waba template records in the database under the waba number of
   * the agency being processed
   */
  if (
    h.notEmpty(meta_templates) &&
    h.notEmpty(agency_id) &&
    h.notEmpty(waba_number)
  ) {
    const delete_template_tx = await models.sequelize.transaction();
    try {
      await models.waba_template.destroy({
        where: {
          agency_fk: agency_id, // limit to agency
          waba_number: waba_number, // limit to waba number of agency
          status: {
            [Op.ne]: 'DRAFT',
          },
          template_id: {
            [Op.notIn]: meta_templates,
          },
        },
        transaction: delete_template_tx,
      });
      await delete_template_tx.commit();
      console.info('NON META TEMPLATES DELETED IN DATABASE');
      return true;
    } catch (templateErr) {
      await delete_template_tx.rollback();
      Sentry.captureException(templateErr);
      console.error({
        function: 'deleteNonMetaTemplates',
        templateErr,
      });
      throw new Error('deleteNonMetaTemplates');
    }
  }
}

/**
 * Description
 * Function to update status of custom template which is created in automation workflow
 * @async
 * @function
 * @name updateAutomationCustomTemplateStatus
 * @kind function
 * @param {string} temaplate_id template ID
 * @param {string} status updated status
 */
async function updateAutomationCustomTemplateStatus(template_id, status) {
  try {
    // Step 1: Fetch the workflow path
    const results = await models.sequelize.query(
      `SELECT JSON_UNQUOTE(
         JSON_SEARCH(message_flow_data, 'one', '${template_id}', NULL, '$.nodes[*].data.flowData.template_id')
       ) AS path
       FROM automation_rule_template
       WHERE JSON_CONTAINS(
         JSON_EXTRACT(message_flow_data, '$.nodes[*].data.flowData.template_id'),
         '"${template_id}"'
       );`,
      {
        type: sequelize.QueryTypes.SELECT,
      },
    );

    // Step 2: If a path is found, extract the index and run the update
    if (h.notEmpty(results) && h.notEmpty(results[0].path)) {
      const path = results[0].path;
      const indexMatch = path.match(/nodes\[(\d+)\]/);

      if (indexMatch) {
        const index = indexMatch[1];
        // Step 3: Update the JSON field with the correct index
        await models.sequelize.query(
          `UPDATE automation_rule_template
           SET message_flow_data = JSON_SET(
             message_flow_data,
             '$.nodes[${index}].data.flowData.status', 
             '${status}'
           )
           WHERE JSON_CONTAINS(
             JSON_EXTRACT(message_flow_data, '$.nodes[*].data.flowData.template_id'),
             '"${template_id}"'
           );`,
          {
            type: sequelize.QueryTypes.UPDATE,
          },
        );
        console.info('CUSTOM TEMPLATE STATUS UPDATED SUCCESSFULLY');
      }
    }
    return;
  } catch (error) {
    Sentry.captureException(error);
    console.error({
      function: 'updateAutomationCustomTemplateStatus',
      error,
    });
    throw new Error('updateAutomationCustomTemplateStatus');
  }
}

exports.syncTemplates = Sentry.AWSLambda.wrapHandler(syncTemplates);
