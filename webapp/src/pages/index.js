import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { useRouter } from 'next/router';
import { routes } from '../configs/routes';
import Link from 'next/link';
import propertyData from '../data/property-data.json';
import { api } from '../api';
import { redirectToHome } from '../helpers/route';

export default function Index() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [countries, setCountries] = useState([]);
  const [translations, setTranslations] = useState({
    header_title: {
      text: 'Buying and managing overseas properties without the hassle. Welcome to Pave.',
    },
    browse_properties: {
      text: 'Browse Properties',
    },
    description: {
      text: "Whether you're buying your first property to live in, an investment property to rent out, or simply want a little getaway for the holidays, Pave is your tech-enabled partner for the entire cycle of your real estate assets. Our professional consultants are on hand to help 24/7.",
    },
    featured: {
      text: 'As featured in',
    },
    location: {
      text: 'Find the location for you',
    },
    partners: {
      text: 'Our Partners',
    },
    why_pave_header: {
      text: 'Why Pave?',
    },
    why_pave_description: {
      text: "We look at property as a journey, not just a transaction. From Buying to Renting to Managing to Selling we're with you all the way.",
    },
    learn_more: {
      text: 'Learn More',
    },
  });

  useEffect(() => {
    h.route.redirectToHome();

    const isAuthenticated = h.auth.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(isAuthenticated);
    }

    async function fetchCountries() {
      const response = await api.content.country.findAll();
      setCountries(response.data);
    }
    fetchCountries();
  }, []);

  return (
    <div>
      <Header />
      <Body>
        <header className="home-video-section">
          <div className="overlay"></div>
          <video
            playsInline="playsinline"
            autoPlay="autoplay"
            muted
            loop="loop"
          >
            <source
              src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/landing-page-video-2.mp4"
              type="video/mp4"
            />
          </video>
          <div className="container h-100">
            <div className="d-flex h-100 text-center align-items-center row">
              <div className="col-12 col-md-6 mx-auto">
                <h1 className="text-color2">
                  {h.translate.displayText(translations.header_title)}
                </h1>
                {!isLoggedIn && (
                  <h.form.CustomButton
                    className="mt-2 mb-3 btn-custom-primary"
                    variant="primary"
                    onClick={async (e) => {
                      e.preventDefault();
                      // await router.push(h.getRoute(routes.get_started))
                      window.location.href = '/#find-the-location-for-you';
                    }}
                  >
                    {h.translate.displayText(translations.browse_properties)}
                  </h.form.CustomButton>
                )}
              </div>
            </div>
          </div>
        </header>

        <section
          className="w-100"
          style={{
            height: 390,
            maxHeight: 603,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundImage:
              'url(/assets/images/pexels-houzlook-com-3356416.jpg)',
          }}
        >
          <div className="row no-gutters justify-content-end">
            <div
              className="col-12 col-lg-6 text-white"
              style={{ backgroundColor: '#08443d', marginTop: -40, zIndex: 9 }}
            >
              <div className="row no-gutters">
                <div className="col-12 col-lg-10 col-xl-8">
                  <p
                    className="m-5 text-center text-lg-right"
                    style={{ fontSize: 14 }}
                  >
                    {h.translate.displayText(translations.description)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="container text-center">
            <h4>{h.translate.displayText(translations.featured)}</h4>
            <div className="row">
              <div className="col-sm">
                <div className="p-4">
                  <a
                    target="_blank"
                    href="https://hongkongbusiness.hk/residential-property/news/pave-sees-rising-demand-overseas-property-investments/"
                  >
                    <img
                      style={{ maxWidth: 200 }}
                      className="img-fluid"
                      src="/assets/images/hkbusiness-logo.png"
                      alt="Pave - HK Business logo"
                    />
                  </a>
                </div>
              </div>
              <div className="col-sm">
                <div className="p-4">
                  <a
                    target="_blank"
                    href="https://hashtaglegend.com/culture/homes/pave-property-management-alan-schmoll-charlie-temple/"
                  >
                    <img
                      style={{ maxWidth: 200 }}
                      className="img-fluid"
                      src="/assets/images/hashtaglegend-logo.png"
                      alt="Pave - Hash Tag Legend logo"
                    />
                  </a>
                </div>
              </div>
              <div className="col-sm">
                <div className="p-4">
                  <a
                    target="_blank"
                    href="https://realestateasia.com/residential/news/pave-sees-rising-demand-overseas-property-investments"
                  >
                    <img
                      style={{ maxWidth: 200 }}
                      className="img-fluid"
                      src="/assets/images/realestateasia-logo.png"
                      alt="Pave - Real Estate Asia logo"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="find-the-location-for-you" className="pt-5">
          <div className="container pt-5">
            <h4>{h.translate.displayText(translations.location)}</h4>
            <div className="row mt-4">
              {h.notEmpty(countries) &&
                countries.map((country) => {
                  let noOfProjects = 0;
                  const countryTitle =
                    country.title && country.title.rendered
                      ? country.title.rendered
                      : '';
                  if (h.notEmpty(propertyData)) {
                    propertyData.map((property) => {
                      if (h.cmpStr(property.country_fk, country.id))
                        noOfProjects++;
                    });
                  }
                  return (
                    <div className="col-12 col-md-4 mb-3 mb-md-0">
                      <a href={`/${country.slug}`}>
                        <HomeCard
                          backgroundImage={country.fimg_url}
                          overlayText={countryTitle}
                          bottomLeftText={country.city_name}
                          bottomRightText={`${noOfProjects} Project${
                            noOfProjects > 1 || noOfProjects === 0 ? 's' : ''
                          }`}
                        />
                      </a>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>

        {/*<section className="pt-5">*/}
        {/*	<div className="container pt-5">*/}
        {/*		<div className="row no-gutters">*/}
        {/*			<div className="col-12 col-md-6">*/}
        {/*				<h4>Find the type of property for you</h4>*/}
        {/*			</div>*/}
        {/*			<div className="col-12 col-md-6">*/}
        {/*				<div className="float-right">*/}
        {/*					<span className="text-color1" style={{fontSize: 12}}>See more</span><br/>*/}
        {/*					<img src="/assets/images/right-arrow.png" style={{width: 100, marginTop: -20}}/>*/}
        {/*				</div>*/}
        {/*			</div>*/}
        {/*		</div>*/}
        {/*		<div className="row mt-2">*/}
        {/*			<div className="col-12 col-md-4">*/}
        {/*				<HomeCard*/}
        {/*					backgroundImage="/assets/images/pexels-medhat-ayad-447592.jpg"*/}
        {/*					overlayText="Condo"*/}
        {/*					bottomLeftText="3 Bedroom"*/}
        {/*					bottomRightText="8 Properties"*/}
        {/*				/>*/}
        {/*			</div>*/}
        {/*			<div className="col-12 col-md-4">*/}
        {/*				<HomeCard*/}
        {/*					backgroundImage="/assets/images/pexels-medhat-ayad-447592.jpg"*/}
        {/*					overlayText="Condo"*/}
        {/*					bottomLeftText="2 Bedroom"*/}
        {/*					bottomRightText="8 Properties"*/}
        {/*				/>*/}
        {/*			</div>*/}
        {/*			<div className="col-12 col-md-4">*/}
        {/*				<HomeCard*/}
        {/*					backgroundImage="/assets/images/pexels-medhat-ayad-447592.jpg"*/}
        {/*					overlayText="Condo"*/}
        {/*					bottomLeftText="1 Bedroom"*/}
        {/*					bottomRightText="8 Properties"*/}
        {/*				/>*/}
        {/*			</div>*/}
        {/*		</div>*/}
        {/*	</div>*/}
        {/*</section>*/}

        <section className="pt-5">
          <div className="container pt-5">
            <div className="row justify-content-center">
              <div className="col-12 col-md-6 text-center">
                <h4>{h.translate.displayText(translations.partners)}</h4>
              </div>
            </div>
            <div className="row justify-content-center mt-4 d-flex align-items-center">
              <div className="col-12 col-sm-3 col-lg-3">
                <a href="https://franklegaltax.com/" target="_blank">
                  <img
                    className="img-fluid p-4"
                    src="/assets/images/frank-logo.png"
                    alt="Pave - Frank Legal & Tax logo"
                  />
                </a>
              </div>
              <div className="col-12 col-sm-3 col-lg-3">
                <a href="https://freshbangkok.com/" target="_blank">
                  <img
                    className="img-fluid p-4"
                    src="/assets/images/fresh-property-logo.png"
                    alt="Pave - Fresh Property logo"
                  />
                </a>
              </div>
              <div className="col-12 col-sm-3 col-lg-3">
                <a href="https://mbmg-group.com/" target="_blank">
                  <img
                    className="img-fluid p-4"
                    src="/assets/images/mbmg-group-logo.png"
                    alt="Pave - MBMG Group logo"
                  />
                </a>
              </div>
              <div className="col-12 col-sm-3 col-lg-3">
                <a
                  href="https://www.uob.com.sg/personal/borrow/property/mortgage-options/international-property-loans.page"
                  target="_blank"
                >
                  <img
                    className="img-fluid p-4"
                    src="/assets/images/uob-logo.png"
                    alt="Pave - UOB logo"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="p-5" />
        <section
          className="w-100 mt-5"
          style={{
            height: 390,
            maxHeight: 603,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundImage:
              'url(/assets/images/pexels-jovydas-pinkevicius-2462015.jpg)',
          }}
        >
          <div className="container">
            <div className="row no-gutters">
              <div
                className="col-12 col-md-6 text-white p-4"
                style={{
                  backgroundColor: '#08443d',
                  marginTop: -40,
                  zIndex: 9,
                }}
              >
                <div className="p-4">
                  <h2 className="text-color2" style={{ fontSize: 40 }}>
                    {h.translate.displayText(translations.why_pave_header)}
                  </h2>
                  <p
                    className="font-MontserratExtraLight pt-3"
                    style={{ fontSize: 14 }}
                  >
                    {h.translate.displayText(translations.why_pave_description)}
                  </p>
                  <Link href={h.getRoute(routes.why_pave)}>
                    <h.form.CustomButton
                      className="mt-2 mb-3 btn-custom-primary2"
                      variant="primary"
                    >
                      {h.translate.displayText(translations.learn_more)}
                    </h.form.CustomButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Body>
      <Footer />
    </div>
  );
}

/**
 * Generic home page card for property/country listing component
 * @param {string} backgroundImage
 * @param {string} overlayText
 * @param {string} bottomLeftText
 * @param {string} bottomRightText
 * @returns {JSX.Element}
 * @constructor
 */
export function HomeCard({
  backgroundImage,
  overlayText,
  bottomLeftText,
  bottomRightText,
}) {
  return (
    <div>
      <div
        className="d-flex align-items-center location-item pt-5 pb-5 text-center text-white"
        style={{
          position: 'relative',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <h5 className="position-absolute w-100">{overlayText}</h5>
        <div className="overlay" />
      </div>
      <div className="row text-color1 mt-2" style={{ fontSize: 14 }}>
        <div className="col-6">{bottomLeftText}</div>
        <div className="col-6 text-right">{bottomRightText}</div>
      </div>
    </div>
  );
}
