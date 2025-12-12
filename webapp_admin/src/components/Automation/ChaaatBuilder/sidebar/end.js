import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import SideBarTitleInput from '../components/SideBarTitleInput';

// ICONS
import Minus from '../../../FlowBuilder/Icons/Minus';
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import CommonSelect from '../../../Common/CommonSelect';

// STORE
import useSideBarStore from '../store';
import {
  getAllNodeCapableForLoop,
  getNodeIndex,
  getUpdatedNodeData,
} from '../store/functions';
import { h } from '../../../../helpers';

/**
 * Represents the End component.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - The function to close the component.
 * @param {Object} props.node - The node object.
 * @param {Function} props.onAddNodeToJump - The function to add a node to jump.
 * @param {Function} props.onRemoveNodeToJump - The function to remove a node to jump.
 * @returns {JSX.Element} The rendered End component.
 */
const End = ({ onClose, node, onAddNodeToJump, onRemoveNodeToJump }) => {
  const { id } = node;
  const { nodeData, setNodeData } = useSideBarStore();

  const nodeDataIndex = getNodeIndex(nodeData, id);
  const [selectedNode, setSelectedNode] = useState(getUpdatedValue() ?? null);

  useEffect(() => {
    if (h.notEmpty(selectedNode)) {
      const updatedNodes = getUpdatedNodeData(
        nodeData,
        nodeDataIndex,
        'toJump',
        selectedNode,
      );

      setNodeData(updatedNodes);
    }
  }, [selectedNode]);

  /**
   * Represents the nodes obtained from the `getAllNodeCapableForLoop` function.
   * @type {Array}
   */
  const nodes = useMemo(() => {
    return getAllNodeCapableForLoop(nodeData);
  }, [nodeData]);

  /**
   * Handles the addition of a node.
   *
   * @param {Object} v - The node to be added.
   */
  function handleAddNode(v) {
    if (v?.value !== selectedNode?.value) {
      onRemoveNodeToJump({ id, target: selectedNode?.value });
    }
    setSelectedNode(v);
    onAddNodeToJump({ id, target: v?.value });
  }

  /**
   * Handles the removal of a loop edge.
   */
  function handleRemoveLoopEdge() {
    setSelectedNode(null);
    onRemoveNodeToJump({ id, target: selectedNode?.value });
  }

  /**
   * Retrieves the updated value based on the node data.
   * @returns {Object|null} The updated value object with label and value properties, or null if no updated value is found.
   */
  function getUpdatedValue() {
    if (h.notEmpty(nodeData[nodeDataIndex]?.data?.flowData?.toJump)) {
      const node = nodeData?.find(
        (f) => f.id === nodeData[nodeDataIndex]?.data?.flowData?.toJump?.value,
      );
      if (node) {
        return {
          label: node?.data?.flowData?.title,
          value: node?.id,
        };
      }
    }

    return null;
  }

  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarWrapper}>
        <div className={styles.sidebarWrapperContent}>
          <div className={styles.sidebarWrapperHeader}>
            <SideBarTitleInput
              styles={styles}
              nodeDataIndex={nodeDataIndex}
              defaultTitle="Jump to Action"
              isEditable={false}
            />
            <span onClick={onClose} className={`${styles.cursorPointer}`}>
              <Minus />
            </span>
          </div>
          <div className={styles.sidebarWrapperBody}>
            <div className={styles.selectCRMWrapperSelection}>
              <div className={styles.sidebarWrapperBodySection}>
                <label>Select Node</label>
                <CommonSelect
                  id={`jump_node`}
                  options={nodes}
                  value={selectedNode}
                  isSearchable={true}
                  placeholder="Select Node"
                  className={` select-template mb-3`}
                  disabled={false}
                  onChange={handleAddNode}
                  iconComponent={<ChevronDownSelect />}
                />
                {selectedNode && (
                  <button
                    type="button"
                    className={styles.gradientBtn}
                    onClick={handleRemoveLoopEdge}
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default End;
