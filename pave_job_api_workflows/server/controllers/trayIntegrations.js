const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeTrayIntegrationsController = (models) => {
  const {
    agency_user_tray: agencyUserTrayModel,
    agency_user_tray_solution: agencyUserTraySolutionModel,
  } = models;

  const trayIntegrationsController = {};

  trayIntegrationsController.getWebhook = async (
    agency_user_id,
    service_name,
  ) => {
    const funcName = 'trayIntegrationsController.getWebhook';

    h.validation.requiredParams(funcName, { agency_user_id, service_name });

    try {
      let webhook;
      // find the tray connections with agency_user
      const agency_user_tray = await agencyUserTrayModel.findOne({
        where: { agency_user_fk: agency_user_id },
      });

      if (h.notEmpty(agency_user_tray)) {
        // find the relevant instance with service name in tray solutions
        const agency_user_tray_solution =
          await agencyUserTraySolutionModel.findOne({
            where: {
              agency_user_tray_fk: agency_user_tray.agency_user_tray_id,
            },
            tray_user_solution_source_type: service_name,
            tray_user_solution_instance_status:
              constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE,
          });

        // if everything is alright, assign the webhook value
        // NOTE: The webhook value is parsed but the relevant information
        // still need to be accessed in the parent method on the other end
        if (
          h.notEmpty(agency_user_tray_solution) &&
          h.notEmpty(
            agency_user_tray_solution.tray_user_solution_instance_webhook_trigger,
          )
        ) {
          webhook = JSON.parse(
            agency_user_tray_solution.tray_user_solution_instance_webhook_trigger,
          );
        }
      }
      return webhook;
    } catch (error) {
      console.log(`${funcName}: ${error}`);
      return null;
    }
  };

  return trayIntegrationsController;
};
