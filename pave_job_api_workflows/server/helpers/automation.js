const { Op } = require('sequelize');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const Axios = require('axios');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const whatsappHelper = require('./whatsapp');
const appSyncHelper = require('./appsync');
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  test: {
    isTest: testHelper.isTest,
  },
  validation: {
    requiredParams: validationHelper.requiredParams,
  },
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
  sendEmail: emailHelper.sendEmail,
  generateId: generalHelper.generateId,
  sendGraphQLNotification: appSyncHelper.sendGraphQLNotification,
  prettifyConstant: generalHelper.prettifyConstant,
};

const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const automationHelper = module.exports;

automationHelper.getNextImmediateChildNodes = (nodeId, nodeArr) => {
  const immediateChildNodes = nodeArr.filter((item) => {
    const parts = item.nodeId.split('-');
    return (
      parts.length === nodeId.split('-').length + 1 &&
      parts.slice(0, -1).join('-') === nodeId
    );
  });
  return immediateChildNodes;
};

automationHelper.getNodeById = (nodeId, nodeArr) => {
  for (let i = 0; i < nodeArr.length; i++) {
    if (nodeArr[i].nodeId === nodeId) {
      return nodeArr[i];
    }
  }
  return null;
};

automationHelper.getNextImmediateNodeAfterReply = (
  reployToNodeId,
  replyText,
  nodeArr,
) => {
  for (let i = 0; i < nodeArr.length; i++) {
    if (nodeArr[i].id === reployToNodeId) {
      const allQuickReplies = nodeArr[i]?.data?.flowData?.quick_replies || [];
      if (h.isEmpty(allQuickReplies)) return null;
      const nodeToSendAfterReply = allQuickReplies.find(
        (ele) => ele?.text === replyText,
      );
      return nodeToSendAfterReply?.node?.value || null;
    }
  }
  return null;
};

automationHelper.getNodeIndexById = (nodeId, nodeArr) => {
  for (let i = 0; i < nodeArr.length; i++) {
    if (nodeArr[i].nodeId === nodeId) {
      return i;
    }
  }
  return null;
};

automationHelper.getNodeIndexByIdV2 = (nodeId, nodeArr) => {
  for (let i = 0; i < nodeArr.length; i++) {
    if (nodeArr[i].id === nodeId) {
      return i;
    }
  }
  return null;
};

automationHelper.getParentNodeId = (nodes, edges) => {
  const sourceNode = edges.find((ele) => ele.source === '1');
  if (h.isEmpty(sourceNode)) {
    return null;
  }
  const firstNode = nodes.find((ele) => ele.id === sourceNode?.target);
  if (firstNode && firstNode.type !== 'end') {
    return firstNode.id;
  }
  return null;
};
automationHelper.getNextImmediateNodesV2 = (
  nodeId,
  nodeArr,
  isReplyNode = false,
) => {
  const nextNodes = [];
  for (let i = 0; i < nodeArr.length; i++) {
    const nodeIndex = isReplyNode ? i : i + 1;
    if (nodeArr[i].id === nodeId && nodeArr[nodeIndex]) {
      nextNodes.push(nodeArr[nodeIndex]);
    }
  }
  return nextNodes;
};
automationHelper.islastNode = (nodeId, nodeArr, edgeArray) => {
  console.log('******** islastNode nodeId ********', nodeId);
  const edgeNode = edgeArray.filter((ele) => ele.source === nodeId);
  if (edgeNode.length > 1) {
    return false;
  }
  const hasNodeAvailable = nodeArr.find((ele) => ele.id === edgeNode[0].target);

  console.log('******** hasNodeAvailable ********', hasNodeAvailable);
  const currentNode = nodeArr.find((ele) => ele.id === nodeId);
  const quickReplies = currentNode.data?.flowData?.quick_replies || [];
  console.log('******** quickReplies ********', quickReplies);
  if (!hasNodeAvailable) {
    return true;
  } else if (
    hasNodeAvailable &&
    h.notEmpty(quickReplies) &&
    quickReplies.some((ele) => ele?.node?.value)
  ) {
    return false;
  } else if (hasNodeAvailable && hasNodeAvailable.type === 'end') {
    return true;
  } else {
    return false;
  }
};

automationHelper.getConditionalNodes = (parentNodeId, nodeArr) => {
  const conditionalNodes = nodeArr.filter((node) => {
    return node?.data?.parent === parentNodeId;
  });
  return conditionalNodes;
};

automationHelper.getNextNode = (
  currentNodeId,
  nodeArr,
  edgeArr,
  isReplyNode = false,
) => {
  if (h.cmpBool(isReplyNode, true)) {
    const nextNode = nodeArr.find((ele) => ele.id === currentNodeId);
    return nextNode || null;
  } else {
    const currentEdgeNode = edgeArr.find((ele) => ele.source === currentNodeId);
    if (h.isEmpty(currentEdgeNode)) {
      return null;
    }
    const nextNode = nodeArr.find((ele) => ele.id === currentEdgeNode.target);
    return nextNode || null;
  }
};

automationHelper.getNodeById = (nodeId, nodeArr) => {
  for (let i = 0; i < nodeArr.length; i++) {
    if (nodeArr[i].nodeId === nodeId) {
      return nodeArr[i];
    }
  }
  return null;
};

automationHelper.getNodeByParent = (parentNodeId, nodeArr) => {
  return nodeArr.find((node) => node.parent === parentNodeId);
};

automationHelper.getParentTemplateNodes = (nodeArr) => {
  return nodeArr.filter((node) => node.nodeId.startsWith('parentTemplate'));
};

automationHelper.checkIfAllNotNull = (data) => {
  for (const key in data) {
    if (data[key] === null) {
      return false;
    }
  }
  return true;
};

automationHelper.processSendAutomationMessage = async (
  template,
  template_name,
  header_image,
  language,
  variable_arr,
  agency,
  contactAgencyUser,
  contactFirstName,
  receiver_number,
  automation_flow,
  whatsapp_config,
  agencyBufferedCredentials,
  log,
) => {
  let msg_body = '';

  const messageParts = [];
  const messageTemplate = {
    id: '1',
    contentType: 'text/html',
    data: '',
    header: [],
    body: [],
    button: [],
    size: 1000,
    type: 'template',
    sort: 0,
  };

  template.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      if (['IMAGE', 'VIDEO'].includes(component.format)) {
        const filename =
          header_image &&
          header_image.substring(header_image.lastIndexOf('/') + 1);
        if (['IMAGE'].includes(component.format)) {
          messageTemplate.header.push({
            type: 'image',
            image: {
              link: header_image,
              filename: filename,
            },
          });
        }
        if (['VIDEO'].includes(component.format)) {
          messageTemplate.header.push({
            type: 'video',
            video: {
              link: header_image,
              filename: filename,
            },
          });
        }
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      if (
        header_image &&
        !h.cmpStr(
          header_image,
          'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
        )
      ) {
        template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'HEADER')) {
            if (['IMAGE'].includes(component.format)) {
              msg_body += `<img src="${header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
            }
            if (['VIDEO'].includes(component.format)) {
              msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${header_image}"></video>`;
            }
          }
        });
      }
      msg_body += component.text;
      if (typeof component.example !== 'undefined') {
        const examples =
          component.example.body_text.length > 0
            ? component.example.body_text[0]
            : [];
        examples.forEach((ex, index) => {
          let component_value = null;
          if (variable_arr.length > 0) {
            if (variable_arr[index] === 'agency') {
              component_value = h.prettifyConstant(agency?.agency_name);
            } else if (variable_arr[index] === 'agent') {
              component_value = h.prettifyConstant(
                contactAgencyUser.user.first_name,
              );
            } else {
              component_value = contactFirstName || receiver_number;
            }
            messageTemplate.body.push({
              type: 'text',
              text: `${component_value}`,
            });
            msg_body = msg_body.replace(`{{${index + 1}}}`, component_value);
          } else {
            msg_body = msg_body.replace(
              `{{${index + 1}}}`,
              contactFirstName || receiver_number,
            );
          }
        });
      }
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.text}</button>`;
      });
    }
  });

  const body = messageTemplate.body;
  const header = messageTemplate.header;
  const button = messageTemplate.button;

  messageTemplate.data = JSON.stringify({
    element_name: template_name,
    language: language,
    header: header,
    body: body,
    button: button,
  });
  delete messageTemplate.body;
  delete messageTemplate.header;
  delete messageTemplate.button;
  messageParts.push(messageTemplate);

  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;

  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'name',
          address: `${receiver_number}`,
          Connector: `${receiver_number}`,
          type: 'individual',
        },
      ],
      parts: messageParts,
    },
  };

  const sendWhatsAppTemplateMessageResponse =
    await whatsappHelper.sendWhatsAppTemplateMessage(
      receiver_number,
      true,
      null,
      sendMessagePartsData,
      agencyBufferedCredentials,
      environment,
      log,
    );
  return {
    success: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
    original_event_id: h.notEmpty(
      sendWhatsAppTemplateMessageResponse.original_event_id,
    )
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    msg_body: msg_body,
  };
};

automationHelper.processMessageRecord = async (data) => {
  const {
    automation_type,
    models,
    is_new,
    whatsapp_message_tracker_id: tracker_id,
    rule_id,
    agency_id,
    contact_id,
    agency_user_id,
    campaign_name,
    tracker_ref_name,
    original_event_id,
    pending,
    sent,
    delivered,
    read,
    failed,
    replied,
    batch_count,
    msg_id,
    msg_origin,
    msg_platform,
    msg_body,
    msg_info,
    media_url,
    media_msg_id,
    content_type,
    file_name,
    caption,
    msg_type,
    msg_timestamp,
    sender_number,
    sender_url,
    receiver_number,
    receiver_url,
    reply_to_event_id,
    reply_to_content,
    reply_to_msg_type,
    reply_to_file_name,
    reply_to_contact_id,
    transaction,
  } = data;
  const broadcast_date = new Date();
  const sanitizedUnescapedValue =
    h.general.sanitizeMaliciousAttributes(msg_body);

  let whatsapp_message_tracker_id;
  if (h.cmpBool(is_new, true)) {
    whatsapp_message_tracker_id = h.generateId();
    await models.whatsapp_message_tracker.create(
      {
        whatsapp_message_tracker_id,
        campaign_name,
        campaign_name_label: campaign_name,
        tracker_ref_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: agency_user_id,
        original_event_id: original_event_id,
        tracker_type: 'main',
        msg_origin,
        msg_body: sanitizedUnescapedValue,
        msg_id,
        pending,
        failed,
        sent,
        delivered,
        read,
        replied,
        batch_count,
        sender_number,
        receiver_number,
        sender_url,
        receiver_url,
        visible: 0,
        created_by: null,
        broadcast_date: new Date(broadcast_date),
      },
      { transaction },
    );
  } else {
    const tracker = await models.whatsapp_message_tracker.findOne({
      where: {
        receiver_number: receiver_number,
        agency_fk: agency_id,
        msg_id: rule_id,
        msg_origin: 'automation',
        tracker_ref_name: {
          [Op.like]: `%${automation_type}%`,
        },
      },
      order: [['created_date', 'DESC']],
    });

    whatsapp_message_tracker_id = tracker_id;
  }
  const whatsapp_chat_id = h.generateId();
  await models.whatsapp_chat.create(
    {
      whatsapp_chat_id,
      campaign_name,
      agency_fk: agency_id,
      contact_fk: contact_id,
      agency_user_fk: agency_user_id,
      original_event_id,
      msg_id,
      msg_origin,
      msg_body: sanitizedUnescapedValue,
      msg_info,
      media_url,
      media_msg_id,
      content_type,
      file_name,
      caption,
      msg_type,
      msg_timestamp,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      reply_to_event_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      sent,
      delivered,
      read,
      created_date: new Date(broadcast_date),
    },
    { transaction },
  );

  let unified_inbox_id;
  if (h.cmpBool(is_new, true)) {
    unified_inbox_id = h.generateId();
    await models.unified_inbox.create(
      {
        unified_inbox_id,
        tracker_id: whatsapp_message_tracker_id,
        tracker_ref_name,
        campaign_name,
        agency_fk: agency_id,
        agency_user_fk: agency_user_id,
        contact_fk: contact_id,
        event_id: original_event_id,
        msg_id: whatsapp_chat_id,
        msg_body: sanitizedUnescapedValue,
        msg_type,
        msg_platform,
        tracker_type: 'main',
        pending,
        failed,
        sent,
        delivered,
        read,
        replied,
        batch_count,
        sender: sender_number,
        receiver: receiver_number,
        sender_url: sender_url,
        receiver_url: receiver_url,
        visible: 1,
        created_by: null,
        broadcast_date: new Date(broadcast_date),
        last_msg_date: new Date(broadcast_date),
      },
      { transaction },
    );
  } else {
    const unified_entry = await models.unified_inbox.findOne({
      where: {
        receiver: receiver_number,
        agency_fk: agency_id,
        msg_platform: msg_platform,
      },
      order: [['created_date', 'DESC']],
    });

    await models.unified_inbox.update(
      {
        tracker_id: whatsapp_message_tracker_id,
        tracker_ref_name,
        campaign_name,
        agency_fk: agency_id,
        agency_user_fk: agency_user_id,
        contact_fk: contact_id,
        event_id: original_event_id,
        msg_id: whatsapp_chat_id,
        msg_body: sanitizedUnescapedValue,
        msg_type,
        broadcast_date: new Date(broadcast_date),
        last_msg_date: new Date(broadcast_date),
        created_date: new Date(broadcast_date),
        updated_date: new Date(broadcast_date),
      },
      {
        where: {
          agency_fk: agency_id,
          receiver: receiver_number,
          msg_platform: 'whatsapp',
        },
        transaction,
      },
    );
  }

  const appsync = await models.appsync_credentials.findOne({
    where: {
      status: 'active',
    },
  });
  const api_key = appsync.api_key;

  const created_date = broadcast_date;

  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const date = new Date(created_date);
  const formattedDate = date.toLocaleDateString('en-US', options);

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  await h.sendGraphQLNotification(api_key, {
    position: msg_type.includes('frompave') ? 'client' : 'contact',
    platform: msg_platform,
    campaign_name: campaign_name,
    agency_fk: agency_id,
    contact_fk: contact_id,
    agency_user_fk: agency_user_id,
    original_event_id: original_event_id,
    msg_id,
    msg_body: `${sanitizedUnescapedValue}`,
    media_url,
    media_msg_id,
    content_type,
    file_name,
    caption,
    msg_type: msg_type,
    msg_timestamp,
    sender_number,
    sender_url,
    receiver_number,
    receiver_url,
    reply_to_event_id,
    reply_to_content,
    reply_to_msg_type,
    reply_to_file_name,
    reply_to_contact_id,
    sent,
    delivered,
    read,
    replied,
    failed,
    created_date_raw: broadcast_date,
    created_date: `${formattedDate} ${formattedTime}`,
  });

  return {
    whatsapp_chat_id,
    whatsapp_message_tracker_id,
    unified_inbox_id,
  };
};

automationHelper.processSendTextMessage = async (
  message_content,
  agency,
  contactAgencyUser,
  contactFirstName,
  receiver_number,
  automation_flow,
  whatsapp_config,
  agencyBufferedCredentials,
  log,
) => {
  let sendMessageData;
  const msgParts = [];

  const newMsgReply =
    '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
    contactAgencyUser.user.first_name +
    '</strong></div>\n' +
    message_content;

  msgParts.push({
    id: '1',
    contentType: 'text/html',
    data: newMsgReply,
    size: newMsgReply.length,
    type: 'body',
    sort: 0,
  });

  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;

  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'name',
          address: `${receiver_number}`,
          Connector: `${receiver_number}`,
          type: 'individual',
        },
      ],
      parts: msgParts,
    },
  };

  const sendWhatsAppTemplateMessageResponse =
    await whatsappHelper.sendWhatsAppTemplateMessage(
      receiver_number,
      true,
      null,
      sendMessagePartsData,
      agencyBufferedCredentials,
      environment,
      log,
    );
  return {
    success: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
    original_event_id: h.notEmpty(
      sendWhatsAppTemplateMessageResponse.original_event_id,
    )
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    msg_body: message_content,
  };
};

automationHelper.getNextNode = (
  currentNodeId,
  nodeArr,
  edgeArr,
  isReplyNode = false,
) => {
  if (h.cmpBool(isReplyNode, true)) {
    const nextNode = nodeArr.find((ele) => ele.id === currentNodeId);
    return nextNode || null;
  } else {
    const currentEdgeNode = edgeArr.find((ele) => ele.source === currentNodeId);
    if (h.isEmpty(currentEdgeNode)) {
      return null;
    }
    const nextNode = nodeArr.find((ele) => ele.id === currentEdgeNode.target);
    return nextNode || null;
  }
};
