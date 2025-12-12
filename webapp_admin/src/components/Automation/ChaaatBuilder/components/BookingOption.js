import React, { useEffect, useState } from 'react';
import { h } from '../../../../helpers';
import { unescapeData } from '../../../../helpers/general';
import styles from '../styles/styles.module.scss';
import mainStyle from '../styles/styles.module.scss';

// COMPONENTS
import InitialBookingForm from './InitialBookingForm';

// STORE
import useSideBarStore from '../store';
import { getUpdatedNodeData } from '../store/functions';

export default React.memo((props) => {
  const { nodeDataIndex, storedNodeData, isPublished } = props;
  const {
    nodeData,
    setNodeData,
    setBookingOption: setBookingOptionStore,
    setCachedBookingOption,
    setScreens,
    cachedBookingOption,
    defaultForBookingScreen,
    defaultCustomBookingScreen,
  } = useSideBarStore();
  const [bookingOption, setBookingOption] = useState(
    storedNodeData?.data?.flowData?.bookingOption ?? 'book-appointment',
  );
  const [isCachedSet, setIsCacheSet] = useState(false);

  /**
  *
  * This useEffect is triggered whenever the booking option changes, ensuring that the node data reflects
  * the most recent booking option selection, using the provided node data index.
  */
  useEffect(() => {
    setBookingOptionStore(bookingOption);
    setNodeData(
      getUpdatedNodeData(
        nodeData,
        nodeDataIndex,
        'bookingOption',
        bookingOption,
      ),
    );

    if (!isCachedSet && bookingOption) {
      setIsCacheSet(true);
      setCachedBookingOption(bookingOption);
    }
  }, [bookingOption]);

  /**
  * Updates the booking option and cached booking option, adjusting the screens based on the selected booking type.
  * 
  * @param {string} updatedBookingOption - The new booking option selected.
  * @param {string} _cachedBookingOption - The previously cached booking option.
  */
  const updateBookingOption = (updatedBookingOption, _cachedBookingOption) => {
    setBookingOption(updatedBookingOption);
    setCachedBookingOption(_cachedBookingOption)

    if (!updatedBookingOption) return;
    if (updatedBookingOption === _cachedBookingOption) {
      return;
    }

    if (updatedBookingOption === 'book-appointment') {
      setScreens(defaultForBookingScreen)
    }

    if (updatedBookingOption === 'custom') {
      setScreens(defaultCustomBookingScreen)
    }
  };

  const handleEventNameChange = (event) => {
    setNodeData(
      getUpdatedNodeData(
        nodeData,
        nodeDataIndex,
        "booking_event_name",
        event.target.value
      )
    );
  };

  return (
    <div className={styles.sidebarWrapperBodySection}>
      <label>Send via</label>
      <div className={`${styles.btnSelectOption} mb-3`}>
        <button
          type="button"
          className={`${styles.btnSelectOptionBtn} ${
            bookingOption === 'book-appointment'
              ? styles.btnSelectOptionBtnActive
              : ''
          }`}
          disabled={isPublished}
          onClick={() => updateBookingOption('book-appointment', bookingOption)}
        >
          <span>Book an Appointment</span>
        </button>
        <button
          type="button"
          className={`${styles.btnSelectOptionBtn} ${
            bookingOption === 'custom' ? styles.btnSelectOptionBtnActive : ''
          }`}
          disabled={isPublished}
          onClick={() => updateBookingOption('custom', bookingOption)}
        >
          <span>Custom</span>
        </button>
      </div>
      <div>
        <label>Booking event name</label>
        <div className={`mb-3`}>
          <input
            type="text"
            name='booking_event_name'
            className={`${mainStyle.templateBodyInput}`}
            value={unescapeData(nodeData[nodeDataIndex]?.data?.flowData?.booking_event_name)}
            onChange={handleEventNameChange}
          />
        </div>
      </div>
      <InitialBookingForm {...props} />
    </div>
  );
});

// whatsapp_flow_id