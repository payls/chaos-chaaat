const models = require('../models');
const moment = require('moment');
const _ = require('lodash');
const { Op } = require('sequelize');
const emailHelper = require('../helpers/email');
const general = require('../helpers/general');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

/*
CONTENT SAMPLE:
  <br/><br/>
    Hi [AGENT_NAME],
    <br/><br/>
    Here is your weekly summary of activity (Monday - Sunday)
    <br/><br/>
    <b>Total Number of Proposals Sent</b>
    <br/><br/>
    [TOTAL_PROPOSAL_SENT]
    <br/><br/>
    <b>Most Active Agents</b>
    <br/><br/>
    [TOP_1_AGENT_AND_SCORE]
    <br/><br/>
    [TOP_2_AGENT_AND_SCORE]
    <br/><br/>
    <b>Most Active Projects</b>
    <br/><br/>
    [TOP_1_PROJECT_AND_SCORE]
    <br/><br/>
    [TOP_2_PROJECT_AND_SCORE]
  <br/><br/>
*/

function getNoContent(agentName, dateRangeString) {
  return `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
  <br/><br/>
    Hi ${agentName},
    <br/><br/>
    <p>Weekly summary of activity ${
      dateRangeString ? dateRangeString : '(Monday - Sunday)'
    }</p>
    <br/><br/>
    <br/><br/>
    <p style="text-align: center">We don't have any campaign activity to show you for last week.</p>
  <br/><br/>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </div>
  `;
}

function getType1Content({
  agencyType,
  agentScore,
  agentName,
  topAgents,
  topProjects,
  dateRangeString,
}) {
  let content = ``;
  const offer_type = general.cmpStr(agencyType, 'REAL_ESTATE')
    ? 'Project'
    : 'Product';

  const greeting = agentName != '' ? `Hi ${agentName},` : 'Hi,';
  content += `
    <br/><br/>
    ${greeting}
    <br/><br/>
    Here is your weekly summary of activity ${
      dateRangeString ? dateRangeString : '(Monday - Sunday)'
    }
    <br/><br/>
    <b>Total Number of Proposal(s) Sent</b>
    <br/><br/>
    ${agentScore}
    <br/><br/>
  `;

  if (topAgents[0] && topAgents[0].proposals > 0) {
    content += `
    <b>Most Active Agents</b>
    <br/><br/>
    `;
  }

  for (const topAgent of topAgents) {
    if (topAgent && topAgent.proposals > 0) {
      const topAgent1 =
        topAgent && topAgent.first_name && topAgent.proposals >= 0
          ? `${topAgent.first_name} ${topAgent.last_name} - ${topAgent.proposals} proposal(s)`
          : '';
      content += `
      ${topAgent1}
      <br/><br/>
      `;
    }
  }
  if (topProjects[0] && topProjects[0].proposals > 0) {
    content += `
    <b>Most Active ${offer_type}s</b>
    <br/><br/>
    `;
  }

  for (const topProject of topProjects) {
    if (topProject && topProject.proposals > 0) {
      const top1Project =
        topProject && topProject.project_name && topProject.proposals >= 0
          ? `${topProject.project_name} - ${topProject.proposals} proposal(s)`
          : '';
      content += `
      ${top1Project}
      <br/><br/>
      `;
    }
  }

  return general.getMessageByCode(
    'template-weekly-proposal-report-email-body-v2-1-1660140062',
    {
      CONTENT: content,
    },
  );
}

function getType2Content({
  agencyType,
  agentScore,
  agentName,
  topProjects,
  dateRangeString,
}) {
  console.info('TOP_PROJECTS_PER_AGENT: ', JSON.stringify(topProjects));
  let content = ``;
  const offer_type = general.cmpStr(agencyType, 'REAL_ESTATE')
    ? 'Project'
    : 'Product';

  const greeting = agentName != '' ? `Hi ${agentName},` : 'Hi,';
  content += `
    <br/><br/>
    ${greeting}
    <br/><br/>
    Here is your weekly summary of activity ${
      dateRangeString ? dateRangeString : '(Monday - Sunday)'
    }
    <br/><br/>
    <b>Total Number of Proposals Sent</b>
    <br/><br/>
    ${agentScore}
    <br/><br/>
  `;

  if (topProjects[0] && topProjects[0].proposals > 0) {
    content += `
    <b>Most Active ${offer_type}s</b>
    <br/><br/>
    `;
  }

  for (const topProject of topProjects) {
    if (topProject && topProject.proposals > 0) {
      const top1Project =
        topProject && topProject.project_name && topProject.proposals >= 0
          ? `${topProject.project_name} - ${topProject.proposals} proposal(s)`
          : '';
      content += `
      ${top1Project}
      <br/><br/>
      `;
    }
  }

  return general.getMessageByCode(
    'template-weekly-proposal-report-email-body-v2-1-1660140062',
    {
      CONTENT: content,
    },
  );
}

const sendReport = async (event = {}) => {
  const functionName = 'WEEKLY_PROPOSAL_REPORT';
  try {
    console.info('WEEKLY_PROPOSAL_REPORT_START', event);
    console.info(JSON.stringify(event));
    const bcc =
      process.env.NODE_ENV === 'production'
        ? ['alan@chaaat.io', 'rienier@chaaat.io']
        : ['john@chaaat.io', 'rienier@chaaat.io'];

    console.info('ENV: ', process.env.NODE_ENV);

    // get all agencies
    // for each agencies
    // -- get proposal count per agent
    // -- get proposal count per project
    // -- get agents for the agency
    // -- for each agents
    // -- send an email
    const agencies = await models.agency.findAll({
      // where: {
      //   agency_id: {
      //     [Op.in]: ['d142b4dd-bbec-11eb-8026-02b1ece053a6'],
      //   },
      // },
    });

    for (const agency of agencies) {
      // get proposal count per agent from last weeks activity (monday to sunday)
      const mondayLastWeek = moment()
        .subtract(1, 'weeks')
        .startOf('isoWeek')
        .toDate();

      const mondayDateString = moment()
        .subtract(1, 'weeks')
        .startOf('isoWeek')
        .format('MMMM D');

      const mondayShortDateString = moment()
        .subtract(1, 'weeks')
        .startOf('isoWeek')
        .format('MMM D');

      const sundayLastWeek = moment()
        .subtract(1, 'weeks')
        .endOf('isoWeek')
        .toDate();

      const sundayDateString = moment()
        .subtract(1, 'weeks')
        .endOf('isoWeek')
        .format('MMMM D');

      const sundayShortDateString = moment()
        .subtract(1, 'weeks')
        .endOf('isoWeek')
        .format('MMM D');

      console.info('START_DATE: ', mondayLastWeek);
      console.info('END_DATE: ', sundayLastWeek);

      // get agent list for email sending
      const agents = await models.agency_user.findAll({
        where: {
          agency_fk: agency.agency_id,
          // agency_user_id: 'ee7854b7-b16d-42f8-a81a-b0eb0e54bd4a',
        },
        include: [
          {
            model: models.user,
            required: true,
            include: [
              {
                model: models.user_role,
                required: true,
              },
            ],
          },
          {
            model: models.email_notification_setting,
            required: true,
            where: {
              notification_type: 'weekly_summary',
              status: 1,
            },
          },
        ],
      });

      const allProposals = await models.contact.findAll({
        where: {
          agency_fk: agency.agency_id,
          // agency_user_fk: 'ee7854b7-b16d-42f8-a81a-b0eb0e54bd4a', //for test - Ian Agent
          permalink_sent_date: {
            [Op.between]: [mondayLastWeek, sundayLastWeek],
          },
        },
        include: [
          {
            model: models.agency_user,
            required: false,
            include: [
              {
                model: models.user,
                required: false,
              },
            ],
          },
          {
            model: models.shortlisted_project,
            required: false,
            where: {
              is_deleted: 0,
            },
            include: [
              {
                model: models.project,
                required: false,
              },
            ],
          },
          // {
          //   model: models.agency_custom_landing_pages,
          //   required: false,
          // },
        ],
      });

      // group proposal per agent
      // agency_user_id: { user_id, email, proposals }
      const agentProposals = allProposals.reduce((prev, curr) => {
        const { dataValues } = curr;
        const agencyUserId =
          dataValues.agency_user && dataValues.agency_user.agency_user_id;
        if (!agencyUserId) return prev;
        if (prev[agencyUserId]) {
          prev[agencyUserId].proposals = prev[agencyUserId].proposals + 1;
        } else {
          prev[agencyUserId] = {
            user_id:
              dataValues.agency_user &&
              dataValues.agency_user.user &&
              dataValues.agency_user.user.user_id,
            email:
              dataValues.agency_user &&
              dataValues.agency_user.user &&
              dataValues.agency_user.user.email,
            first_name:
              dataValues.agency_user &&
              dataValues.agency_user.user &&
              dataValues.agency_user.user.first_name,
            last_name:
              dataValues.agency_user &&
              dataValues.agency_user.user &&
              dataValues.agency_user.user.last_name,
            proposals: 1,
          };
        }

        return prev;
      }, {});
      // group proposal per project
      // project_id: { proposals, project_name }
      const projectProposals = allProposals.reduce((prev, curr) => {
        const { dataValues } = curr;
        if (dataValues.shortlisted_projects.length > 0) {
          const uniqueSps = _.uniqBy(
            dataValues.shortlisted_projects,
            (sp) => sp.project_fk,
          );
          for (const sp of uniqueSps) {
            if (sp.project && sp.project.project_id) {
              const projectId = sp.project.project_id;
              if (prev[projectId]) {
                prev[projectId].proposals = prev[projectId].proposals + 1;
              } else {
                prev[projectId] = {
                  project_name: sp.project && sp.project.name,
                  proposals: 1,
                };
              }
            }
          }
        }

        return prev;
      }, {});

      // get top 2 agents
      const topAgents = Object.keys(agentProposals)
        .reduce((prev, key) => {
          return [
            ...prev,
            {
              ...agentProposals[key],
              agent_user_id: key,
            },
          ];
        }, [])
        .sort((a, b) => a.proposals - b.proposals)
        .reverse();

      // get top 2 projects
      const topProjects = Object.keys(projectProposals)
        .reduce((prev, key) => {
          return [
            ...prev,
            {
              ...projectProposals[key],
              project_id: key,
            },
          ];
        }, [])
        .sort((a, b) => a.proposals - b.proposals)
        .reverse();

      let subject_message = general.getMessageByCode(
        'template-weekly-proposal-report-email-subject-1660140062',
        {
          AGENCY_NAME: general.ucFirstAllWords(agency.agency_name),
          DATE_RANGE_STRING: `(${mondayDateString} - ${sundayDateString})`,
        },
      );

      const dateRangeString = `(Monday, ${mondayShortDateString} to Sunday, ${sundayShortDateString})`;

      subject_message +=
        process.env.NODE_ENV !== 'production'
          ? ` - ${process.env.NODE_ENV}`
          : '';

      for (const agent of agents) {
        const agentName = (agent && agent.user && agent.user.first_name) || '';
        const agentEmail = agent && agent.user && agent.user.email;
        const role =
          (agent &&
            agent.user &&
            agent.user.user_roles &&
            agent.user.user_roles[0] &&
            agent.user.user_roles[0].user_role) ||
          'agency_sales';

        const agentScore =
          (agentProposals[agent.agency_user_id] &&
            agentProposals[agent.agency_user_id].proposals) ||
          0;

        // get agent only project proposals
        const agentOnlyProjectProposals = allProposals
          .filter(
            ({ dataValues }) =>
              dataValues.agency_user_fk === agent.agency_user_id,
          )
          .reduce((prev, { dataValues }) => {
            if (dataValues.shortlisted_projects.length > 0) {
              const uniqueSps = _.uniqBy(
                dataValues.shortlisted_projects,
                (sp) => sp.project_fk,
              );
              for (const sp of uniqueSps) {
                if (sp.project && sp.project.project_id) {
                  const projectId = sp.project.project_id;
                  if (prev[projectId]) {
                    prev[projectId].proposals = prev[projectId].proposals + 1;
                  } else {
                    prev[projectId] = {
                      project_name: sp.project && sp.project.name,
                      proposals: 1,
                    };
                  }
                }
              }
            }
            return prev;
          }, {});

        const topAgentOnlyProjectProposals = Object.keys(
          agentOnlyProjectProposals,
        )
          .reduce((prev, key) => {
            return [
              ...prev,
              {
                ...agentOnlyProjectProposals[key],
                project_id: key,
              },
            ];
          }, [])
          .sort((a, b) => a.proposals - b.proposals)
          .reverse();

        if (allProposals.length < 1) {
          try {
            await emailHelper.sendEmailV2(
              'Chaaat <no-reply@chaaat.io>',
              agentEmail,
              subject_message,
              getNoContent(agentName, dateRangeString),
              null,
              bcc,
            );

            // for local test uncomment
            // await emailHelper.sendEmailV2(
            //   'Chaaat <no-reply@chaaat.io>',
            //   'ian@chaaat.io',
            //   subject_message,
            //   getNoContent(agentName, dateRangeString),
            //   null,
            // );
          } catch (e) {
            Sentry.captureException(e);
            // ignore error
          }
        } else if (role === 'agency_sales' && agentScore < 1) {
          try {
            await emailHelper.sendEmailV2(
              'Chaaat <no-reply@chaaat.io>',
              agentEmail,
              subject_message,
              getNoContent(agentName, dateRangeString),
              null,
              bcc,
            );

            // for local test uncomment
            // await emailHelper.sendEmailV2(
            //   'Chaaat <no-reply@chaaat.io>',
            //   'ian@chaaat.io',
            //   subject_message,
            //   getNoContent(agentName, dateRangeString),
            //   null,
            // );
          } catch (e) {
            Sentry.captureException(e);
            // ignore error
          }
        } else {
          // console.info(
          //   'ROLE: ',
          //   JSON.stringify(agent && agent.user && agent.user.user_roles),
          // );
          const forType1 =
            role === 'staff_admin' ||
            role === 'agency_admin' ||
            role === 'agency_marketing'
              ? true
              : false;

          const emailBody = forType1
            ? getType1Content({
                agencyType: agency.real_estate_type,
                agentScore: allProposals.length,
                agentName,
                topAgents,
                topProjects,
                dateRangeString,
              })
            : getType2Content({
                agencyType: agency.real_estate_type,
                agentScore,
                agentName,
                topProjects: topAgentOnlyProjectProposals,
                dateRangeString,
              });

          try {
            await emailHelper.sendEmailV2(
              'Chaaat <no-reply@chaaat.io>',
              agentEmail,
              subject_message,
              emailBody,
              null,
              bcc,
            );

            // for localtest uncomment
            // await emailHelper.sendEmailV2(
            //   'Chaaat <no-reply@chaaat.io>',
            //   'ian@chaaat.io',
            //   subject_message,
            //   emailBody,
            //   null,
            // );
          } catch (e) {
            Sentry.captureException(e);
            // ignore error
          }
        }
      }
    }

    console.info('WEEKLY_PROPOSAL_REPORT_END', event);
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.error({
      function: functionName,
      err,
    });
    return { success: false, function: functionName, error: err };
  }
};

exports.sendReport = Sentry.AWSLambda.wrapHandler(sendReport);
