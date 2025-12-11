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
      <main id="hybrid-hk-root">
        {showModal && (
          <AppointmentSelector
            close={() => setShowModal(false)}
            contact={contact}
            submitCallback={() => {}}
          />
        )}
        <div className={'header-fixed'}>
          <div className="d-flex justify-content-center container">
            <img
              src={
                'https://www.hybridgymhk.com/hosted/images/03/6d230cc78948a68bdc93d79ddaef1b/Hybrid-Artwork-for-Uniform-01.png'
              }
              alt="Pave"
              width={'300px'}
              style={{ margin: '20px' }}
            />
          </div>
        </div>
        <div className="banner-cover-img">
          <div className="space"></div>
          <div className="container banner-tag d-flex">
            <div class="banner-tag-msg">
              LOSE WEIGHT <span>GET STRONG</span> TONE UP
              <span>REDISCOVER</span> YOUR HEALTH!
            </div>
            <div></div>
          </div>
          <div className="container banner-footer">
            <div className="centered btn-wrap">
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  if (!registered) {
                    handleCTA();
                    // setShowModal(true);
                  }
                }}
              >
                {registered
                  ? hasCampaign
                    ? 'REGISTERED, SEE YOU THERE!'
                    : 'THANKS, WE WILL BE IN TOUCH!'
                  : hasCampaign
                  ? 'SIGN ME UP PLEASE!'
                  : 'REGISTER INTEREST'}
              </button>
            </div>
          </div>
        </div>

        <div className="container">
          <h1 className="title-header">
            <span>MORE</span> THAN JUST PERSONAL TRAINING
          </h1>

          <div className="container bg-grey icon-container d-flex">
            <div className="d-flex flex-column align-items-center justify-content-between">
              <FontAwesomeIcon
                icon={faRunning}
                color={'#000'}
                style={{ margin: '20px 0px' }}
                height={'55px'}
              />
              <span>MOVE BETTER</span>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-between">
              <FontAwesomeIcon
                className="wildIcon"
                icon={faDumbbell}
                color={'#000'}
                style={{ margin: '20px 0px' }}
                height={'55px'}
              />
              <span>GET STRONGER</span>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-between ">
              <FontAwesomeIcon
                className="wildIcon"
                icon={faArrowAltCircleDown}
                color={'#000'}
                style={{ margin: '20px 0px' }}
                height={'55px'}
              />
              <span>LOSE FAT</span>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-between">
              <FontAwesomeIcon
                className="wildIcon"
                icon={faSmileWink}
                color={'#000'}
                height={'55px'}
                style={{ margin: '20px 0px' }}
              />
              <span>GAIN CONFIDENSE</span>
            </div>
          </div>
        </div>
        <h3 className="container title-text">
          Guided by <b>Hong Kong's top trainers</b> in our world-class facility,
          you'll have absolutely everything you need to stay motivated, LOVE
          your training & achieve <b>REAL, measurable results</b>, once & for
          all!
        </h3>

        <h4 className="container text-pink">OUR SPRING SALE IS NOW ON!</h4>
        <h4 className="container text-black">
          Get Up to 6 Sessions FREE + Complementary Unlimited Group Fitness!
        </h4>

        <h5 className="container text-em">
          Start with a no-risk, free consult today
        </h5>

        <Parallax
          blur={{ min: -15, max: 15 }}
          bgImage={
            'https://www.hybridgymhk.com/hosted/images/22/c81686adef42cb877c4c3f3ed03e6a/Hybrid-square-1.jpg'
          }
          bgImageAlt="the dog"
          strength={-1000}
        >
          <div className="container inside-parallax bg-white">
            <h1 className="title-header">
              EXPERIENCE A <span>FULLY CUSTOMIZED</span> APPROACH TO YOUR HEALTH
              & FITNESS <span>JOURNEY</span>
            </h1>

            <h3 className="title-text-2">
              We help <b>transform anyone</b> who is willing & ready to
              <b>invest in themselves</b> to create long-term positive change.
              We work with everyone from complete beginners, to the advanced
              athlete.
            </h3>

            <h3 className="title-text-2 mt-3 mb-2">
              We will <span>meet you where you're at</span> & work with you to
              get you <span>where you want to go.</span>
            </h3>

            <div className="d-flex image-list mt-5">
              <div>
                <img
                  src={
                    'https://www.hybridgymhk.com/hosted/images/39/160a4dcadc47d7a0252b4b5ebab4f2/279791937_418078189748442_8056213731265733162_n.jpg'
                  }
                  width={'100%'}
                />
              </div>
              <div>
                <img
                  src={
                    'https://www.hybridgymhk.com/hosted/images/4f/e32adb718d4aceaf5c157f003b1dda/279676828_761411885025370_2059686842350738192_n.jpg'
                  }
                  width={'100%'}
                />
              </div>
              <div>
                <img
                  src={
                    'https://www.hybridgymhk.com/hosted/images/c7/bfcd9b62f04f1ebc350d30e906642e/279692234_1036320453977607_4143513590461626352_n.jpg'
                  }
                  width={'100%'}
                />
              </div>
            </div>
          </div>
        </Parallax>

        <div className="container d-flex column-list">
          <div>
            <h4>100% PERSONALIZED TRAINING PLAN</h4>

            <h5>GET FREE BONUS TRAINING SESSIONS! </h5>
            <p>
              Work with one of Hong Kong's top trainers! Your trainer will work
              with you to create a program & training schedule that{' '}
              <b>fits your needs</b> & lifestyle to ensure it is sustainable,
              effective & <b>enjoyable.</b>
            </p>
            <p>
              <b>
                New 1:1 coaching members get 6 free training sessions with the
                purchase of a 30-session package! ($7500 HKD value!)
              </b>
            </p>
          </div>
          <div>
            <img
              src={
                'https://www.hybridgymhk.com/hosted/images/aa/15f4cb3f2e496a9b111740810426b6/Hybrid-Square.jpg'
              }
              width={'100%'}
            />
          </div>
        </div>
        <div className="container d-flex column-list">
          <div>
            <h4>100% CUSTOMIZED NUTRITION PLAN</h4>

            <h5>NO MORE GUESSING!</h5>
            <p>
              We will work with you to create a unique nutrition program
              designed specifically to be <b>sustainable & effective</b> for YOU
              - no generic templates, no B.S.!
            </p>
          </div>
          <div>
            <img
              src={
                'https://www.hybridgymhk.com/hosted/images/4e/cb03f4a9c64ab6bb00ebf282fb9297/Food-macros-cropped.png'
              }
              width={'100%'}
            />
          </div>
        </div>
        <div className="container d-flex column-list">
          <div>
            <h4>
              <span>FREE</span> GROUP FITNESS CLASSES
            </h4>

            <h5>GET UNLIMITED CLASS ACCESS!</h5>
            <p>
              Our group fitness classes are designed to transform your physical
              fitness with fun and friendly group sessions. We work hard during
              these classes to bring out the best of everyone, offering every
              level of training, from those just starting out to elite athletes.
            </p>
            <p>
              <b>
                New 1:1 Personal Training Members Joining us this month will get
                a bonus FREE MONTH of Supplemental Group Fitness Class Access
                ($3450 HKD value!)
              </b>
            </p>
          </div>
          <div>
            <img
              src={
                'https://www.hybridgymhk.com/hosted/images/02/0736f9c0ed4697b6217444cd11efaf/DSC08599-1-.jpg'
              }
              width={'100%'}
              className="mgt-40"
            />
          </div>
        </div>
        <div className="container d-flex column-list">
          <div>
            <h4>ALL ABOUT HEALTHY SUSTAINABILITY!</h4>

            <h5>
              <b>NO</b> crash diets.
            </h5>
            <h5>
              <b>NO</b> depriving yourself.
            </h5>
            <h5>
              <b>NO</b> unhealthy restriction.
            </h5>
            <p>
              Our trainers know how to help you <b>shed fat</b> and
              <b>build muscle, strength & confidence</b> in a way that's
              sustainable and easy to maintain long term.
            </p>
          </div>
          <div>
            <img
              src={
                'https://www.hybridgymhk.com/hosted/images/94/18add7ff954af290e842932a945d0b/DSC00035.jpg'
              }
              width={'100%'}
            />
          </div>
        </div>
        <div className="container d-flex column-list">
          <div>
            <h4>LIFESTYLE GUIDANCE & SUPPORT</h4>
            <h5>STAY ON TRACK!</h5>
            <p>
              We are dedicated to supporting your success{' '}
              <b>both in & out of the gym</b> with lifestyle guidance, support &
              tips to keep you motivated & accountable!
            </p>
          </div>
          <div>
            <img
              src={
                'https://www.hybridgymhk.com/hosted/images/e3/e54210d1ca47e5988b3a92a046162f/HK-PT.jpg'
              }
              width={'100%'}
              className="mgt-40"
            />
          </div>
        </div>

        <Parallax
          blur={{ min: -15, max: 15 }}
          bgImage={
            'https://www.hybridgymhk.com/hosted/images/e6/17e5e706e04033bc39beb5a56da003/DSC08608-1-.jpg'
          }
          bgImageAlt="the dog"
          strength={-1000}
        >
          <div className="container inside-parallax-2 bg-black">
            <div className="d-flex">
              <div>
                <h1 className="title-header white left-text mb-3">
                  <span>GETTING STARTED IS EASY</span> WHEN YOU HAVE US BY YOUR
                  SIDE
                </h1>
                <h5 className="title-header-em">
                  Our <b>Customized Approach</b> provides everything you need to
                  reach your goals & feel your best all year round!
                </h5>

                <ul className="listt">
                  <li>
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'rgb(130, 110, 129)'}
                      height={'35px'}
                    />
                    One-on-One, Customized Personal Training Sessions
                  </li>
                  <li>
                    {' '}
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'rgb(130, 110, 129)'}
                      height={'35px'}
                    />
                    Fully Customized Nutrition Plan Designed Specifically for
                    YOU!
                  </li>
                  <li>
                    {' '}
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'rgb(130, 110, 129)'}
                      height={'35px'}
                    />
                    Lifestyle Guidance & Support{' '}
                  </li>
                  <li>
                    {' '}
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'rgb(130, 110, 129)'}
                      height={'35px'}
                    />
                    ​FREE Body Scans to track your progress{' '}
                  </li>
                  <li>
                    {' '}
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'rgb(130, 110, 129)'}
                      height={'35px'}
                    />
                    ​FREE Group Fitness Class Access
                  </li>
                  <li>
                    {' '}
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'rgb(130, 110, 129)'}
                      height={'35px'}
                    />
                    ​FREE Bonus 1:1 Sessions with a package purchase
                  </li>
                </ul>
              </div>
              <div>
                <img
                  src={
                    'https://www.hybridgymhk.com/hosted/images/74/492716123349b0859b1ce89afcc8bc/PT-offer-05-1-.png'
                  }
                  width={'100%'}
                />
              </div>
            </div>
          </div>
        </Parallax>
        <div
          style={{
            backgroundColor: 'rgb(217, 217, 214)',
            padding: '20px 0px',
            fontWeight: 'bold',
          }}
        >
          <h4 className="title-w-shadow">OUR WORLD-CLASS FACILITY:</h4>

          <div className="container d-flex image-cont mb-3">
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/41/d98b8f55fc4c5b97f0553598b2eb8b/DSC09635.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/42/8ef353c27641d08efe93adf354e27d/DSC09886.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/b4/ce357bcb3d49f1855383a3cd9b77d2/DSC00644.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/2a/664ebb85764542b8e7c1762a502bbe/DSC09784.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/5f/9afc2cf28f49c2893a560ed189db4d/DSC09856.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/02/0736f9c0ed4697b6217444cd11efaf/DSC08599-1-.jpg'
                }
                width={'100%'}
              />
            </div>
          </div>
        </div>
        <div className="bg-black pt-5 pb-5">
          <div className="container">
            <h1 className="title-header white  mb-3">THE HYBRID EXPERIENCE</h1>

            <h5 className="title-header-em pink" style={{ fontSize: '23px' }}>
              <b>WHAT TO EXPECT:</b>
            </h5>

            <p className="simple-p  white ">
              Our personal training packages are specifically designed to help
              you reach your goals as fast as possible - whether that means
              burning fat, building muscle, or simply improving your health and
              general wellbeing.
            </p>
            <div className="d-flex list-step flex-wrap">
              <div>
                <h2>Step 1: Consult</h2>
                <p>
                  This is an opportunity for us to discuss your individual
                  health and fitness goals in depth and understand the specific
                  support you need to get there.
                </p>
              </div>
              <div>
                <h2>Step 2: Meet Your Coach</h2>
                <p>
                  Once we have a full understanding of your needs and the
                  timeframe you want to achieve these in, you will be allocated
                  a coach best suited to helping you achieve your specific
                  goals.
                </p>
              </div>
              <div>
                <h2>Step 3: First Session</h2>
                <p>
                  Your first session will be ~60-90mins. The focus will be
                  analyzing the current status of your nutrition, lifestyle
                  habits, training, history & overall health. You will undergo
                  mobility & fitness assessments, a body fat test, and a short
                  workout. From there your coach will develop your fully
                  customized nutrition & training plan.
                </p>
              </div>
              <div>
                <h2>Step 4: RESULTS!</h2>
                <p>
                  Let's get to work! Now that you've got your custom plan,
                  you'll train directly 1:1 with your coach here at Hybrid! Your
                  coach will continue to tweak and customize your plan, as
                  needed.
                </p>
                <p>
                  The Hybrid process is simple and comprehensive, and our
                  coaches put their best into each session to ensure you get the
                  most benefit in and out of the gym.
                </p>
                <p>
                  Part of the Hybrid process includes body composition
                  measurements to gauge progress, lifestyle and nutrition
                  tracking to monitor adherence, supplemental and recovery
                  advice to accelerate your body’s regeneration, as well as
                  resistance training to improve your strength, performance, and
                  aesthetics!
                </p>
              </div>
              <div>
                <img
                  src={
                    'https://www.hybridgymhk.com/hosted/images/92/611c0de39e46d29ae71ff8e56cabb3/DSC09987.jpg'
                  }
                  width={'100%'}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'rgb(217, 217, 214)',
            padding: '20px 0px',
            fontWeight: 'bold',
          }}
        >
          <div className="container d-flex image-cont four mb-3">
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/ff/279ac7078c4e8bb311ee42e98e465b/292102060_397919952369094_2159836212739237104_n.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/6e/a86ef69a6c48fe8ce75c0bd3f28d08/292312314_560883275744011_209936971474541052_n.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/a0/b26919c78a474398d9b685fbe33fd5/291934254_2477716902368407_3822848116737079798_n.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/07/268ab4964a42aabb3206dab9590092/Anthony-01.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/42/e05d7073c04fc7ab0d96465e6da03e/321358505_2504010583099598_6113856590030773826_n.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/f6/18a35eaf7a416c8c9787f5139e473a/321524650_692797679066474_3537004878967957876_n.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/8e/b22de421624bc6a473b8c8a7bce496/321288539_205917188581650_2530423896125706033_n.jpg'
                }
                width={'100%'}
              />
            </div>
            <div>
              <img
                src={
                  'https://www.hybridgymhk.com/hosted/images/f4/c62e4898d84381a24b6c56137a4ae6/Ting-Front-Transformation-33.jpg'
                }
                width={'100%'}
              />
            </div>
          </div>
        </div>
      </main>
    );
  },
);
