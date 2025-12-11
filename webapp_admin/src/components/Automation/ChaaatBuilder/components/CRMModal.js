import React, { useEffect } from 'react';
import crmStyles from '../styles/crm-modal.module.scss';

// COMPONENTS
import CommonToggleSlide from '../../../Common/CommonToggleSlide';

// UI
import Times from '../../../FlowBuilder/Icons/Times';
// STORE
import useSideBarStore from '../store';

export default React.memo(
  ({ handleClose = () => {}, selected = 'SEVEN_ROOM', agency }) => {
    const { crmData } = useSideBarStore();
    return (
      <div className={crmStyles.crmModalWrapper}>
        <div className={crmStyles.crmModalWrapperContent}>
          <div className="d-flex justify-content-end">
            <span style={{ cursor: 'pointer' }} onClick={handleClose}>
              <Times />
            </span>
          </div>
          <div className={`${crmStyles.crmModalWrapperContentBody} mt-3`}>
            <div className={`${crmStyles.crmModalWrapperContentBodyImg}`}>
              <img src={crmData[selected]?.image} className="mb-3" />
              {/* <span>
                <GearL />
              </span> */}
            </div>
            <h3>{crmData[selected]?.title}</h3>
            <p>{crmData[selected]?.description}</p>
            <hr />
            <div className={`${crmStyles.crmModalWrapperContentBodyAction}`}>
              <div>
                {/* <button type="button">View account</button> */}
              </div>
              <div>
                <CommonToggleSlide
                  defaultValue={false}
                  onToggle={(e) => {
                    // setCustomSelected(e.value);
                  }}
                  data={{
                    title: 'Connect',
                    toggled: (crmData[selected]?.isConnected == 'inactive') ? true : false,
                    selected: selected,
                    isConnected: crmData[selected]?.isConnected
                  }}
                  agency={agency}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
