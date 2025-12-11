import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
import ToolbarSet from './ToolbarSet';
import constant from '../../constants/constant.json';
import { ReactSortable } from 'react-sortablejs';
import Tappable from 'react-tappable';
import ImageHoverSetting from '../Partials/ImageHoverSetting';
import Toggle from 'react-toggle';

import {
  faBookmark,
  faCertificate,
  faCheck,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
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

import Flag from 'react-world-flags';

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

export default function ShortlistedProjectCard(props) {
  const {
    is_demo = false,
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
  } = props;
  const imageRef = useRef();

  const [projectSettings, setProjectSettings] = useState(null);
  const [filteredMediaUnits, setFilteredMediaUnits] = useState([]);
  const [propertiesSettings, setPropertiesSettings] = useState([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [showImageMediaSettings, setShowImageMediaSettings] = useState(null);
  const [newItemMediaSetting, setNewItemsMediaSetting] = useState([]);
  const [touchIndex, setTouchIndex] = useState(null);
  const [hideOldComments, setHideOldComments] = useState(true);
  const [latestComment, setLatestComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState('');
  const [comments, setComments] = useState({});
  const [rating, setRating] = useState(0);
  const [isReorderEnabled, setReorderEnabled] = useState(false);
  const [carouselUpdated, setCarouselUpdated] = useState(false);

  // Set Initial value for info settings
  useEffect(() => {
    const projSettings = settingsData.filter(
      (f) =>
        f?.shortlisted_project_fk ===
        shortlistedProject?.shortlisted_project_id,
    );

    if (!projectSettings) {
      if (projSettings.length === 0) {
        (async () => {
          let projectSettingsData = null;
          const projectSettingsApi =
            await api.shortlistedProject.getShortlistedProjectSettings(
              {
                shortlisted_project_id:
                  shortlistedProject.shortlisted_project_id,
              },
              false,
            );

          if (h.cmpStr(projectSettingsApi.status, 'ok')) {
            if (!h.isEmpty(projectSettingsApi.data.shortListedProjectSetting)) {
              projectSettingsData =
                projectSettingsApi.data.shortListedProjectSetting;
            } else {
              projectSettingsData = {
                shortlisted_project_id:
                  shortlistedProject.shortlisted_project_id,
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
                hidden_media: null,
                media_order: null,
                shortlisted_property_settings: [],
              };
            }

            // setProjectSettings(projectSettingsData);
            handleInitToggleMediaOptions(projectSettingsData);

            const newSettingsData = settingsData;
            newSettingsData.push(projectSettingsData);

            setSettingsData(newSettingsData);
          }
        })();
      } else {
        handleInitToggleMediaOptions(projSettings.pop());
      }
    }
  }, [projectSettings]);

  useEffect(() => {
    if (filteredMediaUnits) {
      const projectSettingsDataIndex = settingsData.findIndex(
        (x) =>
          (x.shortlisted_project_id ?? x.shortlisted_project_fk) ===
          shortlistedProject.shortlisted_project_id,
      );

      if (projectSettingsDataIndex !== -1) {
        const newProjectSettingsObj = settingsData;
        const newSettings = {
          ...newProjectSettingsObj[projectSettingsDataIndex],
          hidden_media: filteredMediaUnits
            .filter((f) => f.isHidden)
            .map((s) => s.project_media_id)
            .join(','),
          media_order: filteredMediaUnits
            .map((s) => s.project_media_id)
            .join(','),
        };

        newProjectSettingsObj[projectSettingsDataIndex] = newSettings;

        setSettingsData(newProjectSettingsObj);
      }
    }
  }, [filteredMediaUnits]);

  useEffect(() => {
    if (selectedMediaIndex != null) {
      const newItemMediaSettingData = filteredMediaUnits;
      newItemMediaSettingData[selectedMediaIndex].isHidden =
        !newItemMediaSettingData[selectedMediaIndex].isHidden;

      setNewItemsMediaSetting(newItemMediaSettingData);
      setSelectedMediaIndex(null);

      const projectSettingsDataIndex = settingsData.findIndex(
        (x) =>
          (x.shortlisted_project_id ?? x.shortlisted_project_fk) ===
          shortlistedProject.shortlisted_project_id,
      );

      if (projectSettingsDataIndex !== -1) {
        const newProjectSettingsObj = settingsData;

        const newSettings = {
          ...newProjectSettingsObj[projectSettingsDataIndex],
          hidden_media: filteredMediaUnits
            .filter((f) => f.isHidden)
            .map((s) => s.project_media_id)
            .join(','),
        };

        newProjectSettingsObj[projectSettingsDataIndex] = newSettings;

        setSettingsData(newProjectSettingsObj);
      }
    }
  }, [selectedMediaIndex]);

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

  const handleInitToggleMediaOptions = (v) => {
    const hiddenMediaIds =
      v?.hidden_media && (v?.hidden_media !== null || v?.hidden_media !== '')
        ? v?.hidden_media.split(',')
        : [];
    let reorderMediasArray = [];

    // Reorder medias if has reorder setting
    if (v.media_order !== null && v.media_order !== '') {
      let lastOrderCount = 1;
      const mediaOrderArray = v.media_order.split(',');

      // Get medias with reorder setting
      mediaOrderArray.forEach((mediaId) => {
        shortlistedProject.project_media.forEach((mediaObj) => {
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
      shortlistedProject.project_media.forEach((media) => {
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
      reorderMediasArray = shortlistedProject.project_media.sort(
        (a, b) => a.display_order - b.display_order,
      );
    }

    // Check image triggers
    setFilteredMediaUnits(
      reorderMediasArray
        // Initialized images visibility
        .map((m) => {
          return {
            ...m,
            isHidden: hiddenMediaIds.includes(m.project_media_id),
          };
        })
        // return media type that is not hidden
        .filter((f) => {
          const media_tags = f.project_media_tags.map((m) => m.tag);

          return (
            (v.media_setting_image && media_tags.includes('image')) ||
            (v.media_setting_video && media_tags.includes('video')) ||
            (v.media_setting_floor_plan && media_tags.includes('floor_plan')) ||
            (v.media_setting_brocure && media_tags.includes('brochure')) ||
            (v.media_setting_factsheet && media_tags.includes('factsheet')) ||
            (v?.media_setting_render_3d && media_tags.includes('render_3d'))
          );
        }),
    );

    setProjectSettings(v);

    const projectSettingsDataIndex = settingsData.findIndex(
      (x) =>
        x?.shortlisted_project_fk ===
        shortlistedProject?.shortlisted_project_id,
    );

    if (projectSettingsDataIndex !== -1) {
      const newProjectSettingsObj = settingsData;

      const newSettings = {
        ...newProjectSettingsObj[projectSettingsDataIndex],
        ...v,
      };
      newProjectSettingsObj[projectSettingsDataIndex] = newSettings;

      setSettingsData(newProjectSettingsObj);
    }
  };
  const handleToggleMediaOption = (type, value) => {
    const filterSetting = projectSettings;

    filterSetting[type] = value;
    handleInitToggleMediaOptions(filterSetting);
  };

  const handlePropertySettingChange = (propertySetting) => {
    if (h.general.notEmpty(propertySetting) && projectSettings) {
      const projectSettingsDataIndex = settingsData.findIndex(
        (x) =>
          (x.shortlisted_project_id || x.shortlisted_project_fk) ===
          propertySetting.shortlisted_project_id,
      );
      const newSettingsObj = settingsData;

      if (projectSettingsDataIndex !== -1) {
        const propertySettingsDataIndex = newSettingsObj[
          projectSettingsDataIndex
        ].shortlisted_property_settings.findIndex(
          (x) =>
            (x.shortlisted_property_id || x.shortlisted_property_fk) ===
            (propertySetting.shortlisted_property_id ||
              propertySetting.shortlisted_property_fk),
        );
        if (propertySettingsDataIndex !== -1) {
          newSettingsObj[
            projectSettingsDataIndex
          ].shortlisted_property_settings[propertySettingsDataIndex] =
            propertySetting;
        } else {
          newSettingsObj[
            projectSettingsDataIndex
          ].shortlisted_property_settings.push(propertySetting);
        }
      }

      setSettingsData(newSettingsObj);
    }
  };

  // Check setting for available media
  const hasMedia = useCallback(
    (type) => {
      return (
        shortlistedProject.project_media.filter((f) => {
          const media_tags = f.project_media_tags.map((m) => m.tag);
          return media_tags.includes(type);
        }).length > 0
      );
    },
    [shortlistedProject.project_media],
  );

  // hide specific project level media
  const handleHideImages = (index) => {
    setSelectedMediaIndex(index);
  };

  // Set images for settings
  const handleSetMediaForSettings = (type) => {
    setShowImageMediaSettings(type);
  };

  const getMedias = useMemo(() => {
    const newf = [];
    const medias = filteredMediaUnits;
    if (carouselUpdated) {
      filteredMediaUnits.forEach((media, i) => {
        medias[i].display_order = i;
        newf.push(medias[i]);
      });

      return newf;
    }
    return medias;
  }, [filteredMediaUnits, carouselUpdated]);

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

  return (
    <div
      style={{ backgroundColor: customStyle?.background, paddingBottom: '5em' }}
    >
      <div className="container">
        <div className="pt-4 mb-5">
          <div>
            <div className="d-flex">
              <div>
                <h1
                  ref={projectRef}
                  className="display-4 project-title"
                  style={{
                    fontSize: '44px',
                    fontWeight: '500',
                    fontFamily: 'PoppinsBold',
                    ...customStyle?.project?.title,
                  }}
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
                    {!h.date.isDateEmpty(
                      shortlistedProject.project.completion_date,
                    ) && (
                      <span className="text-color5">
                        {h.translate.localize('completionDate', translate)}{' '}
                        {h.date.convertDateToQuarter(
                          shortlistedProject.project.completion_date,
                        )}
                      </span>
                    )}
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

      {shortlistedProject.project_media.length > 0 &&
        filteredMediaUnits &&
        projectSettings && (
          <div className="container visibility-toggle-media">
            <div
              className="visibility-toggle-media-wrapper"
              style={{ ...customStyle?.smallLabel }}
            >
              <h3>
                Here you can change what to show and in what order, personalise
                away!
              </h3>
              <div className="d-flex">
                {hasMedia(constant.PROPERTY.MEDIA.TAG.IMAGE) && (
                  <div
                    className="image-toggle-item d-flex mr-4 "
                    style={{
                      gap: 2,
                      height: '30px',
                      ...customStyle?.smallLabel,
                    }}
                  >
                    <label className="cb-container mb-0 mr-0">
                      <input
                        type={'checkbox'}
                        style={{ marginLeft: '10px' }}
                        defaultChecked={projectSettings?.media_setting_image}
                        onChange={(e) =>
                          handleToggleMediaOption(
                            'media_setting_' +
                              constant.PROPERTY.MEDIA.TAG.IMAGE,
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                    <label
                      className="setting-label"
                      onClick={() => {
                        if (projectSettings?.media_setting_image) {
                          handleSetMediaForSettings('image');
                        }
                      }}
                    >
                      {' '}
                      {h.translate.localize('image', translate)}{' '}
                    </label>
                  </div>
                )}
                {hasMedia(constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN) && (
                  <div
                    className="image-toggle-item d-flex mr-4"
                    style={{
                      gap: 2,
                      height: '30px',
                      ...customStyle?.smallLabel,
                    }}
                  >
                    <label className="cb-container mb-0 mr-0">
                      <input
                        type={'checkbox'}
                        style={{ marginLeft: '10px' }}
                        defaultChecked={
                          projectSettings?.media_setting_floor_plan
                        }
                        onChange={(e) =>
                          handleToggleMediaOption(
                            'media_setting_' +
                              constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN,
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                    <label
                      className="setting-label w-110"
                      onClick={() => {
                        if (projectSettings?.media_setting_image) {
                          handleSetMediaForSettings('floor_plan');
                        }
                      }}
                    >
                      {' '}
                      {h.translate.localize('floorPlan', translate)}{' '}
                    </label>
                  </div>
                )}
                {hasMedia(constant.PROPERTY.MEDIA.TAG.VIDEO) && (
                  <div
                    className="image-toggle-item d-flex mr-4"
                    style={{
                      gap: 2,
                      height: '30px',
                      ...customStyle?.smallLabel,
                    }}
                  >
                    <label className="cb-container mb-0 mr-0">
                      <input
                        type={'checkbox'}
                        style={{ marginLeft: '10px' }}
                        defaultChecked={projectSettings?.media_setting_video}
                        onChange={(e) =>
                          handleToggleMediaOption(
                            'media_setting_' +
                              constant.PROPERTY.MEDIA.TAG.VIDEO,
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                    <label
                      className="setting-label"
                      onClick={() => {
                        if (projectSettings?.media_setting_image) {
                          handleSetMediaForSettings('video');
                        }
                      }}
                    >
                      {' '}
                      {h.translate.localize('video', translate)}{' '}
                    </label>
                  </div>
                )}
                {hasMedia(constant.PROPERTY.MEDIA.TAG.BROCHURE) && (
                  <div
                    className="image-toggle-item d-flex mr-4"
                    style={{
                      gap: 2,
                      height: '30px',
                      ...customStyle?.smallLabel,
                    }}
                  >
                    <label className="cb-container mb-0 mr-0">
                      <input
                        type={'checkbox'}
                        style={{ marginLeft: '10px' }}
                        defaultChecked={projectSettings?.media_setting_brocure}
                        onChange={(e) =>
                          handleToggleMediaOption(
                            'media_setting_brocure',
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                    <label
                      className="setting-label"
                      onClick={() => {
                        if (projectSettings?.media_setting_image) {
                          handleSetMediaForSettings('brochure');
                        }
                      }}
                    >
                      {' '}
                      {h.translate.localize('brochure', translate)}{' '}
                    </label>
                  </div>
                )}
                {hasMedia(constant.PROPERTY.MEDIA.TAG.FACTSHEET) && (
                  <div
                    className="image-toggle-item d-flex mr-4"
                    style={{
                      gap: 2,
                      height: '30px',
                      ...customStyle?.smallLabel,
                    }}
                  >
                    <label className="cb-container mb-0 mr-0">
                      <input
                        type={'checkbox'}
                        style={{ marginLeft: '10px' }}
                        defaultChecked={
                          projectSettings?.media_setting_factsheet
                        }
                        onChange={(e) =>
                          handleToggleMediaOption(
                            'media_setting_factsheet',
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                    <label
                      className="setting-label"
                      style={{ width: '90px' }}
                      onClick={() => {
                        if (projectSettings?.media_setting_factsheet) {
                          handleSetMediaForSettings('factsheet');
                        }
                      }}
                    >
                      {' '}
                      {h.translate.localize('factsheet', translate)}{' '}
                    </label>
                  </div>
                )}
                {hasMedia(constant.PROPERTY.MEDIA.TAG.RENDER_3D) && (
                  <div
                    className="image-toggle-item d-flex mr-4"
                    style={{
                      gap: 2,
                      height: '30px',
                      ...customStyle?.smallLabel,
                    }}
                  >
                    <label className="cb-container mb-0 mr-0">
                      <input
                        type={'checkbox'}
                        style={{ marginLeft: '10px' }}
                        defaultChecked={
                          projectSettings?.media_setting_render_3d
                        }
                        onChange={(e) =>
                          handleToggleMediaOption(
                            'media_setting_' +
                              constant.PROPERTY.MEDIA.TAG.RENDER_3D,
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                    <label
                      className="setting-label"
                      style={{ width: '90px' }}
                      onClick={() => {
                        if (projectSettings?.media_setting_render_3d) {
                          handleSetMediaForSettings('render_3d');
                        }
                      }}
                    >
                      {' '}
                      {h.translate.localize('3D', translate)}{' '}
                    </label>
                  </div>
                )}
              </div>

              {showImageMediaSettings !== null && (
                <div className="animate-fadeIn mt-3">
                  {window.innerWidth <= 500 && (
                    <label className="price-all-toggle d-flex align-items-center">
                      <div className="ml-2">
                        <span
                          style={{ verticalAlign: 'super' }}
                          className="mr-3"
                        >
                          <FontAwesomeIcon
                            {...props}
                            icon={faCog}
                            color="#000"
                          />{' '}
                          Re-Order
                        </span>
                        <Toggle
                          defaultChecked={isReorderEnabled}
                          icons={false}
                          className="price-toggle"
                          onChange={() => setReorderEnabled(!isReorderEnabled)}
                        />
                      </div>
                    </label>
                  )}
                  {window.innerWidth <= 500 ? (
                    <>
                      {isReorderEnabled ? (
                        <ReactSortable
                          list={filteredMediaUnits}
                          setList={setFilteredMediaUnits}
                          style={{ gap: '1em' }}
                          animation={150}
                          onUpdate={() => {
                            setCarouselUpdated(true);
                          }}
                        >
                          {getMedias.map((media, index) => {
                            const media_tags = media.project_media_tags.map(
                              (m) => m.tag,
                            );
                            let imageSrc = h.image.getMediaThumbnail(media);

                            return (
                              <div
                                className={
                                  'image-toggle-item ' +
                                  (!media.isHidden ? 'active' : '')
                                }
                                style={{
                                  display: media_tags.includes(
                                    showImageMediaSettings,
                                  )
                                    ? 'inline-block'
                                    : 'none',
                                }}
                              >
                                <CommonImage
                                  src={imageSrc}
                                  width="100%"
                                  height="100%"
                                  style={{
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                  }}
                                />

                                {!media.isHidden && (
                                  <div className="image-toggle-item-check">
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      color="#fff"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </ReactSortable>
                      ) : (
                        <div style={{ gap: '1em' }} animation={150}>
                          {getMedias.map((media, index) => {
                            const media_tags = media.project_media_tags.map(
                              (m) => m.tag,
                            );
                            let imageSrc = h.image.getMediaThumbnail(media);

                            return (
                              <ImageHoverSetting
                                media={media}
                                media_tags={media_tags}
                                showImageMediaSettings={showImageMediaSettings}
                                handleHideImages={() => handleHideImages(index)}
                                index={index}
                                imageSrc={imageSrc}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <ReactSortable
                      list={filteredMediaUnits}
                      setList={setFilteredMediaUnits}
                      style={{ gap: '1em' }}
                      animation={150}
                      onUpdate={() => {
                        setCarouselUpdated(true);
                      }}
                    >
                      {getMedias.map((media, index) => {
                        const media_tags = media.project_media_tags.map(
                          (m) => m.tag,
                        );
                        let imageSrc = h.image.getMediaThumbnail(media);

                        return (
                          <div
                            className={
                              'image-toggle-item ' +
                              (!media.isHidden ? 'active' : '')
                            }
                            style={{
                              display: media_tags.includes(
                                showImageMediaSettings,
                              )
                                ? 'inline-block'
                                : 'none',
                            }}
                          >
                            <ImageHoverSetting
                              media={media}
                              media_tags={media_tags}
                              showImageMediaSettings={showImageMediaSettings}
                              handleHideImages={() => handleHideImages(index)}
                              index={index}
                              imageSrc={imageSrc}
                            />
                          </div>
                        );
                      })}
                    </ReactSortable>
                  )}

                  <div align="right">
                    <button
                      style={{
                        border: '1px solid #215046',
                        borderRadius: '12px',
                        fontSize: '14px',
                        padding: '10px',
                        width: '170px',
                        background: '#215046',
                        color: '#fff',
                      }}
                      onClick={() => setShowImageMediaSettings(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {showImageMediaSettings === null && (
        <>
          <ShortlistedProjectBookmark
            contact_id={contact.contact_id}
            shortlisted_project_id={shortlistedProject.shortlisted_project_id}
            is_bookmarked={shortlistedProject.is_bookmarked}
            shouldTrackActivity={shouldTrackActivity}
            reloadShortlistedProjects={reloadShortlistedProjects}
            hasMedia={filteredMediaUnits.filter((f) => !f.isHidden).length}
            customStyle={customStyle}
          />

          {filteredMediaUnits.filter((f) => !f.isHidden).length > 0 &&
            projectSettings && (
              <CommonCarousel
                customStyle={customStyle}
                translate={translate}
                shouldTrackActivity={shouldTrackActivity}
                projectLevel={true}
                items={filteredMediaUnits
                  .filter((f) => !f.isHidden)
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
                  image: projectSettings?.media_setting_image,
                  floor_plan: projectSettings?.media_setting_floor_plan,
                  video: projectSettings?.media_setting_video,
                  brochure: projectSettings?.media_setting_brocure,
                  factsheet: projectSettings?.media_setting_factsheet,
                  render_3d: projectSettings?.media_setting_render_3d,
                }}
              />
            )}
        </>
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
      {h.notEmpty(shortlistedProject.features) && (
        <div className="container">
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
              {shortlistedProject.features
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
            ? `py-4 container`
            : ''
        }
      >
        <div
          className="container my-3 project-info"
          style={{ background: customStyle.projectInfo.background }}
        >
          {h.notEmpty(shortlistedProject.project.key_stats) && (
            <ToolbarSet
              customStyle={customStyle}
              title={h.translate.localize('Key Stats', translate)}
              body={shortlistedProject.project.key_stats}
              hidden={projectSettings?.info_setting_key_stats}
              setSetting={(e) =>
                handleToggleMediaOption('info_setting_key_stats', e)
              }
            />
          )}
          {h.notEmpty(shortlistedProject.project.project_highlights) && (
            <ToolbarSet
              customStyle={customStyle}
              title={h.translate.localize('Project Highlights', translate)}
              body={shortlistedProject.project.project_highlights}
              hidden={projectSettings?.info_setting_project_highlights}
              setSetting={(e) =>
                handleToggleMediaOption('info_setting_project_highlights', e)
              }
            />
          )}
          {h.notEmpty(shortlistedProject.project.why_invest) && (
            <ToolbarSet
              customStyle={customStyle}
              title={h.translate.localize('Why Invest', translate)}
              body={shortlistedProject.project.why_invest}
              hidden={projectSettings?.info_setting_why_invest}
              setSetting={(e) =>
                handleToggleMediaOption('info_setting_why_invest', e)
              }
            />
          )}
          {h.notEmpty(shortlistedProject.project.shopping) && (
            <ToolbarSet
              customStyle={customStyle}
              title={h.translate.localize('shopping', translate)}
              body={shortlistedProject.project.shopping}
              hidden={projectSettings?.info_setting_shopping}
              setSetting={(e) =>
                handleToggleMediaOption('info_setting_shopping', e)
              }
            />
          )}
          {h.notEmpty(shortlistedProject.project.transport) && (
            <ToolbarSet
              customStyle={customStyle}
              title={h.translate.localize('transport', translate)}
              body={shortlistedProject.project.transport}
              hidden={projectSettings?.info_setting_transport}
              setSetting={(e) =>
                handleToggleMediaOption('info_setting_transport', e)
              }
            />
          )}
          {h.notEmpty(shortlistedProject.project.education) && (
            <ToolbarSet
              customStyle={customStyle}
              title={h.translate.localize('education', translate)}
              body={shortlistedProject.project.education}
              hidden={projectSettings?.info_setting_education}
              setSetting={(e) =>
                handleToggleMediaOption('info_setting_education', e)
              }
            />
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
      </div>

      <div className="container mb-3">
        <div className="row">
          <div className="col-12 col-md-6 col-lg-6">
            <div className="mb-5">
              <div
                className="leave-private-message-text mb-2"
                style={{ ...customStyle?.smallLabel }}
              >
                {h.translate.localize('whatDoYouThinkOfThisProject', translate)}
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
            <div className="row mb-2">
              <div className="col-12 d-flex justify-content-between">
                <span
                  className="leave-private-message-text"
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
            <div className="row">
              <div className="col-12">
                {h.general.notEmpty(latestComment) && (
                  <ShortlistedProjectComment
                    customStyle={customStyle}
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
                    translate={translate}
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
                  {hideOldComments ? 'See' : 'Hide'} Older Message
                </span>
              )}
              {h.general.notEmpty(comments) && (
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
          </div>
        </div>
      </div>

      {!h.notEmpty(shortlistedProject.shortlisted_properties) && (
        <div className="d-flex justify-content-center py-4">
          <button
            className={
              !shortlistedProject.is_enquired
                ? 'send-options-button'
                : 'send-options-button send-options-button-pending'
            }
            onClick={async () => {
              // handleSendMoreOptions();
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
                : '#fff',
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

      {h.notEmpty(shortlistedProject.shortlisted_properties) && (
        <div>
          <div className="container py-3">
            <h3
              className="mb-3 project-header-title border-b"
              style={{ color: customStyle.propertyDetails.titleColor }}
            >
              {h.translate.localize('pricingAndUnit', translate)}
            </h3>
            <div className="d-flex flex-wrap" ref={propertyRef}>
              {preProcessProperties(
                shortlistedProject.shortlisted_properties,
              ).map((shortlistedProperty, i) => {
                return (
                  <ShortlistedPropertyCard
                    project={shortlistedProject.project}
                    shortlistedProperty={shortlistedProperty}
                    contact={contact}
                    setLoading={setLoading}
                    shouldTrackActivity={shouldTrackActivity}
                    reloadShortlistedProjects={reloadShortlistedProjects}
                    setPropertiesSettings={handlePropertySettingChange}
                    propertiesSettings={propertiesSettings}
                    projectSettings={projectSettings}
                    shortlistedProjectId={
                      shortlistedProject.shortlisted_project_id
                    }
                    key={i}
                    customStyle={customStyle}
                    translate={translate}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
