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
const fbMessengerHelper = module.exports;

fbMessengerHelper.sendMessage = async ({
  sender_id,
  receiver_id,
  message,
  returnPath,
  access_token,
  type,
  log,
}) => {
  const funcName = 'fbMessengerHelper.sendMessage';
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
      if (h.cmpStr(type, 'text')) {
        sendMessageData = JSON.stringify({
          recipient: {
            id: receiver_id,
          },
          messaging_type: 'RESPONSE',
          message: {
            text: message,
          },
        });
      } else if (h.cmpStr(type, 'image')) {
        sendMessageData = JSON.stringify({
          recipient: {
            id: receiver_id,
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: message,
                is_reusable: true,
              },
            },
          },
        });
      } else if (h.cmpStr(type, 'video')) {
        sendMessageData = JSON.stringify({
          recipient: {
            id: receiver_id,
          },
          message: {
            attachment: {
              type: 'video',
              payload: {
                url: message,
                is_reusable: true,
              },
            },
          },
        });
      } else if (h.cmpStr(type, 'file')) {
        sendMessageData = JSON.stringify({
          recipient: {
            id: receiver_id,
          },
          message: {
            attachment: {
              type: 'file',
              payload: {
                url: message,
                is_reusable: true,
              },
            },
          },
        });
      }

      const sendMessageConfig = {
        method: 'post',
        url: `https://graph.facebook.com/v19.0/${sender_id}/messages?access_token=${access_token}`,
        data: sendMessageData,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const sendMessageResponse = await axios(sendMessageConfig)
        .then(function (response) {
          return response;
        })
        .catch(function (error) {
          Sentry.captureException(error);
          return error;
        });

      console.log(sendMessageResponse);
      if (!h.cmpInt(sendMessageResponse.status, 200))
        return { success: false, sendMessageResponse };

      const original_event_id = sendMessageResponse.data.message_id;
      log.info(`${funcName}: message sent from ${sender_id} to ${receiver_id}`);
      return { original_event_id, success: true };
    }
  } catch (err) {
    Sentry.captureException(err);
    if (err) {
      console.log(err);
      log.info(`${funcName}: failed to send messenger message`, {
        funcName,
        sender_id,
        receiver_id,
        message,
        err,
      });
    }

    return { success: false };
  }
};
