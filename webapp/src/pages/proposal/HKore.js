import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import CommonCarousel from '../../components/Common/CommonCarousel';
import IconFacebookVector from '../../components/Icons/IconFacebookVector';
import IconInstagramVector from '../../components/Icons/IconInstagramVector';

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
    const [scrollPosition, setScrollPosition] = useState(0);

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
      <main id="h-kore-root">
        <div
          className={
            'header-transitioning ' + (scrollPosition >= 80 ? 'colored' : '')
          }
        >
          <div className="d-flex justify-content-center container">
            <img
              src={' https://h-kore.com/assets/images/logo.svg'}
              alt="Pave"
              style={{ margin: '20px' }}
            />
          </div>
        </div>
        <div
          className="img-banner d-flex align-items-center"
          style={{
            background: `url(https://h-kore.com/uploads/_1400x1400_fit_center-center_90_none/H-Kore-Connie-18-05-1721342.jpg) no-repeat center center`,
          }}
        >
          <h1 class="title container">
            MegaKore <br />
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
          </h1>
        </div>
        <div className="d-flex align-items-center center-p flex-column mb-5">
          <p>
            MegaKore is our signature workout based on the Lagree Fitness
            Method. A high intensity yet low impact muscular endurance workout
            that combines cardio exercise with core and resistance training. Our
            45-minute classes are performed on the state-of-the-art Megaformer
            machine which uses spring base resistance, allowing for a
            progressive and variable load that both challenges and supports the
            body.
          </p>
          <p>
            Expect a full-body workout that will make your body{' '}
            <i>Strengthen, Stretch & Sweat</i> while feeling muscles you have
            never felt before!
          </p>
        </div>
        <div className="container">
          <h3 className="title-sub">
            <span>MEGAKORE</span> CLASSES
          </h3>

          <div className="class-list d-flex flex-wrap">
            <div className="class-list-item">
              <img
                src={`https://h-kore.com/uploads/MK-Fundamentals-02.jpg`}
                width="100%"
              />
              <label>MEGAKORE FUNDAMENTALS</label>
              <p>
                MK FUNDAMENTALS is the perfect class for beginners or those
                brand new to the Lagree Method. In this class, you will get an
                overview of the Meagfomer, and take a deep dive into the
                fundamental Lagree moves. We will touch on the principles of the
                Lagree Method so you have a clear understanding of how and why
                we move the way we do!
              </p>
            </div>
            <div className="class-list-item">
              <img
                src={`https://h-kore.com/uploads/H-Kore-311017.jpg`}
                width="100%"
              />
              <label>MEGAKORE BASICS</label>
              <p>
                New to MegaKore? Don’t know your French Twist from your Ice
                Breaker? Don’t worry, MegaKore Basics is the perfect
                introduction to Lagree Fitness. MegaKore Basics breaks down the
                techniques and takes things at a slightly slower pace.
              </p>
            </div>
            <div className="class-list-item">
              <img src={`https://h-kore.com/uploads/aleks3.jpg`} width="100%" />
              <label>MEGAKORE</label>
              <p>
                Fancy jumping right into the thick of it? Then start with our
                regular MegaKore class. Our 45-minute Lagree Fitness classes are
                a full-body workout. They will strengthen your body, tighten
                your muscles, burn fat, improve endurance and jump-start your
                metabolism.
              </p>
            </div>
            <div className="class-list-item">
              <img
                src={`https://h-kore.com/uploads/Screen-Shot-2019-07-02-at-12.15.47-PM.png`}
                width="100%"
              />
              <label>PRE & POST NATAL</label>
              <p>
                New mums and mum’s-to-be can jump in to our Pre & Post Natal
                MegaKore classes! All exercises are modified to ensure you are
                working in a safe and appropriate manner.
              </p>
            </div>
            <div className="class-list-item">
              <img
                src={`https://h-kore.com/uploads/E-C-KK-1.jpg`}
                width="100%"
              />
              <label>KETTLEKORE BASICS</label>
              <p>
                KettleKore Basics is a blended workout that incorporates our
                Megaformer moves with a challenging Kettle Bell sequence. If
                you’ve never worked with Kettle Bells before or want to refresh
                the basics, then this is the class for you.
              </p>
            </div>
            <div className="class-list-item">
              <img
                src={`https://h-kore.com/uploads/IMG_9392.jpg`}
                width="100%"
              />
              <label className="extra-mt">
                KETTLEKORE INTERMEDIATE / ADVANCED
              </label>
              <p>
                In this class you’ll learn how to swing, squat thrust, clean and
                snatch combined with our signature MegaKore workout. Believe us
                when we say that KettleKore will provide you with one of the
                most challenging but rewarding workouts you’ll ever encounter!
              </p>
            </div>
            <div className="class-list-item">
              <img
                src={`https://h-kore.com/uploads/homepage-banner.png`}
                width="100%"
              />
              <label>MEGAKORE HIIT</label>
              <p>
                Combining cardio and strength training this class will get heart
                pumping and muscles shaking. You will start with HIIT exercises
                as a warm up to your strength training on the Mega.
              </p>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="d-flex justify-content-center">
            <img
              src={' https://h-kore.com/assets/images/logo.svg'}
              alt="Pave"
              style={{ margin: '50px' }}
            />
          </div>
          <div className="d-flex bottom container justify-content-between">
            <p>
              Copyright © 2023 - Kore-HK Limited - All Rights Reserved.
              <br />
              Produced in partnership with Digital Butter
            </p>
            <div>
              <a
                className=""
                href="https://www.facebook.com/kore-hk/"
                target="_blank"
                rel="noopener"
              >
                <i class="icon-el facebook">&nbsp;</i>
              </a>
              <a
                className=""
                href="https://www.instagram.com/hkorestudios/"
                target="_blank"
                rel="noopener"
              >
                <i class="icon-el instagram">&nbsp;</i>
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  },
);
