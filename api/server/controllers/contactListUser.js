const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');

module.exports.makeController = (models) => {
  const { contact_list_user: contactListUserModel } = models;
  const contactListUser = {};

  /**
   * Create contact list record
   * @param {{
   *  contact_list_id?: string,
   * 	contact_id: string,
   *  import_type: string,
   *  hubspot_id: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactListUser.create = async (record, { transaction } = {}) => {
    const funcName = 'contactListUser.create';
    h.validation.requiredParams(funcName, { record });
    const { contact_list_id, contact_id, import_type, hubspot_id, created_by } =
      record;
    const contact_list_user_id = h.general.generateId();
    await contactListUserModel.create(
      {
        contact_list_user_id,
        contact_list_id,
        contact_id,
        import_type,
        hubspot_id,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_list_user_id;
  };

  /**
   * Find one contact_list record
   * @param {{
   *  contact_list_user_id: string,
   *  contact_list_id: string,
   *  contact_id: string,
   *  import_type: string,
   *  hubspot_id: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactListUser.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'contactListUser.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactListUserModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Find all contact_list record
   * @param {{
   *  contact_list_user_id: string,
   *  contact_list_id: string,
   *  contact_id: string,
   *  import_type: string,
   *  hubspot_id: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactListUser.findAll = async (
    where,
    { order, include, limit, offset, transaction, attributes } = {},
  ) => {
    const funcName = 'contactListUser.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactListUserModel.findAll({
      where: { ...where },
      order,
      include,
      limit,
      offset,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  contactListUser.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'contactListUser.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactListUserModel.count({
      where: { ...where },
      subQuery,
      include,
      transaction,
      order,
      group,
      raw: true,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete contact_list_user record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactListUser.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactListUser.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactListUserModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete all contact_list_user record under contact_list
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactListUser.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'contactListUser.destroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await contactListUserModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const i in records) {
      const record = records[i];
      await contactListUserModel.destroy({
        where: {
          contact_list_user_id: record.contact_list_user_id,
        },
        transaction,
      });
      await record.destroy({ transaction });
    }
  };

  /**
   * Description
   * Prepares the contact list that will be used for the campaign
   * @async
   * @constant
   * @name prepareContactListForCampaign
   * @param {object} contact_list contact list to use for the campaign
   * @returns {Promise<array>} returns the processed contact ID list
   */
  contactListUser.prepareContactListForCampaign = async (contact_list) => {
    const contactLists = contact_list.map((item) => item.value.contact_list_id);
    const contact_list_users = await contactListUser.findAll(
      {
        contact_list_id: {
          [Op.in]: contactLists,
        },
      },
      {
        attributes: [],
        include: [
          {
            model: models.contact,
            required: true,
            where: {
              [Op.and]: [
                {
                  opt_out_whatsapp: 0,
                },
                {
                  [Op.or]: [
                    {
                      whatsapp_engagement: 'all',
                    },
                    {
                      whatsapp_engagement: {
                        [Op.like]: `%campaign%`,
                      },
                    },
                  ],
                },
              ],
            },
            attributes: ['contact_id'],
          },
        ],
      },
    );

    const contacts = [];
    for (const contact_list of contact_list_users) {
      contacts.push(contact_list.contact.dataValues.contact_id);
    }

    // Return only unique contacts
    return [...new Set(contacts)];
  };

  return contactListUser;
};
