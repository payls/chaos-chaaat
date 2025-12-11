const trayGmailService = module.exports;
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const { default: axios } = require('axios');

/**
 *
 * @param {string} webhookTrigger
 * @param {string} gmailId
 * @param {string} receiverEmail
 * @param {string} receiverName
 * @param {string} senderEmail
 * @param {string} senderName
 * @param {string} [subject]
 * @param {string} [body]
 * @param {string} [hubspotBccId]
 * @returns {Promise<{email_sent: boolean}>} */

trayGmailService.sendTrayGmailEmail = async (
  trayWebhook,
  gmailId,
  receiverEmail,
  receiverName,
  senderEmail,
  senderName,
  subject,
  body,
  hubspotBccId,
) => {
  const funcName = 'trayGmailService.sendTrayGmailEmail';
  let email_sent = false;

  h.validation.requiredParams(funcName, {
    trayWebhook,
    gmailId,
    receiverEmail,
    receiverName,
    senderEmail,
    senderName,
  });

  if (!trayWebhook || !trayWebhook.send_email) {
    console.log(`${funcName}: tray webhook data is invalid`, { trayWebhook });
    throw new Error(`${funcName}: tray webhook data is invalid`);
  }

  const payload = {
    gmail_id: gmailId,
    to: receiverEmail,
    from: senderEmail,
    cc_email: [], // CC currently not being used
    cc_name: '', // CC currently not being used
    bcc_email: h.notEmpty(hubspotBccId)
      ? `${hubspotBccId}${constant.HUBSPOT.BCC_EMAIL_IN_SUFFIX}`
      : '',
    bcc_name: '', // BCC name currently not being used
    sender_name: senderName,
    receiver_name: receiverName,
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
      console.log(
        `${funcName}: sent email to ${receiverEmail} from ${senderEmail}`,
      );
    }
    email_sent = true;
  } catch (err) {
    console.log(`${funcName}: failed to send email`, { err, payload });
  }

  return email_sent;
};
