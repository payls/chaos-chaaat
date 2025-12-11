import React, { useEffect } from 'react';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import IconZoomIn from '../Icons/IconZoomIn';
import IconZoomOut from '../Icons/IconZoomOut';
import IconReset from '../Icons/IconReset';
import { faRedo } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CommonVideoPreview({ src, download = false }) {
  const screenHeight = window.innerWidth < 400 ? 300 : window.innerHeight;

  const width = window.innerWidth - (window.innerWidth * 30) / 100 + 'px';
  const height = screenHeight - (screenHeight * 40) / 100 + 'px';
  return (
    <TransformWrapper initialScale={1}>
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          <TransformComponent>
            {src.includes('.mp4') && (
              <video className="w-100" controls>
                <source src={src} type="video/mp4" />
              </video>
            )}
            {(src.includes('youtube.com') ||
              src.includes('player.vimeo.com')) && (
              <div class="w-100">
                <iframe
                  src={src}
                  width={width}
                  height={height}
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
          </TransformComponent>
        </React.Fragment>
      )}
    </TransformWrapper>
  );
}
