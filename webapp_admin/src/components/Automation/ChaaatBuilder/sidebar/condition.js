import React from 'react';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import ConditionForm from '../components/ConditionForm';
import SideBarTitleInput from '../components/SideBarTitleInput';

// ICONS
import Minus from '../../../FlowBuilder/Icons/Minus';

// STORE
import useSideBarStore from '../store';
import { getNodeIndex, getUpdatedNodeData } from '../store/functions';

/**
 * Represents the Condtional component.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - The function to close the component.
 * @param {Object} props.node - The node object.
 * @param {string} props.node.id - The ID of the node.
 * @returns {JSX.Element} The WaitThenCheck component.
 */
const WaitThenCheck = (props) => {
  const {
    onClose,
    node: { id },
  } = props;

  const { nodeData, setNodeData } = useSideBarStore();
  const nodeDataIndex = getNodeIndex(nodeData, id);

  /**
   * Updates the data of a node based on the provided key and value.
   *
   * @param {string} key - The key to update in the node data.
   * @param {any} v - The new value to assign to the key.
   * @returns {void}
   */
  function handleUpdateData(key, v) {
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, key, v));
  }

  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarWrapper}>
        <div className={styles.sidebarWrapperContent}>
          <div className={styles.sidebarWrapperHeader}>
            <SideBarTitleInput
              styles={styles}
              nodeDataIndex={nodeDataIndex}
              defaultTitle="Condition"
              isEditable={false}
            />
            <span onClick={onClose} className={`${styles.cursorPointer}`}>
              <Minus />
            </span>
          </div>
          <div className={styles.sidebarWrapperBody}>
            <ConditionForm
              {...props}
              node={nodeData[nodeDataIndex]}
              onSaveData={handleUpdateData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitThenCheck;
