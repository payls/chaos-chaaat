import React, { useState } from 'react';
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
      shortlisted_property_proposal_template_id,
      unit,
      is_bookmarked,
      is_general_enquiry,
    },
    project,
    shouldTrackActivity,
    reloadShortlistedProjects,
    refValue,
    projectSettings,
    setPropertiesSettings,
    shortlistedProjectId,
  } = props;
  const [showInfo, setShowInfo] = useState(false);
  /**
   *  Get first media image
   * @param {*} unit
   * @returns image src
   */
  const getFirstMediaImage = (unit) => {
    let media = null;
    if (unit && projectSettings) {
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

      const hiddenMediaIds =
        filterMediaSettings.hidden_media &&
        (filterMediaSettings.hidden_media !== null ||
          filterMediaSettings.hidden_media !== '')
          ? filterMediaSettings.hidden_media.split(',')
          : [];

      const medias = unit.medias.filter(
        (f) =>
          ((filterMediaSettings?.media_setting_image &&
            f.media_tag.includes('image')) ||
            (filterMediaSettings?.media_setting_video &&
              f.media_tag.includes('video')) ||
            (filterMediaSettings?.media_setting_floor_plan &&
              f.media_tag.includes('floor_plan')) ||
            (filterMediaSettings?.media_setting_brocure &&
              f.media_tag.includes('brochure')) ||
            (filterMediaSettings?.media_setting_factsheet &&
              f.media_tag.includes('factsheet')) ||
            (filterMediaSettings?.media_setting_render_3d &&
              f.media_tag.includes('render_3d'))) &&
          !hiddenMediaIds.includes(f.media_property_media_fk),
      );

      if (medias.length > 0) {
        return medias[0].media_thumbnail_src
          ? medias[0].media_thumbnail_src
          : medias[0].media_url;
      }

      // return temp image if no image available
      return 'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png';
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
            setPropertiesSettings={setPropertiesSettings}
            {...props}
            setShowInfo={(v) => setShowInfo(v)}
          />
        )}
        <div
          style={{ width: '180px' }}
          className="pos-rlt image-wrap"
          ref={refValue}
        >
          <Bookmark
            shortlisted_property_id={shortlisted_property_proposal_template_id}
            is_bookmarked={is_bookmarked}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
          />
          <div style={{ marginRight: '5px' }}>
            <CommonImage
              placeholder="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png"
              src={getFirstMediaImage(unit)}
              width="100%"
              height="140px"
              style={styles.commonImage}
            />
          </div>
        </div>
        <div style={{ width: 'calc(100% - 160px)' }}>
          <h3 style={styles.title} className="property-card-title">
            {unit.unit_number && (
              <b style={{ color: customStyle?.propertyDetails?.unit }}>
                #{unit.unit_number}{' '}
              </b>
            )}
            {!h.cmpInt(unit.start_price, 0) && (
              <span style={{ color: customStyle?.propertyDetails?.price }}>
                {h.currency.format(unit.start_price, 0)}{' '}
                {unit.currency ? unit.currency.toUpperCase() : ''}
              </span>
            )}{' '}
            <span>
              {!h.cmpInt(unit.start_price, 0) && !h.cmpInt(unit.sqm, 0) && (
                <>
                  ({h.currency.format(unit.start_price / unit.sqm, 0)}{' '}
                  {unit.currency ? unit.currency.toUpperCase() : ''}/
                  {h.translate.localize(project.size_format, translate)})
                </>
              )}
            </span>
          </h3>

          <div className="property-card-amenities">
            <div style={{ color: customStyle?.propertyDetails?.textColor2 }}>
              {h.general.customFormatDecimal(unit.bath)}{' '}
              {unit.bed > 1
                ? h.translate.localize('beds', translate)
                : h.translate.localize('bed', translate)}
            </div>
            <div style={{ color: customStyle?.propertyDetails?.textColor2 }}>
              <span className="mr-2">|</span>
              {h.general.customFormatDecimal(unit.bed)}{' '}
              {unit.bath > 1
                ? h.translate.localize('baths', translate)
                : h.translate.localize('bath', translate)}
            </div>
            <div style={{ color: customStyle?.propertyDetails?.textColor2 }}>
              <span className="mr-2">|</span>
              {h.currency.format(unit.sqm, 0)}{' '}
              {h.translate.localize(project.size_format, translate)}
            </div>
          </div>
          <button
            style={{
              ...styles.button,
              background: customStyle.reservation?.background,
              color: 'white',
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
