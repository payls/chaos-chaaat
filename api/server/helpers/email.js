const fs = require('fs').promises;
const dns = require('dns');
const Mailgun = require('mailgun.js');
const FormData = require('form-data');
const Sentry = require('@sentry/node');
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
};
const emailHelper = module.exports;

/**
 * Generic send email function
 * @param {string} from
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {{language_code?:string,template?:string}} [options={ language_code: 'en', template: 'blankTemplate' }]
 * @returns {Promise<void>}
 */
emailHelper.sendEmail = async (
  from,
  to,
  cc,
  subject,
  text,
  options = { language_code: 'en', template: 'blankTemplate' },
) => {
  const log = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
  const funcName = 'emailHelper.sendEmail';
  const emailData = { from, to, cc, subject, html: '' };
  try {
    if (!from) throw new Error(`${funcName}: missing param from`);
    if (!to) throw new Error(`${funcName}: missing param to`);
    if (!subject) throw new Error(`${funcName}: missing param subject`);
    if (!text) throw new Error(`${funcName}: missing param text`);
    // Initialize mailgun
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
    // Read email template file
    const html = await fs.readFile(
      `server/locales/${options.language_code}/templates/email/${options.template}.html`,
      'utf8',
    );
    // Insert content into email template
    emailData.html = html.replace('[CONTENT]', text);
    if (h.test.isTest()) {
      log.info(`${funcName}: simulating sending of email`, emailData);
    } else {
      // Send email
      await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
    }
    log.info(
      `${funcName}: email sent from ${emailData.from} to ${emailData.to} with subject "${emailData.subject}"`,
    );
  } catch (err) {
    Sentry.captureException(err);
    if (err) log.error(`${funcName}: failed to send email`, { emailData, err });
  }
};

/**
 * Check if email address is hosted with google mail
 * @param {string} email
 */
emailHelper.isGoogleEmailAddress = async (email) => {
  const funcName = 'emailHelper.isGoogleEmailAddress';
  const googleMailEvidences = ['gmail', 'google', 'googlemail'];
  h.validation.requiredParams(funcName, { email });

  const emailSplit = email.split('@');
  if (h.isEmpty(emailSplit)) throw new Error(`${funcName}: invalid email`);
  const emailDomain = emailSplit[1] || '';
  if (h.isEmpty(emailDomain)) throw new Error(`${funcName}: invalid email`);

  /**
   * 1st check: basic google mail evidence lookup on email address
   */
  const emailDomainWithoutTld = emailDomain.split('.')[0];
  if (emailDomainWithoutTld.indexOf('gmail') > -1) {
    return true;
  }

  /**
   * 2nd check: resolve mx records from domain name
   */
  dns.setServers([
    '8.8.8.8', // Google
    '8.8.4.4', // Google
    '9.9.9.9', // Quad9
    '149.112.112.112', // Quad9
    '208.67.222.222', // OpenDNS
    '208.67.220.220', // OpenDNS
  ]);
  const result = await new Promise((resolve, reject) => {
    dns.resolveMx(emailDomain, (err, addresses) => {
      if (err) reject(err);
      else {
        let googleEvidenceFound = false;
        // Convert json object of mx records found into a single json string
        const jsonAddresses = JSON.stringify(addresses).toLowerCase();
        // Iterate through google mail evidences
        for (let i = 0; i < googleMailEvidences.length; i++) {
          const googleMailEvidence = googleMailEvidences[i];
          // find google mail evidences in mx record
          if (jsonAddresses.indexOf(googleMailEvidence) > -1) {
            googleEvidenceFound = true;
          }
        }
        if (googleEvidenceFound) resolve(true);
        else resolve(false);
      }
    });
  });
  return result;
};
