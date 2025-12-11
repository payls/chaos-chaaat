const sequelize = require('sequelize');
const { Op } = sequelize;
const axios = require('axios');
const constant = require('../constants/constant.json');
const h = require('../helpers');
const { isEmpty } = require('../helpers/general');
const config = require('../configs/config')(process.env.NODE_ENV);
const HUBSPOT_SOLUTION_ID = config.tray.hubspot;
const SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT;
const EMBEDDED_ID = process.env.TRAY_EMBEDDED_ID;

module.exports.makeHubspotController = (models) => {
  const {
    agency_user_tray: agencyUserTrayModel,
    agency_user_tray_solution: agencyUserTraySolutionModel,
    // contact_property_definitions: contactPropertyDefinitionsModel,
  } = models;

  const trayIntegrationsController =
    require('./tray').makeTrayIntegrationsController(models);
  const contactSourceController =
    require('./contactSource').makeContactSourceController(models);
  const contactController = require('./contact').makeContactController(models);
  const userController = require('./user').makeUserController(models);
  const userRoleController =
    require('./userRole').makeUserRoleController(models);
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const agencyController = require('./agency').makeAgencyController(models);
  const agencyNotification = require('./agencyNotification').makeController(
    models,
  );

  const hubspotController = {};

  hubspotController.getHubspotContactsFromPave = async (request) => {
    // Step 1 - Get all the contacts available in the table contacts
    const { user_id: current_user_id } = h.user.getCurrentUser(request);
    const { agency_user_id, agency_fk } = await agencyUserController.findOne({
      user_fk: current_user_id,
    });
    const userRoleRecord = await userRoleController.findOne({
      user_fk: current_user_id,
    });

    let contacts = [];
    if (request.query.search && !h.general.isEmpty(request.query.search)) {
      const splitedQuery = request.query.search.split(' ');
      const firstNameQuery = splitedQuery[0];
      const lastNameQuery = splitedQuery[splitedQuery.length - 1];
      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        contacts = await contactController.findAll(
          {
            status: constant.CONTACT.STATUS.ACTIVE,
            agency_fk,
            [Op.or]: [
              { first_name: { [Op.like]: `%${firstNameQuery}%` } },
              { last_name: { [Op.like]: `%${lastNameQuery}%` } },
              { mobile_number: { [Op.like]: `%${request.query.search}%` } },
              { email: { [Op.like]: `%${request.query.search}%` } },
            ],
            [Op.or]: [
              { agency_user_fk: agency_user_id },
              { created_by: current_user_id },
            ],
          },
          {
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: true,
                  },
                ],
              },
              {
                model: models.shortlisted_property,
                required: false,
                include: [
                  {
                    model: models.project_property,
                    required: false,
                  },
                ],
              },
              {
                model: models.contact_activity,
                required: false,
                where: {
                  activity_type:
                    constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
                },
              },
            ],
            order: [
              ['created_date', 'DESC'],
              [models.contact_activity, 'created_date', 'DESC'],
            ],
          },
        );
      } else {
        contacts = await contactController.findAll(
          {
            status: constant.CONTACT.STATUS.ACTIVE,
            agency_fk,
            [Op.or]: [
              { first_name: { [Op.like]: `%${firstNameQuery}%` } },
              { last_name: { [Op.like]: `%${lastNameQuery}%` } },
              { mobile_number: { [Op.like]: `%${request.query.search}%` } },
              { email: { [Op.like]: `%${request.query.search}%` } },
            ],
          },
          {
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: true,
                  },
                ],
              },
              {
                model: models.shortlisted_property,
                required: false,
                include: [
                  {
                    model: models.project_property,
                    required: false,
                  },
                ],
              },
              {
                model: models.contact_activity,
                required: false,
                where: {
                  activity_type:
                    constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
                },
              },
            ],
            order: [
              ['created_date', 'DESC'],
              [models.contact_activity, 'created_date', 'DESC'],
            ],
          },
        );
      }
    } else {
      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        contacts = await contactController.findAll(
          {
            status: constant.CONTACT.STATUS.ACTIVE,
            agency_fk,
            [Op.or]: [
              { agency_user_fk: agency_user_id },
              { created_by: current_user_id },
            ],
          },
          {
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: true,
                  },
                ],
              },
              {
                model: models.shortlisted_property,
                required: false,
                include: [
                  {
                    model: models.project_property,
                    required: false,
                  },
                ],
              },
              {
                model: models.contact_activity,
                required: false,
                where: {
                  activity_type:
                    constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
                },
              },
            ],
            order: [
              ['created_date', 'DESC'],
              [models.contact_activity, 'created_date', 'DESC'],
            ],
          },
        );
      } else {
        contacts = await contactController.findAll(
          { status: constant.CONTACT.STATUS.ACTIVE, agency_fk },
          {
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: true,
                  },
                ],
              },
              {
                model: models.shortlisted_property,
                required: false,
                include: [
                  {
                    model: models.project_property,
                    required: false,
                  },
                ],
              },
              {
                model: models.contact_activity,
                required: false,
                where: {
                  activity_type:
                    constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
                },
              },
            ],
            order: [
              ['created_date', 'DESC'],
              [models.contact_activity, 'created_date', 'DESC'],
            ],
          },
        );
      }
    }

    // Step 2 - Query contact_source table and filter all records with constant HUBSPOT
    const get_all_hubspot_contact_ids = await contactSourceController.findAll({
      source_type: SOURCE_TYPE,
    });

    // Step 3 - Get all contacts from all above ID's
    const hubspot_contact_fks = [];
    get_all_hubspot_contact_ids.forEach((item) => {
      hubspot_contact_fks.push(item.dataValues.contact_fk);
    });

    // Step 4 - Filter out contacts from main contact list
    const resultant_hubspot_contacts = [];
    hubspot_contact_fks.forEach((item) => {
      contacts.forEach((contact) => {
        if (h.general.compareString(contact.contact_id, item)) {
          resultant_hubspot_contacts.push(contact);
        }
      });
    });

    return resultant_hubspot_contacts;
  };

  hubspotController.getHubspotContactsFromPaveV2 = async (request) => {
    const {
      pageSize = 25,
      pageIndex = 0,
      totalCount,
      sortColumn,
      sortOrder,
    } = request.query;

    const order = [
      ['created_date', 'DESC'],
      [models.contact_activity, 'created_date', 'DESC'],
    ];

    if (sortColumn && sortOrder) {
      const split = sortColumn.split('.');
      for (let i = 0; i < split.length; i++) {
        if (i !== split.length - 1) split[i] = models[split[i]];
      }
      order.unshift([...split, sortOrder]);
    }

    const offset = pageIndex
      ? parseInt(pageIndex) * parseInt(pageSize)
      : undefined;
    const limit = pageSize ? parseInt(pageSize) : undefined;
    const { user_id: current_user_id } = h.user.getCurrentUser(request);
    const { agency_user_id, agency_fk } = await agencyUserController.findOne({
      user_fk: current_user_id,
    });
    const userRoleRecord = await userRoleController.findOne({
      user_fk: current_user_id,
    });

    const contactSource = await models.contact_source.findAll({
      where: {
        source_type: SOURCE_TYPE,
      },
      include: [
        {
          model: models.contact,
          where: {
            status: constant.CONTACT.STATUS.ACTIVE,
            agency_fk,
          },
          required: true,
          attributes: [],
        },
      ],
      attributes: [
        [
          sequelize.fn('DISTINCT', sequelize.col('contact_fk')),
          'contact_fk_unique',
        ],
        'contact_source_id',
        'contact_fk',
      ],
    });

    const contactIds = contactSource.map(
      ({ dataValues }) => dataValues.contact_fk,
    );

    let where = {
      status: constant.CONTACT.STATUS.ACTIVE,
      agency_fk,
    };

    const options = {
      include: [
        {
          model: models.agency_user,
          required: false,
          include: [
            {
              model: models.user,
              required: true,
            },
            {
              model: models.agency,
              required: false,
            },
          ],
        },
        {
          model: models.shortlisted_property,
          required: false,
          include: [
            {
              model: models.project_property,
              required: false,
            },
          ],
        },
        {
          model: models.contact_activity,
          required: false,
          where: {
            activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
          },
        },
      ],
      order,
      limit,
      offset,
    };

    if (request.query.search && !h.general.isEmpty(request.query.search)) {
      const splitedQuery = request.query.search.split(' ');
      const firstNameQuery = splitedQuery[0];
      const lastNameQuery = splitedQuery[splitedQuery.length - 1];
      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        where = {
          ...where,
          [Op.or]: [
            { first_name: { [Op.like]: `%${firstNameQuery}%` } },
            { last_name: { [Op.like]: `%${lastNameQuery}%` } },
            { mobile_number: { [Op.like]: `%${request.query.search}%` } },
            { email: { [Op.like]: `%${request.query.search}%` } },
          ],
          [Op.or]: [
            { agency_user_fk: agency_user_id },
            { created_by: current_user_id },
          ],
        };
      } else {
        where = {
          ...where,
          [Op.or]: [
            { first_name: { [Op.like]: `%${firstNameQuery}%` } },
            { last_name: { [Op.like]: `%${lastNameQuery}%` } },
            { mobile_number: { [Op.like]: `%${request.query.search}%` } },
            { email: { [Op.like]: `%${request.query.search}%` } },
          ],
        };
      }
    } else {
      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        where = {
          status: constant.CONTACT.STATUS.ACTIVE,
          agency_fk,
          [Op.or]: [
            { agency_user_fk: agency_user_id },
            { created_by: current_user_id },
          ],
        };
      }
    }

    let contacts = [];

    where.contact_id = contactIds;

    const fetchContactsFn = contactController.findAll(where, options);

    let fetchCountFn;
    if (totalCount) {
      fetchCountFn = Promise.resolve(totalCount);
    } else {
      fetchCountFn = contactController.count({
        status: constant.CONTACT.STATUS.ACTIVE,
        agency_fk,
        contact_id: contactIds,
      });
    }

    const [contactList, contactCount] = await Promise.all([
      fetchContactsFn,
      fetchCountFn,
    ]);
    contacts = contactList;

    return {
      contacts,
      totalCount: contactCount,
    };
  };

  hubspotController.triggerHubSpotFullSync = async (agencyUser) => {
    try {
      const agency_user_id = agencyUser.agency_user_id;
      const agency_user_tray = await agencyUserTrayModel.findOne({
        where: { agency_user_fk: agency_user_id },
      });
      const agency_user_tray_solution =
        await agencyUserTraySolutionModel.findOne({
          where: {
            agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
            tray_user_solution_source_type:
              constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT,
            tray_user_solution_instance_status:
              constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
          },
        });
      if (
        h.general.notEmpty(
          agency_user_tray_solution?.tray_user_solution_instance_webhook_trigger,
        )
      ) {
        const webhook_url = JSON.parse(
          agency_user_tray_solution.tray_user_solution_instance_webhook_trigger,
        ).full_sync;
        const axiosConfig = {
          method: 'post',
          url: `${webhook_url}`,
        };
        const response = await axios(axiosConfig);
        if (response.status === 200) {
          return true;
        } else {
          throw new Error('Failed to start HubSpot Full Sync');
        }
      } else {
        throw new Error('Full sync trigger not found');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * Add contact to Pave
   * @param {object} new_hubspot_contact
   * @returns {Promise<void>}
   */
  hubspotController.addContactToPave = async (new_hubspot_contact, log) => {
    const { contact, contact_owner, agency_user } = new_hubspot_contact;
    const {
      properties: {
        email,
        firstname = '',
        lastname = '',
        mobilephone = '',
        phone = '',
        hs_object_id,
        agency_id,
      },
    } = contact;
    const contact_phone = h.hubspot.processContactPhone({
      agency_id,
      phone,
      mobilephone,
    });

    log.info({ message: 'payload', data: new_hubspot_contact });
    let created_contact_id;
    let current_contact_id;

    let paveContactOwnerAgencyFk = null;
    let paveContactOwner = null;

    // Assume contact owner doesn't exists in pave system
    // Find contact user using email if it exists in pave system
    if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner?.email)) {
      paveContactOwner =
        await hubspotController.processPaveContactOwnerForCreate({
          email: contact_owner?.email,
          agency_user,
          log,
        });
    }

    if (
      h.notEmpty(paveContactOwner?.agency_user?.agency?.agency_id) &&
      h.general.cmpStr(
        paveContactOwner?.agency_user?.agency?.agency_id,
        agency_user.agency_fk,
      )
    ) {
      log.info({
        message: 'Contact Owner belongs to this Agency. Okay to tag the leads.',
      });
      paveContactOwnerAgencyFk = paveContactOwner?.agency_user;
    } else {
      log.info({
        message:
          'Contact Owner does not belongs to this Agency.' +
          'Skipping tagging Leads',
      });
      paveContactOwnerAgencyFk = null;
    }

    try {
      await h.database.transaction(async (transaction) => {
        const { created_id, current_id } =
          await hubspotController.processContactForCreate(
            {
              email,
              firstname,
              lastname,
              contact_phone,
              agency_user,
              paveContactOwnerAgencyFk,
              paveContactOwner,
              hs_object_id,
            },
            transaction,
            log,
          );
        created_contact_id = created_id;
        current_contact_id = current_id;
      });

      await hubspotController.processContactAssignmentNotification(
        {
          created_contact_id,
          paveContactOwnerAgencyFk,
          contact_owner,
        },
        log,
      );

      return current_contact_id;
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * Update contact in Pave
   * @param {object} new_hubspot_contact
   * @returns {Promise<void>}
   */
  hubspotController.updateContactInPaveV2 = async (
    req,
    new_hubspot_contact,
  ) => {
    const funcName = 'HubspotController.updateContactInPaveV2';
    req.log.info(
      {
        payload: new_hubspot_contact,
      },
      funcName,
    );
    const { contact, contact_owner, agency_user } = new_hubspot_contact;
    const {
      properties: {
        email,
        firstname,
        lastname,
        mobilephone,
        phone,
        hs_object_id,
        agency_id,
      },
    } = contact;
    const contact_phone = h.hubspot.processContactPhone({
      agency_id,
      phone,
      mobilephone,
    });
    try {
      await h.database.transaction(async (transaction) => {
        // Assume contact owner doesn't exists in pave system
        let paveContactOwnerAgencyFk = null;
        let paveContactOwner = null;

        // Find contact user using email if it exists in pave system
        if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner?.email)) {
          paveContactOwner = await userController.findOne(
            {
              email: contact_owner.email,
            },
            {
              include: [
                {
                  model: models.agency_user,
                  required: true,
                  where: { agency_fk: agency_user.agency_fk },
                },
              ],
              transaction,
            },
          );
        }

        // If it exists try to find agency of contact owner
        if (isEmpty(paveContactOwner)) {
          req.log.info(
            {
              message:
                "Contact Owner doesn't exists in Pave. Skipping tagging of contact owner",
            },
            funcName,
          );
        } else {
          paveContactOwnerAgencyFk = paveContactOwner.agency_user;
          if (
            h.general.cmpStr(
              paveContactOwnerAgencyFk.agency_fk,
              agency_user.agency_fk,
            )
          ) {
            req.log.info(
              {
                message:
                  'Contact owner exists in Pave and belongs to this Agency. Okay to tag the leads.',
              },
              funcName,
            );
          } else {
            req.log.info(
              {
                message:
                  'Contact Owner exists in Pave but does not belongs to this Agency. Skipping tagging Leads',
              },
              funcName,
            );
            paveContactOwnerAgencyFk = null;
          }
        }

        // Before inserting the contact check if the contact duplicate exists in system or not
        const isDuplicate = await contactController.findOne(
          {
            status: constant.CONTACT.STATUS.ACTIVE,
            agency_fk: agency_user ? agency_user.agency_fk : null,
          },
          {
            include: [
              {
                model: models.contact_source,
                required: true,
                where: { source_contact_id: hs_object_id },
              },
            ],
            transaction,
          },
        );

        if (h.isEmpty(isDuplicate)) {
          req.log.info(
            {
              message:
                "Contact doesn't exists in pave system. Nothing to update........",
            },
            funcName,
          );
        } else {
          req.log.info(
            {
              message:
                'Contact exists in Pave system. Updating the contact and contact source',
            },
            funcName,
          );
          // Updating the contact and contact source
          req.log.info({
            message: 'Updating Contact',
            funcName,
          });
          await contactController.update(
            isDuplicate.contact_id,
            {
              email,
              first_name: firstname,
              last_name: lastname,
              mobile_number: contact_phone,
              agency_user_fk: paveContactOwnerAgencyFk
                ? paveContactOwnerAgencyFk.agency_user_id
                : null,
            },
            { transaction },
          );

          req.log.info({
            message: 'Updating Contact source',
            funcName,
          });

          await contactSourceController.update(
            { contact_fk: isDuplicate.contact_id },
            {
              source_contact_id: hs_object_id,
            },
            { transaction },
          );

          // @TODO confirm with Kah the condition. or check throughly
          req.log.info(
            {
              message: 'Checking old agency_user_id vs new agency_user_id',
              old: isDuplicate.agency_user_fk,
              new:
                paveContactOwnerAgencyFk &&
                paveContactOwnerAgencyFk.agency_user_id,
            },
            funcName,
          );
          if (
            isDuplicate.agency_user_fk !==
            (paveContactOwnerAgencyFk &&
              paveContactOwnerAgencyFk.agency_user_id)
          ) {
            // Send contact assignment email
            try {
              if (h.notEmpty(paveContactOwnerAgencyFk)) {
                const canSend = await agencyUserController.getEmailNotification(
                  paveContactOwnerAgencyFk.agency_user_id,
                  'update_new_lead',
                );
                if (canSend) {
                  await contactController.sendContactAssignmentNotificationEmail(
                    isDuplicate.contact_id,
                  );
                }
              }
            } catch (err) {
              console.log(`Failed to send contact assignment email.`, {
                err,
              });
            }
          }
        }
      });
    } catch (error) {
      console.log(error);
      req.log.error(
        {
          err: error,
        },
        funcName,
      );
      throw new Error(error);
    }
  };

  /**
   * Update contact in Pave
   * @param {object} new_hubspot_contact
   * @returns {Promise<void>}
   */
  hubspotController.updateContactInPaveV3 = async (
    new_hubspot_contact,
    log,
  ) => {
    const funcName = 'HubspotController.updateContactInPaveV3';
    log.info(
      {
        payload: new_hubspot_contact,
      },
      funcName,
    );
    const { contact, contact_owner, agency_user } = new_hubspot_contact;
    const {
      properties: {
        email,
        firstname,
        lastname,
        mobilephone,
        phone,
        hs_object_id,
        agency_id,
      },
    } = contact;
    const contact_phone = h.hubspot.processContactPhone({
      agency_id,
      phone,
      mobilephone,
    });

    try {
      const { paveContactOwner, paveContactOwnerAgencyFk } =
        await hubspotController.processPaveContactOwnerForUpdate({
          contact_owner,
          agency_user,
          funcName,
          log,
        });

      const { contact_id, isContactAssignment } =
        await hubspotController.processContactForUpdate({
          hs_object_id,
          agency_user,
          firstname,
          lastname,
          email,
          contact_phone,
          paveContactOwnerAgencyFk,
          paveContactOwner,
          funcName,
          log,
        });
      // Send contact assignment email
      if (h.notEmpty(contact_owner) && isContactAssignment) {
        const paveContactOwnerFKAgencyUserID =
          h.notEmpty(paveContactOwnerAgencyFk) &&
          h.notEmpty(paveContactOwnerAgencyFk?.dataValues?.agency_user_id)
            ? paveContactOwnerAgencyFk?.dataValues?.agency_user_id
            : h.notEmpty(paveContactOwnerAgencyFk?.agency_user_id)
            ? paveContactOwnerAgencyFk?.agency_user_id
            : null;
        try {
          if (isContactAssignment) {
            const canSend = await agencyUserController.getEmailNotification(
              paveContactOwnerFKAgencyUserID,
              'update_new_lead',
            );
            if (canSend) {
              await contactController.sendContactAssignmentNotificationEmail(
                contact_id,
                contact_owner,
              );
            }
          }
        } catch (err) {
          console.log(`Failed to send contact assignment email.`, {
            err,
          });
        }
      }
      return contact_id;
    } catch (error) {
      log.error(
        {
          err: error,
        },
        funcName,
      );
      throw error;
    }
  };
  /**
   * Delete Agency User HubSpot Solution from both Tray And Pave
   * @returns {Promise<Object>}
   */
  hubspotController.deleteAgencyUserHubSpotSolution = async (
    agency_user_id,
    tray_user_solution_source_type,
  ) => {
    try {
      const agency_user_tray = await agencyUserTrayModel.findOne({
        where: { agency_user_fk: agency_user_id },
      });
      const agency_user_tray_solution =
        await agencyUserTraySolutionModel.findAll({
          where: {
            agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
            tray_user_solution_source_type,
          },
        });
      if (!h.isEmpty(agency_user_tray_solution)) {
        if (agency_user_tray_solution.length > 1) {
          // Multiple instances found which should be present
          console.log(
            'Multiple instances of same solution tagged to 1 user found. Deleting all now',
          );
        } else {
          const { tray_user_solution_instance_id } =
            agency_user_tray_solution[0];
          const deletedSolution =
            await trayIntegrationsController.deleteAgencyUserTraySolution(
              agency_user_tray.tray_user_fk_master_token,
              tray_user_solution_instance_id,
            );
          if (!h.isEmpty(deletedSolution)) {
            await agencyUserTraySolutionModel.update(
              {
                tray_user_solution_instance_status:
                  constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.INACTIVE,
              },
              {
                where: {
                  agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
                  tray_user_solution_source_type: SOURCE_TYPE,
                },
              },
            );
          }
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Connect Pave User to Tray HubSpot Service
   * @returns {Promise<Object>}
   */
  hubspotController.connectUserToTrayHubSpot = async (agencyUser) => {
    return await h.database.transaction(async (globalTransaction) => {
      try {
        const { agency_fk, agency_user_id, user } = agencyUser;

        // Step 1 - Check Tray Database if corresponding user exists
        const tray_user = await trayIntegrationsController.getUserFromTray(
          agency_user_id,
        );

        // Step 2 - Create User In Tray for corresponding Pave User
        let tray_user_id = {};
        if (tray_user.data.users.edges.length === 0) {
          console.log('Creating user in Tray database now.......');
          await trayIntegrationsController.createUserInTray(
            agency_fk,
            agency_user_id,
            user,
          );

          console.log(
            'User created Successfully. Fetching User from Tray Database now......',
          );
          tray_user_id = await trayIntegrationsController.getUserFromTray(
            agency_user_id,
          );
        } else {
          console.log(
            'User already exists in Tray Database. Skipping user creation. Fetching User from Tray Database now.....',
          );
          tray_user_id = { ...tray_user };
        }
        tray_user_id = tray_user_id.data.users.edges[0].node;

        // Step 3 - Create/Refresh Master Token for Above User for creating and binding to config wizard
        const { id } = tray_user_id;
        const tray_user_master_token =
          await trayIntegrationsController.createUserMasterToken(id);
        console.log('User Master Token is Created/Refreshed\n');

        // Step 4 - Create Config Wizard ID for the agency user using tray Id
        const config_wizard_id =
          await trayIntegrationsController.createConfigWizardAuthorization(id);
        console.log('Config Wizrard ID created');
        console.log('\n');

        // //Step 5 - Create Solution Instance for the user
        const solution_instance_id =
          await trayIntegrationsController.createSolutionInstanceForUser(
            agency_fk,
            agency_user_id,
            user,
            HUBSPOT_SOLUTION_ID,
            tray_user_master_token,
            agencyUser,
          );
        console.log('Solution instance created');

        // Step 6 - Activate Solution Instance for the user by upating it
        const updated_solution_instance_id =
          await trayIntegrationsController.activateUpdateSolutionInstanceForUser(
            agency_fk,
            agency_user_id,
            user,
            tray_user_master_token,
            solution_instance_id.id,
          );
        console.log('Solution instance updated and Activated');

        // Step 7 - Generate Tray Integration URL for End User
        const trayIntegrationURL = `https://yourpave.integration-configuration.com/external/auth/create/${EMBEDDED_ID}/${updated_solution_instance_id.id}/external_hubspot_authentication?code=${config_wizard_id}&skipTitleField=true&skipAuthSettings=true`;
        // `https://embedded.tray.io/external/solutions/${EMBEDDED_ID}/configure/${updated_solution_instance_id.id}?code=${config_wizard_id}`

        // Step 8 - Save all the information till this point to pave database
        const agencyUserTrayRecordPayload = {
          agency_user_tray_id: h.general.generateId(),
          agency_user_fk: agency_user_id,
          tray_user_fk: id,
          tray_user_fk_master_token: tray_user_master_token,
          tray_user_name: tray_user_id.name,
          is_deleted: 0,
          source_meta: 'tray-graphql',
          'source-payload': tray_user_id.toString(),
          created_by: agency_user_id,
          updated_by: agency_user_id,
        };

        const agencyUserTraySolutionRecord = {
          agency_user_tray_solution_id: h.general.generateId(),
          agency_user_tray_fk: agencyUserTrayRecordPayload.agency_user_tray_id,
          tray_user_config_wizard_id: config_wizard_id,
          tray_user_solution_id: HUBSPOT_SOLUTION_ID,
          tray_user_solution_source_type: SOURCE_TYPE,
          tray_user_solution_instance_id: solution_instance_id.id,
          tray_user_solution_instance_status:
            constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING,
          created_by: agency_user_id,
          updated_by: agency_user_id,
        };

        // Step 8 - Check if the record exists in pave database
        const agencyUserTrayRecord = await agencyUserTrayModel.findOne({
          where: {
            agency_user_fk: agency_user_id,
            tray_user_fk: id,
          },
        });

        // Step 9 - If not create the record else just update the master token
        if (agencyUserTrayRecord === null) {
          console.log(
            'Tray user not found in Pave Database. Making Entry in Pave Database',
          );
          await h.database.transaction(async (transaction) => {
            const result_1 = await agencyUserTrayModel.findOrCreate({
              where: {
                agency_user_fk: agency_user_id,
                tray_user_fk: id,
              },
              defaults: {
                ...agencyUserTrayRecordPayload,
              },
              globalTransaction,
            });

            const result_2 = await agencyUserTraySolutionModel.create(
              {
                ...agencyUserTraySolutionRecord,
              },
              { globalTransaction },
            );

            return { result_1, result_2 };
          });
        } else {
          console.log(
            'Tray User Already present in Pave Database. Updating Entry in Pave Database\n',
          );
          await h.database.transaction(async (transaction) => {
            console.log('Updating Agency User Tray Record\n');
            const result_1 = await agencyUserTrayModel.update(
              {
                ...agencyUserTrayRecordPayload,
                agency_user_tray_id: agencyUserTrayRecord.agency_user_tray_id,
              },
              {
                where: {
                  agency_user_fk: agency_user_id,
                  tray_user_fk: id,
                },
                globalTransaction,
              },
            );

            console.log(
              'Executing Find or Create in Agency User Tray Solutions\n',
            );
            const result_2 = await agencyUserTraySolutionModel.findOrCreate({
              where: {
                agency_user_tray_fk: agencyUserTrayRecord.agency_user_tray_id,
                tray_user_solution_source_type: SOURCE_TYPE,
              },
              defaults: {
                ...agencyUserTraySolutionRecord,
                agency_user_tray_fk: agencyUserTrayRecord.agency_user_tray_id,
              },
              globalTransaction,
            });

            console.log('Updating Agency User Tray Solutions Record\n');
            await agencyUserTraySolutionModel.update(
              {
                ...agencyUserTraySolutionRecord,
                agency_user_tray_fk: agencyUserTrayRecord.agency_user_tray_id,
              },
              {
                where: {
                  agency_user_tray_fk: agencyUserTrayRecord.agency_user_tray_id,
                  tray_user_solution_source_type: SOURCE_TYPE,
                },
                globalTransaction,
              },
            );

            return { result_1, result_2 };
          });
        }

        console.log('All entries Mapped to Pave Database');
        console.log('Returning config URL now.....');

        return trayIntegrationURL;
      } catch (error) {
        throw new Error(error);
      }
    });
  };

  /**
   * Connect Tray User Auth to Tray Solution
   * @returns {Promise<Object>}
   */
  hubspotController.tieHubSpotAuthToTrayUser = async (agency_user, auth) => {
    try {
      const { agencyUser } = agency_user;
      const { authId } = auth;
      const agency_user_tray = await agencyUserTrayModel.findOne({
        where: { agency_user_fk: agencyUser.agency_user_id },
      });
      const agency_user_tray_solution =
        await agencyUserTraySolutionModel.findOne({
          where: {
            agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
            tray_user_solution_source_type: SOURCE_TYPE,
          },
        });
      const updated_solution_instance_id =
        await trayIntegrationsController.addAuthToSolutionInstance(
          agency_user_tray.tray_user_fk_master_token,
          agency_user_tray_solution.tray_user_solution_instance_id,
          authId,
        );
      if (updated_solution_instance_id) {
        let triggerUrl = '';
        updated_solution_instance_id.workflows.edges.forEach((index) => {
          if (
            h.cmpStr(index.node.sourceWorkflowName, 'Get All Contacts - Pave')
          ) {
            triggerUrl = index.node.triggerUrl;
          }
        });
        await agencyUserTraySolutionModel.update(
          {
            tray_user_solution_instance_auth: authId,
            tray_user_solution_instance_status:
              constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
            tray_user_solution_instance_webhook_trigger: triggerUrl,
          },
          {
            where: {
              agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
              tray_user_solution_source_type: SOURCE_TYPE,
            },
          },
        );
      } else {
        throw new Error('Insert of capturing auth values failed');
      }
    } catch (e) {
      throw new Error(e);
    }
  };

  /**
   * Description
   * Check if a user is existing in Chaaat using the hubspot email retrieved
   * in hubspot then set as the contact owner to be used
   * @async
   * @constant
   * @name processPaveContactOwnerForCreate
   * @param {string} email the email address from hubspot
   * @param {object} agency_user agency user object data for agency
   * @param {object} log server log function
   */
  hubspotController.processPaveContactOwnerForCreate = async ({
    email,
    agency_user,
    log,
  }) => {
    let paveContactOwner = await userController.findOne(
      {
        email: email,
      },
      {
        include: [
          {
            model: models.agency_user,
            required: true,
            include: [{ model: models.agency, required: true }],
          },
        ],
      },
    );

    // if contact owner is not there - get default owner if set
    if (h.isEmpty(paveContactOwner)) {
      log.info({
        message:
          'Contact doesnt has any contact owner. Marking contact with' +
          'default agency',
      });
      const agency = agencyController.findOne({
        agency_id: agency_user?.agency_fk,
      });
      if (
        h.notEmpty(agency) &&
        h.notEmpty(agency?.default_outsider_contact_owner)
      ) {
        const agencyUser = agencyUserController.findOne({
          agency_user_id: agency?.default_outsider_contact_owner,
        });

        paveContactOwner = await userController.findOne(
          {
            user_id: agencyUser?.user_fk,
          },
          {
            include: [
              {
                model: models.agency_user,
                required: true,
                include: [{ model: models.agency, required: true }],
              },
            ],
          },
        );
      } else {
        paveContactOwner = {
          agency_user: {
            agency_user_id: null,
            agency: {
              agency_id: agency_user.agency_fk,
            },
          },
        };
      }
    }
    paveContactOwner =
      paveContactOwner && paveContactOwner.toJSON
        ? paveContactOwner.toJSON()
        : paveContactOwner;

    return paveContactOwner;
  };

  /**
   * Description
   * Process hubspot contact for creation in database and creating contact
   * source record
   * @async
   * @constant
   * @name processContactForCreate
   * @param {string} email hubspot contact email data
   * @param {string} firstname hubspot contact firstname data
   * @param {string} lastname hubspot contact lastname data
   * @param {string} contact_phone formatted phone data coming from either phone
   * or mobilephone field
   * @param {object} agency_user contact owner object data
   * @param {object} paveContactOwnerAgencyFk based on agency
   * @param {object} paveContactOwner processed contact owner data
   * @param {string} hs_object_id hubspot contact ID
   */
  hubspotController.processContactForCreate = async (
    {
      email,
      firstname,
      lastname,
      contact_phone,
      agency_user,
      paveContactOwnerAgencyFk,
      paveContactOwner,
      hs_object_id,
    },
    transaction,
    log,
  ) => {
    let created_contact_id;
    let current_contact_id;
    // if the contact duplicate exists in system or not before saving
    const isDuplicate = await hubspotController.checkIfContactExists({
      contact_phone,
      agency_user,
      hs_object_id,
    });

    if (h.isEmpty(isDuplicate)) {
      log.info({
        message:
          "Contact doesn't exists in pave system. Creating contact now...",
      });
      // Create contact record
      const contact_id = await hubspotController.processCreateHBContact(
        {
          firstname,
          lastname,
          email,
          contact_phone,
          agency_user,
          paveContactOwnerAgencyFk,
          paveContactOwner,
          hs_object_id,
          log,
        },
        transaction,
      );

      created_contact_id = contact_id;
      current_contact_id = contact_id;
    } else {
      current_contact_id = isDuplicate.contact_id;
      log.info({
        message:
          'Contact Already Exists in Pave System - Checking if contact' +
          'source is correctly tagged',
      });
      // Check if contact source has been tagged with correct ID
      const contactSourceTaggedCorrectly =
        await contactSourceController.findOne({
          source_contact_id: hs_object_id,
          contact_fk: isDuplicate.contact_id,
        });

      // Updating tagging found of source_contact_id
      if (h.isEmpty(contactSourceTaggedCorrectly)) {
        log.info({
          message:
            'Incorrect Contact_Source Found. Re-tagging with correct' +
            'contact source. Contact Fk - ',
          contact: isDuplicate.contact_id,
        });
        await contactSourceController.update(
          { contact_fk: isDuplicate.contact_id },
          {
            source_contact_id: hs_object_id,
          },
          { transaction },
        );
      } else {
        log.info({
          message: 'Contact_Source is correctly tagged - Contact Fk',
          contact: isDuplicate.contact_id,
        });
      }
    }

    return { created_id: created_contact_id, current_id: current_contact_id };
  };

  /**
   * Description
   * Function to check in the database if contact data fetched from hubspot
   * already exists
   * @async
   * @constant
   * @name checkIfContactExists
   * @param {string} contact_phone formatted phone data coming from either phone
   * or mobilephone field
   * @param {object} agency_user contact owner object data
   * @param {string} hs_object_id hubspot contact ID
   * @returns {Promise} returns isDuplicate object
   */
  hubspotController.checkIfContactExists = async ({
    contact_phone,
    agency_user,
    hs_object_id,
  }) => {
    // Before inserting the contact check if the contact duplicate exists in
    // system or not
    const contactSources = await models.contact_source.findAll({
      where: { source_contact_id: hs_object_id },
    });

    const where = {
      agency_fk: agency_user ? agency_user.agency_fk : null,
    };

    const contact_ids = contactSources.map(
      ({ dataValues }) => dataValues.contact_fk,
    );

    console.log(contact_ids);
    if (h.notEmpty(contact_ids)) {
      where.contact_id = {
        [Op.in]: contact_ids,
      };
    } else {
      where.mobile_number = contact_phone;
    }

    const isDuplicate = await contactController.findOne(where);

    return isDuplicate;
  };

  /**
   * Description
   * process contact assignment notification
   * if contact has assigned contact owner - will trigger sending via email
   * @async
   * @constant
   * @name processContactAssignmentNotification
   * @param {string} created_contact_id contact id of newly created contact
   * @param {object} paveContactOwnerAgencyFk based on agency
   * @param {object} contact_owner created contact owner data
   */
  hubspotController.processContactAssignmentNotification = async (
    { created_contact_id, paveContactOwnerAgencyFk, contact_owner },
    log,
  ) => {
    if (
      h.isEmpty(created_contact_id) ||
      h.isEmpty(contact_owner) ||
      h.isEmpty(paveContactOwnerAgencyFk)
    ) {
      return false;
    }

    const canSend = await agencyUserController.getEmailNotification(
      paveContactOwnerAgencyFk.agency_user_id,
      'create_new_lead',
    );

    try {
      if (canSend) {
        log.info({ created_contact_id, contact_owner });
        await contactController.sendContactAssignmentNotificationEmail(
          created_contact_id,
          contact_owner,
        );
      }
    } catch (err) {
      log.error({
        message: `Failed to send contact assignment email.`,
        err: {
          err,
        },
      });
    }
  };

  /**
   * Description
   * Check if a user is existing in Chaaat using the hubspot email retrieved
   * in hubspot then set as the contact owner to be used
   * @async
   * @constant
   * @name processPaveContactOwnerForUpdate
   * @param {object} contact_owner the contact owner data for contact
   * @param {object} agency_user agency user object data for agency
   * @param {string} funcName function name
   * @param {object} log server log functions
   * @returns {Promise} returns the contact owner objects
   */
  hubspotController.processPaveContactOwnerForUpdate = async ({
    contact_owner,
    agency_user,
    funcName,
    log,
  }) => {
    let paveContactOwner = null;
    let paveContactOwnerAgencyFk = null;
    // Find contact user using email if it exists in pave system
    if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner?.email)) {
      paveContactOwner = await userController.findOne(
        {
          email: contact_owner.email,
        },
        {
          include: [
            {
              model: models.agency_user,
              required: true,
              where: { agency_fk: agency_user.agency_fk },
            },
          ],
        },
      );
    }

    // If it exists try to find agency of contact owner
    if (isEmpty(paveContactOwner)) {
      log.info(
        {
          message:
            "Contact Owner doesn't exists. Skipping tagging of contact owner",
        },
        funcName,
      );
    } else {
      paveContactOwnerAgencyFk = paveContactOwner.agency_user;
      if (
        h.general.cmpStr(
          paveContactOwnerAgencyFk.agency_fk,
          agency_user.agency_fk,
        )
      ) {
        log.info(
          {
            message: 'Contact owner exists and belongs to this Agency.',
          },
          funcName,
        );
      } else {
        log.info(
          {
            message:
              'Contact Owner exists in but does not belongs to this agency.' +
              'Skipping tagging Leads',
          },
          funcName,
        );
        paveContactOwnerAgencyFk = null;
      }
    }

    return { paveContactOwner, paveContactOwnerAgencyFk };
  };

  /**
   * Description
   * Process hubspot contact for update in database and updating contact
   * source record
   * @async
   * @constant
   * @name processContactForUpdate
   * @param {string} hs_object_id hubspot contact ID
   * @param {object} agency_user  contact owner object data
   * @param {string} firstname hubspot contact firstname data
   * @param {string} lastname hubspot contact lastname data
   * @param {string} email hubspot contact email data
   * @param {string} contact_phone formatted phone data coming from either phone
   * or mobilephone field
   * @param {object} paveContactOwnerAgencyFk based on agency
   * @param {object} paveContactOwner processed contact owner data
   * @param {string} funcName function name
   * @param {object} log server log functions
   * @returns {Promise} returns the id of the updated contact and boolean if an
   * assignment notification is to be sent out
   */
  hubspotController.processContactForUpdate = async ({
    hs_object_id,
    agency_user,
    firstname,
    lastname,
    email,
    contact_phone,
    paveContactOwnerAgencyFk,
    paveContactOwner,
    funcName,
    log,
  }) => {
    let isContactAssignment = false;
    let contact_id = null;
    const isDuplicate = await hubspotController.checkIfContactExistForUpdate({
      hs_object_id,
      contact_phone,
      agency_user,
    });

    // check if can create new contact
    const contactInventory = await contactController.checkIfCanAddNewContact(
      agency_user?.agency_fk,
    );

    const transaction = await models.sequelize.transaction();
    try {
      if (h.isEmpty(isDuplicate)) {
        if (h.cmpBool(contactInventory.can_continue, false)) {
          log.warn({
            message: h.general.getMessageByCode(contactInventory.reason),
            details: {
              hs_object_id,
              agency_user,
              firstname,
              lastname,
              email,
              contact_phone,
              paveContactOwnerAgencyFk,
              paveContactOwner,
            },
          });
          // to add email notification for contact iventory fail
        } else {
          // Creating the contact and contact source
          contact_id = await hubspotController.processCreateHBContact(
            {
              firstname,
              lastname,
              email,
              contact_phone,
              agency_user,
              paveContactOwnerAgencyFk,
              paveContactOwner,
              hs_object_id,
              log,
            },
            transaction,
          );
          await agencyNotification.checkContactCapacityAfterUpdate(
            agency_user?.agency_fk,
          );
          isContactAssignment = true;
        }
        await transaction.commit();
      } else {
        // Updating the contact and contact source
        contact_id = await hubspotController.processUpdateHBContact(
          {
            contact_id: isDuplicate.contact_id,
            hs_object_id,
            email,
            firstname,
            lastname,
            contact_phone,
            paveContactOwnerAgencyFk,
            log,
            funcName,
          },
          transaction,
        );
        await transaction.commit();

        const paveContactOwnerFKAgencyUserID =
          h.notEmpty(paveContactOwnerAgencyFk) &&
          h.notEmpty(paveContactOwnerAgencyFk?.dataValues?.agency_user_id)
            ? paveContactOwnerAgencyFk?.dataValues?.agency_user_id
            : h.notEmpty(paveContactOwnerAgencyFk?.agency_user_id)
            ? paveContactOwnerAgencyFk?.agency_user_id
            : null;

        log.info(
          {
            message: 'Checking old agency_user_id vs new agency_user_id',
            old: isDuplicate.agency_user_fk,
            new: paveContactOwnerFKAgencyUserID,
          },
          funcName,
        );

        // check if old contact and new contact is the same
        if (isDuplicate.agency_user_fk !== paveContactOwnerFKAgencyUserID) {
          isContactAssignment = true;
        }
      }
    } catch (err) {
      log.error({
        err,
        funcName,
      });
      await transaction.rollback();
      throw err;
    }
    return { contact_id, isContactAssignment };
  };

  /**
   * Description
   * Function on creating contact using hubspot processed contact data
   * @async
   * @constant
   * @name processCreateHBContact
   * @param {string} firstname hubspot contact firstname
   * @param {string} lastname hubspot contact lastname
   * @param {string} email hubspot contact email
   * @param {string} contact_phone processed hubspot contact phone data
   * @param {object} agency_user agency contact owner data
   * @param {object} paveContactOwnerAgencyFk based on agency
   * @param {object} paveContactOwner processed contact owner data
   * @param {string} hs_object_id hubspot contact ID
   * @returns {Promise} returns the id of the created contact
   */
  hubspotController.processCreateHBContact = async (
    {
      firstname,
      lastname,
      email,
      contact_phone,
      agency_user,
      paveContactOwnerAgencyFk,
      paveContactOwner,
      hs_object_id,
      log,
    },
    transaction,
  ) => {
    const paveContactOwnerFKAgencyUserID =
      h.notEmpty(paveContactOwnerAgencyFk) &&
      h.notEmpty(paveContactOwnerAgencyFk?.dataValues?.agency_user_id)
        ? paveContactOwnerAgencyFk?.dataValues?.agency_user_id
        : h.notEmpty(paveContactOwnerAgencyFk?.agency_user_id)
        ? paveContactOwnerAgencyFk?.agency_user_id
        : null;
    log.info({
      message: "Contact doesn't exists in system. Creating contact",
    });
    const contact_id = await contactController.create(
      {
        first_name: firstname,
        last_name: lastname,
        email,
        mobile_number: contact_phone,
        agency_fk: agency_user.agency_fk,
        agency_user_fk: paveContactOwnerFKAgencyUserID,
        status: constant.CONTACT.STATUS.ACTIVE,
        created_by: paveContactOwner ? paveContactOwner.user_id : null,
      },
      { transaction },
    );

    // Create contact_source_record
    await contactSourceController.create(
      {
        contact_fk: contact_id,
        created_by: agency_user ? agency_user.agency_user_id : null,
        source_type: SOURCE_TYPE,
        source_contact_id: hs_object_id,
      },
      { transaction },
    );

    return contact_id;
  };

  /**
   * Description
   * Function on updating contact using hubspot processed contact data
   * @async
   * @constant
   * @name processCreateHBContact
   * @param {string} contact_id system id for contact when existing
   * @param {string} firstname hubspot contact firstname
   * @param {string} lastname hubspot contact lastname
   * @param {string} email hubspot contact email
   * @param {string} contact_phone processed hubspot contact phone data
   * @param {object} paveContactOwnerAgencyFk based on agency
   * @param {object} paveContactOwner processed contact owner data
   * @param {string} hs_object_id hubspot contact ID
   * @param {string} funcName function name
   * @returns {Promise} returns the id of the updated contact
   */
  hubspotController.processUpdateHBContact = async (
    {
      contact_id,
      hs_object_id,
      email,
      firstname,
      lastname,
      contact_phone,
      paveContactOwnerAgencyFk,
      log,
      funcName,
    },
    transaction,
  ) => {
    log.info(
      {
        message:
          'Contact exists in system. Updating contact and contact source',
      },
      funcName,
    );
    const paveContactOwnerFKAgencyUserID =
      h.notEmpty(paveContactOwnerAgencyFk) &&
      h.notEmpty(paveContactOwnerAgencyFk?.dataValues?.agency_user_id)
        ? paveContactOwnerAgencyFk?.dataValues?.agency_user_id
        : h.notEmpty(paveContactOwnerAgencyFk?.agency_user_id)
        ? paveContactOwnerAgencyFk?.agency_user_id
        : null;
    await contactController.update(
      contact_id,
      {
        email,
        first_name: firstname,
        last_name: lastname,
        mobile_number: contact_phone,
        agency_user_fk: paveContactOwnerFKAgencyUserID,
      },
      { transaction },
    );

    log.info({
      message: 'Updating Contact source',
      funcName,
    });

    await contactSourceController.update(
      { contact_fk: contact_id },
      {
        source_contact_id: hs_object_id,
      },
      { transaction },
    );

    return contact_id;
  };

  /**
   * Description
   * Function to check in the database if contact data fetched from hubspot
   * already exists
   * @async
   * @constant
   * @name checkIfContactExistForUpdate
   * @param {object} agency_user contact owner object data
   * @param {string} contact_phone contact mobile number
   * @param {string} hs_object_id hubspot contact ID
   * @returns {Promise} return isDuplicate object after checking if there is
   * already an existing contact record same with the request payload
   */
  hubspotController.checkIfContactExistForUpdate = async ({
    hs_object_id,
    contact_phone,
    agency_user,
  }) => {
    // Before inserting the contact check if the contact duplicate exists in
    // system or not
    const contactSources = await models.contact_source.findAll({
      where: { source_contact_id: hs_object_id },
    });

    const where = {
      agency_fk: agency_user ? agency_user.agency_fk : null,
    };

    const contact_ids = contactSources.map(
      ({ dataValues }) => dataValues.contact_fk,
    );

    console.log(contact_ids);
    if (h.notEmpty(contact_ids)) {
      where.contact_id = {
        [Op.in]: contact_ids,
      };
    } else {
      where.mobile_number = contact_phone;
    }

    const isDuplicate = await contactController.findOne(where);

    return isDuplicate;
  };

  return hubspotController;
};
