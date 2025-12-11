import React, { useEffect, useState } from 'react';
import { h } from '../../../../helpers';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import SpecificChannels from './SpecificChannels';

// STORE
import useSideBarStore from '../store';
import { getNodeIndex } from '../store/functions';

export default React.memo(({ node }) => {
  const { nodeData, setNodeData } = useSideBarStore();
  const nodeDataIndex = getNodeIndex(nodeData, node?.id);

  const [sendVia, setSendVia] = useState(null);

  useEffect(() => {
    setSendVia(nodeData[nodeDataIndex]?.data?.flowData?.sendVia ?? 'incoming');
  }, [setSendVia]);

  /**
   * Update nodeData store for sendVia setting
   */
  useEffect(() => {
    if (h.notEmpty(sendVia)) {
      const cNodeData = [...nodeData];
      cNodeData[nodeDataIndex].data.flowData = {
        ...cNodeData[nodeDataIndex].data.flowData,
        sendVia,
      };
      setNodeData(cNodeData);
    }
  }, [sendVia]);

  return (
    <div className={styles.sidebarWrapperBodySection}>
      <label>Send via</label>
      <div className={styles.btnSelectOption}>
        <button
          type="button"
          className={`${styles.btnSelectOptionBtn} ${
            sendVia === 'incoming' ? styles.btnSelectOptionBtnActive : ''
          }`}
          onClick={() => setSendVia('incoming')}
        >
          <span>Incoming channel</span>
        </button>
        <button
          type="button"
          className={`${styles.btnSelectOptionBtn} ${
            sendVia === 'specific' ? styles.btnSelectOptionBtnActive : ''
          }`}
          onClick={() => setSendVia('specific')}
        >
          <span> Specific channel</span>
        </button>
      </div>
      {sendVia === 'specific' && <SpecificChannels />}
    </div>
  );
});
