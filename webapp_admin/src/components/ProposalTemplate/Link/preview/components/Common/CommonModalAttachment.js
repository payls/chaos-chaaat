import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import {
  faTimes,
  faDownload,
  faAngleLeft,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactImageMagnify from 'react-image-magnify';
import CommonImagePreview from './CommonImagePreview';
import CommonVideoPreview from './CommonVideoPreview';
import { PrimaryButton, Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { openPlugin } from '@react-pdf-viewer/open';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/open/lib/styles/index.css';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function CommonModalAttachment(props) {
  const {
    show = false,
    attachment,
    handleModal,
    downloadable = true,
    type = 'property',
  } = props;

  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [image, setImage] = useState(null);
  const [zoomDoc, setZoomDoc] = useState(1);
  const isPdf = attachment.attachment_url.includes('.pdf');
  const isYoutube = attachment.attachment_url.includes('youtube.com');
  const isVimeo = attachment.attachment_url.includes('player.vimeo.com');
  const isMP4 = attachment.attachment_url.includes('.mp4');
  let pdfViewWidth = window.innerWidth * 0.9;
  let pdfViewHeight = window.innerHeight * 0.9;
  let containerWidth = '600px';

  if (window.innerWidth > 1000) {
    pdfViewWidth = 600;
    pdfViewHeight = 850;
  }

  if (window.innerWidth < 1000) {
    pdfViewWidth = 740;
    pdfViewHeight = window.innerHeight * 0.8;
    containerWidth = '740px';
  }

  if (window.innerWidth < 800) {
    pdfViewWidth = 396;
    pdfViewHeight = window.innerHeight * 0.8;
    containerWidth = '396px';
  }

  if (window.innerWidth < 500) {
    pdfViewWidth = 320;
    pdfViewHeight = window.innerHeight * 0.8;
    containerWidth = '320px';
  }
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    const img = new Image();
    img.src = attachment.attachment_url;
    setImage(img);
    return () => {
      document.body.style.overflow = 'unset';
      setImage(null);
    };
  }, [show]);

  const zoomRatio = 2.5;
  const getDisplayDimensions = () => {
    const targetWidth = window.innerWidth * 0.8;
    const multiplier = targetWidth / image?.width;

    return {
      width: image?.width * multiplier,
      height: image?.height * multiplier,
    };
  };

  const zoomIn = () => {
    setZoomDoc((prev) => prev + 0.1);
  };

  const zoomOut = () => {
    if (zoomDoc >= 1.1) {
      setZoomDoc((prev) => prev - 0.1);
    }
  };

  const resetZoom = () => {
    setZoomDoc((prev) => 1);
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      // Remove the attachments tab (\`defaultTabs[2]\`)
      defaultTabs[0], // Bookmarks tab
    ],
  });
  return (
    <>
      {show && (
        <div className="common-modal-attachment-background">
          <div
            className="common-modal-attachment-container"
            style={{
              position: 'relative',
              ...(isPdf ? { width: containerWidth } : {}),
            }}
          >
            <div className="common-modal-attachment-header">
              <h1
                style={{
                  color: 'white',
                }}
              >
                Preview
              </h1>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    display: downloadable ? 'inline' : 'none',
                    fontSize: '0.8em',
                    ...(isPdf ? { display: 'none' } : {}),
                  }}
                  onClick={() => {
                    h.download.downloadWithFileName(
                      attachment.attachment_url,
                      type === 'property'
                        ? constant.UPLOAD.TYPE
                            .SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT
                        : constant.UPLOAD.TYPE
                            .SHORTLISTED_PROJECT_COMMENT_ATTACHMENT,
                    );
                  }}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ cursor: 'pointer' }}
                    color="#fff"
                    size="2x"
                  />
                </span>

                <span
                  onClick={handleModal}
                  style={{
                    cursor: 'pointer',
                    fontSize: '1em',
                    marginLeft: '3em',
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} color="#fff" size="2x" />
                </span>
              </div>
            </div>
            <div
              className="common-modal-attachment-body"
              style={{
                ...(isPdf
                  ? {
                      height: pdfViewHeight + 'px',
                      position: 'relative',
                      overflow: 'auto',
                    }
                  : {}),
              }}
            >
              {isPdf && (
                <div
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    height: '750px',
                  }}
                >
                  <Worker workerUrl="//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js">
                    <Viewer
                      fileUrl={attachment.attachment_url}
                      plugins={[defaultLayoutPluginInstance]}
                    />
                  </Worker>
                </div>
              )}

              {!isPdf && !isYoutube && !isVimeo && !isMP4 && (
                <CommonImagePreview
                  imageSrc={attachment.attachment_url}
                  download={true}
                />
              )}

              {!isPdf && (isYoutube || isVimeo || isMP4) && (
                <CommonVideoPreview
                  src={attachment.attachment_url}
                  download={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
