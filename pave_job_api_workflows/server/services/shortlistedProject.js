const h = require('../helpers');
const NonStaffCommon = require('./common');
const models = require('../models');
const config = require('../configs/config')(process.env.NODE_ENV);
class NonStaffShortlistedProjectService extends NonStaffCommon {
  constructor() {
    super();
    this.shortlistedProjectController =
      require('../controllers/shortlistedProject').makeShortListedProjectController(
        this.models,
      );
    this.contactController =
      require('../controllers/contact').makeContactController(this.models);
  }

  /**
   * Inverse bookmark state of project
   * @param {FastifyRequest} request
   * @returns {Promise<{{shortlisted_project_id: string,
   * is_bookmarked: boolean,
   * bookmark_date: string}}>}
   */
  async bookmarkProject(req) {
    const funcName = 'NonStaffShortlistedProjectService.bookmarkProject';
    try {
      const { shortlisted_project_id } = req.params;
      h.validation.requiredParams(funcName, {
        shortlisted_project_id,
      });

      const shortlistedProject =
        await this.shortlistedProjectController.findOne({
          shortlisted_project_id: shortlisted_project_id,
        });

      const is_bookmarked = !shortlistedProject.is_bookmarked;
      let bookmark_date;
      if (!shortlistedProject.is_bookmarked) {
        bookmark_date = h.date.getSqlCurrentDate();
      } else {
        bookmark_date = null;
      }
      const updatedShortlistedProjectId =
        await this.shortlistedProjectController.update(
          shortlistedProject.shortlisted_project_id,
          {
            is_bookmarked: is_bookmarked,
            bookmark_date: bookmark_date,
          },
        );

      return {
        shortlisted_project_id: updatedShortlistedProjectId,
        is_bookmarked: is_bookmarked,
        bookmark_date: bookmark_date,
      };
    } catch (err) {
      console.log(`${req.url}: user failed to bookmark shortlisted project`, {
        err,
      });
      throw err;
    }
  }

  /**
   * Inverse enquiry state state of project
   * @param {FastifyRequest} request
   * @returns {Promise<{{shortlisted_project_id: string,
   * is_enquired: boolean,
   * enquired_date: string}}>}
   */
  async enquireProject(req) {
    const funcName = 'NonStaffShortlistedProjectService.enquireProject';
    try {
      const { shortlisted_project_id } = req.params;
      h.validation.requiredParams(funcName, {
        shortlisted_project_id,
      });

      const shortlistedProject =
        await this.shortlistedProjectController.findOne(
          {
            shortlisted_project_id: shortlisted_project_id,
          },
          {
            include: [
              {
                model: models.project,
                required: true,
              },
            ],
          },
        );
      const contact_id = shortlistedProject.contact_fk;
      const contactRecord = await this.contactController.findOne(
        { contact_id: contact_id },
        {
          include: [
            { model: models.agency, required: true, as: 'agency' },
            {
              model: models.agency_user,
              required: true,
              as: 'agency_user',
              include: [
                {
                  model: models.user,
                  attributes: {
                    exclude: ['password', 'password_salt'],
                  },
                },
              ],
            },
          ],
        },
      );
      const is_enquired = !shortlistedProject.is_enquired;
      const enquired_date = h.date.getSqlCurrentDate();
      const updatedShortlistedProjectId =
        await this.shortlistedProjectController.update(
          shortlistedProject.shortlisted_project_id,
          {
            is_enquired: is_enquired,
            enquired_date: enquired_date,
          },
        );

      const subject_message = h.getMessageByCode(
        'template-enquire-project-email-subject-1650435889233',
        {
          CONTACT_NAME:
            contactRecord.first_name + ' ' + contactRecord.last_name,
        },
      );

      const body_message = h.getMessageByCode(
        'template-enquire-project-email-body-1650435889233',
        {
          AGENT_FIRST_NAME: h.general.prettifyConstant(
            contactRecord.agency_user.user.first_name,
          ),
          PROJECT_NAME: shortlistedProject.project.name,
          BUYER_FIRST_NAME: h.general.prettifyConstant(
            contactRecord.first_name,
          ),
          CREATE_LINK_WIZARD: `${config.webAdminUrl}/dashboard/sales/create-link?is_general_enquiry=false&contact_id=${contact_id}&form_mode=edit`,
        },
      );

      // Send email to agency_user on enquiry
      if (contactRecord.agent_email_preference)
        await h.email.sendEmail(
          'Chaaat <no-reply@chaaat.io>',
          contactRecord.agency_user.user.email,
          null,
          subject_message,
          body_message,
        );
      return {
        shortlisted_project_id: updatedShortlistedProjectId,
        is_enquired: is_enquired,
        enquired_date: enquired_date,
      };
    } catch (err) {
      console.log(`${req.url}: user failed to enquire shortlisted project`, {
        err,
      });
      throw err;
    }
  }
}

module.exports = NonStaffShortlistedProjectService;
