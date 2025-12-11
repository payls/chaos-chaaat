import React from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
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
    customStyle,
    project,
  }) => {
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
      await handleTracker(
        constant.CONTACT.ACTIVITY.TYPE.MORE_PROPERTY_REQUESTED,
        {},
      );

      const apiRes = await api.shortlistedProject.enquireShortlistedProject(
        {
          shortlisted_project_id: shortlistedProject.shortlisted_project_id,
        },
        false,
      );
      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message: '感謝您的關注，您很快就會收到代理的回复！',
        });
      }
    };

    return (
      <main id="invest-ogps-sth-root">
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
        ></div>

        <section className="header-1 bg-green p-4 my-2">
          <div className="container invest-ogps-sth-container px-5 green-b">
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'normal',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                }}
              >
                澳洲墨爾本熱賣樓盤隆重登場
              </span>
            </h2>
            <div
              className="container pt-4 d-flex flex-row gap-2"
              style={{
                lineHeight: '1.5',
                fontSize: '16px',
                color: '#FFFFFF',
              }}
            >
              <div className="lft" style={{ width: '55%', marginTop: '80px' }}>
                <span
                  style={{
                    fontFamily: 'Helvetica, Arial, serif !important',
                  }}
                >
                  STH BNK By
                  <span style={{ fontWeight: 'bold' }}>有史以來規模最大</span>
                  的項目，將成為
                  <span style={{ fontWeight: 'bold' }}>澳洲最高</span>
                  的大廈，為可持續宜居都市設計樹立新標杆，造福子孫後代。
                  <div className="mt-3 mb-3">
                    <span
                      style={{
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: '16px',
                      }}
                    >
                      澳洲全新地標式住宅，1房至4房單位現正發售。
                    </span>
                  </div>
                </span>
                <ul
                  style={{
                    fontFamily: 'Montserrat,sans-serif',
                    lineHeight: '2rem',
                    fontSize: '16px',
                  }}
                >
                  <li>
                    南半球
                    <span style={{ fontWeight: 'bold' }}>最高大廈</span>
                  </li>
                  <li>
                    全球
                    <span style={{ fontWeight: 'bold' }}>
                      最高的空中垂直花園
                    </span>
                  </li>
                  <li>
                    澳洲
                    <span style={{ fontWeight: 'bold' }}>首間四季酒店</span>
                    進駐
                  </li>
                  <li>著名的國際藝術展廳</li>
                  <li>
                    <span style={{ fontWeight: 'bold' }}>
                      世界級體驗式購物區
                    </span>
                  </li>
                  <li>住宅生活設施覆蓋類別全面</li>
                  <li>
                    空中花園景觀由新加坡地標Gardens by the Bay的設計工作室 -
                    <span style={{ fontWeight: 'bold' }}>Grant Associates</span>{' '}
                    設計
                  </li>
                </ul>
              </div>
              <div className="w rght">
                <video width="400px" height="auto" controls>
                  <source
                    src="https://cdn.yourpave.com/assets/ogps_sth_axonometric.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-3 mt-5" style={{ width: '100%' }}>
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
                    // await handleTracker(activity, metaData);
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
        </section>
        <section className="header-1 beige-b p-3 my-4">
          <div className="container px-5">
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'normal',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Montserrat, serif',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                }}
              >
                同場加映：全新聯排別墅項目
              </span>
            </h2>
          </div>
        </section>

        <section className="header-1">
          <div className="container d-flex flex-row gap-2">
            <div className="w rght" style={{ width: '60%' }}>
              <img
                src={
                  'https://invest.ogpsglobal.com/hs-fs/hubfs/Screenshot%202023-02-15%20at%204.25.07%20PM.png?width=933&height=1091&name=Screenshot%202023-02-15%20at%204.25.07%20PM.png'
                }
                width={'100%'}
                className="mb-2"
              />
              <sup>*相片為之前售出的項目，僅供參考</sup>
            </div>
            <div className="lft pl-4">
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#a4825d',
                  marginTop: '100px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'tahoma,arial,helvetica,sans-serif',
                  }}
                >
                  即將登場
                </span>
              </h1>
              <h3 className="mb-3">
                <span
                  style={{
                    fontFamily: 'Montserrat,sans-serif',
                    fontSize: '16px',
                    color: '#d0b787',
                  }}
                >
                  項目亮點:
                </span>
              </h3>
              <ul
                style={{
                  fontFamily: 'Montserrat,sans-serif',
                  lineHeight: '2rem',
                  listStyleType: 'circle',
                  color: '#d0b787',
                }}
              >
                <li>25 間聯排別墅</li>
                <li>完善的社區，鄰近墨爾本CBD及主要大學</li>
                <li>永久業權</li>
                <li>維修保養成本低</li>
                <li>由獲獎建築師建造</li>
                <li>預計入場價低至AUD1.3M</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="header-1 container">
          <img
            src={
              'https://invest.ogpsglobal.com/hs-fs/hubfs/Screenshot%202023-02-20%20at%2011.55.52%20AM.png?width=1079&height=600&name=Screenshot%202023-02-20%20at%2011.55.52%20AM.png'
            }
            width={'100%'}
            className="mt-2"
          />
        </section>

        <section className="header-1 bg-green p-4 my-2">
          <h2
            style={{
              fontSize: '30px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
            className="mb-4"
          >
            <span
              style={{
                color: '#ffffff',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              立即登記參加樓盤展銷會
            </span>
          </h2>
          <p
            style={{
              lineHeight: 1,
              textAlign: 'center',
            }}
            className="pt-3"
          >
            <span
              style={{
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              2023年3月10 &11日 （星期五及星期六）
            </span>
          </p>
          <p
            style={{
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              上午11點至下午6點
            </span>
          </p>
          <p
            style={{
              lineHeight: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
            className="pt-4"
          >
            <span
              style={{
                fontSize: '20px',
                color: '#a4825d',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              [分享：澳洲樓市全面睇講座]
            </span>
          </p>
          <p
            style={{
              lineHeight: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: '#a4825d',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              3月9日（星期四）：下午6點半
            </span>
          </p>
          <p
            style={{
              lineHeight: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: '#a4825d',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              3月11日（星期六）：下午2點
            </span>
          </p>
          <p
            style={{
              lineHeight: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: '#a4825d',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              [座位有限，敬請預約]
            </span>
          </p>
          <p
            style={{
              lineHeight: 1,
              textAlign: 'center',
            }}
            className="pt-5"
          >
            <span
              style={{
                fontSize: '20px',
                color: '#FFFFFF',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              灣仔分域街18號捷利中心802室展銷廳
            </span>
          </p>
          <div className=" pt-4 d-flex blck  flex-row gap-2">
            <div style={{ flexGrow: 2, flexBasis: 0 }}></div>
            <div style={{ flexGrow: 1, flexBasis: 0 }} className="lft">
              <div
                style={{ backgroundColor: '#E6E2DC', textAlign: 'center' }}
                className="p-4"
              >
                <h3
                  className="mb-5"
                  style={{
                    fontSize: '20px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                  }}
                >
                  立即登記參加展銷會！
                </h3>
                <div class="hs_submit hs-submit">
                  <div class="actions">
                    <button type="button" className="btn-submit">
                      登記興趣
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ flexGrow: 2, flexBasis: 0 }}></div>
          </div>
        </section>

        <section className="header-1 container">
          <hr className="mt-3" style={{ borderTop: '2px solid #000' }} />
        </section>

        <section className="pt-4" style={{ width: '55%', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', textAlign: 'justify', lineHeight: 1 }}>
            <span
              style={{
                fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                color: '#414141',
              }}
            >
              Disclaimer: Approved Planning Application No.: MRA-13388. Computer
              generated images are indicative only. This document has been
              prepared by One Global Property Services (Singapore) Pte Ltd &amp;
              One Global Property Services (Hong Kong) Ltd for advertising and
              general reference only. One Global Property Services makes no
              guarantees, representations or warranties of any kind, expressed
              or implied regarding the information including, but not limited
              to, warranties of content, accuracy and reliability. Any
              interested party should undertake their own research and due
              diligence as to the accuracy of the information. One Global
              Property Services excludes unequivocally all inferred or implied
              terms, conditions and warranties arising out of this document and
              excludes all liability or loss and damages arising there from.
              This publication is the copyrighted property of One Global
              Property Services and/or its licensor(s). ©2022. All rights
              reserved. One Global Property Services (Hong Kong) Ltd and our
              representatives only work in relation to real estate located
              outside Hong Kong. Neither One Global Property Services nor its
              representatives are licensed under the Estate Agents Ordinance
              (Cap.511 of the Laws of Hong Kong) to deal with Hong Kong real
              estate (nor are we required to be so licensed). Neither One Global
              Property Services nor its representatives hold them out to perform
              any regulated activities in Hong Kong under the corporate brand of
              One Global Property Services such as advising on dealing or
              advising on securities or providing asset management services or
              any other incidental regulated activities. Advisory Message: All
              overseas investments carry additional financial, regulatory and
              legal risks. Investors are advised to do necessary checks and
              research on the investment beforehand. Date of production: 20 July
              2022.
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
                <div class="focus_module_social_accounts">
                  <div class="focus_social_icons">
                    <a
                      class=""
                      href="https://www.facebook.com/ogpsglobal/"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067_"
                        class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
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
                      class=""
                      href="https://www.linkedin.com/company/one-global-property-service/"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067__2"
                        class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
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
                      class=""
                      href="https://www.youtube.com/channel/UCHIuHQwu0x4J2aHPgOaxVRg/featured"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067__3"
                        class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
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
                      class=""
                      href="https://www.instagram.com/ogpsglobal/"
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        id="hs_cos_wrapper_widget_1659509427067__4"
                        class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_icon msi_icon"
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
