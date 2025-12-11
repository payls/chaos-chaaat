const { google } = require('googleapis');

const constant = require('../constants/constant.json');
const cryptoHelper = require('./cryptoHelper');

/**
 * Class Representing GoogleCalendarHelper
 */
class GoogleCalendarHelper {
  /**
   * Create a GoogleCalendarHelper
   * @param {{
   *  encryption_iv: string,
   *  encryption_key: string,
   *  google_calendar_client_id: string,
   *  google_calendar_client_secret: string,
   *  access_info: string
   * }} param0 
   * @returns {GoogleCalendarHelper}
   */
  constructor({
    encryption_iv,
    encryption_key,
    google_calendar_client_id,
    google_calendar_client_secret,
    access_info,
  }) {
    this.OAUTH_DETAILS = constant.GOOGLE_CALENDAR.OAUTH_DETAILS;
    this.GOOGLE_CLIENT_ID = google_calendar_client_id;
    this.GOOGLE_CLIENT_SECRET = google_calendar_client_secret;
    this.REDIRECT_URI = constant.GOOGLE_CALENDAR.OAUTH_DETAILS.REDIRECT_URI;
    this.encrypted_access_info = access_info;
    try {
      this.decrypted_access_info = JSON.parse(
        cryptoHelper.decrypt(
          { encryptionIv: encryption_iv, encryptionKey: encryption_key },
          access_info,
        ),
      );
    } catch (err) {
      this.decrypted_access_info = {};
    }

    this.oAuth2Client = new google.auth.OAuth2(
      this.GOOGLE_CLIENT_ID,
      this.GOOGLE_CLIENT_SECRET,
      this.REDIRECT_URI,
    );
  }

  /**
   * _authenticate - authenticate / reauthenticate tokens before sending a request
   * @returns {object}
   */
  _authenticate() {
    return new Promise((resolve, reject) => {
      this.oAuth2Client.setCredentials({
        access_token: this.decrypted_access_info?.access_token,
        refresh_token: this.decrypted_access_info?.refresh_token,
      });

      this.oAuth2Client.refreshAccessToken((err, tokens) => {
        if (err) return reject(err);
        this.oAuth2Client.credentials = { access_token: tokens.access_token };
        resolve(this.oAuth2Client);
      });
    });
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
  async createCalendarEvent({ summary, description = '', startDateTime, endDateTime, timeZone, attendees = [] }) {
    const auth = await this._authenticate();
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oAuth2Client,
    });
    const requestBody = {
      summary,
      location: 'Google Meet',
      description,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
      reminders: {
        useDefault: true,
      },
      conferenceData: {
        createRequest: {
          requestId: 'hang1',
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
          status: {
            statusCode: 'success',
          },
        },
      },
      eventType: 'default',
    };
    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody,
    });

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  }

  /**
   * updateCalendarEvent - updates existing calendar event
   * @param {{
   *  eventId: string,
   *  sendNotifications: boolean,
   *  summary: string,
   *  description: string,
   *  startDateTime: DateTime,
   *  endDateTime: DateTime,
   *  timeZone: string,
   *  attendees: Array<string>
   * }} param0 
   * @returns {object}
   */
  async updateCalendarEvent({ eventId, sendNotifications = false, summary, description = '', startDateTime, endDateTime, timeZone, attendees = [] }) {
    const auth = await this._authenticate();
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oAuth2Client,
    });
    const requestBody = {
      summary,
      location: 'Google Meet',
      description,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
      reminders: {
        useDefault: true,
      },
      conferenceData: {
        createRequest: {
          requestId: 'hang1',
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
          status: {
            statusCode: 'success',
          },
        },
      },
      eventType: 'default',
    };
    const response = await calendar.events.update({
      auth,
      sendNotifications,
      calendarId: 'primary',
      conferenceDataVersion: 1,
      eventId,
      requestBody,
    });
    if (response.status === 200) {
      return response.data;
    }
    throw response;
  }

  /**
   * deleteCalendarEvent - deletes a calendar event
   * @param {{
   *  eventId: string
   * }} param0 
   * @returns {object}
   */
  async deleteCalendarEvent({
    eventId
  }) {
    const auth = await this._authenticate();
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oAuth2Client,
    });

    const response = await calendar.events.delete({
      auth,
      calendarId: 'primary',
      eventId
    });

    if (response.status >= 200 && response.status < 400) {
      return response.data;
    }

    throw response;
  }
}

module.exports = GoogleCalendarHelper;
