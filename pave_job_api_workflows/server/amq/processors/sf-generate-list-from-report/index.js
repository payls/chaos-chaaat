const constant = require('../../../constants/constant.json');
const c = require('../../../controllers');
const sfGenReportUtil = require('./sf-generate-list-from-report-utils');

const processor_name = 'sf-generate-list-from-report';

async function generateList({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) {
  const { data: generateSfReportData } = JSON.parse(data.content.toString());

  log.info({
    processor_name,
    generateSfReportData,
  });

  const {
    agency_id,
    report_id,
    instance_id,
    contact_list_id,
    report_field_map,
    timestamp_created,
  } = generateSfReportData;

  const currentTime = Date.now();

  if (currentTime - timestamp_created < 20000) {
    // don't process queue till it is 20 seconds old
    // reason is creating SF reports takes time and we don't want to capture empty reports
    log.info({
      processor_name,
      message: `skipping message is still ${
        currentTime - timestamp_created
      } old`,
    });
    return channel.nack(data, false, true);
  }

  let contact_infos = [];
  let instanceId;

  let agency = await models.agency.findOne({
    where: {
      agency_id,
    },
  });

  agency = agency && agency.toJSON ? agency.toJSON() : agency;
  try {
    // get oauth data
    let agencyOauth = await models.agency_oauth.findOne({
      where: {
        agency_fk: agency_id.trim(),
        status: 'active',
        source: 'SALESFORCE',
      },
    });

    agencyOauth =
      agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

    let live_chat_settings = await models.live_chat_settings.findOne({
      where: {
        agency_fk: agency_id.trim(),
      },
    });

    live_chat_settings =
      live_chat_settings && live_chat_settings.toJSON
        ? live_chat_settings.toJSON()
        : live_chat_settings;

    // if no instance id create report instance

    if (!instance_id) {
      instanceId = await sfGenReportUtil.createReportInstanceV2({
        access_info: agencyOauth.access_info,
        report_id,
        live_chat_settings,
      });
    } else {
      instanceId = instance_id;
    }

    const reportData = await sfGenReportUtil.retrieveSFReportDataV2({
      access_info: agencyOauth.access_info,
      report_id,
      instance_id: instanceId,
      live_chat_settings,
    });

    contact_infos = reportData.map((ci) =>
      sfGenReportUtil.extractDataFromReportColumn(ci, report_field_map),
    );
  } catch (err) {
    log.error({
      err,
      processor: processor_name,
    });

    await sfGenReportUtil.updateContactListStatus(contact_list_id, 'FAILED');

    return await channel.nack(data, false, false);
  }

  log.info({
    processor_name,
    contact_to_process: contact_infos.length,
  });

  const oldContactList = await sfGenReportUtil.getContactListInfo(
    contact_list_id,
  );
  let user_count = contact_infos.length;
  if (oldContactList && oldContactList.user_count > 0) {
    user_count = user_count + oldContactList.user_count;
  }
  await sfGenReportUtil.updateContactList(contact_list_id, {
    user_count,
  });

  if (contact_infos.length < 1) {
    // run fallback
    const { sfAdhocQueue } = config.amq.keys;
    const consumerType =
      constant.AMQ.CONSUMER_TYPES.SF_GENERATE_LIST_FROM_REPORT_FALLBACK;
    const fallBackData = {
      ...generateSfReportData,
      instance_id: instanceId,
    };

    await channel.publish(
      sfAdhocQueue,
      'BATCH',
      Buffer.from(
        JSON.stringify({
          consumerType,
          data: fallBackData,
        }),
      ),
    );

    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  }

  const agency_user_fk = agency?.default_outsider_contact_owner;

  for (const contact_info of contact_infos) {
    try {
      await sfGenReportUtil.upsertContactFromSfAndAddToList({
        agency_id,
        contact_info,
        contact_list_id,
        agency_user_fk,
      });
    } catch (err) {
      // todo process errors here
      log.warn({
        err,
        processs: `processing contact`,
        processor: processor_name,
      });
    }
  }

  try {
    await sfGenReportUtil.updateContactListStatus(contact_list_id, 'PUBLISHED');
  } catch (err) {
    log.warn({
      err,
      process: 'updating contact list status',
      processor: processor_name,
    });
  }

  // check if contact capacity is now 80 90 or 100
  await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
  if (channel && channel.ack) {
    log.info('Channel for acknowledgment');
    return await channel.ack(data);
  } else {
    log.error('Channel not available for acknowledgment');
    throw new Error('AMQ channel not available');
  }
}

async function generateListFallback({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) {
  const { data: generateSfReportData } = JSON.parse(data.content.toString());

  log.info({
    processor_name,
    generateSfReportData,
  });

  const {
    agency_id,
    report_id,
    instance_id,
    contact_list_id,
    report_field_map,
  } = generateSfReportData;

  // get oauth data
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id.trim(),
      status: 'active',
      source: 'SALESFORCE',
    },
  });

  let agency = await models.agency.findOne({
    where: {
      agency_id,
    },
  });

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  let contact_infos;

  let live_chat_settings = await models.live_chat_settings.findOne({
    where: {
      agency_fk: agency_id.trim(),
    },
  });

  live_chat_settings =
    live_chat_settings && live_chat_settings.toJSON
      ? live_chat_settings.toJSON()
      : live_chat_settings;

  agency = agency && agency.toJSON ? agency.toJSON() : agency;
  try {
    const reportData = await sfGenReportUtil.retrieveSFReportDataV2({
      access_info: agencyOauth.access_info,
      report_id,
      instance_id,
      live_chat_settings,
    });

    contact_infos = reportData.map((ci) =>
      sfGenReportUtil.extractDataFromReportColumn(ci, report_field_map),
    );
  } catch (err) {
    log.error({
      err,
      processor: processor_name + '_fallback',
    });

    return await channel.nack(data, false, false);
  }

  const agency_user_fk = agency?.default_outsider_contact_owner;

  for (const contact_info of contact_infos) {
    try {
      await sfGenReportUtil.upsertContactFromSfAndAddToList({
        agency_id,
        contact_info,
        contact_list_id,
        agency_user_fk,
      });
    } catch (err) {
      // todo process errors here
      log.warn({
        err,
        processs: `processing contact`,
        processor: processor_name,
      });
    }
  }

  try {
    await sfGenReportUtil.updateContactListStatus(contact_list_id, 'PUBLISHED');
  } catch (err) {
    log.warn({
      err,
      process: 'updating contact list status',
      processor: processor_name,
    });
  }

  // check if contact capacity is now 80 90 or 100
  await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
  if (channel && channel.ack) {
    log.info('Channel for acknowledgment');
    return await channel.ack(data);
  } else {
    log.error('Channel not available for acknowledgment');
    throw new Error('AMQ channel not available');
  }
}

module.exports.generateList = generateList;
module.exports.generateListFallback = generateListFallback;
