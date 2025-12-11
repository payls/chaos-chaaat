import React, { useEffect, useState, useMemo, useCallback } from 'react';

import { h } from '../../helpers';
import { api } from '../../api';
import { config } from '../../configs/config';
import ShortlistedProjectBookmark from './ShortlistedProjectBookmark';
import ShortlistedPropertyCards from './ShortlistedPropertyCard';
import ShortlistedProjectComment from './ShortlistedProjectComment';
import ShortlistedProjectCommentTextArea from './ShortlistedProjectCommentTextArea';
import ShortlistedProjectOlderComments from './ShortlistedProjectOlderComments';
import CommonStarRating from '../Common/CommonStarRating';

import CommonCarousel from '../Common/CommonCarousel';
import CommonExpandCollapse from '../Common/CommonExpandCollapse';
import constant from '../../constants/constant.json';
import { faBookmark, faCertificate } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconOrangePool from '../Icons/IconOrangePool';
import IconOrangeGym from '../Icons/IconOrangeGym';
import IconOrangeConcierge from '../Icons/IconOrangeConcierge';
import IconOrangeTennis from '../Icons/IconOrangeTennis';
import IconOrangeBath from '../Icons/IconOrangeBath';
import IconOrangeSauna from '../Icons/IconOrangeSauna';
import IconOrangeCoworking from '../Icons/IconOrangeCoworking';
import IconOrangeSecurity from '../Icons/IconOrangeSecurity';
import IconOrangeUtilityArea from '../Icons/IconOrangeUtilityArea';
import IconOrangeGarden from '../Icons/IconOrangeGarden';
import IconOrangeParking from '../Icons/IconOrangeParking';
import IconOrangeGameRoom from '../Icons/IconOrangeGameRoom';
import IconOrangeGolfSimulator from '../Icons/IconOrangeGolfSimulator';
import IconOrangeTheater from '../Icons/IconOrangeTheater';
import IconOrangeDogWash from '../Icons/IconOrangeDogWash';
import IconOrangeResidenceClub from '../Icons/IconOrangeResidenceClub';
import IconOrangeWine from '../Icons/IconOrangeWine';
import IconOrangeSteamRoom from '../Icons/IconOrangeSteamRoom';
import IconIntegratedAppliances from '../Icons/IconIntegratedAppliances';
import IconCCTV from '../Icons/IconCCTV';

import ShortlistedPropertyCard from './ShortlistedProperty/Card';

import '/node_modules/flag-icons/css/flag-icons.min.css';
const FeatureIconMapping = (props) => {
  const { type } = props;

  switch (type) {
    case 'pool':
      return <IconOrangePool {...props} fill={props.color} />;
    case 'gym':
      return <IconOrangeGym {...props} fill={props.color} />;
    case 'concierge':
      return <IconOrangeConcierge {...props} fill={props.color} />;
    case 'tennis':
      return <IconOrangeTennis {...props} fill={props.color} />;
    case 'jacuzzi':
      return <IconOrangeBath {...props} fill={props.color} />;
    case 'sauna':
      return <IconOrangeSauna {...props} fill={props.color} />;
    case 'library':
      return <IconOrangeCoworking {...props} fill={props.color} />;
    case 'security':
      return <IconOrangeSecurity {...props} fill={props.color} />;
    case 'utility_area':
      return <IconOrangeUtilityArea {...props} fill={props.color} />;
    case 'garden':
      return <IconOrangeGarden {...props} fill={props.color} />;
    case 'games_room':
      return <IconOrangeGameRoom {...props} fill={props.color} />;
    case 'golf_simulator':
      return <IconOrangeGolfSimulator {...props} fill={props.color} />;
    case 'theater':
      return <IconOrangeTheater {...props} fill={props.color} />;
    case 'parking':
      return <IconOrangeParking {...props} fill={props.color} />;
    case 'dog_wash':
      return <IconOrangeDogWash {...props} fill={props.color} />;
    case 'residence_club':
      return <IconOrangeResidenceClub {...props} fill={props.color} />;
    case 'wine':
      return <IconOrangeWine {...props} fill={props.color} />;
    case 'steam_room':
      return <IconOrangeSteamRoom {...props} fill={props.color} />;
    case 'integrated_appliances':
      return <IconIntegratedAppliances {...props} fill={props.color} />;
    case 'secure_video_entry':
      return <IconCCTV {...props} fill={props.color} />;
    default:
      return (
        <FontAwesomeIcon
          className="wildIcon"
          icon={faCertificate}
          color={props.color}
          size="sm"
        />
      );
  }
};

function ShortlistedProjectCard(props) {
  const {
    contact,
    setLoading,
    shouldTrackActivity,
    shortlistedProject,
    reloadShortlistedProjects,
    settingsData,
    setSettingsData,
    customStyle,
    translate,
    projectRef,
    propertyRef,
    project,
    shortlistedProperties,
    proposalProperties,
  } = props;
  const [projectSettings, setProjectSettings] = useState(null);
  const [filteredMediaUnits, setFilteredMediaUnits] = useState([]);
  const [hideOldComments, setHideOldComments] = useState(true);
  const [latestComment, setLatestComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState('');
  const [comments, setComments] = useState({});
  const [rating, setRating] = useState(0);
  // Set Initial value for info settings
  useEffect(() => {
    if (!projectSettings && shortlistedProject && project) {
      (async () => {
        let projectSettingsData = null;
        const projectSettingsApi =
          await api.shortlistedProject.getShortlistedProjectSettings(
            {
              shortlisted_project_id: shortlistedProject.shortlisted_project_id,
            },
            false,
          );

        if (h.cmpStr(projectSettingsApi.status, 'ok')) {
          if (!h.isEmpty(projectSettingsApi.data.shortListedProjectSetting)) {
            projectSettingsData =
              projectSettingsApi.data.shortListedProjectSetting;
          } else {
            projectSettingsData = {
              shortlisted_project_id: shortlistedProject.shortlisted_project_id,
              info_setting_key_stats: true,
              info_setting_project_highlights: true,
              info_setting_why_invest: true,
              info_setting_shopping: true,
              info_setting_transport: true,
              info_setting_education: true,
              media_setting_image: true,
              media_setting_video: true,
              media_setting_floor_plan: true,
              media_setting_brocure: true,
              media_setting_factsheet: true,
              media_setting_render_3d: true,
              shortlisted_property_settings: [],
              hidden_media: null,
              media_order: null,
            };
          }
          const hiddenMediaIds =
            projectSettingsData.hidden_media &&
            (projectSettingsData.hidden_media !== null ||
              projectSettingsData.hidden_media !== '')
              ? projectSettingsData.hidden_media.split(',')
              : [];

          const sortedMedia = handleInitialSort(
            projectSettingsData,
            project.project_media,
          );
          setFilteredMediaUnits(
            sortedMedia.filter((f) => {
              const media_tags = f.project_media_tags.map((m) => m.tag);
              return (
                ((projectSettingsData.media_setting_image &&
                  media_tags.includes('image')) ||
                  (projectSettingsData.media_setting_video &&
                    media_tags.includes('video')) ||
                  (projectSettingsData.media_setting_floor_plan &&
                    media_tags.includes('floor_plan')) ||
                  (projectSettingsData.media_setting_brocure &&
                    media_tags.includes('brochure')) ||
                  (projectSettingsData.media_setting_factsheet &&
                    media_tags.includes('factsheet')) ||
                  (projectSettingsData.media_setting_render_3d &&
                    media_tags.includes('render_3d'))) &&
                !hiddenMediaIds.includes(f.project_media_id)
              );
            }),
          );
          setProjectSettings(projectSettingsData);
          setSettingsData(settingsData);
        }
      })();
    }
  }, [projectSettings]);

  useEffect(() => {
    if (shortlistedProject) {
      (async () => {
        reloadComments(shortlistedProject.shortlisted_project_id);
      })();
    }
  }, [shortlistedProject]);

  useEffect(() => {
    if (shortlistedProject?.project_rating) {
      setRating(shortlistedProject.project_rating);
    }
  }, [shortlistedProject?.project_rating]);

  const getShorlistedProperties = useMemo(() => {
    return shortlistedProperties.filter(
      (f) => f?.project_fk === project?.project_id,
    );
  }, [shortlistedProperties]);

  const getShorlistedPropertyId = (id) => {
    const i = proposalProperties.findIndex(
      (f) => f?.project_property_fk === id,
    );
    if (i > -1) {
      return {
        shortlisted_property_id: proposalProperties[i]?.shortlisted_property_id,
        is_general_enquiry: proposalProperties[i]?.is_general_enquiry,
        is_requested_for_reservation:
          proposalProperties[i]?.is_requested_for_reservation,
        is_bookmarked: proposalProperties[i]?.is_bookmarked,
        property_rating: proposalProperties[i]?.property_rating,
      };
    }
    return {};
  };
  const handleInitialSort = (projectSettings, medias) => {
    let reorderMediasArray = [];
    // Reorder medias if has reorder setting
    if (
      projectSettings.media_order !== null &&
      projectSettings.media_order !== ''
    ) {
      let lastOrderCount = 1;
      const mediaOrderArray = projectSettings.media_order.split(',');

      // Get medias with reorder setting
      mediaOrderArray.forEach((mediaId) => {
        medias.forEach((mediaObj) => {
          if (mediaId === mediaObj.project_media_id) {
            reorderMediasArray.push({
              ...mediaObj,
              display_order: lastOrderCount,
            });

            lastOrderCount++;
          }
        });
      });
      // Get medias with no reorder settings  - newly added media
      medias.forEach((media) => {
        if (!mediaOrderArray.includes(media.project_media_id)) {
          reorderMediasArray.push({
            ...media,
            display_order: lastOrderCount,
          });
          lastOrderCount++;
        }
      });
    } else {
      // Set default reorder from project
      reorderMediasArray = medias.sort(
        (a, b) => a.display_order - b.display_order,
      );
    }

    return reorderMediasArray;
  };

  const preProcessProperties = (properties) => {
    const sortProperties = (properties) => {
      const compareFunction = (first, second) => {
        if (first.is_bookmarked && !second.is_bookmarked) {
          return -1;
        } else if (!first.is_bookmarked && second.is_bookmarked) {
          return 1;
        } else {
          // for both bookmarked and not bookmarked, the display order logic remains the same
          return first.display_order < second.display_order ? -1 : 1;
        }
      };
      return properties.sort(compareFunction);
    };

    const handleHKPropertyPrice = (shortlistedProperties) => {
      if (
        Array.isArray(shortlistedProperties) &&
        shortlistedProperties.length > 0
      ) {
        shortlistedProperties = shortlistedProperties.map((property) => {
          if (property.unit && property.unit.currency === 'hkd') {
            if (
              h.isEmpty(property.unit.start_price) ||
              h.cmpInt(property.unit.start_price, 0)
            ) {
              property.unit.start_price_label = 'Bidding | 招標';
            } else {
              property.unit.start_price_formatted =
                h.currency.customPropertyPrice(
                  property.unit.start_price,
                  'hkd',
                );
            }
          }
          return property;
        });
      }
      return shortlistedProperties;
    };

    return sortProperties(handleHKPropertyPrice(properties));
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
    await handleTracker(
      constant.CONTACT.ACTIVITY.TYPE.MORE_PROPERTY_REQUESTED,
      {},
    );

    const apiRes = await api.shortlistedProject.enquireShortlistedProject(
      {
        shortlisted_project_id: shortlistedProject.shortlisted_project_id,
      },
      false,
    );
    setLoading(false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      h.general.alert('success', {
        message:
          'Thank you for your interest, you will hear back from the agent shortly!',
      });
      reloadShortlistedProjects();
    }
  };

  const formatDate = (date) => {
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return h.date.convertUTCDateToLocalDate(date, localTimezone, 'en-GB', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getCountryCode = (google_place_raw) => {
    if (
      h.isEmpty(google_place_raw) ||
      h.isEmpty(google_place_raw?.address_components)
    )
      return '';
    const address_components = google_place_raw.address_components.filter((f) =>
      f.types.includes('country'),
    );
    if (address_components.length > 0) {
      return (
        <span
          className={`fi fi-${address_components[0].short_name?.toLowerCase()}`}
          style={{
            height: '30px',
            marginTop: '-5px',
            marginRight: '5px',
            verticalAlign: 'middle',
          }}
        ></span>
      );
    }

    return '';
  };

  const reloadComments = async (shortlisted_project_id) => {
    const apiRes = await api.shortlistedProjectComment.findAll(
      {
        shortlisted_project_id:
          shortlisted_project_id ?? shortlistedProject.shortlisted_project_id,
      },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      const latestComment = getLatestComment(
        apiRes.data.shortlisted_project_comments,
      );
      setLatestComment(latestComment);
      setComments(
        apiRes.data.shortlisted_project_comments.filter(
          (comment) => comment !== latestComment,
        ),
      );
    }
  };

  const getLatestComment = (comments) => {
    if (h.general.isEmpty(comments)) return null;
    const latestCommentReducer = (prev, curr) => {
      if (curr.created_date_raw > prev.created_date_raw) return curr;
      return prev;
    };
    const latestComment = comments.reduce(latestCommentReducer);
    return latestComment;
  };

  const handleModal = (e, attachment) => {
    if (e) e.preventDefault();
    if (showModal) {
      setShowModal(false);
      setCurrentModal('');
    } else {
      setShowModal(true);
      setCurrentModal(attachment.shortlisted_project_comment_attachment_id);
    }
  };

  const handleChangeRating = async (value) => {
    setRating(value);
    await api.shortlistedProject.updateShortlistedProjectRating(
      {
        shortlisted_project_id: shortlistedProject.shortlisted_project_id,
        project_rating: value,
      },
      false,
    );
    if (shouldTrackActivity)
      await api.contactActivity.create(
        {
          contact_fk: contact.contact_id,
          activity_type: constant.CONTACT.ACTIVITY.TYPE.PROJECT_RATED,
          activity_meta: JSON.stringify({
            shortlisted_project_id: shortlistedProject.shortlisted_project_id,
            project_rating: value,
          }),
        },
        false,
      );
  };

  // Check setting for available media
  const hasMedia = useCallback(
    (type) => {
      return (
        project.project_media.filter((f) => {
          const media_tags = f.project_media_tags.map((m) => m.tag);
          return media_tags.includes(type) && media_tags.includes('project');
        }).length > 0
      );
    },
    [shortlistedProject.project_media],
  );

  return (
    <div style={{ backgroundColor: customStyle?.background }} className="">
      <div className="container py-4">
        <div className="">
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
                  ref={projectRef}
                >
                  {getCountryCode(
                    shortlistedProject.project.location_google_place_raw,
                  )}
                  {shortlistedProject.project.name}
                </h1>
              </div>
            </div>
            <div className="d-flex flex-wrap info-bcrumb">
              {h.notEmpty(shortlistedProject.project.location_address_1) && (
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
                      href={`https://www.google.com.sg/maps/place/${shortlistedProject.project.location_address_1}`}
                      className="text-color5"
                      target="_blank"
                      style={{ whiteSpace: 'normal' }}
                    >
                      {shortlistedProject.project.location_address_1}
                    </a>
                  </p>
                  <span className="address-divider">&#8211;</span>
                </>
              )}
              {!h.date.isDateEmpty(
                shortlistedProject.project.completion_date,
              ) && (
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
                    <span className="text-color5">
                      {h.translate.localize('completionDate', translate)}{' '}
                      {h.date.convertDateToQuarter(
                        shortlistedProject.project.completion_date,
                      )}
                    </span>
                  </p>
                  <span className="address-divider">&#8211;</span>
                </>
              )}

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
                {h.translate.localize('developmentDetails', translate)}{' '}
                {formatDate(shortlistedProject.created_date)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ShortlistedProjectBookmark
        contact_id={contact.contact_id}
        shortlisted_project_id={shortlistedProject.shortlisted_project_id}
        is_bookmarked={shortlistedProject.is_bookmarked}
        shouldTrackActivity={shouldTrackActivity}
        reloadShortlistedProjects={reloadShortlistedProjects}
        hasMedia={filteredMediaUnits.length}
        customStyle={customStyle}
      />

      {filteredMediaUnits.length > 0 && (
        <CommonCarousel
          customStyle={customStyle}
          translate={translate}
          key={`propject-carousel-` + shortlistedProject.shortlisted_project_id}
          shouldTrackActivity={shouldTrackActivity}
          activityTracker={async (activity, metaData) => {
            await handleTracker(activity, metaData);
          }}
          projectLevel={true}
          items={filteredMediaUnits
            .filter((f) => f.url)
            .sort((a, b) => {
              if (a.display_order && b.display_order) {
                return a.display_order - b.display_order;
              }
              return (
                new Date(a.created_date_raw) - new Date(b.created_date_raw)
              );
            })
            .map((media, index) => ({
              src: h.general.formatUrl(media.url),
              alt: media.title,
              description: null,
              media_type: media.type,
              thumbnail_src: media.thumbnail_src,
              tag: media.project_media_tags.reduce((prev, curr) => {
                return [...prev, curr.tag];
              }, []),
              is_hero_image: media.is_hero_image,
              display_order: media.display_order,
            }))}
          enabledTags={{
            image:
              hasMedia(constant.PROPERTY.MEDIA.TAG.IMAGE) &&
              projectSettings?.media_setting_image,
            floor_plan:
              hasMedia(constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN) &&
              projectSettings?.media_setting_floor_plan,
            video:
              hasMedia(constant.PROPERTY.MEDIA.TAG.VIDEO) &&
              projectSettings?.media_setting_video,
            brochure:
              hasMedia(constant.PROPERTY.MEDIA.TAG.BROCHURE) &&
              projectSettings?.media_setting_brocure,
            factsheet:
              hasMedia(constant.PROPERTY.MEDIA.TAG.FACTSHEET) &&
              projectSettings?.media_setting_factsheet,
            render_3d:
              hasMedia(constant.PROPERTY.MEDIA.TAG.RENDER_3D) &&
              projectSettings?.media_setting_render_3d,
          }}
        />
      )}

      <div className="container">
        {h.notEmpty(shortlistedProject.project.description) && (
          <div>
            <h3
              style={{
                fontFamily: 'PoppinsSemiBold',
                fontSize: '24px',
                color: customStyle.details.title,
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
                color: customStyle.details.content,
              }}
            >
              {shortlistedProject.project.description}
            </div>
          </div>
        )}
      </div>
      {project && h.notEmpty(project.features) && (
        <div className=" container">
          <div
            className="project-features-container p-3"
            style={{ background: customStyle.projectFeatures.background }}
          >
            <h3
              style={{
                fontFamily: 'PoppinsSemiBold',
                fontSize: '24px',
                color: customStyle.projectFeatures.title,
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
                          background: customStyle.projectFeatures.iconBg,
                          border: `1px solid ${customStyle.projectFeatures.iconBorder}`,
                        }}
                      >
                        <FeatureIconMapping
                          type={feature.type}
                          color={customStyle.projectFeatures.iconColor}
                        />
                      </span>
                      <span
                        className="project-feature-name"
                        style={{ color: customStyle.projectFeatures.textColor }}
                      >
                        {feature.name}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* <div className="project-features-flex flex-wrap">
              {shortlistedProject.features.map((feature) => {
                return (
                  <div
                    className="d-flex project-feature align-items-start"
                    style={{ flex: '1 0 33%' }}
                  >
                    <span className="project-feature-icon">
                      <FeatureIconMapping type={feature.type} />
                    </span>
                    <span className="project-feature-name">{feature.name}</span>
                  </div>
                );
              })}
            </div> */}
          </div>
        </div>
      )}
      <div
        className={
          h.notEmpty(shortlistedProject.project.key_stats) ||
          h.notEmpty(shortlistedProject.project.project_highlights) ||
          h.notEmpty(shortlistedProject.project.why_invest) ||
          h.notEmpty(shortlistedProject.project.shopping) ||
          h.notEmpty(shortlistedProject.project.transport)
            ? `py-4 container  `
            : ''
        }
      >
        <div
          className="container my-3 project-info"
          style={{ background: customStyle.projectInfo.background }}
        >
          {h.notEmpty(shortlistedProject.project.key_stats) &&
            projectSettings?.info_setting_key_stats && (
              <div
                onClick={() => {
                  handleTracker(
                    constant.CONTACT.ACTIVITY.TYPE
                      .PROJECT_ADDITIONAL_FIELD_CLICKED,
                    { fieldName: 'key_stats' },
                  );
                }}
              >
                <CommonExpandCollapse
                  customStyle={customStyle}
                  title={h.translate.localize('Key Stats', translate)}
                  body={shortlistedProject.project.key_stats}
                ></CommonExpandCollapse>
              </div>
            )}
          {h.notEmpty(shortlistedProject.project.project_highlights) &&
            projectSettings?.info_setting_project_highlights && (
              <div
                onClick={() => {
                  handleTracker(
                    constant.CONTACT.ACTIVITY.TYPE
                      .PROJECT_ADDITIONAL_FIELD_CLICKED,
                    { fieldName: 'project_highlights' },
                  );
                }}
              >
                <CommonExpandCollapse
                  customStyle={customStyle}
                  title={h.translate.localize('Project Highlights', translate)}
                  body={shortlistedProject.project.project_highlights}
                ></CommonExpandCollapse>
              </div>
            )}
          {h.notEmpty(shortlistedProject.project.why_invest) &&
            projectSettings?.info_setting_why_invest && (
              <div
                onClick={() => {
                  handleTracker(
                    constant.CONTACT.ACTIVITY.TYPE
                      .PROJECT_ADDITIONAL_FIELD_CLICKED,
                    { fieldName: 'why_invest' },
                  );
                }}
              >
                <CommonExpandCollapse
                  customStyle={customStyle}
                  title={h.translate.localize('Why Invest', translate)}
                  body={shortlistedProject.project.why_invest}
                ></CommonExpandCollapse>
              </div>
            )}
          {h.notEmpty(shortlistedProject.project.shopping) &&
            projectSettings?.info_setting_shopping && (
              <div
                onClick={() => {
                  handleTracker(
                    constant.CONTACT.ACTIVITY.TYPE
                      .PROJECT_ADDITIONAL_FIELD_CLICKED,
                    { fieldName: 'shopping' },
                  );
                }}
              >
                <CommonExpandCollapse
                  customStyle={customStyle}
                  title={h.translate.localize('shopping', translate)}
                  body={shortlistedProject.project.shopping}
                ></CommonExpandCollapse>
              </div>
            )}
          {h.notEmpty(shortlistedProject.project.transport) &&
            projectSettings?.info_setting_transport && (
              <div
                onClick={() => {
                  handleTracker(
                    constant.CONTACT.ACTIVITY.TYPE
                      .PROJECT_ADDITIONAL_FIELD_CLICKED,
                    { fieldName: 'transport' },
                  );
                }}
              >
                <CommonExpandCollapse
                  customStyle={customStyle}
                  title={h.translate.localize('transport', translate)}
                  body={shortlistedProject.project.transport}
                ></CommonExpandCollapse>
              </div>
            )}
          {h.notEmpty(shortlistedProject.project.education) &&
            projectSettings?.info_setting_education && (
              <div
                onClick={() => {
                  handleTracker(
                    constant.CONTACT.ACTIVITY.TYPE
                      .PROJECT_ADDITIONAL_FIELD_CLICKED,
                    { fieldName: 'education' },
                  );
                }}
              >
                <CommonExpandCollapse
                  customStyle={customStyle}
                  title={h.translate.localize('education', translate)}
                  body={shortlistedProject.project.education}
                ></CommonExpandCollapse>
              </div>
            )}
        </div>
      </div>
      <div>
        <div
          style={{ background: customStyle.projectLocation.background }}
          className="py-3"
        >
          <div className="container">
            {shortlistedProject.project.location_google_place_id && (
              <div>
                <h3
                  style={{
                    fontFamily: 'PoppinsSemiBold',
                    fontSize: '24px',
                    color: customStyle.projectLocation.titleColor,
                  }}
                  className="mb-2 project-title"
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
                  src={`https://www.google.com/maps/embed/v1/place?q=place_id:${shortlistedProject.project.location_google_place_id}&key=${config.google.apiKey}`}
                ></iframe>
              </div>
            )}
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-6">
              <div className="mb-2">
                <div
                  className="leave-private-message-text mb-2"
                  style={{ ...customStyle?.smallLabel }}
                >
                  {h.translate.localize(
                    'whatDoYouThinkOfThisProject',
                    translate,
                  )}
                </div>
                <CommonStarRating
                  count={5}
                  value={rating}
                  onChange={handleChangeRating}
                  shouldTrackActivity={shouldTrackActivity}
                  customStyle={customStyle}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-6">
              <div className="row">
                <div className="col-12 d-flex justify-content-between">
                  <span
                    className="leave-private-message-text mb-2"
                    style={{ fontWeight: 'bold', ...customStyle?.smallLabel }}
                  >
                    {h.translate.localize('leaveAMessage', translate)}
                  </span>
                  {h.general.notEmpty(comments) && (
                    <span
                      className="see-older-msg"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setHideOldComments(!hideOldComments);
                      }}
                    >
                      {!hideOldComments
                        ? h.translate.localize('hideOlderMessage', translate)
                        : h.translate.localize('seeOlderMessage', translate)}
                    </span>
                  )}
                </div>
              </div>
              {shortlistedProject && (
                <div className="row">
                  <div className="col-12">
                    {h.general.notEmpty(latestComment) && (
                      <ShortlistedProjectComment
                        customStyle={customStyle}
                        translate={translate}
                        comment={latestComment}
                        handleModal={handleModal}
                        showModal={showModal}
                        currentModal={currentModal}
                        contact={contact}
                        project={shortlistedProject}
                        contact_id={contact.contact_id}
                        shortlisted_project_id={
                          shortlistedProject.shortlisted_project_id
                        }
                        setLoading={setLoading}
                        reloadComments={reloadComments}
                        handleTracker={handleTracker}
                        shouldTrackActivity={false}
                      />
                    )}
                  </div>
                  {/* TextArea for new comments that are not replies */}
                  <ShortlistedProjectCommentTextArea
                    project={shortlistedProject}
                    contact_id={contact.contact_id}
                    shortlisted_project_id={
                      shortlistedProject.shortlisted_project_id
                    }
                    setLoading={setLoading}
                    reloadComments={reloadComments}
                    shouldTrackActivity={shouldTrackActivity}
                    customStyle={customStyle}
                    translate={translate}
                  />
                  {h.general.notEmpty(comments) && (
                    <span
                      className="see-older-msg bot"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setHideOldComments(!hideOldComments);
                      }}
                    >
                      {!hideOldComments
                        ? h.translate.localize('hideOlderMessage', translate)
                        : h.translate.localize('seeOlderMessage', translate)}
                    </span>
                  )}
                  {shortlistedProject && h.general.notEmpty(comments) && (
                    <ShortlistedProjectOlderComments
                      hideOldCommentsInit={hideOldComments}
                      comments={comments}
                      handleModal={handleModal}
                      showModal={showModal}
                      currentModal={currentModal}
                      contact={contact}
                      project={shortlistedProject}
                      contact_id={contact.contact_id}
                      shortlisted_project_id={
                        shortlistedProject.shortlisted_project_id
                      }
                      setLoading={setLoading}
                      reloadComments={reloadComments}
                      handleTracker={handleTracker}
                      shouldTrackActivity={shouldTrackActivity}
                      translate={translate}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!h.notEmpty(getShorlistedProperties) && (
          <div className="d-flex justify-content-center py-4">
            <button
              className={
                !shortlistedProject.is_enquired
                  ? 'send-options-button'
                  : 'send-options-button send-options-button-pending'
              }
              onClick={async () => {
                handleSendMoreOptions();
              }}
              style={{
                border: `2px solid ${
                  customStyle.options?.background ?? '#014976'
                }`,
                background: shortlistedProject.is_enquired
                  ? '#f7f7f7'
                  : customStyle.options?.background,
                color: shortlistedProject.is_enquired
                  ? customStyle.options?.background
                  : customStyle.options?.color ?? '#fff',
              }}
              disabled={shortlistedProject.is_enquired ? true : false}
            >
              {!shortlistedProject.is_enquired
                ? h.translate.localize(
                    'sendMeSomeOptionsForThisDeveplopment',
                    translate,
                  )
                : h.translate.localize('pendingResponseFromAgent', translate)}
            </button>
          </div>
        )}

        {h.notEmpty(getShorlistedProperties) && projectSettings && (
          <div>
            <div className="container py-3">
              <h3
                className="mb-3 project-header-title border-b"
                style={{ color: customStyle.propertyDetails.titleColor }}
              >
                {h.translate.localize('pricingAndUnit', translate)}
              </h3>
              <div className="d-flex flex-wrap" ref={propertyRef}>
                {preProcessProperties(getShorlistedProperties).map(
                  (shortlistedProperty, i) => {
                    return (
                      <ShortlistedPropertyCard
                        customStyle={customStyle}
                        translate={translate}
                        key={i}
                        project={shortlistedProject.project}
                        shortlistedProperty={{
                          ...shortlistedProperty,
                          ...getShorlistedPropertyId(
                            shortlistedProperty.project_property_id,
                          ),
                        }}
                        contact={contact}
                        setLoading={setLoading}
                        shouldTrackActivity={shouldTrackActivity}
                        reloadShortlistedProjects={reloadShortlistedProjects}
                        projectSettings={projectSettings}
                        shortlistedProjectId={
                          shortlistedProject.shortlisted_project_id
                        }
                      />
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ShortlistedProjectCard);
