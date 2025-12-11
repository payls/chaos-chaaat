import React from 'react';
import CommonSelect from '../../Common/CommonSelect';
import useFlowBuilderStore from '../store';

export default React.memo(({ onSelectEnd = () => {}, data }) => {
  const { nodes, edges } = useFlowBuilderStore();
  return (
    <div>
      <hr />
      <CommonSelect
        id={`type`}
        options={[
          {
            label: 'Flow end',
            value: 'flow-end',
          },
          ...nodes
            .filter((f) => f.data.canJump)
            .map((m) => ({
              label: 'Jump to #' + m.data.actionNumber,
              value: m,
            })),
        ]}
        onChange={(v) => {
          onSelectEnd(nodes, edges, data.nodeId, v);
        }}
        value={
          data?.actionValue ?? {
            label: 'Flow end',
            value: 'flow-end',
          }
        }
        isSearchable={true}
        placeholder="Select end scenario"
        className=" nodrag end-select"
        disabled={false}
      />
    </div>
  );
});
