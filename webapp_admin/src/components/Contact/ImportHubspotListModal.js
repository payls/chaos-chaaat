import React, { useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { api } from '../../api';

export default React.memo(
  ({
    agencyId,
    setTempData,
    setDuplicateCount,
    setData,
    removeDuplicateMobiles,
    setLoading,
    variableName,
    setVariableName,
    variableValue,
    setVariableValue,
    handleShowImportModal,
  }) => {
    const router = useRouter();

    const submit = async () => {
      h.general.prompt(
        {
          message:
            'Please note that contacts with no mobile/phone number will not be listed. Continue Action?',
        },

        async (confirmAction) => {
          if (confirmAction) {
            setLoading(true);
            const pullData = {
              agency_id: agencyId,
              property_name: variableName,
              property_value: variableValue,
            };
            const apiRes = await api.contactListUser.hubspotContactList(
              pullData,
              false,
            );
            if (h.cmpStr(apiRes.status, 'ok')) {
              const { toImport, dupCount } = removeDuplicateMobiles(
                apiRes.data.results,
              );
              setTempData(toImport);
              setDuplicateCount(dupCount);
              setData(toImport);
              setTempData(apiRes.data.results);
              handleShowImportModal(false);
            }
            setLoading(false);
          }
        },
      );
    };
    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body sm">
          <div className=" d-flex justify-content-between">
            <h1>Enter Hubspot Details</h1>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                onClick={() => handleShowImportModal(false)}
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
          <div className=" modern-style mt-4 mdrn-input-form">
            <input
              type="text"
              className="form-item"
              placeholder="Enter custom variable name..."
              value={variableName || ''}
              onChange={(e) => setVariableName(e.target.value)}
            />
          </div>
          <div className=" modern-style mt-2 mdrn-input-form">
            <input
              type="text"
              className="form-item"
              placeholder="Enter custom variable value..."
              value={variableValue || ''}
              onChange={(e) => setVariableValue(e.target.value)}
            />
          </div>
          <div className="d-flex modern-modal-actions justify-content-between pt-2">
            <div style={{ flex: '50%' }}>
              <button
                type="type"
                className="modern-button fullw"
                onClick={() => handleShowImportModal(false)}
              >
                Close
              </button>
            </div>
            <div style={{ flex: '50%' }}>
              <button
                type="type"
                className="modern-button common fullw"
                onClick={submit}
                disabled={h.isEmpty(variableName) || h.isEmpty(variableValue)}
              >
                Process
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
