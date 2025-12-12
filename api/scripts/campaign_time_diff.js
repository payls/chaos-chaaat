const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;
const fs = require('fs');
const path = require('path');

// always check
const agency_id = '1f880948-0097-40a8-b431-978fd59ca321';
const campaign_name =
  'One Global Property Services Campaign Garden Towers Apr 12 2023';
const file_name = 'ogps_sg_apr_12_manual_replies_with_time_diff.csv';

const data = [];

async function getDateTimeInterval(datetime1, datetime2) {
  const diff = Math.abs(datetime2 - datetime1) / 1000; // get difference in seconds

  const intervals = {
    year: Math.floor(diff / 31536000),
    month: Math.floor(diff / 2592000),
    week: Math.floor(diff / 604800),
    day: Math.floor(diff / 86400),
    hour: Math.floor(diff / 3600) % 24,
    minute: Math.floor(diff / 60) % 60,
    second: Math.floor(diff) % 60,
  };

  const parts = [];

  for (const [key, value] of Object.entries(intervals)) {
    if (value !== 0) {
      parts.push(`${value} ${key}${value !== 1 ? 's' : ''}`);
    }
  }

  // Add remaining seconds if any
  if (parts.length === 1 && intervals.second !== 0) {
    parts.push(
      `${intervals.second} second${intervals.second !== 1 ? 's' : ''}`,
    );
  }

  return parts.join(', ');
}

async function getManualMessageResponseTime() {
  try {
    const trackerRecord = await models.whatsapp_message_tracker.findAll({
      where: {
        tracker_type: 'main',
        agency_fk: agency_id,
        campaign_name: campaign_name,
      },
      include: [
        {
          model: models.whatsapp_chat,
          where: {
            msg_type: 'text',
          },
        },
      ],
      order: [['created_date', 'ASC']],
    });

    const processedNumbers = [];
    const manualReplies = [];

    for (const tracker of trackerRecord) {
      const trackerData = tracker?.dataValues;
      if (!processedNumbers.includes(trackerData?.receiver_number)) {
        processedNumbers.push(trackerData?.receiver_number);
        const chatRecord = await models.whatsapp_chat.findAll({
          where: {
            msg_type: 'text',
            agency_fk: agency_id,
            campaign_name:
              'One Global Property Services Campaign Garden Towers Apr 12 2023',
            receiver_number: trackerData?.receiver_number,
          },
          include: [
            {
              model: models.contact,
              required: true,
            },
          ],
          order: [['created_date', 'ASC']],
        });

        const dataArr = [];

        for (let i = 0; i < chatRecord.length; i++) {
          const chat = chatRecord[i].dataValues;
          const nextChat = chatRecord[i + 1]?.dataValues;

          let message = chat?.msg_body;
          message = message.replace(/[\n\r]/g, '');
          const mesage_date = new Date(chat?.created_date);
          const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          };
          const formattedMsgDate = mesage_date.toLocaleString('en-US', options);
          let record = [
            chat?.contact?.dataValues?.contact_id,
            chat?.contact?.dataValues?.first_name,
            chat?.contact?.dataValues?.last_name,
            chat?.contact?.dataValues?.mobile_number,
            message,
            formattedMsgDate,
          ];

          const replyRecord = await models.whatsapp_chat.findAll({
            where: {
              msg_type: 'frompave',
              agency_fk: agency_id,
              campaign_name:
                'One Global Property Services Campaign Garden Towers Apr 12 2023',
              created_date: {
                [Op.gt]: chat?.created_date,
                ...(nextChat &&
                h.cmpStr(nextChat?.receiver_number, chat?.receiver_number)
                  ? { [Op.lt]: nextChat?.created_date }
                  : {}),
              },
              receiver_number: chat?.receiver_number,
            },
            order: [['created_date', 'ASC']],
          });

          for (const reply of replyRecord) {
            const replyData = reply?.dataValues;
            let reply_message = replyData?.msg_body;
            reply_message = reply_message.replace(/[\n\r]/g, '');
            const reply_date = new Date(replyData?.created_date);
            const options = {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            };
            const formattedReplyDate = reply_date.toLocaleString(
              'en-US',
              options,
            );
            const interval = await getDateTimeInterval(
              chat?.created_date,
              replyData?.created_date,
            );
            record = [
              chat?.contact?.dataValues?.contact_id,
              chat?.contact?.dataValues?.first_name,
              chat?.contact?.dataValues?.last_name,
              chat?.contact?.dataValues?.mobile_number,
              message,
              formattedMsgDate,
              reply_message,
              formattedReplyDate,
              interval,
            ];
          }

          dataArr.push(record);
        }
        manualReplies.push(dataArr);
      }
    }

    const headers = [
      'Contact ID',
      'First Name',
      'Last Name',
      'Contact Number',
      'Message',
      'Message Date',
      'Agent Reply',
      'Reply Date',
      'Response Duration',
    ];
    fs.writeFile(file_name, headers.join('|') + '\n', (err) => {
      if (err) throw err;
      for (const replies of manualReplies) {
        for (const reply of replies) {
          fs.appendFile(file_name, reply.join('|') + '\n', (err) => {
            if (err) throw err;
          });
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}

getManualMessageResponseTime();
