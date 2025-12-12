import { useCallback, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { h } from '../../../helpers';
import CommonSelect from '../../Common/CommonSelect';
import Toggle from 'react-toggle';
import { routes } from '../../../configs/routes';
import { save } from '../../../api/emailNotification';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useFlowBuilderStore from '../store';
import NonNodeFlowEnd from './NonNodeFlowEnd';
import EndOrJump from './EndOrJump';

function QuickButton({
  data,
  isConnectable,
  onSelectChange,
  onSelectTemplate,
  onPushSFData,
  onAddValue,
  onSelectEnd,
  id,
  templates,
  formMode,
  messageChannel,
  onAddReply,
  sfdcFields,
}) {
  const { nodes, edges } = useFlowBuilderStore();
  const [editMode, setEditMode] = useState(false);

  const [text, setText] = useState(
    typeof data.value !== 'object' ? h.general.unescapeData(data.value) ?? '' : '',
  );

  function saveResponse() {
    onAddValue(nodes, edges, data.nodeId, text);
    setEditMode(false);
  }

  function hasQuickReplies() {
    if (typeof data.value !== 'object') {
      return h.notEmpty(data.value);
    }
    const content = h.general.unescapeData(data.value.value.content);

    const templateContent = JSON.parse(content);
    let buttons = [];

    switch (messageChannel) {
      case 'whatsapp':
        const quickReplyButtons = templateContent.components.find(
          (f) => f.type === 'BUTTONS',
        );
        buttons = quickReplyButtons?.buttons.filter(
          (f) => f.type === 'QUICK_REPLY',
        );
        break;
      case 'line':
        if (
          templateContent?.type === 'template' &&
          templateContent?.template?.type === 'confirm'
        ) {
          buttons = templateContent?.template?.actions ?? [];
        } else if (
          templateContent?.type === 'template' &&
          templateContent?.template?.type === 'buttons'
        ) {
          buttons = [];
        } else {
          const textObj = templateContent.find((f) => f.type === 'text');
          console.log('buttons', textObj);
          buttons = textObj?.quickReply?.items ?? [];
        }

        break;
    }

    return h.isEmpty(buttons);
  }

  return (
    <div className="text-updater-node quick-reply ">
      {h.notEmpty(edges) &&
        edges
          .filter(
            (f) => f.target === id && !f.id.includes('edges-loop-anchor-'),
          )
          .map((e, i) => (
            <Handle
              key={`target-key-${e.id}-${i}`}
              type="target"
              position={Position.Top}
              id={e.sourceHandle}
              isConnectable={isConnectable}
            />
          ))}

      {h.notEmpty(edges) &&
        edges
          .filter((f) => f.target === id && f.id.includes('edges-loop-anchor-'))
          .map((e, i) => (
            <Handle
              key={`target-key-${e.id}-${i}`}
              type="target"
              position={e?.position}
              id={e.targetHandle}
              isConnectable={isConnectable}
            />
          ))}

      <div
        className="d-flex flex-column justify-content-between flex-wrap"
        style={{ height: '100%' }}
      >
        <div>
          <h3 className="heading">
            <div>
              Quick Reply
              <br />
              <b>{data.button?.text ?? data?.button?.action?.label}</b>
            </div>
            <span>#{data.actionNumber}</span>
          </h3>

          <div className="d-flex align-items-center mt-3">
            <Toggle
              icons={false}
              defaultChecked={data.enabled}
              className="whatsapp-toggle mr-2 nodrag"
              onChange={(e) => {
                onSelectChange(nodes, edges, data.nodeId, e);
              }}
            />
            Enable Follow-Up Message
          </div>
          <div className="d-flex mt-3 mb-2 flex-column">
            <label style={{ display: 'block' }}>Push to Salesforce</label>
            <CommonSelect
              id={`type`}
              options={sfdcFields}
              value={h.general.unescapeData(data.to_salesforce)}
              isSearchable={true}
              placeholder="Select field"
              className=" nodrag select-template"
              disabled={false}
              onChange={(e) => {
                onPushSFData(nodes, edges, data.nodeId, e);
              }}
            />
          </div>

          <label style={{ display: 'block' }}>Automated Reply Message</label>
          {data.enabled ? (
            <CommonSelect
              id={`type`}
              options={templates.map((m) => ({
                value: m,
                label: h.general.sentenceCase(m.template_name),
              }))}
              onChange={(v) => {
                onSelectTemplate(nodes, edges, data.nodeId, v);
              }}
              value={h.general.unescapeData(data.value)}
              isSearchable={true}
              placeholder="Select Template"
              className="w-130 nodrag select-template"
              disabled={false}
            />
          ) : (
            <div>
              <textarea
                style={{ width: '300px' }}
                value={text}
                placeholder="Enter CTA response"
                className="nodrag"
                disabled={!editMode}
                onChange={(v) => {
                  setText(h.general.unescapeData(v.target.value));
                }}
              />
            </div>
          )}
          <div className="d-flex justify-content-center m-1 actions">
            {data.enabled &&
              formMode !== 'view' &&
              typeof data.value === 'object' &&
              data.value && (
                <a
                  href={h.getRoute(routes.templates.whatsapp.view, {
                    waba_template_id: data.value.value.waba_template_id,
                  })}
                  target="_blank"
                  className="nodrag"
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: '#009aff',
                  }}
                >
                  View Template
                </a>
              )}
            {data.is_end &&
              data.value &&
              hasQuickReplies() &&
              formMode !== 'view' && (
                <span
                  href={''}
                  className="nodrag"
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: '#009aff',
                  }}
                  onClick={() => {
                    onAddReply(nodes, edges, data.nodeId);
                  }}
                >
                  Add Reply
                </span>
              )}
            {formMode !== 'view' && !data.enabled && (
              <>
                {!editMode ? (
                  <span
                    onClick={() => setEditMode(true)}
                    className="mr-2"
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: '#009aff',
                    }}
                  >
                    Edit
                  </span>
                ) : (
                  <span
                    onClick={saveResponse}
                    className=""
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: '#009aff',
                    }}
                  >
                    Save
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        {data.is_end && <EndOrJump onSelectEnd={onSelectEnd} data={data} />}
      </div>
      {h.notEmpty(edges) &&
        edges
          .filter((f) => f.source === id)
          .map((e, i) => (
            <Handle
              key={`source-key-${e.id}-${i}`}
              type="source"
              position={Position.Bottom}
              id={e.sourceHandle}
              isConnectable={isConnectable}
            />
          ))}
    </div>
  );
}

export default QuickButton;
