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
    project,
    customStyle,
  }) => {
    const [registered, setRegistered] = useState(false);
    const [hasCampaign, setHasCampaign] = useState(false);
    const [viewMore, setViewMore] = useState(false);
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
      <main id="breathe-pilates-root">
        <div
          className={
            'header-transitioning ' +
            (scrollPosition >=
            ('undefined' != typeof screen && screen?.height - 200)
              ? 'colored'
              : '')
          }
        >
          <div className="d-flex justify-content-center container">
            <img
              src={
                'https://www.breathepilates.com.sg/wp-content/themes/breathe/img/logo2.png'
              }
              alt="Pave"
              height={'16px'}
              style={{ margin: '20px' }}
            />
          </div>
        </div>
        <div className="banner-cover-img"></div>
        <div className="centered container l">
          <img
            src="https://www.breathepilates.com.sg/wp-content/themes/breathe/img/line2.png"
            className="lines"
          />
          <h2 className="heading">ABOUT BREATHE</h2>
          <h1 style={{ textAlign: 'center' }}>
            Breathe Pilates Studio Singapore
          </h1>
          <h2 style={{ textAlign: 'center' }}>
            At Breathe, we believe that everyone is entitled to freedom
            of&nbsp;movement.
          </h2>

          <div>
            <p style={{ textAlign: 'center' }}>
              Moving well is about having the awareness, strength and
              flexibility required to control your body in daily activities.
            </p>
            <p style={{ textAlign: 'center' }}>
              As a MERRITHEW™ Licensed Training Center, Breathe is recognised in
              Singapore and throughout the region for its quality teaching and
              Pilates courses.
            </p>
            <p style={{ textAlign: 'center' }}>
              We offer small group classes led by experienced instructors with
              teaching styles from all over the world and a supporting team of
              healthcare professionals that truly understand real bodies.
              Experience the best Pilates classes Singapore has to offer at
              Breathe.
            </p>
          </div>
        </div>

        <div className="centered btn-wrap">
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              if (!registered) {
                handleCTA();
              }
            }}
          >
            {registered
              ? hasCampaign
                ? 'REGISTERED, SEE YOU THERE!'
                : 'THANKS, WE WILL BE IN TOUCH!'
              : hasCampaign
              ? 'PRESS HERE TO SIGN UP IN ONE CLICK!'
              : 'REGISTER INTEREST'}
          </button>
        </div>

        <div
          className="img-banner"
          style={{
            background: `url(https://www.breathepilates.com.sg/wp-content/uploads/2017/04/2560x600_0016_Breathe-Lifestyle-3-copy.jpg?id=516) no-repeat center center`,
          }}
        ></div>

        <div className="centered">
          <img
            src="https://www.breathepilates.com.sg/wp-content/themes/breathe/img/line2.png"
            className="lines"
          />
        </div>

        <div style={{ textAlign: 'center' }} className="container l">
          <h2 className="heading">OUR CLASSES</h2>

          <p style={{ textAlign: 'center' }}>
            We offer the most up to date methods in mindful movement.
          </p>
          <p style={{ textAlign: 'center' }}>
            Adopting a contemporary approach to Pilates, we offer both private
            sessions and group Pilates Classes. If you have not had any prior
            experience in Pilates, we strongly recommend starting with a few
            private sessions for movement analysis and customised exercise
            prescription.
          </p>
          <p style={{ textAlign: 'center' }}>
            In addition to our Pilates Classes, we also offer the GYROTONIC®
            method as part of our rehabilitative and fitness training
            programmes. With over 100 different types of specialised classes a
            week across 4 locations island-wide, you will be able to find a
            class that suits your schedule at one of our studios. Whether it is
            about reformer classes, rehab or prenatal classes, we got you
            covered.
          </p>
          <p style={{ textAlign: 'center' }}>
            The GYROTONIC® training method aims to promote a variety of body
            movement ranges. The training sequence includes spiraling, and
            circular movements and has its roots in Tai Chi, Dance, Swimming and
            Yoga. GYROTONIC® is excellent for boosting the spine’s functional
            and rotational capacity, as well as other rotational joints
            including the shoulder, knee, and wrist.
          </p>
          <p style={{ textAlign: 'center' }}>
            GYROTONIC® and GYROKINESIS® are registered trademarks of Gyrotonic
            Sales Corp and are used with their permission.
          </p>
        </div>

        {/* <div className="centered btn-wrap" style={{ marginTop: '50px' }}>
          <a
            href={`http://www.breathepilates.com.sg/classes-and-prices/`}
            className="action-btn"
          >
            VIEW OUR CLASSES
          </a>
        </div> */}

        <div
          className="img-banner"
          style={{
            background: `url(https://www.breathepilates.com.sg/wp-content/uploads/2017/04/2560x600_0014_Breathe-Lifestyle-1.jpg?id=514) no-repeat center center`,
          }}
        ></div>

        <div className="centered">
          <img
            src="https://www.breathepilates.com.sg/wp-content/themes/breathe/img/line2.png"
            className="lines"
          />
        </div>

        <div
          style={{ textAlign: 'center', marginBottom: '30px' }}
          className="container l"
        >
          <h2 className="heading">OUR INSTRUCTORS</h2>

          <p style={{ textAlign: 'center' }}>
            Breathe has an internationally trained team of highly qualified
            Pilates instructors with a wealth of experience in helping
            individuals achieve the freedom of movement through Pilates. We
            demonstrate Pilates movements, guide individuals of all ages,
            shapes, and sizes to practice them correctly, and motivate them with
            positive feedback.
          </p>

          {viewMore && (
            <>
              <p style={{ textAlign: 'center' }}>
                Passionate about Pilates and movement, our team of dedicated
                Pilates instructors have comprehensive certifications and
                specialisations in Pilates and other movement modalities and
                techniques.
              </p>

              <p style={{ textAlign: 'center' }}>
                Pilates is a complex exercise that is beneficial to both your
                physical and mental health. That is why we’ve picked the best
                Pilates Trainers based on these four aspects.
              </p>

              <h3 style={{ textAlign: 'center' }}>
                <strong>Education Backed By Experience</strong>
              </h3>

              <p style={{ textAlign: 'center' }}>
                We have highly-qualified Pilates trainers who are skilled and
                experienced with up-to-date techniques and modern research. Our
                instructors are open and friendly and love sharing their
                knowledge so you get the best out of your session.
              </p>

              <h3 style={{ textAlign: 'center' }}>
                <strong>Core Knowledge </strong>
              </h3>

              <p style={{ textAlign: 'center' }}>
                Each one of our trainers know the values and deep understanding
                of the core Pilates methods created by Joseph Pilates. Because
                without that, we will not be able to modify exercises based on
                individual needs.
              </p>

              <h3 style={{ textAlign: 'center' }}>
                <strong>Passion</strong>
              </h3>

              <p style={{ textAlign: 'center' }}>
                We share a deep love and respect for pilates methods and are
                extremely passionate about what we do. An excellent Pilates
                Instructor will put YOU first in the studio and that is what
                Breathe does.
              </p>

              <h3 style={{ textAlign: 'center' }}>
                <strong>Self Mastery</strong>
              </h3>
              <p style={{ textAlign: 'center' }}>
                Our Pilates Teachers have completed extensive self-mastery, and
                explored different strategies and learning styles to connect
                with clients to achieve their exercise goals.
              </p>
              <p style={{ textAlign: 'center' }}>
                Our Pilates instructors in Singapore follow a holistic Pilates
                Training approach and are skilled at evaluating a person’s
                entire being: physically, cognitively, emotionally, and
                spiritually.
              </p>
              <p style={{ textAlign: 'center' }}>
                We pride ourselves on offering the best Pilates reformer
                sessions within the best Pilates studio environment. Our
                instructors are involved in continuing education courses to
                expand their knowledge and stay up to date with the latest
                developments in exercise science to deliver you the best results
                from your practice. If you’re interested, you can straight away
                take a look at our Pilates Classes in Singapore for bookings.
              </p>
              <p style={{ textAlign: 'center' }}>
                Beyond our Pilates Courses, we also have Pilates Instructors
                Training at four different locations in Singapore for
                individuals who want to pursue a career as a Pilates expert.
                Breathe Pilates Teacher Training Courses in Singapore not only
                provide you with a Pilates certification but also equips you
                with the practical abilities you’ll need to become a top-notch
                Pilates instructor.
              </p>
            </>
          )}
        </div>

        <div className="centered btn-wrap" style={{ marginBottom: '30px' }}>
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              setViewMore(!viewMore);
            }}
          >
            VIEW {viewMore ? 'LESS' : 'MORE'}
          </button>
        </div>

        {/* <div style={{ textAlign: 'center' }} className="container l">
          <h2 className="heading">Contact Us</h2>

          <p style={{ textAlign: 'center', marginBottom: '50px' }}>
            Still have questions about our Pilates Courses? Visit our{' '}
            <a href={`https://www.breathepilates.com.sg/faqs/`}>FAQ</a> section
            or you can always{' '}
            <a href={`https://wa.me/6598355683`}>contact us via WhatsApp</a>. We
            are happy to answer any questions you have.
          </p>
        </div> */}

        <div
          className="img-banner"
          style={{
            background: `url(https://www.breathepilates.com.sg/wp-content/uploads/2019/12/BP-034.jpg?id=1982) no-repeat center center`,
          }}
        ></div>

        {/* <div className="centered btn-wrap">
          <a
            href={`http://www.breathepilates.com.sg/our-instructors/`}
            className="action-btn"
          >
            VIEW OUR INSTRUCTORS
          </a>
        </div> */}

        <div className=" container mobile-footer centered pt-4">
          <img
            src="https://www.breathepilates.com.sg/wp-content/themes/breathe/img/footerlogo2.png"
            class="img-responsive"
            style={{ height: '10px', marginBottom: '15px' }}
          />
          <br />
          <a
            href="mailto:info@breathepilates.com.sg"
            style={{
              textDecoration: 'none',
              display: 'block',
              marginBottom: '5px',
              fontFamily: 'Post Grotesk',
            }}
          >
            info@breathepilates.com.sg
          </a>
          <a
            href="tel:+65 65710665"
            style={{
              textDecoration: 'none',
              display: 'block',
              fontFamily: 'Post Grotesk',
            }}
          >
            +65 65710665
          </a>
        </div>

        <section
          style={{ background: '#dfe8dd', fontSize: '14px' }}
          className="footer"
        >
          <div
            className="container d-flex justify-content-center align-items-center footer-list"
            style={{ gap: '4em' }}
          >
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <img
                src="https://www.breathepilates.com.sg/wp-content/uploads/2017/05/logo-01.svg"
                style={{ height: '100px', marginBottom: '6px' }}
              />
              <br />
              <a href="mailto:info@breathepilates.com.sg">
                info@breathepilates.com.sg
              </a>
              <br />
              <a href="tel:+65 65710665">+65 65710665</a>
            </div>
            <div className="centered" style={{ paddingTop: '40px' }}>
              Novena Medical Centre
              <p>
                10 Sinaran Drive, #09-05/31/33
                <br />
                Singapore 307506
              </p>
              Galaxis
              <p>
                1 Fusionopolis Place, #01-04
                <br />
                Singapore 138522
              </p>
            </div>

            <div className="centered" style={{ paddingTop: '40px' }}>
              Parkway Centre
              <p>
                1 Marine Parade Central, #13-01/02
                <br />
                Singapore 449408
              </p>
              6 Raffles Quay
              <p>
                6 Raffles quay #11-02
                <br />
                Singapore 048580
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  },
);
