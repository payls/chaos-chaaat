import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { useRouter } from 'next/router';
import { routes } from '../configs/routes';

export default function Index() {
  const router = useRouter();

  const [translations, setTranslations] = useState({
    header_title: {
      text: "We're driven to rebuild property buying and management",
    },
    header_description: {
      text: "While helping our friends navigate buying and managing properties overseas, we found they'd been working with agents who were more interested in the transaction and less about the overall journey. That’s when we realised it's time for a change in real estate. So, we're redefining it. Our team is focused on delivering an amazing service enhanced with intuitive, easy to use technology.",
    },
    founders_header: {
      text: 'Founders',
    },
    alan_name: {
      text: 'Alan Schmoll',
      should_translate: false,
    },
    alan_job: {
      text: 'Founder and CEO',
    },
    alan_header: {
      text: 'I feel it’s time to give attention to and build community around the buyers of real estate',
    },
    alan_description: {
      text: `Alan’s background spans banking and software. After college, he worked in the regulated world of institutional capital markets at Bank of America Merrill Lynch in Tokyo and Hong Kong. More recently, Alan has worked alongside leading developers on enterprise software-as-a-service, cyber security and cloud Infrastructure projects, having founded a tech-enabled corporate services firm ([LINK_1]) and a SaaS provider of Corporate Governance software ([LINK_2]).`,
      data: {
        LINK_1: `<a href="https://www.golanturn.com" target="_blank">Lanturn</a>`,
        LINK_2: `<a href="https://www.getzave.com" target="_blank">Zave</a>`,
      },
    },
    charlie_name: {
      text: 'Charlie Temple',
      should_translate: false,
    },
    charlie_job: {
      text: 'Co-founder & COO',
    },
    charlie_header: {
      text: 'Pairing best in class technology with knowledgable and experienced real estate agents is what drove me to found Pave',
    },
    charlie_description: {
      text: 'Charlie is a serial entrepreneur who started his career working in Sales and Business Development with Asia’s leading Fitness and Lifestyle brand PURE Group. Using his experience from the PURE Group he went on to founding multiple Fitness brands in Hong Kong, Philippines and Singapore. Most recently Charlie has been working with listed Developers in Thailand to help them expand their sales distribution channels in Hong Kong and China.',
    },
    advisors_header: {
      text: 'Advisors',
    },
    terrence_name: {
      text: 'Terence Cheung',
      should_translate: false,
    },
    terrence_job: {
      text: 'Founder and CEO',
    },
    terrence_company: {
      text: 'Raeon International',
      should_translate: false,
    },
    terrence_description: {
      text: 'Moving to his old home town Hong Kong in 2013, he founded Raeon International Ltd, one of Hong Kong’s largest international real estate agents, with Far East Consortium International Limited (HKSE: 35) and drove its expansion to other parts of Asia with offices in Taiwan, Vietnam, Malaysia, Singapore and various cities in China. Terence assists us with our go-to-market around developer relations and end-to-end property owner care.',
    },
    james_name: {
      text: 'James Gilbert',
      should_translate: false,
    },
    james_job: {
      text: 'Senior Director of Strategic Partnerships',
    },
    james_company: {
      text: 'HubSpot',
    },
    james_description: {
      text: 'James leads the inbound movement in Australia, New Zealand and Asia, with a mission of helping businesses grow better by transforming the way they market and sell to match the way modern humans want to buy. Having previously held marketing roles at HubSpot and Red Balloon focusing on demand generation, his experience spans everything from social ads and email marketing, to events and automation. In addition to his role in APAC, James also leads HubSpot’s Facebook Messenger Team.',
    },
    paul_name: {
      text: 'Paul Hadjy',
      should_translate: false,
    },
    paul_job: {
      text: 'Founder and CEO',
    },
    paul_company: {
      text: 'Horangi',
    },
    paul_description: {
      text: 'Paul Hadjy is the CEO and Co-founder of Horangi, a Singapore-based cybersecurity company that offers an integrated SaaS security platform and CREST-accredited services including  penetration testing. Prior to Horangi, Paul worked at Palantir Technologies across the U.S., Korea, New Zealand, and Afghanistan, where he was part of the US Department of Defense Counter-IED unit. Paul was also the Head of Information Security at Grab. Horangi Cyber Security is trusted by Industry Leaders such as Gojek, MoneySmart, PropertyGuru and Tiket.com.',
    },
    luis_name: {
      text: 'Luis Kho',
      should_translate: false,
    },
    luis_job: {
      text: 'Founder and CEO',
    },
    luis_company: {
      text: 'The Kho Group',
      should_translate: false,
    },
    luis_description: {
      text: 'Luis is a Chinese-Philippine serial entrepreneur with a main focus on investing in high growth markets such as Technology, Health and Real Estate and brings a wealth of regional and industry experience to Pave. His current main focus is on his reclamation project “City of Pearl” which is located in the Manila Bay, Philippines.',
    },
  });

  const advisors = [
    {
      profile_picture: '/assets/images/terence-cheung.png',
      person_name: translations.terrence_name.text,
      job_title: translations.terrence_job.text,
      company_title: translations.terrence_company.text,
      description: translations.terrence_description.text,
    },
    {
      profile_picture: '/assets/images/james-gilbert.jpg',
      person_name: translations.james_name.isEmpty,
      job_title: translations.james_job.text,
      company_title: translations.james_company.text,
      description: translations.james_description.text,
    },
    {
      profile_picture: '/assets/images/paul-hadjy.jpg',
      person_name: translations.paul_name.text,
      job_title: translations.paul_job.text,
      company_title: translations.paul_company.text,
      description: translations.paul_description.text,
    },
    {
      profile_picture: '/assets/images/luis-kho.png',
      person_name: translations.luis_name.text,
      job_title: translations.luis_job.text,
      company_title: translations.luis_company.text,
      description: translations.luis_description.text,
    },
  ];

  useEffect(() => {
    h.route.redirectToHome();
  }, []);

  return (
    <div>
      {/* <Header title="About Us" />
      <Body className="pb-5 mb-5">
        <section className="w-100">
          <div
            className="row no-gutters d-flex align-items-center"
            style={{ backgroundColor: '#08443d' }}
          >
            <div className="col-12 col-lg-7">
              <img
                className="img-fluid"
                src="/assets/images/avery-klein-ja-xs-8-tk-5-iww-unsplash.jpg"
              />
            </div>
            <div className="col-12 col-lg-3 text-white p-5 p-lg-0 pl-lg-5">
              <h1>{h.translate.displayText(translations.header_title)}</h1>
              <p className="mt-3">
                {h.translate.displayText(translations.header_description)}
              </p>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="container pt-5">
            <h4 className="text-center pb-4">
              {h.translate.displayText(translations.founders_header)}
            </h4>
            <div
              className="row mt-5"
              style={{ backgroundColor: 'rgba(174, 198, 167, 0.17)' }}
            >
              <div className="col-12 col-md-5 col-lg-4 position-relative text-center text-md-left">
                <img
                  className="pl-3 pr-3 pb-4"
                  src="/assets/images/alan.jpg"
                  style={{ width: 300, marginTop: -40 }}
                />
                <div
                  className="bg-white p-4 position-absolute text-left"
                  style={{ bottom: 43, right: 6 }}
                >
                  <p
                    style={{ fontSize: 15 }}
                    className="mb-1 text-color1 font-TenorSansRegular"
                  >
                    {h.translate.displayText(translations.alan_name)}
                  </p>
                  <p style={{ fontSize: 11 }} className="mb-0 font-italic">
                    {h.translate.displayText(translations.alan_job)}
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-7 col-lg-8">
                <div className="row no-gutters">
                  <div className="col-1 text-right">
                    <img
                      className="pt-4 mt-2 pr-2"
                      style={{ width: 25 }}
                      src="/assets/images/quote-icon.png"
                    />
                  </div>
                  <div className="col-10 pt-4 mt-3">
                    <h2>{h.translate.displayText(translations.alan_header)}</h2>
                    <p>
                      {h.translate.displayText(translations.alan_description)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-7 col-lg-8 mt-5 pb-5">
                <div className="row no-gutters mt-4">
                  <div className="col-1 text-right">
                    <img
                      className="pt-4 mt-2 pr-2"
                      style={{ width: 25 }}
                      src="/assets/images/quote-icon.png"
                    />
                  </div>
                  <div className="col-10 pt-4 mt-3">
                    <h2>
                      {h.translate.displayText(translations.charlie_header)}
                    </h2>
                    <p>
                      {h.translate.displayText(
                        translations.charlie_description,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-5 col-lg-4 position-relative">
                <img
                  className="pl-3 pr-3 pb-4 d-none d-md-block position-absolute mt-5"
                  src="/assets/images/charlie.jpg"
                  style={{ width: 300, right: -40, bottom: 10 }}
                />
                <img
                  className="pl-3 pr-3 pb-4 d-block d-md-none mx-auto mx-md-0"
                  src="/assets/images/charlie.jpg"
                  style={{ width: 300 }}
                />
                <div
                  className="bg-white p-4 position-absolute"
                  style={{ bottom: 48 }}
                >
                  <p
                    style={{ fontSize: 15 }}
                    className="mb-1 text-color1 font-TenorSansRegular"
                  >
                    {h.translate.displayText(translations.charlie_name)}
                  </p>
                  <p style={{ fontSize: 11 }} className="mb-0 font-italic">
                    {h.translate.displayText(translations.charlie_job)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="container pt-5">
            <h4 className="text-center pb-4">
              {h.translate.displayText(translations.advisors_header)}
            </h4>
            <div className="row text-center">
              {advisors.map((advisor) => {
                return (
                  <div className="col-12 col-sm-6 col-md-3 mt-2 mb-5">
                    <AdvisorCard
                      profilePicture={advisor.profile_picture}
                      personName={advisor.person_name}
                      jobTitle={advisor.job_title}
                      companyTitle={advisor.company_title}
                      description={advisor.description}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Body>
      <Footer /> */}
    </div>
  );
}

/**
 * Generic advisor card component
 * @param {string} [profilePicture]
 * @param {string} personName
 * @param {string} jobTitle
 * @param {string} companyTitle
 * @param {string} description
 * @returns {JSX.Element}
 * @constructor
 */
export function AdvisorCard({
  profilePicture,
  personName,
  jobTitle,
  companyTitle,
  description,
}) {
  profilePicture = h.isEmpty(profilePicture)
    ? '/assets/images/profile_picture_placeholder.png'
    : profilePicture;
  return (
    <div>
      <img
        style={{ maxHeight: 200 }}
        className="img-fluid rounded-circle"
        src={profilePicture}
      />
      <p
        className="text-color3 font-TenorSansRegular mt-3 mb-0"
        style={{ lineHeight: 0.8 }}
      >
        {personName}
      </p>
      <p className="mb-0" style={{}}>
        <small className="text-muted font-MontserratRegular">{jobTitle}</small>
      </p>
      <p className="mb-0" style={{ lineHeight: 0.8 }}>
        <small className="text-muted font-MontserratRegular">
          {companyTitle}
        </small>
      </p>
      <p
        className="text-left font-MontserratRegular text-color-4 mt-3"
        style={{ fontSize: 12 }}
      >
        {description}
      </p>
    </div>
  );
}
