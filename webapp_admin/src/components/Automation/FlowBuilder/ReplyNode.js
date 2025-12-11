import { useCallback, useState } from 'react';
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

function ReplyNode({
  data,
  isConnectable,
  onSelectChange,
  onSelectConditionalResponse,
  onSelectTemplate,
  onPushSFData,
  onAddValue,
  onAddReply,
  onAddNode,
  onSelectEnd,
  id,
  templates,
  formMode,
  messageChannel,
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

  function hasChild() {
    return h.notEmpty(edges.filter((f) => f.source === id));
  }

  return (
    // <div className="text-updater-node reply nodrag">
    <div className="text-updater-node reply">
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
          <span>Reply</span> <span>#{data.actionNumber}</span>
        </h3>

        <div
          className="d-flex align-items-center mt-3"
          style={{ width: '300px' }}
        >
          <Toggle
            icons={false}
            defaultChecked={data.conditional}
            className="whatsapp-toggle mr-2 nodrag"
            onChange={(e) => {
              onSelectConditionalResponse(nodes, edges, data.nodeId, e);
            }}
          />
          Conditional Response
        </div>

        {!data.conditional && (
          <div className="d-flex align-items-center mt-1">
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
        )}

        {!data.conditional && (
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
        )}

        {!data.conditional && (
          <>
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
                <label style={{ display: 'block' }}>
                  Automated Reply Message
                </label>
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
          </>
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
          {data.value && data.is_end && !['view'].includes(formMode) && (
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

          {data.conditional && !['view'].includes(formMode) && (
            <span
              href={''}
              className="nodrag"
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: '#009aff',
              }}
              onClick={() => {
                onAddNode(nodes, edges, id);
              }}
            >
              Add Node
            </span>
          )}
          {formMode !== 'view' && !data.enabled && !data.conditional && (
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

export default ReplyNode;
