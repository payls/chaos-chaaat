const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { agency_campaign_event_details: agencyCampaignEventDetailsModel } =
    models;

  const agencyCampaignEventDetailsCtl = {};

  agencyCampaignEventDetailsCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'agencyCampaignEventDetailsCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyCampaignEventDetailsModel.findAll({
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

  agencyCampaignEventDetailsCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'agencyCampaignEventDetailsCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyCampaignEventDetailsModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  return agencyCampaignEventDetailsCtl;
};
