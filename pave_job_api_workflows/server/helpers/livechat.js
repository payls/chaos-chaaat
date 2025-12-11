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
const liveChatHelper = module.exports;

liveChatHelper.notifyMessageInteraction = async ({
  agency_id,
  agent_name,
  agent_email,
  additional_emails,
  contact_name,
  msg,
  msgType,
  log,
}) => {
  const funcName = 'liveChatHelperHelper.notifyMessageInteraction';
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
    const reply_msg = mediaMsg.includes(msgType)
      ? msgType === 'image'
        ? 'Photo Message'
        : msgTypeContent
      : msg;

    if (!h.isEmpty(additional_emails)) {
      additional_recipients_list = additional_emails.trim().split(',');
    }

    email_subject = h.getMessageByCode(
      'template-livechat-interaction-subject-1639636972368',
      {
        CONTACT_NAME: contact_name,
      },
    );

    email_body = h.getMessageByCode(
      'template-livechat-interaction-email-body-1651855722401',
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
