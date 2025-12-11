import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Parallax } from 'react-parallax';

import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import {
  faRunning,
  faDumbbell,
  faArrowAltCircleDown,
  faSmileWink,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppointmentSelector from './partials/AppointmentSelector';

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
    const [testi, setTesti] = useState(0);

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
        h.general.customizedAlert('success ', {
          message: 'Thank you for your registration!',
          cl: 'strculture',
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
        console.log('hasCampaign', apiRes.data.hasCampaign);
        console.log('registered', apiRes.data.clicked);
      }
    };

    return (
      <main id="f45-root">
        <div className="container">
          <div className="d-flex justify-content-center container pt-4 pb-4 logo-cont">
            <img
              src={
                'https://cdn.f45training.com/f45training/uploads/2022/02/21065149/logo.svg'
              }
              alt="F45"
              width={'100px'}
            />{' '}
            <span>PUNGGOL PLAZA</span>
          </div>
        </div>

        <section className="heading-main">
          <h1>TEAM TRAINING. LIFE CHANGING.</h1>
          <h3>
            WELCOME TO THE WORLD’S FASTEST GROWING FUNCTIONAL TRAINING
            COMMUNITY.
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
                  : hasCampaign
                  ? 'Register Interest'
                  : 'Register Interest'}
              </button>
            </div>
          </div>
        </section>
        <section style={{ backgroundColor: '#f0f0f0', padding: '30px 0' }}>
          <div className="container d-flex f-links">
            <div>
              <img
                src={`https://f45training.sg/wp-content/themes/f45/assets/images/svg/location.svg`}
                height={'36px'}
              />

              <a
                href="https://maps.google.com?q=1.3944266519745352,103.91296449528609"
                target="_blank"
                rel="noopener noreferrer"
              >
                168 Punggol Field, Singapore 820168
              </a>
            </div>
            <div>
              <img
                src={`https://f45training.sg/wp-content/themes/f45/assets/images/svg/contact.svg`}
                height={'36px'}
              />

              <a href="mailto:punggolplaza@f45training.sg">
                punggolplaza@f45training.sg
              </a>
              <a href="tel:+6597314542">+6597314542</a>
            </div>
            <div>
              <img
                src={`https://f45training.sg/wp-content/themes/f45/assets/images/svg/social.svg`}
              />

              <a href="" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </div>
          </div>
        </section>
        <section style={{ paddingTop: '70px', paddingBottom: '70px' }}>
          <h1 className="heading">OUR CLASSES</h1>
          <div className="container d-flex c-links">
            <div>
              <span>
                <img
                  src={
                    'https://cdn.f45training.com/f45training/uploads/2019/04/04080829/class-1-1.svg'
                  }
                />
              </span>

              <h3>FUNCTIONAL HIIT</h3>

              <p>
                F45 is specifically designed to provide a functional full-body
                workout while improving energy levels, metabolic rate, strength,
                and endurance.
              </p>
            </div>
            <div>
              <span>
                <img
                  src={
                    'https://cdn.f45training.com/f45training/uploads/2019/04/04080829/class-2.svg'
                  }
                />
              </span>

              <h3>TEAM TRAINING</h3>

              <p>
                The team mentality at F45 Training helps members transform their
                lifestyle physically and mentally while encouraging community
                growth and a no-ego attitude.
              </p>
            </div>
            <div>
              <span>
                <img
                  src={
                    'https://cdn.f45training.com/f45training/uploads/2019/04/04080829/class-3-1.svg'
                  }
                />
              </span>

              <h3>45 MINUTES</h3>

              <p>
                F45 is one of the most time-efficient ways of training. We aim
                to burn up to 750 calories per 45-minute session.
              </p>
            </div>
          </div>
        </section>

        <div
          className="img-banner"
          style={{
            background: `url(https://cdn.f45training.com/f45training/uploads/2021/03/26100945/training-2.jpeg) no-repeat center center`,
          }}
        >
          <div className="d-flex container s-mdl">
            <div>
              <h3>WHAT IS F45 TRAINING?</h3>
              <p>
                THE F STANDS FOR FUNCTIONAL TRAINING, A MIX OF CIRCUIT AND HIIT
                STYLE WORKOUTS GEARED TOWARDS EVERYDAY MOVEMENT. 45 IS THE TOTAL
                AMOUNT OF TIME FOR SWEAT-DRIPPING, HEART-PUMPING FUN.
              </p>
            </div>
          </div>
        </div>
        <section className="container testimonial">
          <div className="nav-img">
            <img
              className={`${testi === 0 ? 'active' : ''}`}
              onClick={() => {
                setTesti(0);
              }}
              src={
                'https://cdn.f45training.com/f45training/uploads/2021/03/26101006/quote_1.jpeg'
              }
            />
            <img
              className={`${testi === 1 ? 'active' : ''}`}
              onClick={() => {
                setTesti(1);
              }}
              src={
                'https://cdn.f45training.com/f45training/uploads/2021/03/26101021/quote_4.jpeg'
              }
            />
            <img
              className={`${testi === 2 ? 'active' : ''}`}
              onClick={() => {
                setTesti(2);
              }}
              src={
                'https://cdn.f45training.com/f45training/uploads/2021/03/26101036/quote_3.jpeg'
              }
            />
            <img
              className={`${testi === 3 ? 'active' : ''}`}
              onClick={() => {
                setTesti(3);
              }}
              src={
                'https://cdn.f45training.com/f45training/uploads/2021/03/26101051/quote_2.jpeg'
              }
            />
          </div>
          <div className="animate-fadeIn">
            {testi === 0 && (
              <div className="animate-fadeIn">
                <h3>
                  The workouts will kick your butt every time, plus they can be
                  modified for beginners and those with more experience. It’s
                  for everyone and I love it!
                </h3>
                <strong>
                  Amiee
                  <br />
                  <span>F45 Member</span>
                </strong>
              </div>
            )}
            {testi === 1 && (
              <div className="animate-fadeIn">
                <h3>
                  F45 is the most dynamic, efficient, and enjoyable work out I
                  have ever done! The sense of community here is so very
                  special. I absolutely love it.
                </h3>
                <strong>
                  John
                  <br />
                  <span>F45 Member</span>
                </strong>
              </div>
            )}
            {testi === 2 && (
              <div className="animate-fadeIn">
                <h3>
                  LITERALLY THE ABSOLUTE BEST! The workouts are very challenging
                  and I always leave feeling like I did some serious work. The
                  trainers are AWESOME!
                </h3>
                <strong>
                  Lauren
                  <br />
                  <span>F45 Member</span>
                </strong>
              </div>
            )}
            {testi === 3 && (
              <div className="animate-fadeIn">
                <h3>
                  I’ve tried every form of training from CrossFit to Orange
                  Theory Fitness (bored out of my mind running on treadmills).
                  Take advantage of their FREE trial, after a few sessions
                  you’ll be hooked!
                </h3>
                <strong>
                  Evan
                  <br />
                  <span>F45 Member</span>
                </strong>
              </div>
            )}
          </div>
        </section>
        <section className="skewed-bg">
          <div className="image-sec">
            <img
              src="https://cdn.f45training.com/f45training/uploads/2021/03/26101111/innovation-slice1-2-1.png"
              alt=""
              width={'100%'}
            />
            <div className="hero-video-wrapper">
              <div
                style={{
                  backgroundImage:
                    'url(https://cdn.f45training.com/f45training/uploads/2021/03/26101111/innovation-slice1-2-1.png)',
                }}
              ></div>
            </div>
          </div>
          <div class="container">
            <div class="text-sec">
              <h2>INNOVATION.</h2>
              <p>
                Our functional training classes continuously evolve so virtually
                no two workout are ever the same!
              </p>
            </div>
          </div>
        </section>
        <section className="skewed-bg reverse">
          <div className="image-sec">
            <img
              src="https://cdn.f45training.com/f45training/uploads/2021/03/26101158/img3-1.jpeg"
              alt=""
              width={'100%'}
            />
            <div className="hero-video-wrapper">
              <div
                style={{
                  backgroundImage:
                    'url(https://cdn.f45training.com/f45training/uploads/2021/03/26101158/img3-1.jpeg)',
                }}
              ></div>
            </div>
          </div>
          <div class="container">
            <div class="text-sec">
              <h2>MOTIVATION.</h2>
              <p>
                The motivation and encouragement in a group training facility
                creates a pulsing, upbeat environment where goals are met and
                exceeded.
              </p>
            </div>
          </div>
        </section>
        <section className="skewed-bg ">
          <div className="image-sec">
            <img
              src="https://cdn.f45training.com/f45training/uploads/2021/03/26101223/F45-PADD0334-1.jpeg"
              alt=""
              width={'100%'}
            />
            <div className="hero-video-wrapper">
              <div
                style={{
                  backgroundImage:
                    'url(https://cdn.f45training.com/f45training/uploads/2021/03/26101223/F45-PADD0334-1.jpeg)',
                }}
              ></div>
            </div>
          </div>
          <div class="container">
            <div class="text-sec">
              <h2>RESULTS.</h2>
              <p>
                When it comes to weight management, good nutrition is vital. F45
                gives all members access to their own free personal nutrition
                program to achieve health objectives with daily meal plans,
                tracking, and community support. Welcome to the F45 Challenge.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-5">
          <img
            src={`https://cdn.f45training.com/f45training/uploads/2023/04/14202801/D6E06F34-9FDA-45F3-8FA8-EDFED37A3815.4186819030-F45Challenge-WebBanner-1440x810-v1-2.png`}
            width={'100%'}
          />
        </div>

        <h1 className="heading sm">TEAM TRAINING. LIFE CHANGING.</h1>

        <div className="fut">
          <img
            src={
              'https://cdn.f45training.com/f45training/uploads/2022/02/21065149/logo.svg'
            }
            alt="F45"
            width={'80px'}
            className="mb-2"
          />
          <br />
          <span>© 2023 F45 Training</span>
          <hr />
          <div className="focus_module_social_accounts">
            <div className="focus_social_icons">
              <a
                className=""
                href="https://www.facebook.com/F45FunctionalTraining"
                target="_blank"
                rel="noopener"
              >
                <span>
                  <svg
                    viewBox="-5 0 20 20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#fff"
                  >
                    <g stroke-width="0"></g>
                    <g strokeLinecap="round" strokeLinejoin="round"></g>
                    <g>
                      <title>facebook [#176]</title>
                      <desc>Created with Sketch.</desc> <defs> </defs>
                      <g
                        id="Page-1"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          transform="translate(-385.000000, -7399.000000)"
                          fill="#fff"
                        >
                          <g
                            id="icons"
                            transform="translate(56.000000, 160.000000)"
                          >
                            <path
                              d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z"
                              id="facebook-[#176]"
                            ></path>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </span>
              </a>

              <a
                className=""
                href="https://twitter.com/F45TRAINING"
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
                    viewBox="0 -2 20 20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#fff"
                  >
                    <g stroke-width="0"></g>
                    <g stroke-linecap="round" stroke-linejoin="round"></g>
                    <g>
                      <title>twitter [#154]</title>
                      <defs> </defs>
                      <g
                        id="Page-1"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          id="Dribbble-Light-Preview"
                          transform="translate(-60.000000, -7521.000000)"
                          fill="#fff"
                        >
                          <g
                            id="icons"
                            transform="translate(56.000000, 160.000000)"
                          >
                            <path
                              d="M10.29,7377 C17.837,7377 21.965,7370.84365 21.965,7365.50546 C21.965,7365.33021 21.965,7365.15595 21.953,7364.98267 C22.756,7364.41163 23.449,7363.70276 24,7362.8915 C23.252,7363.21837 22.457,7363.433 21.644,7363.52751 C22.5,7363.02244 23.141,7362.2289 23.448,7361.2926 C22.642,7361.76321 21.761,7362.095 20.842,7362.27321 C19.288,7360.64674 16.689,7360.56798 15.036,7362.09796 C13.971,7363.08447 13.518,7364.55538 13.849,7365.95835 C10.55,7365.79492 7.476,7364.261 5.392,7361.73762 C4.303,7363.58363 4.86,7365.94457 6.663,7367.12996 C6.01,7367.11125 5.371,7366.93797 4.8,7366.62489 L4.8,7366.67608 C4.801,7368.5989 6.178,7370.2549 8.092,7370.63591 C7.488,7370.79836 6.854,7370.82199 6.24,7370.70483 C6.777,7372.35099 8.318,7373.47829 10.073,7373.51078 C8.62,7374.63513 6.825,7375.24554 4.977,7375.24358 C4.651,7375.24259 4.325,7375.22388 4,7375.18549 C5.877,7376.37088 8.06,7377 10.29,7376.99705"
                              id="twitter-[#154]"
                            ></path>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </span>
              </a>

              <a
                className=""
                href="https://instagram.com/f45_training/"
                target="_blank"
                rel="noopener"
              >
                <span>
                  <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    aria-labelledby="instagram5"
                    role="img"
                    fill="#fff"
                  >
                    <title id="instagram5">Follow us on Instagram</title>
                    <g id="instagram5_layer">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                    </g>
                  </svg>
                </span>
              </a>
              <a
                className=""
                href="https://www.youtube.com/user/F45Training"
                target="_blank"
                rel="noopener"
              >
                <span>
                  <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    aria-labelledby="youtube4"
                    role="img"
                    fill="#fff"
                  >
                    <title id="youtube4">Follow us on Twitter</title>
                    <g id="youtube4_layer">
                      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                    </g>
                  </svg>
                </span>
              </a>
            </div>
            * Results vary from person to person.
          </div>
        </div>
      </main>
    );
  },
);
