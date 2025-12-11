import React, { useState } from 'react';
import { h } from '../../../../helpers';
import styles from '../styles/specific-channels.module.scss';

// COMPONENTS
import WhatsApp from '../../../FlowBuilder/Icons/WhatsApp';

export default React.memo(({}) => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  return (
    <div className={styles.specificChannelsWrapper}>
      <div className={styles.specificChannelsWrapperSelection}>
        <div className={styles.specificChannelsWrapperSelectionContent}>
          <label>Select Channels</label>

          <div className={styles.specificChannelsWrapperSelectionContentList}>
            <WhatsApp />
          </div>
        </div>
      </div>
    </div>
  );
});
