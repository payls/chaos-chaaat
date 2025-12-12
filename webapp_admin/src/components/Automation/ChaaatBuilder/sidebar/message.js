import React, { useEffect, useState } from 'react';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import SelectCRM from '../components/SelectCRM';
import TemplateSelection from '../components/TemplateSelection';
import SendVia from '../components/SendVia';
import SidebarPreviewTemplate from '../components/SidebarPreviewTemplate';

// ICONS
import Minus from '../../../FlowBuilder/Icons/Minus';

// STORE
import useSideBarStore from '../store';
import { getNodeIndex } from '../store/functions';
import SideBarTitleInput from '../components/SideBarTitleInput';

/**
 * Represents a message component in the sidebar.
 *
 * @param {Object} props - The component props.
 * @param {string} props.agency - The agency value.
 * @param {string} props.business_account - The business account value.
 * @param {Function} props.onClose - The function to close the sidebar.
 * @param {Object} props.node - The node object.
 * @returns {JSX.Element} The rendered message component.
 */
const Message = (props) => {
  const { agency, business_account, onClose, node, wabaNumber } = props;
  const { id } = node;

  const { nodeData, showPreview, bookingMode, setNodeData } = useSideBarStore();
  const nodeDataIndex = getNodeIndex(nodeData, id);
  const [storedNodeData, setStoredNodeData] = useState(null);
  const [title, setTitle] = useState('Messaging');
  const messagingProps = { nodeDataIndex, storedNodeData };

  useEffect(() => {
    setStoredNodeData(nodeData[nodeDataIndex])
  },[nodeData]);

  useEffect(() => {
    const _title = storedNodeData?.data?.flowData?.title;
    setTitle(_title)
  }, [storedNodeData]);

  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarWrapper}>
        <div className={styles.sidebarWrapperContent}>
          <div className={styles.sidebarWrapperHeader}>
            <SideBarTitleInput
              styles={styles}
              nodeDataIndex={nodeDataIndex}
              defaultTitle="Messaging"
              id={id}
            />
            <span onClick={onClose} className={`${styles.cursorPointer}`}>
              <Minus />
            </span>
          </div>
          <div className={styles.sidebarWrapperBody}>
            <SendVia node={node} />
            <SelectCRM {...messagingProps} />
            <TemplateSelection
              agency={agency}
              onSelect={() => {}}
              template_name={title}
              business_account={business_account}
              waba_number={wabaNumber}
              nodeDataIndex={nodeDataIndex}
              id={id}
            />
          </div>
        </div>
      </div>
      {showPreview && <SidebarPreviewTemplate type="message" nodeDataIndex={nodeDataIndex} />}
    </div>
  );
};

export default Message;
