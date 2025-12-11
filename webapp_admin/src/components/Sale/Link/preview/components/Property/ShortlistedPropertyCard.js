import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { h } from '../../helpers';
import CommonStarRating from '../Common/CommonStarRating';
import { api } from '../../api';
import ShortlistedPropertyComment from './ShortlistedPropertyComment';
import ShortlistedPropertyCommentTextArea from './ShortlistedPropertyCommentTextArea';
import ShortlistedPropertyOlderComments from './ShortlistedPropertyOlderComments';
import ShortlistedPropertyBookmark from './ShortlistedPropertyBookmark';
import IconBed from '../Icons/ShortlistedPropertyCard/IconBed';
import IconBath from '../Icons/ShortlistedPropertyCard/IconBath';
import IconLock from '../Icons/ShortlistedPropertyCard/IconLock';
import IconSizeVector from '../Icons/IconSizeVector';
import IconBedVector from '../Icons/IconBedVector';
import IconBathroomVector from '../Icons/IconBathroomVector';
import IconUnitVector from '../Icons/IconUnitVector';
import IconTypeVector from '../Icons/IconTypeVector';
import IconFloorVector from '../Icons/IconFloorVector';
import IconDirectionVector from '../Icons/IconDirectionVector';
import ReserveProperty from '../../../../../Property/ReserveProperty';
import Toggle from 'react-toggle';
import constant from '../../constants/constant.json';
import CommonCarousel from '../Common/CommonCarousel';
import { ReactSortable } from 'react-sortablejs';
import ImageHoverSetting from '../Partials/ImageHoverSetting';

import { faCog, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tappable from 'react-tappable';

export default function ShortlistedPropertyCards(props) {
  const {
    is_demo = false,
    shortlistedProperty: {
      shortlisted_property_id,
      unit,
      property_rating,
      is_bookmarked,
      is_requested_for_reservation,
      bookmark_date,
      created_date,
      is_general_enquiry,
    },
    project,
    contact,
    setLoading,
    shouldTrackActivity,
    reloadShortlistedProjects,
    setPropertiesSettings,
    propertiesSettings,
    shortlistedProjectId,
    projectSettings,
    customStyle,
    translate,
    refValue,
  } = props;

  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState({});
  const [latestComment, setLatestComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState('');
  const [hideOldComments, setHideOldComments] = useState(true);
  const [filteredUnits, setFilteredUnits] = useState([]);

  const [filterMedia, setFilterMedia] = useState(null);

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [showImageMediaSettings, setShowImageMediaSettings] = useState(null);
  const [newItemMediaSetting, setNewItemsMediaSetting] = useState([]);
  const [isReorderEnabled, setReorderEnabled] = useState(false);

  const floorNotAllowedProjectTypes = [
    constant.PROJECT.TYPE.HOUSE_AND_LAND,
    constant.PROJECT.TYPE.SEMI_DETACHED,
  ];

  useEffect(() => {
    if (!filterMedia) {
      if (h.notEmpty(projectSettings)) {
        const newSettingsObj = projectSettings;
        const propertySettingsDataIndex =
          newSettingsObj.shortlisted_property_settings.findIndex(
            (x) =>
              (x.shortlisted_property_id ?? x.shortlisted_property_fk) ===
              shortlisted_property_id,
          );

        let filterMediaSettings = null;
        if (propertySettingsDataIndex !== -1) {
          filterMediaSettings =
            newSettingsObj.shortlisted_property_settings[
              propertySettingsDataIndex
            ];
        } else {
          filterMediaSettings = {
            media_setting_image: true,
            media_setting_video: true,
            media_setting_floor_plan: true,
            media_setting_brocure: true,
            hidden_media: null,
            media_order: null,
          };
        }

        handleSetImageTriggerUnits(filterMediaSettings);
        setFilterMedia(filterMediaSettings);
      }
    }
  }, [projectSettings]);

  useEffect(() => {
    if (selectedMediaIndex != null) {
      const newItemMediaSettingData = filteredUnits;
      newItemMediaSettingData[selectedMediaIndex].isHidden =
        !newItemMediaSettingData[selectedMediaIndex].isHidden;

      setNewItemsMediaSetting(newItemMediaSettingData);
      setSelectedMediaIndex(null);

      const newSettingsObj = projectSettings;
      const propertySettingsDataIndex =
        newSettingsObj.shortlisted_property_settings.findIndex(
          (x) =>
            (x.shortlisted_property_id ?? x.shortlisted_property_fk) ===
            shortlisted_property_id,
        );
      if (propertySettingsDataIndex !== -1) {
        const newPropertySettings = {
          ...newSettingsObj.shortlisted_property_settings[
            propertySettingsDataIndex
          ],
          hidden_media: filteredUnits
            .filter((f) => f.isHidden)
            .map((m) => m.media_property_media_fk)
            .join(','),
        };

        setPropertiesSettings(newPropertySettings);
      }
    }
  }, [selectedMediaIndex]);

  useEffect(() => {
    if (property_rating) {
      setRating(property_rating);
    }
  }, [property_rating]);

  useEffect(() => {
    if (filteredUnits) {
      const newSettingsObj = projectSettings;
      const propertySettingsDataIndex =
        newSettingsObj?.shortlisted_property_settings.findIndex(
          (x) =>
            (x.shortlisted_property_id || x.shortlisted_property_fk) ===
            shortlisted_property_id,
        );
      if (propertySettingsDataIndex !== -1) {
        const newPropertySettings = {
          ...newSettingsObj?.shortlisted_property_settings[
            propertySettingsDataIndex
          ],
          shortlisted_project_id: shortlistedProjectId,
          shortlisted_property_id: shortlisted_property_id,
          hidden_media: filteredUnits
            .filter((f) => f.isHidden)
            .map((m) => m.media_property_media_fk)
            .join(','),
          media_order: filteredUnits
            .map((s) => s.media_property_media_fk)
            .join(','),
        };

        setPropertiesSettings(newPropertySettings);
      }
    }
  }, [filteredUnits]);

  useEffect(() => {
    (async () => {
      await reloadComments(shortlisted_property_id);
    })();
  }, [shortlisted_property_id]);

  // update upper hook for media settings
  useEffect(() => {
    const settingsObj = {
      shortlisted_project_id: shortlistedProjectId,
      shortlisted_property_id: shortlisted_property_id,
      ...filterMedia,
    };

    setPropertiesSettings(settingsObj);
  }, [
    filterMedia?.media_setting_image,
    filterMedia?.media_setting_video,
    filterMedia?.media_setting_floor_plan,
    filterMedia?.media_setting_brocure,
  ]);

  const reloadComments = async (shortlisted_property_id) => {
    const apiRes = await api.shortlistedPropertyComment.findAll(
      { shortlisted_property_id },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      const latestComment = getLatestComment(
        apiRes.data.shortlisted_property_comments,
      );
      setLatestComment(latestComment);
      setComments(
        apiRes.data.shortlisted_property_comments.filter(
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

  const handleChangeRating = async (value) => {
    setRating(value);
    await api.shortlistedProperty.updateShortlistedPropertyRating(
      { shortlisted_property_id, property_rating: value },
      false,
    );
    if (shouldTrackActivity)
      await api.contactActivity.create(
        {
          contact_fk: contact.contact_id,
          activity_type: constant.CONTACT.ACTIVITY.TYPE.PROPERTY_RATED,
          activity_meta: JSON.stringify({
            shortlisted_property_id,
            property_rating: value,
          }),
        },
        false,
      );
  };

  const handleModal = (e, attachment) => {
    if (e) e.preventDefault();
    if (showModal) {
      setShowModal(false);
      setCurrentModal('');
    } else {
      setShowModal(true);
      setCurrentModal(attachment.shortlisted_property_comment_attachment_id);
    }
  };

  const handleTracker = async (activity, metaData) => {
    let meta = { ...metaData, shortlisted_property_id };
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

  // format decimal for bed and bath
  const customFormatDecimal = (decimal, fraction = 0) => {
    return Math.floor(decimal) == decimal
      ? Math.floor(decimal).toFixed(fraction)
      : decimal;
  };

  const handleToggleMediaOption = (type, isChecked) => {
    const filterSetting = filterMedia;

    filterSetting[type] = isChecked;
    setFilterMedia(filterSetting);
    handleSetImageTriggerUnits(filterSetting);
  };

  const handleSetImageTriggerUnits = (v) => {
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
        unit.medias.forEach((mediaObj) => {
          if (mediaId === mediaObj.media_property_media_fk) {
            reorderMediasArray.push({
              ...mediaObj,
              media_display_order: lastOrderCount,
            });

            lastOrderCount++;
          }
        });
      });
      // Get medias with no reorder settings  - newly added media
      unit.medias.forEach((media) => {
        if (!mediaOrderArray.includes(media.media_property_media_fk)) {
          reorderMediasArray.push({
            ...media,
            media_display_order: lastOrderCount,
          });
          lastOrderCount++;
        }
      });
    } else {
      // Set default reorder from project
      reorderMediasArray = unit.medias;
    }

    setFilteredUnits(
      reorderMediasArray
        .map((m) => ({
          ...m,
          isHidden: hiddenMediaIds.includes(m.media_property_media_fk),
        }))
        .filter(
          (f) =>
            (v?.media_setting_image && f.media_tag.includes('image')) ||
            (v?.media_setting_video && f.media_tag.includes('video')) ||
            (v?.media_setting_floor_plan &&
              f.media_tag.includes('floor_plan')) ||
            (v?.media_setting_brocure && f.media_tag.includes('brochure')),
        ),
    );
  };

  // Check setting for available media
  const hasMedia = useCallback(
    (type) => unit.medias.filter((f) => f.media_tag.includes(type)).length > 0,
    [unit.medias],
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
    const medias = filteredUnits;
    filteredUnits.forEach((media, i) => {
      medias[i].media_display_order = i;
      newf.push(medias[i]);
    });

    return newf;
  }, [filteredUnits]);

  return (
    <div style={{ backgroundColor: '#fff', paddingBottom: '5em' }}>
      {h.notEmpty(unit) && (
        <>
          <div className="container mb-5" ref={refValue}>
            <h3
              className="mb-3 project-header-title border-b"
              style={{ color: customStyle.propertyDetails.titleColor }}
            >
              {h.translate.localize('pricingAndUnit', translate)}
            </h3>
            <div className="col-12">
              <div className="row align-items-start mt-5">
                <div className="d-flex align-items-center mr-4">
                  <span className="icon-bg bed mb-1">
                    <IconBedVector
                      style={{ width: 32 }}
                      color={customStyle.propertyDetails.iconColor}
                    />
                  </span>
                  <p className="mb-0 number-stats pricing-unit-detail-item">
                    {customFormatDecimal(unit.bed)}{' '}
                    {unit.bed > 1
                      ? h.translate.localize('bedrooms', translate)
                      : h.translate.localize('bedroom', translate)}
                  </p>
                </div>
                <div className="d-flex align-items-center mr-4">
                  <span className="icon-bg bath mb-1">
                    <IconBathroomVector
                      style={{ width: 32 }}
                      color={customStyle.propertyDetails.iconColor}
                    />
                  </span>
                  <p className="mb-0 number-stats pricing-unit-detail-item">
                    {customFormatDecimal(unit.bath)}{' '}
                    {unit.bath > 1
                      ? h.translate.localize('bathrooms', translate)
                      : h.translate.localize('bathroom', translate)}
                  </p>
                </div>
                <div className="d-flex align-items-center mr-4">
                  <span className="icon-bg size mb-1">
                    <IconSizeVector
                      style={{ width: 32 }}
                      color={customStyle.propertyDetails.iconColor}
                    />
                  </span>
                  <p className="mb-0 number-stats pricing-unit-detail-item">
                    {h.currency.format(unit.sqm, 0)}{' '}
                    {h.translate.localize(project.size_format, translate)}
                  </p>
                </div>
              </div>
            </div>

            {is_general_enquiry && (
              <div className="col-12">
                <div className="row align-items-start mt-5">
                  <div className="d-flex align-items-center mr-4">
                    <label
                      className="mb-0 mr-4 project-price-item"
                      style={{ color: customStyle.propertyDetails.price }}
                    >
                      {!h.cmpInt(unit.start_price, 0) ? (
                        <>
                          {h.currency.format(unit.start_price, 0)}{' '}
                          {unit.currency ? unit.currency.toUpperCase() : ''}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </label>
                    <span className="project-price-item-sub">
                      {!h.cmpInt(unit.start_price, 0) &&
                      !h.cmpInt(unit.sqm, 0) ? (
                        <>
                          {h.currency.format(unit.start_price / unit.sqm, 0)}{' '}
                          {unit.currency ? unit.currency.toUpperCase() : ''}/
                          {h.translate.localize(project.size_format, translate)}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="col-12">
              <div className="row align-items-start mt-5">
                {unit.unit_number && (
                  <div className="d-flex align-items-start mr-5">
                    <span className="mr-1">
                      <IconTypeVector style={{ width: 32 }} />
                    </span>
                    <p
                      className="mb-0 number-stats pricing-unit-detail-item"
                      style={{ color: customStyle.propertyDetails.textColor }}
                    >
                      {h.translate.localize('type', translate)} &#8211;{' '}
                      <span>{h.general.prettifyConstant(unit.unit_type)}</span>
                    </p>
                  </div>
                )}
                {unit.unit_type && (
                  <div className="d-flex align-items-start mr-5">
                    <span className="mr-1">
                      <IconUnitVector style={{ width: 32 }} />
                    </span>
                    <p
                      className="mb-0 number-stats pricing-unit-detail-item"
                      style={{ color: customStyle.propertyDetails.textColor }}
                    >
                      {h.translate.localize('direction', translate)} &#8211;{' '}
                      <span>
                        {h.notEmpty(unit.direction_facing)
                          ? h.general.ucFirst(unit.direction_facing)
                          : ''}
                      </span>
                    </p>
                  </div>
                )}
                {h.notEmpty(unit.direction_facing) && (
                  <div className="d-flex align-items-start mr-5">
                    <span className="mr-1">
                      <IconDirectionVector style={{ width: 32 }} />
                    </span>
                    <p
                      className="mb-0 number-stats pricing-unit-detail-item"
                      style={{ color: customStyle.propertyDetails.textColor }}
                    >
                      {h.translate.localize('direction', translate)} &#8211;{' '}
                      <span>
                        {h.notEmpty(unit.direction_facing)
                          ? h.general.ucFirst(unit.direction_facing)
                          : ''}
                      </span>
                    </p>
                  </div>
                )}
                {/* do no show floor column for semi detactched and land & house project types*/}
                {!floorNotAllowedProjectTypes.includes(
                  project.project_type,
                ) && (
                  <div className="d-flex align-items-start mr-5">
                    <span className="mr-1">
                      <IconFloorVector style={{ width: 32 }} />
                    </span>
                    <p
                      className="mb-0 number-stats pricing-unit-detail-item"
                      style={{ color: customStyle.propertyDetails.textColor }}
                    >
                      {h.translate.localize('floor ', translate)}
                      &#8211; <span>{unit.floor}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {unit &&
            unit.medias &&
            unit.medias.length > 0 &&
            filteredUnits &&
            filterMedia && (
              <div className="container visibility-toggle-media">
                <div className="visibility-toggle-media-wrapper">
                  <h3>
                    Here you can change what to show and in what order,
                    personalise away!
                  </h3>
                  <div className="d-flex">
                    {hasMedia(constant.PROPERTY.MEDIA.TAG.IMAGE) && (
                      <div
                        className="image-toggle-item d-flex mr-4"
                        style={{ gap: 2, height: '30px' }}
                      >
                        <label className="cb-container mb-0 mr-0">
                          <input
                            type={'checkbox'}
                            style={{ marginLeft: '10px' }}
                            defaultChecked={filterMedia?.media_setting_image}
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
                            if (filterMedia?.media_setting_image) {
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
                        style={{ gap: 2, height: '30px' }}
                      >
                        <label className="cb-container mb-0 mr-0 ">
                          <input
                            type={'checkbox'}
                            style={{ marginLeft: '10px' }}
                            defaultChecked={
                              filterMedia?.media_setting_floor_plan
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
                            if (filterMedia?.media_setting_image) {
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
                        style={{ gap: 2, height: '30px' }}
                      >
                        <label className="cb-container mb-0 mr-0">
                          <input
                            type={'checkbox'}
                            style={{ marginLeft: '10px' }}
                            defaultChecked={filterMedia?.media_setting_video}
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
                          className="setting-label w-110"
                          onClick={() => {
                            if (filterMedia?.media_setting_image) {
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
                        style={{ gap: 2, height: '30px' }}
                      >
                        <label className="cb-container mb-0 mr-0">
                          <input
                            type={'checkbox'}
                            style={{ marginLeft: '10px' }}
                            defaultChecked={filterMedia?.media_setting_brocure}
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
                          className="setting-label w-110"
                          onClick={() => {
                            if (filterMedia?.media_setting_image) {
                              handleSetMediaForSettings('brochure');
                            }
                          }}
                        >
                          {' '}
                          {h.translate.localize('brochure', translate)}{' '}
                        </label>
                      </div>
                    )}
                  </div>
                  {showImageMediaSettings !== null && (
                    <div className="animate-fadeIn mt-3">
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
                            onChange={() =>
                              setReorderEnabled(!isReorderEnabled)
                            }
                          />
                        </div>
                      </label>
                      {isReorderEnabled ? (
                        <ReactSortable
                          list={filteredUnits}
                          setList={setFilteredUnits}
                          style={{ gap: '1em' }}
                          animation={150}
                        >
                          {getMedias.map((media, index) => {
                            const media_tags = media.media_tag;
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
                                <img
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
                            const media_tags = media.media_tag;

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
              <ShortlistedPropertyBookmark
                contact_id={contact.contact_id}
                shortlisted_property_id={shortlisted_property_id}
                is_bookmarked={is_bookmarked}
                reloadShortlistedProjects={reloadShortlistedProjects}
                shouldTrackActivity={shouldTrackActivity}
                hasMedia={filteredUnits.filter((f) => !f.isHidden).length > 0}
                customStyle={customStyle}
              />
              <div className="slideeeee">
                {filteredUnits.filter((f) => !f.isHidden).length > 0 && (
                  <CommonCarousel
                    customStyle={customStyle}
                    translate={translate}
                    thumbnailPosition="right"
                    isProjectUnit={true}
                    isBuyerPage
                    showDescription
                    shouldTrackActivity={shouldTrackActivity}
                    activityTracker={async (activity, metaData) => {
                      await handleTracker(activity, metaData);
                    }}
                    key={shortlisted_property_id + '-carousel-property'}
                    items={filteredUnits
                      .filter((f) => !f.isHidden)
                      .map((media, index) => {
                        if (is_demo) {
                          if (index === 0)
                            return {
                              src: '/assets/images/sample/sample-floorplan.png',
                            };
                          else if (index === 1)
                            return {
                              src: '/assets/images/sample/sample-unit-1.jpg',
                            };
                          else if (index === 2)
                            return {
                              src: '/assets/images/sample/sample-unit-2.jpg',
                            };
                          else if (index === 3)
                            return {
                              src: '/assets/images/sample/sample-unit-3.jpg',
                            };
                          else if (index === 4)
                            return {
                              src: '/assets/images/sample/sample-unit-4.jpg',
                            };
                          else return { src: '', alt: '' };
                        } else {
                          /** Sample data
                       * {/
                          "media_type": "video",
                          "media_url": "https://www.youtube.com/embed/Js9BmAlazLU",
                          "media_title": "youtube video",
                          "media_description": ""
                        },
                        {
                          "media_type": "image",
                          "media_url": "https://content.yourpave.com/wp-content/uploads/2021/05/hyde-heritage-thonglor-3bed-image_1.png",
                          "media_title": "hyde-heritage-thonglor-3bed-image_1",
                          "media_description": ""
                        }
                       */
                          return {
                            src: h.general.formatUrl(media.media_url),
                            alt: media.media_title,
                            description: media.media_description,
                            media_type: media.media_type,
                            tag: media.media_tag,
                            thumbnail_src: media.media_thumbnail_src,
                            display_order: media.media_display_order,
                          };
                        }
                      })}
                    enabledTags={{
                      image: filterMedia?.media_setting_image,
                      floor_plan: filterMedia?.media_setting_floor_plan,
                      video: filterMedia?.media_setting_video,
                      brochure: filterMedia?.media_setting_brocure,
                    }}
                  />
                )}
              </div>
            </>
          )}

          <div className="container">
            <div className="row">
              <div className="col-12 col-md-6 col-lg-6">
                <div className="mb-5">
                  <div className="leave-private-message-text mb-2">
                    {h.translate.localize('howKeen', translate)}
                  </div>
                  <CommonStarRating
                    count={5}
                    value={rating}
                    onChange={handleChangeRating}
                    shouldTrackActivity={shouldTrackActivity}
                  />
                  <ReserveProperty
                    customStyle={customStyle}
                    setLoading={setLoading}
                    shortlisted_property_id={shortlisted_property_id}
                    is_requested_for_reservation={is_requested_for_reservation}
                    reloadShortlistedProjects={reloadShortlistedProjects}
                    shouldTrackActivity={shouldTrackActivity}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <div className="row mb-2">
                  <div className="col-12 d-flex justify-content-between">
                    <span
                      className="leave-private-message-text"
                      style={{ fontWeight: 'bold' }}
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
                      <ShortlistedPropertyComment
                        comment={latestComment}
                        handleModal={handleModal}
                        showModal={showModal}
                        currentModal={currentModal}
                        contact={contact}
                        project={project}
                        contact_id={contact.contact_id}
                        shortlisted_property_id={shortlisted_property_id}
                        setLoading={setLoading}
                        reloadComments={reloadComments}
                        handleTracker={handleTracker}
                        shouldTrackActivity={shouldTrackActivity}
                        customStyle={customStyle}
                      />
                    )}
                  </div>
                  {/* TextArea for new comments that are not replies */}
                  <ShortlistedPropertyCommentTextArea
                    customStyle={customStyle}
                    project={project}
                    contact_id={contact.contact_id}
                    shortlisted_property_id={shortlisted_property_id}
                    setLoading={setLoading}
                    reloadComments={reloadComments}
                    shouldTrackActivity={shouldTrackActivity}
                  />
                  {h.general.notEmpty(comments) && (
                    <ShortlistedPropertyOlderComments
                      customStyle={customStyle}
                      hideOldCommentsInit={hideOldComments}
                      comments={comments}
                      handleModal={handleModal}
                      showModal={showModal}
                      currentModal={currentModal}
                      contact={contact}
                      project={project}
                      contact_id={contact.contact_id}
                      shortlisted_property_id={shortlisted_property_id}
                      setLoading={setLoading}
                      reloadComments={reloadComments}
                      handleTracker={handleTracker}
                      shouldTrackActivity={shouldTrackActivity}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
