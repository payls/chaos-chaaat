import React, { useEffect, useState } from 'react';
import constant from '../../constants/constant.json';
import IconBlackCross from '../Icons/IconBlackCross';
import { h } from '../../helpers';

const mime = require('mime-types');

// MIME types supported are in accordance to: https://filext.com/faq/office_mime_types.html
// Support for unexpected MIME types such as Libra will be added soon
const image = constant.MIME_TYPE.IMAGE;
const doc = constant.MIME_TYPE.DOC;
const xls = constant.MIME_TYPE.XLS;
const ppt = constant.MIME_TYPE.PPT;
const pdf = constant.MIME_TYPE.PDF;

const docIcon = 'https://cdn.yourpave.com/assets/doc.png';
const xlsIcon = 'https://cdn.yourpave.com/assets/xls.png';
const pptIcon = 'https://cdn.yourpave.com/assets/ppt.png';
const pdfIcon = 'https://cdn.yourpave.com/assets/pdf.png';
const othersIcon =
  'https://cdn-staging.yourpave.com/shortlisted_property/comment/attachment/4ae8d6e8612505af004c783afdaac081647a11cffbe3ae701ed64462037a587e6d7db8d738ac0b5be2d10915c990991b228e87caf4c1db687c892235b9b23f99.png';

export default function ShortlistedPropertyAttachmentCard(props) {
  const {
    uploading = false,
    attachment,
    handleModal = () => {}, // not needed when uploading
    handleTracker = (activityType, metaData) => {}, // not needed when uploading
    removeAttachmentHandler, // only needed when uploading
    shortlisted_property_id, // only needed when uploading
    shouldTrackActivity = true,
  } = props;

  const [fileType, setFileType] = useState('');
  const [fileIcon, setFileIcon] = useState('');

  const determineFileType = () => {
    let mime_type = mime.lookup(attachment.attachment_url);
    setFileType(mime_type);
    setFileIcon(getFileIcon(mime_type));
  };

  const getFileIcon = (mime_type) => {
    if (doc.includes(mime_type)) {
      return docIcon;
    } else if (xls.includes(mime_type)) {
      return xlsIcon;
    } else if (ppt.includes(mime_type)) {
      return pptIcon;
    } else if (pdf.includes(mime_type)) {
      return pdfIcon;
    } else {
      return othersIcon;
    }
  };

  const onAttachmentClick = (mimeType) => {
    const metaData = {
      media_type: '',
      url: attachment.attachment_url,
      file_name: attachment.file_name,
    };
    let activityType;
    if (image.includes(mimeType)) {
      activityType =
        constant.CONTACT.ACTIVITY.TYPE.COMMENT_ATTACHMENT_IMAGE_PREVIEWED;
    } else if (doc.includes(mimeType)) {
      activityType =
        constant.CONTACT.ACTIVITY.TYPE.COMMENT_ATTACHMENT_WORD_DOWNLOADED;
    } else if (xls.includes(mimeType)) {
      activityType =
        constant.CONTACT.ACTIVITY.TYPE.COMMENT_ATTACHMENT_EXCEL_DOWNLOADED;
    } else if (ppt.includes(mimeType)) {
      activityType =
        constant.CONTACT.ACTIVITY.TYPE.COMMENT_ATTACHMENT_POWERPOINT_DOWNLOADED;
    } else if (pdf.includes(mimeType)) {
      activityType =
        constant.CONTACT.ACTIVITY.TYPE.COMMENT_ATTACHMENT_PDF_PREVIEWED;
    }
    if (
      shouldTrackActivity &&
      activityType &&
      attachment &&
      attachment.attachment_url
    ) {
      handleTracker(activityType, metaData);
    }
  };

  useEffect(() => {
    determineFileType();
  }, [attachment]);

  return (
    <>
      {/* Rendering differently depending on uploading or not */}
      {uploading ? (
        <div
          className="position-relative attachment-container-uploading"
          style={{
            display: 'inline-block',
            height: 80,
            width: image.includes(fileType) ? 'auto' : '7em',
          }}
        >
          <IconBlackCross
            className="position-absolute"
            style={{
              cursor: 'pointer',
              top: -10,
              right: -10,
            }}
            onClick={() => removeAttachmentHandler(attachment.attachment_url)}
          />
          {image.includes(fileType) ? (
            <img
              key={
                attachment.shortlisted_property_comment_attachment_id != null
                  ? attachment.shortlisted_property_comment_attachment_id
                  : ''
              }
              src={attachment.attachment_url}
              alt={
                attachment.attachment_title != null
                  ? attachment.attachment_title
                  : ''
              }
              style={{ height: 80 }}
            />
          ) : (
            <div style={{ height: 'inherit' }}>
              <div className="attachment-icon-container">
                <img src={fileIcon} style={{ height: 50 }}></img>
              </div>

              <div className="attachment-text-container">
                <span className="attachment-text">
                  {attachment.file_name != null
                    ? attachment.file_name
                    : 'placeholder.docx'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={
            image.includes(fileType)
              ? 'attachment-container-image'
              : 'attachment-container'
          }
        >
          {image.includes(fileType) && (
            <img
              key={
                attachment.shortlisted_property_comment_attachment_id != null
                  ? attachment.shortlisted_property_comment_attachment_id
                  : ''
              }
              src={attachment.attachment_url}
              alt={
                attachment.attachment_title != null
                  ? attachment.attachment_title
                  : ''
              }
              onClick={(e) => {
                handleModal(e, attachment);
                onAttachmentClick(fileType);
              }}
              style={{ height: 100, cursor: 'pointer' }}
            />
          )}
          {pdf.includes(fileType) && (
            <>
              <div className="attachment-icon-container">
                <img
                  src={fileIcon}
                  style={{ height: 60, cursor: 'pointer' }}
                  onClick={(e) => {
                    handleModal(e, attachment);
                    onAttachmentClick(fileType);
                  }}
                ></img>
              </div>

              <div className="attachment-text-container">
                <span className="attachment-text">
                  {attachment.file_name != null
                    ? attachment.file_name
                    : 'placeholder'}
                </span>
              </div>
            </>
          )}
          {!image.includes(fileType) && !pdf.includes(fileType) && (
            <div
              onClick={() =>
                h.download.downloadWithFileName(
                  attachment.attachment_url,
                  constant.UPLOAD.TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT,
                )
              }
            >
              <div className="attachment-icon-container">
                <img
                  src={fileIcon}
                  style={{ height: 60, cursor: 'pointer' }}
                  onClick={() => {
                    onAttachmentClick(fileType);
                  }}
                ></img>
              </div>

              <div className="attachment-text-container">
                <span className="attachment-text">
                  {attachment.file_name != null
                    ? attachment.file_name
                    : 'placeholder'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
