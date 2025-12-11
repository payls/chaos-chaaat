import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { h } from '../../../helpers';
import CommonSelect from '../../Common/CommonSelect';
import { routes } from '../../../configs/routes';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useFlowBuilderStore from '../store';

function RuleTrigger({
  data,
  isConnectable,
  onSelectTrigger,
  id,
  templates,
  formMode,
  triggers,
}) {
  const { nodes, edges } = useFlowBuilderStore();

  return (
    <div className="text-updater-node trigger">
      {/* <div className="text-updater-node trigger nodrag"> */}
      <div>
        <h3 className="heading">Trigger</h3>
        <CommonSelect
          id={`type`}
          options={triggers}
          onChange={(v) => {
            onSelectTrigger(nodes, edges, data.nodeId, v);
          }}
          value={data.value}
          isSearchable={true}
          placeholder="Select trigger"
          className=" nodrag select-template"
          disabled={false}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id={'initialFlowSource'}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default RuleTrigger;
