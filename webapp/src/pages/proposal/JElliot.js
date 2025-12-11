import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import SimpleSlider from './partials/SimpleSlider';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faInfoCircle,
  faMapMarked,
  faMapMarker,
  faMapMarkerAlt,
  faMapPin,
} from '@fortawesome/free-solid-svg-icons';

export default React.memo(
  ({
    agencyUser,
    shortlistedProject,
    translate,
    setLoading,
    contact,
    shouldTrackActivity,
    reloadShortlistedProjects,
  }) => {
    const [registered, setRegistered] = useState(null);
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
      <main id="j-elliot-root">
        <div style={{ background: '#fff' }}>
          <div className="d-flex justify-content-center container mt-3 mb-3">
            <img
              src={
                'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/j.elliot_logo_black_540x%402x.png'
              }
              alt="Pave"
              width={'113'}
            />
          </div>
        </div>
        <div className="d-flex  banner-col mt-2">
          <div
            style={{ width: '100%', height: '572px', position: 'relative' }}
            className="md"
          >
            <Image
              alt="Mountains"
              src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Mask+Group+1%402x.png"
              objectFit="cover"
              layout="fill"
            />
          </div>
          <div style={{ background: '#779BA5' }} className="center-body tt">
            <div>
              <h3 class="h-1">Spring Summer 24 Collection</h3>
              <h3 class="h-2">& Stockist Supercharge Program</h3>
              <button
                className="mt-5"
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
                  : 'Express Your Interest'}
              </button>
            </div>
          </div>
        </div>

        <div className="container text-row mt-2">
          <h3 class="h-1" style={{ marginTop: '100px' }}>
            Welcome To Our World Of Style & Opportunity!
          </h3>
          <h4 class="sh-1 mt-5">
            Get ready to elevate your sales and take your business to new
            heights!
          </h4>
          <p className="mt-4">
            Our Spring Summer 24 Collection is a stunning showcase of the latest
            trends, innovative designs, and exquisite craftsmanship. Each piece
            has been meticulously crafted to embody the essence of the season,
            combining elegance, comfort, and unparalleled quality. From vibrant
            prints to timeless classics, our collection offers a diverse range
            of styles that will captivate your customers and keep them coming
            back for more.
          </p>
          <p>
            But that’s not all. We believe in supporting our stockists in every
            way possible. That’s why we’ve developed the{' '}
            <b>Stockist Supercharge Program</b>, an exclusive initiative
            designed to turbocharge your sales and maximise your success.
            Whether you’re a well-established retailer or a boutique seeking to
            expand your offerings, this program is tailored to supercharge your
            growth.
          </p>
          <p>
            By partnering with us and joining the Stockist Supercharge Program,
            you’ll gain access to a wealth of benefits and resources. We’re
            committed to providing you with the tools you need to thrive in a
            competitive market. From tailored marketing materials and dedicated
            support to promotional opportunities, our program is designed to
            help you increase foot traffic, attract new customers, and drive
            sales.
          </p>
          <p>
            Together, we can elevate your business to unprecedented heights and
            create a lasting impact in the world of homewares.
          </p>
          <p>
            Ready to take the leap? Explore our collection, learn more about the
            program, and start your journey towards stockist success.
          </p>

          <div className="center-body mb-5">
            <button
              className="mt-5"
              style={{
                background: '#779ba5',
                color: '#fff',
                border: '1px solid #779ba5',
              }}
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
                : 'Express Your Interest'}
            </button>
          </div>
        </div>

        <div className="d-flex banner-col">
          <div
            style={{ width: '100%', height: '683px', position: 'relative' }}
            className="md"
          >
            <Image
              alt="Mountains"
              src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Pomegranate+Tea+Towel+3+Pack+50x70cm+Navy+Multi_4+(1)+(1)%402x.png"
              objectFit="cover"
              layout="fill"
            />
          </div>
          <div
            style={{ background: '#E4E9EA' }}
            className="center-body banner-w-list"
          >
            <div>
              <h3 class="h-3">What's included?</h3>
              <ul>
                <li>
                  Early access to and priority delivery on items from the Spring
                  Summer 24 collection
                </li>
                <li>
                  Visual merchandising tips from our resident expert for each
                  collection
                </li>
                <li>
                  Digital ads “What’s Working Right Now” swipe files and tips
                  from our media buying veterans
                </li>
                <li>Ecommerce optimisation tips</li>
                <li>Email marketing tips </li>
                <li>In-store retail tips from our CEO</li>
                <li>Book in 1:1 consultation at the Reed Gift Fair</li>
              </ul>
              <button
                className="mt-1"
                style={{
                  background: '#779ba5',
                  color: '#fff',
                  border: '1px solid #779ba5',
                }}
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
                  : 'Express Your Interest'}
              </button>
            </div>
          </div>
        </div>
        <div className="d-flex banner-col p-rev ">
          <div
            style={{ background: '#E4E9EA' }}
            className="center-body banner-w-list"
          >
            <div>
              <h3 class="h-3">Am I eligible?</h3>
              <ul>
                <li>You must be an existing stockists with j.elliot</li>
                <li>
                  If you’re not yet a stockist, please register with your store
                  location and Instagram bio
                </li>
                <li>
                  Need to place an order for either the AW23 collection or made
                  an order with j.elliot in the past 3 months.
                </li>
              </ul>
              <button
                className="mt-1"
                style={{
                  background: '#779ba5',
                  color: '#fff',
                  border: '1px solid #779ba5',
                  width: '220px',
                }}
                onClick={() => {
                  window.location = 'https://jelliot.com.au/account/login';
                }}
              >
                Register
              </button>
            </div>
          </div>
          <div
            style={{ width: '100%', height: '683px', position: 'relative' }}
            className="md"
          >
            <Image
              alt="Mountains"
              src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Brooks+Serving+Tray+45x13cm+Whitewash_3%402x.png"
              objectFit="cover"
              layout="fill"
            />
          </div>
        </div>
        <div className="container">
          <h3 class="h-4 mt-5 mb-5">Shop Spring Summer 24 Collections</h3>

          <div
            className="d-flex grid-items justify-content-center"
            style={{ marginBottom: '2em' }}
          >
            <div
              style={{
                width: '300px',
                height: '300px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.location =
                  'https://jelliot.com.au/collections/soft-serenity-collection';
              }}
            >
              <div className="mask"></div>
              <Image
                alt="Mountains"
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Group+15%402x.png"
                objectFit="cover"
                layout="fill"
              />
              <b>Soft Serenity Collection</b>
            </div>
            <div
              style={{
                width: '300px',
                height: '300px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.location =
                  'https://jelliot.com.au/collections/colourburst-collection';
              }}
            >
              <div className="mask"></div>
              <Image
                alt="Mountains"
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Group+16%402x.png"
                objectFit="cover"
                layout="fill"
              />
              <b>Colourburst Collection</b>
            </div>
            <div
              style={{
                width: '300px',
                height: '300px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.location =
                  'https://jelliot.com.au/collections/island-breeze-collection';
              }}
            >
              <div className="mask"></div>
              <Image
                alt="Mountains"
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Group+17%402x.png"
                objectFit="cover"
                layout="fill"
              />
              <b>Island Breeze Collection</b>
            </div>
          </div>

          <div className="d-flex grid-items justify-content-center">
            <div
              style={{
                width: '300px',
                height: '300px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.location =
                  'https://jelliot.com.au/collections/bindi-collection';
              }}
            >
              <div className="mask"></div>
              <Image
                alt="Mountains"
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Group+18%402x.png"
                objectFit="cover"
                layout="fill"
              />
              <b>Bindi Napery & Serveware Collection</b>
            </div>
            <div
              style={{
                width: '300px',
                height: '300px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.location =
                  'https://jelliot.com.au/collections/fruit-napery-serveware-collections';
              }}
            >
              <div className="mask"></div>
              <Image
                alt="Mountains"
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Group+19%402x.png"
                objectFit="cover"
                layout="fill"
              />
              <b>Fruit Napery & Serveware Collection</b>
            </div>
            <div
              style={{
                width: '300px',
                height: '300px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.location =
                  'https://jelliot.com.au/collections/tropical-napery-serveware-collection';
              }}
            >
              <div className="mask"></div>
              <Image
                alt="Mountains"
                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Group+20%402x.png"
                objectFit="cover"
                layout="fill"
              />
              <b>Tropical Napery & Serveware Collection</b>
            </div>
          </div>
        </div>

        <div className="d-flex banner-col " style={{ marginTop: '100px' }}>
          <div
            style={{ width: '100%', height: '670px', position: 'relative' }}
            className="md"
          >
            <Image
              alt="Mountains"
              src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/Bindi+Cushion+50x50cm+Mint+%26+Ivory_5%402x.png"
              objectFit="cover"
              layout="fill"
            />
          </div>
          <div style={{ background: '#779BA5' }} className="center-body tt">
            <div className="center-body ">
              <h3 class="h-5">We're exhibiting at</h3>

              <img
                src={
                  'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/reed.png'
                }
                alt="Pave"
                className="list-fimg"
                width={'60%'}
              />
              <div className="list-f d-flex">
                <div>
                  <FontAwesomeIcon
                    icon={faCalendar}
                    color={'#fff'}
                    style={{ margin: '20px 10px' }}
                    height={'20px'}
                  />{' '}
                  5 - 9 August 2023
                </div>

                <div>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color={'#fff'}
                    style={{ margin: '20px 10px' }}
                    height={'20px'}
                  />{' '}
                  Standard R42
                </div>
                <div>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    color={'#fff'}
                    style={{ margin: '20px 10px' }}
                    height={'20px'}
                  />{' '}
                  MCEC Melbourne
                </div>
                <div>
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    color={'#fff'}
                    style={{ margin: '20px 10px' }}
                    height={'20px'}
                  />{' '}
                  300 + new SKUs
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            background: '#fff',
            paddingBottom: '20px',
            paddingTop: '20px',
          }}
        >
          <div className="d-flex justify-content-center container mt-3">
            <img
              src={
                'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/j.elliot_logo_black_540x%402x.png'
              }
              alt="Pave"
              width={'113'}
            />
          </div>
        </div>
      </main>
    );
  },
);
