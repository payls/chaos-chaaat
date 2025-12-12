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
  const [text, setText] = useState(data.value?.string ?? '');

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
    <div className="text-updater-node conditional" style={{ height: '208px' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div
        className="d-flex flex-column justify-content-between flex-wrap"
        style={{ height: '100%' }}
      >
        <div>
          <h3 className="heading">Conditional Response</h3>

          <div className="mt-1">
            <select
              className="select-condition nodrag"
              value={data.value?.condition}
            >
              <option value="else" selected>
                Else
              </option>
            </select>
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
          </div>
        </div>
        {data.is_end && <NonNodeFlowEnd />}
      </div>

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
