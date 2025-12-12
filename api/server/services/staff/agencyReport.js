const Sentry = require('@sentry/node');
const h = require('../../helpers');
const models = require('../../models');
const StaffCommon = require('./common');
const { Op } = require('sequelize');
const config = require('../../configs/config')(process.env.NODE_ENV);
const carboneSDK = require('carbone-sdk')(process.env.CARBONE_API_KEY);
const path = require('path');

class StaffReportService extends StaffCommon {
  constructor() {
    super();
    this.shortListedPropertyController =
      require('../../controllers/shortListedProperty').makeShortListedPropertyController(
        this.models,
      );
    this.projectPropertyController =
      require('../../controllers/projectProperty').makeProjectPropertyController(
        this.models,
      );
    this.projectController =
      require('../../controllers/project').makeProjectController(this.models);
    this.agencyUserController =
      require('../../controllers/agencyUser').makeAgencyUserController(
        this.models,
      );
    this.agencyReportController =
      require('../../controllers/agencyReport').makeAgencyReportController(
        this.models,
      );
    this.contactController =
      require('../../controllers/contact').makeContactController(this.models);
    this.contactActivityController =
      require('../../controllers/contactActivity').makeContactActivityController(
        this.models,
      );
    this.shortlistedProjectController =
      require('../../controllers/shortlistedProject').makeShortListedProjectController(
        this.models,
      );
  }

  /**
   * Create report
   * @param {FastifyRequest} request
   * @returns {Promise<{{agency_report_id?: string}}>}
   */
  async createReport(req) {
    const funcName = 'StaffReportService.createReport';
    try {
      const { project_id, from, to, timezoneOffsetMinutes } = req.body;
      const { user_id } = h.user.getCurrentUser(req);
      const { agency_fk, agency_user_id } =
        await this.agencyUserController.findOne({
          user_fk: user_id,
        });
      const project = await this.projectController.findOne({
        project_id: project_id,
      });
      const projectProperties = await this.projectPropertyController.findAll({
        project_fk: project_id,
        is_deleted: 0,
      });
      const startDate = new Date(from);
      const endDate = new Date(to);
      const endDatePadded = new Date(to);
      // padded one day to get end of day time
      endDatePadded.setDate(endDate.getDate() + 1);
      // accounting timezone offsets
      endDatePadded.setMinutes(
        endDatePadded.getMinutes() + timezoneOffsetMinutes,
      );

      h.validation.requiredParams(funcName, {
        project_id,
        from,
        to,
      });

      // saleStatus
      const saleStatus = { TOTAL: { no: 0, value: 0 } };
      const initialValue = {
        no: 0,
        value: 0,
        totalSqm: 0,
        averageSqm: 0,
        averagePrice: 0,
        averagePricePerSqm: 0,
        percentageOfTotal: 0,
      };

      const cumulativeStats = (prev, curr, index) => {
        const returnObject = {};
        returnObject.no = prev.no + 1;
        returnObject.value = prev.value + parseInt(curr.starting_price);
        returnObject.totalSqm = prev.totalSqm + parseInt(curr.sqm);
        returnObject.averageSqm = returnObject.totalSqm / (index + 1);
        returnObject.averagePrice = returnObject.value / (index + 1);
        returnObject.averagePricePerSqm =
          returnObject.averagePrice / returnObject.totalSqm;
        returnObject.percentageOfTotal =
          ((index + 1) / projectProperties.length) * 100;
        return returnObject;
      };

      for (const propertyStatus in this.constant.PROPERTY.PROPERTY_STATUS) {
        const propertiesWithStatus = projectProperties.filter((project) =>
          h.general.cmpStr(
            project.status.toLowerCase(),
            this.constant.PROPERTY.PROPERTY_STATUS[propertyStatus],
          ),
        );
        saleStatus[propertyStatus] = propertiesWithStatus.reduce(
          cumulativeStats,
          initialValue,
        );

        saleStatus.TOTAL.no += saleStatus[propertyStatus].no;
        saleStatus.TOTAL.value += saleStatus[propertyStatus].value;
      }

      // campaignMetrics
      const campaignMetrics = {};
      campaignMetrics.noOfApartments = projectProperties.length;

      const shortlistedProjects =
        await this.shortlistedProjectController.findAll({
          project_fk: project_id,
          is_deleted: 0,
        });

      // campaignMetrics.proposalsSent & campaignMetrics.proposalsOpenedRate
      // Retrieving contacts that are sent proposals for the project
      const shortlistedProperties =
        await this.shortListedPropertyController.findAll(
          {
            project_property_fk: {
              [Op.in]: [
                projectProperties.map(
                  (projectProperty) => projectProperty.project_property_id,
                ),
              ],
            },
            is_deleted: 0,
            // created_date: { [Op.between]: [startDate, endDatePadded] },
            // get shortlisted properties that are not deleted
            // '$contact.lead_status$': {
            //   [Op.and]: [
            //     { [Op.ne]: this.constant.LEAD_STATUS.NO_PROPOSAL },
            //     { [Op.ne]: this.constant.LEAD_STATUS.PROPOSAL_CREATED },
            //   ],
            // },
          },
          {
            include: [
              {
                model: models.contact,
                required: false,
              },
            ],
          },
        );

      const contact_ids = shortlistedProperties.map(
        (property) => property.contact_fk,
      );

      const contact_ids_2 = shortlistedProjects.map(
        (project) => project.contact_fk,
      );

      const allContactIds = [
        ...new Set(contact_ids),
        ...new Set(contact_ids_2),
      ];

      let proposalsThatHasProperties = {};
      if (contact_ids.length > 0) {
        proposalsThatHasProperties = await this.contactController.findAll({
          contact_id: { [Op.in]: [contact_ids] },
          permalink_sent_date: { [Op.between]: [startDate, endDatePadded] },
        });
      }
      // start right here
      const contactsSent = await this.contactController.findAll({
        contact_id: { [Op.in]: [allContactIds] },
        permalink_sent_date: { [Op.between]: [startDate, endDatePadded] },
      });

      const contactsOpened = await this.contactController.findAll({
        contact_id: { [Op.in]: [allContactIds] },
        permalink_last_opened: { [Op.between]: [startDate, endDatePadded] },
      });

      // Calculating proposals sent and opened
      const countSent = (prev, curr) => {
        if (
          curr.lead_status !== this.constant.LEAD_STATUS.NO_PROPOSAL &&
          curr.lead_status !== this.constant.LEAD_STATUS.PROPOSAL_CREATED
        )
          return prev + 1;
        return prev;
      };

      const countOpened = (prev, curr) => {
        if (
          curr.lead_status === this.constant.LEAD_STATUS.PROPOSAL_OPENED ||
          curr.lead_status === this.constant.LEAD_STATUS.UPDATED_PROPOSAL_OPENED
        )
          return prev + 1;
        return prev;
      };

      const proposalsSent = parseInt(contactsSent.reduce(countSent, 0));
      const proposalsOpened = contactsOpened.reduce(countOpened, 0);
      const projectInfoNum =
        proposalsSent - shortlistedProperties.length > 0
          ? ` (${
              proposalsSent - proposalsThatHasProperties.length
            } Project information only)`
          : '';

      campaignMetrics.proposalsSent = `${proposalsSent}${projectInfoNum}`;
      campaignMetrics.proposalsOpenedRate =
        (proposalsOpened / proposalsSent) * 100;

      const shortlistedPropertiesIDs = shortlistedProperties.map(
        (property) => property.shortlisted_property_id,
      );

      const shortlistedProjectIDs = shortlistedProjects.map(
        (project) => project.shortlisted_project_id,
      );

      const propertyRatedActivities =
        await this.contactActivityController.findAll({
          activity_type: this.constant.CONTACT.ACTIVITY.TYPE.PROPERTY_RATED,
          activity_meta: {
            [Op.regexp]: `(${[
              ...shortlistedPropertiesIDs,
              ...shortlistedProjectIDs,
            ].join('|')})`,
          },
          created_date: { [Op.between]: [startDate, endDatePadded] },
        });

      const uniquePropetyRatedReducer = (prev, curr) => {
        // Check for same contact_fk and shortlisted_property_id
        for (const prevActivity of prev) {
          const parsedPrevActivityMeta = JSON.parse(prevActivity.activity_meta);
          const parsedCurrActivityMeta = JSON.parse(curr.activity_meta);
          if (
            prevActivity.contact_fk === curr.contact_fk &&
            parsedPrevActivityMeta.shortlisted_property_id ===
              parsedCurrActivityMeta.shortlisted_property_id
          ) {
            if (curr.created_date > prevActivity.created_date) {
              Object.assign(prevActivity, curr);
            }
            return prev;
          }
        }
        prev.push(curr);
        return prev;
      };

      const uniquePropertyRatedActivities = propertyRatedActivities.reduce(
        uniquePropetyRatedReducer,
        [],
      );

      // campaignMetrics.propertyRatingRate
      campaignMetrics.propertyRatingRate =
        (uniquePropertyRatedActivities.length / shortlistedProperties.length) *
        100;

      // campaignMetrics.propertyCommentRate
      const commentActivities = await this.contactActivityController.findAll({
        activity_type: this.constant.CONTACT.ACTIVITY.TYPE.COMMENT_POSTED,
        activity_meta: {
          [Op.regexp]: `(${[
            ...shortlistedPropertiesIDs,
            ...shortlistedProjectIDs,
          ].join('|')})`,
        },
        created_date: { [Op.between]: [startDate, endDatePadded] },
      });

      const uniqueCommentReducer = (prev, curr) => {
        // Check for same contact_fk and shortlisted_property_id
        for (const prevActivity of prev) {
          const parsedPrevActivityMeta = JSON.parse(prevActivity.activity_meta);
          const parsedCurrActivityMeta = JSON.parse(curr.activity_meta);
          if (
            prevActivity.contact_fk === curr.contact_fk &&
            parsedPrevActivityMeta.shortlisted_property_id ===
              parsedCurrActivityMeta.shortlisted_property_id
          )
            return prev;
        }
        prev.push(curr);
        return prev;
      };

      const uniqueCommentActivities = commentActivities.reduce(
        uniqueCommentReducer,
        [],
      );

      campaignMetrics.propertyCommentRate =
        (uniqueCommentActivities.length / shortlistedProperties.length) * 100;

      // campaignMetrics.suitabilityRate
      const highlyRatedActivites = uniquePropertyRatedActivities.filter(
        (activity) => {
          const parsedActivityMeta = JSON.parse(activity.activity_meta);
          return (
            parsedActivityMeta.property_rating >=
            this.constant.REPORT_GENERATION.HIGHLY_RATED_THRESHOLD
          );
        },
      );
      campaignMetrics.suitabilityRate =
        (highlyRatedActivites.length / shortlistedProperties.length) * 100;

      campaignMetrics.apartmentsSold =
        saleStatus.CONTRACTS_UNCONDITIONAL.no +
        saleStatus.CONTRACTS_UNCONDITIONAL_AND_DEPOSIT_RECEIVED.no +
        saleStatus.SETTLED.no +
        saleStatus.HANDOVER_COMPLETED.no;

      // campaignMetrics.conversionRate
      campaignMetrics.conversionRate =
        (campaignMetrics.apartmentsSold / saleStatus.TOTAL.no) * 100;

      // Heatmap constants
      const heatmapPartitions = [
        { color: this.constant.REPORT_GENERATION.HEATMAP_COLOR.COLOR1 },
        { color: this.constant.REPORT_GENERATION.HEATMAP_COLOR.COLOR2 },
        { color: this.constant.REPORT_GENERATION.HEATMAP_COLOR.COLOR3 },
        { color: this.constant.REPORT_GENERATION.HEATMAP_COLOR.COLOR4 },
        { color: this.constant.REPORT_GENERATION.HEATMAP_COLOR.COLOR5 },
      ];

      // Getting count for each project property
      const countProjectPropertyReducer = (prev, curr) => {
        if (!(curr.project_property_fk in prev)) {
          prev[curr.project_property_fk] = 1;
          return prev;
        }
        prev[curr.project_property_fk] += 1;
        return prev;
      };

      const projectPropertySum = shortlistedProperties.reduce(
        countProjectPropertyReducer,
        {},
      );

      // Getting maximum number of proposals sent
      const projectPropertySumArray = Object.values(projectPropertySum);
      const maxProposalsSent = Math.max(...projectPropertySumArray);

      const determineHeatmapPartition = (maxProposalsSent) => {
        const threshold = maxProposalsSent / heatmapPartitions.length;
        for (let i = 1; i <= heatmapPartitions.length; i++) {
          heatmapPartitions[i - 1].upperBound = Math.round(threshold * i);
        }
        // Removing duplicate partitions
        let j = heatmapPartitions.length - 1;
        while (j >= 1) {
          if (
            heatmapPartitions[j].upperBound ===
            heatmapPartitions[j - 1].upperBound
          ) {
            heatmapPartitions.splice(j, 1);
          }
          j--;
        }
      };
      determineHeatmapPartition(maxProposalsSent);

      const determineHeatmapColor = (proposalsSent) => {
        for (const partition of heatmapPartitions) {
          if (proposalsSent <= partition.upperBound) return partition.color;
        }
      };

      // Heatmap properties
      const heatmapProperties = [];
      for (const property of projectProperties) {
        const formattedProperty = {};
        const proposalsSent = projectPropertySum[property.project_property_id];
        formattedProperty.proposalsSent =
          proposalsSent === undefined ? 0 : proposalsSent;
        formattedProperty.unitNumber = property.unit_number;
        formattedProperty.unitType = property.unit_type;
        formattedProperty.status = property.status;
        formattedProperty.bed = parseInt(property.number_of_bedroom);
        formattedProperty.bath = parseInt(property.number_of_bathroom);
        formattedProperty.parking = property.number_of_parking_lots;
        formattedProperty.price = parseInt(property.starting_price) || 0;
        formattedProperty.size = parseInt(property.sqm) || 0;
        formattedProperty.averagePricePerSize =
          formattedProperty.price / formattedProperty.size || 0;
        formattedProperty.color = determineHeatmapColor(
          formattedProperty.proposalsSent,
        );
        heatmapProperties.push(formattedProperty);
      }

      const data = {
        data: {
          project: project,
          from: startDate,
          to: endDate,
          campaignMetrics,
          saleStatus,
          heatmapProperties,
          heatmapPartitions,
        },
        convertTo: 'pdf',
      };

      // Generate pdf and upload to CDN
      const contentType = 'application/pdf';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const dateString = endDate.toLocaleDateString('en-GB', options);
      const fileName = `${project.name}_${dateString}.pdf`.replaceAll(' ', '_');
      const remoteFilePath = h.file.getFilePath(
        this.constant.UPLOAD.TYPE.REPORT,
        {
          file_name: fileName,
        },
      );

      const result = await carboneSDK.renderPromise(
        path.join(
          __dirname,
          '../../locales/en/templates/report/report_template.odt',
        ),
        data,
      );

      await h.file.uploadBufferToS3(
        result.content,
        contentType,
        remoteFilePath,
      );

      const fullRemoteFileUrl = `${config.cdnUrls[0]}/${remoteFilePath}`;

      console.log(`uploaded report successfully.`, {
        file_name: fileName,
        file_url: fullRemoteFileUrl,
      });

      // Creating agency_report entry
      const agency_report_id = await this.agencyReportController.create({
        agency_fk: agency_fk,
        agency_user_fk: agency_user_id,
        url: fullRemoteFileUrl,
        filename: fileName,
        from: startDate,
        to: endDate,
        created_by: user_id,
      });

      return { agency_report_id: agency_report_id };
    } catch (err) {
      Sentry.captureException(err);
      console.log(`${req.url}: Failed to generate report.`, {
        err,
      });
      throw err;
    }
  }

  /**
   * Find all reports
   * @param {FastifyRequest} request
   * @returns {Promise<{{reports?: array<object>}}>}
   */
  async findAllReports(req) {
    const funcName = 'StaffReportService.findAllReport';
    try {
      const { user_id } = h.user.getCurrentUser(req);
      const { agency_fk } = await this.agencyUserController.findOne({
        user_fk: user_id,
      });

      h.validation.requiredParams(funcName, {
        user_id,
        agency_fk,
      });

      const where = {
        agency_fk: agency_fk,
      };

      const include = [
        {
          model: models.agency_user,
          required: false,
          include: [
            {
              model: models.user,
              required: true,
            },
          ],
        },
      ];

      const reports = await this.agencyReportController.findAll(where, {
        include,
      });

      return { reports };
    } catch (err) {
      Sentry.captureException(err);
      console.log(`${req.url}: Staff user failed to retrieve reports.`, {
        err,
      });
      throw err;
    }
  }

  /**
   * Delete a report
   * @param {FastifyRequest} request
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<{{}}>}
   */
  async deleteReport(req) {
    const funcName = 'StaffReportService.deleteReport';
    try {
      const { agency_report_id } = req.query;

      h.validation.requiredParams(funcName, {
        agency_report_id,
      });

      await this.agencyReportController.destroy(
        { agency_report_id },
        {
          transaction: this.dbTransaction,
        },
      );
    } catch (err) {
      Sentry.captureException(err);
      console.log(`${req.url}: Failed to delete report`, {
        err,
      });
      throw err;
    }
  }
}

module.exports = StaffReportService;
