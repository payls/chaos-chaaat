const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { sms_message_tracker: smsMessageTrackerModel } = models;

  const smsMessageTrackerCtl = {};

  smsMessageTrackerCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'smsMessageTrackerCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await smsMessageTrackerModel.findAll({
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

  smsMessageTrackerCtl.getAggregatedRecords = async (
    where,
    startDate,
    endDate,
    { transaction, offset, limit },
  ) => {
    const funcName = 'smsMessageTrackerCtl.getAggregatedRecords';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    let searchFromDate = '';
    let searchToDate = '';

    if (startDate !== null && endDate !== null) {
      const fromDate = new Date(startDate);
      const fromYear = fromDate.getFullYear();
      const fromMonth = (fromDate.getMonth() + 1).toString().padStart(2, '0');
      const fromDay = fromDate.getDate().toString().padStart(2, '0');

      searchFromDate = new Date(fromYear + '-' + fromMonth + '-' + fromDay);
      searchFromDate.setUTCHours(0, 0, 0, 0);

      const toDate = new Date(endDate);
      const toYear = toDate.getFullYear();
      const toMonth = (toDate.getMonth() + 1).toString().padStart(2, '0');
      const toDay = toDate.getDate().toString().padStart(2, '0');

      searchToDate = new Date(toYear + '-' + toMonth + '-' + toDay);
      searchToDate.setUTCHours(23, 59, 59, 999);
    }

    const smsQuery = {
      where: {
        ...where,
        ...(startDate && endDate
          ? {
              created_date: {
                [sequelize.Op.between]: [searchFromDate, searchToDate],
              },
            }
          : {}),
      },
      attributes: [
        'agency_fk',
        'tracker_ref_name',
        'batch_count',
        [sequelize.fn('sum', sequelize.col('sent')), 'total_sent'],
        [sequelize.fn('sum', sequelize.col('delivered')), 'total_delivered'],
        [sequelize.fn('sum', sequelize.col('failed')), 'total_failed'],
        [sequelize.fn('sum', sequelize.col('replied')), 'total_replied'],
        'sms_message_tracker.created_date',
        [
          sequelize.fn(
            'concat',
            sequelize.col('contact.first_name'),
            ' ',
            sequelize.col('contact.last_name'),
          ),
          'contact_name',
        ],
        'contact.contact_id',
      ],
      include: [
        {
          model: models.contact,
          require: true,
          attributes: [],
        },
      ],
      group: ['tracker_ref_name'],
      raw: true,
      offset,
      limit,
      transaction,
    };

    const records = await smsMessageTrackerModel.findAll(smsQuery);
    return records;
  };

  smsMessageTrackerCtl.getCampaignRecipientRecords = async (
    where,
    isAgencySalesUser,
    agency_user_id,
    { transaction },
  ) => {
    const listOfAgencyUsers =
      !isAgencySalesUser && h.general.notEmpty(agency_user_id)
        ? agency_user_id.split(',')
        : [];
    const records = await smsMessageTrackerModel.findAll({
      where: {
        ...where,
      },
      include: [
        {
          model: models.contact,
          require: true,
          where:
            !isAgencySalesUser && h.general.notEmpty(agency_user_id)
              ? {
                  agency_user_fk: {
                    [sequelize.Op.in]: listOfAgencyUsers,
                  },
                }
              : undefined,
          include: [
            {
              model: models.agency_user,
              require: true,
              include: [
                {
                  model: models.user,
                  require: true,
                },
              ],
            },
          ],
        },
      ],
      order: [['created_date', 'ASC']],
      transaction,
    });
    return records;
  };

  return smsMessageTrackerCtl;
};
