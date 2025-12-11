const axios = require('axios');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const htmlEncode = require('he');
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  test: {
    isTest: testHelper.isTest,
  },
  validation: {
    requiredParams: validationHelper.requiredParams,
  },
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
  email: {
    sendEmail: emailHelper.sendEmail,
  },
  log: generalHelper.log,
};
const config = require('../configs/config')(process.env.NODE_ENV);
const whatsappHelper = module.exports;

whatsappHelper.sendMessage = async ({
  environment,
  mobile_number,
  parts = [],
  receivers = [],
  api_credentials,
  log,
}) => {
  const funcName = 'whatsappHelper.sendWhatsAppMessage';
  if (!log) {
    log = {
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }

  try {
    if (h.test.isTest()) {
      log.info(`${funcName}: simulating sending of message`);
    } else {
      // Send whatsapp message
      const sendMessageData = JSON.stringify({
        message: {
          receivers,
          parts,
        },
      });

      if (h.notEmpty(api_credentials)) {
        // Add contact as whatsapp connection
        const connectionData = JSON.stringify({
          uri: `${environment}://${mobile_number}@whatsapp.com`,
          name: `${mobile_number}`,
        });
        const connectionConfig = {
          method: 'post',
          url: 'https://apiv2.unificationengine.com/v2/connection/add',
          headers: {
            Authorization: `Basic ${api_credentials}`,
            'Content-Type': 'application/json',
          },
          data: connectionData,
        };

        const addConnectionResponse = await axios(connectionConfig)
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            return error;
          });

        if (!h.cmpInt(addConnectionResponse.status, 200))
          return { success: false };
      }

      const sendMessageConfig = {
        method: 'post',
        url: 'https://apiv2.unificationengine.com/v2/message/send',
        headers: {
          Authorization: `Basic ${api_credentials}`,
          'Content-Type': 'application/json',
        },
        data: sendMessageData,
      };

      const sendMessageResponse = await axios(sendMessageConfig)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          return error;
        });

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number].status, 200))
        return { success: false };

      const original_event_id = sendMessageResponse.URIs[0].substring(
        sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
      );
      log.info(`${funcName}: message sent from to ${mobile_number}`);
      return { original_event_id, success: true };
    }
  } catch (err) {
    if (err)
      log.info(`${funcName}: failed to send whatsapp message`, {
        funcName,
        receivers,
        parts,
        err,
      });

    return { success: false };
  }
};

whatsappHelper.retrieveImage = async ({
  mobile_number,
  message_id,
  media_id,
  api_credentials,
  log,
}) => {
  const funcName = 'whatsappHelper.retrieveImage';
  if (!log) {
    log = {
      info: log.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }
  try {
    const retrieveImageData = JSON.stringify({
      uri: `unified://${mobile_number}?messageId=${message_id}&mediaId=${media_id}`,
    });

    const retrieveImageConfig = {
      method: 'post',
      url: 'https://apiv2.unificationengine.com/v2/message/retrieve',
      headers: {
        Authorization: `Basic ${api_credentials}`,
        'Content-Type': 'application/json',
      },
      data: retrieveImageData,
    };

    const retrieveImageResponse = await axios(retrieveImageConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
    if (!h.cmpInt(retrieveImageResponse.Status[mobile_number].status, 200))
      return { success: false, image: media_id };

    const base64Img = `data:${retrieveImageResponse.messages[mobile_number][0].parts[0].contentType};base64,${retrieveImageResponse.messages[mobile_number][0].parts[0].data}`;
    return { success: true, image: base64Img };
  } catch (err) {
    if (err)
      log.info(`${funcName}: failed to retrieve whatsapp image`, {
        funcName,
        mobile_number,
        message_id,
        media_id,
        err,
      });

    return { success: false, err: err };
  }
};

whatsappHelper.retrieveTemplates = async ({ waba_id, credentials, log }) => {
  const funcName = 'whatsappHelper.retrieveTemplates';
  if (!log) {
    log = {
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }
  try {
    const templateListConfig = {
      method: 'get',
      url: `https://template.unificationengine.com/list?access_token=${waba_id}`,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    };
    const templateListResponse = await axios(templateListConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
    if (!h.cmpInt(templateListResponse.status, 200))
      throw new Error(`${funcName}: failed to retrieve list from WA api`);
    return {
      success: true,
      templates: templateListResponse.info.data,
    };
  } catch (err) {
    if (err)
      log.info(`${funcName}: failed to retrieve whatsapp templates`, {
        funcName,
        waba_id,
        credentials,
        err,
      });

    return { success: false, err: err };
  }
};

whatsappHelper.notifyMessageInteraction = async ({
  agent_name,
  agent_email,
  contact_name,
  shortlisted_projects,
  tracker_ref_name,
  wa_link,
  serverRequest: request,
}) => {
  const funcName = 'whatsappHelper.notifyMessageInteraction';
  try {
    let email_subject = '';
    let email_body = '';

    if (shortlisted_projects.length === 1) {
      email_subject = h.getMessageByCode(
        'template-whatsapp-interaction-subject-single-project-1639636972368',
        {
          CONTACT_NAME: contact_name,
          PROJECT: shortlisted_projects[0],
        },
      );
    } else {
      email_subject = h.getMessageByCode(
        'template-whatsapp-interaction-subject-multiple-project-1639636972368',
        {
          CONTACT_NAME: contact_name,
        },
      );
    }

    let project_list = '<ul>';
    shortlisted_projects.forEach((project) => {
      project_list += `<li>${project}</li>`;
    });
    project_list += '</ul>';

    email_body = h.getMessageByCode(
      'template-whatsapp-interaction-email-body-1651855722401',
      {
        AGENT_FIRST_NAME: agent_name,
        CONTACT_NAME: contact_name,
        PROJECT_LIST: project_list,
        WHATSAPP_LINK: wa_link,
        // SHARED_INBOX_LINK: `${config.webAdminUrl}/dashboard/messaging/inbox?campaign=${tracker_ref_name}`,
      },
    );
    request.log.info({
      action: `${funcName}: attempt to send interaction notification`,
      data: {
        sender: `Chaaat Team <no-reply@${config.email.domain || 'chaaat.io'}>`,
        agent_email,
        email_subject,
        email_body,
      },
    });
    await h.email.sendEmail(
      `Chaaat Team <no-reply@${config.email.domain || 'chaaat.io'}>`,
      agent_email,
      null,
      email_subject,
      email_body,
    );
  } catch (err) {
    if (err)
      request.log.info({
        error: `${funcName}: failed to send interaction notification`,
        data: {
          funcName,
          agent_name,
          contact_name,
          shortlisted_projects,
          tracker_ref_name,
          err,
        },
      });
  }
};

whatsappHelper.notifyMessageInteractionCTA1 = async ({
  agency_id,
  agent_name,
  agent_email,
  additional_emails,
  contact_name,
  campaign,
  event_details,
  wa_link,
  with_event_details,
  shortlisted_projects,
  permalink_template,
}) => {
  const funcName = 'whatsappHelper.notifyMessageInteractionCTA1';
  try {
    let email_subject = '';
    let email_body = '';
    let additional_recipients_list = [];

    if (!h.isEmpty(additional_emails)) {
      additional_recipients_list = additional_emails.trim().split(',');
    }

    if (h.cmpStr(agency_id, '03770cad-f837-40ca-aec0-30bb292f65f2')) {
      email_subject = h.getMessageByCode(
        'template-whatsapp-interaction-subject-strength-culture-1639636972368',
        {
          CONTACT_NAME: contact_name,
        },
      );
      email_body = h.getMessageByCode(
        'template-whatsapp-interaction-strength-culture-1651855722401',
        {
          AGENT_FIRST_NAME: agent_name,
          CONTACT_NAME: contact_name,
        },
      );
    } else if (h.cmpStr(agency_id, 'd3e5e710-59a6-4d03-8313-da45b893022b')) {
      email_subject = h.getMessageByCode(
        'template-whatsapp-interaction-subject-hybrid-gym-1639636972368',
        {
          CONTACT_NAME: contact_name,
        },
      );
      email_body = h.getMessageByCode(
        'template-whatsapp-interaction-hybrid-gym-1651855722401',
        {
          AGENT_FIRST_NAME: agent_name,
          CONTACT_NAME: contact_name,
        },
      );
    } else if (h.cmpStr(agency_id, 'b07cac2d-7e95-40e4-a9f1-e7c9e6061911')) {
      if (h.cmpStr(permalink_template, 'breathe_pilates_prospects')) {
        email_subject = h.getMessageByCode(
          'template-whatsapp-interaction-subject-breathe-pilates-prospect-1639636972368',
          {
            CONTACT_NAME: contact_name,
          },
        );
        email_body = h.getMessageByCode(
          'template-whatsapp-interaction-breathe-pilates-prospect-1651855722401',
          {
            AGENT_FIRST_NAME: agent_name,
            CONTACT_NAME: contact_name,
          },
        );
      }

      if (h.cmpStr(permalink_template, 'breathe_pilates_re_engagement')) {
        email_subject = h.getMessageByCode(
          'template-whatsapp-interaction-subject-breathe-pilates-re-engagement-1639636972368',
          {
            CONTACT_NAME: contact_name,
          },
        );
        email_body = h.getMessageByCode(
          'template-whatsapp-interaction-breathe-pilates-re-engagement-1651855722401',
          {
            AGENT_FIRST_NAME: agent_name,
            CONTACT_NAME: contact_name,
          },
        );
      }
    } else {
      if (with_event_details) {
        email_subject = h.getMessageByCode(
          'template-whatsapp-interaction-subject-single-project-1639636972368',
          {
            CONTACT_NAME: contact_name,
            PROJECT: campaign,
          },
        );

        email_body = h.getMessageByCode(
          'template-whatsapp-interaction-email-body-cta1-web-1651855722401',
          {
            AGENT_FIRST_NAME: agent_name,
            CONTACT_NAME: contact_name,
            CAMPAIGN: campaign,
            DETAILS: event_details,
            WHATSAPP_LINK: wa_link,
          },
        );
      } else {
        if (shortlisted_projects.length === 1) {
          email_subject = h.getMessageByCode(
            'template-whatsapp-interaction-subject-single-project-1639636972368',
            {
              CONTACT_NAME: contact_name,
              PROJECT: shortlisted_projects[0],
            },
          );
        } else {
          email_subject = h.getMessageByCode(
            'template-whatsapp-interaction-subject-multiple-project-1639636972368',
            {
              CONTACT_NAME: contact_name,
            },
          );
        }

        if (shortlisted_projects.length === 1) {
          email_body = h.getMessageByCode(
            'template-whatsapp-interaction-generic-single-email-body-cta1-web-1651855722401',
            {
              AGENT_FIRST_NAME: agent_name,
              CONTACT_NAME: contact_name,
              CAMPAIGN: shortlisted_projects[0],
              WHATSAPP_LINK: wa_link,
            },
          );
        } else {
          let project_list = '<ul>';
          shortlisted_projects.forEach((project) => {
            project_list += `<li>${project}</li>`;
          });
          project_list += '</ul>';
          email_body = h.getMessageByCode(
            'template-whatsapp-interaction-generic-multiple-email-body-cta1-web-1651855722401',
            {
              AGENT_FIRST_NAME: agent_name,
              CONTACT_NAME: contact_name,
              CAMPAIGN: project_list,
              WHATSAPP_LINK: wa_link,
            },
          );
        }
      }
    }

    console.info({
      action: `${funcName}: attempt to send interaction notification`,
      data: {
        sender: `Chaaat Team <no-reply@${config.email.domain || 'chaaat.io'}>`,
        agent_email,
        additional_recipients_list,
        email_subject,
        email_body,
      },
    });
    await h.email.sendEmail(
      `Chaaat Team <no-reply@${config.email.domain || 'chaaat.io'}>`,
      agent_email,
      additional_recipients_list,
      email_subject,
      email_body,
    );
  } catch (err) {
    if (err)
      console.info({
        error: `${funcName}: failed to send interaction notification`,
        data: {
          funcName,
          agent_name,
          contact_name,
          campaign,
          event_details,
          with_event_details,
          shortlisted_projects,
          err,
        },
      });
  }
};

whatsappHelper.getWABAStatus = async ({
  agency_waba_id,
  agency_waba_template_token,
  agency_waba_template_secret,
  log,
}) => {
  const funcName = 'whatsappHelper.notifyMessageInteractionCTA1';
  if (!log) {
    log = {
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }
  try {
    const credentials = h.notEmpty(agency_waba_id)
      ? agency_waba_template_token + ':' + agency_waba_template_secret
      : null;
    const agencyBufferedCredentials = Buffer.from(credentials, 'utf8').toString(
      'base64',
    );
    const wabaStatusConfig = {
      method: 'get',
      url: `https://template.unificationengine.com/waba/status?access_token=${agency_waba_id}`,
      headers: {
        Authorization: `Basic ${agencyBufferedCredentials}`,
        'Content-Type': 'application/json',
      },
    };
    const wabaStatusResponse = await axios(wabaStatusConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
    if (!h.cmpInt(wabaStatusResponse.status, 200))
      throw new Error(`${funcName}: failed to retrieve list from WA api`);
    return {
      waba: wabaStatusResponse.info[0],
    };
  } catch (err) {
    if (err)
      log.info(`${funcName}: failed to retrieve whatsapp templates`, {
        funcName,
        agency_waba_id,
        agency_waba_template_token,
        agency_waba_template_secret,
        err,
      });

    return { success: false, err: err };
  }
};

whatsappHelper.sendAutoResponseMessage = async ({
  mobile_number,
  parts = [],
  receivers = [],
  api_credentials,
  environment,
  log,
}) => {
  const funcName = 'whatsappHelper.sendAutoResponseMessage';
  if (!log) {
    log = {
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }
  try {
    if (h.test.isTest()) {
      log.info(`${funcName}: simulating sending of message`);
    } else {
      // Send whatsapp message
      const sendMessageData = JSON.stringify({
        message: {
          receivers,
          parts,
        },
      });

      if (h.notEmpty(api_credentials)) {
        // Add contact as whatsapp connection
        const connectionData = JSON.stringify({
          uri: `${environment}://${mobile_number}@whatsapp.com`,
          name: `${mobile_number}`,
        });
        const connectionConfig = {
          method: 'post',
          url: 'https://apiv2.unificationengine.com/v2/connection/add',
          headers: {
            Authorization: `Basic ${api_credentials}`,
            'Content-Type': 'application/json',
          },
          data: connectionData,
        };

        const addConnectionResponse = await axios(connectionConfig)
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            return error;
          });

        if (!h.cmpInt(addConnectionResponse.status, 200)) {
          log.warn({
            action: 'CONTACT ADD TO CONTACT ERROR',
            response: addConnectionResponse,
          });
          return { success: false };
        } else {
          log.info({
            action: 'CONTACT ADD TO CONTACT SUCCESS',
            response: addConnectionResponse,
          });
        }
      }

      const sendMessageConfig = {
        method: 'post',
        url: 'https://apiv2.unificationengine.com/v2/message/send',
        headers: {
          Authorization: `Basic ${api_credentials}`,
          'Content-Type': 'application/json',
        },
        data: sendMessageData,
      };

      log.info({
        action: 'SEND PAYLOAD',
        payload: sendMessageData,
      });

      const sendMessageResponse = await axios(sendMessageConfig)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          return error;
        });

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number].status, 200)) {
        log.warn({
          action: 'AUTORESPONSE SENDING ERROR',
          response: sendMessageResponse,
        });
        return { success: false };
      } else {
        log.info({
          action: 'AUTORESPONSE SENDING SUCCESS',
          response: sendMessageResponse,
        });
      }

      const original_event_id = sendMessageResponse.URIs[0].substring(
        sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
      );
      log.info(`${funcName}: message sent from to ${mobile_number}`);
      return { original_event_id, success: true };
    }
  } catch (err) {
    if (err)
      log.info(`${funcName}: failed to send whatsapp message`, {
        funcName,
        receivers,
        parts,
        err,
      });

    return { success: false };
  }
};

whatsappHelper.sanitizeData = (data) => {
  try {
    const allowedTags = process.env.HTML_ALLOWED_TAGS;
    const encodedData = escapeData(data);
    console.log({ message: 'encoded template data', data: encodedData });
    const sanitizedData = parseValidEntities(encodedData, allowedTags);
    console.log({
      message: 'finalized data complete',
      data: sanitizedData,
    });

    return sanitizedData;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Description
 * Function to escape data
 * @constant
 * @name escapeData
 * @param {object} data data to convert
 */
function escapeData(data) {
  try {
    if (typeof data === 'object' && data !== null) {
      // map if array
      if (Array.isArray(data)) {
        return data.map(escapeData);
      }

      // Recursive if object
      const sanitizedObj = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitizedObj[key] = escapeData(data[key]);
        }
      }
      return sanitizedObj;
    } else if (typeof data === 'string' && !isPartiallyEscaped(data)) {
      // Sanitize using he
      return htmlEncode.encode(data);
    }

    // return unchanged values
    return data;
  } catch (err) {
    throw new Error(err);
  }
}

// Function to check if data has some escaped entities like &lt;
function isPartiallyEscaped(data) {
  // Escape the data
  const escapedData = htmlEncode.encode(data);

  // Check if original data contains escaped entities like &lt;
  const containsEscapedEntities = /&[a-z]+;/i.test(data);

  // If the data contains escaped entities but does not match fully escaped data
  return containsEscapedEntities && data !== escapedData;
}

/**
 * Description
 * Function to validate data tp be unescaped
 * @function
 * @name parseValidEntities
 * @kind function
 * @param {object} data data to unescape
 * @param {array} allowedTags list of allowed tags
 * @returns {object} unescaped data
 */
function parseValidEntities(data, allowedTags) {
  try {
    if (typeof data === 'object' && data !== null) {
      // Map if array
      if (Array.isArray(data)) {
        return data.map((item) => parseValidEntities(item, allowedTags));
      }

      // Recursive if object
      const sanitizedObj = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitizedObj[key] = parseValidEntities(data[key], allowedTags);
        }
      }
      return sanitizedObj;
    } else if (typeof data === 'string') {
      // Sanitize using unescapeAllowedTags
      return unescapeAllowedTags(data, allowedTags);
    }

    // Return unchanged values
    return data;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Description
 * Function to unescape string based on the allowed tags
 * @function
 * @name unescapeAllowedTags
 * @kind function
 * @param {string} data string to unescape
 * @param {array} allowedTags allowed html tags
 * @returns {string} unescaped string
 */
function unescapeAllowedTags(data, allowedTags) {
  console.log('data to be checked', data);
  const allowedTagsArray = allowedTags.split('|');
  try {
    // Convert the allowed tags string into a regex pattern
    // eslint-disable-next-line prettier/prettier
    const openingTagRegex = new RegExp(`<\\s*(${allowedTags})\\s*\\b[^>]*>`, 'gi');
    // eslint-disable-next-line prettier/prettier
    const closingTagRegex = new RegExp(`<\\s*\\/(${allowedTags})\\s*\\b[^>]*>`, 'gi');

    // First, unescape the whole input using he.unescape
    let unescapedInput = htmlEncode.unescape(data).trim(); // Using he for unescaping
    console.log('unescaped', unescapedInput);

    // This line now handles the escaping of tags
    unescapedInput = unescapedInput.replace(/<\/?[^>]+>/g, (match) => {
      const toMatch = match;
      // eslint-disable-next-line prettier/prettier
      const tagData = toMatch.match(/^<\s*\/*([a-zA-Z][\w-]*)\s*\b([^>]*)\s*\/*>$/);
      console.log('tag data', tagData);
      console.log(
        `Check if Matched ${openingTagRegex}, ${closingTagRegex}, ${toMatch}`,
      );

      if (h.notEmpty(tagData)) {
        if (allowedTagsArray.includes(tagData[1])) {
          return toMatch;
        } else {
          console.log(
            `Tag not allowed, escaping tag using initial handler: ${toMatch}`,
          );
          return htmlEncode.escape(toMatch);
        }
      } else {
        // If the tag matches the allowed list, leave it unescaped
        if (openingTagRegex.test(toMatch)) {
          console.log(`Matched allowed starting tag: ${toMatch}`); // Debug log for matched tags
          return toMatch; // Leave allowed tags unescaped
        } else if (closingTagRegex.test(toMatch)) {
          console.log(`Matched allowed ending tag: ${toMatch}`); // Debug log for matched tags
          return toMatch; // Leave allowed tags unescaped
        } else {
          // Otherwise, escape the tag to prevent rendering
          console.log(`Escaping tag using replace: ${toMatch}`); // Debug log for escaping tags
          return toMatch.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      }
    });

    return unescapedInput;
  } catch (err) {
    throw new Error(err);
  }
}
