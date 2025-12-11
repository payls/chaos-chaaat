import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { useRouter } from 'next/router';
import { routes } from '../configs/routes';

export default function Index() {
  const router = useRouter();

  const [translations, setTranslations] = useState({
    header_title: {
      text: 'Why Pave',
    },
    header_description: {
      text: 'Cross border and international home purchasing is difficult even for seasoned investors. Committing to a property and then realising something else is more suitable, hidden costs, opaque processes and nasty surprises are common place and completely avoidable. Co-ordination between various parties such as agents, lawyers, property managers, tradies and tenants is disjointed and cumbersome.',
    },
    pave_help_header: {
      text: 'How does Pave help?',
    },
    pave_help_description: {
      text: 'We are a professional assisted web platform for buyers of overseas properties to find, select, transact and manage their real estate.',
    },
    relevance: {
      text: 'We work to understand our buyers objectives and match with properties we either have in our inventory or source for those we don’t.',
    },
    transparency: {
      text: 'Know up front all the steps and costs involved with buying and managing a property. Tailored to each buyer’s unique profile.',
    },
    simplicity: {
      text: 'Easy to follow online steps guiding the buyer through all the obligations and considerations involved.',
    },
    work_with_text: {
      text: 'Who do we work with?',
    },
    investors_header: {
      text: 'Investors',
    },
    investors_description: {
      text: 'First time or seasoned investors looking to generate stable yields in a low interest rate environment as well as potential for capital appreciation.',
    },
    lifestyle_seekers_header: {
      text: 'Lifestyle Seekers',
    },
    lifestyle_seekers_description: {
      text: 'Be it a piece of an island paradise, an apartment in a cultural centre or something up a ski mountain, these are just some of the lifestyle ambitions we work with our clients to solve.',
    },
    university_accomodations_header: {
      text: 'University Accomodations',
    },
    university_accomodations_description: {
      text: 'Finding and managing something conveniently located to the world’s top colleges and universities.',
    },
    immigration_header: {
      text: 'Immigration',
    },
    immigration_description: {
      text: 'Australia and Thailand are just some of the countries offering residential visas in return for qualifying property investments.',
    },
  });

  useEffect(() => {
    h.route.redirectToHome();
  }, []);

  return (
    <div>
      <Header title="Why Pave" />
      <Body>
        <section style={{ backgroundColor: '#08443d' }}>
          <div className="row d-flex align-items-center">
            <div className="col-12 col-lg-5 text-white p-5">
              <div className="row justify-content-center">
                <div className="col-12 col-sm-9">
                  <h1 className="text-color2">
                    {h.translate.displayText(translations.header_title)}
                  </h1>
                  <p className="mt-3">
                    {h.translate.displayText(translations.header_description)}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <img
                className="img-fluid"
                src="/assets/images/avery-klein-ja-xs-8-tk-5-iww-unsplash.jpg"
              />
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="container pt-5">
            <div className="row justify-content-center">
              <div className="col-12">
                <h4 className="text-center pb-4">
                  {h.translate.displayText(translations.pave_help_header)}
                </h4>
              </div>
              <div className="col-12 col-sm-8">
                <p className="text-center">
                  {h.translate.displayText(translations.pave_help_description)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-12 col-lg-4 p-5">
                <img
                  style={{ maxHeight: 80 }}
                  src="/assets/images/r-relevance.png"
                />
                <p className="mt-3">
                  {h.translate.displayText(translations.relevance)}
                </p>
              </div>
              <div className="col-12 col-lg-4 p-5">
                <img
                  style={{ maxHeight: 80 }}
                  src="/assets/images/t-transparency.png"
                />
                <p className="mt-3">
                  {h.translate.displayText(translations.transparency)}
                </p>
              </div>
              <div className="col-12 col-lg-4 p-5">
                <img
                  style={{ maxHeight: 80 }}
                  src="/assets/images/s-simplicity.png"
                />
                <p className="mt-3">
                  {h.translate.displayText(translations.simplicity)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="container pt-5">
            <h4 className="text-center pb-4">
              {h.translate.displayText(translations.work_with_text)}
            </h4>
          </div>
        </section>

        <section style={{ backgroundColor: '#aec6a7' }}>
          <div className="row d-flex align-items-center">
            <div className="col-12 col-lg-6 p-5">
              <div className="row justify-content-center justify-content-lg-end">
                <div className="col-12 col-sm-7 text-color6">
                  <h1>
                    {h.translate.displayText(translations.investors_header)}
                  </h1>
                  <p className="mt-3">
                    {h.translate.displayText(
                      translations.investors_description,
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 p-0">
              <img
                className="w-100"
                src="/assets/images/avery-klein-ja-xs-8-tk-5-iww-unsplash-copy.jpg"
              />
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#f3c4aa' }}>
          <div className="row d-flex align-items-center">
            <div className="col-12 col-lg-6 p-0">
              <img
                className="w-100"
                src="/assets/images/avery-klein-ja-xs-8-tk-5-iww-unsplash-copy-2.jpg"
              />
            </div>
            <div className="col-12 col-lg-6 p-5">
              <div className="row justify-content-center justify-content-lg-start">
                <div className="col-12 col-sm-7 text-color6">
                  <h1>
                    {h.translate.displayText(
                      translations.lifestyle_seekers_header,
                    )}
                  </h1>
                  <p className="mt-3">
                    {h.translate.displayText(
                      translations.lifestyle_seekers_description,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#ede6dd' }}>
          <div className="row d-flex align-items-center">
            <div className="col-12 col-lg-6 p-5">
              <div className="row justify-content-center justify-content-lg-end">
                <div className="col-12 col-sm-7 text-color6">
                  <h1>
                    {h.translate.displayText(
                      translations.university_accomodations_header,
                    )}
                  </h1>
                  <p className="mt-3">
                    {h.translate.displayText(
                      translations.university_accomodations_description,
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 p-0">
              <img
                className="w-100"
                src="/assets/images/avery-klein-ja-xs-8-tk-5-iww-unsplash-copy-3.jpg"
              />
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#08443d' }}>
          <div className="row d-flex align-items-center">
            <div className="col-12 col-lg-6 p-0">
              <img
                className="w-100"
                src="/assets/images/avery-klein-ja-xs-8-tk-5-iww-unsplash-copy-4.jpg"
              />
            </div>
            <div className="col-12 col-lg-6">
              <div className="row justify-content-center justify-content-lg-start p-5">
                <div className="col-12 col-sm-7 text-color2">
                  <h1>
                    {h.translate.displayText(translations.immigration_header)}
                  </h1>
                  <p className="mt-3">
                    {h.translate.displayText(
                      translations.immigration_description,
                    )}
                  </p>
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
 * Generic advisor card component
 * @param {string} [profilePicture]
 * @param {string} personName
 * @param {string} companyTitle
 * @param {string} description
 * @returns {JSX.Element}
 * @constructor
 */
export function AdvisorCard({
  profilePicture,
  personName,
  companyTitle,
  description,
}) {
  profilePicture = h.isEmpty(profilePicture)
    ? '/assets/images/profile_picture_placeholder.png'
    : profilePicture;
  return (
    <div>
      <img className="img-fluid" src={profilePicture} />
      <p
        className="text-color3 font-TenorSansRegular mt-3 mb-0"
        style={{ lineHeight: 0.8 }}
      >
        {personName}
      </p>
      <small className="text-muted font-MontserratRegular">
        {companyTitle}
      </small>
      <p
        className="text-left font-MontserratRegular text-color-4 mt-3"
        style={{ fontSize: 12 }}
      >
        {description}
      </p>
    </div>
  );
}
