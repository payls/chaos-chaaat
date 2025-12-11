const cryptoHelper = require('./cryptoHelper');
const axios = require('axios');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const models = require('../models');
const config = require('../configs/config')(process.NODE_ENV)

/**
 * Class Representing OutlookCalendarHelper
 */
class OutlookCalendarHelper {
  /**
   * Create a OutlookCalendarHelper
   * @param {{
   *  encryption_iv: string,
   *  encryption_key: string,
   *  agencyOauth: object,
   *  secrets: object
   * }} 
   * @returns {OutlookCalendarHelper} 
   */
  constructor({ encryption_iv, encryption_key, agencyOauth, secrets }) {
    try {
      this.secrets = secrets;
      this.encryption_iv = encryption_iv;
      this.encryption_key = encryption_key;
      this.agencyOauth = agencyOauth;
      this.decrypted_access_info = JSON.parse(
        cryptoHelper.decrypt(
          { encryptionIv: encryption_iv, encryptionKey: encryption_key },
          agencyOauth.access_info,
        ),
      );
      this.email = '';
    } catch (err) {
      this.decrypted_access_info = {};
    }
  }

  /**
   * _authenticate - authenticate / reauthenticate tokens before sending a request
   * @returns {object}
   */
  async _authenticate() {
    // need to add endpoint to check if access token is not expired
    const secrets = this.secrets;

    const tokenParams = {
      client_id: secrets.OUTLOOK_CALENDAR_CLIENT_ID,
      code_verifier: secrets.OUTLOOK_CODE_VERIFIER,
      refresh_token: this.decrypted_access_info.refresh_token,
      grant_type: 'refresh_token',
    };

    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      qs.stringify(tokenParams),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Origin: config.apiIntegrationsUrl,
        },
      },
    );
    const encrypted_oauth_data = cryptoHelper.encrypt(
      {
        encryptionKey: this.encryption_key,
        encryptionIv: this.encryption_iv,
      },
      JSON.stringify(tokenResponse.data),
    );
    await models.agency_oauth.update(
      {
        access_info: encrypted_oauth_data,
      },
      {
        where: {
          agency_oauth_id: this.agencyOauth.agency_oauth_id,
          source: 'OUTLOOKCALENDAR',
          status: 'active',
        },
      },
    );
    const decodedToken = jwt.decode(tokenResponse.data.id_token, {
      complete: true,
    });
    this.email = decodedToken?.payload?.email;

    return tokenResponse.data.access_token;
  }

  /**
  * createCalendarEvent - creates calendar event
  * @param {{
  *  summary: string,
  *  description: string,
  *  startDateTime: DateTime,
  *  endDateTime: DateTime,
  *  timeZone: string,
  *  attendees: Array<string>
  * }} param0 
  * @returns {object}
  */
  async createCalendarEvent({
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendees = [],
  }) {
    const auth = await this._authenticate();
    const requestBody = {
      subject: summary,
      body: {
        contentType: "text",
        content: description,
      },
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    };

    const createAppointment = {
      method: 'post',
      url: `https://graph.microsoft.com/v1.0/me/events`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.apiIntegrationsUrl,
        Authorization: `Bearer ${auth}`,
      },
      data: JSON.stringify(requestBody),
    };
    const response = await axios(createAppointment);
    if (response.status === 201) {
      return response.data;
    }
    throw response;
  }

  /**
   * updateCalendarEvent - updates existing calendar event
   * @param {{
   *  eventId: string,
   *  summary: string,
   *  description: string,
   *  startDateTime: DateTime,
   *  endDateTime: DateTime,
   *  timeZone: string,
   *  attendees: Array<string>
   * }} param0 
   * @returns {object}
   */
  async updateCalendarEvent({
    eventId,
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendees = [],
  }) {
    const auth = await this._authenticate();
    const requestBody = {
      subject: summary,
      body: {
        contentType: 'text',
        content: description
      },
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    };
    const createAppointment = {
      method: 'patch',
      url: `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.apiIntegrationsUrl,
        Authorization: `Bearer ${auth}`,
      },
      data: JSON.stringify(requestBody),
    };
    const response = await axios(createAppointment);
    if (response.status === 200) {
      return response.data;
    }
    throw response;
  }

  /**
   * freeBusy - fetch the list of busy schedules from crm calendar
   * @param {{
   *  startOfDay: DateTime,
   *  endOfDay: DateTime,
   *  timeZone: string
   * }} param0 
   * @returns {Array<object>}
   */
  async freeBusy({ startOfDay, endOfDay, timeZone }) {
    const auth = await this._authenticate();
    const requestBody = {
      Schedules: [this.email],
      StartTime: {
        dateTime: startOfDay,
        timeZone: timeZone,
      },
      EndTime: {
        dateTime: endOfDay,
        timeZone: timeZone,
      },
    };

    const getFreeBusy = {
      method: 'post',
      url: `https://graph.microsoft.com/v1.0/me/calendar/getschedule`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.apiIntegrationsUrl,
        Authorization: `Bearer ${auth}`,
      },
      data: JSON.stringify(requestBody),
    };
    const response = await axios(getFreeBusy);
    if (response.status === 200) {
      return response.data;
    }
    throw response;
  }
}
module.exports = OutlookCalendarHelper;
