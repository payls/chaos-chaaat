import React, { useState, useEffect, useMem, useCallback } from 'react';
import { h } from '../../helpers';
import CommonImage from '../Common/CommonImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark,
  faCertificate,
  faCheck,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import WhatsAppImageHoverSetting from '../../../../../ProposalTemplate/Link/preview/components/Partials/WhatsAppImageHoverSetting';
export default function WhatsAppMessageImageSelector({
  projectName,
  projectImages,
  constant,
  selectedImages,
  setSelectedImages,
}) {
  const [showImageMediaSettings, setShowImageMediaSettings] = useState(null);
  const [filteredMediaUnits, setFilteredMediaUnits] = useState(projectImages);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [translate, setTranslation] = useState(
    require('../../constants/locale/en.json'),
  );
  // Check setting for available media
  const hasMedia = useCallback(
    (type) => {
      return (
        projectImages.filter((f) => {
          const media_tags = f.project_media_tags.map((m) => m.tag);
          return media_tags.includes(type);
        }).length > 0
      );
    },
    [projectImages],
  );

  // Set images for settings
  const handleSetMediaForSettings = (type) => {
    setShowImageMediaSettings(type);
  };

  // hide specific project level media
  const handleSelectImages = (index) => {
    projectImages[index].is_selected = !projectImages[index].is_selected;
    if (projectImages[index].is_selected) {
      setSelectedImages((current) => [...current, projectImages[index].url]);
    } else {
      const currentImages = [...selectedImages];
      const imageIndex = currentImages.indexOf(projectImages[index].url);
      if (imageIndex !== -1) {
        currentImages.splice(imageIndex, 1);
        setSelectedImages(currentImages);
      }
    }
  };

  return (
    <>
      <div className="visibility-toggle-media">
        <div className="visibility-toggle-media-wrapper">
          <h3>
            Here you can select what images you like to add for {projectName}
          </h3>
          <div className="d-flex">
            {hasMedia(constant.PROPERTY.MEDIA.TAG.IMAGE) && (
              <div
                className="image-toggle-item d-flex mr-4 "
                style={{ gap: 2, height: '30px' }}
              >
                <label
                  className="setting-label"
                  onClick={() => {
                    handleSetMediaForSettings('image');
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
                <label
                  className="setting-label w-110"
                  onClick={() => {
                    handleSetMediaForSettings('floor_plan');
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
                <label
                  className="setting-label"
                  onClick={() => {
                    handleSetMediaForSettings('video');
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
                <label
                  className="setting-label"
                  onClick={() => {
                    handleSetMediaForSettings('brochure');
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
              {projectImages.map((media, index) => {
                const media_tags = media.project_media_tags.map((m) => m.tag);
                let imageSrc = h.image.getMediaThumbnail(media);
                return (
                  <WhatsAppImageHoverSetting
                    media={media}
                    media_tags={media_tags}
                    showImageMediaSettings={showImageMediaSettings}
                    index={index}
                    imageSrc={imageSrc}
                    handleSelectImages={() => handleSelectImages(index)}
                  />
                );
              })}
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
                    marginTop: '30px',
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
    </>
  );
}
