import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { useRouter } from 'next/router';
import { api } from '../../api';
import Link from 'next/link';
import ProjectAvailableUnits from '../../components/Project/ProjectAvailableUnits';
import Carousel from '../../components/Common/Carousel';
import CommonGoogleMap from '../../components/Common/CommonGoogleMap';
import IconTag from '../../components/Icons/IconTag';
import IconBad from '../../components/Icons/IconBad';
import IconBuilding from '../../components/Icons/IconBuilding';
import IconProgress from '../../components/Icons/IconProgress';
import IconTick from '../../components/Icons/IconTick';
import IconOrangePool from '../../components/Icons/IconOrangePool';
import IconOrangeGym from '../../components/Icons/IconOrangeGym';
import IconOrangeConcierge from '../../components/Icons/IconOrangeConcierge';
import IconOrangeTennis from '../../components/Icons/IconOrangeTennis';
import IconOrangeBath from '../../components/Icons/IconOrangeBath';
import IconOrangeSauna from '../../components/Icons/IconOrangeSauna';
import IconOrangeCoworking from '../../components/Icons/IconOrangeCoworking';
import IconSharpTrain from '../../components/Icons/IconSharpTrain';
import IconRoundSchool from '../../components/Icons/IconRoundSchool';
import IconDownload from '../../components/Icons/IconDownload';
import IconOrangeShare from '../../components/Icons/IconOrangeShare';
import IconOrangeSecurity from '../../components/Icons/IconOrangeSecurity';
import IconOrangeUtilityArea from '../../components/Icons/IconOrangeUtilityArea';
import IconOrangeGarden from '../../components/Icons/IconOrangeGarden';
import IconNearby from '../../components/Icons/IconNearby';
import IconRestaurant from '../../components/Icons/IconRestaurant';
import IconOrangeParking from '../../components/Icons/IconOrangeParking';
import IconOrangeGameRoom from '../../components/Icons/IconOrangeGameRoom';
import IconOrangeGolfSimulator from '../../components/Icons/IconOrangeGolfSimulator';
import IconOrangeTheater from '../../components/Icons/IconOrangeTheater';
import IconOrangeDogWash from '../../components/Icons/IconOrangeDogWash';
import IconOrangeResidenceClub from '../../components/Icons/IconOrangeResidenceClub';
import IconOrangeWine from '../../components/Icons/IconOrangeWine';
import IconOrangeSteamRoom from '../../components/Icons/IconOrangeSteamRoom';

import CopyToClipboard from 'react-copy-to-clipboard';
import ProjectContactForm from '../../components/Project/ProjectContactForm';

const MEET_THE_TEAM = {
  DEVELOPER: 'developer',
  ARCHITECT: 'architect',
  BUILDER: 'builder',
  INTERIOR_DESIGNER: 'interior_designer',
  LANDSCAPER: 'landscaper',
};

export default function ProjectSlugPage() {
  const router = useRouter();
  const [property, setProperty] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(MEET_THE_TEAM.DEVELOPER);
  const [translations, setTranslations] = useState({
    header_features: { text: 'Features' },
    header_near_by: { text: 'Near by' },
    header_location: { text: 'Location' },
    header_meet_the_team_behind: { text: 'Meet the team behind' },
    header_recommended_units: {
      text: 'Recommended units available for purchase',
    },
    header_contact_form: {
      text: 'Register to speak with one of our consultants',
    },
  });

  useEffect(() => {
    h.route.redirectToHome();
  }, []);

  useEffect(() => {
    setProperty({});
    (async () => {
      const { project_slug } = router.query;

      // const apiRes = await api.property.getPropertyBySlug({ slug: project_slug }, false);
      // if (h.cmpStr(apiRes.status, 'ok')) {
      // 	setProperty(apiRes.data.property);
      // }
      const apiRes2 = await api.content.project.getProjectBySlug({
        slug: project_slug,
      });
      if (h.cmpStr(apiRes2.status, 'ok')) {
        setProperty(apiRes2.data.project);
      }
    })();
  }, [router.query]);

  const handleTeamSwitch = (inTeam) => {
    setSelectedTeam(inTeam);
  };

  const FeatureIconMapping = (props) => {
    const { type } = props;

    switch (type) {
      case 'pool':
        return <IconOrangePool {...props} />;
      case 'gym':
        return <IconOrangeGym {...props} />;
      case 'concierge':
        return <IconOrangeConcierge {...props} />;
      case 'tennis':
        return <IconOrangeTennis {...props} />;
      case 'jacuzzi':
        return <IconOrangeBath {...props} />;
      case 'sauna':
        return <IconOrangeSauna {...props} />;
      case 'library':
        return <IconOrangeCoworking {...props} />;
      case 'security':
        return <IconOrangeSecurity {...props} />;
      case 'utility-area':
        return <IconOrangeUtilityArea {...props} />;
      case 'garden':
        return <IconOrangeGarden {...props} />;
      case 'game-room':
        return <IconOrangeGameRoom {...props} />;
      case 'golf-simulator':
        return <IconOrangeGolfSimulator {...props} />;
      case 'theater':
        return <IconOrangeTheater {...props} />;
      case 'parking':
        return <IconOrangeParking {...props} />;
      case 'dog-wash':
        return <IconOrangeDogWash {...props} />;
      case 'residence-club':
        return <IconOrangeResidenceClub {...props} />;
      case 'wine':
        return <IconOrangeWine {...props} />;
      case 'steam-room':
        return <IconOrangeSteamRoom {...props} />;
      default:
        return <span></span>;
    }
  };

  const NearbyIconMapping = (props) => {
    const { type } = props;

    switch (type) {
      case 'transport':
        return <IconSharpTrain {...props} />;
      case 'school':
        return <IconRoundSchool {...props} />;
      case 'restaurant':
        return <IconRestaurant {...props} />;
      case 'nearby':
        return <IconNearby {...props} />;
      default:
        return <span></span>;
    }
  };

  return (
    h.notEmpty(property) && (
      <div>
        <Header title={property.name} />
        <Body className="project-template">
          <section
            className="project-description-section w-100 position-relative"
            style={{
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundImage: `url(${property.property_header_info.cover_picture_url})`,
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            ></div>
            <div className="container h-100">
              <div className="row no-gutters text-white pt-5">
                <div className="col-12 mt-5 py-4">
                  <h2
                    className="display-4"
                    style={{ textShadow: '0px 4px 4px #000000' }}
                  >
                    {property.property_header_info.name}
                  </h2>
                  <div className="row">
                    <div className="col-12 col-lg-10">
                      <p
                        className="font-TenorSansRegular"
                        style={{ textShadow: '0px 4px 4px #000000' }}
                      >
                        {property.property_header_info.short_description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="project-description-sub-section"
            style={{ backgroundColor: '#1C1C1C' }}
          >
            <div className="container text-white">
              <div className="row pt-4">
                <div
                  className="col-12 pt-2"
                  style={{
                    backgroundColor: '#1C1C1C',
                  }}
                >
                  {property.property_header_info.descriptions.map(
                    (description, index) => (
                      <li
                        key={index}
                        style={{
                          fontFamily: 'TenorSansRegular',
                          color: '#EDE5DE',
                        }}
                      >
                        {description}
                      </li>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            className="pt-5 pb-5 text-white"
            style={{ backgroundColor: '#1C1C1C' }}
          >
            <div className="container pt-5">
              <div className="row">
                <div className="col-12 col-lg-7">
                  {h.notEmpty(property.breadcrumbs) &&
                    property.breadcrumbs.map((breadcrumb, index) => {
                      return (
                        <span key={index}>
                          <Link
                            href={
                              index === 0
                                ? breadcrumb.url
                                : 'javascript:void(0);'
                            }
                          >
                            <span
                              style={{ fontSize: 15, cursor: 'pointer' }}
                              className="text-color5"
                            >
                              {breadcrumb.text}
                            </span>
                          </Link>
                          &nbsp;&nbsp;
                          {!h.cmpInt(
                            index,
                            property.breadcrumbs.length - 1,
                          ) && <span className="arrow right"></span>}
                          &nbsp;&nbsp;
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>

          <section
            className="pt-5 pb-5 text-white"
            style={{ backgroundColor: '#1C1C1C' }}
          >
            <div className="container">
              <div className="row">
                <div className="col-12 col-lg-6">
                  <h1 className="display-4">{property.name}</h1>
                  <p className="text-color2" style={{ fontSize: 20 }}>
                    <u>
                      <a
                        href={`https://www.google.com.sg/maps?q=${property.location.address}`}
                        className="text-color2"
                        target="_blank"
                      >
                        {property.location.address}
                      </a>
                    </u>
                  </p>
                  <p className="my-5">{property.description}</p>

                  <Carousel items={property.images} />

                  <div className="m-3 p-4" />

                  {h.notEmpty(property.brochure_url) && (
                    <a target="_blank" href={property.brochure_url}>
                      <h.form.CustomButton
                        variant="primary"
                        className="w-xs-100 mb-3 mb-sm-0"
                        style={{
                          backgroundColor: '#343434',
                          borderColor: '#343434',
                          width: 250,
                          height: 65,
                          fontSize: 16,
                        }}
                      >
                        <IconDownload style={{ maxWidth: 30, marginTop: -4 }} />
                        &nbsp;&nbsp;<span>E-brochure</span>
                      </h.form.CustomButton>
                    </a>
                  )}
                  {h.notEmpty(property.brochure_url) && (
                    <span className="d-none d-sm-inline-block">
                      &nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                  )}
                  <CopyToClipboard
                    onCopy={() =>
                      h.general.alert('success', {
                        message: `Copied ${property.name} URL`,
                      })
                    }
                    text={window.location.href}
                  >
                    <h.form.CustomButton
                      variant="primary"
                      className="w-xs-100"
                      style={{
                        backgroundColor: '#343434',
                        borderColor: '#343434',
                        width: 180,
                        height: 65,
                        fontSize: 16,
                      }}
                    >
                      <IconOrangeShare
                        style={{ maxWidth: 30, marginTop: -4 }}
                      />
                      &nbsp;&nbsp;<span>Share</span>
                    </h.form.CustomButton>
                  </CopyToClipboard>
                </div>
                <div className="col-12 col-lg-1" />
                <div className="col-12 col-lg-5 pt-5 pt-lg-5 mt-lg-3">
                  <h2 className="text-color2">Summary</h2>
                  <p className="my-auto pt-3">
                    <IconTag style={{ maxWidth: 30 }} />
                    <span className="m-2" />
                    {property.pricing_description}
                  </p>
                  <p className="my-auto pt-3">
                    <IconBad style={{ maxWidth: 30 }} />
                    <span className="m-2" />
                    {property.bedrooms_description}
                  </p>
                  <p className="my-auto pt-3">
                    <IconBuilding style={{ maxWidth: 30 }} />
                    <span className="m-2" />
                    {property.residences_description}
                  </p>
                  <p className="my-auto pt-3">
                    <IconProgress style={{ maxWidth: 30 }} />
                    <span className="m-2" />
                    {property.estimated_completion}
                  </p>
                  {/* {h.notEmpty(property.units_available) &&
							<p className="my-auto pt-3">
								<IconTick style={{maxWidth:30}}/>
								<span className="m-2"/>
								{property.units_available}
							</p>} */}

                  {/*<div className="p-4"/>*/}

                  {/*<h2 className="text-color2">Completion Status</h2>*/}
                  {/*<div className="p-1"/>*/}
                  {/*<div className="row no-gutters align-items-center">*/}
                  {/*<div className="col-12">*/}
                  {/*<table className="completion-status-table">*/}
                  {/*<tbody>*/}
                  {/*<tr>*/}
                  {/*<td>*/}
                  {/*<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                  {/*<circle cx="8.5" cy="8.5" r="5.5" fill="#ADC7A6"/>*/}
                  {/*<circle cx="8.5" cy="8.5" r="8" stroke="#ADC7A6"/>*/}
                  {/*</svg>*/}
                  {/*</td>*/}
                  {/*<td>Feb 21</td>*/}
                  {/*<td>&nbsp;-&nbsp;</td>*/}
                  {/*<td>Building construction completed</td>*/}
                  {/*</tr>*/}
                  {/*<tr className="text-color5">*/}
                  {/*<td>*/}
                  {/*<svg style={{paddingLeft: 1}} width="15" height="15" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                  {/*<circle cx="5.5" cy="5.5" r="5.5" fill="#9FB799"/>*/}
                  {/*<circle cx="5.5" cy="5.5" r="5.5" fill="url(#paint0_linear)"/>*/}
                  {/*</svg>*/}
                  {/*</td>*/}
                  {/*<td>Dec 20</td>*/}
                  {/*<td>&nbsp;-&nbsp;</td>*/}
                  {/*<td>start construction of the pool</td>*/}
                  {/*</tr>*/}
                  {/*<tr>*/}
                  {/*<td>*/}
                  {/*<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                  {/*<circle cx="8.5" cy="8.5" r="5.5" fill="#ADC7A6"/>*/}
                  {/*<circle cx="8.5" cy="8.5" r="8" stroke="#ADC7A6"/>*/}
                  {/*</svg>*/}
                  {/*</td>*/}
                  {/*<td>Dec 01</td>*/}
                  {/*<td>&nbsp;-&nbsp;</td>*/}
                  {/*<td>Cladding completed</td>*/}
                  {/*</tr>*/}
                  {/*<tr className="text-color5">*/}
                  {/*<td>*/}
                  {/*<svg style={{paddingLeft: 1}} width="15" height="15" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                  {/*<circle cx="5.5" cy="5.5" r="5.5" fill="#9FB799"/>*/}
                  {/*<circle cx="5.5" cy="5.5" r="5.5" fill="url(#paint0_linear)"/>*/}
                  {/*</svg>*/}
                  {/*</td>*/}
                  {/*<td>Nov 02</td>*/}
                  {/*<td>&nbsp;-&nbsp;</td>*/}
                  {/*<td>facade completed</td>*/}
                  {/*</tr>*/}
                  {/*<tr>*/}
                  {/*<td>*/}
                  {/*<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                  {/*<circle cx="8.5" cy="8.5" r="5.5" fill="#ADC7A6"/>*/}
                  {/*<circle cx="8.5" cy="8.5" r="8" stroke="#ADC7A6"/>*/}
                  {/*</svg>*/}
                  {/*</td>*/}
                  {/*<td>Oct 06</td>*/}
                  {/*<td>&nbsp;-&nbsp;</td>*/}
                  {/*<td>Construction in progress</td>*/}
                  {/*</tr>*/}
                  {/*<tr>*/}
                  {/*<td></td>*/}
                  {/*<td></td>*/}
                  {/*<td></td>*/}
                  {/*<td><span className="text-color4" style={{cursor: 'pointer'}}><u>See all completion history</u></span></td>*/}
                  {/*</tr>*/}
                  {/*</tbody>*/}
                  {/*</table>*/}
                  {/*</div>*/}
                  {/*</div>*/}

                  <div className="p-4" />

                  <h2 className="text-color2">
                    {h.translate.displayText(translations.header_features)}
                  </h2>
                  {property.features.map((feature, index) => {
                    return (
                      <p className="my-auto pt-3" key={index}>
                        <FeatureIconMapping
                          type={feature.type}
                          style={{ maxWidth: 30, width: 20 }}
                        />
                        <span className="m-2" />
                        {feature.name}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
          <section
            className="pt-5 pb-5 text-white"
            style={{ backgroundColor: '#1C1C1C' }}
          >
            <div className="container">
              <div className="row h-100">
                <div className="col-12">
                  {property.videos.map((video, index) => {
                    return (
                      <div
                        key={index}
                        style={{ marginTop: index > 0 ? '7rem' : 0 }}
                      >
                        <h2 className="text-color2 mb-4">
                          {video.header_text}
                        </h2>
                        {h.cmpStr(video.type, 'mp4') ? (
                          <video
                            playsinline="playsinline"
                            controls
                            className="property-intro-video"
                          >
                            <source
                              src={`${video.url}#t=1`}
                              type={`video/${video.type}`}
                            />
                            Your browser does not support the embedded video.
                          </video>
                        ) : (
                          <iframe
                            className="property-intro-video-youtube"
                            src={video.url}
                            frameBorder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section
            className="pt-5 pb-5 text-white"
            style={{ backgroundColor: '#1C1C1C' }}
          >
            <div className="container pb-5">
              <div className="row h-100">
                <div className="col-12 col-lg-6">
                  <h2 className="text-color2">
                    {h.translate.displayText(translations.header_location)}
                  </h2>
                  <p style={{ color: '#737373', fontSize: 15 }}>
                    <u>
                      <a
                        href={`https://www.google.com.sg/maps?q=${property.location.address}`}
                        className="text-color2"
                        target="_blank"
                      >
                        {property.location.address}
                      </a>
                    </u>
                  </p>
                  <CommonGoogleMap
                    location={Object.assign(
                      { name: property.name },
                      property.location,
                    )}
                    locationMap={property.location_map}
                  />
                </div>
                <div className="col-12 col-lg-1" />
                <div className="col-12 col-lg-5 pt-5 pt-lg-5 mt-lg-5 align-items flex-column h-100">
                  <h2 className="text-color2">
                    {h.translate.displayText(translations.header_near_by)}
                  </h2>
                  {property.location_nearby.map((nearby, index) => {
                    return (
                      <div className="row no-gutters" key={index}>
                        <div className="col-1">
                          <NearbyIconMapping
                            type={nearby.type}
                            style={{ maxWidth: 30, width: 20 }}
                          />
                        </div>
                        <div className="col-11">
                          {nearby.locations.map((location) => location.name)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {h.notEmpty(property.team_behind) && (
            <section className="pt-5 pb-5" style={{ backgroundColor: 'white' }}>
              <div className="container pt-5 pb-5">
                <div className="row">
                  <div className="col-12">
                    <h2 className="text-color3">{`${h.translate.displayText(
                      translations.header_meet_the_team_behind,
                    )} ${property.name}`}</h2>
                  </div>
                  <div
                    className="col-12 col-md-6 mt-4"
                    style={{ borderRight: '1.4px solid #E9E9E9' }}
                  >
                    {h.notEmpty(property.team_behind.developer) && (
                      <p
                        onClick={() =>
                          handleTeamSwitch(MEET_THE_TEAM.DEVELOPER)
                        }
                        className={
                          'text-color3' +
                          (h.cmpStr(selectedTeam, MEET_THE_TEAM.DEVELOPER)
                            ? ' font-weight-bold'
                            : '')
                        }
                        style={{ cursor: 'pointer', fontSize: 20 }}
                      >
                        Developer
                      </p>
                    )}
                    {h.notEmpty(property.team_behind.architect) && (
                      <p
                        onClick={() =>
                          handleTeamSwitch(MEET_THE_TEAM.ARCHITECT)
                        }
                        className={
                          'text-color3' +
                          (h.cmpStr(selectedTeam, MEET_THE_TEAM.ARCHITECT)
                            ? ' font-weight-bold'
                            : '')
                        }
                        style={{ cursor: 'pointer', fontSize: 20 }}
                      >
                        Architect
                      </p>
                    )}
                    {h.notEmpty(property.team_behind.builder) && (
                      <p
                        onClick={() => handleTeamSwitch(MEET_THE_TEAM.BUILDER)}
                        className={
                          'text-color3' +
                          (h.cmpStr(selectedTeam, MEET_THE_TEAM.BUILDER)
                            ? ' font-weight-bold'
                            : '')
                        }
                        style={{ cursor: 'pointer', fontSize: 20 }}
                      >
                        Builder
                      </p>
                    )}
                    {h.notEmpty(property.team_behind.interior_designer) && (
                      <p
                        onClick={() =>
                          handleTeamSwitch(MEET_THE_TEAM.INTERIOR_DESIGNER)
                        }
                        className={
                          'text-color3' +
                          (h.cmpStr(
                            selectedTeam,
                            MEET_THE_TEAM.INTERIOR_DESIGNER,
                          )
                            ? ' font-weight-bold'
                            : '')
                        }
                        style={{ cursor: 'pointer', fontSize: 20 }}
                      >
                        Interior designer
                      </p>
                    )}
                    {h.notEmpty(property.team_behind.landscaper) && (
                      <p
                        onClick={() =>
                          handleTeamSwitch(MEET_THE_TEAM.LANDSCAPER)
                        }
                        className={
                          'text-color3' +
                          (h.cmpStr(selectedTeam, MEET_THE_TEAM.LANDSCAPER)
                            ? ' font-weight-bold'
                            : '')
                        }
                        style={{ cursor: 'pointer', fontSize: 20 }}
                      >
                        Landscaper
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-md-1" />
                  <div className="col-12 col-md-5 mt-3">
                    {property.team_behind && property.team_behind[selectedTeam]
                      ? property.team_behind[selectedTeam].logos.map(
                          (logo, index) => {
                            let logoContent = (
                              <img
                                className="w-50 p-1"
                                src={logo}
                                key={index}
                              />
                            );
                            if (property.team_behind[selectedTeam].website) {
                              return (
                                <a
                                  href={
                                    property.team_behind[selectedTeam].website
                                  }
                                  target="_blank"
                                >
                                  {logoContent}
                                </a>
                              );
                            } else {
                              return logoContent;
                            }
                          },
                        )
                      : ''}
                    {property.team_behind &&
                    property.team_behind[selectedTeam] ? (
                      <p className="mt-3 text-color3 font-weight-bold">
                        {property.team_behind[selectedTeam].description}
                      </p>
                    ) : null}
                    {property.team_behind[selectedTeam].website && (
                      <a
                        href={property.team_behind[selectedTeam].website}
                        className="text-color3"
                        target="_blank"
                      >
                        View website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="pt-5 pb-5" style={{ backgroundColor: '#FFF' }}>
            <div className="container">
              <h2 className="text-color1">
                {h.translate.displayText(translations.header_recommended_units)}
              </h2>
              <ProjectAvailableUnits
                project={property}
                data={property.units_available_for_purchase}
              />
            </div>
          </section>

          <section
            className="pt-5 pb-5 mt-5"
            style={{ backgroundColor: '#FFF' }}
          >
            <div className="container">
              <h2 className="text-color1 pb-5">
                {h.translate.displayText(translations.header_contact_form)}
              </h2>
              <ProjectContactForm project={property} />
            </div>
          </section>
        </Body>
        <Footer />
      </div>
    )
  );
}
