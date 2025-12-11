const h = require('../../helpers');
const StaffCommon = require('../common');

class LineDirectService extends StaffCommon {
  constructor() {
    super();
    this.agencyChannelConfig =
      require('../../controllers/agencyChannelConfig').makeController(
        this.models,
      );
    this.lineDirectFollow =
      require('../../controllers/line/direct/follow').makeController(
        this.models,
      );
    // this.lineUnfollow =
    //   require('../../controllers/line/direct/unfollow').makeController(
    //     this.models,
    //   );
    this.lineDirectText =
      require('../../controllers/line/direct/text').makeController(this.models);
    this.lineDirectImage =
      require('../../controllers/line/direct/image').makeController(
        this.models,
      );
    // this.lineVideo =
    //   require('../../controllers/line/direct/video').makeController(
    //     this.models,
    //   );

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

  async processLinePayload(payload, body, agency_channel, transaction, log, additionalConfig) {
    try {
      this.setDbTransaction(transaction);
      if (body && !h.isEmpty(body.destination) && !h.isEmpty(body.events)) {
        console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
        console.log(agency_channel);
        const events = body.events;
        events.forEach(async (event) => {
          console.log(event);
          const agency_id = agency_channel.agency_fk;
          const agency_channel_config_id =
            agency_channel.agency_channel_config_id;
          const api_token = agency_channel.uib_api_token;
          const api_secret = agency_channel.uib_api_secret;
          const agent_line_id = agency_channel.channel_id;
          const contact_line_id = event.source.userId;
          const agent_line_url = `line://${agency_channel.channel_id}@`;
          const contact_line_url = `line://${event.source.userId}@line.com`;
          const type = event.type;
          const payloadTimestamp = event.timestamp;
          const timestamp = Math.round(payloadTimestamp / 1000);
          const event_id = event.webhookEventId;
          if (h.cmpStr(type, 'follow')) {
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

            await this.lineDirectFollow.processContactFollow(
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
          } else if (h.cmpStr(type, 'message')) {
            const msgType = event.message.type;
            if (h.cmpStr(msgType, 'text')) {
              const content = event.message.text;
              log.info({
                agency_id,
                agency_channel_config_id,
                api_token,
                api_secret,
                agent_line_id,
                agent_line_url,
                contact_line_id,
                contact_line_url,
                msg_type: msgType,
                content,
                event_id: event_id,
                timestamp,
              });

              await this.lineDirectText.processTextMessage(
                {
                  agency_id,
                  agency_channel_config_id,
                  api_token,
                  api_secret,
                  agent_line_id,
                  agent_line_url,
                  contact_line_id,
                  contact_line_url,
                  msg_type: msgType,
                  content,
                  event_id: event_id,
                  timestamp,
                  additionalConfig
                },
                log,
                { transaction: this.dbTransaction },
              );
            } else if (h.cmpStr(msgType, 'image')) {
              const content = event.message.id;
              log.info({
                agency_id,
                agency_channel_config_id,
                api_token,
                api_secret,
                agent_line_id,
                agent_line_url,
                contact_line_id,
                contact_line_url,
                msg_type: msgType,
                content: content,
                event_id: event_id,
                timestamp,
              });
              await this.lineDirectImage.processImageMessage(
                {
                  agency_id,
                  agency_channel_config_id,
                  api_token,
                  api_secret,
                  agent_line_id,
                  agent_line_url,
                  contact_line_id,
                  contact_line_url,
                  msg_type: msgType,
                  content: content,
                  event_id: event_id,
                  timestamp,
                  additionalConfig
                },
                log,
                { transaction: this.dbTransaction },
              );
            }
          }
        });

        //   if (h.cmpStr(value, 'event')) {
        //     if (h.cmpStr(msgData, 'follow')) {
        //       log.info({
        //         agency_id,
        //         agency_channel_config_id,
        //         api_token,
        //         api_secret,
        //         agent_line_id,
        //         agent_line_url,
        //         contact_line_id,
        //         contact_line_url,
        //         msg_type: 'follow',
        //         event_id: event_id,
        //         timestamp,
        //       });
        //       await this.lineFollow.processContactFollow(
        //         {
        //           agency_id,
        //           agency_channel_config_id,
        //           api_token,
        //           api_secret,
        //           agent_line_id,
        //           agent_line_url,
        //           contact_line_id,
        //           contact_line_url,
        //           msg_type: 'follow',
        //           event_id: event_id,
        //           timestamp,
        //         },
        //         log,
        //         {
        //           transaction,
        //         },
        //       );
        //     } else if (h.cmpStr(msgData, 'unfollow')) {
        //       console.log({
        //         agency_id,
        //         agency_channel_config_id,
        //         api_token,
        //         api_secret,
        //         agent_line_id,
        //         agent_line_url,
        //         contact_line_id,
        //         contact_line_url,
        //         msg_type: 'unfollow',
        //         event_id: event_id,
        //         timestamp,
        //       });
        //       await this.lineUnfollow.processContactUnfollow(
        //         {
        //           agency_id,
        //           agency_channel_config_id,
        //           api_token,
        //           api_secret,
        //           agent_line_id,
        //           agent_line_url,
        //           contact_line_id,
        //           contact_line_url,
        //           msg_type: 'unfollow',
        //           event_id: event_id,
        //           timestamp,
        //         },
        //         log,
        //         {
        //           transaction,
        //         },
        //       );
        //     } else {
        //       log.info({
        //         what: 'INVALID LINE EVENT',
        //         event: msgData,
        //         data: originalEvent,
        //       });
        //     }
        //   } else if (h.cmpStr(value, 'text')) {
        //     const content = parsedOriginalEvent.events[0].message.text;
        //     log.info({
        //       agency_id,
        //       agency_channel_config_id,
        //       api_token,
        //       api_secret,
        //       agent_line_id,
        //       agent_line_url,
        //       contact_line_id,
        //       contact_line_url,
        //       msg_type: value,
        //       content,
        //       event_id: event_id,
        //       timestamp,
        //     });
        //     await this.lineText.processTextMessage(
        //       {
        //         agency_id,
        //         agency_channel_config_id,
        //         api_token,
        //         api_secret,
        //         agent_line_id,
        //         agent_line_url,
        //         contact_line_id,
        //         contact_line_url,
        //         msg_type: value,
        //         content,
        //         event_id: event_id,
        //         timestamp,
        //         additionalConfig
        //       },
        //       log,
        //       {
        //         transaction,
        //       },
        //     );
        //   } else if (h.cmpStr(value, 'image')) {
        //     const image_id = parsedOriginalEvent.events[0].message.id;
        //     log.info({
        //       agency_id,
        //       agency_channel_config_id,
        //       api_token,
        //       api_secret,
        //       agent_line_id,
        //       agent_line_url,
        //       contact_line_id,
        //       contact_line_url,
        //       msg_type: value,
        //       content: image_id,
        //       event_id: event_id,
        //       timestamp,
        //     });
        //     await this.lineImage.processImageMessage(
        //       {
        //         agency_id,
        //         agency_channel_config_id,
        //         api_token,
        //         api_secret,
        //         agent_line_id,
        //         agent_line_url,
        //         contact_line_id,
        //         contact_line_url,
        //         msg_type: value,
        //         content: image_id,
        //         event_id: event_id,
        //         timestamp,
        //         additionalConfig
        //       },
        //       log,
        //       {
        //         transaction,
        //       },
        //     );
        //   } else if (h.cmpStr(value, 'video')) {
        //     const video_id = parsedOriginalEvent.events[0].message.id;
        //     log.info({
        //       agency_id,
        //       agency_channel_config_id,
        //       api_token,
        //       api_secret,
        //       agent_line_id,
        //       agent_line_url,
        //       contact_line_id,
        //       contact_line_url,
        //       msg_type: value,
        //       content: video_id,
        //       event_id: event_id,
        //       timestamp,
        //     });
        //     await this.lineVideo.processVideoMessage(
        //       {
        //         agency_id,
        //         agency_channel_config_id,
        //         api_token,
        //         api_secret,
        //         agent_line_id,
        //         agent_line_url,
        //         contact_line_id,
        //         contact_line_url,
        //         msg_type: value,
        //         content: video_id,
        //         event_id: event_id,
        //         timestamp,
        //         additionalConfig
        //       },
        //       log,
        //       {
        //         transaction,
        //       },
        //     );
        //   }
        // } else {
        //   log.info({
        //     what: 'INVALID LINE PAYLOAD DATA',
        //     data: payload,
        //   });
      } else {
        log.info({
          what: 'INVALID LINE DIRECT PAYLOAD DATA',
          data: payload,
        });
      }
      return true;
    } catch (err) {
      console.log('fail processing direct line payload', {
        err,
      });
      throw err;
    }
  }
}

module.exports = LineDirectService;
