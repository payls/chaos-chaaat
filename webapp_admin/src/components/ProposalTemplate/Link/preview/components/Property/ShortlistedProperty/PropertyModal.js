import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { h } from '../../../helpers';
import { api } from '../../../api';

import constant from '../../../constants/constant.json';

// ICONS

import IconBed from '../../Icons/ShortlistedPropertyCard/IconBed';
import IconBath from '../../Icons/ShortlistedPropertyCard/IconBath';
import IconLock from '../../Icons/ShortlistedPropertyCard/IconLock';
import IconSizeVector from '../../Icons/IconSizeVector';
import IconBedVector from '../../Icons/IconBedVector';
import IconBathroomVector from '../../Icons/IconBathroomVector';
import IconUnitVector from '../../Icons/IconUnitVector';
import IconTypeVector from '../../Icons/IconTypeVector';
import IconFloorVector from '../../Icons/IconFloorVector';
import IconDirectionVector from '../../Icons/IconDirectionVector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCog, faCheck } from '@fortawesome/free-solid-svg-icons';

//COMPONETNS
import CommonCarousel from '../../../../../../Sale/Link/preview/components/Common/CommonCarousel';
import CommonImage from '../../Common/CommonImage';
import CommonStarRating from '../../Common/CommonStarRating';
import ShortlistedPropertyComment from '../ShortlistedPropertyComment';
import ShortlistedPropertyCommentTextArea from '../ShortlistedPropertyCommentTextArea';
import ShortlistedPropertyOlderComments from '../ShortlistedPropertyOlderComments';
import ShortlistedPropertyBookmark from '../ShortlistedPropertyBookmark';
import ReserveProperty from '../../../../../../Property/ReserveProperty';
import { ReactSortable } from 'react-sortablejs';
import ImageHoverSetting from '../../Partials/ImageHoverSetting';
import Toggle from 'react-toggle';

import Tappable from 'react-tappable';
const floorNotAllowedProjectTypes = [
  constant.PROJECT.TYPE.HOUSE_AND_LAND,
  constant.PROJECT.TYPE.SEMI_DETACHED,
];

export default function PropertyModal(props) {
  const {
    show,
    shortlistedProperty: {
      shortlisted_property_proposal_template_id,
      unit,
      property_rating,
      is_bookmarked,
      is_requested_for_reservation,
      bookmark_date,
      created_date,
      is_general_enquiry,
    },
    project,
    setLoading,
    shouldTrackActivity,
    reloadShortlistedProjects,
    projectSettings,
    customStyle,
    translate,
    shortlistedProjectId,
    refValue,
    setShowInfo,
    setPropertiesSettings,
  } = props;
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState({});
  const [latestComment, setLatestComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState('');
  const [hideOldComments, setHideOldComments] = useState(true);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [modalTabValue, setModalTabValue] = useState('information');

  const [filterMedia, setFilterMedia] = useState(null);

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [showImageMediaSettings, setShowImageMediaSettings] = useState(null);
  const [newItemMediaSetting, setNewItemsMediaSetting] = useState([]);
  const [isReorderEnabled, setReorderEnabled] = useState(false);

  useEffect(() => {
    if (!filterMedia) {
      if (h.notEmpty(projectSettings)) {
        const newSettingsObj = projectSettings;
        const propertySettingsDataIndex =
          newSettingsObj.shortlisted_property_setting_proposal_templates.findIndex(
            (x) =>
              x.shortlisted_property_proposal_template_fk ===
              shortlisted_property_proposal_template_id,
          );
        let filterMediaSettings = null;
        if (propertySettingsDataIndex !== -1) {
          filterMediaSettings =
            newSettingsObj.shortlisted_property_setting_proposal_templates[
              propertySettingsDataIndex
            ];
        } else {
          filterMediaSettings = {
            media_setting_image: true,
            media_setting_video: true,
            media_setting_floor_plan: true,
            media_setting_brocure: true,
            media_setting_factsheet: true,
            media_setting_render_3d: true,
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
        newSettingsObj.shortlisted_property_setting_proposal_templates.findIndex(
          (x) =>
            x.shortlisted_property_proposal_template_fk ===
            shortlisted_property_proposal_template_id,
        );
      if (propertySettingsDataIndex !== -1) {
        const newPropertySettings = {
          ...newSettingsObj.shortlisted_property_setting_proposal_templates[
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

  // update upper hook for media settings
  useEffect(() => {
    const settingsObj = {
      shortlisted_project_setting_proposal_template_fk: shortlistedProjectId,
      shortlisted_property_proposal_template_fk:
        shortlisted_property_proposal_template_id,
      ...filterMedia,
    };

    setPropertiesSettings(settingsObj);
  }, [
    filterMedia?.media_setting_image,
    filterMedia?.media_setting_video,
    filterMedia?.media_setting_floor_plan,
    filterMedia?.media_setting_brocure,
    filterMedia?.media_setting_factsheet,
    filterMedia?.media_setting_render_3d,
  ]);

  useEffect(() => {
    (async () => {
      await reloadComments(shortlisted_property_proposal_template_id);
    })();
  }, [shortlisted_property_proposal_template_id]);

  const reloadComments = async (shortlisted_property_proposal_template_id) => {
    const apiRes = await api.shortlistedPropertyComment.findAll(
      { shortlisted_property_proposal_template_id },
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
      { shortlisted_property_proposal_template_id, property_rating: value },
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
    let meta = { ...metaData, shortlisted_property_proposal_template_id };
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
            (v?.media_setting_brocure && f.media_tag.includes('brochure')) ||
            (v?.media_setting_render_3d && f.media_tag.includes('render_3d')),
        ),
    );
  };
  return (
    <div className="property-modal ">
      {show && (
        <div className="common-modal-attachment-background">
          <div
            className="common-modal-attachment-container"
            style={{
              position: 'relative',
              ...(filteredUnits.length === 0 ? { minWidth: 'auto' } : {}),
            }}
          >
            <div
              className="common-modal-attachment-body"
              style={{
                ...(customStyle ? { background: customStyle?.background } : {}),
              }}
            >
              <span
                onClick={() => setShowInfo(false)}
                style={{
                  cursor: 'pointer',
                  fontSize: '1em',
                  float: 'right',
                  position: 'absolute',
                  right: '15px',
                  top: '33px',
                  width: '14px',
                  float: 'right',
                  zIndex: 3,
                }}
              >
                <FontAwesomeIcon icon={faTimes} color="#000" size="2x" />
              </span>
              <>
                <div className="navigation-wrapper d-flex justify-content-center my-4 py-4">
                  <div
                    className="navigation-items pos-rlt"
                    style={{
                      background: customStyle?.table?.navigationWrapper,
                    }}
                  >
                    <span
                      className={
                        'movingBg ' +
                        (modalTabValue === 'information'
                          ? 'leftside'
                          : 'rightside')
                      }
                      style={{ background: customStyle?.table?.movingBg }}
                    ></span>
                    <div>
                      <span
                        className={
                          'navigation-item ' +
                          (modalTabValue === 'information' ? 'selected' : '')
                        }
                        style={{ ...customStyle?.table?.nav }}
                        onClick={() => {
                          setModalTabValue('information');
                        }}
                      >
                        {h.translate.localize('information', translate)}
                      </span>
                      <span
                        className={
                          'navigation-item ' +
                          (modalTabValue === 'comments' ? 'selected' : '')
                        }
                        style={{ ...customStyle?.table?.nav }}
                        onClick={() => {
                          setModalTabValue('comments');
                        }}
                      >
                        {h.translate.localize('comments', translate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="container"></div>
              </>
              <div
                style={{
                  background: customStyle?.background,
                  paddingBottom: '1px',
                  borderRadius: '8px',
                }}
              >
                {modalTabValue === 'information' && (
                  <div className=" animate-fadeIn">
                    {unit &&
                      unit.medias &&
                      unit.medias.length > 0 &&
                      filteredUnits &&
                      filterMedia && (
                        <div className="container visibility-toggle-media">
                          <div className="visibility-toggle-media-wrapper">
                            <h3 style={{ ...customStyle?.smallLabel }}>
                              Here you can change what to show and in what
                              order, personalise away!
                            </h3>
                            <div className="d-flex">
                              {hasMedia(constant.PROPERTY.MEDIA.TAG.IMAGE) && (
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
                                        filterMedia?.media_setting_image
                                      }
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
                                    {h.translate.localize(
                                      'image',
                                      translate,
                                    )}{' '}
                                  </label>
                                </div>
                              )}
                              {hasMedia(
                                constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN,
                              ) && (
                                <div
                                  className="image-toggle-item d-flex mr-4"
                                  style={{
                                    gap: 2,
                                    height: '30px',
                                    ...customStyle?.smallLabel,
                                  }}
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
                                            constant.PROPERTY.MEDIA.TAG
                                              .FLOOR_PLAN,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                  <label
                                    className="setting-label w-110"
                                    onClick={() => {
                                      if (
                                        filterMedia?.media_setting_floor_plan
                                      ) {
                                        handleSetMediaForSettings('floor_plan');
                                      }
                                    }}
                                  >
                                    {' '}
                                    {h.translate.localize(
                                      'floorPlan',
                                      translate,
                                    )}{' '}
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
                                      defaultChecked={
                                        filterMedia?.media_setting_video
                                      }
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
                                      if (filterMedia?.media_setting_video) {
                                        handleSetMediaForSettings('video');
                                      }
                                    }}
                                  >
                                    {' '}
                                    {h.translate.localize(
                                      'video',
                                      translate,
                                    )}{' '}
                                  </label>
                                </div>
                              )}
                              {hasMedia(
                                constant.PROPERTY.MEDIA.TAG.BROCHURE,
                              ) && (
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
                                        filterMedia?.media_setting_brocure
                                      }
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
                                      if (filterMedia?.media_setting_brocure) {
                                        handleSetMediaForSettings('brochure');
                                      }
                                    }}
                                  >
                                    {' '}
                                    {h.translate.localize(
                                      'brochure',
                                      translate,
                                    )}{' '}
                                  </label>
                                </div>
                              )}
                              {hasMedia(
                                constant.PROPERTY.MEDIA.TAG.FACTSHEET,
                              ) && (
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
                                        filterMedia?.media_setting_factsheet
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
                                    className="setting-label w-110"
                                    onClick={() => {
                                      if (
                                        filterMedia?.media_setting_factsheet
                                      ) {
                                        handleSetMediaForSettings('factsheet');
                                      }
                                    }}
                                  >
                                    {' '}
                                    {h.translate.localize(
                                      'factsheet',
                                      translate,
                                    )}{' '}
                                  </label>
                                </div>
                              )}
                              {hasMedia(
                                constant.PROPERTY.MEDIA.TAG.RENDER_3D,
                              ) && (
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
                                        filterMedia?.media_setting_render_3d
                                      }
                                      onChange={(e) =>
                                        handleToggleMediaOption(
                                          'media_setting_render_3d',
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                  <label
                                    className="setting-label w-110"
                                    onClick={() => {
                                      if (
                                        filterMedia?.media_setting_render_3d
                                      ) {
                                        handleSetMediaForSettings('render_3d');
                                      }
                                    }}
                                  >
                                    3D
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
                                      let imageSrc =
                                        h.image.getMediaThumbnail(media);

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
                                      const media_tags = media.media_tag;

                                      let imageSrc =
                                        h.image.getMediaThumbnail(media);

                                      return (
                                        <ImageHoverSetting
                                          media={media}
                                          media_tags={media_tags}
                                          showImageMediaSettings={
                                            showImageMediaSettings
                                          }
                                          handleHideImages={() =>
                                            handleHideImages(index)
                                          }
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
                                    onClick={() =>
                                      setShowImageMediaSettings(null)
                                    }
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    {h.notEmpty(unit) && (
                      <>
                        <div className="slideeeee">
                          {filteredUnits.filter((f) => !f.isHidden).length >
                            0 && (
                            <CommonCarousel
                              swiperThumbnails={false}
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
                              key={
                                shortlisted_property_proposal_template_id +
                                '-carousel-property'
                              }
                              items={filteredUnits
                                .filter((f) => !f.isHidden)
                                .map((media, index) => {
                                  return {
                                    src: h.general.formatUrl(media.media_url),
                                    alt: media.media_title,
                                    description: media.media_description,
                                    media_type: media.media_type,
                                    tag: media.media_tag,
                                    thumbnail_src: media.media_thumbnail_src,
                                    display_order: media.media_display_order,
                                  };
                                })}
                              enabledTags={{
                                image: filterMedia?.media_setting_image,
                                floor_plan:
                                  filterMedia?.media_setting_floor_plan,
                                video: filterMedia?.media_setting_video,
                                brochure: filterMedia?.media_setting_brocure,
                                factsheet: filterMedia?.media_setting_factsheet,
                                render_3d: filterMedia?.media_setting_render_3d,
                              }}
                            />
                          )}
                        </div>

                        <div className="container mb-1 py-2">
                          {/* <h3
                            className="mb-3 project-header-title border-b"
                            style={{
                              color: customStyle.propertyDetails.titleColor,
                            }}
                          >
                            {h.translate.localize('pricingAndUnit', translate)}
                          </h3> */}
                          <div className="col-12">
                            <div
                              className="row align-items-start mt-1 project-property-items bbs  align-items-center justify-content-center"
                              style={{ ...customStyle?.smallLabel }}
                            >
                              {is_general_enquiry && (
                                <div className="d-flex flex-column align-items-center">
                                  <p className="mb-0 number-stats pricing-unit-detail-item">
                                    {!h.cmpInt(unit.start_price, 0) ? (
                                      <>
                                        {h.currency.format(unit.start_price, 0)}{' '}
                                        {unit.currency
                                          ? unit.currency.toUpperCase()
                                          : ''}
                                      </>
                                    ) : (
                                      'N/A'
                                    )}
                                  </p>
                                  <label>Price</label>
                                </div>
                              )}
                              <div className="d-flex flex-column   align-items-center">
                                <p className="mb-0 number-stats pricing-unit-detail-item">
                                  {h.general.customFormatDecimal(unit.bed)}{' '}
                                </p>
                                <label>
                                  {unit.bed > 1
                                    ? h.translate.localize('beds', translate)
                                    : h.translate.localize('bed', translate)}
                                </label>
                              </div>
                              <div className="d-flex flex-column align-items-center">
                                <p className="mb-0 number-stats pricing-unit-detail-item">
                                  {h.general.customFormatDecimal(unit.bath)}{' '}
                                </p>
                                <label>
                                  {' '}
                                  {unit.bath > 1
                                    ? h.translate.localize('baths', translate)
                                    : h.translate.localize('bath', translate)}
                                </label>
                              </div>
                              <div className="d-flex flex-column align-items-center">
                                <p className="mb-0 number-stats pricing-unit-detail-item">
                                  {h.currency.format(unit.sqm, 0)}{' '}
                                </p>
                                <label>
                                  {' '}
                                  {h.translate.localize(
                                    project.size_format,
                                    translate,
                                  )}
                                </label>
                              </div>
                              {is_general_enquiry && (
                                <div className="d-flex flex-column align-items-center">
                                  <p className="mb-0 number-stats pricing-unit-detail-item">
                                    {!h.cmpInt(unit.start_price, 0) &&
                                    !h.cmpInt(unit.sqm, 0) ? (
                                      <>
                                        {h.currency.format(
                                          unit.start_price / unit.sqm,
                                          0,
                                        )}
                                      </>
                                    ) : (
                                      'N/A'
                                    )}
                                  </p>
                                  <label>
                                    {unit.currency
                                      ? unit.currency.toUpperCase()
                                      : ''}
                                    /
                                    {h.translate.localize(
                                      project.size_format,
                                      translate,
                                    )}
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="row align-items-start mt-3 flex-column project-property-items">
                              <div
                                className="d-flex align-items-start "
                                style={{ ...customStyle?.smallLabel }}
                              >
                                {!floorNotAllowedProjectTypes.includes(
                                  project.project_type,
                                ) &&
                                  !h.isEmpty(unit.floor) && (
                                    <>
                                      {h.translate.localize(
                                        'floor ',
                                        translate,
                                      )}{' '}
                                      {unit.floor}
                                    </>
                                  )}
                                {unit.unit_number && (
                                  <>
                                    {unit.floor ? ', ' : ''}
                                    {h.translate.localize(
                                      'unit',
                                      translate,
                                    )}{' '}
                                    {unit.unit_number}
                                  </>
                                )}
                                {unit.unit_type && (
                                  <>
                                    {unit.unit_number ? ', ' : ''}
                                    {h.general.prettifyConstant(
                                      unit.unit_type,
                                    )}{' '}
                                    {h.translate.localize('type', translate)}
                                  </>
                                )}
                              </div>

                              {h.notEmpty(unit.direction_facing) && (
                                <div
                                  className="d-flex align-items-start"
                                  style={{ ...customStyle?.smallLabel }}
                                >
                                  {h.notEmpty(unit.direction_facing)
                                    ? h.general.ucFirst(unit.direction_facing)
                                    : ''}{' '}
                                  {h.translate.localize('direction', translate)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="container">
                          <div className="row">
                            <div className="col-12 col-md-6 col-lg-6">
                              <div className="mb-1">
                                <div
                                  className="leave-private-message-text mb-2"
                                  style={{ ...customStyle?.smallLabel }}
                                >
                                  {h.translate.localize('howKeen', translate)}
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
                              <div
                                className="leave-private-message-text mb-2 hid-sm"
                                style={{ ...customStyle?.smallLabel }}
                              >
                                &nbsp;
                              </div>
                              <ReserveProperty
                                customStyle={customStyle}
                                translate={translate}
                                setLoading={setLoading}
                                shortlisted_property_proposal_template_id={
                                  shortlisted_property_proposal_template_id
                                }
                                is_requested_for_reservation={
                                  is_requested_for_reservation
                                }
                                reloadShortlistedProjects={
                                  reloadShortlistedProjects
                                }
                                shouldTrackActivity={shouldTrackActivity}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="container"></div>
                      </>
                    )}
                  </div>
                )}

                {modalTabValue === 'comments' && (
                  <div className=" animate-fadeIn">
                    <div className="container">
                      <div className="row">
                        <div className="col-12 col-md-12 col-lg-12 mb-3">
                          <div className="row mb-2">
                            <div className="col-12 d-flex justify-content-between">
                              <span
                                className="leave-private-message-text"
                                style={{
                                  fontWeight: 'bold',
                                  ...customStyle?.smallLabel,
                                }}
                              >
                                {h.translate.localize(
                                  'leaveAMessage',
                                  translate,
                                )}
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
                                    ? h.translate.localize(
                                        'hideOlderMessage',
                                        translate,
                                      )
                                    : h.translate.localize(
                                        'seeOlderMessage',
                                        translate,
                                      )}
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
                                  project={project}
                                  shortlisted_property_proposal_template_id={
                                    shortlisted_property_proposal_template_id
                                  }
                                  setLoading={setLoading}
                                  reloadComments={reloadComments}
                                  handleTracker={handleTracker}
                                  shouldTrackActivity={shouldTrackActivity}
                                  key={
                                    `property-comment-` +
                                    shortlisted_property_proposal_template_id
                                  }
                                  customStyle={customStyle}
                                  translate={translate}
                                />
                              )}
                            </div>
                            {/* TextArea for new comments that are not replies */}
                            <ShortlistedPropertyCommentTextArea
                              customStyle={customStyle}
                              project={project}
                              shortlisted_property_proposal_template_id={
                                shortlisted_property_proposal_template_id
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
                                {!hideOldComments
                                  ? h.translate.localize(
                                      'hideOlderMessage',
                                      translate,
                                    )
                                  : h.translate.localize(
                                      'seeOlderMessage',
                                      translate,
                                    )}
                              </span>
                            )}
                            {h.general.notEmpty(comments) && (
                              <ShortlistedPropertyOlderComments
                                customStyle={customStyle}
                                hideOldCommentsInit={hideOldComments}
                                comments={comments}
                                handleModal={handleModal}
                                showModal={showModal}
                                currentModal={currentModal}
                                project={project}
                                shortlisted_property_proposal_template_id={
                                  shortlisted_property_proposal_template_id
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
