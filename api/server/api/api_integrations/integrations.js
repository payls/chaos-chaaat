const Axios = require('axios');
const config = require('../../configs/config')(process.env.NODE_ENV);
const h = require('../../helpers');

const integrationsApi = module.exports;

integrationsApi.getAgencyUserActiveIntegrations = async (request, data) => {
  const response = await Axios.get(
    `${config.apiIntegrationsUrl}/v1/staff/integrations/tray/get-agency-user-active-integrations?agency_user_id=${data.agency_user_id}&agency_fk=${data.agency_fk}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: h.general.getAccessToken(request),
      },
    },
  );

  return h.api.handleApiResponse(response);
};
