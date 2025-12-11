const fs = require('fs').promises;
const dns = require('dns');
const Mailgun = require('mailgun-js');
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
  subject,
  text,
  options = { language_code: 'en', template: 'blankTemplate' },
) => {
  const funcName = 'emailHelper.sendEmail';
  const emailData = { from, to, subject, html: '' };
  try {
    if (!from) throw new Error(`${funcName}: missing param from`);
    if (!to) throw new Error(`${funcName}: missing param to`);
    if (!subject) throw new Error(`${funcName}: missing param subject`);
    if (!text) throw new Error(`${funcName}: missing param text`);
    // Initialize mailgun
    const mailgun = new Mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
    // Read email template file
    const html = await fs.readFile(
      `server/locales/${options.language_code}/templates/email/${options.template}.html`,
      'utf8',
    );
    // Insert content into email template
    emailData.html = html.replace('[CONTENT]', text);
    if (h.test.isTest()) {
      console.log(`${funcName}: simulating sending of email`, emailData);
    } else {
      // Send email
      await new Promise((resolve, reject) => {
        mailgun.messages().send(emailData, (err, body) => {
          if (err) reject(err);
          else resolve(body);
        });
      });
    }
    console.log(
      `${funcName}: email sent from ${emailData.from} to ${emailData.to} with subject "${emailData.subject}"`,
    );
  } catch (err) {
    if (err)
      console.log(`${funcName}: failed to send email`, { emailData, err });
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
