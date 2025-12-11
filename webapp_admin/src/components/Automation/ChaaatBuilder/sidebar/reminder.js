import React from 'react';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import ReminderForm from '../components/ReminderForm';
import SideBarTitleInput from '../components/SideBarTitleInput';

// ICONS
import Minus from '../../../FlowBuilder/Icons/Minus';

// Store
import useSideBarStore from '../store';
import { getNodeIndex, getUpdatedNodeData } from '../store/functions';

/**
 * Reminder component.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - The function to close the reminder.
 * @param {Object} props.node - The node object.
 * @param {string} props.node.id - The ID of the node.
 * @returns {JSX.Element} The Reminder component.
 */
const Reminder = ({ onClose, node: { id } }) => {
  const { nodeData, setNodeData } = useSideBarStore();
  const nodeDataIndex = getNodeIndex(nodeData, id);

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
              defaultTitle="Reminder"
              isEditable={false}
            />
            <span onClick={onClose} className={`${styles.cursorPointer}`}>
              <Minus />
            </span>
          </div>
          <div className={styles.sidebarWrapperBody}>
            <ReminderForm
              node={nodeData[nodeDataIndex]}
              onSaveData={handleUpdateData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminder;
