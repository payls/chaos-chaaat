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
      <main id="invest-ogps-expat-root" className="personal">
        <section>
          <div style={{ background: '#000' }}>
            <div className="d-flex justify-content-center container">
              <img
                src={
                  'https://marketing.ogpsglobal.com/hs-fs/hubfs/One%20Global%20Group%20-%20Logo%20Bar-02.png?upscale=true&width=2400&upscale=true&name=One%20Global%20Group%20-%20Logo%20Bar-02.png'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
          <img
            src={
              'https://marketing.ogpsglobal.com/hs-fs/hubfs/eDM.jpg?upscale=true&width=2400&upscale=true&name=eDM.jpg'
            }
            alt="Pave"
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
              className="btn-submit mt-3"
              style={{
                cursor: 'pointer',
                background: 'rgb(210 71 5)',
                border: 'none',
                color: '#fff',
                padding: '10px 30px',
                borderRadius: '30px',
                fontWeight: '700',
                fontFamily: 'Verdana',
                fontSize: '25px',
                textTransform: 'uppercase',
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
            src={
              'https://cdn.yourpave.com/landing_pages/ogps/Screenshot+2023-08-31+at+5.52.10+PM.png'
            }
            alt="Pave"
            width={'100%'}
          />
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr />
          </section>
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/G-icon_Gold.png?upscale=true&width=200&upscale=true&name=G-icon_Gold.png`}
              width={'100px'}
            />
          </div>
          <h3 className="heading-2s mt-2">
            SPEAK WITH OUR TEAM TO FIND OUT MORE
          </h3>
          <div className="d-flex flex-wrap ffwa">
            <div>
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
                <a href="mailto:salessg@ogpsglobal.com">
                  salessg@ogpsglobal.com
                </a>
              </p>{' '}
            </div>
            <div>
              <h3 className="heading-2s mt-2">HONG KONG</h3>
              <p className="ppp2">
                One Global Property Services (Hong Kong) Limited
                <br />
                BA Registration No.: 69941304-000
                <br />
                T:{' '}
                <a href="https://api.whatsapp.com/send?phone=85259752233&text=Hi%21%20I%27m%20interested%20in....&utm_campaign=%5BSG%5D%20UK%20%7C%20London%20%7C%20EDM%20%7C%20Barratt%20Collection%20%7C%202%20-%203%20September%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9Zvv2QqqCXb09gHsjZtPUV6goRL4RC_xtTAOcwxDeIPe9g_IbBub3yikjTDJDObowXsv4h">
                  (+852) 5975 2233
                </a>{' '}
                <br />
                E:{' '}
                <a href="mailto:saleshk@ogpsglobal.com">
                  saleshk@ogpsglobal.com
                </a>
              </p>{' '}
            </div>
            <div>
              <h3 className="heading-2s mt-2">MALAYSIA</h3>
              <p className="ppp2">
                One Global Property Services (Malaysia)
                <br />
                BOVAEA Reg. No.: VEPM (3) 0259
                <br />
                T:{' '}
                <a href="https://api.whatsapp.com/send?phone=60162080718&text=Hi%21%20I%27m%20interested%20in...&utm_campaign=%5BSG%5D%20UK%20%7C%20London%20%7C%20EDM%20%7C%20Barratt%20Collection%20%7C%202%20-%203%20September%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9Zvv2QqqCXb09gHsjZtPUV6goRL4RC_xtTAOcwxDeIPe9g_IbBub3yikjTDJDObowXsv4h">
                  (+60) 16 2080718
                </a>{' '}
                <br />
                E:{' '}
                <a href="mailto:enquiryMY@ogpsglobal.com">
                  enquiryMY@ogpsglobal.com
                </a>
              </p>{' '}
            </div>
            <div>
              <h3 className="heading-2s mt-2">UNITED KINGDOM</h3>
              <p className="ppp2">
                One Global Property Services (UK) Limited
                <br />
                Company number 12012364
                <br />
                T:{' '}
                <a href="https://www.ogpsglobal.com/contact-us?utm_campaign=%5BSG%5D%20UK%20%7C%20London%20%7C%20EDM%20%7C%20Barratt%20Collection%20%7C%202%20-%203%20September%202023&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9Zvv2QqqCXb09gHsjZtPUV6goRL4RC_xtTAOcwxDeIPe9g_IbBub3yikjTDJDObowXsv4h">
                  (+44) 0 121 517 1092
                </a>{' '}
                <br />
                E:{' '}
                <a href="mailto:enquiryUK@ogpsglobal.com">
                  enquiryUK@ogpsglobal.com
                </a>
              </p>{' '}
            </div>
          </div>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr />
          </section>
          <section className=" container ">
            <p
              style={{
                fontSize: '9px',
                textAlign: 'justify',
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                  color: '#414141',
                }}
              >
                Disclaimer: Planning Application No.: H/01054/13 granted by
                London Borough of Barnet. Computer-generated images are
                indicative only. This email has been prepared by One Global
                Property Services (Singapore) Pte Ltd (CEA Licence No.:
                L3010793D, Co. Reg. No.: 201715336R) & One Global Property
                Services (Hong Kong) Ltd (Certification No. 69941304-00-10-18-A)
                for advertising and general reference only. One Global Property
                Services makes no guarantees, representations, or warranties of
                any kind, expressed or implied regarding the information
                including, but not limited to, warranties of content, accuracy,
                and reliability. Any interested party should undertake their own
                research and due diligence as to the accuracy of the
                information. One Global Property Services excludes unequivocally
                all inferred or implied terms, conditions, and warranties
                arising out of this document and excludes all liability or loss
                and damages arising therefrom. One Global Property Services
                (Hong Kong) Ltd and our representatives only work in relation to
                real estate located outside Hong Kong. Neither One Global
                Property Services nor its representatives are licensed under the
                Estate Agents Ordinance (Cap. 511 of the Laws of Hong Kong) to
                deal with Hong Kong real estate (nor are we required to be so
                licensed). Neither One Global Property Services nor its
                representatives hold them out to perform any regulated
                activities in Hong Kong under the corporate brand of One Global
                Property Services such as advising on dealing or advising on
                securities or providing asset management services or any other
                incidental regulated activities. Advisory Message: All overseas
                investments carry additional financial, regulatory, and legal
                risks, investors are advised to do the necessary checks and
                research on the investment beforehand. Learn more about this on
                our website. All content © Copyright 2022 One Global Property
                Services (Singapore) Pte Ltd. All rights reserved.
              </span>
            </p>
            <p
              style={{
                fontSize: '10px',
                textAlign: 'justify',
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                  color: '#414141',
                }}
              >
                All content © Copyright 2023 One Global Property Services. All
                rights reserved.
              </span>
            </p>
            <section className="iconss d-flex justify-content-center">
              <a
                href="https://www.facebook.com/ogpsglobal?utm_campaign=%5BOGExpat%5D%20UK%20%7C%20Sutton%20Coldfield%20%7C%20The%20Old%20Art%20School%20%7C%20General&amp;utm_source=hs_email&amp;utm_medium=email&amp;_hsenc=p2ANqtz-9oEja_tlgAvOWcgoEzK94KTnNE_vg0WAoK5ppiVVAcR3VTymYqNwKotRBgjb7Dev0kaiAe"
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
                href="https://www.linkedin.com/company/18816557?utm_campaign=%5BOGExpat%5D%20UK%20%7C%20Sutton%20Coldfield%20%7C%20The%20Old%20Art%20School%20%7C%20General&amp;utm_source=hs_email&amp;utm_medium=email&amp;_hsenc=p2ANqtz-9oEja_tlgAvOWcgoEzK94KTnNE_vg0WAoK5ppiVVAcR3VTymYqNwKotRBgjb7Dev0kaiAe"
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
                href="https://www.instagram.com/ogpsglobal/?utm_campaign=%5BOGExpat%5D%20UK%20%7C%20Sutton%20Coldfield%20%7C%20The%20Old%20Art%20School%20%7C%20General&amp;utm_source=hs_email&amp;utm_medium=email&amp;_hsenc=p2ANqtz-9oEja_tlgAvOWcgoEzK94KTnNE_vg0WAoK5ppiVVAcR3VTymYqNwKotRBgjb7Dev0kaiAe"
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
          239885
        </p>
      </main>
    );
  },
);
