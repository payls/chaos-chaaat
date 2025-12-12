const h = require('../helpers');
const constant = require('../constants/constant.json');
const moment = require('moment-timezone');

module.exports.makeController = (models) => {
  const { campaign_schedule: campaignScheduleModel } = models;

  const campaignSchedule = {};

  /**
   * Create campaign_schedule record
   * @param {{
   * agency_fk: string,
   * tracker_ref_name: string,
   * campaign_name: string,
   * recipient_count: integer,
   * slack_notification: string,
   * campaign_source: text,
   * send_date: date,
   * time_zone: string,
   * platform: string,
   * status: integer,
   * triggered: boolean,
   * created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignSchedule.create = async (record, { transaction } = {}) => {
    const funcName = 'campaignSchedule.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      tracker_ref_name,
      campaign_name,
      recipient_count,
      slack_notification,
      campaign_source,
      send_date,
      time_zone,
      platform,
      status,
      triggered,
      created_by,
    } = record;
    const campaign_schedule_id = h.general.generateId();
    await campaignScheduleModel.create(
      {
        campaign_schedule_id,
        agency_fk,
        tracker_ref_name,
        campaign_name,
        recipient_count,
        slack_notification,
        campaign_source,
        send_date,
        time_zone,
        platform,
        status,
        triggered,
        created_by,
      },
      { transaction },
    );

    return campaign_schedule_id;
  };
  /**
   * Update campaign_schedule record
   * @param {string} campaign_schedule_id
   * @param {{
   * campaign_schedule_id: string,
   * agency_fk: string,
   * tracker_ref_name: string,
   * campaign_name: string,
   * recipient_count: integer,
   * slack_notification: string,
   * campaign_source: text,
   * send_date: date,
   * time_zone: string,
   * platform: string,
   * status: integer,
   * triggered: boolean,
   * created_by: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignSchedule.update = async (
    campaign_schedule_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'campaignSchedule.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      tracker_ref_name,
      campaign_name,
      recipient_count,
      slack_notification,
      campaign_source,
      send_date,
      time_zone,
      platform,
      status,
      triggered,
    } = record;

    await campaignScheduleModel.update(
      {
        campaign_schedule_id,
        agency_fk,
        tracker_ref_name,
        campaign_name,
        recipient_count,
        slack_notification,
        campaign_source,
        send_date,
        time_zone,
        platform,
        status,
        triggered,
        updated_by,
      },
      {
        where: { campaign_schedule_id },
        transaction,
      },
    );

    return campaign_schedule_id;
  };

  /**
   * Find all campaign_schedule records
   * @param {{
   * campaign_schedule_id: string,
   * agency_fk: string,
   * tracker_ref_name: string,
   * campaign_name: string,
   * recipient_count: integer,
   * slack_notification: string,
   * campaign_source: text,
   * send_date: date,
   * time_zone: string,
   * status: integer,
   * triggered: boolean,
   * updated_by: string,
   * created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignSchedule.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'campaignSchedule.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignScheduleModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one campaign_schedule records
   * @param {{
   * campaign_schedule_id: string,
   * agency_fk: string,
   * tracker_ref_name: string,
   * campaign_name: string,
   * recipient_count: integer,
   * slack_notification: string,
   * campaign_source: text,
   * send_date: date,
   * time_zone: string,
   * status: integer,
   * triggered: boolean,
   * updated_by: string,
   * created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignSchedule.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'campaignSchedule.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await campaignScheduleModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete campaign_schedule record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignSchedule.destroy = async (where, { transaction } = {}) => {
    const funcName = 'campaignSchedule.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await campaignScheduleModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count campaign_schedule record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignSchedule.count = async (where, { include, transaction } = {}) => {
    const funcName = 'campaignSchedule.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignScheduleModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Description
   * Function to process immediate campaign data and send it to RabbitMQ
   * @async
   * @name processImmediateCampaign
   * @param {object} params data needed for processing the immediate campaign
   * @returns {Promise<object>} response after sending to rabbit
   */
  campaignSchedule.processImmediateCampaign = async (params) => {
    const campaignDraft = require('./campaignDraft').makeController(models);
    const campaignInventory = require('./campaignInventory').makeController(
      models,
    );
    const messageInventory =
      require('./messageInventory').makeController(models);

    // get the request parameter
    const { request } = params;
    const campaign_name = params?.campaign_name;
    try {
      const { tracker_ref_name } =
        campaignSchedule.generateTrackerAndScheduleDetails(
          campaign_name,
          null,
          false,
          false,
          null,
        );

      // prepare the data to be passed in RabbitMQ
      const data = {
        user_id: params?.user_id,
        agency_id: params?.agency_id,
        assigned_tracker_ref_name: tracker_ref_name,
        campaign_name: tracker_ref_name,
        campaign_name_label: campaign_name,
        contact_ids: params?.contacts,
        campaign_type: params?.campaign_type,
        templates: params?.templates,
        automations: params?.automations,
        whatsApp: params?.whatsApp,
        trigger_quick_reply: params?.trigger_quick_reply,
        is_template: params?.is_template,
        selected_waba_credentials_id: params?.selected_waba_credentials_id,
        cta_response: params?.cta_response,
        cta_settings: params?.cta_settings,
        campaign_notification_additional_recipients:
          params?.campaign_notification_additional_recipients,
      };

      if (!h.isEmpty(params?.campaign_draft_id)) {
        await campaignDraft.markDraftAsProcessed(
          params?.campaign_draft_id,
          params?.user_id,
        );
      }
      await campaignInventory.addCampaignCount(params?.agency_id);
      // record to virtual message count the used credits
      await messageInventory.addToVirtualCount(
        params?.agency_id,
        params?.contact_count,
      );

      // submit to rabbitMQ
      const result = await request.rabbitmq.pubBulkProposal({
        data,
        consumerType: constant.AMQ.CONSUMER_TYPES.PAVE_BULK_CREATE_PROPOSAL,
      });

      return result;
    } catch (err) {
      throw new Error(err);
    }
  };

  /**
   * Description
   * Function to process the staggered schedules for the campaign
   * @async
   * @name processStaggeredCampaign
   * @param {object} params data needed for processing the staggered campaign
   * @returns {Promise<boolean>}
   */
  campaignSchedule.processStaggeredCampaign = async (params) => {
    const messageInventory =
      require('./messageInventory').makeController(models);

    let index = 1;
    let current_count = 0;
    const { timing, subscription, contacts, campaign_name } = params;

    // loop through the campaign staggered schedules
    for (const sched of timing) {
      if (!h.isEmpty(params?.contacts)) {
        const campaignDate = moment(sched.datetime);
        if (!campaignDate.isAfter(moment(subscription?.subscription_end))) {
          current_count += sched.recipient_count;
        }
        const payload = {
          consumerType: 'PAVE_BULK_CREATE_PROPOSAL',
          data: {},
        };
        const contact_batch = contacts.splice(0, sched.recipient_count);

        const {
          tracker_ref_name,
          campaignScheduleDate,
          oneHourBefore,
          timeZone,
        } = campaignSchedule.generateTrackerAndScheduleDetails(
          campaign_name,
          sched.datetime,
          true,
          true,
          index,
        );

        const campaign_name_label = campaign_name + ' ' + index;

        // prepare the data for scheduling
        const data = {
          user_id: params?.user_id,
          agency_id: params?.agency_id,
          assigned_tracker_ref_name: tracker_ref_name,
          campaign_name: tracker_ref_name,
          campaign_name_label: campaign_name_label,
          contact_ids: contact_batch,
          campaign_type: params?.campaign_type,
          templates: params?.templates,
          automations: params?.automations,
          whatsApp: params?.whatsApp,
          trigger_quick_reply: params?.trigger_quick_reply,
          is_template: params?.is_template,
          selected_waba_credentials_id: params?.selected_waba_credentials_id,
          cta_response: params?.cta_response,
          cta_settings: params?.cta_settings,
          campaign_notification_additional_recipients:
            params?.campaign_notification_additional_recipients,
        };
        payload.data = data;

        const transaction = await models.sequelize.transaction();
        try {
          await campaignSchedule.create(
            {
              agency_fk: params?.agency_id,
              campaign_name: campaign_name_label,
              recipient_count: contact_batch.length,
              slack_notification: 'reminder',
              campaign_source: '1 hour',
              send_date: oneHourBefore,
              time_zone: timeZone,
              status: 1,
              triggered: 0,
            },
            { transaction },
          );

          await campaignSchedule.create(
            {
              agency_fk: params?.agency_id,

              tracker_ref_name: tracker_ref_name,
              campaign_name: campaign_name_label,
              recipient_count: contact_batch.length,
              slack_notification: 'campaign',
              campaign_source: JSON.stringify(payload),
              send_date: campaignScheduleDate,
              time_zone: timeZone,
              status: 1,
              triggered: 0,
            },
            { transaction },
          );
          await transaction.commit();
        } catch (campaign_schedule_trasanction_err) {
          await transaction.rollback();
          throw new Error(campaign_schedule_trasanction_err);
        }
      }
      index++;
    }
    // record to virtual message count the used credits
    await messageInventory.addToVirtualCount(params?.agency_id, current_count);

    return true;
  };

  /**
   * Description
   * Function to process the signle scheduled campaign
   * @async
   * @name processSingleScheduledCampaign
   * @param {object} params data needed for processing the single scheduled campaign
   * @returns {Promise<boolean>}
   */
  campaignSchedule.processSingleScheduledCampaign = async (params) => {
    const messageInventory =
      require('./messageInventory').makeController(models);

    const { timing, subscription, contacts, campaign_name } = params;
    let current_count = 0;
    for (const sched of timing) {
      const campaignDate = moment(sched.datetime);
      if (!campaignDate.isAfter(moment(subscription?.subscription_end))) {
        current_count += sched.recipient_count;
      }
      const payload = {
        consumerType: 'PAVE_BULK_CREATE_PROPOSAL',
        data: {},
      };
      const {
        tracker_ref_name,
        oneHourBefore,
        timeZone,
        campaignScheduleDate,
      } = campaignSchedule.generateTrackerAndScheduleDetails(
        campaign_name,
        sched.datetime,
        true,
        false,
        null,
      );
      const data = {
        user_id: params?.user_id,
        agency_id: params?.agency_id,
        assigned_tracker_ref_name: tracker_ref_name,
        campaign_name: tracker_ref_name,
        campaign_name_label: campaign_name,
        contact_ids: contacts,
        campaign_type: params?.campaign_type,
        templates: params?.templates,
        automations: params?.automations,
        whatsApp: params?.whatsApp,
        trigger_quick_reply: params?.trigger_quick_reply,
        is_template: params?.is_template,
        selected_waba_credentials_id: params?.selected_waba_credentials_id,
        cta_response: params?.cta_response,
        cta_settings: params?.cta_settings,
        campaign_notification_additional_recipients:
          params?.campaign_notification_additional_recipients,
      };
      payload.data = data;

      const transaction = await models.sequelize.transaction();
      try {
        await campaignSchedule.create(
          {
            agency_fk: params?.agency_id,
            campaign_name: campaign_name,
            recipient_count: contacts.length,
            slack_notification: 'reminder',
            campaign_source: '1 hour',
            send_date: oneHourBefore,
            time_zone: timeZone,
            status: 1,
            triggered: 0,
          },
          { transaction },
        );

        await campaignSchedule.create(
          {
            agency_fk: params?.agency_id,

            tracker_ref_name: tracker_ref_name,
            campaign_name: campaign_name,
            recipient_count: contacts.length,
            slack_notification: 'campaign',
            campaign_source: JSON.stringify(payload),
            send_date: campaignScheduleDate,
            time_zone: timeZone,
            status: 1,
            triggered: 0,
          },
          { transaction },
        );
        await transaction.commit();
      } catch (campaign_schedule_trasanction_err) {
        await transaction.rollback();
        throw new Error(campaign_schedule_trasanction_err);
      }
    }
    // record to virtual message count the used credits
    await messageInventory.addToVirtualCount(params?.agency_id, current_count);

    return true;
  };

  /**
   * Description
   * Function to generate tracker name and schedules depending on campaign type
   * @name generateTrackerAndScheduleDetails
   * @param {string} campaign_name
   * @param {datetime} scheduled_date
   * @param {boolean} scheduled
   * @param {boolean} staggered
   * @param {number} index
   * @returns {<object>}
   */
  campaignSchedule.generateTrackerAndScheduleDetails = (
    campaign_name,
    scheduled_date,
    scheduled,
    staggered,
    index,
  ) => {
    const frontend_schedule_date = scheduled_date || new Date();
    const timeZone = 'Asia/Manila';

    let campaignScheduleDate = null;
    let oneHourBefore = null;

    if (h.cmpBool(scheduled, true)) {
      const originalnSchedule = moment.tz(frontend_schedule_date, timeZone);
      campaignScheduleDate = moment
        .tz(frontend_schedule_date, timeZone)
        .format('YYYY-MM-DD HH:mm:ss');
      oneHourBefore = originalnSchedule
        .clone()
        .subtract(1, 'hour')
        .format('YYYY-MM-DD HH:mm:ss');
    }

    let tracker_ref_name = moment
      .tz(frontend_schedule_date, timeZone)
      .format('YYYYMMDDHHmm00');
    let lower_case_campaign_name = campaign_name.replace(/[^a-zA-Z0-9\s]/g, '');
    lower_case_campaign_name = lower_case_campaign_name
      .toLowerCase()
      .replace(/\s+/g, '_');

    tracker_ref_name = tracker_ref_name + '_' + lower_case_campaign_name;

    if (h.cmpBool(staggered, true)) {
      tracker_ref_name = tracker_ref_name + '_' + index;
    }

    return { tracker_ref_name, campaignScheduleDate, oneHourBefore, timeZone };
  };

  return campaignSchedule;
};
