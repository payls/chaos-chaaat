const Sentry = require('@sentry/node');
const constant = require('../constants/constant.json');
const h = require('../helpers');
const { sendGmailEmail, getTokens } = require('../services/email/gmail');

module.exports.makeGmailIntegrationController = (models) => {
  const { agency_user_email_oauth: agencyUserEmailOauthModel } = models;
  const gmailIntegrationController = {};

  gmailIntegrationController.sendEmail = async ({
    agency_user_fk,
    email,
    subject,
    body,
  }) => {
    const funcName = 'gmailIntegrationController.sendEmail';
    console.log(agencyUserEmailOauthModel);
    let tokens = {};
    try {
      const oauth = await agencyUserEmailOauthModel.findOne({
        where: {
          agency_user_fk,
          status: 'ACTIVE',
          source: 'GMAIL',
        },
        include: [
          {
            model: models.agency_user,
            required: true,
            include: [
              {
                model: models.user,
                required: true,
              },
            ],
          },
        ],
      });

      if (oauth) {
        const { access_info, agency_user } = oauth.dataValues;

        tokens = JSON.parse(access_info);

        await sendGmailEmail({
          senderName: agency_user.user.full_name,
          senderEmail: agency_user.user.email,
          receiverEmail: email,
          subject,
          body,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
        return true;
      }
      return false;
    } catch (error) {
      Sentry.captureException(error);
      console.log(`${funcName}: ${error}`);
      return false;
    }
  };

  return gmailIntegrationController;
};
