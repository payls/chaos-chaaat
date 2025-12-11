const fs = require('fs').promises;
const fsNonPromise = require('fs');
const FormData = require('form-data');

const path = require('path');

const cheerio = require('cheerio');
const Sentry = require('@sentry/node');
const AWS = require('aws-sdk');
const axios = require('axios');

const { Console } = require('console');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const fileHelper = require('./file');
const mime = require('mime-types');
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
const constant = require('../constants/constant.json');
const whatsappHelper = module.exports;

whatsappHelper.addToConnection = async ({
  environment,
  mobile_number,
  api_credentials,
  log,
}) => {
  if (h.isEmpty(api_credentials)) throw new Error('EMPTY WHATSAPP CREDENTIALS');

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

  if (!h.cmpInt(addConnectionResponse.status, 200)) return { success: false };
};

whatsappHelper.sendMessage = async ({
  environment,
  mobile_number,
  parts = [],
  receivers = [],
  returnPath,
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
      let sendMessageData;
      if (!h.isEmpty(returnPath)) {
        sendMessageData = JSON.stringify({
          message: {
            receivers,
            returnPath,
            parts,
          },
        });
      } else {
        sendMessageData = JSON.stringify({
          message: {
            receivers,
            parts,
          },
        });
      }
      console.log(sendMessageData);

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
            Sentry.captureException(error);
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
          Sentry.captureException(error);
          return error;
        });

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number].status, 200))
        return {
          success: false,
          error: sendMessageResponse.Status[mobile_number].info,
        };

      const original_event_id = sendMessageResponse.URIs[0].substring(
        sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
      );
      log.info(`${funcName}: message sent from to ${mobile_number}`);
      return { original_event_id, success: true, error: null };
    }
  } catch (err) {
    Sentry.captureException(err);
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
        Sentry.captureException(error);
        return error;
      });
    if (!h.cmpInt(retrieveImageResponse.Status[mobile_number].status, 200))
      return { success: false, image: media_id };

    const base64Img = `data:${retrieveImageResponse.messages[mobile_number][0].parts[0].contentType};base64,${retrieveImageResponse.messages[mobile_number][0].parts[0].data}`;
    return { success: true, image: base64Img };
  } catch (err) {
    Sentry.captureException(err);
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
      info: console.log,
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
        Sentry.captureException(error);
        return error;
      });
    if (!generalHelper.cmpInt(templateListResponse.status, 200))
      throw new Error(`${funcName}: failed to retrieve list from WA api`);
    return {
      success: true,
      templates: templateListResponse.info.data,
    };
  } catch (err) {
    Sentry.captureException(err);
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
        sender: `Chaaat Team <no-reply@${
          config?.email?.domain || 'chaaat.io'
        }>`,
        agent_email,
        email_subject,
        email_body,
      },
    });
    await h.email.sendEmail(
      `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
      agent_email,
      null,
      email_subject,
      email_body,
    );
  } catch (err) {
    Sentry.captureException(err);
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

    console.log({
      action: `${funcName}: attempt to send interaction notification`,
      data: {
        sender: `Chaaat Team <no-reply@${
          config?.email?.domain || 'chaaat.io'
        }>`,
        agent_email,
        additional_recipients_list,
        email_subject,
        email_body,
      },
    });
    await h.email.sendEmail(
      `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
      agent_email,
      additional_recipients_list,
      email_subject,
      email_body,
    );
  } catch (err) {
    Sentry.captureException(err);
    if (err)
      console.log({
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
      info: console.log,
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
        Sentry.captureException(error);
        return error;
      });
    if (!h.cmpInt(wabaStatusResponse.status, 200))
      throw new Error(`${funcName}: failed to retrieve list from WA api`);
    return {
      waba: wabaStatusResponse.info[0],
    };
  } catch (err) {
    Sentry.captureException(err);
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
      info: console.log,
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
            Sentry.captureException(error);
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
          Sentry.captureException(error);
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
    Sentry.captureException(err);
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

whatsappHelper.getMediaURL = async (data, log) => {
  if (!log) {
    log = {
      info: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }
  let retrieveMediaData;
  let doc_data;
  const msg_details = data.msg_details;
  let media_msg_id = null;
  let caption = null;
  let file_name = null;
  if (h.cmpStr(data.msg_type, 'document')) {
    doc_data = msg_details.split('|');
    media_msg_id = doc_data[0];
    file_name = doc_data[1];
    if (h.cmpInt(doc_data.length, 4)) {
      const regex = /<span class="text_attachment">(.*?)<\/span>/;
      const match = doc_data[3].match(regex);
      if (match && match[1]) {
        caption = match[1];
      }
    }
    retrieveMediaData = JSON.stringify({
      uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${doc_data[0]}`,
    });
  } else if (h.cmpStr(data.msg_type, 'image')) {
    doc_data = msg_details.split('|');
    if (doc_data instanceof Array) {
      media_msg_id = doc_data[0];
      if (h.cmpInt(doc_data.length, 2)) {
        const regex = /<span class="text_attachment">(.*?)<\/span>/;
        const match = doc_data[1].match(regex);
        if (match && match[1]) {
          caption = match[1];
        }
      }
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${doc_data[0]}`,
      });
    } else {
      media_msg_id = msg_details;
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${msg_details}`,
      });
    }
  } else if (h.cmpStr(data.msg_type, 'video')) {
    doc_data = msg_details.split('|');
    if (doc_data instanceof Array) {
      media_msg_id = doc_data[0];
      if (h.cmpInt(doc_data.length, 2)) {
        const regex = /<span class="text_attachment">(.*?)<\/span>/;
        const match = doc_data[1].match(regex);
        if (match && match[1]) {
          caption = match[1];
        }
      }
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${doc_data[0]}`,
      });
    } else {
      media_msg_id = msg_details;
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${msg_details}`,
      });
    }
  } else {
    media_msg_id = msg_details;
    retrieveMediaData = JSON.stringify({
      uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${msg_details}`,
    });
  }
  log.info('message', msg_details);
  log.info('retrieved media data parameter', retrieveMediaData);

  const retrieveMediaConfig = {
    method: 'post',
    url: 'https://apiv2.unificationengine.com/v2/message/retrieve',
    headers: {
      Authorization: `Basic ${data.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: retrieveMediaData,
  };

  const retrieveMediaResponse = await axios(retrieveMediaConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      Sentry.captureException(error);
      return error;
    });

  log.info('retrieved data', retrieveMediaResponse);

  if (
    !h.cmpInt(retrieveMediaResponse.Status[data.receiver_number].status, 200)
  ) {
    log.warn({
      action: 'MEDIA RETRIEVE FAILED',
      response: retrieveMediaResponse,
    });
    return { success: false };
  } else {
    log.info({
      action: 'MEDIA RETRIEVE SUCCESS',
      response: retrieveMediaResponse,
    });
    const media_parts =
      retrieveMediaResponse.messages[data.receiver_number][0].parts[0];
    const base64URI = `data:${media_parts.contentType};base64, ${media_parts.data}`;

    const fileBuffer = Buffer.from(media_parts.data, 'base64');

    const fileContentType = mime.contentType(media_parts.contentType);
    const fileExt = mime.extension(fileContentType);
    const upload_type = constant.UPLOAD.TYPE.MESSAGE_MEDIA;
    const remoteFilePath = fileHelper.getFilePath(upload_type, {
      file_name: `sample_file_name.${fileExt}`,
    });
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    await fileHelper.uploadBufferToS3(
      fileBuffer,
      fileContentType,
      remoteFilePath,
    );
    const fullRemoteFileUrl = `${config.cdnUrls[0]}/${remoteFilePath}`;

    return {
      success: true,
      media_msg_id: media_msg_id,
      file_url: fullRemoteFileUrl,
      content_type: fileContentType,
      caption: caption,
      file_name: file_name,
    };
  }
};

whatsappHelper.getWhatsAppToken = async (waba) => {
  const { agency_whatsapp_api_token, agency_whatsapp_api_secret } = waba;
  return Buffer.from(
    agency_whatsapp_api_token + ':' + agency_whatsapp_api_secret,
    'utf8',
  ).toString('base64');
};

whatsappHelper.getTemplateMsgBody = async (
  agency_id,
  agency_name,
  agent_name,
  buyer_name,
  mobile_number,
  email_address,
  permalink,
  template,
) => {
  // Read whatsapp template file
  const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
    ? 'https://samplerealestateagency.chaaat.io/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
    : permalink;
  const messageParts = [];
  const messageTemplate = {
    id: '1',
    contentType: 'text/html',
    data: '',
    header: [],
    body: [],
    button: [],
    size: 5000,
    type: 'template',
    sort: 0,
  };

  const template_content = JSON.parse(template[0].content);
  let body_variables_type;

  template_content.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      const filename = template[0].header_image.substring(
        template[0].header_image.lastIndexOf('/') + 1,
      );
      if (['IMAGE'].includes(component.format)) {
        messageTemplate.header.push({
          type: 'image',
          image: { link: template[0].header_image, filename: filename },
        });
      }
      if (['VIDEO'].includes(component.format)) {
        messageTemplate.header.push({
          type: 'video',
          video: { link: template[0].header_image, filename: filename },
        });
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      if (typeof component.example !== 'undefined') {
        const examples = component.example.body_text[0];
        if (examples) {
          const variable_types = template[0].variable_identifier;
          const bodyExample = component.example;
          if (bodyExample) {
            if (!h.isEmpty(variable_types)) {
              body_variables_type = variable_types.split(',');
            } else {
              const default_types = ['contact', 'agent'];
              body_variables_type = [];

              for (let i = 0; i < examples.length; i++) {
                body_variables_type.push(default_types[i % 2]);
              }
            }
          }
        }
        examples.forEach((ex, index) => {
          let component_value = null;
          if (body_variables_type.length > 0) {
            if (body_variables_type[index] === 'agency') {
              component_value = agency_name;
            } else if (body_variables_type[index] === 'agent') {
              component_value = agent_name;
            } else if (body_variables_type[index] === 'link') {
              component_value = permalink_url;
            } else if (body_variables_type[index] === 'email') {
              component_value = email_address;
            } else {
              component_value = buyer_name || mobile_number;
            }
            messageTemplate.body.push({
              type: 'text',
              text: `${component_value}`,
            });
          } else {
            messageTemplate.body.push({
              type: 'text',
              text: `${buyer_name || mobile_number}`,
            });
          }
        });
      }
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        if (h.cmpStr(btn.type, 'URL') && btn.url.includes('{{1}}')) {
          let dynamic_url_params;
          const sample = btn.example[0];
          if (sample.includes('sample_email@domain.com')) {
            if (
              [
                '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
                '36f64032-bdf9-4cdc-b980-cdcdec944fb8',
              ].includes(agency_id)
            ) {
              const dynamic_url_params = `?referred_by=${email_address}`;
              messageTemplate.button.push({
                sub_type: 'url',
                parameters: [{ type: 'text', text: dynamic_url_params }],
              });
            } else {
              const dynamic_url_params = email_address;
              messageTemplate.button.push({
                sub_type: 'url',
                parameters: [{ type: 'text', text: dynamic_url_params }],
              });
            }
          } else {
            dynamic_url_params = permalink_url.substring(
              permalink_url.lastIndexOf('/') + 1,
            );
            messageTemplate.button.push({
              sub_type: 'url',
              parameters: [{ type: 'text', text: dynamic_url_params }],
            });
          }
        }
      });
    }
  });

  let msg_body = '';
  template_content.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      if (h.cmpStr(component.format, 'IMAGE')) {
        if (
          template[0].header_image &&
          !h.cmpStr(
            template[0].header_image,
            'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
          )
        ) {
          msg_body += `<img src="${template[0].header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
        }
      }

      if (h.cmpStr(component.format, 'VIDEO')) {
        if (
          template[0].header_image &&
          !h.cmpStr(
            template[0].header_image,
            'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
          )
        ) {
          msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${template[0].header_image}"></video>`;
        }
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      msg_body += component.text;
      if (typeof component.example !== 'undefined') {
        const examples =
          component.example.body_text.length > 0
            ? component.example.body_text[0]
            : [];
        examples.forEach((ex, index) => {
          let component_value = null;
          if (body_variables_type.length > 0) {
            if (body_variables_type[index] === 'agency') {
              component_value = agency_name;
            } else if (body_variables_type[index] === 'agent') {
              component_value = agent_name;
            } else if (body_variables_type[index] === 'link') {
              component_value = permalink_url;
            } else {
              component_value = buyer_name || mobile_number;
            }
            msg_body = msg_body.replace(`{{${index + 1}}}`, component_value);
          } else {
            msg_body = msg_body.replace(
              `{{${index + 1}}}`,
              `${buyer_name || mobile_number}`,
            );
          }
        });
      }
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.text}</button>`;
      });
    }
  });

  const body = messageTemplate.body;
  const header = messageTemplate.header;
  const button = messageTemplate.button;

  messageTemplate.data = JSON.stringify({
    element_name: template[0].template_name,
    language: template[0].language,
    category: template[0].category,
    id: template_content.id,
    header: header,
    body: body,
    button: button,
  });
  delete messageTemplate.body;
  delete messageTemplate.header;
  delete messageTemplate.button;
  messageParts.push(messageTemplate);

  // combine message contents
  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'name',
          address: `${mobile_number}`,
          Connector: `${mobile_number}`,
          type: 'individual',
        },
      ],
      parts: messageParts,
    },
  };

  return {
    sendMessagePartsData: sendMessagePartsData,
    msg_body: msg_body,
  };
};

whatsappHelper.sendWhatsAppTemplateMessage = async (
  mobile_number,
  is_receiver_whatsapp_verified,
  full_message_body,
  sendMessageData,
  api_credentials,
  environment,
  log,
) => {
  const funcName = 'whatsappHelper.sendWhatsAppTemplateMessage';
  const whatsAppData = {
    mobile_number,
    is_receiver_whatsapp_verified,
    full_message_body,
    sendMessageData,
    api_credentials,
  };
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
      console.log(`${funcName}: simulating sending of message`, whatsAppData);
    } else {
      let original_event_id = null;
      if (!mobile_number) return { original_event_id, full_message_body };
      if (!api_credentials) return { original_event_id, full_message_body };
      if (h.isEmpty(api_credentials))
        return { original_event_id, full_message_body };

      if (
        mobile_number &&
        h.cmpBool(whatsAppData.is_receiver_whatsapp_verified, false)
      ) {
        // Add contact as whatsapp connection
        const connectionData = JSON.stringify({
          uri: `${environment}://${mobile_number}@whatsapp.com`,
          name: `${mobile_number}`,
        });

        log.info({
          action: 'ADD CONNECTION PAYLOAD',
          payload: connectionData,
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
            Sentry.captureException(error);
            return error;
          });
        if (!h.cmpInt(addConnectionResponse.status, 200)) {
          log.warn({
            action: 'CONTACT ADD TO CONTACT ERROR',
            response: addConnectionResponse,
          });
          return {
            success: false,
            original_event_id,
            full_message_body,
            error: 'Failed to add as connection',
          };
        } else {
          log.info({
            action: 'CONTACT ADD TO CONTACT SUCCESS',
            response: addConnectionResponse,
          });
        }
      }

      log.info({
        action: 'PROCESS SENDING',
        number: mobile_number,
      });

      log.info({
        action: 'SEND PAYLOAD',
        payload: sendMessageData,
      });

      console.log(sendMessageData);

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
          Sentry.captureException(error);
          return error;
        });

      console.log(sendMessageResponse);

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number].status, 200)) {
        log.warn({
          action: 'TEMPLATE MESSAGE SENDING ERROR',
          response: sendMessageResponse,
        });
        return {
          success: false,
          original_event_id,
          full_message_body,
          error: sendMessageResponse.Status[mobile_number].info,
        };
      } else {
        log.info({
          action: 'TEMPLATE MESSAGE SENDING SUCCESS',
          response: sendMessageResponse,
        });
      }

      original_event_id = sendMessageResponse.URIs[0].substring(
        sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
      );
      console.log(
        `${funcName}: message sent from to ${whatsAppData.mobile_number}"`,
      );
      return {
        success: true,
        original_event_id,
        full_message_body,
        error: null,
      };
    }
  } catch (err) {
    Sentry.captureException(err);
    if (err)
      console.log(`${funcName}: failed to send whatsapp message`, {
        whatsAppData,
        err,
      });
  }
};

whatsappHelper.checkIfQuickReplyIsMonitored = (
  index,
  reply,
  saved_quick_replies,
) => {
  let existing = false;
  for (const item of saved_quick_replies) {
    if (
      item.type === 'template' &&
      item.name.toLowerCase() === reply.toLowerCase()
    ) {
      existing = true;
    }
  }

  if (h.cmpBool(existing, false)) {
    saved_quick_replies.push({
      type: 'template',
      name: reply,
      value: reply.toLowerCase(),
      response: '',
      send_reply: !h.cmpInt(index, 3),
      opt_out: h.cmpInt(index, 3),
      email: !h.cmpInt(index, 3),
      cta_reply: index,
    });
  }
  return saved_quick_replies;
};

whatsappHelper.checkIfQRIsCheckedAnMonitored = (
  optionType,
  reply,
  saved_quick_replies,
) => {
  let existing = false;
  for (const item of saved_quick_replies) {
    if (
      item.type === 'template' &&
      item.name.toLowerCase() === reply.toLowerCase()
    ) {
      existing = true;
    }
  }

  if (h.cmpBool(existing, false)) {
    saved_quick_replies.push({
      type: 'template',
      name: reply,
      value: reply.toLowerCase(),
      response: '',
      send_reply: true,
      opt_out: false,
      email: true,
      cta_reply: optionType,
    });
  }
  return saved_quick_replies;
};

whatsappHelper.getInitialTemplateMsgBody = async (
  agency_id,
  agency_name,
  agent_name,
  buyer_name,
  mobile_number,
  email_address,
  permalink,
  template,
) => {
  // Read whatsapp template file
  const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
    ? 'https://samplerealestateagency.chaaat.io/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
    : permalink;
  const messageParts = [];
  const messageTemplate = {
    id: '1',
    contentType: 'text/html',
    data: '',
    header: [],
    body: [],
    button: [],
    size: 5000,
    type: 'template',
    sort: 0,
  };

  const template_content = JSON.parse(template[0].value.content);
  let body_variables_type;

  template_content.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      const filename = template[0].value.header_image.substring(
        template[0].value.header_image.lastIndexOf('/') + 1,
      );
      if (['IMAGE'].includes(component.format)) {
        messageTemplate.header.push({
          type: 'image',
          image: { link: template[0].value.header_image, filename: filename },
        });
      }
      if (['VIDEO'].includes(component.format)) {
        messageTemplate.header.push({
          type: 'video',
          video: { link: template[0].value.header_image, filename: filename },
        });
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      if (typeof component.example !== 'undefined') {
        const examples = component.example.body_text[0];
        if (examples) {
          const variable_types = template[0].value.variable_identifier;
          const bodyExample = component.example;
          if (bodyExample) {
            if (!h.isEmpty(variable_types)) {
              body_variables_type = variable_types.split(',');
            } else {
              const default_types = ['contact', 'agent'];
              body_variables_type = [];

              for (let i = 0; i < examples.length; i++) {
                body_variables_type.push(default_types[i % 2]);
              }
            }
          }
        }
        examples.forEach((ex, index) => {
          let component_value = null;
          if (body_variables_type.length > 0) {
            if (body_variables_type[index] === 'agency') {
              component_value = agency_name;
            } else if (body_variables_type[index] === 'agent') {
              component_value = agent_name;
            } else if (body_variables_type[index] === 'link') {
              component_value = permalink_url;
            } else if (body_variables_type[index] === 'email') {
              component_value = email_address;
            } else {
              component_value = buyer_name || mobile_number;
            }
            messageTemplate.body.push({
              type: 'text',
              text: `${component_value}`,
            });
          } else {
            messageTemplate.body.push({
              type: 'text',
              text: `${buyer_name || mobile_number}`,
            });
          }
        });
      }
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        if (h.cmpStr(btn.type, 'URL') && btn.url.includes('{{1}}')) {
          let dynamic_url_params;
          const sample = btn.example[0];
          if (sample.includes('sample_email@domain.com')) {
            if (
              [
                '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
                '36f64032-bdf9-4cdc-b980-cdcdec944fb8',
              ].includes(agency_id)
            ) {
              const dynamic_url_params = `?referred_by=${email_address}`;
              messageTemplate.button.push({
                sub_type: 'url',
                parameters: [{ type: 'text', text: dynamic_url_params }],
              });
            } else {
              const dynamic_url_params = email_address;
              messageTemplate.button.push({
                sub_type: 'url',
                parameters: [{ type: 'text', text: dynamic_url_params }],
              });
            }
          } else {
            dynamic_url_params = permalink_url.substring(
              permalink_url.lastIndexOf('/') + 1,
            );
            messageTemplate.button.push({
              sub_type: 'url',
              parameters: [{ type: 'text', text: dynamic_url_params }],
            });
          }
        }
      });
    }
  });

  let msg_body = '';
  template_content.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      if (h.cmpStr(component.format, 'IMAGE')) {
        if (
          template[0].value.header_image &&
          !h.cmpStr(
            template[0].value.header_image,
            'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
          )
        ) {
          msg_body += `<img src="${template[0].value.header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
        }
      }
      if (h.cmpStr(component.format, 'VIDEO')) {
        if (
          template[0].value.header_image &&
          !h.cmpStr(
            template[0].value.header_image,
            'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
          )
        ) {
          msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${template[0].value.header_image}"></video>`;
        }
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      msg_body += component.text;
      if (typeof component.example !== 'undefined') {
        const examples =
          component.example.body_text.length > 0
            ? component.example.body_text[0]
            : [];
        examples.forEach((ex, index) => {
          let component_value = null;
          if (body_variables_type.length > 0) {
            if (body_variables_type[index] === 'agency') {
              component_value = agency_name;
            } else if (body_variables_type[index] === 'agent') {
              component_value = agent_name;
            } else if (body_variables_type[index] === 'link') {
              component_value = permalink_url;
            } else {
              component_value = buyer_name || mobile_number;
            }
            msg_body = msg_body.replace(`{{${index + 1}}}`, component_value);
          } else {
            msg_body = msg_body.replace(
              `{{${index + 1}}}`,
              `${buyer_name || mobile_number}`,
            );
          }
        });
      }
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.text}</button>`;
      });
    }
  });

  const body = messageTemplate.body;
  const header = messageTemplate.header;
  const button = messageTemplate.button;

  messageTemplate.data = JSON.stringify({
    element_name: template[0].value.template_name,
    language: template[0].value.language,
    category: template[0].value.category,
    id: template_content.id,
    header: header,
    body: body,
    button: button,
  });
  delete messageTemplate.body;
  delete messageTemplate.header;
  delete messageTemplate.button;
  messageParts.push(messageTemplate);

  // combine message contents
  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'name',
          address: `${mobile_number}`,
          Connector: `${mobile_number}`,
          type: 'individual',
        },
      ],
      parts: messageParts,
    },
  };

  return {
    sendMessagePartsData: sendMessagePartsData,
    msg_body: msg_body,
  };
};

whatsappHelper.createWhatsappTemplate = async (template, credentials) => {
  try {
    const axiosConfig = {
      method: 'post',
      url: 'https://template.unificationengine.com/create',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      data: template,
    };
    const response = await axios(axiosConfig);

    if (!h.cmpInt(response.status, 200)) {
      throw new Error(`Error creating template`);
    }
    return response.data;
  } catch (error) {
    console.error('Error in createWhatsappTemplate: => ', error);
    throw error.response;
  }
};

whatsappHelper.updateWhatsappTemplate = async (template, credentials) => {
  try {
    const axiosConfig = {
      method: 'post',
      url: 'https://template.unificationengine.com/update',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      data: template,
    };
    const response = await axios(axiosConfig);

    if (!h.cmpInt(response.status, 200)) {
      throw new Error(`Error updating template`);
    }
    return response.data;
  } catch (error) {
    console.error('Error in updatingTemplate: => ', error);
    throw error.response;
  }
};

whatsappHelper.getWhatsappTemplate = async (
  templateId,
  wabaAccountId,
  credentials,
) => {
  try {
    const axiosConfig = {
      method: 'get',
      url: `https://template.unificationengine.com/details?access_token=${wabaAccountId}&template_id=${templateId}`,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios(axiosConfig);

    if (!h.cmpInt(response.status, 200)) {
      throw new Error(`Error while fetching whatsapp template`);
    }
    return response.data;
  } catch (error) {
    console.error('Error in getWhatsappTemplate: => ', error);
    throw error.response;
  }
};

whatsappHelper.createWhatsappFlow = async ({
  access_token,
  credentials,
  name,
  categories = ['APPOINTMENT_BOOKING'],
  endpoint_uri,
}) => {
  const requestObject = {
    name,
    access_token,
    categories,
    endpoint_uri,
  };

  const axiosReqObj = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/create',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    data: requestObject,
  };

  try {
    const response = await axios(axiosReqObj);

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  } catch (err) {
    throw err.response;
  }
};

whatsappHelper.updateWhatsappFlowJson = async ({
  flow_id,
  access_token,
  json,
  credentials,
}) => {
  const filePath = path.join(
    __dirname,
    '../../',
    'temp',
    `${flow_id}-json_dump.json`,
  );

  await fs.writeFile(filePath, JSON.stringify(json));

  const form = new FormData();
  form.append('file', fsNonPromise.createReadStream(filePath));
  form.append('name', `${flow_id}-json_dump.json`);
  form.append('asset_type', 'FLOW_JSON');
  form.append('flow_id', flow_id);
  form.append('access_token', access_token);

  const axiosRequest = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/update/json',
    data: form,
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  };

  try {
    const response = await axios.post(axiosRequest.url, form, {
      headers: {
        Authorization: `Basic ${credentials}`,
        ...form.getHeaders(),
      },
    });

    await (() => {
      return new Promise((resolve) => {
        fsNonPromise.unlink(filePath, (err) => {
          resolve(err);
        });
      });
    })();

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  } catch (err) {
    throw err.response;
  }
};

whatsappHelper.updateWhatsappFlow = async ({
  flow_id,
  access_token,
  credentials,
  name,
  categories,
  endpoint_uri,
}) => {
  const requestObject = {
    flow_id,
    name,
    access_token,
    categories,
    endpoint_uri,
  };

  const axiosReqObj = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/update',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    data: requestObject,
  };

  try {
    const response = await axios(axiosReqObj);

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  } catch (err) {
    throw err.response;
  }
};

whatsappHelper.publishWhatsappFlow = async ({
  flow_id,
  access_token,
  credentials,
}) => {
  const requestObject = {
    flow_id,
    access_token,
  };

  const axiosReqObj = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/publish',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    data: requestObject,
  };

  try {
    const response = await axios(axiosReqObj);
    if (!h.cmpInt(response.status, 200)) {
      throw new Error(`Error while publishing flow`);
    }
    return response.data;
  } catch (error) {
    console.error('Error in publishingFlow: => ', error);
    throw error.response;
  }
};

whatsappHelper.getWhatsAppFlowById = async () => {};
whatsappHelper.getWhatsappFlowPreview = async ({
  flow_id,
  access_token,
  credentials,
}) => {
  // https://template.unificationengine.com/flow/preview
  const requestObject = {
    flow_id,
    access_token,
  };

  const axiosReqObj = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/preview',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    data: requestObject,
  };

  try {
    const response = await axios(axiosReqObj);

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  } catch (err) {
    throw err.response;
  }
};

whatsappHelper.deleteWhatsappFlowById = async ({
  flow_id,
  access_token,
  credentials,
}) => {
  const requestObject = {
    flow_id,
    access_token,
  };

  const axiosReqObj = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/delete',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    data: requestObject,
  };

  try {
    const response = await axios(axiosReqObj);

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  } catch (err) {
    throw err.response;
  }
};

whatsappHelper.archiveWhatsappFlowById = async ({
  flow_id,
  access_token,
  credentials,
}) => {
  const requestObject = {
    flow_id,
    access_token,
  };

  const axiosReqObj = {
    method: 'post',
    url: 'https://template.unificationengine.com/flow/deprecate',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    data: requestObject,
  };

  try {
    const response = await axios(axiosReqObj);

    if (response.status === 200) {
      return response.data;
    }

    throw response;
  } catch (err) {
    throw err.response;
  }
};
/**
 * Description
 * Function to put the data back to the unescaped version
 * @constant
 * @name unescapeData
 * @param {object} data escaped data to convert
 */
whatsappHelper.unescapeData = (data) => {
  try {
    if (typeof data === 'object' && data !== null) {
      // allow if date
      if (data instanceof Date) {
        return data;
      }
      // Map if array
      if (Array.isArray(data)) {
        return data.map((item) => whatsappHelper.unescapeData(item));
      }

      // Recursive if object
      const sanitizedObj = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitizedObj[key] = whatsappHelper.unescapeData(data[key]);
        }
      }
      return sanitizedObj;
    } else if (typeof data === 'string') {
      // Sanitize using unescapeAllowedTags
      const unescapedVal = htmlEncode.unescape(data);
      return whatsappHelper.sanitizeMaliciousAttributes(unescapedVal);
    } else if (typeof data === 'number' || typeof data === 'boolean') {
      // Handle primitive types
      return data;
    } else if (data === null || data === undefined) {
      // Handle null and undefined
      return data;
    }

    // Return unchanged values
    return data;
  } catch (err) {
    throw new Error(`Error in unescapeData: ${err.message}`);
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
 * Replaces multiple substrings in a given string based on a dictionary of replacements.
 *
 * @param {string} str - The original string in which replacements are to be made.
 * @param {Object} replacements - An object where each key is a substring to find, and each value is the replacement string.
 * @returns {string} - The modified string with all replacements applied.
 *
 */
whatsappHelper.replaceMultiple = (str, replacements) => {
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    str = str.replace(regex, value);
  }
  return str;
};

/**
 * Sanitizes a given HTML message by removing malicious attributes from all elements
 * and preserving certain attributes like class, classname, and style.
 *
 * @param {string} message - The HTML message content to sanitize.
 * @returns {string} - The sanitized HTML message content with malicious attributes removed.
 */
whatsappHelper.sanitizeMaliciousAttributes = (message) => {
  const $ = cheerio.load(message);
  $('*').each((_, element) => {
    const attribs = element.attribs;
    const className = $(element).attr('classname');
    const c = $(element).attr('class');
    const style = $(element).attr('style');
    const src = $(element).attr('src');
    const controls = $(element).attr('controls');

    for (const attr in attribs) {
      $(element).removeAttr(attr);

      if (className) {
        $(element).attr('classname', className);
      }

      if (style) {
        $(element).attr('style', style);
      }

      if (c) {
        $(element).attr('class', c);
      }

      if (src) {
        $(element).attr('src', src);
      }

      if (controls) {
        $(element).attr('controls', controls);
      }
    }
  });

  let updatedContent = $('body').html().trim();

  const replacements = {
    'classname=': 'className=',
    '&amp;': '&',
  };

  updatedContent = whatsappHelper.replaceMultiple(updatedContent, replacements);

  return updatedContent;
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
      // allow if date
      if (data instanceof Date) {
        return data;
      }
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
    } else if (typeof data === 'number' || typeof data === 'boolean') {
      // Handle primitive types
      return data;
    } else if (data === null || data === undefined) {
      // Handle null and undefined
      return data;
    }

    // return unchanged values
    return data;
  } catch (err) {
    throw new Error(`Error in escapeData: ${err.message}`);
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
      // allow if date
      if (data instanceof Date) {
        return data;
      }
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
      const unescapedString = unescapeAllowedTags(data, allowedTags);
      return whatsappHelper.sanitizeMaliciousAttributes(unescapedString);
    } else if (typeof data === 'number' || typeof data === 'boolean') {
      // Handle primitive types
      return data;
    } else if (data === null || data === undefined) {
      // Handle null and undefined
      return data;
    }

    // Return unchanged values
    return data;
  } catch (err) {
    throw new Error(`Error in parseValidEntities: ${err.message}`);
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
