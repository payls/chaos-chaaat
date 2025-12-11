import React, { useCallback, useMemo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'react-flow-renderer';
import { BaseNode, EmptyBaseNode, ConditionalLabelNode } from './base';

import styles from '../builder.module.scss';
import useSideBarStore from '../store';
import { h } from '../../../../helpers';

/**
 * Handles the click event for a node.
 *
 * @param {Object} props - The props object containing data and id.
 * @param {Object} props.data - The data object.
 * @param {string} props.id - The id of the node.
 */
const handleNodeClick = (props) => {
  const { data, id } = props;
  data.onNodeClickCallback(id);
};

/**
 * Handles the click event when the close icon is clicked.
 *
 * @param {Event} event - The click event.
 * @param {Object} props - The properties object.
 * @param {Object} props.data - The data object.
 * @param {string} props.id - The ID of the node.
 */
const onCloseIconClick = (event, props) => {
  event.stopPropagation();
  const { data, id } = props;
  data.onDeleteNodeCallback(id);
};

/**
 * Renders the Source node component.
 *
 * @param {Object} props - The props for the Source node component.
 * @returns {JSX.Element} The rendered Source node component.
 */
export const Source = (props) => (
  <div className={styles.NodeWrapper}>
    <BaseNode
      {...props}
      additionalClassName={styles.StartNode}
      onNodeClick={() => handleNodeClick(props)}
      onCloseIconClick={(event) => onCloseIconClick(event, props)}
    />
    <Handle type="source" position={Position.Bottom} className="NodePort" />
  </div>
);

/**
 * Represents an Action component.
 *
 * @param {Object} props - The props for the Action component.
 * @returns {JSX.Element} The rendered Action component.
 */
export const Action = (props) => {
  const { nodeData } = useSideBarStore();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(props.id);
  }, [nodeData, props.id]);

  /**
   * Retrieves all target left and right handles for a given node ID.
   *
   * @returns {Array} An array of target left and right handles.
   */
  const getAllTargetLeftRightHandles = useMemo(() => {
    return nodeData
      .filter((f) => f.hasOwnProperty('targetHandle'))
      .filter((f) => f.target === props.id);
  }, [nodeData, props.id]);

  return (
    <div className={styles.NodeWrapper}>
      <Handle type="target" position={Position.Top} className="NodePort" />
      {h.notEmpty(getAllTargetLeftRightHandles) &&
        getAllTargetLeftRightHandles.map((handle, i) => {
          return (
            <Handle
              key={i}
              type="target"
              position={handle.targetPos}
              className="NodePort"
              id={handle.targetHandle}
            />
          );
        })}

      <BaseNode
        {...props}
        additionalClassName={styles.ActionNode}
        onNodeClick={() => handleNodeClick(props)}
        onCloseIconClick={(event) => onCloseIconClick(event, props)}
      />
      <Handle type="source" position={Position.Bottom} className="NodePort" />
    </div>
  );
};

/**
 * Represents a Condition node in the ChaaatBuilder component.
 * @param {Object} props - The props for the Condition node.
 * @returns {JSX.Element} The rendered Condition node component.
 */
export const Condition = (props) => (
  <div className={styles.NodeWrapper}>
    <Handle type="target" position={Position.Top} className="NodePort" />
    <BaseNode
      {...props}
      additionalClassName="ConditionNode"
      onNodeClick={() => handleNodeClick(props)}
      onCloseIconClick={(event) => onCloseIconClick(event, props)}
    />
    <Handle
      id="condition_0"
      type="source"
      position={Position.Bottom}
      className="NodePort"
    />
    <Handle
      id="condition_1"
      type="source"
      position={Position.Bottom}
      className="NodePort"
    />
  </div>
);

/**
 * Represents the End node component.
 * @param {Object} props - The props for the End node component.
 * @returns {JSX.Element} The rendered End node component.
 */
export const End = (props) => {
  const { nodeData } = useSideBarStore();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(props.id);
  }, [nodeData, props.id]);

  const getAllTargetLeftRightHandles = useMemo(() => {
    return nodeData
      .filter((f) => f.hasOwnProperty('sourceHandle'))
      .filter((f) => f.source === props.id);
  }, [nodeData, props.id]);

  return (
    <div className={styles.NodeWrapper}>
      <Handle type="target" position={Position.Top} className="NodePort" />

      <BaseNode {...props} additionalClassName="EndNode" disabled={true} />

      {getAllTargetLeftRightHandles.map((handle, i) => (
        <Handle
          key={i}
          type="source"
          position={handle.sourcePos}
          className="NodePort"
        />
      ))}
    </div>
  );
};

/**
 * Represents an Empty node in the ChaaatBuilder.
 * @param {Object} props - The props for the Empty node.
 * @returns {JSX.Element} The rendered Empty node.
 */
export const Empty = (props) => (
  <div className={styles.NodeWrapper}>
    <Handle
      type="target"
      position={Position.Top}
      className="NodePort"
      // style={{ opacity: 0 }}
    />
    <EmptyBaseNode {...props} disabled={true} />
    <Handle
      type="source"
      position={Position.Bottom}
      className="NodePort"
      style={{ opacity: 0 }}
    />
  </div>
);

/**
 * Renders the ConditionLabel component.
 *
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The rendered ConditionLabel component.
 */
export const ConditionLabel = (props) => {
  return (
    <div className={`${styles.NodeWrapper}`}>
      <Handle type="target" position={Position.Top} className="NodePort" />
      <ConditionalLabelNode
        {...props}
        disabled={true}
        onCloseIconClick={(event) => onCloseIconClick(event, props)}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="NodePort"
        style={{ opacity: 0 }}
      />
    </div>
  );
};
