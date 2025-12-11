import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

export default React.memo(
  ({
    agencyUser,
    shortlistedProject,
    translate,
    setLoading,
    contact,
    shouldTrackActivity,
    reloadShortlistedProjects,
  }) => {
    const [registered, setRegistered] = useState(null);
    const [hasCampaign, setHasCampaign] = useState(false);

    const handleCTA = async () => {
      if (shortlistedProject.is_enquired) return;
      setLoading(true);
      const apiRes = await api.contact.clickCTA1(
        {
          agency_id: agencyUser.agency_fk,
          contact_id: contact.contact_id,
        },
        false,
      );
      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        await checkCampaign();
        h.general.alert('success', {
          message: 'Thank you for your registration!',
        });
      }
    };

    useEffect(() => {
      (async () => {
        await checkCampaign();
      })();
    }, []);

    const checkCampaign = async () => {
      const apiRes = await api.contact.getCheckIfBtnClicked(
        { contact_id: contact.contact_id },
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setHasCampaign(apiRes.data.hasCampaign);
        setRegistered(apiRes.data.clicked);
      }
    };

    const handleTracker = async (activity, metaData) => {
      let meta = {
        ...metaData,
        shortlisted_project_id: shortlistedProject.shortlisted_project_id,
      };
      if (shouldTrackActivity)
        await api.contactActivity.create(
          {
            contact_fk: contact.contact_id,
            activity_type: activity,
            activity_meta: JSON.stringify(meta),
          },
          false,
        );
    };

    const handleSendMoreOptions = async () => {
      if (shortlistedProject.is_enquired) return;
      setLoading(true);

      const apiRes = await api.contact.getCheckIfBtnClicked(
        { contact_id: contact.contact_id },
        false,
      );

      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        reloadShortlistedProjects();
        h.general.alert('success', {
          message:
            'Thank you for your interest, you will hear back from the agent shortly!',
        });
      }
    };

    return (
      <main id="invest-ogps-expat-root">
        <section>
          <div style={{ background: '#000' }}>
            <div className="">
              <img
                src={
                  'https://invest.ogpsglobal.com/hs-fs/hubfs/One%20Global%20Group%20-%20Logo%20Bar-02-1.png?upscale=true&width=2400&upscale=true&name=One%20Global%20Group%20-%20Logo%20Bar-02-1.png'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
          <section className="center-body">
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/logo-mqdc.png?upscale=true&width=1000&upscale=true&name=logo-mqdc.png`}
              width={'250px'}
              className="p-2"
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Untitled%20design%20(1).png?upscale=true&width=2400&upscale=true&name=Untitled%20design%20(1).png`}
              width={'100%'}
            />

            <h3 className="heading-2 mt-2" style={{ fontSize: '16px' }}>
              BANGKOK
            </h3>
            <p className="heading-p-2" style={{ fontSize: '16px' }}>
              SUKHUMVIT ULTRA LUXURY RESIDENTIAL COLLECTION
            </p>

            <p className="simple-p pl-4 pr-4" style={{ fontSize: '15px' }}>
              Located in 2 prime expat areas in Bangkok, directly across from
              the <b>Thonglor</b> and <b>Ekkamai BTS</b> stations.
              <br />
              <br />
              Condominiums in the Sukhumvit area are enjoying an exciting
              quarter-on-quarter rental growth of 8.6% and rents for buy-to-let
              condominiums and owner-occupied apartments have increased by a
              significant 54%.
            </p>

            <div className="center-body">
              <hr
                style={{
                  width: '300px',
                  height: '1px',
                  background: '#000',
                }}
              />
            </div>

            <p className="heading-p-2 pr-4 pl-4" style={{ fontSize: '15px' }}>
              EXHIBITION
              <br />
              DATE: <span>Saturday & Sunday 26th & 27th August 2023</span>
              <br />
              TIME: <span>11AM - 6PM</span>
              <br />
              LOCATION:{' '}
              <span>
                One Global Gallery, 127 Devonshire Road, Singapore 239885{' '}
              </span>
              <br />
            </p>

            <div className="center-body">
              <hr
                style={{
                  width: '300px',
                  height: '1px',
                  background: '#000',
                }}
              />
            </div>

            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/The%20Strand%20Logo-Black-1.png?upscale=true&width=720&upscale=true&name=The%20Strand%20Logo-Black-1.png`}
              width={'180px'}
              className="p-2"
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Untitled%20design%20(2)-1.png?upscale=true&width=2360&upscale=true&name=Untitled%20design%20(2)-1.png`}
              width={'100%'}
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Screenshot%202023-08-14%20at%203.42.24%20PM.png?upscale=true&width=2400&upscale=true&name=Screenshot%202023-08-14%20at%203.42.24%20PM.png`}
              width={'100%'}
            />

            <div
              style={{
                textAlign: 'center',
                paddingBottom: '30px',
              }}
            >
              <button
                type="button"
                className="btn-submit"
                style={{
                  cursor: 'pointer',
                  background: ' #a68561',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  fontWeight: '900',
                  fontFamily: 'Verdana',
                }}
                onClick={() => {
                  if (!registered) {
                    handleCTA();
                  }
                }}
              >
                {registered
                  ? hasCampaign
                    ? 'Registered, see you there!'
                    : 'Thanks, we will be in touch!'
                  : 'Register Interest'}
              </button>
            </div>

            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Logo%20MG%20Sukhumvit%20OL-05-1.png?upscale=true&width=680&upscale=true&name=Logo%20MG%20Sukhumvit%20OL-05-1.png`}
              width={'170px'}
              className="p-2"
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Untitled%20design%20(3).png?upscale=true&width=2400&upscale=true&name=Untitled%20design%20(3).png`}
              width={'100%'}
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/WhatsApp%20Image%202023-08-14%20at%2012.40.30%20PM.jpeg?upscale=true&width=2400&upscale=true&name=WhatsApp%20Image%202023-08-14%20at%2012.40.30%20PM.jpeg`}
              width={'100%'}
            />

            <div className="center-body">
              <hr
                style={{
                  width: '300px',
                  height: '1px',
                  background: '#000',
                }}
              />
            </div>
            <div
              style={{
                textAlign: 'center',
                paddingBottom: '30px',
              }}
            >
              <button
                type="button"
                className="btn-submit"
                style={{
                  cursor: 'pointer',
                  background: ' #a68561',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  fontWeight: '900',
                  fontFamily: 'Verdana',
                }}
                onClick={() => {
                  if (!registered) {
                    handleCTA();
                  }
                }}
              >
                {registered
                  ? hasCampaign
                    ? 'Registered, see you there!'
                    : 'Thanks, we will be in touch!'
                  : 'Register Interest'}
              </button>
            </div>

            <div className="center-body">
              <hr
                style={{
                  width: '300px',
                  height: '1px',
                  background: '#000',
                }}
              />
            </div>

            <p className="heading-p-2">Developed by</p>

            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/logo-mqdc.png?upscale=true&width=800&upscale=true&name=logo-mqdc.png`}
              width={'180px'}
            />

            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/30%20year.png?upscale=true&width=2400&upscale=true&name=30%20year.png`}
              width={'100%'}
            />

            <p className="simple-p pl-4 pr-4" style={{ fontSize: '12px' }}>
              Magnolia Quality Development Corporation Limited and MQDC's real
              estate companies, hereinafter referred to as the (“Company”) need
              your consent to collect, use, or disclose the personal data you
              have provided.
            </p>

            <div className="center-body">
              <hr
                style={{
                  width: '300px',
                  height: '1px',
                  background: '#000',
                }}
              />
            </div>
          </section>
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/G-icon_Gold.png?upscale=true&width=200&upscale=true&name=G-icon_Gold.png`}
              width={'100px'}
            />
          </div>
          <h3 className="heading-2s mt-2">SINGAPORE</h3>
          <p className="ppp2">
            One Global Property Services (Singapore) Pte Ltd
            <br />
            Estate Agent Licence No.: L3010793D
            <br />
            T:{' '}
            <a href="https://api.whatsapp.com/send?phone=6586149874&text=Hi%21%20I%27m%20interested%20to%20find%20out%20more%20about...&utm_campaign=%5BSG%5D%20TH%20%7C%20BKK%20%7C%20MQDC%20Sukhumvit%20Collection%2026-27%20August%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9a3BcAkKjcAB77y9I6iVFMzCfMjIT3McowjTyHhwt2eH_HVniNPIsvfadwO9aFT12Co5R6">
              (+65) 8614 9874
            </a>{' '}
            <br />
            E:{' '}
            <a href="mailto:salessg@ogpsglobal.com">salessg@ogpsglobal.com</a>
          </p>{' '}
          <section
            className=" container pt-1"
            style={{
              backgroundColor: '#000',
            }}
          >
            <p
              style={{
                fontSize: '9px',
                textAlign: 'justify',
                lineHeight: 1,
              }}
            >
              <div className="center-body">
                <img
                  src={`https://invest.ogpsglobal.com/hs-fs/hubfs/HubSpot%20banners%20(1920%20%C3%97%20720px)%20(7).png?upscale=true&width=1600&upscale=true&name=HubSpot%20banners%20(1920%20%C3%97%20720px)%20(7).png`}
                  style={{ height: 'auto', width: '80%' }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                  color: '#eeeeee',
                  lineHeight: '175%',
                  textAlign: 'justify',
                  fontWeight: 'normal',
                }}
              >
                Disclaimer: *Prices and details are correct at the time of
                publication and subject to changes. ^Incentives apply to select
                properties and subject to status and availability. Internal
                images are of a show apartment at SnowDog Village and are
                indicative only. This document has been prepared by One Global
                Property Services (Singapore) Pte Ltd. One Global Property
                Services makes no guarantees, representations or warranties of
                any kind, expressed or implied regarding the information
                including, but not limited to, warranties of content, accuracy
                and reliability. Any interested party should undertake their own
                research and due diligence as to the accuracy of the
                information. One Global Property Services excludes unequivocally
                all inferred or implied terms, conditions and warranties arising
                out of this document and excludes all liability or loss and
                damages arising therefrom. This publication is the copyrighted
                property of One Global Property Services and/or its licensor(s).
                © 2023. All rights reserved. Advisory Message: All overseas
                investments carry additional financial, regulatory and legal
                risks. Investors are advised to do necessary checks and research
                on the investment beforehand.
              </span>
            </p>

            <section className="iconss d-flex justify-content-center">
              <a
                href="https://www.facebook.com/ogpsglobal?utm_campaign=%5BSG%5D%20TH%20%7C%20BKK%20%7C%20MQDC%20Sukhumvit%20Collection%2026-27%20August%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9a3BcAkKjcAB77y9I6iVFMzCfMjIT3McowjTyHhwt2eH_HVniNPIsvfadwO9aFT12Co5R6"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://marketing.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/facebook_circle_black.png"
                  alt="Facebook"
                  height="25"
                  valign="middle"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/ogpsglobal/?utm_campaign=%5BSG%5D%20TH%20%7C%20BKK%20%7C%20MQDC%20Sukhumvit%20Collection%2026-27%20August%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9a3BcAkKjcAB77y9I6iVFMzCfMjIT3McowjTyHhwt2eH_HVniNPIsvfadwO9aFT12Co5R6"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://marketing.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/linkedin_circle_black.png"
                  alt="LinkedIn"
                  height="25"
                  valign="middle"
                />
              </a>
              <a
                href="https://www.instagram.com/ogpsglobal/?utm_campaign=%5BSG%5D%20TH%20%7C%20BKK%20%7C%20MQDC%20Sukhumvit%20Collection%2026-27%20August%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9a3BcAkKjcAB77y9I6iVFMzCfMjIT3McowjTyHhwt2eH_HVniNPIsvfadwO9aFT12Co5R6"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://marketing.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/instagram_circle_black.png"
                  alt="Instagram"
                  height="25"
                  valign="middle"
                />
              </a>
            </section>
          </section>
        </section>
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 'normal',
            textDecoration: 'none',
            fontStyle: 'normal',
            color: '#23496d',
            direction: 'lrt',
            padding: '30px',
          }}
        >
          One Global Group (SG), 127 Devonshire Road, Singapore, Singapore
          239885 239885
        </p>
      </main>
    );
  },
);
