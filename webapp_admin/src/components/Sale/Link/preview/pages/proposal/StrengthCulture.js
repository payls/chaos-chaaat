import React, { useEffect, useState } from 'react';
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
    reloadShortlistedProjects,
    project,
    customStyle,
  }) => {
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
        h.general.alert('success', {
          message: 'Thank you for your registration!',
        });
      }
    };

    const checkCampaign = async () => {
      const apiRes = await api.contact.getCheckIfBtnClicked(
        { contact_id: contact.contact_id },
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setHasCampaign(apiRes.data.hasCampaign);
        setRegistered(apiRes.data.clicked);
        console.log('hasCampaign', apiRes.data.hasCampaign);
        console.log('registered', apiRes.data.clicked);
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
      <main id="strculture-root">
        <div
          style={{
            background: '#000',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        ></div>
        <div style={{ background: '#000' }}>
          <div className="d-flex justify-content-center container">
            <img
              src={
                'https://static.wixstatic.com/media/f77aea_b26df9828cb747bdb627aaae176e1551~mv2.png/v1/crop/x_135,y_928,w_2191,h_754/fill/w_458,h_156,al_c,q_95,enc_auto/SC%20side%20by%20side%20white.png'
              }
              alt="Pave"
              width={'20%'}
              style={{ margin: '20px' }}
            />
          </div>
        </div>
        <div
          style={{
            padding: '25px',
            width: '100%',
          }}
          className="banner-img "
        >
          <div className="banner-mask"></div>

          <div className="d-flex container gap-2 align-items-center flex-row fff">
            <div style={{ zIndex: 1, flex: '1 50%' }}>
              <img
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/strculture.png"
                width={'100%'}
              />
            </div>
            <div style={{ zIndex: 1, padding: '20px', flex: '1 50%' }}>
              <h3>6WK PT PROGRAM</h3>
              <h5>Fat Loss | Muscle Building | Strength Gain</h5>

              <p>
                Our 6 Weeks Personal Training Program fuses our{' '}
                <b>Personal Training, Group Classes</b> and <b>Open Gym</b>,
                providing you great value and results. <br />
                <br />
                This personalized program will run in 6 weeks blocks where you
                will commit to 2 personal training sessions per week, with also
                access to up to 2 group classes each week. <br />
                <br />
                The program provides you customized programming as well as
                personalized attention on your very unique bio-mechanics and any
                imbalances you might have, this way we can instruct you better
                technique during your personal training sessions. <br />
                <br />
                Once you and your coach has established your goal and direction,
                your coach will program the personal training sessions for you,
                as well, give you the specific group classes you can attend in
                order to complement your personal training sessions working
                towards your goal, if the group classes recommended do not suit
                your schedule, your coach can also instruct you your own workout
                that can be done during Open Gyms hours.
              </p>
              <div className="actions" align="center">
                <button
                  type="button"
                  className="btn-submit"
                  onClick={() => {
                    if (!registered) {
                      // handleCTA();
                    }
                  }}
                >
                  Press here to sign up in one click!
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* {project &&
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
          )} */}

        <section style={{ backgroundColor: '#000' }}>
          <div className="container foot">
            <div className=" pt-4 d-flex blck  flex-row gap-2 justify-content-center align-items-center">
              <div className="focus_module_social_accounts">
                <div className="focus_social_icons">
                  <a
                    className=""
                    href="https://www.facebook.com/strengthculturehk/"
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
                        fill="#949494"
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
                    href="https://www.instagram.com/strengthculturehk/"
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
                        fill="#949494"
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
        </section>
        <section
          style={{ backgroundColor: '#000', paddingBottom: '50px' }}
          className="d-flex justify-content-center align-items-center"
        >
          <span>© 2015 Strength Culture</span>
        </section>
      </main>
    );
  },
);
