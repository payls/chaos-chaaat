const h = require('../../helpers');
const StaffCommon = require('./common');

class UserManagementService extends StaffCommon {
  constructor() {
    super();
    this.contactController =
      require('../../controllers/contact').makeContactController(this.models);
    this.userController = require('../../controllers/user').makeUserController(
      this.models,
    );
    this.taskController = require('../../controllers/task').makeTaskController(
      this.models,
    );
    this.userSavedPropertyController =
      require('../../controllers/userSavedProperty').makeUserSavedPropertyController(
        this.models,
      );
    this.shortListedPropertyCommentController =
      require('../../controllers/shortlistedPropertyComment').makeShortListedPropertyCommentController(
        this.models,
      );
    this.taskMessageController =
      require('../../controllers/taskMessage').makeTaskMessageController(
        this.models,
      );
    this.agencyUserController =
      require('../../controllers/agencyUser').makeAgencyUserController(
        this.models,
      );
    this.agencyReportController =
      require('../../controllers/agencyReport').makeAgencyReportController(
        this.models,
      );
    this.contactEmailCommunicationController =
      require('../../controllers/contactEmailCommunication').makeContactEmailCommunicationController(
        this.models,
      );
    this.contactPropertyDefinitionsController =
      require('../../controllers/contactPropertyDefinitions').makeContactPropertyDefinitionsController(
        this.models,
      );
    this.contactViewPropertyController =
      require('../../controllers/contactViewProperty').makeContactViewPropertyController(
        this.models,
      );
    this.contactViewController =
      require('../../controllers/contactView').makeContactViewController(
        this.models,
      );
    this.contactController =
      require('../../controllers/contact').makeContactController(this.models);
    this.userAccessTokenController =
      require('../../controllers/userAccessToken').makeUserAccessTokenController(
        this.models,
      );
    this.userEmailVerificationController =
      require('../../controllers/userEmailVerification').makeUserEmailVerificationController(
        this.models,
      );
    this.userResetPasswordController =
      require('../../controllers/userResetPassword').makeUserResetPasswordController(
        this.models,
      );
    this.userRoleController =
      require('../../controllers/userRole').makeUserRoleController(this.models);
    this.userSocialAuthController =
      require('../../controllers/userSocialAuth').makeUserSocialAuthController(
        this.models,
      );
  }

  async deleteUser(req) {
    const funcName = 'UserMangementService.deleteUser';
    const currentUser = h.user.getCurrentUser(req);
    const { user_id, agency_fk } = req.params;
    // create transaction
    const transaction = this.dbTransaction;

    try {
      // get all agency_user record
      // @TODO need to update this method to also specify what agency or agencies to update. Currently only supports 1 agency per user.
      const agencyUser = await this.agencyUserController
        .findOne({ user_fk: user_id, agency_fk }, { transaction })
        .then((record) => (record && record.toJSON ? record.toJSON() : record));

      const currentAgencyUser = await this.agencyUserController
        .findOne({ user_fk: currentUser.user_id, agency_fk }, { transaction })
        .then((record) => (record && record.toJSON ? record.toJSON() : record));

      if (!agencyUser || !currentAgencyUser) {
        const err = new Error('INVALID_USER_ERROR');
        req.log.error({
          funcName,
          message: `INVALID_USER_ERROR`,
          err,
        });
        throw err;
      }

      // update item connected to agency_user
      // agency_report, agency_user_tray, contact_email_communication, contact_property_definition, contact_view_property, contact_view, contact,
      await this.agencyReportController.bulkUpdate(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        {
          agency_user_fk: currentAgencyUser.agency_user_id,
        },
        { transaction },
      );
      await this.contactEmailCommunicationController.bulkUpdate(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        {
          agency_user_fk: currentAgencyUser.agency_user_id,
        },
        { transaction },
      );
      await this.contactPropertyDefinitionsController.bulkUpdate(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        {
          agency_user_fk: currentAgencyUser.agency_user_id,
        },
        { transaction },
      );
      await this.contactViewPropertyController.bulkUpdate(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        {
          agency_user_fk: currentAgencyUser.agency_user_id,
        },
        { transaction },
      );
      await this.contactViewController.bulkUpdate(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        {
          agency_user_fk: currentAgencyUser.agency_user_id,
        },
        { transaction },
      );
      await this.contactController.bulkUpdate(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        {
          agency_user_fk: currentAgencyUser.agency_user_id,
        },
        { transaction },
      );
      // delete agency_user
      await this.agencyUserController.destroy(
        { user_fk: user_id },
        { transaction },
      );
      // update all related information
      // update item connected to user
      // developer_user, task, user_saved_property
      await this.taskController.bulkUpdate(
        { owner_fk: user_id },
        { owner_fk: currentUser.user_id },
        { transaction },
      );
      // *for shortlisted_property_comment, task_message -> need to clarify for now, delete records
      await this.shortListedPropertyCommentController.destroy(
        { user_fk: user_id },
        { transaction },
      );
      await this.taskMessageController.destroy(
        { user_fk: user_id },
        { transaction },
      );

      // delete user
      await this.userController.destroy({ user_id }, { transaction });
      // other info need to delete
      // user_access_token, user_email_verification, user_reset_password, user_role, user_social_auth
      await this.userAccessTokenController.destroy(
        { user_fk: user_id },
        { transaction },
      );
      await this.userEmailVerificationController.destroy(
        { user_fk: user_id },
        { transaction },
      );
      await this.userResetPasswordController.destroy(
        { user_fk: user_id },
        { transaction },
      );
      await this.userRoleController.destroy(
        { user_fk: user_id },
        { transaction },
      );
      await this.userSocialAuthController.destroy(
        { user_fk: user_id },
        { transaction },
      );

      return { user_id, agency_fk };
    } catch (err) {
      req.log.error({
        funcName,
        message: err.message,
        err,
      });
      throw err;
    }
  }
}

module.exports = UserManagementService;
