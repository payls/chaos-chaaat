const constant = require('../constants/constant.json');
const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
const GMAIL_SOLUTION_ID = config.tray.gmail;
const SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL;
const EMBEDDED_ID = process.env.TRAY_EMBEDDED_ID;

module.exports.makeGmailController = (models) => {
  const {
    agency_user_tray: agencyUserTrayModel,
    agency_user_tray_solution: agencyUserTraySolutionModel,
  } = models;

  const trayIntegrationsController =
    require('./tray').makeTrayIntegrationsController(models);

  const gmailController = {};

  /**
   * Delete Agency User Gmail Solution from both Tray And Pave
   * @returns {Promise<Object>}
   */
  gmailController.deleteAgencyUserGmailSolution = async (
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
   * Connect Pave User to Tray Gmail Service
   * @returns {Promise<Object>}
   */
  gmailController.connectUserToTrayGmail = async (agencyUser) => {
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

        // Step 5 - Create Solution Instance for the user
        const solution_instance_id =
          await trayIntegrationsController.createSolutionInstanceForUser(
            agency_fk,
            agency_user_id,
            user,
            GMAIL_SOLUTION_ID,
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
        const trayIntegrationURL = `https://embedded.tray.io/external/auth/create/${EMBEDDED_ID}/${updated_solution_instance_id.id}/external_gmail_authentication?code=${config_wizard_id}&skipTitleField=true&skipAuthSettings=true`;
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
          tray_user_solution_id: GMAIL_SOLUTION_ID,
          tray_user_solution_source_type: SOURCE_TYPE,
          tray_user_solution_instance_id: solution_instance_id.id,
          tray_user_solution_instance_status:
            constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING,
          created_by: agency_user_id,
          updated_by: agency_user_id,
        };

        // Step 8 - Check if the record exists in pave database
        const agencyUserTrayRecord = await agencyUserTrayModel.findOne({
          where: { agency_user_fk: agency_user_id, tray_user_fk: id },
        });

        // Step 9 - If not create the record else just update the master token
        if (agencyUserTrayRecord === null) {
          console.log(
            'Tray user not found in Pave Database. Making Entry in Pave Database',
          );
          await agencyUserTrayModel.findOrCreate({
            where: {
              agency_user_fk: agency_user_id,
              tray_user_fk: id,
            },
            defaults: {
              ...agencyUserTrayRecordPayload,
            },
            globalTransaction,
          });

          await agencyUserTraySolutionModel.create(
            {
              ...agencyUserTraySolutionRecord,
            },
            { globalTransaction },
          );
        } else {
          console.log(
            'Tray User Already present in Pave Database. Updating Entry in Pave Database\n',
          );
          console.log('Updating Agency User Tray Record\n');
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
              globalTransaction,
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
  gmailController.tieGmailAuthToTrayUser = async (agency_user, auth) => {
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
        await trayIntegrationsController.addAuthToGmailSolutionInstance(
          agency_user_tray.tray_user_fk_master_token,
          agency_user_tray_solution.tray_user_solution_instance_id,
          authId,
        );
      if (updated_solution_instance_id) {
        let triggerUrl = '';
        updated_solution_instance_id.workflows.edges.forEach((index) => {
          if (
            h.cmpStr(index.node.sourceWorkflowName, '(Gmail) Send Email - Pave')
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

  return gmailController;
};
