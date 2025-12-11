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
      <main id="hybrid-hk-root" className="gym">
        <section className="bg-black pb-5">
          <div className="logo-lg pt-5">
            <img
              src="https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=500&name=new%20hybrid%20logo-08-1.png"
              width="500px"
              srcSet="https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=250&name=new%20hybrid%20logo-08-1.png 250w, https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=500&name=new%20hybrid%20logo-08-1.png 500w, https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=750&name=new%20hybrid%20logo-08-1.png 750w, https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=1000&name=new%20hybrid%20logo-08-1.png 1000w, https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=1250&name=new%20hybrid%20logo-08-1.png 1250w, https://join.thehybridgymgroup.com/hs-fs/hubfs/new%20hybrid%20logo-08-1.png?width=1500&name=new%20hybrid%20logo-08-1.png 1500w"
              sizes="(max-width: 500px) 100vw, 500px"
            />
          </div>
          <div className="container">
            <hr className="hr-line" />
            <div className="d-flex header-img">
              <div>
                <img
                  src="https://join.thehybridgymgroup.com/hubfs/hqueens%20group-04.jpg"
                  width={'100%'}
                />
              </div>
              <div>
                <img
                  src="https://join.thehybridgymgroup.com/hs-fs/hubfs/intro%20offer-05.jpg?width=2364&height=2364&name=intro%20offer-05.jpg"
                  width={'100%'}
                />
              </div>
            </div>
            <div className="center-item mt-3">
              <button
                type="button"
                className="action-btn two"
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
        </section>
        <section className="container">
          <div className=" p-g">
            <h2 className="g-h2">Action-packed classes throughout the week!</h2>

            <p>
              From beginners to experienced athletes, there is something for
              everyone from group fitness to learning martial arts with our
              world class coaching team.
            </p>
            <p>
              Customised, fun workouts in a small group setting using
              conventional modalities of fitness training through to elite
              levels of strength and conditioning. Take your pick from our array
              classes throughout the week from 5:30AM to 9PM.
            </p>
            <p>
              We have a coach and a class for every ability, and every schedule.
              Take your first step and book your{' '}
              <strong>FREE CONSULTATION</strong> today!
            </p>
          </div>
        </section>
        <section className="container">
          <div className="d-flex img-p-list flex-wrap">
            <div>
              <img
                src="https://join.thehybridgymgroup.com/hubfs/mma-04.jpg"
                width={'100%'}
              />
              <div className=" p-g-2">
                <h2 className="g-h2">MMA (Mixed Martial Arts)</h2>

                <p>
                  MMA is the evolution of multiple martial arts mixed into one.
                  With the creation of UFC and cage fighting around the world it
                  is clear MMA is the pinnacle of all martial arts.
                </p>
                <p>
                  Hybrid has created an MMA program utilizing the best of the
                  best techniques from Jiu Jitsu, boxing, Muay Thai and
                  wrestling into a program adjusted for beginner to advanced.
                </p>
                <p>
                  Our professional trainers have developed a challenging but
                  safe atmosphere in order to learn MMA, the most elite martial
                  art on the planet.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://join.thehybridgymgroup.com/hs-fs/hubfs/classes%20info-07.jpg?width=2364&height=2364&name=classes%20info-07.jpg"
                width={'100%'}
              />
              <div className=" p-g-2">
                <h2 className="g-h2">Brazilian Jiu-Jitsu</h2>

                <p>
                  Brazilian Jiu-Jitsu has proven to be the most effective ground
                  fighting martial arts today. Learn how to utilising chokes and
                  joint locks in order to submit your opponent, no matter their
                  size!
                </p>
                <p>
                  Our one hour classes include a light warm-up, stretching,
                  learning techniques followed by sparring. New members and
                  beginners are encouraged to try both of the no-gi classes (in
                  a t-shirt and shorts), or the traditional gi Jiu Jitsu classes
                  (pictured).
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://join.thehybridgymgroup.com/hubfs/mma-06.jpg"
                width={'100%'}
              />
              <div className=" p-g-2">
                <h2 className="g-h2">Muay Thai</h2>

                <p>
                  Muay Thai is regarded as one of the most effective striking
                  martial arts today. Our program has been developed by our
                  expert Muay Thai fighters and trainers after years of
                  experience. This excellent striking program will allow you to
                  develop effective techniques of punching, kicking, drills, pad
                  work, foot work as well as be a sweat-inducing workout
                  designed to get you in shape.
                </p>
                <p>
                  Great for all levels, this is one of our most popular programs
                  to get a great workout and make new friends.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://join.thehybridgymgroup.com/hubfs/Hybrid%20HIIT%20.png"
                width={'100%'}
              />
              <div className=" p-g-2">
                <h2 className="g-h2">Hybrid Conditioning</h2>

                <p>
                  Conditioning-focussed, fast-paced, fun sessions designed to
                  push members to their threshold in individual and team
                  workouts. Hybrid Conditioning/HIIT sessions will train members
                  across all energy systems to improve recovery, work capacity.
                  Members can expect to learn new skills, be tested, and track
                  their progress on a weekly basis and leave each session
                  knowing they'll be burning calories for hours. The goal of
                  these classes is to improve recoverability, efficiency, power
                  and work capacity to allow members to train harder, and
                  longer.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://join.thehybridgymgroup.com/hubfs/hybrid%20athlete.png"
                width={'100%'}
              />
              <div className=" p-g-2">
                <h2 className="g-h2">Hybrid Athlete</h2>

                <p>
                  A combination of lifting, sleds drags, weighted carries,
                  unilateral training, Olympic lifting, rounded off with
                  specific conditioning blocks; Hybrid Athlete is our most
                  technically and physically demanding class. Each training day
                  has a specific focus to form a methodical complete cycle to
                  allow our athletes to strengthen across all areas and address
                  any imbalances or weaknesses.
                </p>
                <p>
                  These sessions are aimed at individuals wanting to improve
                  athletic performance, or for those who want to train and move
                  like an athlete.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://join.thehybridgymgroup.com/hubfs/hybrid%20GT%20class-05.png"
                width={'100%'}
              />
              <div className=" p-g-2">
                <h2 className="g-h2">Strength & Power</h2>

                <p>
                  Hybrid’s daily Strength & Power class focuses on ‘the big
                  three’ lifts - the squat, bench press, and deadlift - combined
                  with challenging, technical blocks of Olympic variations. This
                  monthly periodised programme is perfect for members looking to
                  improve their overall lifting abilities and skills with a
                  barbell. Track your strength as it increases month on month as
                  our Hybrid Head of Programming coach meticulously plans every
                  aspect to keep it challenging, interesting, and ensure you
                  keep making progress.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className=""
          style={{
            paddingTop: '40px',
            paddingBottom: '40px',
            paddingLeft: '20px',
            paddingRight: '20px',
            backgroundColor: 'rgba(248, 250, 252, 1)',
            marginTop: '30px',
          }}
        >
          <div className="container social-links social-links--center social-links--black">
            <a
              href="http://www.facebook.com/hybridgymhk"
              className="social-links__icon social-links__icon--{link={url={type=EXTERNAL, content_id=null, href=http://www.facebook.com/hybridgymhk}, open_in_new_tab=true, no_follow=false, sponsored=false, user_generated_content=false, rel=noopener}, network=facebook}"
              style={{ paddingLeft: '1px', paddingRight: '1px' }}
              target="_blank"
              rel="noopener"
            >
              <span
                className="fb social-links__icon-wrapper social-links__icon-wrapper--circle social-links__icon-wrapper--black"
                style={{ color: '#fff', height: '40px', width: '40px' }}
              >
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 264 512"
                  aria-hidden="true"
                >
                  <g id="facebook-f1_layer">
                    <path d="M76.7 512V283H0v-91h76.7v-71.7C76.7 42.4 124.3 0 193.8 0c33.3 0 61.9 2.5 70.2 3.6V85h-48.2c-37.8 0-45.1 18-45.1 44.3V192H256l-11.7 91h-73.6v229"></path>
                  </g>
                </svg>
              </span>
            </a>

            <a
              href="www.instagram.com/hybridgymhk?hsLang=en"
              className="social-links__icon social-links__icon--{link={url={type=EXTERNAL, content_id=null, href=www.instagram.com/hybridgymhk}, open_in_new_tab=true, no_follow=false, sponsored=false, user_generated_content=false, rel=noopener}, network=instagram}"
              style={{ paddingLeft: '1px', paddingRight: '1px' }}
              target="_blank"
              rel="noopener"
            >
              <span
                className="social-links__icon-wrapper social-links__icon-wrapper--circle social-links__icon-wrapper--black"
                style={{ color: '#fff', height: '40px', width: '40px' }}
              >
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  aria-hidden="true"
                >
                  <g id="instagram2_layer">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                  </g>
                </svg>
              </span>
            </a>

            <a
              href="mailto:info@hybridmmafit.com"
              className="social-links__icon social-links__icon--{link={url={type=EMAIL_ADDRESS, content_id=null, href=info@hybridmmafit.com}, open_in_new_tab=true, no_follow=false, sponsored=false, user_generated_content=false, rel=noopener}, network=mail}"
              style={{ paddingLeft: '1px', paddingRight: '1px' }}
              target="_blank"
              rel="noopener"
            >
              <span
                className="social-links__icon-wrapper social-links__icon-wrapper--circle social-links__icon-wrapper--black"
                style={{ color: '#fff', height: '40px', width: '40px' }}
              >
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                >
                  <g id="envelope3_layer">
                    <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path>
                  </g>
                </svg>
              </span>
            </a>

            <a
              href="http://www.hybridgymgroup.com"
              className="social-links__icon social-links__icon--{link={url={type=EXTERNAL, content_id=null, href=http://www.hybridgymgroup.com}, open_in_new_tab=true, no_follow=false, sponsored=false, user_generated_content=false, rel=noopener}, network=website, network_image=null, supporting_text=null}"
              style={{ paddingLeft: '1px', paddingRight: '1px' }}
              target="_blank"
              rel="noopener"
            >
              <span
                className="social-links__icon-wrapper social-links__icon-wrapper--circle social-links__icon-wrapper--black"
                style={{ color: '#fff', height: '40px', width: '40px' }}
              >
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                >
                  <g id="link4_layer">
                    <path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path>
                  </g>
                </svg>
              </span>
            </a>

            <a
              href="https://www.linkedin.com/company/hybridgymgroup"
              className="social-links__icon social-links__icon--{link={url={type=EXTERNAL, content_id=null, href=https://www.linkedin.com/company/hybridgymgroup}, open_in_new_tab=true, no_follow=false, sponsored=false, user_generated_content=false, rel=noopener}, network=linkedin, network_image=null, supporting_text=null}"
              style={{ paddingLeft: '1px', paddingRight: '1px' }}
              target="_blank"
              rel="noopener"
            >
              <span
                className="social-links__icon-wrapper social-links__icon-wrapper--circle social-links__icon-wrapper--black"
                style={{ color: '#fff', height: '40px', width: '40px' }}
              >
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  aria-hidden="true"
                >
                  <g id="linkedin-in5_layer">
                    <path d="M100.3 480H7.4V180.9h92.9V480zM53.8 140.1C24.1 140.1 0 115.5 0 85.8 0 56.1 24.1 32 53.8 32c29.7 0 53.8 24.1 53.8 53.8 0 29.7-24.1 54.3-53.8 54.3zM448 480h-92.7V334.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V480h-92.8V180.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V480z"></path>
                  </g>
                </svg>
              </span>
            </a>

            <a
              href="https://wa.me/85252409918"
              className="social-links__icon social-links__icon--{link={url={type=EXTERNAL, content_id=null, href=https://wa.me/85252409918}, open_in_new_tab=true, no_follow=false, sponsored=false, user_generated_content=false, rel=noopener}, network=whatsapp, network_image=null, supporting_text=null}"
              style={{ paddingLeft: '1px', paddingRight: '1px' }}
              target="_blank"
              rel="noopener"
            >
              <span
                className="social-links__icon-wrapper social-links__icon-wrapper--circle social-links__icon-wrapper--black"
                style={{ color: '#fff', height: '40px', width: '40px' }}
              >
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  aria-hidden="true"
                >
                  <g id="whatsapp6_layer">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                  </g>
                </svg>
              </span>
            </a>
          </div>
        </section>
      </main>
    );
  },
);
