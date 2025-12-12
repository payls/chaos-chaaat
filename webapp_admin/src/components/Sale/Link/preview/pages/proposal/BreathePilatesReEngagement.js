import React, { useEffect, useState } from 'react';
import 'animate.css';

const photoItems = [
  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0000_Breathe-Studio-Shoot1153.jpg',
    title: 'Fat Blast',
    description: `Integrating the Pilates principles of control, balance and
posture into a fast-paced, “fat-burning” workout, this group
class mixes graceful, ballet-inspired movements with traditional
cardio favourites on the reformer while continually emphasising
the core-strengthening elements.`,
  },
  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0003_Breathe-Studio-Shoot1121.jpg',
    title: 'Stretch Pilates',
    description: `Designed to provide a gentle workout while giving you a deep stretch on the reformer, these classes feature a fluid series of stretches, myofascial releases and gentle core-strengthening exercises to reduce body aches and increase flexibility.`,
  },
  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0002_Breathe-Studio-Shoot1132.jpg',
    title: 'Postnatal Pilates',
    description: `Postnatal Pilates is a gentle reformer class that aims to help postnatal mums regain core strength, awareness and functionality after birth. New mums will also work on the upper body and develop shoulder girdle strength as the baby grows. This is a highly recommended developmental program for both the mother and child.`,
  },

  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0001_Breathe-Studio-Shoot1139.jpg',
    title: 'Prenatal Pilates',
    description: `Experience Singapore’s best Prenatal Pilates sessions with our team of experienced instructors and healthcare professionals. Prenatal Pilates focuses on strengthening the pelvic floor and back muscles to help mothers have a smooth pregnancy, delivery and recovery. Sessions also focus on working on the neck and shoulder stability during pregnancy in preparation for increased upper body […]`,
  },

  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0006_Breathe-Studio-Shoot1036.jpg',
    title: 'Reformer and Tower Group',
    description: `All our combined Pilates Reformer and Tower classes allow you to enjoy the best of both worlds. The reformer can challenge balance, strength and mobility while the tower provides many variations of exercise. Kept to a maximum of 6 people, our classes are small to ensure attention to detail.`,
  },
  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0005_Breathe-Studio-Shoot1074.jpg',
    title: 'Private Pilates',
    description: `Available as one-on-one (private) or one-on-two (duet) session, you will utilise the full range of Pilates equipment in an hour-long session with exercises designed to address your specific needs and goals. Enjoy the flexibility of booking sessions at a time convenient to you as you progress at your own pace at Singapore’s leading Pilates studio.`,
  },

  {
    imgUrl:
      'https://www.breathepilates.com.sg/wp-content/uploads/2017/04/560x417_0004_Breathe-Studio-Shoot1102-2.jpg',
    title: 'Clinical Pilates',
    description: `MOBILITY Using exercises and props, this class is designed to help you develop maximum body control, flexibility and strength throughout your joints’ full range of motion, improving overall joint mobility and longevity. Created by Breathe Education Director, Thicha Srivisal   Clinical Pilates is based on the original Pilates technique created by Joseph Pilates in the […]`,
  },
];

export default React.memo(() => {
  return (
    <main id="breathe-pilates-root" className="greenish">
      <div className={'header-fixed'}>
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
      <div style={{ marginTop: '55px' }}></div>

      <div
        className="d-flex container gap-2 align-items-center flex-row fff"
        style={{ textAlign: 'center', gap: '2em' }}
      >
        <div style={{ zIndex: 1, flex: '1 50%' }}>
          <div
            className="img-banner"
            style={{
              background: `url(https://www.breathepilates.com.sg/wp-content/uploads/2017/04/2560x600_0024_Breathe-Lifestyle-11.jpg?id=524) no-repeat center center`,
              height: '345px',
            }}
          ></div>
        </div>
        <div style={{ zIndex: 1, padding: '20px', flex: '1 50%' }}>
          <h3>We Miss You</h3>

          <p>
            Pilates is a fantastic mind-body practice that can enhance your
            flexibility, strength, and overall well-being. However, to achieve
            lasting results, it's crucial to maintain a regular routine.
            <br />
            <br />
            For this month only, we would like to offer you 10% off your next
            package purchase if you decide to return to one of our four studios
            (Novena, Parkway, Raffles Quay or Galaxis). Hurry, our promotion
            ends 30 April, 2023. <br />
            <br />
          </p>
          <div className="centered btn-wrap">
            <button type="button" className="action-btn">
              CHAT WITH US
            </button>
          </div>
        </div>
      </div>

      {/* <div
        className="img-banner"
        style={{
          background: `url(https://www.breathepilates.com.sg/wp-content/uploads/2017/04/2560x600_0024_Breathe-Lifestyle-11.jpg?id=524) no-repeat center center`,
        }}
      ></div>

      <div className="centered">
        <img
          src="https://www.breathepilates.com.sg/wp-content/themes/breathe/img/line2.png"
          className="lines"
        />
      </div>

      <div style={{ textAlign: 'center' }} className="container l">
        <h2 className="heading">Classes and Prices</h2>

        <p style={{ textAlign: 'center' }}>
          Reformer Classes & Prices in Singapore
        </p>
        <p style={{ textAlign: 'center' }}>
          Here at Breathe, a one-on-one consultation with us or together with
          our doctors is paramount to customizing the best exercise for you.
        </p>
        <p style={{ textAlign: 'center' }}>
          You are unique and so are your needs. With a wide variety of classes,
          we offer the most up to date methods in fitness and rehabilitation for
          everyone. Whether you choose a private session or group class, you
          will work on exercises designed for your body’s needs.
        </p>
      </div>

      <div className="centered btn-wrap">
        <button type="button" className="action-btn">
          PRESS HERE TO SIGN UP IN ONE CLICK!
        </button>
      </div> */}

      <div className="container d-flex flex-wrap photo-wrapper mb-5">
        {photoItems.map((item) => (
          <div
            className="photo-wrapper-item  animate-fadeIn"
            style={{
              background: `url(${item.imgUrl})`,
            }}
          >
            <div className="photo-wrapper-overlay d-flex flex-column align-items-center justify-content-center">
              <span>{item.title}</span>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container d-flex flex-wrap session-list align-items-center justify-content-center mb-5">
        {/* <div className="session-list-item">
            <span>New Clients</span>
            <br />
            3 Private Sessions or <br />4 Duet Sessions
            <p></p>
            <strong>$363 / $429* / $540**</strong>
            <small>Valid for 2 months</small>
            <hr />
            3 Private or 4 Duet Sessions
            <br />+ 5 Group Sessions
            <p></p>
            <strong>$611 / $677* / $788**</strong>
            <small>Valid for 3 months</small>
            <p>
              <small className="fix-bottom">
                *Session held
                <br />
                by Senior Instructor
                <br />
                ** Session held by Instructor Trainer
              </small>
            </p>
          </div> */}
        <div className="session-list-item">
          <span>Private Sessions</span>
          <br />
          Single Private Session
          <p></p>
          <strong>$143 / $165* / $250**</strong>
          <hr />
          10 Private Sessions
          <br />
          <p></p>
          <strong>$1320 / $1540* / $2000**</strong>
          <small>Valid for 5 months</small>
          <hr />
          20 Private Sessions
          <p></p>
          <strong>$2420 / $2860* / $3200**</strong>
          <small>Valid for 9 months</small>
          <p>
            <small className="fix-bottom">
              *Session held
              <br />
              by Senior Instructor
              <br />
              ** Session held by Instructor Trainer
            </small>
          </p>
        </div>
        <div className="session-list-item">
          <span>Hybrid Sessions</span>
          <br />
          5 Private and
          <br /> 5 Group sessions
          <p></p>
          <strong>$924 / $1034* / $1260**</strong>
          <small>Valid for 5 months</small>
          <hr />
          10 Private and
          <br />
          10 Group sessions
          <p></p>
          <strong>$1705 / $1925* / $2275**</strong>
          <small>Valid for 9 months</small>
          <p>
            <small className="fix-bottom">
              *Session held
              <br />
              by Senior Instructor
              <br />
              ** Session held by Instructor Trainer
            </small>
          </p>
        </div>

        <div className="session-list-item">
          <span>Group Sessions</span>
          <br />
          Single Group Session
          <p></p>
          <strong>$61</strong>
          <hr />
          10 Group sessions
          <p></p>
          <strong>$528</strong>
          <small>Valid for 5 months</small>
          <hr />
          20 Group Sessions
          <p></p>
          <strong>$990</strong>
          <small>Valid for 9 months</small>
        </div>

        <div className="session-list-item">
          <span>Duet Sessions</span>
          <br />
          Single Session
          <p></p>
          <strong>$94 / $116* / $140**</strong>
          <hr />
          10 Sessions
          <p></p>
          <strong>$880 / $1045* / $1200**</strong>
          <small>Valid for 5 months</small>
          <br />
          PRICES PER PAX
          <p></p>
          <p>
            <small className="fix-bottom">
              *Session held
              <br />
              by Senior Instructor
              <br />
              ** Session held by Instructor Trainer
            </small>
          </p>
        </div>
      </div>

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
});
