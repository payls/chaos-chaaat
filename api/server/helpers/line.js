const fs = require('fs').promises;
const Sentry = require('@sentry/node');
const axios = require('axios');
const { Console } = require('console');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const fileHelper = require('./file');
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
  email: {
    sendEmail: emailHelper.sendEmail,
  },
  log: generalHelper.log,
};
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const lineHelper = module.exports;

lineHelper.sendMessage = async ({
  contact_line_id,
  message_config,
  api_credentials,
  log,
}) => {
  const funcName = 'lineHelper.sendLineMessage';
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
      const sendMessageData = JSON.stringify(message_config);
      // Send line message
      const sendMessageConfig = {
        method: 'post',
        url: 'https://api.line.me/v2/bot/message/push',
        headers: {
          Authorization: `Bearer ${api_credentials}`,
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

      if (!h.isEmpty(sendMessageResponse.message))
        return { success: false, error: sendMessageResponse };

      log.info(`${funcName}: message sent from to ${contact_line_id}`);
      return {
        msg_id: sendMessageResponse.sentMessages[0].id,
        quoteToken: sendMessageResponse.sentMessages[0].quoteToken,
        success: true,
      };
    }
  } catch (err) {
    Sentry.captureException(err);
    if (err) {
      console.log(err);
      log.info(`${funcName}: failed to send line message`, {
        funcName,
        message_config,
        err,
      });
    }

    return { success: false, error: err };
  }
};

lineHelper.formatTemplateMessageForSaving = async ({
  template_type,
  message,
  agent,
  contact,
  with_image,
}) => {
  let msg_body = '';
  if (template_type === 'BASIC') {
    message.forEach(function (component) {
      if (h.cmpStr(component.type, 'image')) {
        msg_body += `<img src="${component.originalContentUrl}" class="campaign_header_image" style="width: 100%; margin-bottom: 10px; background-color: #ffffff;">`;
      } else if (h.cmpStr(component.type, 'video')) {
        msg_body += `<video controls="" class="campaign_header_image" src="${component.originalContentUrl}" style="width: 100%; margin-bottom: 10px; background-color: #ffffff;"></video>`;
      } else if (h.cmpStr(component.type, 'text')) {
        msg_body += component.text;
        if (!h.isEmpty(component.quickReply)) {
          const buttons = component.quickReply;
          buttons.items.forEach((btn, index) => {
            msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.action.label}</button>`;
          });
        }
      }
    });
  } else if (template_type === 'CONFIRM') {
    const component = message.template;
    msg_body += component.text;
    const buttons = component.actions;
    buttons.forEach((btn, index) => {
      msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.label}</button>`;
    });
  } else if (template_type === 'BUTTON') {
    const component = message.template;
    if (h.cmpBool(with_image, true)) {
      msg_body += `<img src="${component.thumbnailImageUrl}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px; background-color: #ffffff;">`;
    }
    if (!h.isEmpty(component.title)) {
      msg_body += `<div style="display:block; margin-top: 5px; margin-bottom: 10px; width: 100%; font-size: 20px; font-weight: bolder;">${component.title}</div>`;
    }
    msg_body += component.text;
    const buttons = component.actions;
    buttons.forEach((btn, index) => {
      if (btn.option_type.label[0] === 'Text') {
        msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.label}</button>`;
      } else if (btn.option_type.label[0] === 'Phone') {
        msg_body += `<a href="${btn.uri}" style="text-decoration: none;"><button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn ">${btn.label}</button></a>`;
      } else if (btn.option_type.label[0] === 'Link') {
        msg_body += `<a href="${btn.uri}" style="text-decoration: none;" target="_blank"><button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn ">${btn.label}</button></a>`;
      }
    });
  }

  return msg_body;
};

lineHelper.sendOptInMessage = async ({
  message_config,
  api_credentials,
  log,
}) => {
  const funcName = 'lineHelper.sendOptInMessage';
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
      const sendMessageData = JSON.stringify(message_config);
      // Send line message
      const sendMessageConfig = {
        method: 'post',
        url: 'https://api.line.me/v2/bot/message/broadcast',
        headers: {
          Authorization: `Bearer ${api_credentials}`,
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
      if (!h.isEmpty(sendMessageResponse))
        return { success: false, error: sendMessageResponse };

      log.info(`${funcName}: line opt in broadcast message sent`);
      return {
        success: true,
      };
    }
  } catch (err) {
    Sentry.captureException(err);
    if (err) {
      console.log(err);
      log.info(`${funcName}: failed to send line opt in broadcast message`, {
        funcName,
        message_config,
        err,
      });
    }

    return { success: false, error: err };
  }
};
