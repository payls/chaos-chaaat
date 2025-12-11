const axios = require('axios');
const config = require('../configs/config')(process.env.NODE_ENV);

const headers = {
  'API-Key': config.mindbody.apiKey,
  SiteId: config.mindbody.siteId,
};

class MindBodyAPI {
  constructor(SiteId, ApiKey) {
    this.headers = {
      'API-Key': ApiKey,
      SiteId,
    };
  }

  async getStaffToken(Username, Password) {
    const axiosConfig = {
      method: 'POST',
      url: `https://api.mindbodyonline.com/public/v6/usertoken/issue`,
      headers: this.headers,
      data: {
        Username,
        Password,
      },
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async createMindBodyWebhook(agencyId) {
    const axiosConfig = {
      method: 'POST',
      url: `https://push-api.mindbodyonline.com/api/v1/subscriptions`,
      headers: this.headers,
      data: {
        eventSchemaVersion: 1,
        eventIds: [
          'appointmentBooking.created',
          'client.created',
          'client.updated',
          'client.deactivated',
          'clientMembershipAssignment.created',
          'classRosterBooking.created',
          'classRosterBookingStatus.updated',
          'classRosterBooking.cancelled',
        ],
        referenceId: agencyId,
        webhookUrl: `${config.mindbody.webhookUrl}/v1/services/mindbody-webhook?agencyId=${agencyId}`,
      },
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async activateMinBodyWebhook(subscriptionId) {
    const axiosConfig = {
      method: 'PATCH',
      url: `https://push-api.mindbodyonline.com/api/v1/subscriptions/${subscriptionId}`,
      headers: this.headers,
      data: {
        status: 'Active',
      },
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async deactivateMinBodyWebhook(subscriptionId) {
    const axiosConfig = {
      method: 'DELETE',
      url: `https://push-api.mindbodyonline.com/api/v1/subscriptions/${subscriptionId}`,
      headers: this.headers,
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getAllClients(params, token) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/client/clients`,
      headers: { ...this.headers, Authorization: token },
      params,
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getClientVisits(params) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/client/clientvisits`,
      headers: this.headers,
      params,
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getClientCompleteInfo(params) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/client/clientcompleteinfo`,
      headers: this.headers,
      params,
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getClientContracts({
    limits = 100,
    offset = 0,
    clientId,
    crossRegionalLookup = false,
  }) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/client/clientcontracts`,
      headers: this.headers,
      params: {
        limits,
        offset,
        clientId,
        crossRegionalLookup,
      },
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getActiveMemberships({ limits = 100, offset = 0, clientId }) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/client/activeclientmemberships`,
      headers: this.headers,
      params: {
        limits,
        offset,
        clientId,
      },
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getPackages({ limits = 100, offset = 0 }) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/sale/packages`,
      headers: this.headers,
      params: {
        limits,
        offset,
      },
    };
    const response = await axios(axiosConfig);
    return response.data;
  }

  async getContracts({ token, limits = 100, offset = 0 }) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/sale/contracts`,
      headers: { ...this.headers, Authorization: token },
      params: {
        limits,
        offset,
        locationid: 1,
      },
    };

    const response = await axios(axiosConfig);
    return response.data;
  }

  async getServices({ token, limits = 100, offset = 0 }) {
    const axiosConfig = {
      method: 'get',
      url: `${config.mindbody.baseUrl}/sale/services`,
      headers: { ...this.headers, Authorization: token },
      params: {
        limits,
        offset,
        locationid: 1,
      },
    };

    const response = await axios(axiosConfig);
    return response.data;
  }

  async getSubscription(subscriptionId) {
    const axiosConfig = {
      method: 'get',
      url: `https://push-api.mindbodyonline.com/api/v1/subscriptions/${subscriptionId}`,
      headers: { ...this.headers },
    };

    const response = await axios(axiosConfig);
    return response.data;
  }
}

module.exports = MindBodyAPI;
