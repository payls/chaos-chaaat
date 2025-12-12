const { v1: uuidv4 } = require("uuid");
const axios = require("axios");
const Sentry = require('@sentry/node');

const constant = require("../../../../constants/constant.json");
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require("../../../../middlewares/user");
const c = require("../../../../controllers");
const h = require("../../../../helpers");
const models = require("../../../../models");
const whatsappFlowUtils = require('../whatsappFlow/whatsappFlowUtils');

/**
 * preValidation handler - validates if the user is loggedIn and is a staff / admin
 * @param {FastifyRequest} req
 * @param {FastifyResponse} res
 * @returns
 */
async function preValidation(req, res) {
  await userMiddleware.isLoggedIn(req, res);
  await userMiddleware.hasAccessToStaffPortal(req, res);
}

const schema = {
  body: {
    type: "object",
    properties: {
      nodes: {
        type: "array",
        items: { type: "object" },
      },
      edges: {
        type: "array",
        items: { type: "object" },
      },
      automation_rule_id: { type: "string"},
      waba_config_id: { type: "string"}
    },
    required: ["nodes", "edges", "automation_rule_id", "waba_config_id"],
  },
};

const addTemplateHeader = async (bufferedCredentials, imageData, template) => {
  const imageUploadConfig = {
    method: "post",
    url: "https://template.unificationengine.com/upload",
    headers: {
      Authorization: `Basic ${bufferedCredentials}`,
      "Content-Type": "application/json",
    },
    data: imageData,
  };

  const imageUploadResponse = await axios(imageUploadConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });

  console.log("💥💥💥💥 UPLOAD RESPONSE 💥💥💥💥");
  console.log(imageUploadResponse);
  console.log("💥💥💥💥💥 UPLOAD RESPONSE 💥💥💥💥");

  if (!h.cmpInt(imageUploadResponse.status, 200))
    throw new Error(`Error creating template. Failed to upload image header`);

  const file_handle = imageUploadResponse.file_handle;
  const image_example = { header_handle: [file_handle] };
  template.components.push({
    type: "HEADER",
    format: "IMAGE",
    example: image_example,
  });
};

const addTemplateBody = (template_body, body_variables, template) => {
  const body = { type: "BODY", text: template_body };
  if (!h.isEmpty(body_variables)) {
    const template_body_variables = [];
    for (const key in body_variables) {
      template_body_variables.push(body_variables[key]);
    }
    body.example = { body_text: [template_body_variables] };
  }
  template.components.push(body);
};

const addQuickReplyButtons = async (agency_fk, quick_replies, template) => {
  const buttons = [];
  const { agency_config_id, whatsapp_config } =
    await models.agency_config.findOne({
      where: { agency_fk: agency_fk },
    });
  const wa_config = JSON.parse(whatsapp_config);
  let saved_quick_replies = wa_config.quick_replies;
  const new_whatsapp_config = {
    is_enabled: wa_config.is_enabled,
    environment: wa_config.environment,
    quick_replies: saved_quick_replies,
  };
  let index = 1;
  for (const reply of quick_replies) {
    buttons.push({ type: "QUICK_REPLY", text: reply });
    saved_quick_replies = h.whatsapp.checkIfQuickReplyIsMonitored(
      index,
      reply,
      saved_quick_replies
    );
    index++;
  }
  new_whatsapp_config.quick_replies = saved_quick_replies;
  await c.agencyConfig.update(agency_config_id, {
    whatsapp_config: JSON.stringify(new_whatsapp_config),
  });
  template.components.push({ type: "BUTTONS", buttons: buttons });
};

const addCTAButtons = (cta_btn, agency_id, template) => {
  const cta_action = cta_btn.action.value;
  if (h.cmpStr(cta_action, "visit_website")) {
    const url_type = cta_btn.type.value;
    const url_text = cta_btn.value;
    const url = cta_btn.web_url;
    const buttons = [];
    if (h.cmpStr(url_type, "dynamic")) {
      buttons.push({
        type: "URL",
        text: url_text,
        url: url + "/{{1}}",
        example: [url + "/Sample-Proposal-for-Test-Contact"],
      });
    } else if (h.cmpStr(url_type, "contact_email")) {
      if (
        [
          "8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47",
          "36f64032-bdf9-4cdc-b980-cdcdec944fb8",
        ].includes(agency_id)
      ) {
        buttons.push({
          type: "URL",
          text: url_text,
          url: url + "/{{1}}",
          example: [url + "/?referred_by=sample_email@domain.com"],
        });
      } else {
        buttons.push({
          type: "URL",
          text: url_text,
          url: url + "/{{1}}",
          example: [url + "/sample_email@domain.com"],
        });
      }
    } else {
      buttons.push({
        type: "URL",
        text: url_text,
        url: url,
      });
    }
    template.components.push({ type: "BUTTONS", buttons: buttons });
  }
};

const generateTemplate = async (
  waba_id,
  agency_id,
  templateCredentials,
  temaplateData
) => {
  const {
    template_category,
    template_name,
    template_language,
    template_header,
    template_image,
    template_body,
    template_button,
    quick_replies,
    cta_btn,
    body_variables,
  } = temaplateData;

  const template = {
    category: Object.keys(template_category)[0],
    name: template_name,
    access_token: waba_id,
    language: Object.keys(template_language)[0],
    components: [],
  };
  if (h.cmpStr(template_header, "image")) {
    const imageData = {
      access_token: waba_id,
      media_url: template_image,
      mime_type: await h.general.getMimeType(template_image),
    };
    await addTemplateHeader(templateCredentials, imageData, template);
  }

  if (!h.isEmpty(template_body)) {
    addTemplateBody(template_body, body_variables, template);
  }

  if (h.cmpStr(template_button, "QUICK_REPLY") && !h.isEmpty(quick_replies)) {
    await addQuickReplyButtons(agency_id, quick_replies, template);
  }

  if (h.cmpStr(template_button, "CTA") && !h.isEmpty(cta_btn)) {
    addCTAButtons(cta_btn, agency_id, template);
  }

  return template;
};

const processWhatsappTemplates = async (templateData, waba_config_id) => {
  const { template_image, body_variables_type, template_id } = templateData;

  const waba = await c.agencyWhatsAppConfig.findOne({
    agency_whatsapp_config_id: waba_config_id,
  });
  const agency_id = waba?.agency_fk;

  const waba_id = waba?.agency_waba_id;
  const credentials = h.notEmpty(waba?.agency_waba_id)
    ? waba?.agency_waba_template_token + ":" + waba?.agency_waba_template_secret
    : null;
  const bufferedCredentials = Buffer.from(credentials, "utf8").toString(
    "base64"
  );

  let templateStatus = "PENDING"
  if(h.notEmpty(template_id)) {
    const temaplateDetails = await h.whatsapp.getWhatsappTemplate(template_id, waba_id, bufferedCredentials)
    if (h.notEmpty(temaplateDetails?.info?.status)) {
      templateStatus = temaplateDetails.info.status
    }
  }

  // don't allow to edit if template is approved already
  if (h.cmpStr(templateStatus, "APPROVED")) {
    await models.waba_template.update(
      {
        status: "APPROVED",
      },
      {
        where: {
          template_id,
        },
      }
    );
    return { templateId: template_id, templateStatus };
  }

  const template = await generateTemplate(
    waba_id,
    agency_id,
    bufferedCredentials,
    templateData
  );

  if (h.notEmpty(template_id)) {
    template.template_id = template_id;
  }

  const templateRes = template_id
    ? await h.whatsapp.updateWhatsappTemplate(template, bufferedCredentials)
    : await h.whatsapp.createWhatsappTemplate(template, bufferedCredentials);

  const templateList = await h.whatsapp.retrieveTemplates({
    waba_id,
    credentials: bufferedCredentials,
    log: null,
  });

  const createdTemplate = templateList.templates.find(
    (template) => template.id === templateRes.id
  );

  if (!createdTemplate) {
    throw new Error("template not found");
  }

  const db_template = await models.waba_template.findOne({
    where: {
      agency_fk: waba?.agency_fk,
      template_id: templateRes.id,
      waba_number: waba?.waba_number,
    },
  });

  if (db_template) {
    await models.waba_template.update(
      {
        agency_fk: waba?.agency_fk,
        template_id: createdTemplate.id,
        template_name: createdTemplate.name,
        waba_number: waba?.waba_number,
        content: JSON.stringify(createdTemplate),
        header_image: template_image,
        category: createdTemplate.category,
        language: createdTemplate.language,
        status: createdTemplate.status,
        is_draft: false,
        visible: true,
        variable_identifier: Array.isArray(body_variables_type)
          ? body_variables_type.join(",")
          : body_variables_type,
        template_order: createdTemplate.name.includes("quick") ? 2 : 1,
      },
      {
        where: {
          waba_template_id: db_template?.waba_template_id,
        },
      }
    );
    return { templateId: createdTemplate.id, templateStatus };
  } else {
    const waba_template_id = h.general.generateId();
    await models.waba_template.create({
      waba_template_id: waba_template_id,
      agency_fk: waba?.agency_fk,
      template_id: createdTemplate.id,
      template_name: createdTemplate.name,
      waba_number: waba?.waba_number,
      content: JSON.stringify(createdTemplate),
      header_image: template_image,
      category: createdTemplate.category,
      language: createdTemplate.language,
      status: createdTemplate.status,
      variable_identifier: Array.isArray(body_variables_type)
        ? body_variables_type.join(",")
        : body_variables_type,
      is_draft: false,
      visible: true,
      template_order: createdTemplate.name.includes("quick") ? 2 : 1,
    });
    return { templateId: createdTemplate.id, templateStatus };
  }
};

const formatWhatsappTemplateData = (template) => {
  const { flowData } = template.data;
  const templateObj = {
    template_name: "",
    template_language: null,
    template_category: null,
    template_body: "",
    is_draft: false,
    quick_replies: [],
    cta_btn: null,
    template_image: null,
    body_variables: {},
    body_variables_type: "",
  };
  // Add Template name
  templateObj["template_name"] = flowData.template_name;
  // Add template language
  templateObj["template_language"] = flowData.template_language.value;
  // Add template category
  templateObj["template_category"] = flowData.template_category.value;
  // Add template header
  if (h.notEmpty(flowData?.image)) {
    templateObj["template_header"] = "image";
    templateObj["template_image"] = flowData.image;
  }
  // Add Template body
  templateObj["template_body"] = flowData.template_body;
  if (h.notEmpty(flowData?.body_variables)) {
    templateObj["body_variables"] = flowData.body_variables;
  }
  if (h.notEmpty(flowData?.body_variables_type)) {
    templateObj["body_variables_type"] = flowData.body_variables_type;
  }
  // Add quick reply buttons
  let quick_replies = flowData?.quick_replies || [];
  quick_replies = quick_replies.filter((ele) => h.notEmpty(ele.text));
  if (h.notEmpty(quick_replies)) {
    templateObj["template_button"] = "QUICK_REPLY";
    templateObj["quick_replies"] = quick_replies.map((ele) => ele.text);
  }
  // Add CTA button
  if (h.notEmpty(flowData?.cta_btn?.web_url)) {
    templateObj["template_button"] = "CTA";
    templateObj["cta_btn"] = flowData.cta_btn;
  }
  // add waba_template_id if need to udate custom template
  if (h.notEmpty(flowData?.template_id) && flowData.template_id) {
    templateObj["template_id"] = flowData.template_id;
  }
  return templateObj;
};

const publishWhatsappFlow = async (flowId, whatsappFlowId, creds) => {
  try {
    console.log("************publishWhatsappFlow**********")
    console.log(`************ WhatsappFlowId : ${whatsappFlowId} **********`)
    console.log(`************ flowId: ${flowId} **********`)
    let isPublished = false;
    const { access_token, agencyBufferedTemplateCredentials } = creds;
    const publishedFlow =  await h.whatsapp.publishWhatsappFlow({
      flow_id: flowId,
      access_token,
      credentials: agencyBufferedTemplateCredentials,
    });
    console.log(`******** publishedFlow : ${publishedFlow} *********`);
    if (h.cmpInt(publishedFlow.status, 200)) {
      const updateObj = {
        status: "published"
      }
      await c.whatsappFlow.update(whatsappFlowId, updateObj);
      return { isPublished: true }
    }
    return { isPublished }
  } catch (error) {
    throw error;
  }
};

/** 
 * This api will perform below task:
 * - Create template and send for approval if it is custom template.
 * - Update custom template if it is in PENDING state.
 * - Publish whatsapp workflow
 * - Update message_flow_data column
 */
async function handler(req, res) {
  try {
    const { nodes, edges, automation_rule_id, waba_config_id } = req.body;

    const ruleTemplate = await c.automationRuleTemplate.findOne({
      automation_rule_fk: automation_rule_id,
    });

    if (h.isEmpty(ruleTemplate)) {
      throw new Error("automation rule template not found");
    }
    const { automation_rule_template_id } = ruleTemplate;

    for (const node of nodes) {
      /**
       * Create new template if template_id not present.
       * Modify custom template if template_id is present and template is not approved.
       */
      if (
        h.cmpStr(node.type, "message") &&
        !h.cmpStr(node.data?.flowData?.customSelected, "simple-text") &&
        h.cmpStr(node.data?.flowData?.method, "custom") &&
        (h.isEmpty(node.data?.flowData?.template_id) ||
          (h.notEmpty(node.data?.flowData?.template_id) &&
            node.data?.flowData?.status !== "APPROVED"))
      ) {
        const formattedWhatsappTemplate = formatWhatsappTemplateData(node);
        const {templateId, templateStatus} = await processWhatsappTemplates(
          formattedWhatsappTemplate,
          waba_config_id
        );
        node["data"]["flowData"]["template_id"] = templateId;
        node["data"]["flowData"]["status"] = templateStatus;
      }
    }

    /**
     * - Publish whatsapp flows
     */
    const bookingStatusArray = []
    const bookings = nodes.filter(
      (ele) =>
        ele.type === "booking" && ele?.data?.flowData?.status !== "published"
    );
    if (h.notEmpty(bookings)) {
      const creds = await whatsappFlowUtils.getWabaBufferedCredentials(
        waba_config_id
      );
      for (const booking of bookings) {
        const wabaFlowId = booking.data?.waba_flow_id;
        const whatsappFlowId = booking.data?.whatsapp_flow_id;
        if (h.notEmpty(whatsappFlowId) && h.notEmpty(wabaFlowId)) {
          const { isPublished } =  await publishWhatsappFlow(wabaFlowId, whatsappFlowId, creds)
          if (h.cmpBool(isPublished, true)) {
            bookingStatusArray.push({
              nodeId: booking.id,
              status: "published"
            })
          }
        }
      }
    }

    // update status of booking nodes
    for (const node of nodes) {
      if (
        bookingStatusArray.find(
          (ele) => ele.nodeId === node.id && ele.status === "published"
        )
      ) {
        node["data"]["flowData"]["status"] = "published";
      }
    }

    // Update workflow
    await c.automationRuleTemplate.update(automation_rule_template_id, {
      message_flow_data: JSON.stringify({
        nodes,
        edges,
      }),
    });

    return h.api.createResponse(
      req,
      res,
      200,
      {
        nodes,
        edges
      },
      "1-automation-workflow-approval-request-1722411549713",
      {
        portal,
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    req.log.error({
      error: error,
      url: "/staff/automation/workflow/request-approval"
    });
    if (error.status && error.status >= 400 && error.status < 500) {
      let errMsg = error?.data?.info?.error_user_msg || error?.data?.info?.message || error?.data?.info
      return res.status(400).send({
        message: errMsg || 'Please check input and try again'
      });
    }
    return h.api.createResponse(
      req,
      res,
      500,
      { error },
      "2-automation-workflow-approval-request-1722411549717",
      {
        portal,
      }
    );
  }
}

module.exports.schema = schema;
module.exports.preValidation = preValidation;
module.exports.handler = handler;
