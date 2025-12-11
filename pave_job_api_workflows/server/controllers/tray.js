const axios = require('axios');
const h = require('../helpers');
const constant = require('../constants/constant.json');
const environment = process.env.NODE_ENV;
const config = require('../configs/config')(environment);
const EMBEDDED_ID = process.env.TRAY_EMBEDDED_ID;
const { Op } = require('sequelize');

module.exports.makeTrayIntegrationsController = (models) => {
  const trayIntegrationsController = {};

  const {
    agency: agencyModel,
    agency_user_tray: agencyUserTrayModel,
    agency_user_tray_solution: agencyUserTraySolutionModel,
  } = models;
  /**
   * Connect Pave User to Tray HubSpot Service
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.connectUserToTray = async (
    agencyUser,
    integration,
  ) => {
    let SOLUTION_ID = null;
    let SOURCE_TYPE = null;
    let externalAuthId = null;
    let isWhiteLabelledUrl = false;

    switch (integration) {
      case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT:
        SOLUTION_ID = config.tray.hubspot;
        SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT;
        externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.HUBSPOT;
        isWhiteLabelledUrl = true;
        break;

      case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL:
        SOLUTION_ID = config.tray.gmail;
        SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL;
        externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.GMAIL;
        isWhiteLabelledUrl = false;
        break;

      case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK:
        SOLUTION_ID = config.tray.outlook;
        SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK;
        externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.OUTLOOK;
        isWhiteLabelledUrl = false;
        break;

      case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE:
        SOLUTION_ID = config.tray.salesforce;
        SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE;
        externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.SALESFORCE;
        isWhiteLabelledUrl = false;
        break;

      default:
        break;
    }

    return await h.database.transaction(async (transaction) => {
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
            'User already exists in Tray Database. Skipping user creation',
          );
          console.log('Fetching User from Tray Database now......');
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
            SOLUTION_ID,
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
        // const trayIntegrationURL = isWhiteLabelledUrl
        //   ? `https://yourpave.integration-configuration.com/external/auth/create/${EMBEDDED_ID}/${updated_solution_instance_id.id}/${externalAuthId}?code=${config_wizard_id}&skipTitleField=true&skipAuthSettings=true`
        //   : `https://embedded.tray.io/external/auth/create/${EMBEDDED_ID}/${updated_solution_instance_id.id}/${externalAuthId}?code=${config_wizard_id}&skipTitleField=true&skipAuthSettings=true`;

        const trayIntegrationURL = isWhiteLabelledUrl
          ? `https://yourpave.integration-configuration.com/external/auth/create/${EMBEDDED_ID}/${updated_solution_instance_id.id}/${externalAuthId}?code=${config_wizard_id}&skipTitleField=true&skipAuthSettings=true`
          : `https://embedded.tray.io/external/auth/create/${EMBEDDED_ID}/${updated_solution_instance_id.id}/${externalAuthId}?code=${config_wizard_id}&skipTitleField=true&skipAuthSettings=true`;

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
          tray_user_solution_id: SOLUTION_ID,
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
            'No Record Found in DB of Tray User. Creating 1 now.....',
          );
          await agencyUserTrayModel.findOrCreate({
            where: {
              agency_user_fk: agency_user_id,
              tray_user_fk: id,
            },
            defaults: {
              ...agencyUserTrayRecordPayload,
            },
            transaction,
          });

          await agencyUserTraySolutionModel.create(
            {
              ...agencyUserTraySolutionRecord,
            },
            {
              transaction,
            },
          );
        } else {
          console.log(
            'Tray User Already present in Pave Database. Updating Entry in Pave Database\n',
          );
          await agencyUserTrayModel.update(
            {
              ...agencyUserTrayRecordPayload,
              agency_user_tray_id: agencyUserTrayRecord.agency_user_tray_id,
            },
            {
              where: {
                agency_user_fk: agency_user_id,
                tray_user_fk: id,
              },
              transaction,
            },
          );

          console.log(
            'Executing Find or Create in Agency User Tray Solutions\n',
          );
          await agencyUserTraySolutionModel.findOrCreate({
            where: {
              agency_user_tray_fk: agencyUserTrayRecord.agency_user_tray_id,
              tray_user_solution_source_type: SOURCE_TYPE,
            },
            defaults: {
              ...agencyUserTraySolutionRecord,
              agency_user_tray_fk: agencyUserTrayRecord.agency_user_tray_id,
            },
            transaction,
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
              transaction,
            },
          );
        }

        console.log(
          'All entries Mapped to Pave Database. Returning config URL now.....',
        );

        console.log(`TRAY_INTEGRATION_URL: `, trayIntegrationURL);

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
  trayIntegrationsController.tieAuthToTrayUser = async (
    agency_user,
    auth,
    integration,
  ) => {
    try {
      const { agencyUser } = agency_user;
      const { authId } = auth;
      let sourceWorkflowNames;
      let externalAuthId;
      const agency_user_tray = await agencyUserTrayModel.findOne({
        where: { agency_user_fk: agencyUser.agency_user_id },
      });
      const agency_user_tray_solution =
        await agencyUserTraySolutionModel.findOne({
          where: {
            agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
            tray_user_solution_source_type: integration,
          },
        });

      switch (integration) {
        case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT:
          sourceWorkflowNames = [
            {
              key: 'full_sync',
              value: config.trayWebhookWorkflowNames.hubspot.fullSync,
            },
            {
              key: 'create_engagements',
              value: config.trayWebhookWorkflowNames.hubspot.createEngagements,
            },
          ];
          externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.HUBSPOT;
          break;

        case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL:
          sourceWorkflowNames = [
            {
              key: 'send_email',
              value: config.trayWebhookWorkflowNames.gmail.sendEmail,
            },
          ];
          externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.GMAIL;
          break;

        case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK:
          sourceWorkflowNames = [
            {
              key: 'send_email',
              value: config.trayWebhookWorkflowNames.outlook.sendEmail,
            },
          ];
          externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.OUTLOOK;
          break;

        case constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE:
          sourceWorkflowNames = [
            {
              key: 'full_sync',
              value: config.trayWebhookWorkflowNames.salesforce.fullSync,
            },
            {
              key: 'create_engagements',
              value:
                config.trayWebhookWorkflowNames.salesforce.createEngagements,
            },
          ];
          externalAuthId = constant.TRAY.EXTERNAL_AUTH_IDS.SALESFORCE;
          break;

        default:
          break;
      }

      const updated_solution_instance_id =
        await trayIntegrationsController.addAuthToSolutionInstance(
          agency_user_tray.tray_user_fk_master_token,
          agency_user_tray_solution.tray_user_solution_instance_id,
          authId,
          externalAuthId,
        );

      if (updated_solution_instance_id) {
        const triggerUrl = {};
        updated_solution_instance_id.workflows.edges.forEach((index) => {
          sourceWorkflowNames.forEach((sourceWorkFlowName) => {
            if (
              h.cmpStr(index.node.sourceWorkflowName, sourceWorkFlowName.value)
            ) {
              triggerUrl[sourceWorkFlowName.key] = index.node.triggerUrl;
            }
          });
        });

        const jsonizedTriggerUrl = JSON.stringify(triggerUrl);
        await agencyUserTraySolutionModel.update(
          {
            tray_user_solution_instance_auth: authId,
            tray_user_solution_instance_status:
              constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
            tray_user_solution_instance_webhook_trigger: jsonizedTriggerUrl,
          },
          {
            where: {
              agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
              tray_user_solution_source_type: integration,
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
   * Delete Agency User HubSpot Solution from both Tray And Pave
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.deleteAgencyUserTraySolution = async (
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
          // agency_user_tray_solution.map(async (item) => {
          //     const deletedSolution = await trayIntegrationsController.deleteAgencyUserTraySolution(agency_user_tray.tray_user_fk_master_token, item.tray_user_solution_instance_id);

          // })
        } else {
          const { tray_user_solution_instance_id } =
            agency_user_tray_solution[0];
          console.log(
            'Solution instance id is',
            tray_user_solution_instance_id,
          );
          // Refreshing user token and then updating the DB to make sure token is not expired for disconnect operation
          const tray_user_master_token =
            await trayIntegrationsController.createUserMasterToken(
              agency_user_tray.tray_user_fk,
            );
          await agencyUserTrayModel.update(
            { tray_user_fk_master_token: tray_user_master_token },
            {
              where: {
                agency_user_fk: agency_user_id,
                tray_user_fk: agency_user_tray.tray_user_fk,
              },
            },
          );

          const deletedSolution =
            await trayIntegrationsController.deleteAgencyUserTraySolutionGraphQL(
              tray_user_master_token,
              tray_user_solution_instance_id,
            );
          // Once solution at tray is deleted mark it as deleted at pave database
          if (!h.isEmpty(deletedSolution)) {
            await agencyUserTraySolutionModel.update(
              {
                tray_user_solution_instance_status:
                  constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.INACTIVE,
              },
              {
                where: {
                  agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
                  tray_user_solution_source_type,
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
   * Create User In Tray
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.createUserInTray = async (
    agency_fk,
    agency_user_id,
    user,
  ) => {
    const { first_name, last_name, email } = user;
    const set_tray_user_name = `${environment}+${first_name}+${last_name}+${email}+${agency_fk}`;
    const graphQlQuery = {
      query: `
                  mutation($externalUserId: String!, $name: String!) {
                      createExternalUser(input: { name: $name, externalUserId: $externalUserId }) {
                          userId
                      }
                  }
              `,
      variables: { name: set_tray_user_name, externalUserId: agency_user_id },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${process.env.TRAY_MASTER_TOKEN}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return { data: response.data.data };
      } else {
        throw new Error(
          'Failed to create user in tray. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  trayIntegrationsController.createUserMasterToken = async (id) => {
    const graphQlQuery = {
      query: `mutation ($userId: ID!) {
                  authorize(input: {
                      userId: $userId
                  }) {
                      accessToken
                  }
              }`,
      variables: { userId: id },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${process.env.TRAY_MASTER_TOKEN}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return response.data.data.authorize.accessToken;
      } else {
        throw new Error(
          'Failed to create user master token. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  trayIntegrationsController.createConfigWizardAuthorization = async (
    tray_user_id,
  ) => {
    const graphQlQuery = {
      query: `
                  mutation ($userId: ID!) {
                      generateAuthorizationCode( input: {
                          userId: $userId
                      }) {
                          authorizationCode
                      }
                  }
              `,
      variables: { userId: tray_user_id },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${process.env.TRAY_MASTER_TOKEN}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return response.data.data.generateAuthorizationCode.authorizationCode;
      } else {
        throw new Error(
          'Failed to get config wizard token from tray. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * Get all active agency user Integrations
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.getActiveAgencyUserIntegrations = async (
    agency_user_id,
    agency_fk,
  ) => {
    const defaultpayload = {
      hubspot: constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.INACTIVE,
      gmail: constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.INACTIVE,
      outlook: constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.INACTIVE,
      salesforce: constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.INACTIVE,
    };
    const finalNonOrganisationalIntegrationPayload = {};
    const finalOrganisationalIntegrationPayload = {};
    const connectionOwners = {};

    // Tag non-organisational based connections
    const agency_user_tray = await agencyUserTrayModel.findOne({
      where: { agency_user_fk: agency_user_id },
      include: [
        {
          model: models.agency_user_tray_solution,
          required: true,
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  {
                    tray_user_solution_source_type:
                      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL,
                  },
                  {
                    tray_user_solution_instance_status:
                      constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
                  },
                ],
              },
              {
                [Op.and]: [
                  {
                    tray_user_solution_source_type:
                      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK,
                  },
                  {
                    tray_user_solution_instance_status:
                      constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
                  },
                ],
              },
            ],
          },
        },
      ],
    });

    if (!h.isEmpty(agency_user_tray)) {
      const agency_user_tray_solution =
        agency_user_tray.agency_user_tray_solutions;
      if (!h.isEmpty(agency_user_tray_solution)) {
        agency_user_tray_solution.forEach((index) => {
          finalNonOrganisationalIntegrationPayload[
            index.tray_user_solution_source_type.toLowerCase()
          ] = index.dataValues.tray_user_solution_instance_status;
          connectionOwners[index.tray_user_solution_source_type.toLowerCase()] =
            agency_user_tray.agency_user_fk;
        });
      }
    }

    // Tag organisational based CRM connections
    const agency = await agencyModel.findOne({
      where: { agency_id: agency_fk },
      include: [
        {
          model: models.agency_user,
          required: true,
        },
      ],
    });

    const usersBelongingToAgency = [];
    agency.agency_users.forEach((element) => {
      usersBelongingToAgency.push(element.agency_user_id);
    });

    const agencyCRMConnections = await agencyUserTrayModel.findAll({
      where: {
        agency_user_fk: [usersBelongingToAgency],
      },
      include: [
        {
          model: models.agency_user_tray_solution,
          required: true,
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  {
                    tray_user_solution_source_type:
                      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT,
                  },
                  {
                    tray_user_solution_instance_status:
                      constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
                  },
                ],
              },
              {
                [Op.and]: [
                  {
                    tray_user_solution_source_type:
                      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE,
                  },
                  {
                    tray_user_solution_instance_status:
                      constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
                  },
                ],
              },
            ],
          },
        },
      ],
    });

    const activeCRMConnectedSolutions = [];
    agencyCRMConnections.forEach((element) => {
      element.agency_user_tray_solutions.forEach((data) => {
        const payload = {
          agency_user_fk: element.agency_user_fk,
          agency_user_tray_fk: data.agency_user_tray_fk,
          tray_user_solution_source_type: data.tray_user_solution_source_type,
          tray_user_solution_instance_status:
            data.tray_user_solution_instance_status,
        };
        activeCRMConnectedSolutions.push(payload);
      });
    });

    activeCRMConnectedSolutions.forEach((index) => {
      finalOrganisationalIntegrationPayload[
        index.tray_user_solution_source_type.toLowerCase()
      ] = index.tray_user_solution_instance_status;
      connectionOwners[index.tray_user_solution_source_type.toLowerCase()] =
        index.agency_user_fk;
    });

    const payload = {
      ...defaultpayload,
      ...finalNonOrganisationalIntegrationPayload,
      ...finalOrganisationalIntegrationPayload,
      connectionOwners: {
        ...connectionOwners,
      },
    };

    return payload;
  };

  /**
   * Create Solution Instance in Tray for User
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.createSolutionInstanceForUser = async (
    agency_fk,
    agency_user_id,
    user,
    solution_id,
    tray_user_master_token,
    agencyUser,
  ) => {
    const { first_name, last_name, email } = user;
    const set_tray_user_solution_instance_name = `${environment}+${first_name}+${last_name}+${email}+${agency_fk}`;
    const graphQlQuery = {
      query: `
                  mutation ($solutionId: ID!, $instanceName: String!, $configValues: [ConfigValue!]){
                      createSolutionInstance(input: {
                          solutionId: $solutionId,
                          instanceName: $instanceName,
                          configValues: $configValues
                      }) {
                              solutionInstance {
                              id
                              name
                              enabled
                              created
                              authValues {
                                  authId
                                  externalId
                              }
                              configValues {
                                  value
                                  externalId
                              }
                              solution {
                                  id
                                  title
                                  description
                                  tags
                              }
                              workflows {
                                  edges {
                                      node {
                                          id
                                          sourceWorkflowId
                                          sourceWorkflowName
                                          triggerUrl
                                      }
                                  }
                              }
                              solutionVersionFlags {
                                  hasNewerVersion
                                  requiresUserInputToUpdateVersion
                                  requiresSystemInputToUpdateVersion
                              }
                          }
                      }
                  }
              `,
      variables: {
        solutionId: solution_id,
        instanceName: set_tray_user_solution_instance_name,
        configValues: [
          {
            externalId: 'external_agency_user',
            value: JSON.stringify(agencyUser),
          },
          {
            externalId: 'external_pave_api_integrations_url',
            value: JSON.stringify(config.apiIntegrationsUrl),
          },
        ],
      },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${tray_user_master_token}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return response.data.data.createSolutionInstance.solutionInstance;
      } else {
        throw new Error(
          'Failed to create solution instance for user. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * Delete Agency Users Solution in Tray
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.deleteAgencyUserTraySolutionGraphQL = async (
    trayUserFkMasterToken,
    solutionInstanceId,
  ) => {
    const graphQlQuery = {
      query: `
              mutation {
                  removeSolutionInstance(input: {
                      solutionInstanceId: "${solutionInstanceId}",
                  }) {
                      clientMutationId
                  }
              }
          `,
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${trayUserFkMasterToken}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(
          'Failed to delete user solution from tray. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * Delete Entire Agency User From Tray
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.deleteAgencyUserFromTray = async (
    tray_user_id,
  ) => {
    const graphQlQuery = {
      query: `
              mutation($userInput: RemoveExternalUserInput!) {
                  removeExternalUser(input: $userInput) {
                      clientMutationId # REQUIRED - must specify as return field, not required to provide this in mutation function
                  }
              }
          `,
      variables: {
        userInput: {
          userId: tray_user_id,
        },
      },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${process.env.TRAY_MASTER_TOKEN}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        console.log(response.data.errors);
        return { data: response.data.data };
      } else {
        throw new Error(
          'Failed to get user from tray. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * List All Available Solutions In Tray
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.listAllAvailableSolutions = async () => {
    const graphQlQuery = {
      query: `
              query {
                  viewer {
                      solutions {
                          edges {
                              node {
                              id
                              title
                              description
                              tags
                              customFields {
                                  key
                                  value
                              }
                              configSlots {
                                  externalId
                                  title
                                  defaultValue
                              }

                              }
                              cursor
                          }
                          pageInfo {
                              hasNextPage
                              endCursor
                              hasPreviousPage
                              startCursor
                          }
                      }
                  }
              }
          `,
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${process.env.TRAY_MASTER_TOKEN}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return { data: response.data.data };
      } else {
        throw new Error(
          'Failed to get user from tray. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * Add Authentication to Solution Instance
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.addAuthToSolutionInstance = async (
    tray_user_master_token,
    solution_instance_id,
    authId,
    externalId,
  ) => {
    const graphQlQuery = {
      query: `   mutation ($solutionInstanceId: ID!, $enabled: Boolean!, $authValues: [AuthValue!]) {
                  updateSolutionInstance(input: {
                      solutionInstanceId: $solutionInstanceId,
                      enabled: $enabled,
                      authValues: $authValues
                  }) {
                      solutionInstance {
                          id
                          name
                          enabled
                          authValues {
                              externalId
                              authId
                          }
                          created
                          workflows {
                              edges {
                                  node {
                                      triggerUrl
                                      id
                                      sourceWorkflowId
                                      sourceWorkflowName
                                  }
                              }
                }       
                      }
                  }
              }
          `,
      variables: {
        solutionInstanceId: solution_instance_id,
        enabled: true,
        authValues: {
          externalId: externalId,
          authId: authId,
        },
      },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${tray_user_master_token}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return response.data.data.updateSolutionInstance.solutionInstance;
      } else {
        throw new Error(
          'Failed to create solution instance for user. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * Update Solution Instance for User
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.activateUpdateSolutionInstanceForUser = async (
    agency_fk,
    agency_user_id,
    user,
    tray_user_master_token,
    solution_instance_id,
  ) => {
    const { first_name, last_name, email } = user;
    const solution_instance_name = `${environment}+${first_name}+${last_name}+${email}+${agency_fk}`;
    const graphQlQuery = {
      query: `   mutation ($solutionInstanceId: ID!, $instanceName: String!, $enabled: Boolean!) {
                      updateSolutionInstance(input: {
                          solutionInstanceId: $solutionInstanceId,
                          instanceName: $instanceName,
                          enabled: $enabled
                      }) {
                          solutionInstance {
                              id
                              name
                              enabled
                              created
                          }
                      }
                  }
              `,
      variables: {
        solutionInstanceId: solution_instance_id,
        instanceName: solution_instance_name,
        enabled: true,
      },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${tray_user_master_token}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return response.data.data.updateSolutionInstance.solutionInstance;
      } else {
        throw new Error(
          'Failed to create solution instance for user. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /**
   * Get User From Tray
   * @returns {Promise<Object>}
   */
  trayIntegrationsController.getUserFromTray = async (agency_user_id) => {
    const graphQlQuery = {
      query: `query($userCriteria: UserSearchCriteria){
                      users (criteria: $userCriteria){
                          edges {
                              node {
                                  name
                                  id
                                  externalUserId
                              }
                              cursor
                          }
                          pageInfo {
                              hasNextPage
                              endCursor
                              hasPreviousPage
                              startCursor
                          }
                      }
                  }`,
      variables: { userCriteria: { externalUserId: agency_user_id } },
    };

    const axiosConfig = {
      method: 'post',
      url: `https://tray.io/graphql`,
      data: graphQlQuery,
      headers: { Authorization: `Bearer ${process.env.TRAY_MASTER_TOKEN}` },
    };

    try {
      const response = await axios(axiosConfig);
      if (response.status === 200) {
        return { data: response.data.data };
      } else {
        throw new Error(
          'Failed to get user from tray. GraphQL request to tray failed',
        );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  return trayIntegrationsController;
};
