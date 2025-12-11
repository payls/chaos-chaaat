const models = require('../models');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const h = require('../helpers');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const sendSms = async (event = {}) => {
  const functionName = 'ENQUIRY_SMS_FOLLOWUP';
  try {
    console.info(functionName + '_START', event);
    console.info(JSON.stringify(event));
    console.info('ENV: ', process.env.NODE_ENV);

    const saturdayLastWeek = moment()
      .tz('Australia/Melbourne')
      .startOf('week')
      .subtract(1, 'd')
      .add(8, 'h')
      .toDate();

    const saturdayToday = moment()
      .tz('Australia/Melbourne')
      .startOf('day')
      .add('8', 'h')
      .toDate();

    console.info('===============');
    console.info(
      `Checking contacts with enquiry_email_timestamp between ${saturdayLastWeek} and ${saturdayToday}`,
    );
    console.info('===============');

    // get contacts that has enquery email timestamp from the last saturday to friday
    const contacts = await models.contact.findAll({
      where: {
        enquiry_email_timestamp: {
          [Op.between]: [saturdayLastWeek, saturdayToday],
        },
      },
      include: [
        {
          model: models.agency_user,
          include: [
            {
              model: models.agency,
              include: [
                {
                  model: models.agency_config,
                },
              ],
            },
          ],
        },
      ],
    });

    console.info('===============');
    console.info('CONTACTS WITH ENQUIRY TIMESTAMP WITHIN RANGE');
    console.info('===============');
    console.info(JSON.stringify(contacts, null, 2));
    console.info('===============');

    for (const contact of contacts) {
      const agency_user = contact.agency_user;
      const agency = contact.agency_user.agency;
      const agency_config = contact.agency_user.agency.agency_config;

      const agencyCredentials =
        h.notEmpty(agency.agency_whatsapp_api_token) &&
        h.notEmpty(agency.agency_whatsapp_api_secret)
          ? agency.agency_whatsapp_api_token +
            ':' +
            agency.agency_whatsapp_api_secret
          : null;

      if (h.isEmpty(agencyCredentials)) continue;

      const agencyBufferedCredentials = h.notEmpty(agencyCredentials)
        ? Buffer.from(agencyCredentials, 'utf8').toString('base64')
        : null;

      if (h.isEmpty(agencyBufferedCredentials)) continue;

      console.info('===============');
      console.info('AGENCY CONFIG');
      console.info('===============');
      console.info(JSON.stringify(agency_config, null, 2));
      console.info('===============');

      if (h.isEmpty(agency_config) || h.isEmpty(agency_config.sms_config))
        continue;

      const sms_config = JSON.parse(agency_config.sms_config);

      console.info('===============');
      console.info('AGENCY SMS CONFIG');
      console.info('===============');
      console.info(JSON.stringify(sms_config, null, 2));
      console.info('===============');

      if (h.isEmpty(sms_config)) continue;

      const enquiry_sms_follow_up = sms_config.enquiry_sms_follow_up;

      if (h.isEmpty(sms_config.sms_number) || h.isEmpty(enquiry_sms_follow_up))
        continue;

      const sms_sender_number = sms_config.sms_number;

      for (const enquiry of enquiry_sms_follow_up) {
        const shortlisted_project = await models.shortlisted_project.findOne({
          where: {
            contact_fk: contact.contact_id,
            is_deleted: 0,
          },
          include: [
            {
              model: models.project,
              require: true,
              where: {
                project_id: enquiry.project_id,
                is_deleted: 0,
              },
            },
          ],
        });

        console.info('===============');
        console.info('SHORTLISTED PROJECT DETAILS');
        console.info('===============');
        console.info(JSON.stringify(shortlisted_project, null, 2));
        console.info('===============');

        if (h.isEmpty(shortlisted_project)) continue;

        if (
          h.cmpBool(enquiry.send_sms, true) &&
          h.notEmpty(contact.mobile_number) &&
          h.notEmpty(sms_sender_number)
        ) {
          const message = h.getMessageByCode(enquiry.sms_template);

          const contact_name = contact.first_name.concat(
            ' ',
            contact.last_name,
          );

          const contact_mobile_number = String(contact.mobile_number);
          const contactMobile = h.notEmpty(contact_mobile_number)
            ? contact_mobile_number.replace(/[^0-9]/g, '')
            : null;

          const contact_receiver_name = h.notEmpty(contact_name)
            ? contact_name
            : contactMobile;

          const sms_sender_name = !h.isEmpty(sms_config.sms_name)
            ? sms_config.sms_name
            : contactMobile;

          const smsMessageParts = await h.sms.getFollowUpSmsBody(
            contactMobile,
            contact_receiver_name,
            sms_sender_number,
            sms_sender_name,
            message,
          );

          const accountSID = h.notEmpty(sms_config.account_sid)
            ? sms_config.account_sid
            : null;

          const tracker_ref_name = `${Date.now()}_followup_${
            agency.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
          }`;

          const smsFollowUpResponse = await h.sms.sendFollowUpSms(
            contactMobile,
            contact.is_agency_sms_connection,
            smsMessageParts,
            agencyBufferedCredentials,
          );

          console.info('===============');
          console.info('MESSAGE SENDING STATUS');
          console.info('===============');
          console.info(JSON.stringify(smsFollowUpResponse, null, 2));
          console.info('===============');

          if (h.cmpBool(smsFollowUpResponse.success, true)) {
            const sms_message_sid = smsFollowUpResponse.sms_sid;
            await models.sms_message_tracker.create({
              tracker_ref_name,
              agency_fk: agency.agency_id,
              contact_fk: contact.contact_id,
              agency_user_fk: agency_user.agency_user_id,
              msg_type: 'frompave',
              sms_msg_sid: sms_message_sid,
              msg_body: message,
              sender_number: sms_config.sms_number,
              receiver_number: contactMobile,
              account_sid: accountSID,
              delivered: 1,
              failed: 0,
              msg_trigger: 'followup',
            });
            if (h.cmpBool(contact.is_agency_sms_connection, false)) {
              await models.contact.update(
                {
                  is_agency_sms_connection: true,
                },
                {
                  where: {
                    contact_id: contact.contact_id,
                  },
                },
              );
            }
          } else {
            const smsMessagePartsNoName = await h.sms.getFollowUpSmsBody(
              contactMobile,
              contact_receiver_name,
              sms_sender_number,
              sms_sender_number,
              message,
            );

            const smsFollowUpNoNameResponse = await h.sms.sendFollowUpSms(
              contactMobile,
              contact.is_agency_sms_connection,
              smsMessagePartsNoName,
              agencyBufferedCredentials,
            );

            console.info('===============');
            console.info('MESSAGE SENDING STATUS FOR UNNAMED SENDER');
            console.info('===============');
            console.info(JSON.stringify(smsFollowUpNoNameResponse, null, 2));
            console.info('===============');

            if (h.cmpBool(smsFollowUpNoNameResponse.success, true)) {
              const sms_message_sid = smsFollowUpNoNameResponse.sms_sid;
              await models.sms_message_tracker.create({
                tracker_ref_name,
                agency_fk: agency.agency_id,
                contact_fk: contact.contact_id,
                agency_user_fk: agency_user.agency_user_id,
                msg_type: 'frompave',
                sms_msg_sid: sms_message_sid,
                msg_body: message,
                sender_number: sms_config.sms_number,
                receiver_number: contactMobile,
                account_sid: accountSID,
                delivered: 1,
                failed: 0,
                msg_trigger: 'followup',
              });
              if (h.cmpBool(contact.is_agency_sms_connection, false)) {
                await models.contact.update(
                  {
                    is_agency_sms_connection: true,
                  },
                  {
                    where: {
                      contact_id: contact.contact_id,
                    },
                  },
                );
              }
            } else {
              await models.sms_message_tracker.create({
                tracker_ref_name,
                agency_fk: agency.agency_id,
                contact_fk: contact.contact_id,
                agency_user_fk: agency_user.agency_user_id,
                msg_type: 'frompave',
                sms_msg_sid: null,
                msg_body: message,
                sender_number: sms_config.sms_number,
                receiver_number: contactMobile,
                account_sid: accountSID,
                delivered: 0,
                failed: 1,
                msg_trigger: 'followup',
              });
            }
          }
        }
      }
    }
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.error(err);
    return { success: false, function: functionName };
  }
};

exports.sendSms = Sentry.AWSLambda.wrapHandler(sendSms);
