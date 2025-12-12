import React, { useState, useEffect, useCallback } from 'react';
import { Card, Navbar } from 'react-bootstrap';
import { h } from '../../components/Sale/Link/preview/helpers';
import { h as hh } from '../../helpers';
import { config } from '../../configs/config';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import {
  Header,
  PreviewHeader,
  Body,
  Footer,
} from '../../components/Sale/Link/preview/components/Layouts/Layout';

import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { faCertificate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconOrangePool from '../../components/Sale/Link/preview/components/Icons/IconOrangePool';
import IconOrangeGym from '../../components/Sale/Link/preview/components/Icons/IconOrangeGym';
import IconOrangeConcierge from '../../components/Sale/Link/preview/components/Icons/IconOrangeConcierge';
import IconOrangeTennis from '../../components/Sale/Link/preview/components/Icons/IconOrangeTennis';
import IconOrangeBath from '../../components/Sale/Link/preview/components/Icons/IconOrangeBath';
import IconOrangeSauna from '../../components/Sale/Link/preview/components/Icons/IconOrangeSauna';
import IconOrangeCoworking from '../../components/Sale/Link/preview/components/Icons/IconOrangeCoworking';
import IconOrangeSecurity from '../../components/Sale/Link/preview/components/Icons/IconOrangeSecurity';
import IconOrangeUtilityArea from '../../components/Sale/Link/preview/components/Icons/IconOrangeUtilityArea';
import IconOrangeGarden from '../../components/Sale/Link/preview/components/Icons/IconOrangeGarden';
import IconOrangeParking from '../../components/Sale/Link/preview/components/Icons/IconOrangeParking';
import IconOrangeGameRoom from '../../components/Sale/Link/preview/components/Icons/IconOrangeGameRoom';
import IconOrangeGolfSimulator from '../../components/Sale/Link/preview/components/Icons/IconOrangeGolfSimulator';
import IconOrangeTheater from '../../components/Sale/Link/preview/components/Icons/IconOrangeTheater';
import IconOrangeDogWash from '../../components/Sale/Link/preview/components/Icons/IconOrangeDogWash';
import IconOrangeResidenceClub from '../../components/Sale/Link/preview/components/Icons/IconOrangeResidenceClub';
import IconOrangeWine from '../../components/Sale/Link/preview/components/Icons/IconOrangeWine';
import IconOrangeSteamRoom from '../../components/Sale/Link/preview/components/Icons/IconOrangeSteamRoom';
import IconIntegratedAppliances from '../../components/Sale/Link/preview/components/Icons/IconIntegratedAppliances';
import IconCCTV from '../../components/Sale/Link/preview/components/Icons/IconCCTV';

import IconEmail from '../../components/Sale/Link/preview/components/Icons/IconEmail';
import IconFacebookVector from '../../components/Sale/Link/preview/components/Icons/IconFacebookVector';
import IconInstagramVector from '../../components/Sale/Link/preview/components/Icons/IconInstagramVector';
import IconLinkedinVector from '../../components/Sale/Link/preview/components/Icons/IconLinkedinVector';
import IconPhoneVector from '../../components/Sale/Link/preview/components/Icons/IconPhoneVector';
import IconWebsiteVector from '../../components/Sale/Link/preview/components/Icons/IconWebsiteVector';

import Flag from 'react-world-flags';
import ToolbarSet from '../../components/Sale/Link/preview/components/Property/ToolbarSet';
import CommonExpandCollapse from '../../components/Sale/Link/preview/components/Common/CommonExpandCollapse';
import ShortlistedProjectBookmark from '../../components/Sale/Link/preview/components/Property/ShortlistedProjectBookmark';
import CommonCarousel from '../../components/Sale/Link/preview/components/Common/CommonCarousel';

export default function Preview({ project }) {
  // console.log(project);
  const [selectedPreview, setSelectedPreview] = useState('desktop-preview');
  const [projectMedias, setProjectMedias] = useState([]);
  const [agencyUser, setAgencyUser] = useState({});
  const [showFullAgentDescription, setShowFullAgentDescription] =
    useState(false);
  const [userProfilePictureUrl, setUserProfilePictureUrl] = useState();
  const [showAgencyLogo, setShowAgencyLogo] = useState(true);
  const [customStyle, setCustomStyle] = useState(null);
  const [translate, setTranslation] = useState(
    require('../Sale/Link/preview/constants/locale/en.json'),
  );

  useEffect(() => {
    (async () => {
      const user = hh.auth.getUserInfo();
      setUserProfilePictureUrl(user.profile_picture_url);

      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
        // HARD CODED FOR PRIORITY CLIENT
        setCustomStyle(
          h.theme.getJSON(apiRes.data.agencyUser.agency.agency_id),
        );
        setTranslationFunc(apiRes.data.agencyUser.agency.agency_id);
      }
    })();

    setProjectMedias(
      project.projectMedias
        .sort((a, b) => a.display_order - b.display_order)
        .filter((f) => {
          const media_tags = f.tags;

          return (
            media_tags.includes('image') ||
            media_tags.includes('video') ||
            media_tags.includes('floor_plan') ||
            media_tags.includes('brochure') ||
            media_tags.includes('factsheet') ||
            media_tags.includes('render_3d')
          );
        }),
    );
  }, []);

  const FeatureIconMapping = (props) => {
    const { type } = props;

    switch (type) {
      case 'pool':
        return <IconOrangePool {...props} fillColor={props.color} />;
      case 'gym':
        return <IconOrangeGym {...props} fillColor={props.color} />;
      case 'concierge':
        return <IconOrangeConcierge {...props} fillColor={props.color} />;
      case 'tennis':
        return <IconOrangeTennis {...props} fillColor={props.color} />;
      case 'jacuzzi':
        return <IconOrangeBath {...props} fillColor={props.color} />;
      case 'sauna':
        return <IconOrangeSauna {...props} fillColor={props.color} />;
      case 'library':
        return <IconOrangeCoworking {...props} fillColor={props.color} />;
      case 'security':
        return <IconOrangeSecurity {...props} fillColor={props.color} />;
      case 'utility_area':
        return <IconOrangeUtilityArea {...props} fillColor={props.color} />;
      case 'garden':
        return <IconOrangeGarden {...props} fillColor={props.color} />;
      case 'games_room':
        return <IconOrangeGameRoom {...props} fillColor={props.color} />;
      case 'golf_simulator':
        return <IconOrangeGolfSimulator {...props} fillColor={props.color} />;
      case 'theater':
        return <IconOrangeTheater {...props} fillColor={props.color} />;
      case 'parking':
        return <IconOrangeParking {...props} fillColor={props.color} />;
      case 'dog_wash':
        return <IconOrangeDogWash {...props} fillColor={props.color} />;
      case 'residence_club':
        return <IconOrangeResidenceClub {...props} fillColor={props.color} />;
      case 'wine':
        return <IconOrangeWine {...props} fillColor={props.color} />;
      case 'steam_room':
        return <IconOrangeSteamRoom {...props} fillColor={props.color} />;
      case 'integrated_appliances':
        return <IconIntegratedAppliances {...props} fillColor={props.color} />;
      case 'secure_video_entry':
        return <IconCCTV {...props} fillColor={props.color} />;
      default:
        return <span style={{ color: props.color }}>!</span>;
    }
  };
  const getCountryCode = (google_place_raw) => {
    if (
      h.isEmpty(google_place_raw) ||
      h.isEmpty(google_place_raw.address_components)
    )
      return '';
    const address_components = google_place_raw.address_components.filter((f) =>
      f.types.includes('country'),
    );
    if (address_components.length > 0) {
      return (
        <Flag
          code={address_components[0].short_name}
          fallback={<span> </span>}
          height="30"
          className="mr-3"
          style={{
            marginTop: '-5px',
          }}
        />
      );
    }

    return '';
  };

  function setTranslationFunc(agentId) {
    switch (agentId) {
      case '1da3ff5f-d3fc-11eb-8182-065264a181d4':
      case '3d1d056d-0a26-4274-bb9b-5b9e1b3e3b70':
        setTranslation(
          require('../Sale/Link/preview/constants/locale/ch.json'),
        );
        break;
      default:
        setTranslation(
          require('../Sale/Link/preview/constants/locale/en.json'),
        );
        break;
    }
  }

  // Check setting for available media
  const hasMediaProject = useCallback(
    (type) => {
      return (
        project.projectMedias.filter((f) => {
          const media_tags = f.tags;
          return media_tags.includes(type) && media_tags.includes('project');
        }).length > 0
      );
    },
    [project.projectMedias],
  );

  return (
    <div style={{ position: 'relative', margin: 'inherit' }}>
      <PreviewHeader
        selectedPreview={selectedPreview}
        setSelectedPreview={setSelectedPreview}
      />

      <Header showHeaderContent={false} />

      <div id={'preview-div'} className={'d-flex justify-content-center '}>
        <div
          className={` ${selectedPreview}`}
          style={{
            minHeight: '92vh',
          }}
        >
          <div>
            <Body>
              <div style={customStyle?.topLogoWrapper}>
                <div className="container animate-fadeIn py-3">
                  <div className="mx-2 mx-sm-0">
                    {agencyUser?.agency?.agency_logo_url && showAgencyLogo && (
                      <Card.Title className="pb-3 d-flex justify-content-center">
                        <img
                          alt="Pave"
                          style={{
                            width:
                              window.innerWidth <= 820
                                ? customStyle?.agencyLogoSize.width
                                : 200,
                          }}
                          className="mb-3"
                          src={agencyUser?.agency?.agency_logo_url}
                          onError={() => setShowAgencyLogo(false)}
                        />
                      </Card.Title>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={customStyle?.agentProfile?.container}
                className="py-4"
              >
                <div className="container">
                  <div className="row">
                    <div className={`col-lg-7 col-md-7 col-sm-12 col-xs-12`}>
                      <div className="mx-2 mx-sm-0">
                        <div className="d-flex flex-column">
                          {agencyUser?.user?.email?.toLowerCase() !==
                            'info@rae-on.com' && (
                            <div className="d-flex header-agency align-items-start">
                              <img
                                style={{ objectFit: 'cover' }}
                                className="mb-3 mb-md-0 mt-3 mt-md-0 mr-2 agent-img rounded-circle"
                                src={userProfilePictureUrl}
                                width="93px"
                                height="93px"
                                alt=""
                              />
                              <div className="flex-column contact-name ">
                                <div className="d-flex flex-column">
                                  <span
                                    style={{
                                      fontSize: 22,
                                      fontFamily: 'PoppinsSemiBold',
                                      marginTop: '15px',
                                      ...customStyle?.agentProfile?.name,
                                    }}
                                  >
                                    {h.user.formatFullName(agencyUser?.user)}
                                  </span>
                                </div>
                                {agencyUser.title && (
                                  <div className="d-flex flex-column">
                                    <span
                                      style={{
                                        fontSize: 18,
                                        fontSize: 18,
                                        fontWeight: 400,
                                        ...customStyle?.agentProfile?.title,
                                      }}
                                    >
                                      {agencyUser?.title}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="d-flex flex-column">
                              <p
                                className="mt-4 text-left profile-desc"
                                style={{
                                  fontSize: 18,
                                  fontWeight: 400,
                                  fontFamily: 'PoppinsLight',
                                  ...customStyle?.agentProfile?.description,
                                }}
                              >
                                {showFullAgentDescription
                                  ? agencyUser.description
                                  : agencyUser.description &&
                                    agencyUser.description.substr(
                                      0,
                                      agencyUser?.user?.email?.toLowerCase() !==
                                        'info@rae-on.com'
                                        ? 200
                                        : 400,
                                    )}
                                {!showFullAgentDescription &&
                                agencyUser.description &&
                                agencyUser.description.length >
                                  (agencyUser?.user?.email?.toLowerCase() !==
                                  'info@rae-on.com'
                                    ? 200
                                    : 400)
                                  ? '...'
                                  : ''}
                              </p>
                              <div align="center">
                                {agencyUser?.description &&
                                  agencyUser?.description.length >
                                    (agencyUser?.user?.email?.toLowerCase() !==
                                    'info@rae-on.com'
                                      ? 200
                                      : 400) && (
                                    <a
                                      style={{
                                        ...customStyle?.agentProfile?.readmore,
                                      }}
                                      href="#"
                                      onClick={() =>
                                        setShowFullAgentDescription(
                                          !showFullAgentDescription,
                                        )
                                      }
                                    >
                                      {showFullAgentDescription
                                        ? 'Read Less'
                                        : 'Read More'}
                                    </a>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-12  col-xs-12">
                      <div className="d-flex header-agency align-items-start">
                        <div className="flex-column contact-name ">
                          <div className="d-flex flex-column">
                            <span
                              style={{
                                fontSize: 22,
                                fontFamily: 'PoppinsSemiBold',
                                marginTop: '15px',
                                ...customStyle?.agentProfile?.name,
                              }}
                            >
                              Contact Details
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap mt-4 mt-md-3 social-links">
                        {h.notEmpty(agencyUser?.user?.email) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <IconEmail
                                color={
                                  customStyle?.agentProfile?.socialIcon?.icon
                                    .color
                                }
                              />{' '}
                            </span>

                            <a
                              href={`mailto:${agencyUser?.user?.email}`}
                              style={{
                                ...customStyle?.agentProfile?.socialLink,
                              }}
                            >
                              {agencyUser?.user?.email}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser?.user?.mobile_number) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <IconPhoneVector
                                color={
                                  customStyle?.agentProfile?.socialIcon?.icon
                                    .color
                                }
                              />{' '}
                            </span>

                            <a
                              href={`tel:${agencyUser?.user?.mobile_number}`}
                              style={{
                                ...customStyle?.agentProfile?.socialLink,
                              }}
                            >
                              {agencyUser?.user?.mobile_number}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.website) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <IconWebsiteVector
                                color={
                                  customStyle?.agentProfile?.socialIcon?.icon
                                    .color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.website}
                              target="_blank"
                              style={{
                                ...customStyle?.agentProfile?.socialLink,
                              }}
                            >
                              {agencyUser.website}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.instagram) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <IconInstagramVector
                                color={
                                  customStyle?.agentProfile?.socialIcon?.icon
                                    .color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.instagram}
                              target="_blank"
                              style={{
                                ...customStyle?.agentProfile?.socialLink,
                              }}
                            >
                              @
                              {agencyUser.instagram.split('/') &&
                                (agencyUser.instagram.split('/')[
                                  agencyUser.instagram.split('/').length - 1
                                ] ||
                                  agencyUser.instagram.split('/')[
                                    agencyUser.instagram.split('/').length - 2
                                  ])}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.linkedin) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <IconLinkedinVector
                                color={
                                  customStyle?.agentProfile?.socialIcon?.icon
                                    .color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.linkedin}
                              target="_blank"
                              style={{
                                ...customStyle?.agentProfile?.socialLink,
                              }}
                            >
                              @
                              {agencyUser.linkedin.split('/') &&
                                (agencyUser.linkedin.split('/')[
                                  agencyUser.linkedin.split('/').length - 1
                                ] ||
                                  agencyUser.linkedin.split('/')[
                                    agencyUser.linkedin.split('/').length - 2
                                  ])}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.facebook) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <IconFacebookVector
                                color={
                                  customStyle?.agentProfile?.socialIcon?.icon
                                    .color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.facebook}
                              target="_blank"
                              style={{
                                ...customStyle?.agentProfile?.socialLink,
                              }}
                            >
                              {agencyUser.facebook.split('/') &&
                                (agencyUser.facebook.split('/')[
                                  agencyUser.facebook.split('/').length - 1
                                ] ||
                                  agencyUser.facebook.split('/')[
                                    agencyUser.facebook.split('/').length - 2
                                  ])}
                            </a>
                          </div>
                        )}
                        {/* {!h.isEmpty(agencyUser?.user?.mobile_number) &&
                            h.user.isValidNumberWithCountryCode(
                              agencyUser.user.mobile_number,
                            ) && (
                              <div className="d-flex align-items-center flex-5p">
                                <span
                                  className="social-links-icon"
                                  // style={{
                                  //   ...customStyle.agentProfile.socialIcon
                                  //     .background,
                                  // }}
                                >
                                  <img
                                    src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/whatsapp-logo.png"
                                    width={34}
                                    style={{
                                      marginBottom: '5px',
                                      cursor: 'pointer',
                                      marginLeft: '-5px',
                                      marginRight: '-5px',
                                    }}
                                    title="WhatsApp Mobile Number"
                                  />
                                </span>
                                <a
                                  href={`https://wa.me/${agencyUser?.user?.mobile_number}`}
                                  style={{
                                    ...customStyle?.agentProfile?.socialLink,
                                  }}
                                >
                                  Reach out on WhatsApp
                                </a>
                              </div>
                            )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: customStyle?.background ?? '#fff',
                  paddingBottom: '5em',
                }}
              >
                <div className="container">
                  <div className="pt-4 mb-5">
                    <div>
                      <div className="d-flex">
                        <div>
                          <h1
                            className="display-4 project-title"
                            style={{
                              fontSize: '44px',
                              fontWeight: '500',
                              fontFamily: 'PoppinsBold',
                              ...customStyle?.project?.title,
                            }}
                          >
                            {getCountryCode(project.location_google_place_raw)}
                            {project.name}
                          </h1>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap info-bcrumb">
                        {h.notEmpty(project.location_address_1) && (
                          <>
                            <p
                              className="text-color2"
                              style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                color: '#626970',
                                fontFamily: 'PoppinsLight',
                                margin: 0,
                              }}
                            >
                              <a
                                href={`https://www.google.com.sg/maps/place/${project.location_address_1}`}
                                className="text-color5"
                                target="_blank"
                                style={{ whiteSpace: 'normal' }}
                              >
                                {project.location_address_1}
                              </a>
                            </p>
                            <span className="address-divider">&#8211;</span>
                          </>
                        )}
                        {!h.date.isDateEmpty(project.completion_date) && (
                          <>
                            <p
                              className="text-color2"
                              style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                fontFamily: 'PoppinsLight',
                                color: '#626970',
                                margin: 0,
                              }}
                            >
                              {!h.date.isDateEmpty(project.completion_date) && (
                                <span className="text-color5">
                                  {h.translate.localize(
                                    'developmentDetails',
                                    translate,
                                  )}{' '}
                                  {h.date.convertDateToQuarter(
                                    project.completion_date,
                                  )}
                                </span>
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <ShortlistedProjectBookmark
                  contact_id={''}
                  shortlisted_project_id={''}
                  is_bookmarked={false}
                  shouldTrackActivity={false}
                  reloadShortlistedProjects={() => {}}
                  customStyle={customStyle}
                  hasMedia={projectMedias.length}
                />

                {projectMedias.length > 0 && (
                  <CommonCarousel
                    customStyle={customStyle}
                    translate={translate}
                    shouldTrackActivity={false}
                    projectLevel={true}
                    items={projectMedias.map((media, index) => ({
                      src: h.general.formatUrl(media.url),
                      alt: media.title,
                      description: null,
                      media_type: media.type,
                      thumbnail_src: media.thumbnail_src,
                      tag: media.tags,
                      is_hero_image: media.is_hero_image,
                      display_order: media.display_order,
                    }))}
                    enabledTags={{
                      image: hasMediaProject(constant.PROPERTY.MEDIA.TAG.IMAGE),
                      floor_plan: hasMediaProject(
                        constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN,
                      ),
                      video: hasMediaProject(constant.PROPERTY.MEDIA.TAG.VIDEO),
                      brochure: hasMediaProject(
                        constant.PROPERTY.MEDIA.TAG.BROCHURE,
                      ),
                      factsheet: hasMediaProject(
                        constant.PROPERTY.MEDIA.TAG.FACTSHEET,
                      ),
                      render_3d: hasMediaProject(
                        constant.PROPERTY.MEDIA.TAG.RENDER_3D,
                      ),
                    }}
                  />
                )}

                <div className="container">
                  {h.notEmpty(project.description) && (
                    <div>
                      <h3
                        style={{
                          fontFamily: 'PoppinsSemiBold',
                          fontSize: '24px',
                          color: customStyle?.details?.title,
                        }}
                        className="mb-2 project-title"
                      >
                        {h.translate.localize('details', translate)}
                      </h3>
                      <div
                        className="mt-2 mb-5 project-desc"
                        style={{
                          fontFamily: 'PoppinsLight',
                          fontSize: '18px',
                          color: '#626970',
                          color: customStyle?.details?.content,
                        }}
                      >
                        {project.description}
                      </div>
                    </div>
                  )}
                </div>
                {h.notEmpty(project.features) && (
                  <div className="container">
                    <div
                      className="project-features-container p-3"
                      style={{
                        background: customStyle?.projectFeatures?.background,
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: 'PoppinsSemiBold',
                          fontSize: '24px',
                          color: customStyle?.projectFeatures?.title,
                        }}
                        className="project-features-title"
                      >
                        {h.translate.localize('amenities', translate)}
                      </h3>
                      <div className="row">
                        {project.features
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((feature, i) => {
                            return (
                              <div
                                className="col-6 col-sm-6 col-md-6 col-lg-4 d-flex project-feature align-items-start"
                                key={i}
                              >
                                <span
                                  className="project-feature-icon"
                                  style={{
                                    background:
                                      customStyle?.projectFeatures?.iconBg,
                                    border: `1px solid ${customStyle?.projectFeatures?.iconBorder}`,
                                  }}
                                >
                                  <FeatureIconMapping
                                    type={feature.type}
                                    color={
                                      customStyle?.projectFeatures?.iconColor
                                    }
                                  />
                                </span>
                                <span
                                  className="project-feature-name"
                                  style={{
                                    color:
                                      customStyle?.projectFeatures?.textColor,
                                  }}
                                >
                                  {feature.name}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className={
                    h.notEmpty(project.key_stats) ||
                    h.notEmpty(project.project_highlights) ||
                    h.notEmpty(project.why_invest) ||
                    h.notEmpty(project.shopping) ||
                    h.notEmpty(project.transport)
                      ? `py-4 container`
                      : ''
                  }
                >
                  <div
                    className="container my-3 project-info"
                    style={{
                      background: customStyle?.projectInfo?.background,
                    }}
                  >
                    {h.notEmpty(project.key_stats) && (
                      <CommonExpandCollapse
                        customStyle={customStyle}
                        title={h.translate.localize('Key Stats', translate)}
                        body={project.key_stats}
                      ></CommonExpandCollapse>
                    )}
                    {h.notEmpty(project.project_highlights) && (
                      <CommonExpandCollapse
                        customStyle={customStyle}
                        title={h.translate.localize(
                          'Project Highlights',
                          translate,
                        )}
                        body={project.project_highlights}
                      ></CommonExpandCollapse>
                    )}
                    {h.notEmpty(project.why_invest) && (
                      <CommonExpandCollapse
                        customStyle={customStyle}
                        title={h.translate.localize('Why Invest', translate)}
                        body={project.why_invest}
                      ></CommonExpandCollapse>
                    )}
                    {h.notEmpty(project.shopping) && (
                      <CommonExpandCollapse
                        customStyle={customStyle}
                        title={h.translate.localize('shopping', translate)}
                        body={project.shopping}
                      ></CommonExpandCollapse>
                    )}
                    {h.notEmpty(project.transport) && (
                      <CommonExpandCollapse
                        customStyle={customStyle}
                        title={h.translate.localize('transport', translate)}
                        body={project.transport}
                      ></CommonExpandCollapse>
                    )}
                    {h.notEmpty(project.education) && (
                      <CommonExpandCollapse
                        customStyle={customStyle}
                        title={h.translate.localize('education', translate)}
                        body={project.education}
                      ></CommonExpandCollapse>
                    )}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      background: customStyle?.projectLocation?.background,
                    }}
                    className="py-3"
                  >
                    <div className="container">
                      {project.location_google_place_id && (
                        <div>
                          <h3
                            style={{
                              fontFamily: 'PoppinsSemiBold',
                              fontSize: '24px',
                              color: customStyle?.projectLocation?.titleColor,
                            }}
                            className="mb-3"
                          >
                            {h.translate.localize('projectLocation', translate)}
                          </h3>
                          <iframe
                            className="mt-2 mb-1 map-loc"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '5px' }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?q=place_id:${project.location_google_place_id}&key=${config.google.apiKey}`}
                          ></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {agencyUser && project && (
                <div
                  className="d-flex flex-column w-100 align-items-center justify-content-center pb-3"
                  style={{ background: customStyle?.footer?.background }}
                >
                  {h.notEmpty(agencyUser) && (
                    <>
                      {h.notEmpty(agencyUser?.agency.agency_logo_url) ? (
                        <img
                          src={agencyUser?.agency.agency_logo_url}
                          alt="Pave"
                          style={{
                            width:
                              window.innerWidth <= 820
                                ? customStyle?.agencyLogoSize.width
                                : 200,
                          }}
                          className="mt-2"
                        />
                      ) : (
                        <span
                          className="rounded-circle comment-profile-picture profile-picture"
                          style={{
                            cursor: 'default',
                            width: '150px',
                            height: '150px',
                            fontSize: '30px',
                          }}
                        >
                          {h.user.getNameInitials(
                            agencyUser?.agency.agency_name,
                          )}
                        </span>
                      )}
                    </>
                  )}
                  <div
                    className="pt-3 text-center"
                    style={{
                      color: customStyle?.footer?.text,
                      fontFamily: 'PoppinsRegular',
                    }}
                  >
                    Powered by{' '}
                    <a
                      href="https://www.yourpave.com/"
                      target="_blank"
                      style={{
                        textDecoration: 'underline',
                        color: customStyle?.footer?.text,
                      }}
                    >
                      Pave
                    </a>
                  </div>
                </div>
              )}
            </Body>
          </div>
        </div>
      </div>
    </div>
  );
}
