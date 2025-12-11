const models = require('../models');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const emailHelper = require('../helpers/email');
const general = require('../helpers/general');
const userHelper = require('../helpers/user');
const h = require('../helpers');
const jsforce = require('jsforce');
const config = require('../configs/config')(process.env.NODE_ENV);
const _ = require('lodash');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const sendEmail2 = async (event = {}) => {
  const functionName = 'ENQUIRY_EMAIL_2';
  try {
    console.info(functionName + '_START', event);
    console.info(JSON.stringify(event));

    const saturday2WeeksAgo = moment()
      .tz('Australia/Melbourne')
      .startOf('week')
      .subtract(14, 'd')
      .add(8, 'h')
      .toDate();

    const saturday2WeeksAgoPlus1Day = moment()
      .tz('Australia/Melbourne')
      .startOf('week')
      .subtract(7, 'd')
      .add(8, 'h')
      .toDate();

    const agency_configs = await models.agency_config.findAll({
      where: {
        salesforce_config: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: models.agency,
          required: true,
        },
      ],
    });

    console.info(JSON.stringify(agency_configs));

    const agency_with_salesforce_configs = agency_configs.reduce((pv, cv) => {
      const agency_config = cv && cv.toJSON ? cv.toJSON() : cv;

      let salesforce_config = agency_config.salesforce_config;

      try {
        salesforce_config = JSON.parse(salesforce_config);
      } catch (err) {
        Sentry.captureException(err);
        // ignore
      }

      console.info(JSON.stringify(salesforce_config));

      if (!salesforce_config || typeof salesforce_config === 'string')
        return pv;

      if (salesforce_config.send_email_after_enquiry) {
        pv.push(cv);
      }

      return pv;
    }, []);

    for (const agency_config of agency_with_salesforce_configs) {
      console.info('======next========');
      console.info('\n\n\n\n');
      console.info('======next========');
      // get contacts that has enquery email timestamp from the last saturday to friday
      const { agency } = agency_config;
      let salesforce_config = agency_config.salesforce_config;

      console.info('======timestamps========');
      console.info(saturday2WeeksAgo);
      console.info(saturday2WeeksAgoPlus1Day);
      console.info('======timestamps========');

      try {
        salesforce_config = JSON.parse(salesforce_config);
      } catch (err) {
        Sentry.captureException(err);
        // ignore
      }
      const contacts = await models.contact.findAll({
        where: {
          // has_appointment: {
          //   [Op.ne]: true,
          // },
          enquiry_email_timestamp: {
            [Op.between]: [saturday2WeeksAgo, saturday2WeeksAgoPlus1Day],
          },
          agency_fk: agency.agency_id,
        },
        include: [
          {
            model: models.agency_user,
            required: true,
            include: [
              {
                model: models.user,
              },
            ],
          },
          {
            model: models.contact_source,
            required: true,
          },
        ],
      });

      console.info(JSON.stringify(contacts));

      for (let contact of contacts) {
        contact = contact.toJSON();
        const {
          email,
          contact_id,
          agency_user,
          mobile_number,
          has_appointment,
        } = contact;
        console.info('======contact========');
        console.info(JSON.stringify(contact));
        console.info('======contact========');

        console.info('======agency_user========');
        console.info(JSON.stringify(agency_user));
        console.info('======agency_user========');

        if (has_appointment) {
          console.info('======has_appointment========');
          console.info(has_appointment);
          console.info('======has_appointment========');
          continue;
        }

        const shortlisted_project = await models.shortlisted_project.findOne({
          where: {
            contact_fk: contact_id,
            is_deleted: 0,
          },
          include: [
            {
              model: models.project,
              require: true,
              where: {
                is_deleted: 0,
              },
              sf_project_id: {
                [Op.in]: salesforce_config.project_ids,
              },
            },
          ],
        });

        console.info('======Shortlisted Project========');
        console.info(JSON.stringify(shortlisted_project));
        console.info('======Shortlisted Project========');

        if (!shortlisted_project) {
          console.info('======shortlisted_project========');
          console.info(JSON.stringify(shortlisted_project));
          console.info('======shortlisted_project========');
          continue;
        }

        const project_email_templates =
          salesforce_config.project_email_templates || [];
        const salesforceProjectId =
          shortlisted_project.project &&
          shortlisted_project.project.sf_project_id;

        const template = project_email_templates.reduce((pv, cv) => {
          if (pv) return pv;

          if (cv.project_id === salesforceProjectId && cv.email_type === '2')
            return cv;

          return pv;
        }, null);

        console.info('======template========');
        console.info(JSON.stringify(template));
        console.info('======template========');

        if (!template) {
          console.info('======template========');
          console.info(JSON.stringify(template));
          console.info('======template========');
          continue;
        }

        console.info('======agency_user========');
        console.info(JSON.stringify(agency_user));
        console.info('======agency_user========');

        // check contact opportunity stage
        // if the opportunity stage is still
        // prospect, re-enquiry, nurture, contact attempted, second contact attempted, third contact attempted, contact made
        // send email 2 otherwise abort
        //
        const stagesForSending = [
          'prospect',
          'prospecting',
          're-enquiry',
          'nurture',
          'contact attempted',
          'second contact attempted',
          'third contact attempted',
          'contact made',
        ];
        const salesforceContactId =
          contact &&
          contact.contact_source &&
          contact.contact_source.source_contact_id;

        let agencyOauth = await models.agency_oauth.findOne({
          where: {
            agency_fk: agency.agency_id,
            source: 'SALESFORCE',
            status: 'active',
          },
          include: [{ model: models.agency }],
        });

        agencyOauth =
          agencyOauth && agencyOauth.toJSON
            ? agencyOauth.toJSON()
            : agencyOauth;

        if (!agencyOauth) {
          console.info('======agencyOauth========');
          console.info(JSON.stringify(agencyOauth));
          console.info('======agencyOauth========');
          continue;
        }

        const { access_info } = agencyOauth;
        const { refresh_token, instance_url, access_token } =
          JSON.parse(access_info);

        const oauthParams = {
          clientId: config.directIntegrations.salesforce.clientId,
          clientSecret: config.directIntegrations.salesforce.clientSecret,
          redirectUri: config.directIntegrations.salesforce.redirectUri,
        };

        if (instance_url.includes('sandbox')) {
          oauthParams.loginUrl = 'https://test.salesforce.com';
        }

        const oauth2 = new jsforce.OAuth2(oauthParams);

        const connParams = {
          oauth2,
          instanceUrl: instance_url,
          accessToken: access_token,
          refreshToken: refresh_token,
        };

        if (instance_url.includes('sandbox')) {
          connParams.loginUrl = 'https://test.salesforce.com';
        }

        const conn = new jsforce.Connection(connParams);

        await new Promise((resolve, reject) => {
          conn.oauth2.refreshToken(refresh_token, async (err, results) => {
            if (err) {
              return reject(err);
            }
            // .select('*')
            // .where('Email = johnxero@domain.com')
            resolve(results);
          });
        });

        const opsContactRoles = await new Promise((resolve) => {
          conn
            .sobject('OpportunityContactRole')
            .find({
              ContactId: salesforceContactId,
            })
            .execute((err, contact) => {
              if (err) resolve([]);

              resolve(contact);
            });
        });

        const opportunities = await new Promise((resolve) => {
          conn
            .sobject('Opportunity')
            .find({
              Id: { $in: opsContactRoles.map((op) => op.OpportunityId) },
            })
            .execute((err, contact) => {
              if (err) resolve([]);

              resolve(contact);
            });
        });

        const sfProjectIdField =
          salesforce_config && salesforce_config.project_id_field;

        const op =
          opportunities.length < 2
            ? opportunities[0]
            : _.find(opportunities, (op) => {
                return (
                  op['Project__c'] === salesforceProjectId ||
                  op['Project_ID__c'] === salesforceProjectId ||
                  op[sfProjectIdField] === salesforceProjectId
                );
              });

        if (!op) {
          console.info('======op========');
          console.info(JSON.stringify(op));
          console.info('======op========');
          continue;
        } else {
          console.info('======op========');
          console.info(JSON.stringify(op));
          console.info('======op========');
        }

        const sfOwnerId = op.Opportunity_Owned_by__c || op.OwnerId;

        const owners = salesforce_config.owners || {};

        const ownerInfo = owners[sfOwnerId];

        const canSendEmail2 = _.find(stagesForSending, (sfs) => {
          return op && op.StageName && op.StageName.toLowerCase() === sfs;
        });

        if (!canSendEmail2) {
          console.info('======canSendEmail2========');
          console.info(JSON.stringify(stagesForSending));
          console.info(JSON.stringify(op.StageName));
          console.info(JSON.stringify(canSendEmail2));
          console.info('======canSendEmail2========');
          continue;
        }

        if (!agency_user || !agency_user.user) {
          console.info('======agency_user========');
          console.info(JSON.stringify(agency_user));
          console.info('======agency_user========');
          continue;
        }

        const user = agency_user.user;
        const { facebook, instagram, linkedin, youtube, title } = agency_user;

        const buyerFirstName = userHelper.capitalizeFirstLetter(
          contact.first_name,
        );
        const buyerEmail = contact.email;
        const agentFullName = general.combineFirstLastName(
          userHelper.capitalizeFirstLetter(user.first_name),
          userHelper.capitalizeFirstLetter(user.last_name),
          ' ',
        );

        let mediaLink = '<ul style="list-style-type: none; padding: 0px;">';
        if (facebook) {
          mediaLink += `<li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${facebook}" style="color: #0d6efd;">Facebook</a></li>`;
        }

        if (instagram) {
          mediaLink += `<li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${instagram}" style="color: #0d6efd;">Instagram</a></li>`;
        }

        if (linkedin) {
          mediaLink += `<li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${linkedin}" style="color: #0d6efd;">Linkedin</a></li>`;
        }

        if (youtube) {
          mediaLink += `<li style="display: inline-block; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${youtube}" style="color: #0d6efd;">YouTube</a></li>`;
        }

        mediaLink += '</ul>';

        const subjectName = template.subject;
        const bodyName = template.body;

        const subject = h.getMessageByCode(subjectName);
        const body = h.getMessageByCode(bodyName, {
          FIRST_NAME: buyerFirstName,
          AGENT_FULLNAME: agentFullName,
          MEDIA_LINKS: mediaLink,
          AGENCY_WEBSITE: agency.agency_website || '',
          AGENT_TITLE: title && title.toUpperCase(),
          AGENT_FULLNAME_CAPS: agentFullName.toUpperCase(),
          AGENT_MOBILE: mobile_number,
          AGENCY_NUMBER: '+61 3 9644 2600',
          PROJECT_CONTACT_PERSON_CALENDLY:
            (ownerInfo &&
              ownerInfo.calendly &&
              ownerInfo.calendly[salesforceProjectId]) ||
            '',
          PROJECT_CONTACT_PERSON: h.user.capitalizeFirstLetter(
            (ownerInfo && ownerInfo.first_name) || user.first_name,
          ),
        });

        await emailHelper.sendHtmlEmail(
          `${agentFullName} <${email}>`,
          buyerEmail, // To buyer email
          subject,
          body,
        );

        console.info('===============');
        // console.info(JSON.stringify(shortlisted_projects));
        console.info('===============');
      }
    }

    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.info('===============');
    console.error(JSON.stringify(err));
    console.info('===============');
    return { success: false, function: functionName };
  }
};

exports.sendEmail2 = Sentry.AWSLambda.wrapHandler(sendEmail2);
