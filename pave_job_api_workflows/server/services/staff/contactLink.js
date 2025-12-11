const h = require('../../helpers');
const StaffCommon = require('./common');
const StaffContactService = require('./contact');

class StaffContactLinkService extends StaffCommon {
  constructor() {
    super();
    this.contactController =
      require('../../controllers/contact').makeContactController(this.models);
    this.shortListedPropertyController =
      require('../../controllers/shortlistedProperty').makeShortListedPropertyController(
        this.models,
      );
    this.shortListedProjectController =
      require('../../controllers/shortlistedProject').makeShortListedProjectController(
        this.models,
      );
    this.staffContactService = new StaffContactService();
  }

  setDbTransaction(dbTransaction) {
    super.setDbTransaction(dbTransaction);
    this.staffContactService.setDbTransaction(dbTransaction);
  }

  /**
   * Update contact link service
   * @param {FastifyRequest} request
   * @returns {Promise<{{isNew: boolean, contactId?: string}}>}
   */
  async updateContactLink(request) {
    const funcName = 'StaffContactLinkService.updateContactLink';
    let isNew;
    try {
      const {
        contact_id,
        autogenerate_permalink,
        project_ids,
        unit_ids,
        is_general_enquiry,
      } = request.body;
      const { user_id } = h.user.getCurrentUser(request);
      h.validation.requiredParams(funcName, {
        contact_id,
        autogenerate_permalink,
        user_id,
      });
      const contactRecord = await this.contactController.findOne(
        { contact_id },
        {
          transaction: this.dbTransaction,
          include: [
            { model: this.models.shortlisted_property, required: false },
          ],
        },
      );

      let updatedContactId;
      let permalink;
      let updatedContactRecord;

      if (contactRecord) {
        if (h.isEmpty(contactRecord.agency_user_fk))
          throw new Error('Contact needs to be assigned to an agent');
        let permalinkSentDate = contactRecord.permalink_sent_date;
        let lead_status;
        if (h.isEmpty(contactRecord.permalink)) {
          // Contact does not have existing permalink yet
          if (autogenerate_permalink) {
            permalink = await this.staffContactService.checkIfPermalinkIsUnique(
              h.general.generateRandomAlpanumeric(5),
            );
          } else {
            permalink = request.body.permalink;
          }
          isNew = true;

          // set permalink_sent_date to now if creating permalink
          permalinkSentDate = null;
          lead_status = this.constant.LEAD_STATUS.PROPOSAL_CREATED;
        } else {
          // Contact has existing permalink
          permalink = contactRecord.permalink;
          lead_status = contactRecord.lead_status;
          permalinkSentDate = contactRecord.permalink_sent_date;
          isNew = false;
        }
        // handles shortlisted projects
        if (project_ids) {
          const shortlistedProjects =
            await this.shortListedProjectController.findAll(
              { contact_fk: contact_id },
              { transaction: this.dbTransaction },
            );
          for (const shortlistedProject of shortlistedProjects) {
            let shouldDeleteProj = true;
            for (const project of project_ids) {
              if (h.cmpStr(shortlistedProject.project_fk, project.project_id)) {
                shouldDeleteProj = false;
              }
            }
            if (shouldDeleteProj) {
              // soft deletion
              await this.shortListedProjectController.update(
                shortlistedProject.shortlisted_project_id,
                { is_deleted: true },
                { transaction: this.dbTransaction },
              );
              if (!isNew) {
                lead_status =
                  this.constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED;
                permalinkSentDate = null;
              }
            }
          }
          for (const project of project_ids) {
            const existingShortlistedProject =
              await this.shortListedProjectController.findOne(
                {
                  contact_fk: contact_id,
                  project_fk: project.project_id,
                  is_deleted: 0,
                },
                { transaction: this.dbTransaction },
              );
            if (h.isEmpty(existingShortlistedProject)) {
              await this.shortListedProjectController.create(
                {
                  contact_fk: contact_id,
                  project_fk: project.project_id,
                  created_by: user_id,
                  display_order: project.display_order,
                  is_deleted: 0,
                },
                { transaction: this.dbTransaction },
              );
              if (!isNew) {
                lead_status =
                  this.constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED;
                permalinkSentDate = null;
              }
            } else {
              if (
                existingShortlistedProject.display_order !==
                project.display_order
              ) {
                // update existing shortlisted_property record with the new order if the display order has changed
                await this.shortListedProjectController.update(
                  existingShortlistedProject.shortlisted_project_id,
                  {
                    display_order: project.display_order,
                    is_deleted: 0,
                  },
                  { transaction: this.dbTransaction },
                );
              }
            }
          }
        }
        // handles shortlisted properties
        if (unit_ids) {
          const shortlistedProperties =
            await this.shortListedPropertyController.findAll(
              { contact_fk: contact_id },
              { transaction: this.dbTransaction },
            );
          for (const shortlistedProperty of shortlistedProperties) {
            let shouldDelete = true;
            for (const project_property of unit_ids) {
              if (
                h.cmpStr(
                  shortlistedProperty.project_property_fk,
                  project_property.project_property_id,
                )
              ) {
                shouldDelete = false;
              }
            }
            if (shouldDelete) {
              // soft deletion
              await this.shortListedPropertyController.update(
                shortlistedProperty.shortlisted_property_id,
                { is_deleted: true },
                { transaction: this.dbTransaction },
              );
              if (!isNew) {
                lead_status =
                  this.constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED;
                permalinkSentDate = null;
              }
            }
          }
          for (const project_property of unit_ids) {
            const existingShortlistedProperty =
              await this.shortListedPropertyController.findOne(
                {
                  contact_fk: contact_id,
                  project_property_fk: project_property.project_property_id,
                  is_deleted: 0,
                },
                { transaction: this.dbTransaction },
              );
            if (h.isEmpty(existingShortlistedProperty)) {
              await this.shortListedPropertyController.create(
                {
                  contact_fk: contact_id,
                  project_property_fk: project_property.project_property_id,
                  created_by: user_id,
                  display_order: project_property.display_order,
                  is_general_enquiry: project_property.is_general_enquiry,
                  is_deleted: 0,
                },
                { transaction: this.dbTransaction },
              );
              if (!isNew) {
                lead_status =
                  this.constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED;
                permalinkSentDate = null;
              }
            } else {
              if (
                existingShortlistedProperty.display_order !==
                  project_property.display_order ||
                existingShortlistedProperty.is_general_enquiry !==
                  project_property.is_general_enquiry
              ) {
                // update existing shortlisted_property record with the new order if the display order has changed
                await this.shortListedPropertyController.update(
                  existingShortlistedProperty.shortlisted_property_id,
                  {
                    display_order: project_property.display_order,
                    is_general_enquiry: project_property.is_general_enquiry,
                    is_deleted: 0,
                  },
                  { transaction: this.dbTransaction },
                );
              }
            }
          }
        }
        updatedContactId = await this.contactController.update(
          contactRecord.contact_id,
          {
            permalink,
            updated_by: user_id,
            permalink_sent_date: h.general.notEmpty(permalinkSentDate)
              ? permalinkSentDate
              : undefined,
            lead_status: lead_status,
            is_general_enquiry: is_general_enquiry,
          },
          { transaction: this.dbTransaction },
        );

        updatedContactRecord = await this.contactController.findOne(
          { contact_id: updatedContactId },
          {
            transaction: this.dbTransaction,
            include: [
              { model: this.models.shortlisted_property, required: false },
            ],
          },
        );
      }

      return { isNew, contact: updatedContactRecord, permalink };
    } catch (err) {
      console.log(`${request.url}: user failed to update contact record`, {
        err,
      });
      throw err;
    }
  }
}

module.exports = StaffContactLinkService;
