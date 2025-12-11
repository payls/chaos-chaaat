const fs = require('fs').promises;
const AWS = require('aws-sdk');
const axios = require('axios');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const fileHelper = require('./file');
const dateHelper = require('./date');
const mime = require('mime-types');
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
  sendEmail: emailHelper.sendEmail,
};
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const whatsappHelper = module.exports;

whatsappHelper.getProposalMessageBody = async (
  agency_name,
  agent_name,
  buyer_name,
  mobile_number,
  permalink,
  trigger_quick_reply,
  is_generic,
  is_template,
  template,
  options = {
    language_code: 'en',
    header_template: 'blankHeaderTemplate',
  },
) => {
  const whatsAppData = {
    agency_name,
    agent_name,
    buyer_name,
    mobile_number,
    permalink,
    trigger_quick_reply,
  };

  // Read whatsapp template file
  const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
    ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
    : permalink;

  const header_html = await fs.readFile(
    `server/locales/${options.language_code}/templates/whatsapp/${options.header_template}.html`,
    'utf8',
  );
  const buyer_name_label = !h.isEmpty(buyer_name) ? buyer_name : mobile_number;
  whatsAppData.header_html = header_html.replace('[BUYER]', buyer_name_label);
  const agent_name_label = !h.isEmpty(agent_name) ? agent_name : mobile_number;
  whatsAppData.header_html = whatsAppData.header_html.replace(
    '[AGENT_FIRST_NAME]',
    agent_name_label,
  );
  whatsAppData.header_html = whatsAppData.header_html.replaceAll(
    '[AGENCY_NAME]',
    agency_name,
  );
  whatsAppData.header_html = whatsAppData.header_html.replace(
    '[PERMALINK]',
    `${permalink_url}`,
  );
  const full_message_body =
    '<strong>Pave Shortlisted Properties for Review</strong>' +
    whatsAppData.header_html;
  // manage message parts
  let currID = 1;
  const messageParts = [];
  messageParts.push({
    id: '1',
    contentType: 'text/html',
    data: `[{"type":"text","text":"${whatsAppData.header_html}"}]`,
    size: whatsAppData.header_html.length,
    type: 'body',
    sort: 0,
  });
  currID++;

  if (h.cmpBool(trigger_quick_reply, true)) {
    messageParts.push({
      id: `${currID}`,
      contentType: 'text/html',
      data: '{"buttons":[{"title":"I\'m Interested","id":"1"},{"title":"This one not for me","id":"2"},{"title":"Not looking","id":"3"},{"title":"Opt me out","id":"4"}]}',
      size: 1000,
      type: 'list_picker/button',
      sort: 1,
    });
    currID++;
    messageParts.push({
      id: `${currID}`,
      contentType: 'text/plain',
      data: '{"title":"Quick Reply Options"}',
      size: 1000,
      type: 'received_message',
      sort: 1,
    });
    currID++;
  } else {
    messageParts.push({
      id: `${currID}`,
      contentType: 'text/html',
      data: '{"buttons":[{"title":"Opt me out","id":"1"}]}',
      size: 1000,
      type: 'list_picker/button',
      sort: 1,
    });
    currID++;
  }

  messageParts.push({
    id: `${currID}`,
    contentType: 'text/html',
    data: '[{"type":"text","text":"Pave Shortlisted Properties for Review"}]',
    size: 1000,
    type: 'header',
    sort: 1,
  });
  currID++;

  // combine message contents
  const sendMessagePartsData = JSON.stringify({
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
  });

  return {
    fullMessageBody: full_message_body,
    sendMessagePartsData: sendMessagePartsData,
  };
};

whatsappHelper.sendWhatsAppMessage = async (
  mobile_number,
  is_receiver_whatsapp_verified,
  full_message_body,
  sendMessageData,
  api_credentials,
  environment,
  log,
) => {
  const funcName = 'whatsappHelper.sendWhatsAppMessage';
  const whatsAppData = {
    mobile_number,
    is_receiver_whatsapp_verified,
    full_message_body,
    sendMessageData,
    api_credentials,
  };

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
        const connectionConfig = {
          method: 'post',
          url: 'https://apiv2.unificationengine.com/v2/connection/add',
          headers: {
            Authorization: `Basic ${api_credentials}`,
            'Content-Type': 'application/json',
          },
          data: connectionData,
        };

        log.info({
          action: 'ADD CONNECTION PAYLOAD',
          payload: connectionData,
        });

        const addConnectionResponse = await axios(connectionConfig)
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            return error;
          });

        log.info({
          action: 'PROCESS ADD',
          number: mobile_number,
        });

        if (!h.cmpInt(addConnectionResponse.status, 200)) {
          log.warn({
            action: 'CONTACT ADD TO CONTACT ERROR',
            response: addConnectionResponse,
          });
          return { original_event_id, full_message_body };
        } else {
          log.info({
            action: 'CONTACT ADD TO CONTACT SUCCESS',
            response: addConnectionResponse,
          });
        }
      }

      log.info({
        action: 'SEND PAYLOAD',
        payload: sendMessageData,
      });

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

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number].status, 200)) {
        log.error({
          action: 'WHATSAPP MESSAGE SENDING ERROR',
          response: sendMessageResponse,
        });
        return { original_event_id, full_message_body };
      } else {
        log.info({
          action: 'WHATSAPP MESSAGE SENDING SUCCESS',
          response: sendMessageResponse,
        });
      }

      original_event_id = sendMessageResponse.URIs[0].substring(
        sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
      );
      console.log(
        `${funcName}: message sent from to ${whatsAppData.mobile_number}"`,
      );
      return { original_event_id, full_message_body };
    }
  } catch (err) {
    if (err)
      console.log(`${funcName}: failed to send whatsapp message`, {
        whatsAppData,
        err,
      });
  }
};

whatsappHelper.getProposalImageBody = async (mobile_number, image) => {
  const extension = image.split('.').pop();
  const contentType = h.cmpStr(extension, 'png') ? 'image/png' : 'image/jpeg';
  // combine message contents
  const sendImagePartsData = JSON.stringify({
    message: {
      receivers: [
        {
          name: 'name',
          address: `${mobile_number}`,
          Connector: `${mobile_number}`,
          type: 'individual',
        },
      ],
      parts: [
        {
          id: '1',
          contentType: `${contentType}`,
          data: `${image}`,
          name: `${image}`,
          size: image.length,
          type: 'image_link',
          sort: 1,
        },
      ],
    },
  });

  return {
    fullImageMessageBody: image,
    imageSendPartData: sendImagePartsData,
  };
};

whatsappHelper.getProposalTemplateBody = async (
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
    ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
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

  template.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      if (['IMAGE', 'VIDEO'].includes(component.format)) {
        const filename = template.header_image.substring(
          template.header_image.lastIndexOf('/') + 1,
        );
        if (['IMAGE'].includes(component.format)) {
          messageTemplate.header.push({
            type: 'image',
            image: { link: template.header_image, filename: filename },
          });
        }
        if (['VIDEO'].includes(component.format)) {
          messageTemplate.header.push({
            type: 'video',
            video: { link: template.header_image, filename: filename },
          });
        }
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      if (typeof component.example !== 'undefined') {
        const examples = component.example.body_text[0];
        examples.forEach((ex, index) => {
          let component_value = null;
          if (template.body_component.length > 0) {
            if (template.body_component[index] === 'agency') {
              component_value = agency_name;
            } else if (template.body_component[index] === 'agent') {
              component_value = agent_name;
            } else if (template.body_component[index] === 'link') {
              component_value = permalink_url;
            } else if (template.body_component[index] === 'email') {
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

  const body = messageTemplate.body;
  const header = messageTemplate.header;
  const button = messageTemplate.button;

  messageTemplate.data = JSON.stringify({
    element_name: template.original_name,
    language: template.language,
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
  };
};

whatsappHelper.sendWhatsAppTemplateMessage = async (
  mobile_number,
  is_receiver_whatsapp_verified,
  full_message_body,
  sendMessageData,
  api_credentials,
  environment,
  send_mode,
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

  try {
    if (h.test.isTest()) {
      console.log(`${funcName}: simulating sending of message`, whatsAppData);
    } else {
      let original_event_id = null;
      if (!mobile_number) return { original_event_id, full_message_body };
      if (!api_credentials) return { original_event_id, full_message_body };
      if (h.isEmpty(api_credentials))
        return { original_event_id, full_message_body };
      console.log(send_mode);
      if (h.cmpStr(send_mode, 'create')) {
        const { success } = await this.addAsWABAContact({
          environment,
          mobile_number,
          api_credentials,
          log,
        });

        if (h.cmpBool(success, false)) {
          return { original_event_id, full_message_body };
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

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number].status, 200)) {
        log.error({
          action: 'TEMPLATE MESSAGE SENDING ERROR',
          response: sendMessageResponse,
        });
        return { original_event_id, full_message_body };
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
      return { original_event_id, full_message_body };
    }
  } catch (err) {
    if (err)
      console.log(`${funcName}: failed to send whatsapp message`, {
        whatsAppData,
        err,
      });
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

      if (!h.cmpInt(sendMessageResponse.Status[mobile_number]?.status, 200)) {
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

whatsappHelper.notifyMessageInteraction = async ({
  agency_id,
  agent_name,
  agent_email,
  additional_emails,
  chat_id,
  contact_id,
  contact_name,
  shortlisted_projects,
  tracker_ref_name,
  wa_link,
  reply_msg,
  msgType,
  is_cta1,
  is_cta2,
  is_confirmation,
  event_details,
  is_real_estate,
  log,
}) => {
  const funcName = 'whatsappHelper.notifyMessageInteraction';
  try {
    let email_subject = '';
    let email_body = '';
    let additional_recipients_list = [];
    const mediaMsg = [
      'image',
      'video',
      'document',
      'location',
      'audio',
      'contact',
    ];
    const msgTypeContent =
      msgType.charAt(0).toUpperCase() + msgType.slice(1) + ' Message';
    reply_msg = mediaMsg.includes(msgType)
      ? msgType === 'image'
        ? 'Photo Message'
        : msgTypeContent
      : reply_msg;

    if (!h.isEmpty(additional_emails)) {
      additional_recipients_list = additional_emails.trim().split(',');
    }

    if (is_confirmation !== undefined) {
      if (h.cmpBool(is_confirmation, false)) {
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
            CHAT_ID: chat_id,
            CONTACT_NAME: contact_name,
            PROJECT_LIST: project_list,
            WHATSAPP_LINK: wa_link,
            REPLY_MSG: reply_msg,
            PRODUCT_OR_PROJECT: is_real_estate ? 'project' : 'product',
            // SHARED_INBOX_LINK: `${config.webAdminUrl}/dashboard/messaging/inbox?campaign=${tracker_ref_name}`,
          },
        );
      } else {
        email_subject = h.getMessageByCode(
          'template-whatsapp-interaction-subject-confirmation-1639636972368',
          {
            CONTACT_NAME: contact_name,
            EVENT: event_details?.campaign,
          },
        );

        email_body = h.getMessageByCode(
          'template-whatsapp-interaction-email-body-confirmation-1651855722401',
          {
            AGENT_FIRST_NAME: agent_name,
            CONTACT_NAME: contact_name,
            EVENT: event_details?.campaign,
            EVENT_DETAILS: event_details?.event_details,
            CONFIRMATION: is_cta1 ? 'confirmed' : 'declined',
          },
        );
      }

      log.info({
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
      await h.sendEmail(
        `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
        agent_email,
        additional_recipients_list,
        email_subject,
        email_body,
      );
    }
  } catch (err) {
    if (err)
      log.info({
        err,
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

whatsappHelper.markReplyAsRead = async ({
  original_event_id,
  mobile_number,
  api_credentials,
  log,
}) => {
  const funcName = 'whatsappHelper.markReplyAsRead';
  try {
    const markReplyAsReadConfig = {
      method: 'post',
      url: 'https://apiv2.unificationengine.com/v2/message/status',
      headers: {
        Authorization: `Basic ${api_credentials}`,
        'Content-Type': 'application/json',
      },
      data: {
        message: [
          {
            uri: `unified://${mobile_number}?messageId=${original_event_id}`,
            status: 'read',
          },
        ],
      },
    };

    const markReplyAsReadResponse = await axios(markReplyAsReadConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });

    if (!h.cmpInt(markReplyAsReadResponse.status, 200)) {
      log.warn({
        action: 'REPLY MARKED AS READ ERROR',
        response: markReplyAsReadResponse,
      });
      return { success: false };
    } else {
      log.info({
        action: 'REPLY MARKED AS READ SUCCESS',
        response: markReplyAsReadResponse,
      });
    }
  } catch (err) {
    if (err)
      log.info({
        error: `${funcName}: failed to mark reply as read`,
        data: {
          funcName,
          original_event_id,
          err,
        },
      });
  }
};

whatsappHelper.getWABAQualityRating = async ({ api_credentials, waba_id }) => {
  const config = {
    method: 'get',
    url: `https://template.unificationengine.com/waba/status?access_token=${waba_id}`,
    headers: {
      Authorization: `Basic ${api_credentials}`,
    },
  };

  const quality = await axios(config)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });

  console.log({
    action: 'WABA Quality Check',
    response: JSON.stringify(quality),
  });

  return quality;
};

whatsappHelper.addAsWABAContact = async ({
  environment,
  mobile_number,
  api_credentials,
  log,
}) => {
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
    return { success: true };
  }
};

whatsappHelper.notifyUserMessageInteraction = async ({
  agency_id,
  agent_name,
  agent_email,
  additional_emails,
  chat_id,
  contact_id,
  contact_name,
  replyMsg,
  msgType,
  newMsg,
  log,
}) => {
  const funcName = 'whatsappHelper.notifyUserMessageInteraction';
  try {
    log.info({
      action: 'whatsappHelper.notifyUserMessageInteraction',
      data: {
        agency_id,
        agent_name,
        agent_email,
        additional_emails,
        chat_id,
        contact_name,
        replyMsg,
        msgType,
        newMsg,
        log,
      },
    });
    let email_subject = '';
    let email_body = '';
    let additional_recipients_list = [];
    const mediaMsg = [
      'image',
      'video',
      'document',
      'location',
      'audio',
      'contact',
    ];
    let contactReplyMsg = replyMsg;
    if (mediaMsg.includes(msgType)) {
      switch (msgType) {
        case 'video':
          contactReplyMsg = 'Video Message';
          break;
        case 'image':
          contactReplyMsg = 'Photo Message';
          break;
        case 'document':
          contactReplyMsg = 'Document Message';
          break;
        case 'location':
          contactReplyMsg = 'Location Message';
          break;
        case 'audio':
          contactReplyMsg = 'Audio Message';
          break;
        case 'contact':
          contactReplyMsg = 'Contact Info Message';
          break;
        default:
          contactReplyMsg = replyMsg;
          break;
      }
    } else {
      contactReplyMsg = replyMsg;
    }

    if (!h.isEmpty(additional_emails)) {
      additional_recipients_list = additional_emails.trim().split(',');
    }

    if (newMsg) {
      email_subject = h.getMessageByCode(
        'template-whatsapp-user-interaction-subject-user-initiated-1639636972368',
        {
          CONTACT_NAME: contact_name,
        },
      );

      email_body = h.getMessageByCode(
        'template-whatsapp-user-interaction-email-body-user-initiated-1651855722401',
        {
          AGENT_FIRST_NAME: agent_name,
          CHAT_ID: chat_id,
          CONTACT_NAME: contact_name,
          REPLY_MSG: contactReplyMsg,
        },
      );
    } else {
      email_subject = h.getMessageByCode(
        'template-whatsapp-user-interaction-subject-user-message-1639636972368',
        {
          CONTACT_NAME: contact_name,
        },
      );

      email_body = h.getMessageByCode(
        'template-whatsapp-user-interaction-email-body-user-message-1651855722401',
        {
          AGENT_FIRST_NAME: agent_name,
          CHAT_ID: chat_id,
          CONTACT_NAME: contact_name,
          REPLY_MSG: contactReplyMsg,
        },
      );
    }

    log.info({
      action: `${funcName}: attempt to send user message interaction notification`,
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

    await h.sendEmail(
      `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
      agent_email,
      additional_recipients_list,
      email_subject,
      email_body,
    );
  } catch (err) {
    if (err)
      log.info({
        err,
        error: `${funcName}: failed to send interaction notification`,
        data: {
          funcName,
          agent_name,
          contact_name,
          err,
        },
      });
  }
};

whatsappHelper.getWhatsAppToken = async (waba) => {
  const { agency_whatsapp_api_token, agency_whatsapp_api_secret } = waba;
  return Buffer.from(
    agency_whatsapp_api_token + ':' + agency_whatsapp_api_secret,
    'utf8',
  ).toString('base64');
};

whatsappHelper.retrieveMedia = async (data, log) => {
  const retrieveMediaConfig = {
    method: 'post',
    url: 'https://apiv2.unificationengine.com/v2/message/retrieve',
    headers: {
      Authorization: `Basic ${data.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: data.params,
  };

  const retrieveMediaResponse = await axios(retrieveMediaConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });

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
    return {
      success: true,
      data: retrieveMediaResponse.messages[data.receiver_number],
    };
  }
};

whatsappHelper.getMediaURL = async (data, log) => {
  let retrieveMediaData;
  let doc_data;
  const msg_details = data.msg_details;

  if (h.cmpStr(data.msg_type, 'document')) {
    doc_data = msg_details.split('|');
    retrieveMediaData = JSON.stringify({
      uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${doc_data[0]}`,
    });
  } else if (h.cmpStr(data.msg_type, 'image')) {
    doc_data = msg_details.split('|');
    if (doc_data instanceof Array) {
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${doc_data[0]}`,
      });
    } else {
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${msg_details}`,
      });
    }
  } else if (h.cmpStr(data.msg_type, 'video')) {
    doc_data = msg_details.split('|');
    if (doc_data instanceof Array) {
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${doc_data[0]}`,
      });
    } else {
      retrieveMediaData = JSON.stringify({
        uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${msg_details}`,
      });
    }
  } else {
    retrieveMediaData = JSON.stringify({
      uri: `unified://${data.receiver_number}?messageId=${data.receiver_number}&mediaId=${msg_details}`,
    });
  }

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
      return error;
    });

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
      fileURL: fullRemoteFileUrl,
      contentType: fileContentType,
    };
  }
};

whatsappHelper.checkIfQuickReplyIsMonitored = (
  settings,
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
    let cta_reply = 0;
    if (h.cmpBool(settings.cta_1_option, true)) {
      cta_reply = 1;
    }
    if (h.cmpBool(settings.cta_2_option, true)) {
      cta_reply = 2;
    }
    // if (h.cmpBool(settings.opt_out, true)) {
    //   cta_reply = 3;
    // }
    saved_quick_replies.push({
      type: 'template',
      name: reply,
      value: reply.toLowerCase(),
      response: '',
      send_reply: true,
      opt_out: false,
      email: true,
      cta_reply: cta_reply,
    });
  }

  return saved_quick_replies;
};

/**
 * Description
 * Function to get contact name details from UIB or from the receiver url
 * @constant
 * @name prepareWhatsAppContactName
 * @param {string} receiver_url contact number url
 * @param {string} agency_id agency ID
 */
whatsappHelper.prepareWhatsAppContactName = ({ receiver_url, agency_id }) => {
  const whatsAppReceiverURL = new URL(receiver_url);
  const searchParams = new URLSearchParams(whatsAppReceiverURL.search);
  const whatsAppName = searchParams.get('name');
  let colorRandomKey;
  let objectRandomKey;
  let contactFirstName;
  let contactLastName;
  let contactStatus = 'active';
  if (h.notEmpty(whatsAppName)) {
    const firstSpaceIndex = whatsAppName.indexOf(' ');
    if (!h.cmpInt(firstSpaceIndex, -1)) {
      contactFirstName = whatsAppName.slice(0, firstSpaceIndex);
      contactLastName = whatsAppName.slice(firstSpaceIndex + 1);
    } else {
      contactFirstName = whatsAppName;
      contactLastName = null;
    }

    contactLastName = h.isEmpty(contactLastName)
      ? '[No Last Name]'
      : contactLastName;
  } else {
    const colors = constant.RANDOM_NAME.COLOR;
    const colorEntries = Object.entries(colors);
    const colorRandomIndex = Math.floor(Math.random() * colorEntries.length);
    [colorRandomKey, contactFirstName] = colorEntries[colorRandomIndex];
    const objects = constant.RANDOM_NAME.OBJECT;
    const objectEntries = Object.entries(objects);
    const objectRandomIndex = Math.floor(Math.random() * objectEntries.length);
    [objectRandomKey, contactLastName] = objectEntries[objectRandomIndex];
    contactStatus = 'outsider';
  }

  return { contactFirstName, contactLastName, contactStatus };
};

/*
 * Getting message type
 */
whatsappHelper.getMessageType = (part) => {
  const { contentType, data /* originalEvent */ } = part;

  if (contentType === 'status') {
    return data;
  }

  return contentType;
};

/*
 * Getting message update value
 */
whatsappHelper.getUpdateValue = (msg_type) => {
  const forUpdate = {
    pending: false,
  };
  switch (msg_type) {
    case 'failed':
      forUpdate.failed = 1;
      forUpdate.sent = 0;
      forUpdate.delivered = 0;
      forUpdate.read = 0;
      break;
    case 'sent':
      forUpdate.sent = 1;
      break;
    case 'delivered':
      forUpdate.sent = 1;
      forUpdate.delivered = 1;
      break;
    case 'read':
      forUpdate.read = 1;
      forUpdate.sent = 1;
      forUpdate.delivered = 1;
      break;
    default:
      forUpdate.read = 1;
      forUpdate.sent = 1;
      forUpdate.delivered = 1;
      forUpdate.replied = 1;
      break;
  }

  return forUpdate;
};

/**
 * Checks if an automation is already lapsed
 * @constant
 * @name isAutomationLapsed
 * @type {typeof module.exports}
 */
whatsappHelper.isAutomationLapsed = (
  contactMessageWABAForFirstTimeRule,
  latestWhatsAppChatRecord,
) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (h.notEmpty(latestWhatsAppChatRecord)) {
    const currentDate = new Date();

    const currentUtcDateString = dateHelper.convertUTCDateToLocalDate(
      currentDate,
      timeZone,
    );

    const msgDate = dateHelper.convertUTCDateToLocalDate(
      latestWhatsAppChatRecord.dataValues.created_date_raw,
      timeZone,
    );

    const date1 = new Date(currentUtcDateString);
    const date2 = new Date(msgDate);

    const timeDifference = date1 - date2;
    let hoursDifference = timeDifference / (1000 * 60 * 60);
    hoursDifference = Math.round(hoursDifference);

    return (
      hoursDifference >=
      contactMessageWABAForFirstTimeRule.dataValues.workflow_timeout_count
    );
  }

  return false;
};

/**
 * Gets corresponding message label based on message type
 *
 * @constant
 * @name getContactReplyMessageLabel
 * @type {typeof module.exports}
 */
whatsappHelper.getContactReplyMessageLabel = (replyMsg, msg_type) => {
  let contactReplyMsg;
  switch (msg_type) {
    case 'video':
      contactReplyMsg = 'Video';
      break;
    case 'image':
      contactReplyMsg = 'Photo';
      break;
    case 'document':
      contactReplyMsg = 'Document';
      break;
    case 'location':
      contactReplyMsg = 'Location';
      break;
    case 'audio':
      contactReplyMsg = 'Audio';
      break;
    case 'contact':
      contactReplyMsg = 'Contact Info';
      break;
    default:
      contactReplyMsg = replyMsg;
      break;
  }

  return contactReplyMsg;
};

/**
 * The code snippet is defining an asynchronous function called `getTrialMessageBody` that takes an object as an argument.
 * This function is used to generate the first trial message body to be sent to contact who sent a message to the trial number
 * @async
 * @constant
 * @name getTrialMessageBody
 */
whatsappHelper.getTrialMessageBody = async ({
  contact_name,
  receiver_number,
}) => {
  let full_message_body = `Hi ${contact_name} 👋 ,\n\nThank you for your message.\nHow can we help you today?`;
  // manage message parts
  let currID = 1;
  const messageParts = [];
  messageParts.push({
    id: '1',
    contentType: 'text/html',
    data: `[{"type":"text","text":"${full_message_body}"}]`,
    size: full_message_body.length,
    type: 'body',
    sort: 0,
  });
  currID++;

  const quick_replies = ['Learn about Chaaat', 'Pricing Details', 'Contact Us'];
  for (let index = 0; index < quick_replies.length; index++) {
    messageParts.push({
      id: `${currID}`,
      contentType: 'text/plain',
      data: `{"title": "${quick_replies[index]}", "payload": "${quick_replies[index]}"}`,
      size: quick_replies[index].length,
      type: 'quickreply',
      sort: 1,
    });
    full_message_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${quick_replies[index]}</button>`;
    currID++;
  }

  // combine message contents
  const sendMessagePartsData = JSON.stringify({
    message: {
      receivers: [
        {
          name: 'name',
          address: `${receiver_number}`,
          Connector: `${receiver_number}`,
          type: 'individual',
        },
      ],
      parts: messageParts,
    },
  });

  return {
    fullMessageBody: full_message_body,
    sendMessagePartsData: sendMessagePartsData,
  };
};

whatsappHelper.retrieveContactName = async ({
  addContactResponse,
  waba,
  receiver_number,
  receiver_url,
  contactOwner,
}) => {
  let first_name;
  let last_name;
  const agency_user_fk = contactOwner;
  let contactStatus = 'active';
  let contactNameRetrieved = false;
  if (h.cmpBool(addContactResponse.success, true)) {
    console.log(
      'getting contact name when new contact using UIB and receiver URL',
    );
    const waUserProfile = await generalHelper.getUIBChannelUserProfile({
      user_profile_id: receiver_number,
      api_token: waba?.agency_whatsapp_api_token,
      api_secret: waba?.agency_whatsapp_api_secret,
    });
    if (!h.isEmpty(waUserProfile.displayName)) {
      const lineProfileName = waUserProfile.displayName;
      const firstSpaceIndex = lineProfileName.indexOf(' ');
      first_name = lineProfileName.slice(0, firstSpaceIndex);
      last_name = lineProfileName.slice(firstSpaceIndex + 1);
      contactNameRetrieved = true;
    }
  }

  // name retrieval
  if (h.cmpBool(contactNameRetrieved, false)) {
    const whatsAppReceiverURL = new URL(receiver_url);
    const searchParams = new URLSearchParams(whatsAppReceiverURL.search);
    const whatsAppName = searchParams.get('name');

    if (!h.isEmpty(whatsAppName)) {
      const firstSpaceIndex = whatsAppName.indexOf(' ');
      if (!h.cmpInt(firstSpaceIndex, -1)) {
        first_name = whatsAppName.slice(0, firstSpaceIndex);
        last_name = whatsAppName.slice(firstSpaceIndex + 1);
      } else {
        first_name = whatsAppName;
        last_name = null;
      }
    } else {
      let colorRandomKey, objectRandomKey;
      const colors = constant.RANDOM_NAME.COLOR;
      const colorEntries = Object.entries(colors);
      const colorRandomIndex = Math.floor(Math.random() * colorEntries.length);
      [colorRandomKey, first_name] = colorEntries[colorRandomIndex];
      const objects = constant.RANDOM_NAME.OBJECT;
      const objectEntries = Object.entries(objects);
      const objectRandomIndex = Math.floor(
        Math.random() * objectEntries.length,
      );
      [objectRandomKey, last_name] = objectEntries[objectRandomIndex];
      contactStatus = 'outsider';
    }
  }

  return { first_name, last_name, agency_user_fk, contactStatus };
};
