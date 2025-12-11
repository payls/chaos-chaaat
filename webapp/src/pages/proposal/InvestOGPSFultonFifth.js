import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import SimpleSlider from './partials/SimpleSlider';

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
      <main id="invest-ogps-fulton-root">
        <div style={{ background: '#000' }}>
          <div className="d-flex justify-content-center container">
            <img
              src={'https://invest.ogpsglobal.com/hubfs/Hubspot%20Headers.png'}
              alt="Pave"
              width={'100%'}
            />
          </div>
        </div>
        <div
          style={{
            padding: ' 25px',
            width: '100%',
          }}
          className="banner-img "
        >
          <div className="container foot small">
            <div className=" pt-4 d-flex blck  flex-row gap-2">
              <div
                style={{ flexGrow: 2, flexBasis: 0 }}
                className="banner-info"
              >
                <h6>Welcome to</h6>
                <h1>FULTON & FIFTH</h1>

                <h6>An Extra Ordinary Living in Wembley.</h6>
                <p>
                  The Brookline consists of 1, 2, and 3-bedroom apartments. Each
                  apartment provides effortless living and makes the most of the
                  views across Wembley and the city of London. With warm and
                  cosy bedrooms, bathrooms with clean lines and elegant fixtures
                  and fully fitted kitchens to the highest specifications, The
                  Brookline is a place to call home.
                </p>

                <h5>Upcoming Event:</h5>
                <h6>13th May 2023 | 12 PM - 6 PM</h6>
                <h6>
                  269 South Bridge Road, Near Ann Siang Hill, Singapore 058818
                </h6>
              </div>
              <div style={{ flexGrow: 1, flexBasis: 0 }} className="lft">
                <div
                  style={{
                    backgroundColor: '#E6E2DC',
                    textAlign: 'center',
                    marginTop: '140px',
                  }}
                  className="p-4 act"
                >
                  <h3
                    className="mb-5"
                    style={{
                      fontSize: '20px',
                      fontFamily: "'Book Antiqua', Palatino, Georgia, serif",
                    }}
                  >
                    {hasCampaign
                      ? `Let us know if you can attend the session and we'll
                    pre-register you.`
                      : `Let us know if you are interested, and we will get in touch with you.`}
                  </h3>
                  <div className="hs_submit hs-submit">
                    <div className="actions">
                      <button
                        type="button"
                        className="btn-submit"
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className=" container small py-3 d-flex text-img">
          <div>
            <h1>A NEW COMMUNITY BURSTING WITH LIFE</h1>
            <p>
              Set alongside the meandering Wealdstone Brook in Wembley Park,
              Fulton & Fifth is a neighbourhood like no other. Over 800 new
              homes spread over five apartment blocks, that sit amongst
              landscaped gardens, paved walkways and a new green corridor, while
              a series of retail units, shopfronts and workspaces will be home
              to local creatives, artisans and independent businesses.
            </p>
          </div>
          <div>
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/Web_4098_Fulton-and-Fifth_104_Green-Corridor.jpg?width=1268&height=960&name=Web_4098_Fulton-and-Fifth_104_Green-Corridor.jpg`}
              width={'100%'}
            />
          </div>
        </section>

        <section className="container small">
          <img
            src={`https://invest.ogpsglobal.com/hubfs/Fulton%20Fifth%20_Wembley/Travel%20Journey.png`}
            width={'100%'}
          />
        </section>
        <section className=" container py-3 small">
          <h4 className="brown-title">Getting Around</h4>
          <p className="pgraph">
            Just a short walk from Fulton & Fifth, Wembley Park Underground
            Station gives you easy access into central London via the Jubilee
            and Metropolitan lines. Meanwhile, Wembley Central gets you straight
            onto the London Overground, Bakerloo Line and National Rail
            networks, meaning travel in and out of the city is always quick,
            easy and hassle-free.
          </p>
        </section>
        <section className=" container py-3 d-flex grid small">
          <div>
            <img
              src={`https://invest.ogpsglobal.com/hubfs/Fulton%20Fifth%20_Wembley/OGPS_Fulton%20%26%20Fifth_Digital%20Brochure_Page_20_Image_0001.png`}
              width={'100%'}
            />
          </div>
          <div>
            <h4 className="brown-title lft">Green Spaces At Your Doorstep</h4>
            <p className="pgraph lft">
              A treat for the senses, the selection of green courtyards, pocket
              parks and communal gardens at Fulton & Fifth are designed to bring
              people together, encourage connections and celebrate Wembley’s
              flora and fauna.
            </p>
          </div>
        </section>

        <section className=" container py-3 d-flex grid small">
          <div>
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/Web_4098_Fulton-and-Fifth_107_Podium.jpg?width=2000&height=2000&name=Web_4098_Fulton-and-Fifth_107_Podium.jpg`}
              width={'100%'}
            />
          </div>
          <div>
            <h4 className="brown-title lft">Podium Gardens</h4>
            <p className="pgraph lft">
              Fulton & Fifth is home to four podium gardens, each one accessible
              to all residents. The new landscaping, with a choice of quiet or
              more sociable seating areas, makes this an ideal place for
              connection and relaxation.
            </p>
          </div>
        </section>

        <section
          style={{ background: 'rgba(155, 76, 28, 1)', padding: ' 30px 90px' }}
        >
          <img
            src={`https://invest.ogpsglobal.com/hubfs/Fulton%20Fifth%20_Wembley/HubSpot%20banners%20(1920%20%C3%97%20720px)%20(25).png`}
            width={'100%'}
          />
        </section>
        <section className=" container py-3 d-flex text-img small">
          <div>
            <h1 style={{ textAlign: 'center' }}>
              10 Reasons to Invest in FULTON & FIFTH
            </h1>
          </div>
        </section>
        <section className=" container py-3 d-flex grid-3 flex-wrap small ">
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/4.png?width=160&height=80&name=4.png`}
            />
            <p>
              Wembley Park is one of the <b>largest regeneration</b> programs in
              the UK
            </p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/5.png?width=160&height=80&name=5.png`}
            />
            <p>
              The world-famous Wembley Stadium is a <b>7-min walk#</b> from
              Fulton & Fifth.
            </p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/6.png?width=160&height=80&name=6.png`}
            />
            <p>
              <b>High Benchmark for Capital Appreciation</b> (83.8% house prices
              growth over the last 10 years.)***
            </p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/7.png?width=160&height=80&name=7.png`}
            />
            <p>
              100% of Ofsted-rated schools within 1 mile of Wembley HA9 are
              rated outstanding.
            </p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/8.png?width=160&height=80&name=8.png`}
            />
            <p>
              Superb resident facilities, including the swimming pool and golf
              simulator on site.
            </p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/9.png?width=160&height=80&name=9.png`}
            />
            <p>
              Flexible payment terms at <b>5% on exchange**</b>
            </p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/10.png?width=160&height=80&name=10.png`}
            />
            <p>High tenancy rate for young professionals and students.</p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/13.png?width=160&height=80&name=13.png`}
            />
            <p>1st phase, 1st launch opportunity.</p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/11.png?width=160&height=80&name=11.png`}
            />
            <p>12-min# to Zone 1 London from Wembley Park tube station.</p>
          </div>
          <div>
            <img
              width={'80px'}
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Fulton%20Fifth%20_Wembley/12.png?width=160&height=80&name=12.png`}
            />
            <p>
              World-class shopping at the designer outlet mall is just a{' '}
              <b>9-min* walk.</b>
            </p>
          </div>
        </section>

        <section className=" container py-3 d-flex ">
          <p
            style={{
              fontSize: '10px',
              textAlign: 'justify',
              lineHeight: 1,
              paddingTop: '20px',
            }}
          >
            <span
              style={{
                fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                color: '#414141',
              }}
            >
              Disclaimer: Approved Planning No.: 21/2989 by London Borough of
              Brent. Computer-generated images are indicative only. This
              document has been prepared by One Global Property Services
              (Singapore) Pte Ltd & One Global Property Services (Hong Kong) Ltd
              for advertising and general reference only. One Global Property
              Services makes no guarantees, representations, or warranties of
              any kind, expressed or implied regarding the information
              including, but not limited to, warranties of content, accuracy,
              and reliability. Any interested party should undertake their own
              research and due diligence as to the accuracy of the information.
              One Global Property Services excludes unequivocally all inferred
              or implied terms, conditions, and warranties arising out of this
              document and exclude all liability or loss and damages arising
              therefrom. This publication is the copyrighted property of One
              Global Property Services and/or its licensor(s). © 2022. All
              rights reserved. Advisory Message: All overseas investments carry
              additional financial, regulatory, and legal risks. Investors are
              advised to do necessary checks and research on the investment
              beforehand.
            </span>
          </p>
        </section>

        <section className=" py-3" style={{ backgroundColor: '#000' }}>
          <div className="container">
            <div className=" pt-4 d-flex blck flex-row gap-2">
              <div style={{ flexGrow: 1, flexBasis: 0 }} className="lft">
                <p style={{ fontSize: '22px' }}>
                  <span style={{ color: '#a4825d' }}>
                    <span
                      style={{
                        fontFamily:
                          "Impact, Chicago, 'Arial Black', Arial, 'sans serif'",
                      }}
                    >
                      ONE GLOBAL GROUP
                    </span>
                  </span>
                </p>
                <p style={{ fontSize: '22px' }}>
                  <span style={{ color: '#a4825d' }}>
                    <span
                      style={{
                        fontFamily:
                          "Impact, Chicago, 'Arial Black', Arial, 'sans serif'",
                      }}
                    >
                      AN AWARD-WINNING BOUTIQUE REAL ESTATE AGENCY
                    </span>
                  </span>
                </p>
                <p style={{ fontSize: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: '#ffffff',
                    }}
                  >
                    One Global Group is the key resource connector for all
                    matters related to real estate for investors and owners
                    across the world. Our name evokes our dedication to an
                    all-encompassing service, a one-stop service point for an
                    investment property that bridges sales, leasing, finance,
                    interior design, furnishing, and property management. We are
                    proud to be a member of the Leading Real Estate Companies of
                    the World® (LeadingRE), a by-invite-only network platform,
                    and achieve its 'Rising Star Award' at its 2020 Global
                    Symposium that vets members based on performance, expertise
                    &amp; quality experience. We are also a holder of a 2020
                    International Property Award in the Real Estate Marketing
                    category.
                  </span>
                </p>
              </div>
              <div style={{ flexGrow: 1, flexBasis: 0, textAlign: 'center' }}>
                <img
                  src={
                    'https://invest.ogpsglobal.com/hs-fs/hubfs/637690493610196253.png?width=1200&height=1030&name=637690493610196253.png'
                  }
                  width={'80%'}
                  className="mt-3"
                />
              </div>
            </div>
          </div>
        </section>
        <section style={{ backgroundColor: 'rgba(230, 226, 220, 1)' }}>
          <div className="container foot">
            <div className=" pt-4 d-flex blck  flex-row gap-2">
              <div style={{ flexGrow: 1, flexBasis: 0 }} className="lft">
                <div style={{ lineHeight: 1.15 }}>
                  <span>
                    <a
                      href="https://www.ogpsglobal.com/disclaimer"
                      rel="noopener"
                      target="_blank"
                    >
                      Disclaimer
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      href="https://www.ogpsglobal.com/terms-conditions"
                      rel="noopener"
                      target="_blank"
                    >
                      Terms &amp; Conditions
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      href="https://www.ogpsglobal.com/privacy-policy"
                      rel="noopener"
                      target="_blank"
                    >
                      Privacy Policy
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      href="https://www.ogpsglobal.com/data-protection"
                      rel="noopener"
                      target="_blank"
                    >
                      Data Protection
                    </a>
                  </span>
                </div>
                <p
                  style={{
                    lineHeight: 1.15,
                    fontFamily: 'Montserrat,sans-serif !important',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    letterSpacing: 0,
                  }}
                >
                  <span>
                    © 2022. One Global Property Services (Singapore) Pte Ltd
                  </span>
                  <br />
                  <span>
                    Estate Agent Licence No.: L3010793D. All rights reserved.
                  </span>
                </p>
                <p
                  style={{
                    lineHeight: 1.15,
                    fontFamily: 'Montserrat,sans-serif !important',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    letterSpacing: 0,
                  }}
                >
                  Advisory Message: All overseas investments carry additional
                  financial, regulatory and legal risks; investors are advised
                  to do the necessary checks and research on the investment
                  beforehand.
                </p>
              </div>
              <div style={{ flexGrow: 1, flexBasis: 0 }}>
                <div className="focus_module_social_accounts">
                  <div className="focus_social_icons">
                    <a
                      className=""
                      href="https://www.facebook.com/ogpsglobal/"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067_"
                        className="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
                        data-hs-cos-general-type="widget"
                        data-hs-cos-type="icon"
                      >
                        <svg
                          version="1.0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 264 512"
                          aria-labelledby="facebook-f2"
                          role="img"
                        >
                          <title id="facebook-f2">Follow us on Facebook</title>
                          <g id="facebook-f2_layer">
                            <path d="M76.7 512V283H0v-91h76.7v-71.7C76.7 42.4 124.3 0 193.8 0c33.3 0 61.9 2.5 70.2 3.6V85h-48.2c-37.8 0-45.1 18-45.1 44.3V192H256l-11.7 91h-73.6v229"></path>
                          </g>
                        </svg>
                      </span>
                    </a>

                    <a
                      className=""
                      href="https://www.linkedin.com/company/one-global-property-service/"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067__2"
                        className="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
                        data-hs-cos-general-type="widget"
                        data-hs-cos-type="icon"
                      >
                        <svg
                          version="1.0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          aria-labelledby="linkedin-in3"
                          role="img"
                        >
                          <title id="linkedin-in3">Follow us on LinkedIn</title>
                          <g id="linkedin-in3_layer">
                            <path d="M100.3 480H7.4V180.9h92.9V480zM53.8 140.1C24.1 140.1 0 115.5 0 85.8 0 56.1 24.1 32 53.8 32c29.7 0 53.8 24.1 53.8 53.8 0 29.7-24.1 54.3-53.8 54.3zM448 480h-92.7V334.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V480h-92.8V180.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V480z"></path>
                          </g>
                        </svg>
                      </span>
                    </a>

                    <a
                      className=""
                      href="https://www.youtube.com/channel/UCHIuHQwu0x4J2aHPgOaxVRg/featured"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067__3"
                        className="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
                        data-hs-cos-general-type="widget"
                        data-hs-cos-type="icon"
                      >
                        <svg
                          version="1.0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 576 512"
                          aria-labelledby="youtube4"
                          role="img"
                        >
                          <title id="youtube4">Follow us on Twitter</title>
                          <g id="youtube4_layer">
                            <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                          </g>
                        </svg>
                      </span>
                    </a>

                    <a
                      className=""
                      href="https://www.instagram.com/ogpsglobal/"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067__4"
                        className="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
                        data-hs-cos-general-type="widget"
                        data-hs-cos-type="icon"
                      >
                        <svg
                          version="1.0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          aria-labelledby="instagram5"
                          role="img"
                        >
                          <title id="instagram5">Follow us on Instagram</title>
                          <g id="instagram5_layer">
                            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                          </g>
                        </svg>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  },
);
