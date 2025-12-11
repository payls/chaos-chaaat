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
        <section style={{ background: '#1C2F40' }}>
          <div style={{ background: '#000' }}>
            <div className="d-flex justify-content-center ">
              <img
                src={
                  'https://marketing.ogpsglobal.com/hs-fs/hubfs/One%20Global%20Group%20-%20Logo%20Bar-02-2.png?upscale=true&width=2400&upscale=true&name=One%20Global%20Group%20-%20Logo%20Bar-02-2.png'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
          <img
            src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Vision%20Point%20eDM%20Sept%202023%20(600%20%C3%97%202400px)-1.png?upscale=true&width=2400&upscale=true&name=Vision%20Point%20eDM%20Sept%202023%20(600%20%C3%97%202400px)-1.png`}
            style={{ height: 'auto', width: '100%' }}
          />
          <div>
            <div
              style={{
                textAlign: 'center',
                paddingBottom: '20px',
                paddingTop: '20px',
              }}
            >
              <button
                type="button"
                className="btn-submit"
                style={{
                  cursor: 'pointer',
                  background: ' #fff',
                  border: 'none',
                  color: '#1C2F40',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  fontWeight: '900',
                  fontFamily: 'Verdana',
                  margin: '0px',
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
          </div>
          <div className="center-body">
            <hr
              style={{
                width: '95%',
                height: '5px',
                background: '#fff',
              }}
            />
          </div>
          <h3
            className="heading-2 mt-2"
            style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}
          >
            SPEAK WITH US TO FIND OUT MORE
          </h3>
          <p className="ppp" style={{ color: '#fff' }}>
            One Global Property Services (Hong Kong) Limited
            <br />
            BA Registration No.: 69941304-000
            <br />
            T:{' '}
            <a
              style={{ color: '#fff' }}
              href="https://api.whatsapp.com/send?phone=85259752233&text=Hi%21%20I%27m%20interested%20in....&utm_campaign=%5BHK%5D%20%7C%20UK%20%7C%20Manchester%20Collection%20%7C%20General&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz--u2v_v7zSYiskfQp3FyPLqIJO3cRTl03bG6MakaCcIUMxfpiGtRHXqidKSPs4i3tJXST-H"
            >
              (+852) 5975 2233
            </a>{' '}
            <br />
            E:{' '}
            <a href="mailto:saleshk@ogpsglobal.com" style={{ color: '#fff' }}>
              saleshk@ogpsglobal.com
            </a>
          </p>{' '}
          <div className="center-body">
            <hr
              style={{
                width: '95%',
                height: '3px',
                background: '#fff',
              }}
            />
          </div>
          <div className="d-flex justify-content-between pr-3 pl-3 pb-3 fwlogo">
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Visiondevelop%20logo-1.jpg?upscale=true&width=600&upscale=true&name=Visiondevelop%20logo-1.jpg`}
              height={'50px'}
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/One%20Global%20Group%20Logo%20with%20Icon_White-1.png?upscale=true&width=1040&upscale=true&name=One%20Global%20Group%20Logo%20with%20Icon_White-1.png`}
              height={'50px'}
            />
          </div>
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
                Disclaimer: Approved Planning Application No.: 2021/1682 by
                London Borough of Wandsworth. Computer-generated images are
                indicative only. *Prices and details correct at time of issue
                and subject to changes. ^Journey times are approximate and
                sourced from Google Maps & www.tfl.co.uk. †The rental yield is
                for general reference only and not guaranteed. This email has
                been prepared by One Global Property Services (Singapore) Pte
                Ltd (CEA Licence No.: L3010793D, Co. Reg. No.: 201715336R) & One
                Global Property Services (Hong Kong) Ltd (Certification No.
                69941304-00-10-18-A) for advertising and general reference only.
                One Global Property Services makes no guarantees,
                representations, or warranties of any kind, expressed or implied
                regarding the information including, but not limited to,
                warranties of content, accuracy, and reliability. Any interested
                party should undertake their own research and due diligence as
                to the accuracy of the information. One Global Property Services
                excludes unequivocally all inferred or implied terms,
                conditions, and warranties arising out of this document and
                exclude all liability or loss and damages arising therefrom. One
                Global Property Services (Hong Kong) Ltd and our representatives
                only work in relation to real estate located outside Hong Kong.
                Neither One Global Property Services nor its representatives are
                licensed under the Estate Agents Ordinance (Cap. 511 of the Laws
                of Hong Kong) to deal with Hong Kong real estate (nor are we
                required to be so licensed). Neither One Global Property
                Services nor its representatives hold them out to perform any
                regulated activities in Hong Kong under the corporate brand of
                One Global Property Services such as advising on dealing or
                advising on securities or providing asset management services or
                any other incidental regulated activities. Advisory Message: All
                overseas investments carry additional financial, regulatory, and
                legal risks, investors are advised to do the necessary checks
                and research on the investment beforehand. Learn more about this
                on our website. All content © Copyright 2022 One Global Property
                Services. All rights reserved.
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
