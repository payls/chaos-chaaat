import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { h } from '../../../helpers';
import CommonSelect from '../../Common/CommonSelect';
import { routes } from '../../../configs/routes';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NonNodeFlowEnd from './NonNodeFlowEnd';
import EndOrJump from './EndOrJump';

import Toggle from 'react-toggle';
import useFlowBuilderStore from '../store';

function TemplateSelect({
  data,
  isConnectable,
  onSelectTemplate,
  onPushSFData,
  onAddReply,
  onSelectEnd,
  id,
  templates,
  formMode,
  messageChannel,
  sfdcFields,
}) {
  const { nodes, edges } = useFlowBuilderStore();

  function hasQuickReplies() {
    const content = data.value.value.content;

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
          buttons = textObj?.quickReply?.items ?? [];
        }

        break;
    }

    return h.isEmpty(buttons);
  }

  return (
    // <div className="text-updater-node nodrag">
    <div className="text-updater-node">
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
      <div>
        <h3 className="heading">
          <span>Message</span> <span>#{data.actionNumber}</span>
        </h3>
        <div className="d-flex mt-3 mb-2 flex-column">
          <label style={{ display: 'block' }}>Push to Salesforce</label>
          <CommonSelect
            id={`type`}
            options={sfdcFields}
            value={data.to_salesforce}
            isSearchable={true}
            placeholder="Select field"
            className=" nodrag select-template"
            disabled={false}
            onChange={(e) => {
              onPushSFData(nodes, edges, data.nodeId, e);
            }}
          />
        </div>
        <label style={{ display: 'block' }}>Select Template</label>
        <CommonSelect
          id={`type`}
          options={templates.map((m) => ({
            value: m,
            label: h.general.sentenceCase(m.template_name),
          }))}
          onChange={(v) => {
            onSelectTemplate(nodes, edges, data.nodeId, v);
          }}
          value={data.value}
          isSearchable={true}
          placeholder="Select template"
          className=" nodrag select-template"
          disabled={false}
        />
        <div className="d-flex justify-content-center m-1 actions">
          {data.value && formMode !== 'view' && (
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
                display: 'block',
              }}
            >
              View Template
            </a>
          )}
          {data.value && hasQuickReplies() && formMode !== 'view' && (
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
        </div>
      </div>
      {data.is_end && <EndOrJump onSelectEnd={onSelectEnd} data={data} />}
      {h.notEmpty(edges) &&
        edges
          .filter((f) => f.source === id)
          .map((e, i) => (
            <Handle
              key={i}
              type="source"
              position={Position.Bottom}
              id={e.sourceHandle}
              isConnectable={isConnectable}
            />
          ))}
    </div>
  );
}

export default TemplateSelect;
