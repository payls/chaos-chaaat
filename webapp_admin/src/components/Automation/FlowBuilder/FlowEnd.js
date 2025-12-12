import { Handle, Position } from 'reactflow';

function FlowEnd({ data, isConnectable }) {
  return (
    <div className="text-updater-node flow-end">
      {/* <div className="text-updater-node flow-end nodrag"> */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <h3 className="heading">Flow End</h3>
    </div>
  );
}

export default FlowEnd;
