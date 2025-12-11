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
    const [viewMore, setViewMore] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showModal, setShowModal] = useState(false);

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
      function handleScroll() {
        setScrollPosition(window.scrollY);
      }

      window.addEventListener('scroll', handleScroll);

      // cleanup function to remove the event listener when the component unmounts
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

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
      <main id="lucid-vue-root">
        <div style={{ background: '#000' }}>
          <div className="container">
            <div className="d-flex justify-content-center container pt-4 pb-4">
              <img
                src={
                  'https://lucidvue.com/wp-content/themes/lucidvue/images/logo-white.svg'
                }
                alt="Pave"
                width={'200px'}
              />
            </div>
            <div style={{ padding: '50px 0px' }}>
              <p
                className="title-big"
                style={{
                  fontSize: '40px',
                  fontFamily:
                    'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                  fontWeight: 'bold',
                  color: '#f2f2f2',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                Transform the way you reach and engage prospective buyers
                <br />
                <button
                  type="button"
                  onClick={() => {
                    if (!registered) {
                      handleCTA();
                      // setShowModal(true);
                    }
                  }}
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 500,
                    fontSize: '18px',
                    padding: '20px 50px',
                    backgroundColor: '#f2f2f2',
                    color: '#000',
                    border: 'none',
                    marginTop: '40px',
                  }}
                >
                  {registered
                    ? hasCampaign
                      ? 'Thanks, we will be in touch!'
                      : 'Thanks, we will be in touch!'
                    : hasCampaign
                    ? 'Request a Call'
                    : 'Request a Call'}
                </button>
              </p>
            </div>
          </div>
        </div>
        <section className="container mmmm" style={{ marginTop: '80px' }}>
          <div className="d-flex feature-list">
            <div>
              <img
                src={`https://lucidvue.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-25-at-14.28.36.jpg`}
                width={'100%'}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div>
              <h1
                style={{
                  fontFamily:
                    'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#333',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  fontSize: '3rem',
                }}
              >
                We are immersive visualisation experts
              </h1>

              <div
                className=" d-flex p-body"
                style={{
                  alignItems: 'center',
                  height: '20vh',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                  }}
                >
                  Fast and flexible 3D visualisations with no compromise. We
                  create market-leading 3D tours, renders & animations in half
                  the time, helping Agents and Developers sell off-the-plan
                  property faster.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="container mmm">
          <div className="d-flex feature-list">
            <div>
              <h1
                style={{
                  fontFamily:
                    'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#333',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  fontSize: '3rem',
                }}
              >
                About us
              </h1>

              <div
                className=" d-flex"
                style={{
                  alignItems: 'center',
                  marginTop: '3rem',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                  }}
                >
                  Lucid Vue is a team of dedicated professionals with a passion
                  for visualisation. We are committed to delivering exceptional
                  services, on time and within budget. Our unique selling
                  proposition is providing delivery in half the time of our
                  competitors without compromising quality.
                  <br />
                  <br />
                  Lucid Vue works with a diverse clientele, serving the
                  Australian and international property markets.
                </p>
              </div>
            </div>
            <div>
              <img
                src={`https://lucidvue.com/wp-content/themes/lucidvue/images/about-img.jpg)`}
                width={'100%'}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
        <section
          style={{
            background: '#e2dddb',
            padding: '50px 10px',
            marginTop: '40px',
          }}
        >
          <div className="container">
            <h1
              style={{
                fontFamily:
                  'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                color: '#333',
                fontWeight: 900,
                lineHeight: 1.2,
                fontSize: '3rem',
                borderBottom: '1px solid #333',
                paddingBottom: '30px',
              }}
            >
              Services
            </h1>
            <div className="d-flex mt-3 flex-wrap services">
              <div>
                <h6
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    color: '#333',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Interactive Web Tour
                </h6>
                <p
                  style={{
                    fontFamily:
                      'Apercu, Helvetica Neue, Helvetica, Arial, sans-serif',
                    fontWeight: 400,
                    color: '#444',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  A dynamic, interactive, user-guided experience showcasing an
                  off-the-plan development's features, functions, and
                  highlights. Browser-based, no additional hardware required.
                </p>
              </div>
              <div>
                <h6
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    color: '#333',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Virtual Reality
                </h6>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#444',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  Allow buyers to freely explore an off-the-plan development in
                  photorealistic VR. A fully immersive, interactive, and
                  lifelike digital display suite for your project.
                </p>
              </div>
              <div>
                <h6
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    color: '#333',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Video and Animation
                </h6>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#444',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  Bring your vision to reality through the power of
                  photorealistic animation, creating captivating marketing
                  materials that leave a lasting impact on your audience.
                </p>
              </div>
              <div>
                <h6
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    color: '#333',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Renders & Architectural Visualisation
                </h6>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#444',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  Bring designs to life. Enable your clients to envision their
                  future spaces through stunning and photorealistic 3D
                  renderings, delivered in half the time of competitors.
                </p>
              </div>
              <div>
                <h6
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    color: '#333',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Augmented Reality
                </h6>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#444',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  Empower potential buyers to visualise your finished project by
                  holding their smartphone or tablet to the building site,
                  bridging the gap between imagination and reality.
                </p>
              </div>
              <div>
                <h6
                  style={{
                    fontFamily:
                      'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                    color: '#333',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Vue
                </h6>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#444',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  An innovative platform that combines personalised
                  customisation, multimedia, seamless contract integration, and
                  convenient deposit-making capabilities, effectively
                  streamlining the selling process for an enhanced and efficient
                  experience.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          style={{
            background: '#000',
            padding: '50px 10px',
          }}
        >
          <div className="container">
            <h1
              style={{
                fontFamily:
                  'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                color: '#f2f2f2',
                fontWeight: 900,
                lineHeight: 1.2,
                fontSize: '3rem',
                borderBottom: '1px solid #f2f2f2',
                paddingBottom: '30px',
              }}
            >
              Testimonials
            </h1>
            <div className="d-flex mt-3 flex-wrap services-2">
              <div>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#f2f2f2',
                    lineHeight: 1.5,
                    fontSize: '1rem',
                  }}
                >
                  Lucid Vue adds remarkable value with an amazing new way for us
                  to engage with our clients, without the need for a physical
                  display suite.
                  <em
                    style={{
                      color: '#6c757d',
                      display: 'block',
                      fontWeight: 400,
                      fontSize: '1rem',
                    }}
                  >
                    Jamie Baldwin | General Sales Manager
                  </em>
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#f2f2f2',
                    lineHeight: 1.5,
                    fontSize: '1rem',
                  }}
                >
                  The team at Lucid Vue are a dream to work with. They were able
                  to complete our project in a very limited time frame with an
                  exceptional result.
                  <em
                    style={{
                      color: '#6c757d',
                      display: 'block',
                      fontWeight: 400,
                    }}
                  >
                    Ben Mensink | BDM
                  </em>
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                    fontWeight: 400,
                    color: '#f2f2f2',
                    lineHeight: 1.5,
                    fontSize: '1rem',
                  }}
                >
                  The team at Lucid Vue have opened our eyes to a whole new
                  realm of property marketing. Not only has it helped deliver
                  more leads, the detail and perfect spatial detailing has
                  helped removed some of the common barriers to sale.
                  <em
                    style={{
                      color: '#6c757d',
                      display: 'block',
                      fontWeight: 400,
                    }}
                  >
                    Andrew Weipers | Development Manager
                  </em>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            padding: '20px 10px',
            marginTop: '40px',
          }}
        >
          <div className="container">
            <h1
              style={{
                fontFamily:
                  'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                color: '#333',
                fontWeight: 900,
                lineHeight: 1.2,
                fontSize: '3rem',
                borderBottom: '1px solid #333',
                paddingBottom: '35px',
              }}
            >
              Clients
            </h1>
            <div className="d-flex mt-3 flex-wrap clients">
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2023/04/Samma_Logo_Horizontal_EN_Dark_Interlaced-400x108.png'
                  }
                />
              </div>
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2023/04/Ryman-Healthcare-logo-400x138.png'
                  }
                />
              </div>
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2021/10/Lifestyle-400x208.png'
                  }
                />
              </div>
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2021/07/simonds-logo-2017-display-400x210.jpg'
                  }
                />
              </div>
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2021/07/BOF_RGB-1-400x200.jpg'
                  }
                />
              </div>
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2021/07/index.jpg'
                  }
                />
              </div>
              {/* <div>
              <img
                src={
                  'https://lucidvue.com/wp-content/uploads/2019/10/location-logo.png'
                }
              />
            </div> */}
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/10/100.jpg'
                  }
                />
              </div>
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/10/sprite-s14aae8d454-1.png'
                  }
                />
              </div>
              <div>
                <img
                  src={'https://lucidvue.com/wp-content/uploads/2019/10/0.png'}
                />
              </div>
              {/* <div>
              <img
                src={
                  'https://lucidvue.com/wp-content/uploads/2019/10/Colliers_Logo_Black.jpg'
                }
              />
            </div> */}
              {/* <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/10/hocking-stuart.jpg'
                  }
                />
              </div> */}
              {/* <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/09/WHT-BLACK-400x80.jpg'
                  }
                />
              </div> */}
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/09/index.png'
                  }
                />
              </div>
              {/* <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/09/iBuildNew-2.jpg'
                  }
                />
              </div> */}
              {/* <div>
              <img
                src={
                  'https://lucidvue.com/wp-content/uploads/2019/09/hp-logo-vector-download.jpg'
                }
              />
            </div> */}
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/09/beulah-logo640x170-400x106.jpg'
                  }
                />
              </div>
              {/* <div>
              <img
                src={
                  'https://lucidvue.com/wp-content/uploads/2019/09/conceptcommercialinteriorslogo-400x131.png'
                }
              />
            </div> */}
              {/* <div>
              <img
                src={
                  'https://lucidvue.com/wp-content/uploads/2019/09/Kincaid-Logo-400x93.png'
                }
              />
            </div> */}
              <div>
                <img
                  src={
                    'https://lucidvue.com/wp-content/uploads/2019/09/clarence-logo-400x93.png'
                  }
                />
              </div>
            </div>
          </div>
        </section>
        <section
          style={{
            background: '#000',
            padding: '20px 10px',
          }}
        >
          <div className="container d-flex services-2 flex-wrap">
            <div>
              <h1
                style={{
                  fontFamily:
                    'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#fff',
                  fontWeight: 900,
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                }}
              >
                Call us
              </h1>
              <a
                href="tel:+611300414241"
                style={{
                  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#fff',
                  fontWeight: 400,
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  textDecoration: 'underline',
                }}
              >
                +61 1300 414 241
              </a>
            </div>
            <div>
              <h1
                style={{
                  fontFamily:
                    'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#fff',
                  fontWeight: 900,
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                }}
              >
                E-mail us
              </h1>
              <a
                href="mailto:info@lucidvue.com?subject=Enquiry from Lucid Vue website"
                style={{
                  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#fff',
                  fontWeight: 400,
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  textDecoration: 'underline',
                }}
              >
                info@lucidvue.com
              </a>
            </div>
            <div>
              <h1
                style={{
                  fontFamily:
                    'Circular, Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#fff',
                  fontWeight: 900,
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                }}
              >
                Address
              </h1>
              <p
                style={{
                  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-s',
                  color: '#fff',
                  fontWeight: 400,
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                }}
              >
                Level 2 627 Chapel Street, South Yarra, Victoria, 3141 Australia
              </p>
            </div>
          </div>
        </section>
        <section
          style={{
            padding: '20px 10px',
          }}
        >
          <div className="container d-flex fut flex-wrap">
            <div>
              <div style={{ flexGrow: 1, flexBasis: 0 }}>
                <div className="focus_module_social_accounts">
                  <div className="focus_social_icons">
                    <a
                      className=""
                      href="https://www.facebook.com/lucidvue"
                      target="_blank"
                      rel="noopener"
                    >
                      <span>
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
                      href="https://www.linkedin.com/company/champagne-soda/"
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
                      href="https://www.youtube.com/channel/UCqdYgt3c2biC38fOy13UByQ"
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
                      href="https://www.instagram.com/lucidvue/"
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
            <div style={{ color: '#000', fontSize: '.75rem' }}>
              Copyright 2018 - 2023. Blue Pill VR Pty Ltd (T/A Lucid Vue) ABN:
              94 630 235 246 ACN: 630 235 246.
            </div>
          </div>
        </section>
      </main>
    );
  },
);
