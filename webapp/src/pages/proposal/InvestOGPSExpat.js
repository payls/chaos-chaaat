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
            <div className="d-flex justify-content-center container">
              <img
                src={
                  'https://marketing.ogpsglobal.com/hs-fs/hubfs/OGEXPAT/Hubspot%20Headers%20(3).png?upscale=true&width=2400&upscale=true&name=Hubspot%20Headers%20(3).png'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <h3 className="heading">EXCLUSIVE OPPORTUNITY</h3>
            <p className="heading-p">
              JUST 12 COMPLETED, TENANTED UNITS LOCATED IN THE ROYAL TOWN OF
              SUTTON COLDFIELD
            </p>

            <hr />
          </section>
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
          <section className="d-flex dflex" style={{ gap: '1em' }}>
            <div>
              <img
                src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/Hero%20v2%20The%20Old%20Art%20School.jpg?upscale=true&width=1000&upscale=true&name=Hero%20v2%20The%20Old%20Art%20School.jpg`}
                width={'100%'}
              />
            </div>
            <div>
              <label>Key facts</label>
              <ul>
                <li>Just 12 apartments</li>
                <li>Prices from £170k - £350k</li>
                <li>Tenants in place - yields from 4.8% - 6.8%</li>
              </ul>
            </div>
          </section>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr className="hr-2" />
          </section>
          <p className="heading-p">INVESTMENT HIGHLIGHTS</p>
          <img
            src={`https://marketing.ogpsglobal.com/hubfs/TOLA%20HERO%201.webp`}
            width={'100%'}
          />
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <ul>
              <li>Grade 2 listed building</li>
              <li>Beautifully renovated in 2020</li>
              <li>
                "Best of both worlds" Popular with Birmingham's executive elite
              </li>
              <li>
                Superb location, just a 4 minute walk to Sutton Coldfield train
                station, 25 minutes commute into Birmingham city centre
              </li>
              <li>
                2,400 acre Sutton Park nature reserve on your doorstep (just 5
                minute walk away). Cycling, hiking, dog walking, cafe's
              </li>
              <li>
                Exceptional school network: 3 minute walk to Bishop Vesey's
                state grammar school (ranked 1/outstanding by Ofsted
              </li>
              <li>Most affluent part of Birmingham</li>
              <li>
                Just a 10 minute drive to the world famous 'The Belfry' golf
                course (held the Ryder Cup 4 times).
              </li>
              <li>
                Close proximity to the town centre which includes all amenities
                (coffee shops, supermarkets)
              </li>
            </ul>
          </section>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr className="hr-2" />
          </section>
          <p className="heading-p">DEVELOPMENT KEY FACTS</p>
          <img
            src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/LoCATION%20THE%20OLD%20ART%20SCHOOL.png?upscale=true&width=2400&upscale=true&name=LoCATION%20THE%20OLD%20ART%20SCHOOL.png`}
            width={'100%'}
          />
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <ul>
              <li>Just 12 apartments</li>
              <li>Prices from £170k - £350k</li>
              <li>Renovated in 2020. Completed in 2021</li>
              <li>Most apartments come with professional tenants in situ.</li>
              <li>Yields between 4.8% - 6.8%</li>
              <li>Luxury finish with high spec appliances</li>
              <li>Double ceiling on most apartments for a loft style feel</li>
              <li>10 year build warranty (8 years remaining)</li>
              <li>150 year lease</li>
            </ul>
          </section>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr className="hr-2" />
          </section>
          <p className="heading-p">NEXT STEPS</p>

          <section className="d-flex dflex" style={{ gap: '1em' }}>
            <div>
              <p className="simple-p pl-2 pr-2">
                Given this is an off-market opportunity of only 12 apartments
                with an extremely strong investment case we expect a brisk
                takeup.
              </p>

              <div
                style={{
                  textAlign: 'center',
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
            </div>
            <div>
              <img
                src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/The%20Old%20Art%20School.jpg?upscale=true&width=1040&upscale=true&name=The%20Old%20Art%20School.jpg`}
                width={'100%'}
              />
            </div>
          </section>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr className="hr-2" />
          </section>
          <p className="heading-p">ONE GLOBAL EXPAT TEAM</p>
          <section className="d-flex  team">
            <div>
              <img
                src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/OGEXPAT/Landing%20Page%20graphics%20templates%20(8).png?upscale=true&width=640&upscale=true&name=Landing%20Page%20graphics%20templates%20(8).png`}
                width={'160px'}
              />
              <strong>John Treacy</strong>
              <small>Director</small>
            </div>
            <div>
              <img
                src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/OGEXPAT/Landing%20Page%20graphics%20templates%20(7).png?upscale=true&width=640&upscale=true&name=Landing%20Page%20graphics%20templates%20(7).png`}
                width={'160px'}
              />
              <strong>Siôn Bennett</strong>
              <small>Associate Director</small>
            </div>
          </section>
          <section style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <hr />
          </section>
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/G-icon_Gold.png?upscale=true&width=200&upscale=true&name=G-icon_Gold.png`}
              width={'100px'}
            />
          </div>
          <hr />

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
                Disclaimer: Computer-generated images are indicative only.
                *Prices and details correct at time of issue and subject to
                changes. ^Journey times are approximate and sourced from Google
                Maps & www.tfl.co.uk. This email has been prepared by One Global
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
                our website.
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
          One Global Property Services, 127 Devonshire Road, Singapore,
          Singapore 239885, Singapore
        </p>
      </main>
    );
  },
);
