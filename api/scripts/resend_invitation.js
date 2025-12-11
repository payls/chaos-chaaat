/* edit server/helpers/email.js to run backend script
 * manually supply mailgun api key and domain
 */
const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;

const agency_id = '1f880948-0097-40a8-b431-978fd59ca321'; // agency

async function resend_invitation() {
  const agency = await models.agency.findOne({
    where: {
      agency_id: agency_id,
    },
  });

  const agency_name = agency?.dataValues?.agency_name;

  const agency_users = await models.agency_user.findAll({
    where: {
      agency_fk: agency_id,
    },
    include: [
      {
        model: models.user,
        where: { status: 'inactive' },
        required: true,
      },
    ],
  });

  for (const record of agency_users) {
    const inactive_agent_user_id = record?.dataValues?.user_fk; // to be reinvited
    const inactive_agent_user_firstname = record?.dataValues?.user?.first_name;
    const inactive_agent_user_lastname = record?.dataValues?.user?.last_name;
    const inactive_agent_email = record?.dataValues?.user?.email;

    const agent_user_id = record?.dataValues?.created_by; // the one that will show as inviter
    const agent = await models.user.findOne({
      where: {
        user_id: agent_user_id,
      },
    });

    const agent_first_name = agent?.dataValues?.first_name;
    const agent_last_name = agent?.dataValues?.last_name;

    console.log(
      'Activation Reinvitation',
      inactive_agent_email,
      inactive_agent_user_firstname,
      inactive_agent_user_lastname,
    );

    await h.email.sendEmail(
      `Chaaat Team <registrations@chaaat.io>`,
      inactive_agent_email,
      null,
      h.getMessageByCode('template-invite-user-subject-1632282919050', {
        USER_WHO_IS_INVITING: agent_first_name + ' ' + agent_last_name,
        AGENCY_NAME: agency_name,
      }),
      h.getMessageByCode('template-invite-user-body-1632283174576', {
        INVITED_USER_NAME: inactive_agent_user_firstname,
        USER_WHO_IS_INVITING: agent_first_name,
        SIGNUP_URL: `https://app.chaaat.io/signup?invitee=${encodeURIComponent(
          inactive_agent_user_id,
        )}&first_name=${encodeURIComponent(
          inactive_agent_user_firstname,
        )}&last_name=${encodeURIComponent(
          inactive_agent_user_lastname,
        )}&invited_email=${encodeURIComponent(inactive_agent_email)}`,
      }),
    );
  }
}

resend_invitation();
