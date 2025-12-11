import React, { useEffect, useState } from 'react';
import CommonImage from '../../Common/CommonImage';
import { h } from '../../../helpers';
import constant from '../../../constants/constant.json';

// ICONS
import IconSizeVector from '../../Icons/IconSizeVector';
import IconBedVector from '../../Icons/IconBedVector';
import IconBathroomVector from '../../Icons/IconBathroomVector';
import IconStarYellowVector from '../../Icons/IconStarYellowVector';
import IconStarGrayVector from '../../Icons/IconStarGrayVector';
import IconBookmarkInactiveVector from '../../Icons/IconBookmarkInactiveVector';

// Components
import PropertyModal from './PropertyModal';
import Bookmark from './Bookmark';
import CommonNextImage from '../../Common/CommonNextImage';

const styles = {
  commonImage: {
    borderRadius: '8px',
    objectFit: 'cover',
  },
  title: {
    color: '#002030',
  },
  button: {
    background: 'white',
    borderColor: '#04221E',
    color: '#04221E',
    marginTop: '40px',
  },
};

export default function Card(props) {
  const {
    customStyle,
    translate,
    shortlistedProperty: {
      project_medias,
      shortlisted_property_id,
      unit_number,
      starting_price,
      number_of_bathroom,
      number_of_bedroom,
      is_bookmarked,
      is_general_enquiry,
      sqm,
      floor,
      unit_type,
      direction_facing,
    },
    project,
    contact,
    shouldTrackActivity,
    reloadShortlistedProjects,
    projectSettings,
  } = props;

  const [showInfo, setShowInfo] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
  );

  useEffect(() => {
    getFirstMediaImage(project_medias);
  }, []);
  /**
   *  Get first media image
   * @param {*} unit
   * @returns image src
   */
  const getFirstMediaImage = (pMedias) => {
    if (pMedias && projectSettings) {
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

      const medias = pMedias.filter((f) => {
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
      });
      if (medias.length > 0) {
        setImageSrc(
          encodeURI(
            medias[0].thumbnail_src ? medias[0].thumbnail_src : medias[0].url,
          ),
        );
      }
    }
  };

  return (
    <>
      <div
        className="property-card d-flex flow-wrap mb-3 "
        style={{ width: '50%', gap: '1em' }}
      >
        {showInfo && (
          <PropertyModal
            show={showInfo}
            {...props}
            setShowInfo={(v) => setShowInfo(v)}
          />
        )}
        <div style={{ width: '180px' }} className="pos-rlt image-wrap">
          <Bookmark
            contact_id={contact.contact_id}
            shortlisted_property_id={shortlisted_property_id}
            is_bookmarked={is_bookmarked}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
          />
          <div style={{ marginRight: '5px' }}>
            <CommonNextImage src={imageSrc} style={styles.commonImage} />
          </div>
        </div>
        <div style={{ width: 'calc(100% - 160px)' }}>
          <h3 style={styles.title} className="property-card-title">
            {unit_number && (
              <b style={{ color: customStyle?.propertyDetails?.unit }}>
                #{unit_number}{' '}
              </b>
            )}
            {is_general_enquiry && !h.cmpInt(starting_price, 0) && (
              <span style={{ color: customStyle?.propertyDetails?.price }}>
                {h.currency.format(starting_price, 0)}{' '}
                {project.currency_code
                  ? project.currency_code.toUpperCase()
                  : ''}
              </span>
            )}{' '}
            <span>
              {is_general_enquiry &&
                !h.cmpInt(starting_price, 0) &&
                !h.cmpInt(sqm, 0) && (
                  <>
                    ({h.currency.format(starting_price / sqm, 0)}{' '}
                    {project.currency_code
                      ? project.currency_code.toUpperCase()
                      : ''}
                    /{h.translate.localize(project.size_format, translate)})
                  </>
                )}
            </span>
          </h3>

          <div className="property-card-amenities">
            <div style={{ color: customStyle?.propertyDetails?.textColor2 }}>
              {h.general.customFormatDecimal(parseInt(number_of_bathroom))}{' '}
              {parseInt(number_of_bedroom) > 1
                ? h.translate.localize('beds', translate)
                : h.translate.localize('bed', translate)}
            </div>
            <div style={{ color: customStyle?.propertyDetails?.textColor2 }}>
              <span className="mr-2">|</span>
              {h.general.customFormatDecimal(parseInt(number_of_bedroom))}{' '}
              {parseInt(number_of_bathroom) > 1
                ? h.translate.localize('baths', translate)
                : h.translate.localize('bath', translate)}
            </div>
            <div style={{ color: customStyle?.propertyDetails?.textColor2 }}>
              <span className="mr-2">|</span>
              {h.currency.format(sqm, 0)}{' '}
              {h.translate.localize(project.size_format, translate)}
            </div>
          </div>
          <button
            style={{
              ...styles.button,
              background: customStyle.reservation?.background,
              color: customStyle.reservation?.color ?? 'white',
              border: `1px solid ${customStyle.reservation?.background}`,
            }}
            className="btn-hover-learn-more"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {h.translate.localize('learnMore', translate)}
          </button>
        </div>
      </div>
    </>
  );
}
