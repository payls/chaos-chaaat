import React, { useEffect, useMemo, useState } from 'react';
import { h } from '../../../../helpers';
import styles from '../styles/select-crm.module.scss';
import mainStyle from '../styles/styles.module.scss';
import templateStyle from '../styles/template-form.module.scss';
import _ from 'lodash';

// UI
import Plus from '../../../FlowBuilder/Icons/Plus';
import Trash from '../../../FlowBuilder/Icons/Trash';

// COMPONENTS
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import CommonSelect from '../../../Common/CommonSelect';
import CommonReactTooltip from '../../../Common/CommonReactTooltip';

// STORE
import useSideBarStore from '../store';
import {
  getNodeIndex,
  getUpdatedNodeData,
  getAllButtonCapableNodes,
} from '../store/functions';
import { unescapeData } from '../../../../helpers/general';

const TOOLTIP_OPTIONS = {
  border: '1px solid #D70808',
  style: {
    background: '#fdf2f2',
    color: 'var(--off-black)',
    borderRadius: '8px',
    zIndex: 2,
  },
};

const URL_TYPE = [
  {
    value: 'static',
    label: 'Static',
  },
  {
    value: 'dynamic',
    label: 'Permalink',
  },
  {
    value: 'contact_email',
    label: 'Contact Email',
  },
];

const defaultQuickReplies = [{ text: '' }];
const defaultCTABtn = {
  value: '',
  type: {
    value: 'static',
    label: 'Static',
  },
  url: '',
  web_url: '',
  action: {
    value: 'visit_website',
    label: 'Visit Website',
  },
  phone: '',
  country: '',
};

export default React.memo((props) => {
  const { nodeDataIndex, id, templateViewMethod } = props;
  const { nodeData, setNodeData, nodeDataBackup } = useSideBarStore();
  const [selected, setSelected] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.selectedBtn ?? 'none',
  );
  const [quick_replies, setQuickReplyBtns] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.quick_replies ? nodeData[nodeDataIndex]?.data?.flowData?.quick_replies : defaultQuickReplies,
  );
  const [cta_btn, setCTABtn] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.cta_btn ? nodeData[nodeDataIndex]?.data?.flowData?.cta_btn : defaultCTABtn);
  const [open, setOpen] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.buttonOpen ?? false,
  );

  useEffect(() => {
    if (h.notEmpty(props.existingTemplateData)) {
      if (props.form.template_button === 'QUICK_REPLY') {
        // @payal here is the part where it got tricky
        // original variable -> props.form?.quick_replies
        setQuickReplyBtns(props.form?.quick_replies);
        const cta = {
          value: '',
          type: {
            value: 'static',
            label: 'Static',
          },
          url: '',
          web_url: '',
          action: {
            value: 'visit_website',
            label: 'Visit Website',
          },
          phone: '',
          country: '',
        };
        setCTABtn(cta);
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'cta_btn', cta));
        setNodeData(
          getUpdatedNodeData(
            nodeData,
            nodeDataIndex,
            'quick_replies',
            props.form?.quick_replies,
          ),
        );
      }
      if (props.form.template_button === 'CTA') {
        setCTABtn(props.form?.cta_btn[0]);
        setQuickReplyBtns(defaultQuickReplies);
        setNodeData(
          getUpdatedNodeData(
            nodeData,
            nodeDataIndex,
            'cta_btn',
            props.form?.cta_btn[0],
          ),
        );
        setNodeData(
          getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', [
            { text: '' },
          ]),
        );
      }
      if (['QUICK_REPLY', 'CTA'].includes(props.form.template_button)) {
        setOpen(true);
        setNodeData(
          getUpdatedNodeData(nodeData, nodeDataIndex, 'buttonOpen', true),
        );
      }
      setSelected(props.form.template_button);
      setNodeData(
        getUpdatedNodeData(
          nodeData,
          nodeDataIndex,
          'selectedBtn',
          props.form.template_button,
        ),
      );
    }
  }, [props.form]);

  useEffect(() => {
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'cta_btn', cta_btn));
  }, [cta_btn]);

  useEffect(() => {
    props.quickBtnCallback(quick_replies);
  }, [quick_replies]);

  useEffect(() => {
    props.ctaBtnCallback(cta_btn);
  }, [cta_btn]);

  /**
   * Handles the change of a button value in the quick reply buttons array.
   *
   * @param {any} value - The new value for the button.
   * @param {number} index - The index of the button in the quick reply buttons array.
   * @param {string} key - The key of the button property to be updated.
   */
  function onChangeBtnValue(value, index, key) {
    const qb = _.cloneDeep(quick_replies);
    qb[index][key] = value;
    setQuickReplyBtns(qb);

    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', qb),
    );
  }

  /**
   * Handles the addition of a button in the template.
   */
  function handleAddBtn() {
    const qb = _.cloneDeep(quick_replies);
    qb.push({ text: '' });
    setQuickReplyBtns(qb);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', qb),
    );
  }

  /**
   * Handles the deletion of a button from the quick reply buttons array.
   *
   * @param {number} index - The index of the button to be deleted.
   */
  function handleDeleteBtn(index) {
    const qb = _.cloneDeep(quick_replies);
    qb.splice(index, 1);
    setQuickReplyBtns(qb);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', qb),
    );
  }

  /**
   * Handles the selection of a button.
   *
   * @param {any} v - The selected value.
   * @returns {void}
   */
  function handleOpenSelection(v) {
    setSelected(v);
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'selectedBtn', v));
    
    const backupNode = nodeDataBackup[nodeDataIndex];
    const backupFlowData = backupNode?.data?.flowData;
    if (backupFlowData?.selectedBtn !== v) {
      // clear
      setQuickReplyBtns(defaultQuickReplies);
      setCTABtn(defaultCTABtn);
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', defaultQuickReplies));
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'cta_btn', defaultCTABtn));

      return null;
    }
    switch (v.toUpperCase()) {
      case 'NONE':
        setCTABtn(defaultCTABtn);
        setQuickReplyBtns(defaultQuickReplies);
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', defaultQuickReplies));
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'cta_btn', defaultCTABtn));
        break;
      case 'CTA':
        setCTABtn(backupFlowData.cta_btn);
        break;
      case 'QUICK_REPLY':
        setQuickReplyBtns(backupFlowData.quick_replies);
        break;
    }
  }

  /**
   * Options for the node.
   *
   * @type {Array}
   */
  const nodeOptions = useMemo(() => {
    return getAllButtonCapableNodes(nodeData, id);
  }, [nodeData, id]);

  return (
    <div className={mainStyle.sidebarWrapperBodySection}>
      <label>Button</label>

      <div className={templateStyle.selectButtonWrapper}>
        <div
          className={templateStyle.selectButtonWrapperValue}
          onClick={() => {
            if (!props.disabled) {
              setOpen(!open);
              setNodeData(
                getUpdatedNodeData(
                  nodeData,
                  nodeDataIndex,
                  'buttonOpen',
                  !open,
                ),
              );
            }
          }}
        >
          <span>Add button</span>

          <span className={`${open ? styles.svgInvert : ''} `}>
            <ChevronDownSelect />
          </span>
        </div>

        {open && (
          <div className={templateStyle.selectButtonWrapperSelection}>
            <div
              className={`${templateStyle.selectButtonWrapperSelectionContent} mb-3`}
            >
              <div
                className={
                  templateStyle.selectButtonWrapperSelectionContentItems
                }
              >
                <button
                  type="button"
                  className={`${
                    templateStyle.selectButtonWrapperSelectionContentItemsListBtn
                  } ${
                    selected === 'none'
                      ? templateStyle.selectButtonWrapperSelectionContentItemsListBtnActive
                      : ''
                  }`}
                  onClick={() => handleOpenSelection('none')}
                  disabled={props.disabled}
                >
                  None
                </button>
                <button
                  type="button"
                  className={`${
                    templateStyle.selectButtonWrapperSelectionContentItemsListBtn
                  } ${
                    selected === 'CTA'
                      ? templateStyle.selectButtonWrapperSelectionContentItemsListBtnActive
                      : ''
                  }`}
                  onClick={() => handleOpenSelection('CTA')}
                  disabled={props.disabled}
                >
                  Call to Action{' '}
                </button>
                <button
                  type="button"
                  className={`${
                    templateStyle.selectButtonWrapperSelectionContentItemsListBtn
                  } ${
                    selected === 'QUICK_REPLY'
                      ? templateStyle.selectButtonWrapperSelectionContentItemsListBtnActive
                      : ''
                  }`}
                  onClick={() => handleOpenSelection('QUICK_REPLY')}
                  disabled={props.disabled}
                >
                  Quick reply
                </button>
              </div>
            </div>
            {selected === 'CTA' && (
              <div
                className={`${templateStyle.selectButtonWrapperBody} ${mainStyle.flowForm}`}
              >
                <label>Type of action</label>
                <input
                  type="text"
                  className={`${mainStyle.templateBodyInput} mb-3`}
                  value={'Visit Website'}
                  disabled={true}
                />
                <label>Button text</label>
                <input
                  type="text"
                  className={`${mainStyle.templateBodyInput} mb-3`}
                  value={unescapeData(cta_btn.value)}
                  onChange={(v) =>
                    setCTABtn((prev) => ({ ...prev, value: v.target.value }))
                  }
                />
                <label>URL type</label>
                <CommonSelect
                  id={`category`}
                  options={URL_TYPE}
                  value={cta_btn.type}
                  isSearchable={false}
                  placeholder="Select"
                  className=" select-template mb-3"
                  onChange={(v) => setCTABtn((prev) => ({ ...prev, type: v }))}
                  iconComponent={<ChevronDownSelect />}
                />
                <label>Website URL</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className={`${mainStyle.templateBodyInput} ${
                      !h.general.validateURL(cta_btn.web_url)
                        ? mainStyle.errorField
                        : ''
                    }`}
                    value={unescapeData(cta_btn.web_url)}
                    onChange={(v) =>
                      setCTABtn((prev) => ({
                        ...prev,
                        web_url: v.target.value,
                      }))
                    }
                  />
                  {['dynamic', 'contact_email'].includes(
                    cta_btn.type?.value,
                  ) && (
                    <small
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '10px',
                        color: 'var(--sidebar-helper-text)',
                        fontSize: '14px',
                      }}
                    >{`{{1}}`}</small>
                  )}
                </div>
              </div>
            )}

            {selected === 'QUICK_REPLY' && (
              <div
                className={`${templateStyle.selectButtonWrapperBody} ${mainStyle.flowForm}`}
              >
                {quick_replies.map((btn, i) => {
                  return (<div className="  mb-3">
                    <label>
                      Button text
                      <small>
                        {btn.text.length}/20{' '}
                        {
                          !props.disabled && <CommonReactTooltip
                            tooltipText="Delete button"
                            options={TOOLTIP_OPTIONS}
                          >
                            <span
                              onClick={() => handleDeleteBtn(i)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Trash width="20px" />
                            </span>
                          </CommonReactTooltip>
                        }
                      </small>
                    </label>
                    <div
                      className={`${mainStyle.templateBodyInputWrapper} mb-3`}
                    >
                      <input
                        type="text"
                        className={`${mainStyle.templateBodyInput}`}
                        value={unescapeData(btn.text)}
                        maxLength={20}
                        onChange={(e) =>
                          onChangeBtnValue(e.target.value, i, 'text')
                        }
                        disabled={props.disabled}
                      />
                    </div>

                    <CommonSelect
                      id={`select_node`}
                      options={nodeOptions}
                      value={btn.node}
                      isSearchable={true}
                      placeholder="Select node"
                      className=" select-template mb-3"
                      onChange={(e) => onChangeBtnValue(e, i, 'node')}
                      iconComponent={<ChevronDownSelect />}
                      disabled={false}
                    />
                  </div>);
                })}
                {!props.disabled && (
                  <div className="center-body mt-3">
                    <button
                      type="button"
                      className={`${mainStyle.gradientButton}`}
                      onClick={handleAddBtn}
                      disabled={quick_replies.length === 10}
                    >
                      <Plus /> <span>Add Reply Button</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
