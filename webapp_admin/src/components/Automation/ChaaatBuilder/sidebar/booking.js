import React, { useEffect } from 'react';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import SelectCRM from '../components/SelectCRM';
import BookingOption from '../components/BookingOption';
import SidebarPreviewTemplate from '../components/SidebarPreviewTemplate';
import SideBarTitleInput from '../components/SideBarTitleInput';

// ICONS
import Minus from '../../../FlowBuilder/Icons/Minus';
import BookingScreen from '../components/BookingScreen';

// STORE
import useSideBarStore from '../store';
import { getNodeIndex } from '../store/functions';

/**
 * Represents the Booking component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - The function to close the component.
 * @param {Object} props.node - The node object.
 * @param {string} props.node.id - The ID of the node.
 * @returns {JSX.Element} The JSX element representing the Booking component.
 */

const Booking = (props) => {
  const {
    onClose,
    node: { id },
    onSaveInitialPage,
  } = props;

  const { nodeData } = useSideBarStore();
  const nodeDataIndex = getNodeIndex(nodeData, id);
  const storedNodeData = nodeData[nodeDataIndex];
  const isPublished = storedNodeData?.data?.flowData?.status === "published" || false

  const bookingProps = { nodeDataIndex, storedNodeData, isPublished };
  const nonBookingModeProps = { ...bookingProps, onSaveInitialPage }

  const { showPreview, bookingMode, resetBookingSidebar } = useSideBarStore();

  useEffect(() => {
    return () => {
      // component unmounted
      resetBookingSidebar();
    };
  }, []);

  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarWrapper}>
        <div className={styles.sidebarWrapperContent}>
          <div className={styles.sidebarWrapperHeader}>
            <SideBarTitleInput
              styles={styles}
              nodeDataIndex={nodeDataIndex}
              defaultTitle="Booking"
              isEditable={false}
            />
            <span onClick={onClose} className={`${styles.cursorPointer}`}>
              <Minus />
            </span>
          </div>
          <div className={styles.sidebarWrapperBody}>
            {!bookingMode && (
              <>
                {/* <SelectCRM {...bookingProps} /> */}
                <SelectCRM {...bookingProps}/>
                <BookingOption {...nonBookingModeProps} />
              </>
            )}
            {bookingMode && (
              <>
                <BookingScreen {...bookingProps} />
              </>
            )}
          </div>
        </div>
      </div>
      {showPreview && <SidebarPreviewTemplate type="booking" />}
    </div>
  );
};

export default Booking;
