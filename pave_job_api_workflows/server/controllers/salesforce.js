const sequelize = require('sequelize');
const { Op } = sequelize;
const axios = require('axios');
const constant = require('../constants/constant.json');
const h = require('../helpers');
const { isEmpty } = require('../helpers/general');
const SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE;

module.exports.makeSalesForceController = (models) => {
  const {
    agency_user_tray: agencyUserTrayModel,
    agency_user_tray_solution: agencyUserTraySolutionModel,
  } = models;

  const contactSourceController =
    require('./contactSource').makeContactSourceController(models);
  const contactController = require('./contact').makeContactController(models);
  const userController = require('./user').makeUserController(models);
  const userRoleController =
    require('./userRole').makeUserRoleController(models);
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);

  const salesforceController = {};

  salesforceController.getSalesForceContactsFromPave = async (request) => {
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

    // Step 2 - Query contact_source table and filter all records with constant SalesForce
    const get_all_salesforce_contact_ids =
      await contactSourceController.findAll({
        source_type: SOURCE_TYPE,
      });

    // Step 3 - Get all contacts from all above ID's
    const salesforce_contact_fks = [];
    get_all_salesforce_contact_ids.forEach((item) => {
      salesforce_contact_fks.push(item.dataValues.contact_fk);
    });

    // Step 4 - Filter out contacts from main contact list
    const resultant_salesforce_contacts = [];
    salesforce_contact_fks.forEach((item) => {
      contacts.forEach((contact) => {
        if (h.general.compareString(contact.contact_id, item)) {
          resultant_salesforce_contacts.push(contact);
        }
      });
    });

    return resultant_salesforce_contacts;
  };

  salesforceController.getSalesForceContactsFromPaveV2 = async (request) => {
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

    // Step 1 - Get all the contacts available in the table contacts
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
              required: false, // @TOD in hubspot this was set to true. for some reasons it works in hubspot. need to investigate.
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
      fetchCountFn = contactController.count(where);
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

  salesforceController.triggerSalesForceFullSync = async (agencyUser) => {
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
              constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE,
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
          throw new Error('Failed to start SalesForce Full Sync');
        }
      } else {
        throw new Error('Full sync trigger not found');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * Update contact in Pave
   * @param {object} new_salesforce_contact
   * @returns {Promise<void>}
   */
  salesforceController.updateContactInPave = async (new_salesforce_contact) => {
    const { contact = {}, contact_owner, agency_user } = new_salesforce_contact;
    const {
      Email: email = '',
      FirstName: firstname = '',
      LastName: lastname = '',
      MobilePhone: phone = '',
      Id: salesforce_contact_id = '',
    } = contact;
    console.log('\n\n', contact);

    let isContactAssignment = false;

    try {
      // Assume contact owner doesn't exists in pave system
      let paveContactOwnerAgencyFk = null;
      let paveContactOwner = null;

      // Salesforce contact id cannot be empty. If it is empty due to API design change at salesforce return from this point
      if (h.isEmpty(salesforce_contact_id)) {
        return;
      }

      // Find contact user using email if it exists in pave system
      if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner.Email)) {
        paveContactOwner = await userController.findOne(
          {
            email: contact_owner.Email,
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
        h.log(
          "Contact Owner doesn't exists in Pave. Skipping tagging of contact owner",
        );
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
              where: { source_contact_id: salesforce_contact_id },
            },
          ],
        },
      );

      // If it exists try to find agency of contact owner
      if (isEmpty(paveContactOwner)) {
        console.log(
          "Contact Owner doesn't exists in Pave system. Skipping tagging of contact owner",
        );
      } else {
        console.log(
          'Contact Owner exists in Pave system. Finding contact owner agency now',
        );
        paveContactOwnerAgencyFk = await agencyUserController.findOne({
          user_fk: paveContactOwner.user_id,
        });
        if (
          h.general.cmpStr(
            paveContactOwnerAgencyFk.agency_fk,
            agency_user.agency_fk,
          )
        ) {
          console.log(
            'Contact Owner belongs to this Agency. Okay to tag the leads.',
          );
        } else {
          console.log(
            'Contact Owner does not belongs to this Agency. Skipping tagging Leads',
          );
          paveContactOwnerAgencyFk = null;
        }
      }

      if (h.isEmpty(isDuplicate)) {
        h.log(
          "Contact doesn't exists in pave system. Creating contact........",
        );
        const { contact_id } = await h.database.transaction(
          async (transaction) => {
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

            // Create contact_source_record
            const contact_source_id = await contactSourceController.create(
              {
                contact_fk: contact_id,
                created_by: agency_user ? agency_user.agency_user_id : null,
                source_type: SOURCE_TYPE,
                source_contact_id: salesforce_contact_id,
              },
              { transaction },
            );

            return { contact_id, contact_source_id };
          },
        );

        try {
          if (h.notEmpty(paveContactOwnerAgencyFk)) {
            const canSend = await agencyUserController.getEmailNotification(
              paveContactOwnerAgencyFk.agency_user_id,
              'create_new_lead',
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
      } else {
        h.log(
          'Contact exists in Pave system. Updating the contact and contact source',
        );
        await h.database.transaction(async (transaction) => {
          // Updating the contact and contact source
          const updatedContact = await contactController.update(
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

          const updatedContactSource = await contactSourceController.update(
            { contact_fk: isDuplicate.contact_id },
            {
              source_contact_id: salesforce_contact_id,
            },
            { transaction },
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

          try {
            if (h.notEmpty(contact_owner) && isContactAssignment) {
              console.log(paveContactOwnerAgencyFk.agency_user_id);
              const canSend = await agencyUserController.getEmailNotification(
                paveContactOwnerAgencyFk.agency_user_id,
                'update_new_lead',
              );
              if (canSend) {
                await contactController.sendContactAssignmentNotificationEmail(
                  isDuplicate.contact_id,
                  contact_owner,
                );
              }
            }
          } catch (err) {
            console.log(`Failed to send contact assignment email.`, {
              err,
            });
          }

          return { updatedContact, updatedContactSource };
        });
      }
      return;
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * Add contact in Pave
   * @param {object} new_salesforce_contact
   * @returns {Promise<void>}
   */
  salesforceController.addContactToPave = async (new_salesforce_contact) => {
    const { contact = {}, contact_owner, agency_user } = new_salesforce_contact;
    const {
      Email: email = '',
      FirstName: firstname = '',
      LastName: lastname = '',
      MobilePhone: phone = '',
      Id: salesforce_contact_id = '',
    } = contact;

    try {
      // Assume contact owner doesn't exists in pave system
      let paveContactOwnerAgencyFk = null;
      let paveContactOwner = null;

      // Salesforce contact id cannot be empty. If it is empty due to API design change at salesforce return from this point
      if (h.isEmpty(salesforce_contact_id)) {
        return;
      }

      // Find contact user using email if it exists in pave system
      if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner.Email)) {
        paveContactOwner = await userController.findOne({
          email: contact_owner.Email,
        });
      }

      // If it exists try to find agency of contact owner
      if (isEmpty(paveContactOwner)) {
        console.log(
          "Contact Owner doesn't exists in Pave system. Skipping tagging of contact owner",
        );
      } else {
        console.log(
          'Contact Owner exists in Pave system. Finding contact owner agency now',
        );
        paveContactOwnerAgencyFk = await agencyUserController.findOne({
          user_fk: paveContactOwner.user_id,
        });
        if (
          h.general.cmpStr(
            paveContactOwnerAgencyFk.agency_fk,
            agency_user.agency_fk,
          )
        ) {
          console.log(
            'Contact Owner belongs to this Agency. Okay to tag the leads.',
          );
        } else {
          console.log(
            'Contact Owner does not belongs to this Agency. Skipping tagging Leads',
          );
          paveContactOwnerAgencyFk = null;
        }
      }

      // //Before inserting the contact check if the contact duplicate exists in system or not
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
              where: { source_contact_id: salesforce_contact_id },
            },
          ],
        },
      );

      const isDuplicateLiveChat = await contactController.findOne(
        {
          email: email,
          first_name: firstname,
          last_name: lastname,
          mobile_number: phone,
          status: constant.CONTACT.STATUS.ACTIVE,
        },
        {
          include: [
            {
              model: models.contact_source,
              required: true,
              where: { source_contact_id: salesforce_contact_id },
            },
          ],
        },
      );

      if (h.isEmpty(isDuplicate) && h.isEmpty(isDuplicateLiveChat)) {
        h.log(
          "Contact doesn't exists in pave system. Creating contact now.........",
        );

        const { contact_id } = await h.database.transaction(
          async (transaction) => {
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

            // Create contact_source_record
            const contact_source_id = await contactSourceController.create(
              {
                contact_fk: contact_id,
                created_by: agency_user ? agency_user.agency_user_id : null,
                source_type: SOURCE_TYPE,
                source_contact_id: salesforce_contact_id,
              },
              { transaction },
            );

            return { contact_id, contact_source_id };
          },
        );

        try {
          if (h.notEmpty(paveContactOwnerAgencyFk)) {
            const canSend = await agencyUserController.getEmailNotification(
              paveContactOwnerAgencyFk.agency_user_id,
              'create_new_lead',
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
      } else {
        // h.log(
        //   'Contact Already Exists in Pave System - Checking if contact source is correctly tagged',
        // );
        // Check if contact source has been tagged with correct ID
        const contactSourceTaggedCorrectly =
          await contactSourceController.findOne({
            source_contact_id: salesforce_contact_id,
            contact_fk: isDuplicate.contact_id,
          });

        // Updating tagging found of source_contact_id
        if (h.isEmpty(contactSourceTaggedCorrectly)) {
          // console.log(
          //   'Incorrect Contact_Source Found. Retagging with correct contact source. Contact Fk - ',
          //   isDuplicate.contact_id,
          // );
          await contactSourceController.update(
            { contact_fk: isDuplicate.contact_id },
            {
              source_contact_id: salesforce_contact_id,
            },
          );
        } else {
          // console.log(
          //   'Contact_Source is correctly tagged - Contact Fk',
          //   isDuplicate.contact_id,
          // );
        }
      }
      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  salesforceController.syncMissingContacts = async (
    req,
    contacts = [],
    msgId,
  ) => {
    const funcName = 'SalesforceController.syncMissingContacts';
    // get unadded contacts
    const newContacts = [];
    const updatedContacts = [];
    const erroredContacts = [];
    for (const i in contacts) {
      const { contact = {}, contact_owner, agency_user } = contacts[i];
      const {
        Email: email = '',
        FirstName: firstname = '',
        LastName: lastname = '',
        MobilePhone: phone = '',
        Id: salesforce_contact_id = '',
      } = contact;

      let doesContactExists;
      let paveContactOwner;
      let paveContactOwnerAgencyFk;

      if (h.notEmpty(salesforce_contact_id) && h.notEmpty(email)) {
        const contactSources = await models.contact_source.findAll({
          where: { source_contact_id: salesforce_contact_id },
        });
        doesContactExists = await contactController.findOne({
          status: constant.CONTACT.STATUS.ACTIVE,
          agency_fk: agency_user ? agency_user.agency_fk : null,
          contact_id: {
            [Op.in]: contactSources.map(
              ({ dataValues }) => dataValues.contact_fk,
            ),
          },
        });
      }

      if (h.notEmpty(contact_owner) && h.notEmpty(contact_owner.Email)) {
        paveContactOwner = await userController.findOne(
          {
            email: contact_owner.Email,
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

      if (h.notEmpty(paveContactOwner)) {
        paveContactOwnerAgencyFk = await agencyUserController.findOne({
          user_fk: paveContactOwner.user_id,
        });
      }

      if (!doesContactExists) {
        // add contact here
        const transaction = await models.sequelize.transaction();
        try {
          const contact_id = await contactController.create(
            {
              first_name: firstname,
              last_name: lastname,
              email,
              mobile_number: phone,
              agency_fk: agency_user.agency_fk,
              agency_user_fk: paveContactOwner
                ? paveContactOwnerAgencyFk.agency_user_id
                : null,
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
              source_contact_id: salesforce_contact_id,
            },
            { transaction },
          );
          await transaction.commit();
          newContacts.push(contact);
        } catch (sqlTxError) {
          erroredContacts.push(contact);
          req.log.error(
            {
              err: sqlTxError,
              funcName,
              segment: 'Adding missing contacts',
            },
            msgId,
          );
          await transaction.rollback();
        }
      } else {
        // update contact
        const transaction = await models.sequelize.transaction();
        try {
          const updateObject = {
            email,
            first_name: firstname,
            last_name: lastname,
            mobile_number: phone,
          };

          if (
            paveContactOwnerAgencyFk &&
            h.notEmpty(paveContactOwnerAgencyFk.agency_user_id)
          ) {
            updateObject.agency_user_fk =
              paveContactOwnerAgencyFk.agency_user_id;
          }
          await contactController.update(
            doesContactExists.contact_id,
            updateObject,
            { transaction },
          );

          await contactSourceController.update(
            { contact_fk: doesContactExists.contact_id },
            {
              source_contact_id: salesforce_contact_id,
            },
            { transaction },
          );

          await transaction.commit();
          updatedContacts.push(contact);
        } catch (sqlTxError) {
          erroredContacts.push(contact);
          req.log.error(
            {
              err: sqlTxError,
              funcName,
              segment: 'Updating contacts',
            },
            msgId,
          );
          await transaction.rollback();
        }
      }
    }

    req.log.info(
      {
        funcName,
        newContacts: newContacts.map(({ Id, Email }) => ({ Id, Email })),
        updatedContacts: updatedContacts.map(({ Id, Email }) => ({
          Id,
          Email,
        })),
        erroredContacts: erroredContacts.map(({ Id, Email }) => ({
          Id,
          Email,
        })),
        processedContacts: contacts.length,
        numberOfErrors: erroredContacts.length,
      },
      msgId,
    );

    return {
      newContacts,
      updatedContacts,
      erroredContacts,
    };
  };

  return salesforceController;
};
