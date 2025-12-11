const h = require('../../helpers');
const StaffCommon = require('../common');

class LineUIBService extends StaffCommon {
  constructor() {
    super();
    this.agencyChannelConfig =
      require('../../controllers/agencyChannelConfig').makeController(
        this.models,
      );
    this.lineFollow =
      require('../../controllers/line/uib/follow').makeController(this.models);
    this.lineUnfollow =
      require('../../controllers/line/uib/unfollow').makeController(
        this.models,
      );
    this.lineText = require('../../controllers/line/uib/text').makeController(
      this.models,
    );
    this.lineImage = require('../../controllers/line/uib/image').makeController(
      this.models,
    );
    this.lineVideo = require('../../controllers/line/uib/video').makeController(
      this.models,
    );

    this.getMessageType = function (part) {
      const { contentType, data /* originalEvent */ } = part;
      if (contentType === 'status') {
        return data;
      }
      return contentType;
    };
  }

  setDbTransaction(dbTransaction) {
    super.setDbTransaction(dbTransaction);
  }

  async processLinePayload(payload, body, log, additionalConfig) {
    if (body && body.data && (body.data.connectionname || body.data.uri)) {
      const bodyData = body.data;
      const parts = bodyData?.parts || [];
      const part = parts[0];
      const { data: msgData, originalEvent } = part;
      const parsedOriginalEvent = JSON.parse(originalEvent);
      const value = this.getMessageType(part);

      // agent contact line details
      const agent_line_id = bodyData?.senderaddress;
      const contact_line_id = bodyData?.receiveraddress;
      const agent_line_url = bodyData?.sender;
      const contact_line_url = bodyData?.receiver;

      const agencyChannelConfig = await this.agencyChannelConfig.findOne(
        {
          channel_id: agent_line_id,
          channel_type: 'line',
        },
        { transaction: this.dbTransaction },
      );
      const agency_id = agencyChannelConfig.agency_fk;
      const agency_channel_config_id =
        agencyChannelConfig.agency_channel_config_id;
      const api_token = agencyChannelConfig.uib_api_token;
      const api_secret = agencyChannelConfig.uib_api_secret;
      const payloadTimestamp = bodyData?.timestamp;
      const timestamp = Math.round(payloadTimestamp / 1000);
      const event_id = parsedOriginalEvent.events[0].webhookEventId;

      if (h.cmpStr(value, 'event')) {
        if (h.cmpStr(msgData, 'follow')) {
          log.info({
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: 'follow',
            event_id: event_id,
            timestamp,
          });
          await this.lineFollow.processContactFollow(
            {
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: 'follow',
              event_id: event_id,
              timestamp,
            },
            log,
            { transaction: this.dbTransaction },
          );
        } else if (h.cmpStr(msgData, 'unfollow')) {
          console.log({
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: 'unfollow',
            event_id: event_id,
            timestamp,
          });
          await this.lineUnfollow.processContactUnfollow(
            {
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: 'unfollow',
              event_id: event_id,
              timestamp,
            },
            log,
            { transaction: this.dbTransaction },
          );
        } else {
          log.info({
            what: 'INVALID LINE EVENT',
            event: msgData,
            data: originalEvent,
          });
        }
      } else if (h.cmpStr(value, 'text')) {
        const content = parsedOriginalEvent.events[0].message.text;
        log.info({
          agency_id,
          agency_channel_config_id,
          api_token,
          api_secret,
          agent_line_id,
          agent_line_url,
          contact_line_id,
          contact_line_url,
          msg_type: value,
          content,
          event_id: event_id,
          timestamp,
        });
        await this.lineText.processTextMessage(
          {
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: value,
            content,
            event_id: event_id,
            timestamp,
            additionalConfig
          },
          log,
          { transaction: this.dbTransaction },
        );
      } else if (h.cmpStr(value, 'image')) {
        const image_id = parsedOriginalEvent.events[0].message.id;
        log.info({
          agency_id,
          agency_channel_config_id,
          api_token,
          api_secret,
          agent_line_id,
          agent_line_url,
          contact_line_id,
          contact_line_url,
          msg_type: value,
          content: image_id,
          event_id: event_id,
          timestamp,
        });
        await this.lineImage.processImageMessage(
          {
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: value,
            content: image_id,
            event_id: event_id,
            timestamp,
            additionalConfig
          },
          log,
          { transaction: this.dbTransaction },
        );
      } else if (h.cmpStr(value, 'video')) {
        const video_id = parsedOriginalEvent.events[0].message.id;
        log.info({
          agency_id,
          agency_channel_config_id,
          api_token,
          api_secret,
          agent_line_id,
          agent_line_url,
          contact_line_id,
          contact_line_url,
          msg_type: value,
          content: video_id,
          event_id: event_id,
          timestamp,
        });
        await this.lineVideo.processVideoMessage(
          {
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: value,
            content: video_id,
            event_id: event_id,
            timestamp,
            additionalConfig
          },
          log,
          { transaction: this.dbTransaction },
        );
      }
    } else {
      log.info({
        what: 'INVALID LINE UIB PAYLOAD DATA',
        data: payload,
      });
    }
  }
}

module.exports = LineUIBService;
