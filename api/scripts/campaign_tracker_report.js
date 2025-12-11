const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;
const fs = require('fs');
const path = require('path');

// always check
const agency_id = '03770cad-f837-40ca-aec0-30bb292f65f2';
const campaign_name = 'Strength Culture March 29 2023 First Timer Campaign';
const project = 'Strength Culture';
const tracker_ref_name = '1680084042409_bulkproposal_strength_culture';
const file_name_tracker = 'sc_campaign_contacts_march_29_report.csv';
const file_name_manual_reply =
  'sc_campaign_contacts_march_29_manual_replies_report.csv';

const data = [];

async function getTrackerReport() {
  try {
    const campaignCTARecord = await models.campaign_cta.findOne({
      where: {
        campaign_tracker_ref_name: tracker_ref_name,
      },
    });

    const messageTrackerEntry = await models.whatsapp_message_tracker.findOne({
      where: {
        tracker_type: 'main',
        campaign_name: campaign_name,
        agency_fk: agency_id,
      },
      order: [['created_date', 'ASC']],
    });

    const trackerRecord = await models.whatsapp_message_tracker.findAll({
      where: {
        tracker_type: 'main',
        campaign_name: campaign_name,
        agency_fk: agency_id,
      },
      include: [
        {
          model: models.contact,
          required: true,
          include: [
            {
              model: models.agency_user,
              include: [
                {
                  model: models.user,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      order: [['created_date', 'ASC']],
    });

    const manual_contact_ids = [];
    const tracker_report = [];

    for (const tracker of trackerRecord) {
      const cta1 = await models.whatsapp_chat.findOne({
        where: {
          contact_fk: tracker?.contact_fk,
          campaign_name: tracker?.campaign_name,
          msg_body: campaignCTARecord?.cta_1,
          msg_type: 'button',
          created_date: { [Op.gt]: tracker?.broadcast_date },
          original_event_id: { [Op.ne]: 'web_app_event' },
        },
      });

      const cta1_landing = await models.whatsapp_chat.findOne({
        where: {
          contact_fk: tracker?.contact_fk,
          campaign_name: tracker?.campaign_name,
          msg_body: campaignCTARecord?.cta_1,
          created_date: { [Op.gt]: tracker?.broadcast_date },
          original_event_id: 'web_app_event',
        },
      });

      const cta2 = await models.whatsapp_chat.findOne({
        where: {
          contact_fk: tracker?.contact_fk,
          campaign_name: tracker?.campaign_name,
          msg_body: campaignCTARecord?.cta_2,
          msg_type: 'button',
          created_date: { [Op.gt]: tracker?.broadcast_date },
        },
      });

      const cta3 = await models.whatsapp_chat.findOne({
        where: {
          contact_fk: tracker?.contact_fk,
          campaign_name: tracker?.campaign_name,
          msg_body: campaignCTARecord?.cta_3,
          msg_type: 'button',
          created_date: { [Op.gt]: tracker?.broadcast_date },
        },
      });

      const with_manual_replies = await models.whatsapp_chat.findOne({
        where: {
          contact_fk: tracker?.contact_fk,
          campaign_name: tracker?.campaign_name,
          msg_type: 'text',
          created_date: { [Op.gt]: tracker?.broadcast_date },
        },
      });

      tracker_report.push([
        tracker?.contact_fk,
        tracker?.contact?.first_name + ' ' + tracker?.contact?.last_name,
        tracker?.contact?.lead_score,
        tracker?.contact?.mobile_number,
        tracker?.contact?.agency_user?.user.first_name +
          ' ' +
          tracker?.contact?.agency_user?.user.last_name,
        project,
        cta1 ? 'Yes' : 'No',
        cta1_landing ? 'Yes' : 'No',
        cta2 ? 'Yes' : 'No',
        cta3 ? 'Yes' : 'No',
        with_manual_replies ? 'Yes' : 'No',
      ]);

      if (with_manual_replies) {
        manual_contact_ids.push(with_manual_replies?.contact_fk);
      }
    }

    const report_headers = [
      'Contact ID',
      'Contact Name',
      'Engagement Score',
      'Mobile Number',
      'Lead Owner',
      'Project Marketed',
      'CTA 1',
      'Landing CTA 1',
      'CTA 2',
      'CTA 3',
      'With Manual Reply',
    ];

    fs.writeFile(file_name_tracker, report_headers.join(',') + '\n', (err) => {
      if (err) throw err;
      for (const report of tracker_report) {
        fs.appendFile(file_name_tracker, report.join(',') + '\n', (err) => {
          if (err) throw err;
        });
      }
    });
  } catch (err) {
    console.error(err);
  }
}

getTrackerReport();
