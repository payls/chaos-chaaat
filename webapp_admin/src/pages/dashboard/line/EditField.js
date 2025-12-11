import React, { useEffect, useState } from 'react';
import {
  faTimes,
  faEdit,
  faCheck,
  faCheckCircle,
  faMinusCircle,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { h } from '../../../helpers';
import { api } from '../../../api';

// UI
import CommonTooltip from '../../../components/Common/CommonTooltip';

export default React.memo(
  ({
    clickAction = () => {},
    link = true,
    saveAction = () => {},
    text,
    trackerName = '',
    textStyle = {},
    buttonWrapperStyle = {},
    inputStyle = {},
    changed = null,
    oldValue = '',
  }) => {
    const [editMode, setEditMode] = useState(false);
    const [newName, setNewName] = useState(text);

    return (
      <div className="d-flex">
        {!editMode ? (
          <>
            <span
              style={{
                cursor: link ? 'pointer' : 'default',
                textDecoration: link ? 'underline' : 'normal',
                textTransform: 'none',
                width: '90%',
                ...textStyle,
              }}
              onClick={clickAction}
            >
              {changed !== null && (
                <>
                  {changed === 0 && (
                    <CommonTooltip tooltipText="No Change">
                      <FontAwesomeIcon
                        className={'d-inline white mr-1'}
                        color="#FDB919"
                        icon={faMinusCircle}
                      />
                    </CommonTooltip>
                  )}
                  {changed === 1 && (
                    <CommonTooltip
                      tooltipText={`Validated. Old value - ${oldValue}`}
                    >
                      <FontAwesomeIcon
                        className={'d-inline white mr-1'}
                        color="#fe5959"
                        icon={faCheckCircle}
                      />
                    </CommonTooltip>
                  )}
                  {changed === 2 && (
                    <CommonTooltip
                      tooltipText={`Manually adjusted. Old value - ${oldValue}`}
                    >
                      <FontAwesomeIcon
                        className={'d-inline white mr-1'}
                        color="#182327"
                        icon={faUserCircle}
                      />
                    </CommonTooltip>
                  )}
                </>
              )}
              {text}
            </span>
            <div
              style={{ width: '10%', ...buttonWrapperStyle }}
              className="d-flex justify-content-center align-items-center"
            >
              <CommonTooltip tooltipText="Edit">
                <div
                  className="action-btn"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEditMode(true);
                    setNewName(text);
                  }}
                >
                  <FontAwesomeIcon
                    className={'table-icon white'}
                    color="#055349"
                    icon={faEdit}
                  />
                </div>
              </CommonTooltip>
            </div>
          </>
        ) : (
          <>
            <span
              style={{
                cursor: link ? 'pointer' : 'default',
                textDecoration: link ? 'underline' : 'normal',
                width: '90%',
                ...textStyle,
              }}
            >
              <input
                type={'text'}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                }}
                style={{
                  border: `1px solid ${h.isEmpty(newName) ? 'red' : '#0f5a50'}`,
                  borderRadius: '5px',
                  width: '100%',
                  ...inputStyle,
                }}
              />
            </span>
            <div
              style={{ width: '10%', gap: '0.3em', ...buttonWrapperStyle }}
              className="d-flex  justify-content-center align-items-center"
            >
              <CommonTooltip tooltipText="Save">
                <div
                  className="action-btn"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (!h.isEmpty(newName)) {
                      setEditMode(false);
                      saveAction({ name: newName, trackerName });
                    }
                  }}
                >
                  <FontAwesomeIcon
                    className={'table-icon white'}
                    color="#055349"
                    icon={faCheck}
                  />
                </div>
              </CommonTooltip>
              <CommonTooltip tooltipText="Cancel">
                <div
                  className="action-btn"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEditMode(false);
                    setNewName(text);
                  }}
                >
                  <FontAwesomeIcon
                    className={'table-icon white'}
                    color="#055349"
                    icon={faTimes}
                  />
                </div>
              </CommonTooltip>
            </div>
          </>
        )}
      </div>
    );
  },
);
