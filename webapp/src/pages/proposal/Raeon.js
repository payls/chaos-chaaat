import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import { config } from '../../configs/config';
import constant from '../../constants/constant.json';
import CommonCarousel from '../../components/Common/CommonCarousel';

export default React.memo(
  ({
    agencyUser,
    shortlistedProject,
    translate,
    setLoading,
    contact,
    shouldTrackActivity,
    reloadShortlistedProjects,
    project,
    customStyle,
  }) => {
    console.log(project);
    const [registered, setRegistered] = useState(false);
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
        setRegistered(true);
        h.general.customizedAlert('success ', {
          message: 'Thank you for your registration!',
          cl: 'raeon',
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
        if (apiRes.data.hasCampaign === true) {
          setRegistered(apiRes.clicked);
        }
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

        h.general.customizedAlert('success ', {
          message:
            'Thank you for your interest, you will hear back from the agent shortly!',
          cl: 'raeon',
        });
      }
    };

    return (
      <main id="raeon-root">
        <div style={{ background: '#fff' }}>
          <div className="d-flex justify-content-center container">
            <img
              src={'https://www.rae-on.com/wp-content/uploads/2022/06/logo.svg'}
              alt="Pave"
              className="logo-raeon"
              width={'20%'}
            />
          </div>
        </div>
        <div
          style={{
            padding: ' 25px',

            width: '100%',
          }}
          className="banner-img "
        ></div>

        <section className="header-1">
          <div className="container grid3 pt-4 d-flex flex-row gap-2 mb-3">
            <div className="lft">
              <div className="project-top__left">
                <label className="country">Australia</label>
                <h1>The Canopy</h1>
                <h2
                  className="d-flex align-items-center"
                  style={{ gap: '0.3em' }}
                >
                  <span>From</span>
                  <span>AUD</span>471,000{' '}
                </h2>
                <div className="project-top__left--content"></div>
              </div>
            </div>
            <div className="project-top__center lft">
              <ul>
                <li>
                  <label>City</label>
                  <div>Melbourne</div>
                </li>
                <li>
                  <label>Location</label>
                  <div>South Melbourne</div>
                </li>
                <li>
                  <label>Size</label>
                  <div className="property-unit">
                    <span className="property-unit__form">
                      59.6 - 126.5(m²) / 635.07 - 1356.25 (ft²)
                    </span>{' '}
                  </div>
                </li>
                <li>
                  <label>No of Bedrooms</label>
                  <div>1-3</div>
                </li>
                <li>
                  <label>Type</label>
                  <div>Apartment</div>
                </li>
                <li>
                  <label>Completion date</label>
                  <div>Under Construction</div>
                </li>
                <li>
                  <label>Target Completion Date</label>
                  <div>2025</div>
                </li>
              </ul>
            </div>
            <div className=" form lft">
              <div
                style={{ backgroundColor: '#39C3F1', textAlign: 'center' }}
                className="p-4"
              >
                <h3
                  className="mb-5"
                  style={{
                    fontSize: '20px',
                  }}
                >
                  {hasCampaign
                    ? `Let us know if you can attend the session and we'll
                    pre-register you.`
                    : `Let us know if you are interested, and we will get in touch with you.`}
                </h3>
                {hasCampaign && (
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
                          ? 'Registered, see you there!'
                          : 'Yes, see you there!'}
                      </button>
                    </div>
                  </div>
                )}
                {!hasCampaign && (
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
                          ? 'Thanks, we will be in touch!'
                          : 'Register Interest'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="header-1 container">
          <div className="project-content__body">
            <p>【項目亮點】</p>
            <table
              style={{
                borderCollapse: 'collapse',
                width: '100%',
                height: '216px',
              }}
            >
              <tbody>
                <tr style={{ height: '56px' }}>
                  <td style={{ width: '9.89848%', height: '56px' }}>
                    潛力地段
                  </td>
                  <td style={{ width: '90.1015%', height: '56px' }}>
                    <p>
                      位處South Melbourne，市內大型重建項目Neighbouring
                      Fishermans
                      Bend地段，租金逆市升5.1%，回報率達4.8%，租務市場熾熱，一盤難求。
                    </p>
                  </td>
                </tr>
                <tr style={{ height: '56px' }}>
                  <td style={{ width: '9.89848%', height: '56px' }}>
                    交通方便
                  </td>
                  <td style={{ width: '90.1015%', height: '56px' }}>
                    <p>
                      舉步即達電車站，輕鬆通往墨爾本市內各區，5分鐘即達Port
                      Melbourne Beach，6分鐘到Crown
                      Casino，10分鐘返回墨爾本CBD，12分鐘步行至著名的South
                      Melbourne Market。
                    </p>
                  </td>
                </tr>
                <tr style={{ height: '56px' }}>
                  <td style={{ width: '9.89848%', height: '56px' }}>
                    優美環境
                  </td>
                  <td style={{ width: '90.1015%', height: '56px' }}>
                    <p>
                      項目可眺望Port Phillip
                      Bay，屋苑樓下即達佔地近3,000平方米的全新公園Johnson Street
                      park，前往附近的Albert Park Lake及Royal Botanic
                      Gardens都非常方便。
                    </p>
                  </td>
                </tr>
                <tr style={{ height: '24px' }}>
                  <td style={{ width: '9.89848%', height: '24px' }}>
                    一級教育
                  </td>
                  <td style={{ width: '90.1015%', height: '56px' }}>
                    <p>
                      屋苑附近擁有優質學府，包括：South Melbourne Primary
                      School、Port Melbourne Primary School、Melbourne Grammar
                      School、The Mac.Robertson Girls’High
                      School等等，10分鐘車程即達著名大學University of
                      Melbourne及RMIT。
                    </p>
                  </td>
                </tr>
                <tr style={{ height: '24px' }}>
                  <td style={{ width: '9.89848%', height: '24px' }}>
                    高性價比
                  </td>
                  <td style={{ width: '90.1015%', height: '56px' }}>
                    <p>
                      項目首期僅需5%，以約2.4萬澳元的超值首期價錢，即可入手一個600多呎的單位，性價比極高。
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: ' 9.89848%' }}>實力打造</td>
                  <td style={{ width: '90.1015%' }}>
                    <p>
                      由著名發展商Gamuda
                      Land實力打造，屋苑推崇可持續發展，採用融入自然的設計，為住戶提供舒適居住環境。精美會所設施包括：天台花園、水療設施、戶外庭園、燒烤區等等。
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {project &&
          project.project_media &&
          project.project_media.length > 0 && (
            <section className="container mb-3 mt-5">
              <CommonCarousel
                customStyle={customStyle}
                translate={translate}
                key={`propject-carousel-raeon`}
                shouldTrackActivity={shouldTrackActivity}
                activityTracker={async (activity, metaData) => {
                  await handleTracker(activity, metaData);
                }}
                projectLevel={true}
                items={project.project_media
                  .filter((f) => f.url)
                  .sort((a, b) => {
                    if (a.display_order && b.display_order) {
                      return a.display_order - b.display_order;
                    }
                    return (
                      new Date(a.created_date_raw) -
                      new Date(b.created_date_raw)
                    );
                  })
                  .map((media, index) => ({
                    src: h.general.formatUrl(media.url),
                    alt: media.title,
                    description: null,
                    media_type: media.type,
                    thumbnail_src: media.thumbnail_src,
                    tag: media.project_media_tags.reduce((prev, curr) => {
                      return [...prev, curr.tag];
                    }, []),
                    is_hero_image: media.is_hero_image,
                    display_order: media.display_order,
                  }))}
                enabledTags={{
                  image: true,
                  floor_plan: true,
                  video: true,
                  brochure: true,
                  factsheet: true,
                  render_3d: true,
                }}
              />
            </section>
          )}
        <div
          style={{ background: '#fff' }}
          className="py-3 container project-map"
        >
          <div>
            <h2 class="section__heading" style={{ textAlign: 'center' }}>
              <span>Location</span>
            </h2>
            <h4>272 Normanby Road, South Melbourne 維多利亞省澳洲</h4>
            <iframe
              className="mt-2 mb-1 map-loc"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '5px' }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1575.6530509121214!2d144.94573081195648!3d-37.829719221863265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad667f6cf4f1725%3A0xc457174b2aedf706!2s272%20Normanby%20Rd%2C%20South%20Melbourne%20VIC%203205%2C%20Australia!5e0!3m2!1sen!2sus!4v1677468729716!5m2!1sen!2sus&key=${config.google.apiKey}`}
            ></iframe>
          </div>
        </div>

        <section className="enquire-wrapper">
          <div className="container enquire d-flex justify-content-center align-items-center flex-row">
            <div>
              <h2>Enquiry now</h2>
            </div>
            <div class="footer-top__whatsapp active">
              <h3>Whatsapp</h3>
              <a
                href="https://api.whatsapp.com/send/?phone=85291682585&amp;text=%E3%80%90%E6%88%91%E5%BE%9ERaeon+Website%E7%9C%8B%E5%88%B0%E6%B5%B7%E5%A4%96%E6%A8%93%E7%9B%A4%E8%B3%87%E8%A8%8A%EF%BC%8C%E6%83%B3%E9%80%B2%E4%B8%80%E6%AD%A5%E6%9F%A5%E8%A9%A2%E7%89%A9%E6%A5%AD%E8%A9%B3%E6%83%85%E3%80%91&amp;type=phone_number&amp;app_absent=0"
                target="_blank"
              >
                9168 2585
              </a>
            </div>
            <div class="footer-top__email">
              <h3>Email</h3>
              <a href="mailto:info@rae-on.com">info@rae-on.com</a>
            </div>
          </div>
        </section>

        <section
          className="subscribe-wrapper"
          style={{
            background: '#39C3F1',
            paddingTop: '64px',
            paddingBottom: '64px',
            fontSize: ' 1.19rem',
          }}
        >
          <div className=" d-flex  justify-content-center align-items-center">
            <div className="lft">
              <img
                src={
                  'https://www.rae-on.com/wp-content/themes/reactdigisystem/assets/images/big-logo.svg'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
        </section>
        <div style={{ background: '#39C3F1', padding: '30px' }}>
          <div className="container footer-raeon">
            <hr style={{ borderTop: '1px solid #fff' }} />
            <div className="d-flex flex-wrap">
              <div class="footer__logo col-lg-6 col-xl-3 border-lg-end border-white px-xl-5 mb-5 mb-xl-0">
                <a href="/" class="">
                  <img
                    width="202"
                    height="62"
                    src="https://www.rae-on.com/wp-content/uploads/2022/06/logo-white.svg"
                    alt="買外國樓搵利安：Raeon International"
                  />
                </a>
              </div>
              <div class="address-col col-lg-6 col-xl-3 mb-5 mb-xl-0 ps-xl-5">
                <a
                  href="tel:852 3689 9122"
                  class="d-inline-flex align-items-center text-white mb-2"
                  style={{ fontFamily: 'Futura Medium', fontSize: '19px' }}
                >
                  <svg
                    className="mr-2"
                    width="14"
                    height="19"
                    viewBox="0 0 14 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.99999 18.2802C4.11999 16.6402 0.0899903 11.4002 -9.70031e-06 5.27023C-0.0200097 4.13023 0.11999 3.01023 0.38999 1.91023C0.47999 1.55023 0.68999 1.25023 1.00999 1.05023C1.42999 0.790228 1.84999 0.520228 2.28999 0.270228C2.92999 -0.0897723 3.58999 -0.0897723 4.22999 0.280228C4.97999 0.730228 5.34999 1.40023 5.36999 2.27023C5.37999 2.93023 5.41999 3.58023 5.41999 4.24023C5.41999 4.98023 5.09999 5.56023 4.47999 5.96023C4.22999 6.12023 3.97999 6.27023 3.72999 6.42023C3.62999 6.47023 3.59999 6.53023 3.59999 6.64023C3.79999 9.58023 5.15999 11.8102 7.65999 13.3602C7.77999 13.4302 7.86999 13.4402 7.98999 13.3602C8.20999 13.2102 8.43999 13.0802 8.66999 12.9402C9.33999 12.5502 10.03 12.5302 10.71 12.8902C11.32 13.2102 11.92 13.5502 12.52 13.8902C13.33 14.3402 13.8 15.3202 13.62 16.2302C13.51 16.7602 13.24 17.2002 12.76 17.4802C12.37 17.7202 11.97 17.9502 11.59 18.2002C11.17 18.4702 10.73 18.4802 10.27 18.3702C10.18 18.3402 10.09 18.3102 9.99999 18.2802Z"
                      fill="white"
                    ></path>
                  </svg>{' '}
                  852 3689 9122
                </a>
                <p
                  class="mb-0"
                  style={{
                    fontFamily: 'Futura Medium',
                    fontSize: '16px',
                    color: '#fff',
                  }}
                >
                  21/F, Sugar+, 25-31 Sugar Street, Causeway Bay, HK
                </p>
              </div>
              <div class="col-lg-6 col-xl-3 mb-5 mb-lg-0">
                <p
                  class="mb-2 mb-lg-4"
                  style={{
                    fontFamily: 'Futura Medium',
                    fontSize: '19px',
                    color: '#fff',
                  }}
                >
                  An associate of
                </p>
                <a href="https://www.fecil.com.hk/">
                  <img
                    width="218"
                    height="36"
                    src="https://www.rae-on.com/wp-content/uploads/2022/06/fec-logo.svg"
                    alt=""
                  />
                </a>
              </div>
              <div class="col-lg-6 col-xl-3">
                <p
                  class="mb-3 mb-lg-4"
                  style={{
                    fontFamily: 'Futura Medium',
                    fontSize: '19px',
                    color: '#fff',
                  }}
                >
                  Follow Us
                </p>
                <ul class="list-socials justify-content-center justify-content-xl-start">
                  <li>
                    <a
                      href="https://www.facebook.com/raeonintl"
                      target="blank"
                      class="ms-4"
                    >
                      <img
                        width="46"
                        height="46"
                        src="https://www.rae-on.com/wp-content/themes/reactdigisystem/assets/images/face-icon.svg"
                        alt="Face icon"
                      />
                    </a>
                  </li>
                  <li class="check_robot_whatsapp active">
                    <a
                      href="https://api.whatsapp.com/send/?phone=85291682585&amp;text=%E3%80%90%E6%88%91%E5%BE%9ERaeon+Website%E7%9C%8B%E5%88%B0%E6%B5%B7%E5%A4%96%E6%A8%93%E7%9B%A4%E8%B3%87%E8%A8%8A%EF%BC%8C%E6%83%B3%E9%80%B2%E4%B8%80%E6%AD%A5%E6%9F%A5%E8%A9%A2%E7%89%A9%E6%A5%AD%E8%A9%B3%E6%83%85%E3%80%91&amp;type=phone_number&amp;app_absent=0"
                      target="_blank"
                      class="ms-4"
                    >
                      <img
                        width="46"
                        height="44"
                        src="https://www.rae-on.com/wp-content/themes/reactdigisystem/assets/images/ws-icon.svg"
                        alt="Whatsapp icon"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/raeonintl/"
                      target="blank"
                      class="ms-4"
                    >
                      <img
                        width="46"
                        height="46"
                        src="https://www.rae-on.com/wp-content/themes/reactdigisystem/assets/images/ig-icon.svg"
                        alt="IG icon"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/channel/UC6TGoSI9w4cCIo7RFfesNZA"
                      target="blank"
                      class="ms-4"
                    >
                      <img
                        width="46"
                        height="44"
                        src="https://www.rae-on.com/wp-content/themes/reactdigisystem/assets/images/youtube-icon.svg"
                        alt="Youtube icon"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  },
);
