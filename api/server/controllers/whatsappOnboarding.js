const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { whatsapp_onboarding: whatsappOnboardingModel } = models;

  const whatsappOnboarding = {};

  /**
   * Create whatsapp_onboarding record
   * @param {{
   *  agency_fk: string,
   *  facebook_manager_id: string,
   *  client_company_name: string,
   *  display_image: string,
   *  about: string,
   *  whatsapp_status: string,
   *  address: string,
   *  email: string,
   *  website: string,
   *  status: string,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  whatsappOnboarding.create = async (record, { transaction } = {}) => {
    const funcName = 'whatsappOnboarding.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      partner_id,
      facebook_manager_id,
      client_company_name,
      display_image,
      about,
      whatsapp_status,
      address,
      email,
      website,
      status,
      created_by,
    } = record;
    const whatsapp_onboarding_id = h.general.generateId();
    const headers = JSON.stringify({
      headers: [
        {
          key: 'Origin',
          value: 'https://partner-api.unificationengine.com',
        },
        {
          key: 'x-component-secret',
          value: '5rO8pBwlI5ezBACN',
        },
      ],
    });
    const pending_date = h.date.getSqlCurrentDate();
    await whatsappOnboardingModel.create(
      {
        whatsapp_onboarding_id,
        agency_fk,
        partner_id,
        facebook_manager_id,
        client_company_name,
        display_image,
        about,
        whatsapp_status,
        address,
        email,
        website,
        headers,
        status,
        pending_date,
        created_by,
      },
      { transaction },
    );

    return whatsapp_onboarding_id;
  };

  /**
   * Update whatsapp_onboarding record
   * @param {string} whatsapp_onboarding_id
   * @param {{
   *  agency_fk: string,
   *  facebook_manager_id: string,
   *  client_company_name: string,
   *  display_image: string,
   *  about: string,
   *  whatsapp_status: string,
   *  address: string,
   *  email: string,
   *  website: string,
   *  status: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  whatsappOnboarding.update = async (
    whatsapp_onboarding_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'whatsappOnboarding.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      partner_id,
      facebook_manager_id,
      client_company_name,
      display_image,
      about,
      whatsapp_status,
      address,
      email,
      website,
      status,
    } = record;

    const toUpdate = {
      agency_fk,
      partner_id,
      facebook_manager_id,
      client_company_name,
      display_image,
      about,
      whatsapp_status,
      address,
      email,
      website,
      status,
      updated_by,
    };

    if (h.cmpStr(status, 'submitted')) {
      toUpdate.submitted_date = h.date.getSqlCurrentDate();
    }

    if (h.cmpStr(status, 'confirmed')) {
      toUpdate.confirmed_date = h.date.getSqlCurrentDate();
    }

    await whatsappOnboardingModel.update(toUpdate, {
      where: { whatsapp_onboarding_id },
      transaction,
    });

    return whatsapp_onboarding_id;
  };

  /**
   * Find all whatsapp_onboarding records
   * @param {{
   *  whatsapp_onboarding_id: string,
   *  agency_fk: string,
   *  customer: string,
   *  onboarding_channel: string,
   *  facebook_manager_id: string,
   *  client_company_name: string,
   *  display_image: string,
   *  whatsapp_status: string,
   *  address: string,
   *  email: string,
   *  website: string,
   *  webbhook_url: string,
   *  headers: string,
   *  status: string,
   *  pending_date: date,
   *  submitted_date: date,
   *  confirmed_date: date,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  whatsappOnboarding.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'whatsappOnboarding.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await whatsappOnboardingModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      group,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one whatsapp_onboarding record
   * @param {{
   *  whatsapp_onboarding_id: string,
   *  agency_fk: string,
   *  customer: string,
   *  onboarding_channel: string,
   *  facebook_manager_id: string,
   *  client_company_name: string,
   *  display_image: string,
   *  whatsapp_status: string,
   *  address: string,
   *  email: string,
   *  website: string,
   *  webbhook_url: string,
   *  headers: string,
   *  status: string,
   *  pending_date: date,
   *  submitted_date: date,
   *  confirmed_date: date,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  whatsappOnboarding.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'whatsappOnboarding.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await whatsappOnboardingModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete whatsapp_onboarding record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  whatsappOnboarding.destroy = async (where, { transaction } = {}) => {
    const funcName = 'whatsappOnboarding.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await whatsappOnboardingModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return whatsappOnboarding;
};
