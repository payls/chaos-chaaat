import React, { useState, useEffect } from 'react';
import { h } from '../../../../helpers';
import styles from '../styles/select-crm.module.scss';
import mainStyle from '../styles/styles.module.scss';
import constant from '../../../../constants/constant.json';
import { api } from '../../../../api';

// COMPONENTS
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import CommonSelect from '../../../Common/CommonSelect';
import CRMModal from './CRMModal';

// UI
import GearS from '../../../FlowBuilder/Icons/GearS';
import InfoRed from '../../../FlowBuilder/Icons/InfoRed';
import CommonReactTooltip from '../../../Common/CommonReactTooltip';

// STORE
import useSideBarStore from '../store';
import { getUpdatedNodeData } from '../store/functions';

const sfdcFields = [
  {
    label: 'First Name',
    value: 'first_name',
  },
  {
    label: 'Last Name',
    value: 'last_name',
  },
  {
    label: 'Email Address',
    value: 'email',
  },
  {
    label: 'Phone Number',
    value: 'mobile_number',
  },
  {
    label: 'Lead Source',
    value: 'lead_source',
  },
  {
    label: 'Lead Source Lv1',
    value: 'lead_source_lv1',
  },
  {
    label: 'Lead Source Lv2',
    value: 'lead_source_lv2',
  },
  {
    label: 'Marketing Email',
    value: 'marketing',
  },
  {
    label: 'Interested Product',
    value: 'product',
  },
  {
    label: 'City Code',
    value: 'city',
  },
  {
    label: 'Consent Date',
    value: 'consent_date',
  },
  {
    label: 'Language',
    value: 'language',
  },
  {
    label: 'Comments',
    value: 'comments',
  },
];

const TOOLTIP_OPTIONS = {
  border: '1px solid #D70808',
  style: {
    background: '#fdf2f2',
    color: 'var(--off-black)',
    borderRadius: '8px',
    zIndex: 2,
  },
};

export default React.memo((props) => {
  const { nodeDataIndex, storedNodeData, isPublished } = props;
  const { setBookingMode, setNodeData, nodeData } = useSideBarStore();

  const [selectedSFField, setSelectedSFField] = useState(
    storedNodeData?.data?.flowData?.salesforce_field ?? null,
  );
  
  const { setCRM, setCRMData, crmData, crm } = useSideBarStore();

  // const [selectedCRM, setSelectedCRM] = useState(null);
  const [selectedCRM, setSelectedCRM] = useState(
    storedNodeData?.data?.flowData?.crm ?? null,
  );

  const [open, setOpen] = useState(false);
  const [crmModalOpen, setCRMModalOpen] = useState(null);

  const [integrations, setIntegrations] = useState(
    constant.INTEGRATIONS.map((m, i) => ({
      value: m,
      key: Object.keys(m)[0],
      label: Object.values(m),
      connect: 1, // temp. for display only
    })),
  );
  
  /**
   * Update CRM field
   *
   * @function
   * @name handleSelectCRM
   * @kind function
   * @memberof default.React.memo() callback
   * @param {any} e
   * @returns {void}
   */
  function handleSelectCRM(e) {
    setSelectedCRM(e);
    setCRM(e);
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'crm', e));
    setOpen(false);
  }

  /**
   * Handles the selection of a Salesforce field.
   *
   * @param {Event} e - The event object representing the selection.
   * @returns {void}
   */
  function handleSalesforceField(e) {
    setSelectedSFField(e);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'salesforce_field', e),
    );
  }

  useEffect(() => {
    (async () => {
      if (props.agency_id) {
        if (Object.keys(crm).length != 0) {
          setSelectedCRM(crm)
        }
        const getOutlookCalIntegration = await api.integrations.getOutlookCalActiveIntegration(
          {
            agency_id: props.agency_id,
          },
          false,
        );
        if (h.cmpStr(getOutlookCalIntegration.status, 'ok')) {
          const { agency_oauth } = getOutlookCalIntegration.data;
          updateCRMState('OUTLOOK', agency_oauth.status)
        }
        const getGcalendarIntegration = await api.integrations.getGcalenderActiveIntegration(
          {
            agency_id: props.agency_id,
          },
          false,
        );
        if (h.cmpStr(getGcalendarIntegration.status, 'ok')) {
          const { agency_oauth } = getGcalendarIntegration.data;
          updateCRMState('GOOGLE', agency_oauth.status)
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (crm) setSelectedCRM(crm);
  }, [crm])

  const updateCRMState = (title, value) => {
    crmData[title].isConnected = value
    setCRMData(crmData)
  }
  // console.log(crmData, integrations)
  return (
    <>
      <div className={mainStyle.sidebarWrapperBodySection}>
        <label>Select a CRM</label>

        <div className={styles.selectCRMWrapper}>
          <div
            className={styles.selectCRMWrapperValue}
            onClick={() => !isPublished && setOpen(!open)}
          >
            <span>
              {h.isEmpty(selectedCRM) ? `Select CRM` : selectedCRM?.label}
            </span>

            <span className={`${open ? styles.svgInvert : ''} `}>
              <ChevronDownSelect />
            </span>
          </div>

          {open && (
            <div className={styles.selectCRMWrapperSelection}>
              <div className={styles.selectCRMWrapperSelectionContent}>
                {integrations.map((f, i) => (
                  <div
                    className={styles.selectCRMWrapperSelectionContentItems}
                    key={i}
                  >
                    <div
                      className={`${styles.selectCRMWrapperSelectionContentItemsList} ${f.key === 'GOOGLE' || f.key === 'OUTLOOK' ? `${styles.active}` : ''}`
                      }
                      onClick={() => {
                        if ((f.key == 'GOOGLE' || f.key == 'OUTLOOK') && crmData[f.key]?.isConnected === 'active') {
                          handleSelectCRM(f)
                        }
                      }}
                    >
                      {f.label}{' '}
                      {f?.connect === i && (
                        <CommonReactTooltip
                          options={TOOLTIP_OPTIONS}
                          place={'bottom-start'}
                          tooltipText="Please connect and try again"
                        >
                          <InfoRed />
                        </CommonReactTooltip>
                      )}
                    </div>

                    {f.key == 'GOOGLE' || f.key == 'OUTLOOK'
                    ?
                    (
                      crmData[f.key]?.isConnected != 'active'
                      ?
                        <button
                          type="button"
                          className={
                            styles.selectCRMWrapperSelectionContentItemsListBtn
                          }
                          onClick={() => {setCRMModalOpen(f.key)}}
                        >
                          Connect
                        </button>
                      :
                      <span className={styles.gearSmall} onClick={() => {}}>
                        <GearS />
                      </span>
                    )
                    :
                    (
                      <span className={styles.gearSmall}>
                        Coming Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {h.notEmpty(selectedCRM) && selectedCRM?.key === 'SALESFORCE' && (
          <>
            <label className="mt-3">Push to Salesforce</label>
            <CommonSelect
              id={`salesforceField`}
              options={sfdcFields}
              value={selectedSFField}
              isSearchable={false}
              placeholder="Select field"
              className=" select-template mb-3"
              onChange={handleSalesforceField}
              iconComponent={<ChevronDownSelect />}
            />
          </>
        )}

        {/* {h.notEmpty(selectedCRM) && selectedCRM?.key === 'GOOGLE' && (
          <>
            <label className="mt-3">Select Organizers</label>
            <CommonSelect
              id={`organizer`}
              options={[]}
              value={null}
              isSearchable={false}
              placeholder="Select organizers"
              className=" select-template mb-3"
              onChange={(v) => {}}
              multiple={true}
              iconComponent={<ChevronDownSelect />}
            />
          </>
        )} */}
      </div>
      {h.notEmpty(crmModalOpen) && (
        <CRMModal
          handleClose={() => setCRMModalOpen(null)}
          selected={crmModalOpen}
          agency={props}
        />
      )}
    </>
  );
});