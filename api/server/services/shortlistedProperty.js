const Sentry = require('@sentry/node');
const h = require('../helpers');
const NonStaffCommon = require('./common');
const models = require('../models');
const config = require('../configs/config')(process.env.NODE_ENV);

class NonStaffShortlistedPropertyService extends NonStaffCommon {
  constructor() {
    super();
    this.shortListedPropertyController =
      require('../controllers/shortListedProperty').makeShortListedPropertyController(
        this.models,
      );
    this.emailNotificationSettingController =
      require('../controllers/emailNotificationSetting').makeController(
        this.models,
      );
    this.contactController =
      require('../controllers/contact').makeContactController(this.models);
  }

  /**
   * Inverse bookmark state of property
   * @param {FastifyRequest} request
   * @returns {Promise<{{shortlisted_property_id: string,
   * is_bookmarked: boolean,
   * bookmark_date: string}}>}
   */
  async bookmarkProperty(req) {
    const funcName = 'NonStaffShortlistedPropertyService.bookmarkProperty';
    try {
      const { shortlisted_property_id } = req.params;
      h.validation.requiredParams(funcName, {
        shortlisted_property_id,
      });

      const shortlistedProperty =
        await this.shortListedPropertyController.findOne({
          shortlisted_property_id: shortlisted_property_id,
        });

      const is_bookmarked = !shortlistedProperty.is_bookmarked;
      let bookmark_date;
      if (!shortlistedProperty.is_bookmarked) {
        bookmark_date = h.date.getSqlCurrentDate();
      } else {
        bookmark_date = null;
      }
      const updatedShortlistedPropertyId =
        await this.shortListedPropertyController.update(
          shortlistedProperty.shortlisted_property_id,
          {
            is_bookmarked: is_bookmarked,
            bookmark_date: bookmark_date,
          },
        );

      return {
        shortlisted_property_id: updatedShortlistedPropertyId,
        is_bookmarked: is_bookmarked,
        bookmark_date: bookmark_date,
      };
    } catch (err) {
      Sentry.captureException(err);
      console.log(`${req.url}: user failed to bookmark shortlisted property`, {
        err,
      });
      throw err;
    }
  }

  async requestReserve(req) {
    const funcName = 'NonStaffShortlistedPropertyService.requestReserve';

    try {
      const { shortlisted_property_id } = req.params;
      h.validation.requiredParams(funcName, {
        shortlisted_property_id,
      });

      const record = await this.shortListedPropertyController.findOne(
        {
          shortlisted_property_id: shortlisted_property_id,
        },
        {
          include: [
            {
              model: models.project_property,
              include: [
                {
                  model: models.project,
                },
              ],
            },
          ],
        },
      );

      const shortlistedProperty = record.toJSON();

      // send email
      const is_requested_for_reservation =
        !shortlistedProperty.is_requested_for_reservation;

      if (!is_requested_for_reservation) {
        req.log.info({
          funcName,
          message: `${req.url}: Request for reservation is already sent`,
        });

        return {
          shortlisted_property_id,
          is_requested_for_reservation,
        };
      }

      const contact_id = shortlistedProperty.contact_fk;
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

      const unit = shortlistedProperty.project_property.unit_number || '';
      const project = shortlistedProperty.project_property.project.name || '';

      const propertyName = `Unit ${unit} of project ${project}`;

      const subject_message = h.getMessageByCode(
        'template-request-reserve-email-subject-1651855722401',
        {
          CONTACT_NAME:
            contactRecord.first_name + ' ' + contactRecord.last_name,
        },
      );

      const body_message = h.getMessageByCode(
        'template-request-reserve-email-body-1651855722401',
        {
          AGENT_FIRST_NAME: h.general.prettifyConstant(
            contactRecord.agency_user.user.first_name,
          ),
          PROPERTY_NAME: propertyName,
          BUYER_FIRST_NAME: h.general.prettifyConstant(
            contactRecord.first_name,
          ),
        },
      );

      // Send email to agency_user on request for reservation

      const canSend =
        await this.emailNotificationSettingController.ifCanSendEmail(
          contactRecord.agency_user_fk,
          'proposal_property_reserve',
        );

      if (canSend) {
        req.log.info({
          funcName,
          message: `${req.url}: Attempting to send an email.`,
        });
        await h.email.sendEmail(
          `Chaaat <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
          contactRecord.agency_user.user.email,
          null,
          subject_message,
          body_message,
        );
      }

      // update shortListedProperty
      const reservation_date = h.date.getSqlCurrentDate();
      const updatedShortlistedPropertyId =
        await this.shortListedPropertyController.update(
          shortlisted_property_id,
          {
            is_requested_for_reservation,
            reservation_date: reservation_date,
          },
          {},
        );

      return {
        shortlisted_property_id: updatedShortlistedPropertyId,
        is_requested_for_reservation,
        reservation_date: reservation_date,
      };
    } catch (err) {
      Sentry.captureException(err);
      req.log.error({
        funcName,
        message: `${req.url}: user failed to bookmark shortlisted property`,
        err,
      });

      throw err;
    }
  }
}

module.exports = NonStaffShortlistedPropertyService;
