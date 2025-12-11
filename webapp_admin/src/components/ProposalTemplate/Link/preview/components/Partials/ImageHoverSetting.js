import React, { useRef, useState } from 'react';
import {
  faCamera,
  faEye,
  faEyeSlash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonModalAttachment from '../Common/CommonModalAttachment';
import CommonImage from '../Common/CommonImage';

export default function ({
  media,
  media_tags,
  showImageMediaSettings,
  handleHideImages,
  index,
  imageSrc,
}) {
  const imageRef = useRef();
  const [showModal, setShowModal] = useState();
  const [previewMedia, setPreviewMedia] = useState(null);

  const handleModal = (e, attachment) => {
    if (e) e.preventDefault();
    if (showModal) {
      imageRef.current.classList.remove('hovered');
      setPreviewMedia(null);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const handleShowMediaPreview = (attachment) => {
    setPreviewMedia(attachment);
    setShowModal(true);
  };

  return (
    <div
      onMouseOver={() => {
        if (imageRef) {
          imageRef.current.classList.add('hovered');
          //   setHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (imageRef) {
          imageRef.current.classList.remove('hovered');
          //   setHovered(false);
        }
      }}
      ref={imageRef}
      className={'image-toggle-item ' + (!media.isHidden ? 'active' : '')}
      style={{
        display: media_tags.includes(showImageMediaSettings)
          ? 'inline-block'
          : 'none',
      }}
    >
      {previewMedia && (
        <CommonModalAttachment
          key={`modal-${
            media?.project_media_id ?? media.media_project_media_id
          }`}
          attachment={{
            attachment_url: media?.url ?? media?.media_url,
          }}
          show={showModal}
          handleModal={handleModal}
          media={handleModal}
        />
      )}
      <div className="image-toggle-item-action-wrapper">
        {/* <div
          className="image-toggle-item-action"
          onClick={() => handleShowMediaPreview(imageSrc)}
        >
          <FontAwesomeIcon icon={faCamera} color="#fff" />
        </div> */}
        <div
          className="image-toggle-item-action"
          onClick={() => handleShowMediaPreview(imageSrc)}
        >
          <FontAwesomeIcon icon={faEye} color="#fff" />
        </div>
      </div>

      <CommonImage
        onClick={(e) => {
          handleHideImages(index);
        }}
        src={imageSrc}
        width="100%"
        height="100%"
        style={{
          objectFit: 'cover',
          cursor: 'pointer',
        }}
      />

      {!media.isHidden && (
        <div
          className="image-toggle-item-check"
          onClick={() => {
            handleHideImages(index);
          }}
        >
          <FontAwesomeIcon icon={faCheck} color="#fff" />
        </div>
      )}
    </div>
  );
}
