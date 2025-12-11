const h = require('../../../helpers');
const { Op } = require('sequelize');
const constant = require('../../../constants/constant.json');

module.exports.makeController = (models) => {
  const {
    agency: agencyModel,
    agency_channel_config: agencyChannelConfigModel,
    agency_user: agencyUserModel,
    appsync_credentials: appsyncModel,
    contact: contactModel,
    contact_source: contactSourceModel,
    line_chat: lineChatModel,
    line_follower: lineFollowerModel,
    line_message_tracker: lineMessageTrackerModel,
    unified_inbox: unifiedInboxModel,
    user: userModel,
  } = models;

  const lineCtl = {};

  lineCtl.processContactFollow = async (data, log, { transaction } = {}) => {
    try {
      const funcName = 'lineCtl.processContactFollow';
      const {
        agency_id,
        agency_channel_config_id,
        api_token,
        api_secret,
        agent_line_id,
        agent_line_url,
        contact_line_id,
        contact_line_url,
        msg_type,
        event_id,
        timestamp,
      } = data;

      const lineFollower = await lineFollowerModel.findOne({
        where: {
          agency_fk: agency_id,
          agency_channel_config_fk: agency_channel_config_id,
          line_user_fk: contact_line_id,
        },
      });

      if (h.isEmpty(lineFollower)) {
        const line_follower_id = h.general.generateId();
        await lineFollowerModel.create(
          {
            line_follower_id,
            agency_fk: agency_id,
            agency_channel_config_fk: agency_channel_config_id,
            line_user_fk: contact_line_id,
            status: 'active',
          },
          { transaction },
        );
      } else {
        await lineFollowerModel.update(
          {
            status: 'active',
          },
          {
            where: {
              line_follower_id: lineFollower.dataValues.line_follower_id,
            },
            transaction,
          },
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  return lineCtl;
};
