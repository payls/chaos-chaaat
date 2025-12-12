const cryptoHelper = require('./cryptoHelper');
const axios = require('axios');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const models = require('../models');
const config = require('../configs/config')(process.env.NODE_ENV);

class OutlookCalendarHelper {
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
          Origin: config.apiUrl,
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

  async createCalendarEvent({
    summary,
    startDateTime,
    endDateTime,
    timeZone,
    attendees = [],
  }) {
    const auth = await this._authenticate();
    const requestBody = {
      subject: summary,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
    };
    const createAppointment = {
      method: 'post',
      url: `https://graph.microsoft.com/v1.0/me/events`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.apiUrl,
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

  async updateCalendarEvent({
    eventId,
    summary,
    startDateTime,
    endDateTime,
    timeZone,
    attendees = [],
  }) {
    const auth = await this._authenticate();
    const requestBody = {
      subject: summary,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
    };
    const createAppointment = {
      method: 'patch',
      url: `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.apiUrl,
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
        Origin: config.apiUrl,
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
