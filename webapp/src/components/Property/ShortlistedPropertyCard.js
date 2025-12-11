import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import CommonStarRating from '../Common/CommonStarRating';
import { api } from '../../api';

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

import constant from '../../constants/constant.json';
import CommonCarousel from '../Common/CommonCarousel';

// Components
import ShortlistedPropertyComment from './ShortlistedPropertyComment';
import ShortlistedPropertyCommentTextArea from './ShortlistedPropertyCommentTextArea';
import ShortlistedPropertyOlderComments from './ShortlistedPropertyOlderComments';
import ShortlistedPropertyBookmark from './ShortlistedPropertyBookmark';
import ReserveProperty from './ReserveProperty';

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

        const hiddenMediaIds =
          filterMediaSettings.hidden_media &&
          (filterMediaSettings.hidden_media !== null ||
            filterMediaSettings.hidden_media !== '')
            ? filterMediaSettings.hidden_media.split(',')
            : [];

        const sortedMedia = handleInitialSort(filterMediaSettings, unit.medias);

        setFilteredUnits(
          sortedMedia.filter(
            (f) =>
              ((filterMediaSettings?.media_setting_image &&
                f.media_tag.includes('image')) ||
                (filterMediaSettings?.media_setting_video &&
                  f.media_tag.includes('video')) ||
                (filterMediaSettings?.media_setting_floor_plan &&
                  f.media_tag.includes('floor_plan')) ||
                (filterMediaSettings?.media_setting_brocure &&
                  f.media_tag.includes('brochure'))) &&
              !hiddenMediaIds.includes(f.media_property_media_fk),
          ),
        );
        setFilterMedia(filterMediaSettings);
      }
    }
  }, [projectSettings]);

  useEffect(() => {
    if (property_rating) {
      setRating(property_rating);
    }
  }, [property_rating]);

  useEffect(() => {
    if (unit && unit.medias && unit.medias.length > 0) {
      setFilteredUnits(unit.medias);
    }
  }, [unit]);

  useEffect(() => {
    (async () => {
      await reloadComments(shortlisted_property_id);
    })();
  }, [shortlisted_property_id]);

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
      medias.forEach((media) => {
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
      reorderMediasArray = medias;
    }
    return reorderMediasArray;
  };

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

  return (
    <div style={{ backgroundColor: '#fff', paddingBottom: '5em' }}>
      {h.notEmpty(unit) && (
        <>
          <div className="container mb-5 py-5" ref={refValue}>
            <h3
              className="mb-3 project-header-title border-b"
              style={{ color: customStyle.propertyDetails.titleColor }}
            >
              {h.translate.localize('pricingAndUnit', translate)}
            </h3>
            <div className="col-12">
              <div className="row align-items-start mt-5 project-property-items">
                <div className="d-flex align-items-center">
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
                <div className="d-flex align-items-center">
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
                <div className="d-flex align-items-center">
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
              <div className="row align-items-start mt-5 project-property-items">
                {unit.unit_number && (
                  <div className="d-flex align-items-start">
                    <span className="mr-1">
                      <IconTypeVector style={{ width: 32 }} />
                    </span>
                    <p
                      className="mb-0 number-stats pricing-unit-detail-item"
                      style={{ color: customStyle.propertyDetails.textColor }}
                    >
                      {h.translate.localize('unit', translate)} &#8211;{' '}
                      <span>{unit.unit_number}</span>
                    </p>
                  </div>
                )}
                {unit.unit_type && (
                  <div className="d-flex align-items-start">
                    <span className="mr-1">
                      <IconUnitVector style={{ width: 32 }} />
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
                {h.notEmpty(unit.direction_facing) && (
                  <div className="d-flex align-items-start">
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
                {!floorNotAllowedProjectTypes.includes(project.project_type) &&
                  !h.isEmpty(unit.floor) && (
                    <div className="d-flex align-items-start">
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
          <ShortlistedPropertyBookmark
            contact_id={contact.contact_id}
            shortlisted_property_id={shortlisted_property_id}
            is_bookmarked={is_bookmarked}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            hasMedia={filteredUnits.length > 0}
            customStyle={customStyle}
          />
          <div className="slideeeee">
            {filteredUnits.length > 0 && (
              <CommonCarousel
                translate={translate}
                customStyle={customStyle}
                thumbnailPosition="right"
                isProjectUnit={true}
                isBuyerPage
                showDescription
                shouldTrackActivity={shouldTrackActivity}
                activityTracker={async (activity, metaData) => {
                  await handleTracker(activity, metaData);
                }}
                items={filteredUnits.map((media, index) => {
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
                        key={`property-comment-${shortlisted_property_id}`}
                        projectKey={`property-comment-${shortlisted_property_id}`}
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
                      key={`property-older-comment-${shortlisted_property_id}`}
                      projectKey={`property-older-comment-${shortlisted_property_id}`}
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
