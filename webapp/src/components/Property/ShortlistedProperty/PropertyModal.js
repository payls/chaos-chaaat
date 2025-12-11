import React, { useState, useEffect } from 'react';
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
import { faTimes } from '@fortawesome/free-solid-svg-icons';

//COMPONETNS
import CommonCarousel from '../../Common/CommonCarousel';
import CommonStarRating from '../../Common/CommonStarRating';
import ShortlistedPropertyComment from '../ShortlistedPropertyComment';
import ShortlistedPropertyCommentTextArea from '../ShortlistedPropertyCommentTextArea';
import ShortlistedPropertyOlderComments from '../ShortlistedPropertyOlderComments';
import ShortlistedPropertyBookmark from '../ShortlistedPropertyBookmark';
import ReserveProperty from '../ReserveProperty';

const floorNotAllowedProjectTypes = [
  constant.PROJECT.TYPE.HOUSE_AND_LAND,
  constant.PROJECT.TYPE.SEMI_DETACHED,
];

export default function PropertyModal({
  show,
  shortlistedProperty: {
    shortlisted_property_id,
    project_medias,
    unit_number,
    starting_price,
    number_of_bathroom,
    number_of_bedroom,
    property_rating,
    is_bookmarked,
    is_requested_for_reservation,
    bookmark_date,
    created_date,
    is_general_enquiry,
    sqm,
    floor,
    unit_type,
    direction_facing,
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
  setShowInfo,
}) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState({});
  const [latestComment, setLatestComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState('');
  const [hideOldComments, setHideOldComments] = useState(true);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [modalTabValue, setModalTabValue] = useState('information');

  const [filterMedia, setFilterMedia] = useState(null);

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
            media_setting_factsheet: true,
            media_setting_render_3d: true,
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

        const sortedMedia = handleInitialSort(
          filterMediaSettings,
          project_medias,
        );

        setFilteredUnits(
          sortedMedia.filter((f) => {
            const media_tags = f.project_media_tags.map((m) => m.tag);
            return (
              ((filterMediaSettings?.media_setting_image &&
                media_tags.includes('image')) ||
                (filterMediaSettings?.media_setting_video &&
                  media_tags.includes('video')) ||
                (filterMediaSettings?.media_setting_floor_plan &&
                  media_tags.includes('floor_plan')) ||
                (filterMediaSettings?.media_setting_brocure &&
                  media_tags.includes('brochure')) ||
                (filterMediaSettings?.media_setting_factsheet &&
                  media_tags.includes('factsheet')) ||
                (filterMediaSettings?.media_setting_render_3d &&
                  media_tags.includes('render_3d'))) &&
              !hiddenMediaIds.includes(f.media_property_media_fk)
            );
          }),
        );
        setFilterMedia(filterMediaSettings);
      } else {
        setFilteredUnits(project_medias);
      }
    }
  }, [projectSettings]);

  useEffect(() => {
    if (property_rating) {
      setRating(property_rating);
    }
  }, [property_rating]);

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
      reorderMediasArray = medias.sort(
        (a, b) => a.display_order - b.display_order,
      );
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
                ...(customStyle
                  ? {
                      background: customStyle?.background,
                      border: customStyle?.modal?.border,
                    }
                  : {}),
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
                  zIndex: '3',
                }}
                className="property-close-modal"
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  color={customStyle?.modal?.closeColor ?? '#000'}
                  size="2x"
                />
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
                    <>
                      <div className="slideeeee ">
                        {filteredUnits.length > 0 && (
                          <CommonCarousel
                            swiperThumbnails={false}
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
                              return {
                                src: h.general.formatUrl(media.url),
                                alt: media.title,
                                description: null,
                                media_type: media.type,
                                thumbnail_src: media.thumbnail_src,
                                tag: media.project_media_tags.reduce(
                                  (prev, curr) => {
                                    return [...prev, curr.tag];
                                  },
                                  [],
                                ),
                                is_hero_image: media.is_hero_image,
                                display_order: media.display_order,
                              };
                            })}
                            enabledTags={{
                              image: filterMedia?.media_setting_image,
                              floor_plan: filterMedia?.media_setting_floor_plan,
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
                                  {!h.cmpInt(parseInt(starting_price), 0) ? (
                                    <>
                                      {h.currency.format(starting_price, 0)}{' '}
                                      {project.currency_code
                                        ? project.currency_code.toUpperCase()
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
                                {h.general.customFormatDecimal(
                                  parseInt(number_of_bedroom),
                                )}{' '}
                              </p>
                              <label>
                                {parseInt(number_of_bedroom) > 1
                                  ? h.translate.localize('beds', translate)
                                  : h.translate.localize('bed', translate)}
                              </label>
                            </div>
                            <div className="d-flex flex-column align-items-center">
                              <p className="mb-0 number-stats pricing-unit-detail-item">
                                {h.general.customFormatDecimal(
                                  parseInt(number_of_bathroom),
                                )}{' '}
                              </p>
                              <label>
                                {' '}
                                {parseInt(number_of_bathroom) > 1
                                  ? h.translate.localize('baths', translate)
                                  : h.translate.localize('bath', translate)}
                              </label>
                            </div>
                            <div className="d-flex flex-column align-items-center">
                              <p className="mb-0 number-stats pricing-unit-detail-item">
                                {h.currency.format(sqm, 0)}{' '}
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
                                  {!h.cmpInt(starting_price, 0) &&
                                  !h.cmpInt(sqm, 0) ? (
                                    <>
                                      {h.currency.format(
                                        starting_price / sqm,
                                        0,
                                      )}
                                    </>
                                  ) : (
                                    'N/A'
                                  )}
                                </p>
                                <label>
                                  {project.currency_code
                                    ? project.currency_code.toUpperCase()
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
                                !h.isEmpty(floor) && (
                                  <>
                                    {h.translate.localize('floor ', translate)}{' '}
                                    {floor}
                                  </>
                                )}
                              {unit_number && (
                                <>
                                  {floor ? ', ' : ''}
                                  {h.translate.localize('unit', translate)}{' '}
                                  {unit_number}
                                </>
                              )}
                              {unit_type && (
                                <>
                                  {unit_number ? ', ' : ''}
                                  {h.general.prettifyConstant(unit_type)}{' '}
                                  {h.translate.localize('type', translate)}
                                </>
                              )}
                            </div>

                            {h.notEmpty(direction_facing) && (
                              <div
                                className="d-flex align-items-start"
                                style={{ ...customStyle?.smallLabel }}
                              >
                                {h.notEmpty(direction_facing)
                                  ? h.general.ucFirst(direction_facing)
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
                            <div className="leave-private-message-text mb-2 hid-sm">
                              &nbsp;
                            </div>
                            <ReserveProperty
                              customStyle={customStyle}
                              translate={translate}
                              setLoading={setLoading}
                              shortlisted_property_id={shortlisted_property_id}
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
                                  contact={contact}
                                  project={project}
                                  contact_id={contact.contact_id}
                                  shortlisted_property_id={
                                    shortlisted_property_id
                                  }
                                  setLoading={setLoading}
                                  reloadComments={reloadComments}
                                  handleTracker={handleTracker}
                                  shouldTrackActivity={shouldTrackActivity}
                                  key={
                                    `property-comment-` +
                                    shortlisted_property_id
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
                              contact_id={contact.contact_id}
                              shortlisted_property_id={shortlisted_property_id}
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
                                contact={contact}
                                project={project}
                                contact_id={contact.contact_id}
                                shortlisted_property_id={
                                  shortlisted_property_id
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
