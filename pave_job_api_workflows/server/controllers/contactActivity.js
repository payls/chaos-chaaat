const h = require('../helpers');
const constant = require('../constants/constant.json');
const { Op } = require('sequelize');
const axios = require('axios');
const { isEmpty } = require('../helpers/general');
const geoip = require('geoip-lite');
const config = require('../configs/config')(process.env.NODE_ENV);

module.exports.makeContactActivityController = (models, fastify) => {
  const {
    contact_activity: contactActivityModel,
    agency: agencyModel,
    agency_user_tray: agencyUserTrayModel,
    agency_user_tray_solution: agencyUserTraySolutionModel,
  } = models;

  const contactActivityController = {};
  const projectMediaController =
    require('./projectMedia').makeProjectMediaController(models);
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const contactController = require('./contact').makeContactController(models);
  const userController = require('./user').makeUserController(models);
  const projectController = require('./project').makeProjectController(models);
  const shortListedPropertyController =
    require('./shortlistedProperty').makeShortListedPropertyController(models);
  const shortListedProjectController =
    require('./shortlistedProject').makeShortListedProjectController(models);
  const projectPropertyController =
    require('./projectProperty').makeProjectPropertyController(models);
  const shortlistPropertyCommentController =
    require('./shortlistedPropertyComment').makeShortListedPropertyCommentController(
      models,
    );
  const shortlistedProjectCommentController =
    require('./shortlistedProjectComment').makeShortListedProjectCommentController(
      models,
    );
  const cronJobController = require('./cronJob').makeCronJobController(models);

  /**
   * Count all contact activity records
   * @param {{
   *  contact_activity_id?: string,
   *  contact_fk?: string,
   *  activity_type?: string,
   *  activity_meta?: string,
   *  activity_date?: string,
   *  activity_ip?: string,
   *  viewed_on_device?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, order?:Array, transaction?:object }} [options]
   * @returns {Promise<Number>}
   */
  contactActivityController.count = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'contactActivityController.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const count = await contactActivityModel.count({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(count);
  };

  /**
   * Create contact activity record
   * @param {{
   *  contact_fk?: string,
   *  activity_type?: string,
   *  activity_meta?: string,
   *  activity_ip?: string,
   *  viewed_on_device?: string,
   *  activity_date?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactActivityController.create = async (record, { transaction } = {}) => {
    const funcName = 'contactActivityController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      contact_fk,
      activity_type,
      activity_meta,
      activity_ip,
      viewed_on_device,
      activity_date,
      created_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      { activity_type: constant.CONTACT.ACTIVITY.TYPE },
      { activity_type },
    );
    const contact_activity_id = h.general.generateId();
    await contactActivityModel.create(
      {
        contact_activity_id,
        contact_fk,
        activity_type,
        activity_meta,
        activity_ip,
        viewed_on_device,
        activity_date,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_activity_id;
  };

  /**
   * Log contact activity to Salesforce
   * @param {{
   *  contact_fk: string,
   *  activity_type: string,
   *  activity_meta: string
   * }} record
   * @param {{ include?:Array, order?:Array, transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactActivityController.logActivityToSalesforce = async (
    record,
    { transaction } = {},
    request = {},
  ) => {
    if (!request.log) {
      request.log = {
        info: console.log,
        warn: console.warn,
        error: console.error,
      };
    }
    const funcName = 'contactActivityController.logActivityToSalesforce';
    try {
      h.validation.requiredParams(funcName, { record });
      const { contact_fk, activity_type, activity_meta } = record;

      h.validation.validateConstantValue(
        funcName,
        { activity_type: constant.CONTACT.ACTIVITY.TYPE },
        { activity_type },
      );

      // Preliminary steps to tag the Salesforce Activity
      const contact = await contactController.findOne(
        { contact_id: contact_fk },
        {
          include: [
            {
              model: models.contact_source,
              required: true,
            },
            {
              model: models.agency_user,
              include: [
                {
                  model: models.user,
                  required: true,
                },
                {
                  model: models.agency_user_tray,
                  required: false,
                },
              ],
            },
          ],
          transaction,
        },
      );

      request.log.info(
        {
          label: 'contactActivityController.logActivityToSalesforce - Contact',
          contact,
        },
        funcName,
      );

      const { contact_sources = [], agency_user = {} } = contact || {};
      const { source_contact_id, source_type } = contact_sources[0] || {};

      if (isEmpty(agency_user) || isEmpty(agency_user.user)) {
        return;
      }

      const { user_id } = agency_user.user || {};

      request.log.info(
        {
          label: 'contactActivityController.logActivityToSalesforce - User Id:',
          user_id,
        },
        funcName,
      );

      request.log.info(
        {
          label:
            'contactActivityController.logActivityToSalesforce - Agency User:',
          agency_user,
        },
        funcName,
      );

      // Return if contact is of non-salesforce origin
      if (
        !h.cmpStr(
          source_type,
          constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE,
        )
      ) {
        return;
      }

      // Get agency user tray
      let agency_user_tray; // = agency_user.agency_user_tray;

      if (h.isEmpty(agency_user_tray)) {
        request.log.info(
          {
            message:
              'No tray connection found for this user. Trying to fall back on organisation level connection',
          },
          funcName,
        );

        // Trying to find organisational level connection
        const agency = await agencyModel.findOne({
          where: { agency_id: contact.agency_fk },
          include: [
            {
              model: models.agency_user,
              required: true,
            },
          ],
        });

        request.log.info(
          {
            label:
              'contactActivityController.logActivitySalesforce - Agency info:',
            agency,
          },
          funcName,
        );

        const usersBelongingToAgency = [];
        agency.agency_users.forEach((element) => {
          usersBelongingToAgency.push(element.agency_user_id);
        });

        request.log.info(
          {
            label:
              'contactActivityController.logActivityToSalesforce - user belongs to agency',
            usersBelongingToAgency,
          },
          funcName,
        );

        // find all agency user tray records for the agency
        const agencyCRMConnection = await agencyUserTrayModel.findAll({
          where: {
            agency_user_fk: {
              [Op.in]: usersBelongingToAgency,
            },
          },
        });

        // There can be atmost only 1 connection owner other than the requester.
        agency_user_tray = agencyCRMConnection;
      }

      if (Array.isArray(agency_user_tray) && agency_user_tray.length > 0) {
        // there could be more than one solution for all the users need to fine tune this.
        const agencyUserTrayIds = agency_user_tray.map((aut) => {
          const id = aut.dataValues
            ? aut.dataValues.agency_user_tray_id
            : aut.agency_user_tray_id;

          return id;
        });
        const agencyUserTraySolution =
          await agencyUserTraySolutionModel.findOne({
            where: {
              agency_user_tray_fk: {
                [Op.in]: agencyUserTrayIds,
              },
              tray_user_solution_source_type:
                constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE,
              tray_user_solution_instance_status:
                constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
            },
          });

        console.log(
          'contactActivityController.logActivityToSalesforce - agencyUserTraySolution: ',
          agencyUserTraySolution,
        );

        const { tray_user_solution_instance_webhook_trigger = null } =
          agencyUserTraySolution;

        const webhook = tray_user_solution_instance_webhook_trigger
          ? JSON.parse(tray_user_solution_instance_webhook_trigger)
          : '';
        let payload = {};
        let axiosConfig = {};

        if (h.general.isEmpty(activity_meta)) {
          throw new Error(
            'Unable to find activity_meta for corresponding event',
          );
        }
        const activityMetaJson = JSON.parse(activity_meta);
        switch (activity_type) {
          case constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED: {
            payload = {
              title: `Note by Pave`,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              message: `Pave - Link Opened | Link - ${config.webUrl}/preview?permalink=${contact.permalink}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.COMMENT_POSTED: {
            if (activityMetaJson.shortlisted_project_id) {
              const { shortlisted_project_id, shortlisted_project_comment_id } =
                activityMetaJson;
              const shortlistedProject =
                await shortListedProjectController.findOne(
                  {
                    shortlisted_project_id,
                  },
                  {
                    include: [
                      {
                        model: models.project,
                        required: true,
                      },
                    ],
                  },
                );
              const { name } = shortlistedProject.project;
              const { message } =
                await shortlistedProjectCommentController.findOne({
                  shortlisted_project_comment_id,
                });

              payload = {
                title: `Note by Pave`,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                message: `Pave - Comments | ${message} | project - ${name}`,
              };
            } else {
              const {
                shortlisted_property_id,
                shortlisted_property_comment_id,
              } = activityMetaJson;
              const shortListedProperty =
                await shortListedPropertyController.findOne(
                  { shortlisted_property_id },
                  {
                    include: [
                      {
                        model: models.project_property,
                        required: true,
                        include: [
                          {
                            model: models.project,
                            required: true,
                          },
                        ],
                      },
                    ],
                    transaction,
                  },
                );

              const { name } = shortListedProperty.project_property.project;
              const { message } =
                await shortlistPropertyCommentController.findOne({
                  shortlisted_property_comment_id,
                });

              const propertyDetails = `${name} | #${
                shortListedProperty.project_property.unit_number
              } | ${
                shortListedProperty.project_property.number_of_bedroom || '-'
              } bed | ${
                shortListedProperty.project_property.number_of_bathroom || '-'
              } bath | $${
                shortListedProperty.project_property.starting_price
                  ? h.currency.format(
                      shortListedProperty.project_property.starting_price,
                    )
                  : '-'
              }`;

              payload = {
                title: `Note by Pave`,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                message: `Pave - Comments | ${message} | property - ${propertyDetails}`,
              };
            }

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.PROPERTY_RATED: {
            if (activityMetaJson.shortlisted_project_id) {
              const { shortlisted_project_id, project_rating } =
                activityMetaJson;
              const shortlistedProject =
                await shortListedProjectController.findOne(
                  {
                    shortlisted_project_id,
                  },
                  {
                    include: [
                      {
                        model: models.project,
                        required: true,
                      },
                    ],
                  },
                );

              const { name } = shortlistedProject.project;
              payload = {
                title: `Note by Pave`,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                message: `Pave - Ratings | rated ${project_rating} stars on | project - ${name}`,
              };
            } else {
              const { shortlisted_property_id, property_rating } =
                activityMetaJson;
              const shortListedProperty =
                await shortListedPropertyController.findOne(
                  { shortlisted_property_id },
                  {
                    include: [
                      {
                        model: models.project_property,
                        required: true,
                        include: [
                          {
                            model: models.project,
                            required: true,
                          },
                        ],
                      },
                    ],
                    transaction,
                  },
                );

              const { name } = shortListedProperty.project_property.project;
              const propertyDetails = `${name} | #${
                shortListedProperty.project_property.unit_number
              } | ${
                shortListedProperty.project_property.number_of_bedroom || '-'
              } bed | ${
                shortListedProperty.project_property.number_of_bathroom || '-'
              } bath | $${
                shortListedProperty.project_property.starting_price
                  ? h.currency.format(
                      shortListedProperty.project_property.starting_price,
                    )
                  : '-'
              }`;
              payload = {
                title: `Note by Pave`,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                message: `Pave - Ratings | rated ${property_rating} stars on | property - ${propertyDetails}`,
              };
            }

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.PROJECT_RATED: {
            const { shortlisted_project_id, project_rating } = activityMetaJson;
            const shortlistedProject =
              await shortListedProjectController.findOne(
                {
                  shortlisted_project_id,
                },
                {
                  include: [
                    {
                      model: models.project,
                      required: true,
                    },
                  ],
                },
              );

            const { name } = shortlistedProject.project;
            payload = {
              title: `Note by Pave`,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              message: `Pave - Ratings | rated ${project_rating} stars on | project - ${name}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.PROPOSAL_SENT: {
            payload = {
              title: `Note by Pave`,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              message: `Pave - Proposal Sent | Link - ${config.webUrl}/preview?permalink=${contact.permalink}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.UPDATED_PROPOSAL_SENT: {
            payload = {
              title: `Note by Pave`,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              message: `Pave - Proposal Updated | Link - ${config.webUrl}/preview?permalink=${contact.permalink}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          // TODO: Still needs to be tested
          // case constant.CONTACT.ACTIVITY.TYPE.PROPERTY_BOOKMARKED: {
          //   const { shortlisted_property_id } = activityMetaJson;
          //   const shortListedProperty =
          //     await shortListedPropertyController.findOne(
          //       { shortlisted_property_id },
          //       {
          //         include: [
          //           {
          //             model: models.project_property,
          //             required: true,
          //             include: [
          //               {
          //                 model: models.project,
          //                 required: true,
          //               },
          //             ],
          //           },
          //         ],
          //         transaction,
          //       },
          //     );

          //   const { name } = shortListedProperty.project_property.project;
          //   const propertyDetails = `${name} | #${
          //     shortListedProperty.project_property.unit_number
          //   } | ${
          //     shortListedProperty.project_property.number_of_bedroom || '-'
          //   } bed | ${
          //     shortListedProperty.project_property.number_of_bathroom || '-'
          //   } bath | $${
          //     shortListedProperty.project_property.starting_price
          //       ? h.currency.format(
          //           shortListedProperty.project_property.starting_price,
          //         )
          //       : '-'
          //   }`;
          //   payload = {
          //     ownerId: hubspot_bcc_id,
          //     timestamp: new Date().getTime(),
          //     contactId: source_contact_id,
          //     body: `<strong>Pave - Bookmarking</strong> <br />
          //     ${h.date.formatDateTime(new Date(), true)}+UTC
          //     | bookmarked property - ${propertyDetails}`,
          //   };

          //   axiosConfig = {
          //     method: 'post',
          //     url: webhook.create_engagements,
          //     data: payload,
          //   };
          //   await axios(axiosConfig);
          //   break;
          // }

          default:
            break;
        }
      } else {
        console.log(
          `No corresponding Tray connection found for above agency user - ${agency_user_tray}`,
        );
      }
    } catch (err) {
      console.log(`${funcName}: Failed to log contact activity to Salesforce`, {
        err,
      });
      throw err;
    }
  };

  /**
   * Log contact activity to HubSpot
   * @param {{
   *  contact_fk: string,
   *  activity_type: string,
   *  activity_meta: string
   * }} record
   * @param {{ include?:Array, order?:Array, transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactActivityController.logActivityToHubSpot = async (
    record,
    { transaction } = {},
    request = {},
  ) => {
    if (!request.log) {
      request.log = {
        info: console.log,
        warn: console.warn,
        error: console.error,
      };
    }
    const funcName = 'contactActivityController.logActivityToHubSpot';
    try {
      h.validation.requiredParams(funcName, { record });
      const { contact_fk, activity_type, activity_meta } = record;
      h.validation.validateConstantValue(
        funcName,
        { activity_type: constant.CONTACT.ACTIVITY.TYPE },
        { activity_type },
      );

      // Preliminary steps to tag the HubSpot Activity
      const contact = await contactController.findOne(
        { contact_id: contact_fk },
        {
          include: [
            {
              model: models.contact_source,
              required: true,
            },
            {
              model: models.agency_user,
              include: [
                {
                  model: models.user,
                  required: true,
                },
                {
                  model: models.agency_user_tray,
                  required: false,
                },
              ],
            },
          ],
          transaction,
        },
      );

      request.log.info(
        {
          label: 'contactActivityController.logActivityToHubSpot - Contact',
          contact,
        },
        funcName,
      );

      const { contact_sources = [], agency_user = {} } = contact || {};
      const { source_contact_id, source_type } = contact_sources[0] || {};

      if (isEmpty(agency_user) || isEmpty(agency_user.user)) {
        return;
      }

      const { hubspot_bcc_id, user_id } = agency_user.user || {};

      request.log.info(
        {
          label:
            'contactActivityController.logActivityToHubSpot - Hubspot BCC ID:',
          hubspot_bcc_id,
          user_id,
        },
        funcName,
      );

      request.log.info(
        {
          label:
            'contactActivityController.logActivityToHubSpot - Agency User:',
          agency_user,
        },
        funcName,
      );

      if (isEmpty(hubspot_bcc_id)) {
        h.log(
          'HubSpot BCC ID not found. Stopping Activity logging to HubSpot now',
        );
        return;
      }

      // Return if contact is of non-hubspot origin
      if (
        !h.cmpStr(source_type, constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT)
      ) {
        return;
      }

      // Get agency user tray
      let agency_user_tray; // = agency_user.agency_user_tray;

      if (h.isEmpty(agency_user_tray)) {
        request.log.info(
          {
            message:
              'No tray connection found for this user. Trying to fall back on organisation level connection',
          },
          funcName,
        );

        // Trying to find organisational level connection
        const agency = await agencyModel.findOne({
          where: { agency_id: contact.agency_fk },
          include: [
            {
              model: models.agency_user,
              required: true,
            },
          ],
        });

        request.log.info(
          {
            label:
              'contactActivityController.logActivityToHubSpot - Agency info:',
            agency,
          },
          funcName,
        );

        const usersBelongingToAgency = [];
        agency.agency_users.forEach((element) => {
          usersBelongingToAgency.push(element.agency_user_id);
        });

        request.log.info(
          {
            label:
              'contactActivityController.logActivityToHubSpot - user belongs to agency',
            usersBelongingToAgency,
          },
          funcName,
        );

        // find all agency user tray records for the agency
        const agencyCRMConnection = await agencyUserTrayModel.findAll({
          where: {
            agency_user_fk: {
              [Op.in]: usersBelongingToAgency,
            },
          },
        });

        console.log('Agency CRM connection is', agencyCRMConnection);

        // There can be atmost only 1 connection owner other than the requester.
        agency_user_tray = agencyCRMConnection;
      }

      console.log(`Checking Agency User Tray is now:`, agency_user_tray);
      if (Array.isArray(agency_user_tray) && agency_user_tray.length > 0) {
        // there could be more than one solution for all the users need to fine tune this.
        const agencyUserTrayIds = agency_user_tray.map((aut) => {
          const id = aut.dataValues
            ? aut.dataValues.agency_user_tray_id
            : aut.agency_user_tray_id;

          return id;
        });
        const agencyUserTraySolution =
          await agencyUserTraySolutionModel.findOne({
            where: {
              agency_user_tray_fk: {
                [Op.in]: agencyUserTrayIds,
              },
              tray_user_solution_source_type:
                constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT,
              tray_user_solution_instance_status:
                constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
            },
          });

        console.log(
          'contactActivityController.logActivityToHubSpot - agencyUserTraySolution: ',
          agencyUserTraySolution,
        );

        const { tray_user_solution_instance_webhook_trigger = null } =
          agencyUserTraySolution;

        const webhook = tray_user_solution_instance_webhook_trigger
          ? JSON.parse(tray_user_solution_instance_webhook_trigger)
          : '';
        let payload = {};
        let axiosConfig = {};

        if (h.general.isEmpty(activity_meta)) {
          throw new Error(
            'Unable to find activity_meta for corresponding event',
          );
        }
        const activityMetaJson = JSON.parse(activity_meta);
        switch (activity_type) {
          case constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED: {
            payload = {
              ownerId: hubspot_bcc_id,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              body: `<strong>Pave - Link Opened</strong> <br /><strong>Link - </strong>${config.webUrl}/preview?permalink=${contact.permalink}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.COMMENT_POSTED: {
            if (activityMetaJson.shortlisted_project_id) {
              const { shortlisted_project_id, shortlisted_project_comment_id } =
                activityMetaJson;
              const shortlistedProject =
                await shortListedProjectController.findOne(
                  {
                    shortlisted_project_id,
                  },
                  {
                    include: [
                      {
                        model: models.project,
                        required: true,
                      },
                    ],
                  },
                );
              const { name } = shortlistedProject.project;
              const { message } =
                await shortlistedProjectCommentController.findOne({
                  shortlisted_project_comment_id,
                });
              payload = {
                ownerId: hubspot_bcc_id,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                body: `<strong>Pave - Comments</strong> <br /> ${message} | project - ${name}`,
              };
            } else {
              const {
                shortlisted_property_id,
                shortlisted_property_comment_id,
              } = activityMetaJson;
              const shortListedProperty =
                await shortListedPropertyController.findOne(
                  { shortlisted_property_id },
                  {
                    include: [
                      {
                        model: models.project_property,
                        required: true,
                        include: [
                          {
                            model: models.project,
                            required: true,
                          },
                        ],
                      },
                    ],
                    transaction,
                  },
                );

              const { name } = shortListedProperty.project_property.project;
              const { message } =
                await shortlistPropertyCommentController.findOne({
                  shortlisted_property_comment_id,
                });

              const propertyDetails = `${name} | #${
                shortListedProperty.project_property.unit_number
              } | ${
                shortListedProperty.project_property.number_of_bedroom || '-'
              } bed | ${
                shortListedProperty.project_property.number_of_bathroom || '-'
              } bath | $${
                shortListedProperty.project_property.starting_price
                  ? h.currency.format(
                      shortListedProperty.project_property.starting_price,
                    )
                  : '-'
              }`;

              payload = {
                ownerId: hubspot_bcc_id,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                body: `<strong>Pave - Comments</strong> <br /> ${message} | property - ${propertyDetails}`,
              };
            }

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.PROPERTY_RATED: {
            if (activityMetaJson.shortlisted_project_id) {
              const { shortlisted_project_id, project_rating } =
                activityMetaJson;
              const shortlistedProject =
                await shortListedProjectController.findOne(
                  {
                    shortlisted_project_id,
                  },
                  {
                    include: [
                      {
                        model: models.project,
                        required: true,
                      },
                    ],
                  },
                );

              const { name } = shortlistedProject.project;
              payload = {
                ownerId: hubspot_bcc_id,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                body: `<strong>Pave - Ratings</strong> <br /> rated ${project_rating} stars on | project - ${name}`,
              };
            } else {
              const { shortlisted_property_id, property_rating } =
                activityMetaJson;
              const shortListedProperty =
                await shortListedPropertyController.findOne(
                  { shortlisted_property_id },
                  {
                    include: [
                      {
                        model: models.project_property,
                        required: true,
                        include: [
                          {
                            model: models.project,
                            required: true,
                          },
                        ],
                      },
                    ],
                    transaction,
                  },
                );

              const { name } = shortListedProperty.project_property.project;
              const propertyDetails = `${name} | #${
                shortListedProperty.project_property.unit_number
              } | ${
                shortListedProperty.project_property.number_of_bedroom || '-'
              } bed | ${
                shortListedProperty.project_property.number_of_bathroom || '-'
              } bath | $${
                shortListedProperty.project_property.starting_price
                  ? h.currency.format(
                      shortListedProperty.project_property.starting_price,
                    )
                  : '-'
              }`;
              payload = {
                ownerId: hubspot_bcc_id,
                timestamp: new Date().getTime(),
                contactId: source_contact_id,
                body: `<strong>Pave - Ratings</strong> <br /> rated ${property_rating} stars on | property - ${propertyDetails}`,
              };
            }

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.PROJECT_RATED: {
            const { shortlisted_project_id, project_rating } = activityMetaJson;
            const shortlistedProject =
              await shortListedProjectController.findOne(
                {
                  shortlisted_project_id,
                },
                {
                  include: [
                    {
                      model: models.project,
                      required: true,
                    },
                  ],
                },
              );

            const { name } = shortlistedProject.project;
            payload = {
              ownerId: hubspot_bcc_id,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              body: `<strong>Pave - Ratings</strong> <br /> rated ${project_rating} stars on | project - ${name}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.PROPOSAL_SENT: {
            payload = {
              ownerId: hubspot_bcc_id,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              body: `<strong>Pave - Proposal Sent</strong> <br /> <strong>Link - </strong>${config.webUrl}/preview?permalink=${contact.permalink}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          case constant.CONTACT.ACTIVITY.TYPE.UPDATED_PROPOSAL_SENT: {
            payload = {
              ownerId: hubspot_bcc_id,
              timestamp: new Date().getTime(),
              contactId: source_contact_id,
              body: `<strong>Pave - Proposal Updated</strong> <br /> <strong>Link - </strong>${config.webUrl}/preview?permalink=${contact.permalink}`,
            };

            axiosConfig = {
              method: 'post',
              url: webhook.create_engagements,
              data: payload,
            };
            await axios(axiosConfig);
            break;
          }

          // TODO: Still needs to be tested
          // case constant.CONTACT.ACTIVITY.TYPE.PROPERTY_BOOKMARKED: {
          //   const { shortlisted_property_id } = activityMetaJson;
          //   const shortListedProperty =
          //     await shortListedPropertyController.findOne(
          //       { shortlisted_property_id },
          //       {
          //         include: [
          //           {
          //             model: models.project_property,
          //             required: true,
          //             include: [
          //               {
          //                 model: models.project,
          //                 required: true,
          //               },
          //             ],
          //           },
          //         ],
          //         transaction,
          //       },
          //     );

          //   const { name } = shortListedProperty.project_property.project;
          //   const propertyDetails = `${name} | #${
          //     shortListedProperty.project_property.unit_number
          //   } | ${
          //     shortListedProperty.project_property.number_of_bedroom || '-'
          //   } bed | ${
          //     shortListedProperty.project_property.number_of_bathroom || '-'
          //   } bath | $${
          //     shortListedProperty.project_property.starting_price
          //       ? h.currency.format(
          //           shortListedProperty.project_property.starting_price,
          //         )
          //       : '-'
          //   }`;
          //   payload = {
          //     ownerId: hubspot_bcc_id,
          //     timestamp: new Date().getTime(),
          //     contactId: source_contact_id,
          //     body: `<strong>Pave - Bookmarking</strong> <br />
          //     ${h.date.formatDateTime(new Date(), true)}+UTC
          //     | bookmarked property - ${propertyDetails}`,
          //   };

          //   axiosConfig = {
          //     method: 'post',
          //     url: webhook.create_engagements,
          //     data: payload,
          //   };
          //   await axios(axiosConfig);
          //   break;
          // }

          default:
            break;
        }
      } else {
        console.log(
          `No corresponding Tray connection found for above agency user - ${agency_user_tray}`,
        );
      }
    } catch (err) {
      console.log(`${funcName}: Failed to log contact activity to HubSpot`, {
        err,
      });
      throw err;
    }
  };

  /**
   * Update contact activity record
   * @param {string} contact_activity_id
   * @param {{
   *  contact_fk?: string,
   *  activity_type?: string,
   *  activity_meta?: string,
   *  activity_ip?: string,
   *  viewed_on_device?: string,
   *  activity_date?: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactActivityController.update = async (
    contact_activity_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactActivityController.update';
    h.validation.requiredParams(funcName, { contact_activity_id, record });
    const {
      contact_fk,
      activity_type,
      activity_meta,
      activity_ip,
      viewed_on_device,
      activity_date,
      updated_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      { activity_type: constant.CONTACT.ACTIVITY.TYPE },
      { activity_type },
    );
    await contactActivityModel.update(
      {
        contact_fk,
        activity_type,
        activity_meta,
        activity_ip,
        viewed_on_device,
        activity_date,
        updated_by,
      },
      { where: { contact_activity_id }, transaction },
    );
    return contact_activity_id;
  };

  /**
   * Find all contact activity records
   * @param {{
   *  contact_activity_id?: string,
   *  contact_fk?: string,
   *  activity_type?: string,
   *  activity_meta?: string,
   *  activity_ip?: string,
   *  viewed_on_device?: string,
   *  activity_date?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ offset?: Number, limit?: Number, include?:Array, order?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactActivityController.findAll = async (
    where,
    { offset, limit, include, order, attributes, group, transaction } = {},
  ) => {
    const funcName = 'contactActivityController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactActivityModel.findAll({
      where: { ...where },
      group,
      offset,
      limit,
      include,
      order,
      transaction,
      attributes,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single contact activity record
   * @param {{
   *  contact_activity_id?: string,
   *  contact_fk?: string,
   *  activity_type?: string,
   *  activity_meta?: string,
   *  activity_ip?: string,
   *  viewed_on_device?: string,
   *  activity_date?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactActivityController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactActivityController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactActivityModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Soft delete contact activity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactActivityController.softDestroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactActivityController.softDestroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactActivityModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) {
      await contactActivityModel.update(
        {
          is_deleted: 1,
        },
        {
          where: { contact_activity_id: record.contact_activity_id },
          transaction,
        },
      );
    }
  };

  /**
   * Soft delete all contact activity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactActivityController.softDestroyAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactActivityController.softDestroyAll';
    h.validation.requiredParams(funcName, { where });
    await contactActivityModel.update(
      {
        is_deleted: 1,
      },
      {
        where: { ...where },
        transaction,
      },
    );
  };

  /**
   * Hard delete contact activity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactActivityController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactActivityController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactActivityModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Calculate and add lead score based on activity_type into existing lead score
   * @param {string} activity_type
   * @param {object} activity_meta
   * @param {string} contact_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactActivityController.calculateLeadScore = async (
    activity_type,
    activity_meta,
    contact_id,
    { transaction },
  ) => {
    const funcName = 'contactActivityController.calculateLeadScore';
    h.validation.requiredParams(funcName, { activity_type, contact_id });
    let contactActivity;
    let parsedActivityMeta;
    let leadScore = 0;
    const constantActivityType = constant.CONTACT.ACTIVITY.TYPE;
    switch (activity_type) {
      case constantActivityType.BUYER_LINK_OPENED:
        // try to findOne activity with buyer_link_opened
        contactActivity = await contactActivityController.findOne(
          { activity_type: activity_type, activity_meta: activity_meta },
          transaction,
        );
        // if found +10, if not +2
        if (h.isEmpty(contactActivity)) {
          leadScore += 10;
        } else {
          leadScore += 2;
        }
        break;
      case constantActivityType.COMMENT_POSTED:
        try {
          parsedActivityMeta = JSON.parse(activity_meta);
          // try to findOne activity with comment_posted
          contactActivity = await contactActivityController.findOne(
            {
              activity_type: activity_type,
              activity_meta: {
                [Op.like]: `%"shortlisted_property_id":"${parsedActivityMeta.shortlisted_property_id}"%`,
              },
            },
            transaction,
          );
          // if found +10, if not +2
          if (h.isEmpty(contactActivity)) {
            leadScore += 10;
          } else {
            leadScore += 2;
          }
        } catch (err) {
          console.log(
            `${funcName}: Activity_type ${activity_type} should have meta data, lead score not changed`,
            err,
          );
        }
        break;
      case constantActivityType.PROPERTY_RATED:
        try {
          parsedActivityMeta = JSON.parse(activity_meta);
          // try to find 2 latest activities with property_rated
          contactActivity = await contactActivityModel.findAll({
            where: {
              activity_type: activity_type,
              activity_meta: {
                [Op.like]: `%"shortlisted_property_id":"${parsedActivityMeta.shortlisted_property_id}"%`,
              },
            },
            limit: 2,
            order: [['created_date', 'DESC']],
            transaction,
          });
          // - previous rating score
          if (contactActivity.length > 1) {
            try {
              const previousPropertyRating = JSON.parse(
                contactActivity[1].activity_meta,
              ).property_rating;
              leadScore += -(previousPropertyRating * 10);
            } catch (err) {
              console.log(
                `${funcName}: Previous rating exists but has no meta data, lead score not changed`,
                err,
              );
            }
          }
          // + current rating score
          leadScore += parsedActivityMeta.property_rating * 10;
        } catch (err) {
          console.log(
            `${funcName}: Activity_type ${activity_type} should have meta data, lead score not changed`,
            err,
          );
        }
        break;
      case constantActivityType.PROJECT_RATED:
        try {
          parsedActivityMeta = JSON.parse(activity_meta);
          contactActivity = await contactActivityModel.findAll({
            where: {
              activity_type: activity_type,
              activity_meta: {
                [Op.like]: `%"shortlisted_project_id":"${parsedActivityMeta.shortlisted_project_id}"%`,
              },
            },
            limit: 2,
            order: [['created_date', 'DESC']],
            transaction,
          });
          // - previous rating score
          if (contactActivity.length > 1) {
            try {
              const previousProjectRating = JSON.parse(
                contactActivity[1].activity_meta,
              ).project_rating;
              leadScore += -(previousProjectRating * 10);
            } catch (err) {
              console.log(
                `${funcName}: Previous rating exists but has no meta data, lead score not changed`,
                err,
              );
            }
          }
          // + current rating score
          leadScore += parsedActivityMeta.project_rating * 10;
        } catch (err) {
          console.log(
            `${funcName}: Activity_type ${activity_type} should have meta data, lead score not changed`,
            err,
          );
        }
        break;
      // fall-through
      case constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_LEFT_BUTTON_CLICKED:
      case constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_RIGHT_BUTTON_CLICKED:
      case constant.CONTACT.ACTIVITY.TYPE.PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED:
      case constant.CONTACT.ACTIVITY.TYPE.PROJECT_CAROUSEL_RIGHT_BUTTON_CLICKED:
        leadScore += 2;
        break;
      case constantActivityType.PROPERTY_BOOKMARKED:
        leadScore += 30;
        break;
      case constantActivityType.PROPERTY_UNBOOKMARKED:
        leadScore -= 30;
        break;
      case constantActivityType.PROJECT_BOOKMARKED:
        leadScore += 15;
        break;
      case constantActivityType.PROJECT_UNBOOKMARKED:
        leadScore -= 15;
        break;
      case constantActivityType.CAROUSEL_IMAGE_CLICKED:
      case constantActivityType.CAROUSEL_THUMBNAIL_CLICKED:
      case constantActivityType.PROJECT_CAROUSEL_IMAGE_CLICKED:
      case constantActivityType.PROJECT_CAROUSEL_THUMBNAIL_CLICKED:
        leadScore += 2;
        break;
      case constantActivityType.TAG_CLICKED_ALL:
      case constantActivityType.TAG_CLICKED_IMAGE:
      case constantActivityType.TAG_CLICKED_VIDEO:
      case constantActivityType.TAG_CLICKED_FLOOR_PLAN:
      case constantActivityType.TAG_CLICKED_BROCHURE:
      case constantActivityType.TAG_CLICKED_PROJECT:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_ALL:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_IMAGE:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_VIDEO:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_FLOOR_PLAN:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_BROCHURE:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_PROJECT:
        leadScore += 5;
        break;
      case constantActivityType.PROJECT_ADDITIONAL_FIELD_CLICKED:
        leadScore += 5;
        break;
      case constantActivityType.MORE_PROPERTY_REQUESTED:
        leadScore += 20;
        break;
      case constantActivityType.AGENT_EMAIL_CLICKED:
      case constantActivityType.AGENT_PHONE_CLICKED:
      case constantActivityType.AGENT_WEBSITE_CLICKED:
      case constantActivityType.AGENT_INSTAGRAM_CLICKED:
      case constantActivityType.AGENT_LINKEDIN_CLICKED:
      case constantActivityType.AGENT_FACEBOOK_CLICKED:
        leadScore += 1;
        break;
      case constantActivityType.COMMENT_ATTACHMENT_IMAGE_PREVIEWED:
      case constantActivityType.COMMENT_ATTACHMENT_PDF_PREVIEWED:
      case constantActivityType.COMMENT_ATTACHMENT_EXCEL_DOWNLOADED:
      case constantActivityType.COMMENT_ATTACHMENT_WORD_DOWNLOADED:
      case constantActivityType.COMMENT_ATTACHMENT_POWERPOINT_DOWNLOADED:
        leadScore += 5;
        break;
      default:
        h.log(`activity_type ${activity_type} is invalid`);
        break;
    }
    await contactController.addLeadScore(leadScore, contact_id, {
      transaction,
    });
  };

  /**
   * Method to handle 3 minute contact activity email
   * Timeout for 3 minutes and gets all contact activity from 3 minutes ago
   * @returns {null}
   */
  contactActivityController.handle3MinuteActivityEmail = async (
    previousContactValues,
    user,
  ) => {
    const funcName = 'contactActivityController.handle3MinuteActivityEmail';
    h.validation.requiredParams(funcName, { previousContactValues });
    let send_email = false;

    let agentEmailPreference;
    let contact_id;
    if (previousContactValues.dataValues) {
      contact_id = previousContactValues.dataValues.contact_id;
      agentEmailPreference =
        previousContactValues.dataValues.agent_email_preference;
    } else {
      contact_id = previousContactValues.contact_id;
      agentEmailPreference = previousContactValues.agent_email_preference;
    }

    // Set agent email preference to false
    if (!agentEmailPreference) {
      fastify.log.info({
        functionName: funcName,
        message: `Agent Email Preference is set to false.`,
      });
      return;
    }

    // // Obtain all Contact Activities from the 3 minutes that has passed
    const threshold = new Date(h.date.getSqlCurrentDate());
    threshold.setMinutes(threshold.getMinutes() - 5);

    const contactActivities = await contactActivityController.findAll({
      contact_fk: contact_id,
      activity_date: { [Op.gte]: threshold },
    });

    // log number of contact activities
    fastify.log.info({
      functionName: funcName,
      message: `Found ${contactActivities.length} number of contact activities.`,
    });
    // return if no contact activities
    if (h.isEmpty(contactActivities)) {
      return;
    }

    const activity_summary = {
      overall: {
        location: '',
        device: '',
      },
      data: {},
    };

    // Iterate shortlisted property to get Project & property data for the proposal
    const shortlisted_properties = await shortListedPropertyController.findAll(
      { contact_fk: contact_id },
      {
        include: [
          {
            model: models.project_property,
            required: true,
            include: [
              {
                model: models.project,
                required: true,
              },
            ],
          },
          {
            model: models.shortlisted_property_setting,
            required: false,
          },
        ],
      },
    );
    const shortlisted_projects = await shortListedProjectController.findAll(
      { contact_fk: contact_id },
      {
        include: [
          {
            model: models.project,
            required: true,
          },
          {
            model: models.shortlisted_project_setting,
            required: false,
          },
        ],
      },
    );

    // Log number of shortlisted projects
    fastify.log.info({
      functionName: funcName,
      message: `Found ${shortlisted_projects.length} number of shortlisted projects.`,
    });
    // return if no shortlisted_projects
    if (h.isEmpty(shortlisted_projects)) {
      return;
    }

    const shortlistProjToProjMap = {};
    for (const projIndx in shortlisted_projects) {
      const shortlistedProject = shortlisted_projects[projIndx];
      const project = shortlistedProject.project;
      const projectSettings =
        shortlistedProject.shortlisted_project_settings[0];
      const projectDetails = h.project.getProjectDetails(
        project.dataValues,
        projectSettings,
      );
      const projectShownImages =
        h.project.getShownProjectImages(projectSettings);
      shortlistProjToProjMap[shortlistedProject.shortlisted_project_id] =
        shortlistedProject.project_fk;
      activity_summary.data[project.project_id] = {
        project_details: projectDetails,
        project_shown_images: projectShownImages,
        project_name: project.name,
        key_stats: '-',
        project_highlights: '-',
        why_invest: '-',
        shopping: '-',
        transport: '-',
        education: '-',
        overall_time: 0,
        time_spent: {
          image: 0,
          video: 0,
          floor_plan: 0,
          brochure: 0,
        },
        properties: {},
      };
    }

    const propToProjMap = {};

    // Initialise activity_summary json
    for (let i = 0; i < shortlisted_properties.length; i++) {
      const shortlistedProperty = shortlisted_properties[i];
      const propertySettings =
        shortlistedProperty.shortlisted_property_settings[0];
      const propertyShownImages =
        h.property.getShownProjectImages(propertySettings);
      const projectProperty = shortlistedProperty.dataValues.project_property;
      const project = projectProperty.project;
      propToProjMap[shortlistedProperty.shortlisted_property_id] =
        project.project_id;
      // Get property name
      const project_unit = h.notEmpty(projectProperty.unit_number)
        ? `#${projectProperty.unit_number} |`
        : '';
      const number_of_bedroom = h.notEmpty(projectProperty.number_of_bedroom)
        ? `${projectProperty.number_of_bedroom} bedroom${
            projectProperty.number_of_bedroom > 1 ? 's' : ''
          } |`
        : '';
      const number_of_bathroom = h.notEmpty(projectProperty.number_of_bathroom)
        ? `${projectProperty.number_of_bathroom} bathroom${
            projectProperty.number_of_bathroom > 1 ? 's' : ''
          } |`
        : '';
      const property_price = h.notEmpty(projectProperty.starting_price)
        ? ` ${project.currency_code} ${h.currency.format(
            projectProperty.starting_price,
            0,
          )} `
        : '';
      // format property name
      const fullPropertyName = `${project.name} | ${project_unit} ${number_of_bedroom} ${number_of_bathroom} ${property_price}`;

      activity_summary.data[project.project_id].properties[
        shortlistedProperty.shortlisted_property_id
      ] = {
        property_name: fullPropertyName,
        property_shown_images: propertyShownImages,
        rating: '',
        comment: '',
        overall_time: 0,
        time_spent: {
          image: 0,
          video: 0,
          floor_plan: 0,
          brochure: 0,
        },
      };
    }

    // Iterate contact activity and get data
    for (let i = 0; i < contactActivities.length; i++) {
      const activity = contactActivities[i];
      const meta = JSON.parse(activity.dataValues.activity_meta);

      // check if Viewed Device is filled
      if (h.isEmpty(activity_summary.overall.device)) {
        activity_summary.overall.device =
          h.contactActivity.prettifyViewOnDeviceString(
            activity.dataValues.viewed_on_device,
          );
      }

      // check if location is filled
      if (h.isEmpty(activity_summary.overall.location)) {
        const geo = await geoip.lookup(activity.dataValues.activity_ip);
        if (h.notEmpty(geo)) {
          activity_summary.overall.location = h.general.formateLocationStr(geo);
        }
      }
      // handle contact activity types
      if (h.general.isProjectMediaTag(activity.dataValues.activity_type)) {
        send_email = true;
        let url = '';
        if (h.notEmpty(meta.image_url)) {
          url = meta.image_url;
        }
        if (h.notEmpty(meta.url)) {
          url = meta.url;
        }
        const media_tag = await projectMediaController.findOne(
          { URL: url },
          { include: models.project_media_tag },
        );
        let tag = '';
        if (h.notEmpty(media_tag)) {
          for (const mediaTagIndx in media_tag.project_media_tags) {
            const currTag =
              media_tag.project_media_tags[mediaTagIndx].dataValues.tag;
            if (currTag !== constant.PROPERTY.MEDIA.TAG.PROJECT) {
              tag = currTag;
            }
          }
          if (h.notEmpty(tag)) {
            // Update overall_time for property
            const prevTime =
              activity_summary.data[media_tag.project_fk].overall_time;
            activity_summary.data[media_tag.project_fk].overall_time =
              prevTime + meta.on_screen_duration;

            // Update time for tag
            const prevTimeTag =
              activity_summary.data[media_tag.project_fk].time_spent[tag];
            activity_summary.data[media_tag.project_fk].time_spent[tag] =
              prevTimeTag + meta.on_screen_duration;
          }
        }
      } else if (
        activity.dataValues.activity_type ===
        constant.CONTACT.ACTIVITY.TYPE.PROJECT_ADDITIONAL_FIELD_CLICKED
      ) {
        send_email = true;
        const projectId = shortlistProjToProjMap[meta.shortlisted_project_id];
        activity_summary.data[projectId][meta.fieldName] = 'Viewed';
      } else if (h.general.isMediaTag(activity.dataValues.activity_type)) {
        send_email = true;
        let url = '';
        if (h.notEmpty(meta.image_url)) {
          url = meta.image_url;
        }
        if (h.notEmpty(meta.url)) {
          url = meta.url;
        }
        const media_tag = await projectMediaController.findOne(
          { URL: url },
          { include: models.project_media_tag },
        );
        let tag = '';
        if (h.notEmpty(media_tag)) {
          tag = media_tag.project_media_tags[0].dataValues.tag;
          // Update overall_time for property
          const prevTime =
            activity_summary.data[media_tag.project_fk].properties[
              meta.shortlisted_property_id
            ].overall_time;
          activity_summary.data[media_tag.project_fk].properties[
            meta.shortlisted_property_id
          ].overall_time = prevTime + meta.on_screen_duration;

          // Update time for tag
          const prevTimeTag =
            activity_summary.data[media_tag.project_fk].properties[
              meta.shortlisted_property_id
            ].time_spent[tag];
          activity_summary.data[media_tag.project_fk].properties[
            meta.shortlisted_property_id
          ].time_spent[tag] = prevTimeTag + meta.on_screen_duration;
        }
      } else if (
        activity.dataValues.activity_type ===
        constant.CONTACT.ACTIVITY.TYPE.PROPERTY_RATED
      ) {
        send_email = true;
        activity_summary.data[
          propToProjMap[meta.shortlisted_property_id]
        ].properties[meta.shortlisted_property_id].rating =
          meta.property_rating;
      } else if (
        activity.dataValues.activity_type ===
        constant.CONTACT.ACTIVITY.TYPE.COMMENT_POSTED
      ) {
        send_email = true;
        const comment = await shortlistPropertyCommentController.findOne({
          shortlisted_property_comment_id: meta.shortlisted_property_comment_id,
        });
        activity_summary.data[
          propToProjMap[meta.shortlisted_property_id]
        ].properties[meta.shortlisted_property_id].comment =
          comment.dataValues.message;
      }
    }

    let subject_message = '';
    let body_message = '';

    subject_message = h.getMessageByCode(
      'template-3-minute-buyer-activity-summary-email-subject-1647832776541',
      {
        CONTACT_NAME:
          previousContactValues.first_name +
          ' ' +
          previousContactValues.last_name,
      },
    );

    body_message = h.getMessageByCode(
      'template-3-minute-buyer-activity-summary-email-front-body-1647832776541',
      {
        CONTACT_NAME:
          previousContactValues.first_name +
          ' ' +
          previousContactValues.last_name,
        AGENT_NAME: h.general.prettifyConstant(user.first_name),
        ACTIVITY_LOCATION: h.notEmpty(activity_summary.overall.location)
          ? activity_summary.overall.location
          : '-',
        ACTIVITY_DEVICE: h.notEmpty(activity_summary.overall.device)
          ? activity_summary.overall.device
          : '-',
      },
    );

    for (let i = 0; i < Object.keys(activity_summary.data).length; i++) {
      const project =
        activity_summary.data[Object.keys(activity_summary.data)[i]];
      const properties = project.properties;
      const projectDetails = project.project_details;
      const data = h.chartHelper.formatPieChartData(
        project,
        project.project_shown_images,
      );
      const pieChartUrl = await h.chartHelper.generatePieChart(data);

      // Project body start
      const project_message_start = h.getMessageByCode(
        'template-3-minute-buyer-activity-summary-email-project-start-1652660954105',
        {
          PROJECT_NAME: project.project_name,
        },
      );
      body_message = body_message + project_message_start;

      // Iterate through project details and add necessary project details
      for (const projDetsIdx in projectDetails) {
        const projectDetail = projectDetails[projDetsIdx];
        const project_message_row = h.getMessageByCode(
          'template-3-minute-buyer-activity-summary-email-project-project-field-row-1652660954105',
          {
            PROJECT_DETAIL_TITLE:
              constant.PROJECT.DETAILS_TITLE_EMAIL[projectDetail],
            PROJECT_DETAIL_CONTENT: project[projectDetail],
          },
        );
        body_message = body_message + project_message_row;
      }
      // Project body end
      const project_message_end = h.getMessageByCode(
        'template-3-minute-buyer-activity-summary-email-project-end-1652660954105',
        {
          PIE_CHART_URL: pieChartUrl,
        },
      );
      body_message = body_message + project_message_end;

      for (let j = 0; j < Object.keys(properties).length; j++) {
        const property = properties[Object.keys(properties)[j]];
        const propertyName = property.property_name;
        const rating = property.rating ? property.rating + '/5' : '-';
        const comment = property.comment ? property.comment : '-';
        const overallTime = h.general.prettifySeconds(property.overall_time);

        const data = h.chartHelper.formatPieChartData(
          property,
          property.property_shown_images,
        );

        const pieChartUrl = await h.chartHelper.generatePieChart(data);
        const property_message = h.getMessageByCode(
          'template-3-minute-buyer-activity-summary-email-property-1648622679295',
          {
            PROPERTY_NAME: propertyName,
            RATING: rating,
            COMMENT: comment,
            OVERALL_TIME: overallTime,
            PIE_CHART_URL: pieChartUrl,
          },
        );
        body_message = body_message + property_message;
      }
    }

    const end_body_message = h.getMessageByCode(
      'template-3-minute-buyer-activity-summary-email-end-body-1648620473739',
      {
        ACTIVITY_STREAM_LINK: `${config.webAdminUrl}/dashboard/leads/activity-stream`,
      },
    );
    body_message = body_message + end_body_message;

    // send emails if the conditions above are true and the contact has opted-in for email
    if (send_email) {
      await h.email.sendEmail(
        'Chaaat <no-reply@chaaat.io>',
        user.email,
        null,
        subject_message,
        body_message,
      );
    } else {
      fastify.log.info({
        functionName: funcName,
        message: `3-min-email not sent: No suitable contact activities found.`,
      });
    }
  };

  /**
   * Method to notify agent of the new activity
   * currently buyer link opened first time and rating given to a project
   * @param previousContactValues
   * @param activity_type
   * @param activity_meta
   * @returns {Promise<void>}
   */
  contactActivityController.notifyActivityToAgent = async (
    previousContactValues,
    activity_type,
    activity_meta,
  ) => {
    const funcName = 'contactActivityController.notifyActivityToAgent';
    h.validation.requiredParams(funcName, {
      previousContactValues,
      activity_type,
    });

    let send_email = false;
    let subject_message = '';
    let body_message = '';

    // get user details from contact
    const agency_user = await agencyUserController.findOne({
      agency_user_id: previousContactValues.agency_user_fk,
    });
    const user = await userController.findOne({ user_id: agency_user.user_fk });

    const contactName = h.general.combineFirstLastName(
      previousContactValues.first_name,
      previousContactValues.last_name,
      ' ',
    );

    switch (activity_type) {
      case constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED:
        await cronJobController.create(
          {
            type: constant.CRON_JOB.TYPES['3_MIN_AGENT_NOTIF'],
            payload: {
              previousContactValues,
              user,
            },
            created_by: previousContactValues.agency_user_fk,
          },
          {},
        );

        if (
          !h.cmpStr(
            previousContactValues.lead_status,
            constant.LEAD_STATUS.PROPOSAL_OPENED,
          ) &&
          !h.cmpStr(
            previousContactValues.lead_status,
            constant.LEAD_STATUS.UPDATED_PROPOSAL_OPENED,
          )
        ) {
          subject_message = h.getMessageByCode(
            'template-buyer-activity-link-opened-email-subject-1639636972368',
            {
              CONTACT_NAME: contactName,
            },
          );
          body_message = h.getMessageByCode(
            'template-buyer-activity-link-opened-email-body-1639636982147',
            {
              AGENT_NAME: h.general.prettifyConstant(user.first_name),
              CONTACT_NAME: contactName,
              ACTIVITY_TYPE: h.general.prettifyConstant(activity_type),
              ACTIVITY_STREAM_LINK: `${config.webAdminUrl}/dashboard/leads/activity-stream`,
            },
          );
          send_email = true;
        } else {
          // openning subsequent time
          subject_message = h.getMessageByCode(
            'template-buyer-activity-link-re-opened-email-subject-1639636972368',
            {
              CONTACT_NAME: contactName,
            },
          );
          body_message = h.getMessageByCode(
            'template-buyer-activity-link-re-opened-email-body-1639636982147',
            {
              AGENT_NAME: h.general.prettifyConstant(user.first_name),
              CONTACT_NAME: contactName,
              ACTIVITY_TYPE: h.general.prettifyConstant(activity_type),
              ACTIVITY_STREAM_LINK: `${config.webAdminUrl}/dashboard/leads/activity-stream`,
            },
          );
          send_email = true;
        }

        break;
      case constant.CONTACT.ACTIVITY.TYPE.PROPERTY_RATED:
        {
          // get json from string activity meta
          const parsedActivityMeta = JSON.parse(activity_meta);
          let previousPropertyRating = 'None';

          // get project details
          const shortlistedProperty =
            await shortListedPropertyController.findOne({
              shortlisted_property_id:
                parsedActivityMeta.shortlisted_property_id,
            });
          const projectProperty = await projectPropertyController.findOne({
            project_property_id: shortlistedProperty.project_property_fk,
          });
          const project = await projectController.findOne({
            project_id: projectProperty.project_fk,
          });

          // try to find 2 latest activities with property_rated, to get the previous rating.
          const contactActivity = await contactActivityModel.findAll({
            where: {
              activity_type: activity_type,
              activity_meta: {
                [Op.like]: `%"shortlisted_property_id":"${parsedActivityMeta.shortlisted_property_id}"%`,
              },
            },
            limit: 2,
            order: [['created_date', 'DESC']],
          });

          // get previous rating score
          if (contactActivity.length > 1) {
            try {
              previousPropertyRating = JSON.parse(
                contactActivity[1].activity_meta,
              ).property_rating;
            } catch (err) {
              console.log(
                `${funcName}: Previous rating exists but has no meta data, lead score not changed`,
                err,
              );
            }
          }

          const project_unit = h.notEmpty(projectProperty.unit_number)
            ? `#${projectProperty.unit_number} |`
            : '';
          const number_of_bedroom = h.notEmpty(
            projectProperty.number_of_bedroom,
          )
            ? `${projectProperty.number_of_bedroom} bedroom${
                projectProperty.number_of_bedroom > 1 ? 's' : ''
              } |`
            : '';
          const number_of_bathroom = h.notEmpty(
            projectProperty.number_of_bathroom,
          )
            ? `${projectProperty.number_of_bathroom} bathroom${
                projectProperty.number_of_bathroom > 1 ? 's' : ''
              } |`
            : '';
          const property_price = h.notEmpty(projectProperty.starting_price)
            ? ` ${project.currency_code} ${h.currency.format(
                projectProperty.starting_price,
                0,
              )} `
            : '';
          // format property name
          const fullPropertyName = `${project.name} | ${project_unit} ${number_of_bedroom} ${number_of_bathroom} ${property_price}`;

          subject_message = h.getMessageByCode(
            'template-buyer-activity-property-rated-email-subject-1640063289002',
            {
              CONTACT_NAME: contactName,
            },
          );
          body_message = h.getMessageByCode(
            'template-buyer-activity-property-rated-email-body-1639636982147',
            {
              AGENT_NAME: h.general.prettifyConstant(user.first_name),
              CONTACT_NAME: contactName,
              PROPERTY_NAME: fullPropertyName,
              ACTIVITY_TYPE: h.general.prettifyConstant(activity_type),
              PREVIOUS_RATING: previousPropertyRating,
              NEW_RATING: parsedActivityMeta.property_rating,
              ACTIVITY_STREAM_LINK: `${config.webAdminUrl}/dashboard/leads/activity-stream`,
            },
          );
          send_email = true;
        }
        break;
      case constant.CONTACT.ACTIVITY.TYPE.PROJECT_RATED:
        {
          // get json from string activity meta
          const parsedActivityMeta = JSON.parse(activity_meta);
          let previousProjectRating = 'None';

          // get project details
          const shortlistedProject =
            await shortListedPropertyController.findOne({
              shortlisted_property_id:
                parsedActivityMeta.shortlisted_property_id,
            });

          const project = await projectController.findOne({
            project_id: shortlistedProject.project_fk,
          });

          // try to find 2 latest activities with property_rated, to get the previous rating.
          const contactActivity = await contactActivityModel.findAll({
            where: {
              activity_type: activity_type,
              activity_meta: {
                [Op.like]: `%"shortlisted_project_id":"${parsedActivityMeta.shortlisted_project_id}"%`,
              },
            },
            limit: 2,
            order: [['created_date', 'DESC']],
          });

          // get previous rating score
          if (contactActivity.length > 1) {
            try {
              previousProjectRating = JSON.parse(
                contactActivity[1].activity_meta,
              ).property_rating;
            } catch (err) {
              console.log(
                `${funcName}: Previous rating exists but has no meta data, lead score not changed`,
                err,
              );
            }
          }

          // format property name
          const fullPropertyName = `${project.name}`;

          subject_message = h.getMessageByCode(
            'template-buyer-activity-project-rated-email-subject-1640063289002',
            {
              CONTACT_NAME: contactName,
            },
          );
          body_message = h.getMessageByCode(
            'template-buyer-activity-project-rated-email-body-1639636982147',
            {
              AGENT_NAME: h.general.prettifyConstant(user.first_name),
              CONTACT_NAME: contactName,
              PROPERTY_NAME: fullPropertyName,
              ACTIVITY_TYPE: h.general.prettifyConstant(activity_type),
              PREVIOUS_RATING: previousProjectRating,
              NEW_RATING: parsedActivityMeta.project_rating,
              ACTIVITY_STREAM_LINK: `${config.webAdminUrl}/dashboard/leads/activity-stream`,
            },
          );
          send_email = true;
        }
        break;
      default:
        send_email = false;
        break;
    }

    // send emails if the conditions above are true and the contact has opted-in for email
    if (send_email && previousContactValues.agent_email_preference) {
      await h.email.sendEmail(
        'Chaaat <no-reply@chaaat.io>',
        user.email,
        null,
        subject_message,
        body_message,
      );
    }
  };
  return contactActivityController;
};
