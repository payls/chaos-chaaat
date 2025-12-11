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

function ConditionalResponse({
  data,
  isConnectable,
  onConditionChange,
  onAddValue,
  onAddReply,
  id,
  formMode,
}) {
  const { nodes, edges } = useFlowBuilderStore();
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState(h.general.unescapeData(data.value?.string) ?? '');

  function saveResponse() {
    onAddValue(nodes, edges, data.nodeId, text, true);
    setEditMode(false);
  }

  function hasChild() {
    return h.notEmpty(edges.filter((f) => f.source === id));
  }

  function isChildOfAConditionalNode() {
    const parentEdge = edges.filter((f) => f.target === id)[0];

    const parent = nodes.find((f) => f.id === parentEdge.source);
    return parent?.data?.conditional;
  }

  return (
    // <div className="text-updater-node reply nodrag">
    <div className="text-updater-node conditional">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div>
        <h3 className="heading">Conditional Response</h3>

        <div className="mt-1">
          <select
            className="select-condition nodrag"
            value={data.value?.condition}
            onChange={(e) => {
              if (h.notEmpty(e.target.value)) {
                onConditionChange(nodes, edges, data.nodeId, e.target.value);
              }
            }}
          >
            <option value="">Select Condition</option>
            <option value="contains">If Reply Contains</option>
            <option value="equals">If Reply Equals</option>
          </select>
          <input
            type="text"
            className="nodrag text-i"
            placeholder="Enter text"
            value={text}
            disabled={!editMode}
            onChange={(v) => {
              setText(v.target.value);
            }}
          />
        </div>

        <div className="d-flex justify-content-center m-1 actions">
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
          {formMode !== 'view' &&
            !data.enabled &&
            isChildOfAConditionalNode() && (
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
      {data.is_end && <NonNodeFlowEnd />}
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

export default ConditionalResponse;
