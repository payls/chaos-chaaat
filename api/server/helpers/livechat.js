const Sentry = require('@sentry/node');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
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
const liveChatHelper = module.exports;

liveChatHelper.notifyMessageInteraction = async ({
  agency_id,
  agency_name,
  agent_name,
  agent_email,
  additional_emails,
  contact_name,
  contact_email,
  msg,
  msgType,
  log,
}) => {
  const funcName = 'liveChatHelperHelper.notifyMessageInteraction';
  if (!log) {
    log = {
      info: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }
  try {
    let email_subject = '';
    let email_body = '';
    const additional_recipients_list = [];
    const mediaMsg = ['img_frompave', 'video_frompave', 'file_frompave'];
    const msgTypeContent =
      msgType.charAt(0).toUpperCase() + msgType.slice(1) + ' Message';
    const reply_msg = mediaMsg.includes(msgType)
      ? msgType === 'img_frompave'
        ? 'Photo Message'
        : msgType === 'video_frompave'
        ? 'Video Message'
        : msgType === 'file_frompave'
        ? 'Document Message'
        : 'Message'
      : msg;

    email_subject = h.getMessageByCode(
      'template-livechat-interaction-subject-1639636972368',
      {
        AGENT_FIRST_NAME: agent_name,
      },
    );

    email_body = h.getMessageByCode(
      'template-livechat-interaction-email-body-1651855722401',
      {
        AGENT_FIRST_NAME: agent_name,
        AGENCY: agency_name,
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
        contact_email,
        additional_recipients_list,
        email_subject,
        email_body,
      },
    });
    await h.sendEmail(
      `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
      contact_email,
      additional_recipients_list,
      email_subject,
      email_body,
    );
  } catch (err) {
    Sentry.captureException(err);
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
