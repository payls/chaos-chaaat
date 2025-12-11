import React, { useEffect, useState } from 'react';

// Services
import { api } from '../../api';
import { h } from '../../helpers';
import { h as hh } from '../Sale/Link/preview/helpers';

/**
 * Reserve Property
 * @returns {JSX.Element}
 * @constructor
 */
export default function ReserveProperty(props) {
  const {
    setLoading,
    shortlisted_property_id,
    is_requested_for_reservation,
    reloadShortlistedProjects,
    customStyle,
    translate,
  } = props;

  const handleReserve = async () => {
    setLoading(true);
    const apiRes = await api.shortlistedProperty.reserveShortlistedProperty(
      { shortlisted_property_id },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      reloadShortlistedProjects();
      h.general.alert('success', {
        message: 'Property successfully sent a reservation request',
      });
    }

    setLoading(false);
  };
  return (
    <div className="d-flex justify-content-center align-items-center mb-3 reserve-btn">
      <button
        style={{
          border: `2px solid ${
            customStyle.reservation?.background ?? '#014976'
          }`,
          borderRadius: '12px',
          fontSize: '14px',
          padding: '20px 100px',
          width: '100%',
          background: is_requested_for_reservation
            ? '#f7f7f7'
            : customStyle.reservation?.background,
          color: is_requested_for_reservation
            ? customStyle.reservation?.background
            : '#fff',
          cursor: 'not-allowed',
        }}
        disabled={true}
        onClick={handleReserve}
      >
        {is_requested_for_reservation
          ? hh.translate.localize('requestedAReservation', translate)
          : hh.translate.localize('reserve', translate)}
      </button>
    </div>
  );
}
