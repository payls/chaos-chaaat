import React, { useEffect, useState, useMemo } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import Swal from 'sweetalert2';

import {
  faCircle,
  faRedoAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonDrodownAction from '../Common/CommonDrodownAction';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import SmallSpinner from './SmallSpinner';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';

const queryClient = new QueryClient();

export default React.memo(({ handleCloseModal, agencyId, setLoading }) => {
  const [columns, setColumns] = useState([]);
  const [unsubscribeTexts, setUnsubscribeTexts] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({
    agency_id: agencyId,
    content: '',
  });

  useEffect(() => {
    (async () => {
      await getList();
    })();

    const promptDeleteText = async (unsubscribe_text_id) => {
      Swal.fire({
        title: 'Delete Trigger Text?',
        icon: 'warning',
        html: `This will delete trigger text used to determine contact unsubscribe/opt-out intent. Continue?`,
        reverseButtons: true,
        showCancelButton: true,
        confirmButtonColor: '#025146',
        confirmButtonText: 'Yes',
        cancelButtonColor: '#606A71',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (h.cmpBool(result.isConfirmed, true)) {
          setLoading(true);
          const apiRes = await api.agency.deleteUnsubscriibeText(
            unsubscribe_text_id,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Trigger text deleted.`,
            });
            await getList();
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
        return true;
        // if (result && result.value)
        //   return handleDeleteTemplate(agency_id, waba_template_id);
      });
    };

    const initialColumns = [
      {
        id: 'w-q-unsubscribe-text',
        Header: 'Text',
        headerWidth: '170px',
        Cell: ({ row: { original } }) => {
          const { content } = original;

          return <div style={{ textTransform: 'initial' }}>{content}</div>;
        },
      },
      {
        id: 'w-opt-in',
        Header: 'Action',
        headerWidth: '150px',
        Cell: ({ row: { original } }) => {
          const { unsubscribe_text_id } = original;

          return (
            <div style={{ textTransform: 'initial', textAlign: 'center' }}>
              <button
                className="common-button text-normal w-150"
                onClick={async () => {
                  promptDeleteText(unsubscribe_text_id);
                }}
              >
                DELETE TEXT
              </button>
            </div>
          );
        },
      },
    ];

    setColumns(initialColumns);
  }, []);

  const tableColumns = useMemo(() => columns, [columns]);

  async function create() {
    setStatus(constant.API_STATUS.PENDING);
    const res = await api.agency.createNewUnsubscribeText(form, true);

    if (h.cmpStr(res.status, 'ok')) {
      await getList();
    }

    setView('list');
  }

  async function getList() {
    (async () => {
      setStatus(constant.API_STATUS.PENDING);
      const texts = await api.agency.getUnsubscribeTexts(
        { agency_id: agencyId },
        false,
      );
      if (h.cmpStr(texts.status, 'ok')) {
        setUnsubscribeTexts(texts.data);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    })();
  }
  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body">
        <div className=" d-flex justify-content-between">
          <h1>Unsubscribe/Opt-Out Triggers</h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              onClick={handleCloseModal}
              style={{
                cursor: 'pointer',
                fontSize: '1em',
                marginLeft: '3em',
              }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                color="#182327"
                style={{ fontSize: '15px' }}
              />
            </span>
          </div>
        </div>
        <div className=" modern-style mt-4 new-table">
          <div style={{ marginBottom: '10px' }}>
            <sup>
              This contains all messages that will trigger contact
              unsubscription to WhatsApp messages. Messages should match exactly
              any on the list to trigger the event.
            </sup>
          </div>
          {view === 'list' && (
            <>
              {status === constant.API_STATUS.PENDING && (
                <FullTableLoading headers={['Text', 'Action']} />
              )}

              {status === constant.API_STATUS.FULLFILLED && (
                <CommonResponsiveTable
                  columns={tableColumns}
                  data={unsubscribeTexts}
                  options={{
                    scrollable: true,
                  }}
                  thHeight="50px"
                  showFooter={false}
                  noDataText={'No Unsubscribe Texts created yet'}
                />
              )}
              <div className="center-body">
                <button
                  className="common-button mt-4 mr-2 text-normal"
                  type="button"
                  onClick={() => {
                    setView('create');
                  }}
                >
                  Add New
                </button>
              </div>
            </>
          )}

          {view === 'create' && (
            <>
              <div
                className="d-flex justify-content-between "
                style={{ gap: '1em' }}
              >
                <div
                  style={{
                    flexGrow: 1,
                  }}
                  className="d-flex  flex-column"
                >
                  <div className="d-flex campaign-create-form mt-3">
                    <label>
                      Content
                      <small>*</small>
                    </label>
                    <div>
                      <input
                        placeholder="Enter Unsubscribe Trigger Text"
                        type="text"
                        value={form.content}
                        className={`form-item ${
                          h.isEmpty(form.content) ? 'field-error' : ''
                        }`}
                        onChange={(e) => {
                          setForm({ ...form, content: e.target.value });
                        }}
                      />
                      <sub>
                        Content can be of any language. This should be the exact
                        text message to be checked for triggering opt out
                        status.
                      </sub>
                    </div>
                  </div>
                  <div className="d-flex campaign-create-form mt-3">
                    <div
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      <button
                        className="common-button transparent-bg mt-4 mr-2 text-normal"
                        type="button"
                        onClick={() => {
                          setView('list');
                        }}
                      >
                        Back
                      </button>
                      <button
                        className="common-button mt-4 mr-2 text-normal w-150"
                        type="button"
                        onClick={create}
                        disabled={h.isEmpty(form.content)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
