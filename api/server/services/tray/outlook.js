const trayOutlookService = module.exports;
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const { default: axios } = require('axios');

/**
 *
 * @param {string} webhookTrigger
 * @param {string} receiverEmail
 * @param {string} senderName
 * @param {string} [subject]
 * @param {string} [body]
 * @param {string} [hubspotBccId]
 * @returns {Promise<{email_sent: boolean}>}
 */

trayOutlookService.sendTrayOutlookEmail = async (
  trayWebhook,
  receiverEmail,
  senderName,
  subject,
  body,
  hubspotBccId,
) => {
  const funcName = 'trayOutlookService.sendTrayOutlookEmail';
  let email_sent = false;
  h.validation.requiredParams(funcName, {
    trayWebhook,
    receiverEmail,
    senderName,
  });

  if (!trayWebhook || !trayWebhook.send_email) {
    console.log(`${funcName}: tray webhook data is invalid`, { trayWebhook });
    throw new Error(`${funcName}: tray webhook data is invalid`);
  }

  const payload = {
    to: receiverEmail,
    sender_name: senderName,
    bcc_email: h.notEmpty(hubspotBccId)
      ? `${hubspotBccId}${constant.HUBSPOT.BCC_EMAIL_IN_SUFFIX}`
      : '',
    mail_subject: subject,
    mail_body: body,
  };

  const axiosConfig = {
    method: 'post',
    url: trayWebhook.send_email,
    data: payload,
  };

  try {
    const response = await axios(axiosConfig);
    if (response.status !== 200) {
      console.log(`${funcName}: failed to send email`, { payload });
    } else {
      console.log(`${funcName}: sent email to ${receiverEmail} via outlook`);
    }
    email_sent = true;
  } catch (err) {
    console.log(`${funcName}: failed to send email`, { err, payload });
  }

  return email_sent;
};
