import { AddButton } from '../addButton/addButton';
import { Menu, Dropdown } from 'antd';
import React from 'react';
import { getIconSrc } from '../../nodes/base';
import styles from '../../builder.module.scss';

const options = {
  style: { border: '1px solid #DEDEDE', padding: '5px', borderRadius: '8px' },
  width: '30px',
  height: 'auto',
};

/**
 * Renders an EdgeAddButton component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.style - The inline style object for the component.
 * @param {Object} props.data - The data object for the component.
 * @param {string} props.id - The ID of the component.
 * @returns {JSX.Element} The rendered EdgeAddButton component.
 */
const EdgeAddButton = (props) => {
  const { style, data, id, disableOption = {} } = props;

  const items = {
    items: [
      {
        key: 'message',
        label: 'Messaging',
        icon: getIconSrc('message', options),
      },
      {
        key: 'booking-menu',
        label: 'Booking',
        icon: getIconSrc('booking', options),
        children: [
          {
            key: 'booking',
            label: 'Create a Booking',
            icon: getIconSrc('booking', options),
            disabled: disableOption.createBooking
          },
          {
            key: 'reminder',
            label: 'Create a Reminder',
            icon: getIconSrc('reminder', options),
          },
        ],
      },
      {
        key: 'waitThenCheck',
        label: 'Condition',
        icon: getIconSrc('waitThenCheck', options),
      },
    ],
    onClick: (event) => data.onAddNodeCallback({ id, type: event.key }),
  };

  return (
    <div className={styles.EdgeAddButton} style={style}>
      <Dropdown
        rootClassName={styles.ChaaatBuilderMenu}
        menu={items}
        trigger={['click']}
      >
        <AddButton {...props} />
      </Dropdown>
    </div>
  );
};

export default EdgeAddButton;
