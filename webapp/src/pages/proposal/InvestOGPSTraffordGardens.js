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
        <section style={{ background: '#000' }}>
          <div>
            <div className="">
              <img
                src={
                  'https://invest.ogpsglobal.com/hs-fs/hubfs/TG_OGHK_eDM2.png?upscale=true&width=2400&upscale=true&name=TG_OGHK_eDM2.png'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
          <div
            style={{
              textAlign: 'center',
              paddingBottom: '10px',
              paddingTop: '10px',
            }}
          >
            <button
              type="button"
              className="btn-submit"
              style={{
                cursor: 'pointer',
                background: ' #fff',
                border: 'none',
                color: '#000',
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
                width: '80%',
                height: '3px',
                background: '#fff',
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/G-icon_Gold.png?upscale=true&width=200&upscale=true&name=G-icon_Gold.png`}
              width={'100px'}
            />
          </div>
          <h3 className="heading-2s mt-2" style={{ color: '#fff' }}>
            SPEAK WITH OUR TEAM TO FIND OUT MORE
          </h3>
          <h3 className="heading-2s mt-2" style={{ color: '#fff' }}>
            HONG KONGE
          </h3>
          <p className="ppp2" style={{ color: '#fff' }}>
            One Global Property Services (Hong Kong) Limited
            <br />
            BA Registration No.: 69941304-000
            <br />
            T:{' '}
            <a
              href="https://api.whatsapp.com/send?phone=85259752233&text=Hi!%20I%27m%20interested%20in...."
              style={{ color: '#fff' }}
            >
              (+852) 5975 2233
            </a>{' '}
            <br />
            E:{' '}
            <a href="mailto:saleshk@ogpsglobal.com" style={{ color: '#fff' }}>
              saleshk@ogpsglobal.com
            </a>
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
                Disclaimer: @2023 One Global Property Services (Hong Kong) Ltd.
                Approved Planning Application: 101044/FUL/20 granted by Trafford
                Council. *Prices and details correct at time of issue and
                subject to changes. ΔJLL. ** Source: World Population
                Reviews。∞Sources: workplaceinsight.net。# Estimated yield is
                for general reference only and is not guaranteed. +Source:
                Dataloft, Centre of Cities。^Journey times are approximate and
                sourced from Google Maps and TFGM. Computer-generated images are
                indicative only. One Global Property Services (Hong Kong) Ltd
                and our representatives only work in relation to real estate
                located outside Hong Kong. Neither One Global Property Services
                nor its representatives is licensed under the Estate Agents
                Ordinance (Cap. 511 of the Laws of Hong Kong) to deal with Hong
                Kong real estate (nor are we required to be so licensed).
                Neither One Global Property Services nor its representatives
                hold them out to perform any regulated activities in Hong Kong
                under the corporate brand of One Global Property Services such
                as advising on dealing or advising on securities or providing
                asset management services or any other incidental regulated
                activities.
              </span>
            </p>

            <section className="iconss d-flex justify-content-center">
              <a
                href="https://www.facebook.com/oneglobalhk"
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
                href="https://www.linkedin.com/company/18816557"
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
                href="https://www.instagram.com/ogpsglobal/"
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
              <a
                href="https://www.youtube.com/channel/UCHkW4Va0drN0PkJEWp4gbTA"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://invest.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/youtube_circle_black.png"
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
