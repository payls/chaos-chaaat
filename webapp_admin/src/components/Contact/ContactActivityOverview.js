import React, { useState, useEffect } from 'react';
import CommonSideModal from '../Common/CommonSideModal';
import { h } from '../../helpers';
import { api } from '../../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Overview from '../Dashboard/partials/overview';

export default function ContactActivityOverview(props) {
  const {
    showModal = false,
    setShowModal,
    contactId = '',
    setLoading,
    agencyUser = false,
  } = props;

  const [viewCount, setViewCount] = useState('10');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [lastViewedDate, setLastViewedDate] = useState('');
  const [lastViewedLocal, setLastViewedLocal] = useState('');
  const [lastViewedDevice, setLastViewedDevice] = useState('');
  const [mindBodyData, setMindBodyData] = useState({
    contracts: [],
    visits: [],
    memberships: [],
  });
  const [contact, setContact] = useState(null);
  let averageViewTime = 'Not Available';

  useEffect(() => {
    (async () => {
      if (contactId) {
        if (showModal) {
          setLoading(true);
          const contactApi = await api.contact.findById(
            { contact_id: contactId },
            {},
            false,
          );
          if (h.notEmpty(contactApi.data.contact)) {
            setContact(contactApi.data.contact);
          }
          const apiRes = await api.contactActivity.getContactActivityOverview(
            {
              contact_id: contactId,
            },
            {
              hasMindBodyData: true,
            },
            false,
          );
          if (h.cmpStr(apiRes.status, 'ok')) {
            const mbData = { ...mindBodyData };

            if (h.notEmpty(apiRes.data.contracts)) {
              mbData.contracts = apiRes.data.contracts;
            }
            if (h.notEmpty(apiRes.data.memberships)) {
              mbData.memberships = apiRes.data.memberships;
            }
            if (h.notEmpty(apiRes.data.visits)) {
              mbData.visits = apiRes.data.visits;
            }
            setMindBodyData(mbData);

            if (h.general.notEmpty(apiRes.data.contactActivityOverview.count)) {
              if (apiRes.data.contactActivityOverview.count == 0) {
                setViewCount('No Views');
              } else {
                setViewCount(apiRes.data.contactActivityOverview.count);
              }
            }
            if (
              h.general.notEmpty(
                apiRes.data.contactActivityOverview.latestActivity,
              )
            ) {
              setLastViewedDate(
                h.date.formatDateTime(
                  h.date.convertUTCDateToLocalDate(
                    apiRes.data.contactActivityOverview.latestActivity
                      .created_date_raw,
                    timezone,
                  ),
                ),
              );
              if (
                h.general.notEmpty(apiRes.data.contactActivityOverview.location)
              ) {
                setLastViewedLocal(
                  apiRes.data.contactActivityOverview.location,
                );
              } else {
                setLastViewedLocal('');
              }
              if (
                h.general.notEmpty(apiRes.data.contactActivityOverview.device)
              ) {
                setLastViewedDevice(apiRes.data.contactActivityOverview.device);
              } else {
                setLastViewedDevice('-');
              }
            } else {
              setLastViewedDate('Unseen');
              setLastViewedLocal('');
              setLastViewedDevice('-');
            }
          }
          setLoading(false);
        }
      }
    })();

    return () => {
      setMindBodyData({
        contracts: [],
        visits: [],
        memberships: [],
      });
    };
  }, [contactId, showModal]);

  return (
    <CommonSideModal showModal={showModal} width="500px">
      <div className="contact-activity-overview-header">
        <div
          className="d-flex align-items-center pl-3"
          style={{ height: '100%' }}
        >
          Contact Activity Overview
        </div>
        <div className="contact-activity-overview-close-container d-flex align-items-center pr-4">
          <span
            className="contact-activity-overview-close"
            onClick={() => setShowModal(!showModal)}
          >
            <FontAwesomeIcon
              icon={faTimes}
              color="#f2f2f2"
              style={{ fontSize: '15px' }}
            />
          </span>
        </div>
      </div>
      <Overview
        contact={contact}
        contactActivities={[]}
        viewMoreTrigger={false}
        data={{
          viewCount,
          lastViewedDate,
          lastViewedLocal,
          lastViewedDevice,
          mindBodyData,
        }}
      />
    </CommonSideModal>
  );
}
