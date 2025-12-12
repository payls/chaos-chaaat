import React, { useState } from 'react';
import { h } from '../../../../helpers';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import CommonSelect from '../../../Common/CommonSelect';

// STORE
import useSideBarStore from '../store';

const SET_REMINDER = [
  {
    label: 'Before',
    value: 'before',
  },
  {
    label: 'After',
    value: 'after',
  },
];

const TIME_UNIT = [
  {
    label: 'Hour',
    value: 'hour',
  },
  {
    label: 'Day',
    value: 'day',
  },
  {
    label: 'Minute',
    value: 'minute',
  }
];

export default React.memo(({ node, onSaveData = () => {} }) => {
  return (
    <div className={styles.sidebarWrapperBodySection}>
      <label>Set Reminder</label>
      <CommonSelect
        id={`set_reminder`}
        options={SET_REMINDER}
        value={node?.data.flowData?.set_reminder ?? null}
        isSearchable={true}
        placeholder="Select set reminder"
        className=" select-template mb-3"
        onChange={(v) => onSaveData('set_reminder', v)}
        iconComponent={<ChevronDownSelect />}
        disabled={false}
      />
      <label>Type Number</label>

      <input
        type="text"
        className={`${styles.templateBodyInput} mb-3`}
        value={node?.data.flowData?.number ?? null}
        placeholder="Enter number"
        maxLength={20}
        onChange={(e) => onSaveData('number', e.target.value)}
      />

      <label>Select time unit</label>
      <CommonSelect
        id={`time_unit`}
        options={TIME_UNIT}
        value={node?.data.flowData?.time_unit ?? null}
        isSearchable={true}
        placeholder="Select time unit"
        className=" select-template mb-3"
        onChange={(v) => onSaveData('time_unit', v)}
        iconComponent={<ChevronDownSelect />}
        disabled={false}
      />
    </div>
  );
});
