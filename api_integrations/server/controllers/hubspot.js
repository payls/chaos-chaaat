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
          agency_user_tray_solution.tray_user_solution_instance_webhook_trigger,
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
  hubspotController.addContactToPave = async (new_hubspot_contact) => {
    const { contact, contact_owner, agency_user } = new_hubspot_contact;
    const {
      properties: {
        email,
        firstname = '',
        lastname = '',
        phone = '',
        hs_object_id,
      },
    } = contact;

    console.log('Payload is', new_hubspot_contact);
    let created_contact_id;

    try {
      await h.database.transaction(async (transaction) => {
        // Assume contact owner doesn't exists in pave system
        let paveContactOwnerAgencyFk = null;
        let paveContactOwner = null;

        // Find contact user using email if it exists in pave system
        if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner.email)) {
          paveContactOwner = await userController.findOne(
            {
              email: contact_owner.email,
            },
            {
              include: [
                {
                  model: models.agency_user,
                  required: true,
                  include: [{ model: models.agency, required: true }],
                },
              ],
              transaction,
            },
          );
        }

        if (h.isEmpty(paveContactOwner)) {
          console.log(
            'Contact doesnt has any contact owner. Marking contact with default agency',
          );
          // paveContactOwner.agency_user.agency.agency_fk = agency_user.agency_fk;
          paveContactOwner = {
            agency_user: {
              agency_user_id: null,
              agency: {
                agency_fk: agency_user.agency_fk,
              },
            },
          };
        }

        if (
          h.general.cmpStr(
            paveContactOwner.agency_user.agency.agency_fk,
            agency_user.agency_fk,
          )
        ) {
          console.log(
            'Contact Owner belongs to this Agency. Okay to tag the leads.',
          );
          paveContactOwnerAgencyFk = paveContactOwner.agency_user;
        } else {
          console.log(
            'Contact Owner does not belongs to this Agency. Skipping tagging Leads',
          );
          paveContactOwnerAgencyFk = null;
        }

        // // If it exists try to find agency of contact owner
        // if (isEmpty(paveContactOwner)) {
        //   console.log(
        //     "Contact Owner doesn't exists in Pave system. Skipping tagging of contact owner",
        //   );
        // } else {
        //   console.log(
        //     'Contact Owner exists in Pave system. Finding contact owner agency now',
        //   );
        //
        //   paveContactOwnerAgencyFk = await agencyUserController.findOne({
        //     user_fk: paveContactOwner.user_id,
        //   });
        //   if (
        //     h.general.cmpStr(
        //       paveContactOwnerAgencyFk.agency_fk,
        //       agency_user.agency_fk,
        //     )
        //   ) {
        //     console.log(
        //       'Contact Owner belongs to this Agency. Okay to tag the leads.',
        //     );
        //   } else {
        //     console.log(
        //       'Contact Owner does not belongs to this Agency. Skipping tagging Leads',
        //     );
        //     paveContactOwnerAgencyFk = null;
        //   }
        // }

        // Before inserting the contact check if the contact duplicate exists in system or not
        const isDuplicate = await contactController.findOne(
          {
            email: email,
            first_name: firstname,
            last_name: lastname,
            mobile_number: phone,
            status: constant.CONTACT.STATUS.ACTIVE,
            agency_user_fk: paveContactOwnerAgencyFk
              ? paveContactOwnerAgencyFk.agency_user_id
              : null,
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
          h.log(
            "Contact doesn't exists in pave system. Creating contact now.........",
          );
          // Create contact record
          const contact_id = await contactController.create(
            {
              first_name: firstname,
              last_name: lastname,
              email,
              mobile_number: phone,
              agency_fk: agency_user.agency_fk,
              agency_user_fk: paveContactOwnerAgencyFk
                ? paveContactOwnerAgencyFk.agency_user_id
                : null,
              status: constant.CONTACT.STATUS.ACTIVE,
              created_by: paveContactOwner ? paveContactOwner.user_id : null,
            },
            { transaction },
          );
          created_contact_id = contact_id;

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

          // get the custom properties required from database for the contacts.
          // const contact_property_definitions =
          //   await contactPropertyDefinitionsModel.findAll({
          //     where: {
          //       agency_fk: agency_user.agency_fk,
          //       attribute_source: SOURCE_TYPE,
          //       status: constant.CONTACT.PROPERTY_DEFINITIONS.STATUS.ACTIVE,
          //     },
          //     attributes: [
          //       'contact_property_definition_id',
          //       'attribute_name',
          //       'attribute_type',
          //     ],
          //   });

          // // for each custom property, create a record in property values table
          // for (let i = 0; i < contact_property_definitions.length; i++) {
          //   const definition = contact_property_definitions[i];
          //   if (contact.properties[definition.attribute_name]) {
          //     await contactPropertyValuesController.create(
          //       {
          //         contact_fk: contact_id,
          //         contact_property_definition_fk:
          //           definition.contact_property_definition_id,
          //         attribute_value_int:
          //           definition.attribute_type === 'int'
          //             ? contact.properties[definition.attribute_name]
          //             : null,
          //         attribute_value_string:
          //           definition.attribute_type === 'string'
          //             ? contact.properties[definition.attribute_name]
          //             : null,
          //         attribute_value_date:
          //           definition.attribute_type === 'date'
          //             ? contact.properties[definition.attribute_name]
          //             : null,
          //         created_by: agency_user ? agency_user.agency_user_id : null,
          //       },
          //       { transaction },
          //     );
          //   } else {
          //     console.log(
          //       `${definition.attribute_name} value not returned by tray`,
          //     );
          //   }
          // }
        } else {
          h.log(
            'Contact Already Exists in Pave System - Checking if contact source is correctly tagged',
          );
          // Check if contact source has been tagged with correct ID
          const contactSourceTaggedCorrectly =
            await contactSourceController.findOne(
              {
                source_contact_id: hs_object_id,
                contact_fk: isDuplicate.contact_id,
              },
              { transaction },
            );

          // Updating tagging found of source_contact_id
          if (h.isEmpty(contactSourceTaggedCorrectly)) {
            console.log(
              'Incorrect Contact_Source Found. Re-tagging with correct contact source. Contact Fk - ',
              isDuplicate.contact_id,
            );
            await contactSourceController.update(
              { contact_fk: isDuplicate.contact_id },
              {
                source_contact_id: hs_object_id,
              },
              { transaction },
            );
          } else {
            console.log(
              'Contact_Source is correctly tagged - Contact Fk',
              isDuplicate.contact_id,
            );
          }
        }
      });
      if (h.notEmpty(created_contact_id)) {
        // Send contact assignment email
        if (h.isEmpty(contact_owner)) {
          console.log('contact owner is empty before passing it into email');
        }
        try {
          // await contactController.sendContactAssignmentNotificationEmail(
          //   created_contact_id,
          //   contact_owner,
          // );
        } catch (err) {
          console.log(`Failed to send contact assignment email.`, {
            err,
          });
        }
      }
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
      properties: { email, firstname, lastname, phone, hs_object_id },
    } = contact;
    try {
      await h.database.transaction(async (transaction) => {
        // Assume contact owner doesn't exists in pave system
        let paveContactOwnerAgencyFk = null;
        let paveContactOwner = null;

        // Find contact user using email if it exists in pave system
        if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner.email)) {
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
              mobile_number: phone,
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
              // await contactController.sendContactAssignmentNotificationEmail(
              //   isDuplicate.contact_id,
              // );
            } catch (err) {
              console.log(`Failed to send contact assignment email.`, {
                err,
              });
            }
          }

          // get the custom properties required from database for the contacts.
          // const contact_property_definitions =
          //   await contactPropertyDefinitionsModel.findAll({
          //     where: {
          //       agency_fk: agency_user.agency_fk,
          //       attribute_source: SOURCE_TYPE,
          //       status: constant.CONTACT.PROPERTY_DEFINITIONS.STATUS.ACTIVE,
          //     },
          //     attributes: [
          //       'contact_property_definition_id',
          //       'attribute_name',
          //       'attribute_type',
          //     ],
          //   });

          // // for each custom property, create a record in property values table
          // for (let i = 0; i < contact_property_definitions.length; i++) {
          //   const definition = contact_property_definitions[i];
          //   if (contact.properties[definition.attribute_name]) {
          //     const contact_property_value =
          //       await contactPropertyValuesController.findOne({
          //         contact_property_definition_fk:
          //           definition.contact_property_definition_id,
          //         contact_fk: updatedContactId,
          //       });

          //     // dynamic attribute key values
          //     const attributeValueKeys = {
          //       string: 'attribute_value_string',
          //       int: 'attribute_value_int',
          //       data: 'attribute_value_date',
          //     };

          //     // create record template
          //     const record = {
          //       contact_fk: updatedContactId,
          //       contact_property_definition_fk:
          //         definition.contact_property_definition_id,
          //       created_by: agency_user ? agency_user.agency_user_id : null,
          //       updated_by: agency_user ? agency_user.agency_user_id : null,
          //     };

          //     // add attribute values to record
          //     record[attributeValueKeys[definition.attribute_type]] =
          //       contact.properties[definition.attribute_name];

          //     if (h.isEmpty(contact_property_value)) {
          //       // if a contact property value doesn't exist, create it.
          //       await contactPropertyValuesController.create(record, {
          //         transaction,
          //       });
          //     } else {
          //       // if a contact property value does exist, update it.
          //       await contactPropertyValuesController.update(
          //         contact_property_value.contact_property_value_id,
          //         record,
          //         {
          //           transaction,
          //         },
          //       );
          //     }
          //   } else {
          //     console.log(
          //       `${definition.attribute_name} value not returned by tray`,
          //     );
          //   }
          // }
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
    req,
    new_hubspot_contact,
  ) => {
    const funcName = 'HubspotController.updateContactInPaveV3';
    req.log.info(
      {
        payload: new_hubspot_contact,
      },
      funcName,
    );
    const { contact, contact_owner, agency_user } = new_hubspot_contact;
    const {
      properties: { email, firstname, lastname, phone, hs_object_id },
    } = contact;
    let isContactAssignment = false;
    try {
      let paveContactOwnerAgencyFk = null;
      let paveContactOwner = null;

      // Find contact user using email if it exists in pave system
      if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner.email)) {
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
      const contactSources = await models.contact_source.findAll({
        where: { source_contact_id: hs_object_id },
      });

      const isDuplicate = await contactController.findOne(
        {
          status: constant.CONTACT.STATUS.ACTIVE,
          agency_fk: agency_user ? agency_user.agency_fk : null,
          contact_id: {
            [Op.in]: contactSources.map(
              ({ dataValues }) => dataValues.contact_fk,
            ),
          },
        },
        {
          // include: [
          //   {
          //     model: models.contact_source,
          //     required: true,
          //     where: { source_contact_id: hs_object_id },
          //   },
          // ],
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

        const transaction = await models.sequelize.transaction();

        try {
          // Assume contact owner doesn't exists in pave system
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
              mobile_number: phone,
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

          await transaction.commit();

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

          // check if old contact and new contact is the same
          // @TODO with Kah check business logic for multiple crm (hubspot + salesforce)
          if (
            isDuplicate.agency_user_fk !==
            (paveContactOwnerAgencyFk &&
              paveContactOwnerAgencyFk.agency_user_id)
          ) {
            isContactAssignment = true;
          }
          // Send contact assignment email
          if (h.notEmpty(contact_owner) && isContactAssignment) {
            try {
              // await contactController.sendContactAssignmentNotificationEmail(
              //   isDuplicate.contact_id,
              //   contact_owner,
              // );
            } catch (err) {
              console.log(`Failed to send contact assignment email.`, {
                err,
              });
            }
          }
        } catch (err) {
          console.log(err);
          req.log.error({
            err,
            funcName,
          });
          await transaction.rollback();
          throw err;
        }
      }
    } catch (error) {
      console.log(error);
      req.log.error(
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

  return hubspotController;
};
