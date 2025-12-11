const fs = require('fs').promises;
const axios = require('axios');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const h = {
  isEmpty: generalHelper.isEmpty,
  test: {
    isTest: testHelper.isTest,
  },
  validation: {
    requiredParams: validationHelper.requiredParams,
  },
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
};
const smsHelper = module.exports;

smsHelper.getProposalMessageBody = async (
  agency_name,
  agent_name,
  buyer_name,
  mobile_number,
  permalink,
  options = {
    language_code: 'en',
    header_template: 'blankHeaderTemplate',
  },
) => {
  const smsData = {
    agency_name,
    agent_name,
    buyer_name,
    mobile_number,
    permalink,
  };

  // Read whatsapp template file
  const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
    ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
    : permalink;
  const header_html = await fs.readFile(
    `server/locales/${options.language_code}/templates/sms/${options.header_template}.html`,
    'utf8',
  );
  smsData.header_html = header_html.replace('[BUYER]', buyer_name);
  smsData.header_html = smsData.header_html.replace(
    '[AGENT_FIRST_NAME]',
    agent_name,
  );
  smsData.header_html = smsData.header_html.replaceAll(
    '[AGENCY_NAME]',
    agency_name,
  );
  smsData.header_html = smsData.header_html.replace(
    '[PERMALINK]',
    `${permalink_url}`,
  );
  const full_message_body = smsData.header_html;

  // manage message parts
  const messageParts = [];
  messageParts.push({
    id: '1',
    contentType: 'text/plain',
    data: `${smsData.header_html}`,
    size: smsData.header_html.length,
    type: 'body',
    sort: 1,
  });

  // combine message contents
  const sendMessagePartsData = JSON.stringify({
    message: {
      sender: {
        address: `18312822715`,
      },
      receivers: [
        {
          name: `${buyer_name}`,
          address: `${mobile_number}`,
          Connector: `${mobile_number}_sms`,
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

smsHelper.sendSmsAppMessage = async (
  mobile_number,
  is_agency_sms_connectoion,
  full_message_body,
  sendMessageData,
  api_credentials,
) => {
  const funcName = 'smsHelper.sendSmsAppMessage';
  const smsData = {
    mobile_number,
    is_agency_sms_connectoion,
    full_message_body,
    sendMessageData,
    api_credentials,
  };
  try {
    if (h.test.isTest()) {
      console.info(`${funcName}: simulating sending of message`, smsData);
    } else {
      let sms_message_sid = null;
      if (!mobile_number) return { sms_message_sid, full_message_body };
      if (!api_credentials) return { sms_message_sid, full_message_body };
      if (h.isEmpty(api_credentials))
        return { sms_message_sid, full_message_body };

      if (
        mobile_number &&
        h.cmpBool(smsData.is_agency_sms_connectoion, false)
      ) {
        // Add contact as sms connection
        const connectionData = JSON.stringify({
          uri: `sms://${mobile_number}@twilio.com`,
          name: `${mobile_number}_sms`,
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
          return { sms_message_sid, full_message_body };
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

      console.info(sendMessageResponse);

      if (
        !h.cmpInt(
          sendMessageResponse.Status[`${mobile_number}_sms`].status,
          200,
        )
      )
        return { sms_message_sid, full_message_body };

      sms_message_sid = sendMessageResponse.URIs[0].substring(
        sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
      );
      console.info(
        `${funcName}: message sent from to ${smsData.mobile_number}"`,
      );
      return { sms_message_sid, full_message_body };
    }
  } catch (err) {
    if (err)
      console.info(`${funcName}: failed to send sms`, {
        smsData,
        err,
      });
  }
};

smsHelper.getFollowUpSmsBody = async (
  mobile_number,
  receiver_name,
  sender_number,
  sender_name,
  message,
) => {
  const funcName = 'smsHelper.getFollowUpSmsBody';
  // manage message parts
  const messageParts = [];
  messageParts.push({
    id: '1',
    contentType: 'text/plain',
    data: `${message}`,
    size: message.length,
    type: 'body',
    sort: 1,
  });

  // combine message contents
  const sendMessagePartsData = JSON.stringify({
    message: {
      sender: {
        address: sender_name,
      },
      receivers: [
        {
          name: `${receiver_name}`,
          address: `${mobile_number}`,
          Connector: `${mobile_number}_sms`,
        },
      ],
      parts: messageParts,
    },
  });

  console.info(
    JSON.stringify({
      function: funcName,
      data: sendMessagePartsData,
    }),
  );

  return sendMessagePartsData;
};

smsHelper.sendFollowUpSms = async (
  mobile_number,
  is_agency_sms_connection,
  smsMessageParts,
  agencyBufferedCredentials,
) => {
  const funcName = 'smsHelper.sendFollowUpSms';
  if (mobile_number && h.cmpBool(is_agency_sms_connection, false)) {
    // Add contact as sms connection
    const connectionData = JSON.stringify({
      uri: `sms://${mobile_number}@twilio.com`,
      name: `${mobile_number}_sms`,
    });

    const connectionConfig = {
      method: 'post',
      url: 'https://apiv2.unificationengine.com/v2/connection/add',
      headers: {
        Authorization: `Basic ${agencyBufferedCredentials}`,
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

    console.info('===============');
    console.info('ADD CONNECTION RESPONSE');
    console.info('===============');
    console.info(JSON.stringify(addConnectionResponse, null, 2));
    console.info('===============');

    if (!h.cmpInt(addConnectionResponse.status, 200))
      return {
        success: false,
        sms_sid: null,
        error: 'unable to add connection',
      };
  }

  const sendMessageConfig = {
    method: 'post',
    url: 'https://apiv2.unificationengine.com/v2/message/send',
    headers: {
      Authorization: `Basic ${agencyBufferedCredentials}`,
      'Content-Type': 'application/json',
    },
    data: smsMessageParts,
  };
  const sendMessageResponse = await axios(sendMessageConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });

  console.info('===============');
  console.info('SMS SENDING RESPONSE');
  console.info('===============');
  console.info(JSON.stringify(sendMessageResponse, null, 2));
  console.info('===============');

  if (!h.cmpInt(sendMessageResponse.Status[`${mobile_number}_sms`].status, 200))
    return {
      success: false,
      sms_sid: null,
      error: 'unable to send message',
    };

  const sms_message_sid = sendMessageResponse.URIs[0].substring(
    sendMessageResponse.URIs[0].lastIndexOf('/') + 1,
  );
  console.info(`${funcName}: message sent from to ${mobile_number}"`);
  return {
    success: true,
    sms_sid: sms_message_sid,
    error: null,
  };
};
