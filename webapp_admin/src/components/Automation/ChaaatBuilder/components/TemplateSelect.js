import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { h } from '../../../../helpers';
import styles from '../styles/select-crm.module.scss';
import mainStyle from '../styles/styles.module.scss';
import constant from '../../../../constants/constant.json';
import { cloneDeep } from 'lodash';

// UI
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';

// COMPONENTS
import CommonSelect from '../../../Common/CommonSelect';
import CreateTemplate from './CreateTemplate';

// STORE
import useSideBarStore from '../store';

export default React.memo((props) => {
  const { template_name, business_account, nodeDataIndex, id, resetTemplateRef } = props;
  const createTemplateProps = {
    template_name,
    business_account,
    nodeDataIndex,
    id,
  };

  const { nodeData, setNodeData } = useSideBarStore();

  const [selected, setSelected] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.selected_template ?? null,
  );

  const [templateForm, setTemplateForm] = useState(
    nodeData[nodeDataIndex]?.data?.flowData,
  );

  const [templateHeaderImage, setTemplateHeaderImage] = useState(null);
  const [templateButtons, setTemplateButtons] = useState(null);

  useEffect(() => {
    setTemplateForm(
      nodeData[nodeDataIndex]?.data?.flowData
    )
  }, [nodeData]);

  const getFormattedBody = (template_body, body_variables) => {
    let formatted = template_body;
    const fValues = {...body_variables};
    if (
      typeof fValues === 'object' &&
      fValues !== null &&
      Object.keys(fValues).length !== 0
    ) {
      for (const i of Object.keys(fValues)) {
        formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
      }
    }
    return formatted
  };

  /**
   * The `sendSelected` function is a callback function that is called when a template is selected from the dropdown list. It
   * takes a `value` parameter, which represents the selected template value. Inside the function, it calls the `onSelect`
   * function from the props with the selected `value` as an argument. It then updates the `selected` state with the selected
   * `value`, indicating the currently selected template.
   *
   * @function
   * @name sendSelected
   * @kind function
   * @memberof default.React.memo() callback
   * @param {any} value
   * @returns {void}
   */
  function sendSelected(value) {
    const t = {};

    const content = JSON.parse(value.value.content);

    t.template_id = content.id
    // Set category
    t.template_category = {
      label: h.general.sentenceCase(value.value.category),
      value: value.value.category,
    };

    // Set Language
    const lang = constant.WHATSAPP.SUPPORTED_LANGUAGE.find(
      (f) => value.value.language === Object.keys(f)[0],
    );
    t.template_language = {
      label: lang[value.value.language],
      value: lang,
    };

    const body = content.components.find((f) => f.type === 'BODY');
    const message_body = body?.text;
    t.template_body = message_body

    const bodyExample = body?.example;
    if (h.notEmpty(bodyExample)) {
      if (bodyExample) {
        const examples = bodyExample.body_text[0];
        const exampleObj = examples.reduce((obj, value, index) => {
          obj[`{{${index + 1}}}`] = value;
          return obj;
        }, {});

        t.body_variables = exampleObj;
        const variable_types = value.value.variable_identifier;
        if (!h.isEmpty(variable_types)) {
          t.body_variables_type = variable_types.split(',');
        } else {
          const default_types = ['contact', 'agent'];
          t.body_variables_type = [];

          for (let i = 0; i < examples.length; i++) {
            t.body_variables_type.push(default_types[i % 2]);
          }
        }
      }
    }
    t.formattedBody = getFormattedBody(message_body, t.body_variables)

    // Get header image content
    t.header_image = value.value.header_image;

    // handling BUTTONS components
    const componentButtonIndex = content.components.findIndex(
      (obj) => obj.type === 'BUTTONS',
    );
    if (componentButtonIndex !== -1) {
      const cta = [];
      const quick_replies = [];
      const buttons = content.components[componentButtonIndex].buttons;

      for (const button of buttons) {
        if (h.cmpStr(button.type, 'URL')) {
          const given_url = button.url;
          const sample_url = button.example ? button.example[0] : null;
          const regex = /{{\d+}}/;
          let type = regex.test(given_url) ? 'dynamic' : 'static';
          if (h.notEmpty(sample_url)) {
            type = sample_url.includes('@') ? 'contact_email' : type;
          }
          const modifiedUrl = given_url.replace(/\/{{\d+}}/, '');
          type = type.replace(/_/g, ' ');
          const btnObj = {
            value: button.text,
            type: {
              value: type,
              label: h.general.ucwords(type),
            },
            url: '',
            web_url: modifiedUrl,
            action: {
              value: 'visit_website',
              label: 'Visit Website',
            },
            phone: '',
            country: '',
          };
          cta.push(btnObj);
          t.template_button = 'CTA';
        }
        if (h.cmpStr(button.type, 'QUICK_REPLY')) {
          quick_replies.push({ text: button.text });
          t.template_button = 'QUICK_REPLY';
        }
      }
      t.cta_btn = cta;
      t.quick_replies = quick_replies;
      t.method = "template"
      t.customSelected = null
    }

    props.onSelect(value);
    setSelected(value);
    setTemplateForm(t);

    const clone = cloneDeep(nodeData);
    clone[nodeDataIndex].data.flowData = {
      ...clone[nodeDataIndex].data.flowData,
      ...t,
      selected_template: value,
    };
    setNodeData(clone);
  }

  /**
   * Get Image url from contents
   *
   * @function
   * @name getHeaderImage
   * @kind function
   * @memberof default.React.memo() callback
   * @param {{ components: any }} { components }
   * @returns {any}
   */
  function getHeaderImage({ components }) {
    const image = components.find(
      (f) => f.format === 'IMAGE' && f.type === 'HEADER',
    );

    if (h.notEmpty(image)) {
      return image.example.header_handle[0] || null;
    }
    return null;
  }

  /**
   * Return quick reply buttons
   *
   * @function
   * @name getTemplateButtons
   * @kind function
   * @memberof default.React.memo() callback
   * @param {{ components: any }} { components }
   * @returns {any}
   */
  function getTemplateButtons({ components }) {
    const btns = components.find((f) => f.type === 'BUTTONS');
    if (h.notEmpty(btns)) {
      return btns.buttons || [];
    }
    return [];
  }

  return (
    <div className={styles.selectCRMWrapperSelection}>
      <div className={mainStyle.flowForm}>
        <label>Select template</label>
        <CommonSelect
          id={`type`}
          options={props.options}
          value={selected}
          isSearchable={true}
          placeholder="Select template"
          className=" select-template mb-3"
          disabled={false}
          onChange={sendSelected}
          iconComponent={<ChevronDownSelect />}
        />
        {h.notEmpty(selected) && (
          <CreateTemplate
            {...createTemplateProps}
            existingTemplateData={selected}
            showCustomOption={false}
            templateViewMethod="template"
            resetTemplateRef={resetTemplateRef}
          />
        )}
      </div>
    </div>
  );
});
