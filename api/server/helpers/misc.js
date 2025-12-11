const miscHelper = module.exports;
const emailHelper = require('./email');

/**
 * Method to send emails to Alan and charlie
 * @param subject
 * @param activity_type
 * @param agency_name
 * @param user_name
 * @param user_email
 * @returns {Promise<void>}
 */
miscHelper.sendEmailToAlanAndCharlie = async (
  subject,
  activity_type,
  agency_name,
  user_name,
  user_email,
) => {
  const emails = [];
  for (const email of emails) {
    await emailHelper.sendEmail(
      `Chaaat <no-reply@chaaat.io>`,
      email,
      subject,
      `${user_name} (${user_email}) from ${agency_name} did activity: ${activity_type}`,
    );
  }
};
