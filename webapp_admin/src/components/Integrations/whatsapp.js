import React, { useEffect, useState } from 'react';
import WhatsAppAccountList from '../WhatsApp/WhatsAppAccountList';
import WhatsAppOnboardingModal from '../WhatsApp/WhatsAppOnboardingModalComponent';

import { faUsers, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';

export default function WhatsApp({ agencyId, isChaaat = false, isSuperAdmin }) {
  const router = useRouter()
  const [openWA, setOpenWA] = useState(false);
  const [openConnect, setOpenConnect] = useState(false);

  const connectWhatsapp = (event) => {
    if (event.target.checked) {
      setOpenConnect(true);
    }
  }
  useEffect(() => {
    const { new_connection } = router.query;
    
    if (new_connection === 'whatsapp') {
      setOpenConnect(true);
    }
  }, [router.query]);

  return (
    <>
      {openConnect && (
        <WhatsAppOnboardingModal
          agencyId={agencyId}
          handleCloseModal={() => {
            setOpenConnect(false);
          }}
        />
      )}

      {openWA && (
        <WhatsAppAccountList
          agencyId={agencyId}
          handleCloseModal={() => {
            setOpenWA(false);
          }}
          isChaaat={isChaaat}
          isSuperAdmin={isSuperAdmin}
        />
      )}
      <div
        class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12">
        <div class="crm_card">
          <div class="card_content">
            <div class="card_icon">
              <div class="card_iconImg_wrapper d-inline-flex">
                <img src="../../assets/images/whatsapp.svg" alt />
              </div>
            </div>
            <h4
              class="mb-1 px-lg-1 px-md-1 mt-3">WhatsApp</h4>
            <p
              class="m-0 px-lg-1 px-md-1">Connect
              your WhatsApp account
              allowing
              sending of campaigns and
              automations.</p>
          </div>
          <hr class="my-3" />
          <div class="card_content">
            <div
              class="px-lg-1 px-md-1 d-flex align-items-center justify-content-between gap-2">
              <button class="btn btn-outline-primary" onClick={() => setOpenWA(true)}>View Account</button>
              <div
                class="d-flex align-items-center gap-3">

                <label
                  for className="label_gap3">Connect</label>

                <div
                  class="checkboxOuter">
                  <div
                    class="checkboxInner">
                    <div
                      class="checkbox">
                      <input
                        class="tgl tgl-ios"
                        id="cb2-7"
                        onClick={(event) => { connectWhatsapp(event) }}
                        type="checkbox" />
                      <label
                        class="tgl-btn"
                        for="cb2-7"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
