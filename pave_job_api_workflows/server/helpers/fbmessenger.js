const fs = require('fs').promises;
const AWS = require('aws-sdk');
const axios = require('axios');
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
  sendEmail: emailHelper.sendEmail,
};
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const fbMessengerHelper = module.exports;

fbMessengerHelper.getMediaURL = async (data, log) => {
  const connectionData = JSON.stringify({
    uri: `fbmessenger://${data.contact_messenger_id}@facebook.com`,
    name: `${data.contact_messenger_id}`,
  });
  const connectionConfig = {
    method: 'post',
    url: 'https://apiv2.unificationengine.com/v2/connection/add',
    headers: {
      Authorization: `Basic ${data.token}`,
      'Content-Type': 'application/json',
    },
    data: connectionData,
  };

  log.info({
    action: 'ADD CONNECTION PAYLOAD',
    payload: connectionData,
  });

  await axios(connectionConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });

  const retrieveMediaData = JSON.stringify({
    uri: `unified://${data.contact_messenger_id}?messageId=${data.message_id}`,
  });

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
    !h.cmpInt(retrieveMediaResponse.Status[data.contact_line_id].status, 200)
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
      retrieveMediaResponse.messages[data.contact_line_id][0].parts[0];

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

fbMessengerHelper.notifyMessageInteraction = async ({
  agency_id,
  agent_name,
  agent_email,
  additional_emails,
  contact_name,
  msg,
  msgType,
  log,
}) => {
  const funcName = 'fbMessengerHelper.notifyMessageInteraction';
  try {
    let email_subject = '';
    let email_body = '';
    let additional_recipients_list = [];
    let reply_msg;
    if (h.cmpStr(msgType, 'image')) {
      reply_msg = 'Photo Message';
    } else if (h.cmpStr(msgType, 'video')) {
      reply_msg = 'Video Message';
    } else {
      reply_msg = msg;
    }

    if (!h.isEmpty(additional_emails)) {
      additional_recipients_list = additional_emails.trim().split(',');
    }

    email_subject = h.getMessageByCode(
      'template-fbmessenger-interaction-subject-1639636972368',
      {
        CONTACT_NAME: contact_name,
      },
    );

    email_body = h.getMessageByCode(
      'template-fbmessenger-interaction-email-body-1651855722401',
      {
        AGENT_FIRST_NAME: agent_name,
        CONTACT_NAME: contact_name,
        MESSAGE: reply_msg,
      },
    );

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
  } catch (err) {
    if (err)
      log.info({
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

fbMessengerHelper.addConnection = async (data, log) => {
  const connectionData = JSON.stringify({
    uri: `fbmessenger://${data.contact_messenger_id}@facebook.com`,
    name: `${data.contact_messenger_id}`,
  });
  const connectionConfig = {
    method: 'post',
    url: 'https://apiv2.unificationengine.com/v2/connection/add',
    headers: {
      Authorization: `Basic ${data.token}`,
      'Content-Type': 'application/json',
    },
    data: connectionData,
  };

  log.info({
    action: 'ADD CONNECTION PAYLOAD',
    payload: connectionData,
  });

  await axios(connectionConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });
};
