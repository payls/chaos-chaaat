const Sentry = require('@sentry/node');
const h = require('../helpers');
const { Op } = require('sequelize');
const MindBodyAPI = require('../services/mindBodyApi');

module.exports.makeController = (models) => {
  const agencyOauthCtlr = require('./agencyOauth').makeController(models);

  const { mindbody_packages: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      id = null,
      package_id,
      name,
      payload,
      source_type = 'auto',
      agency_fk = '',
    } = record;
    const mindbody_package_id = id !== null ? id : h.general.generateId();
    await model.create(
      {
        mindbody_package_id,
        package_id,
        name,
        payload,
        source_type,
        agency_fk,
      },
      { transaction },
    );
    return mindbody_package_id;
  };

  ctr.upsert = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      id = null,
      package_id,
      name,
      payload,
      source_type = 'auto',
      agency_fk = '',
    } = record;
    const mindbody_package_id = id !== null ? id : h.general.generateId();
    await model.upsert(
      {
        mindbody_package_id,
        package_id,
        name,
        payload,
        source_type,
        agency_fk,
        is_deleted: 0,
      },
      { transaction },
    );
    return mindbody_package_id;
  };

  ctr.update = async (mindbody_package_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      mindbody_package_id,
      record,
    });
    const { contact_fk, payload, source_type, agency_fk } = record;
    await model.update(
      {
        contact_fk,
        payload,
        source_type,
        agency_fk,
      },
      { where: { mindbody_package_id }, transaction },
    );
    return mindbody_package_id;
  };

  ctr.findAll = async (
    where,
    { order, include, transaction, attributes, raw = false } = {},
  ) => {
    const funcName = 'ctr.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.findAll({
      where: { ...where },
      transaction,
      include,
      order,
      attributes,
      raw,
    });
    return h.database.formatData(records);
  };

  ctr.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'ctr.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroy = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete All
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findAll({
      where: { ...where },
      transaction,
    });
    if (record) await model.destroy({ where: { ...where } }, { transaction });
  };

  /**
   * Soft delete All
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.softDeleteAll = async (where, { transaction } = {}) => {
    const funcName = 'ctr.sotfDeleteAll';
    h.validation.requiredParams(funcName, { where });
    await model.update(
      {
        is_deleted: 1,
      },
      { where: { ...where }, transaction },
    );
  };

  ctr.syncPackages = async () => {
    try {
      const mindBodySetting = await agencyOauthCtlr.findAll({
        source: 'MINDBODY',
        status: 'active',
      });

      for (const setting of mindBodySetting) {
        const { access_info, agency_fk } = setting;
        const accessInfo = JSON.parse(access_info);

        if (accessInfo) {
          const { siteId, apiKey, staffUsername, staffPassword } = accessInfo;
          const mindbodyApi = new MindBodyAPI(siteId, apiKey);

          const staffRes = await mindbodyApi.getStaffToken(
            staffUsername,
            staffPassword,
          );

          const packagesApiRes = await mindbodyApi.getContracts({
            token: staffRes.AccessToken,
          });
          const servicesApiRes = await mindbodyApi.getServices({
            token: staffRes.AccessToken,
          });

          const packagesIds = h.general.notEmpty(packagesApiRes.Contracts)
            ? packagesApiRes.Contracts.map((m) => parseInt(m.Id))
            : [];
          const servicesIds = h.general.notEmpty(servicesApiRes.Services)
            ? servicesApiRes.Services.map((m) => parseInt(m.Id))
            : [];

          const currentPackages = await ctr.findAll(
            {
              agency_fk: agency_fk,
              source_type: 'auto',
              is_deleted: 0,
            },
            { attributes: ['package_id'], raw: true },
          );

          const currentIds = currentPackages.map((m) => parseInt(m.package_id));
          const allIds = [...packagesIds, ...servicesIds];

          // Find elements that are new (present in 'newItems' but not in 'current')
          const newContracts = allIds.filter(
            (item) => !currentIds.includes(item),
          );

          // Find elements that have been removed (present in 'current' but not in 'newItems')
          const removedPackages = currentIds.filter(
            (item) => !allIds.includes(item),
          );
          console.log('UPDATE MINDBODY PACKAGES');
          console.log('AGENCY:' + agency_fk);
          console.log('NEW');
          console.log(allIds);

          console.log('CURRENT');
          console.log(currentIds);

          console.log('NEW TO CURRENT');
          console.log(newContracts);

          console.log('REMOVED FROM CURRENT');
          console.log(removedPackages);

          // Soft delete contracts
          if (removedPackages.length !== 0) {
            await h.database.transaction(async (transaction) => {
              await ctr.softDeleteAll(
                {
                  agency_fk: agency_fk,
                  source_type: 'auto',
                  mindbody_package_id: {
                    [Op.in]: removedPackages,
                  },
                },
                {
                  transaction,
                },
              );
            });
          }

          // Add new contracts
          if (newContracts.length !== 0) {
            const currentPackages = [
              ...packagesApiRes.Contracts,
              ...servicesApiRes.Services,
            ].filter((f) => newContracts.includes(parseInt(f.Id)));
            // Save new package
            for (const pckg of currentPackages) {
              await h.database.transaction(async (transaction) => {
                await ctr.upsert(
                  {
                    id: pckg.Id,
                    name: pckg.Name,
                    package_id: pckg.Id,
                    agency_fk: agency_fk,
                    payload: JSON.stringify(pckg),
                    source_type: 'auto',
                  },
                  {
                    transaction,
                  },
                );
              });
            }
          }
          console.log('END MINDBODY PACKAGES');
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
      return null;
    }
  };
  return ctr;
};
