import React, { useEffect, useRef } from 'react';
import constant from '../../../constants/constant.json';

import SwiperBanner from './SwiperBanner';
import SwiperThumbs from './SwiperThumbs';

const SwiperComponent = ({
  medias,
  handleMaximize,
  showThumbnails,
  projectLevel,
  shouldTrackActivity,
  activityTracker,
}) => {
  const gallerySwiperRef = useRef(null);
  const thumbnailSwiperRef = useRef(null);

  /**
   * Control Thumbnails
   */
  useEffect(() => {
    if (gallerySwiperRef.current && thumbnailSwiperRef.current) {
      const gallerySwiper = gallerySwiperRef.current.swiper;
      const thumbnailSwiper = thumbnailSwiperRef.current.swiper;
      if (gallerySwiper.controller && thumbnailSwiper.controller) {
        gallerySwiper.controller.control = thumbnailSwiper;
        thumbnailSwiper.controller.control = gallerySwiper;
      }
    }
  }, []);

  const handleSwiperSlideChange = async (event) => {
    if (!event) return;
    const { previousIndex, activeIndex } = event;
    if (previousIndex !== undefined && activeIndex !== undefined) {
      if (previousIndex < activeIndex) {
        if (shouldTrackActivity)
          activityTracker(
            !projectLevel
              ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_RIGHT_BUTTON_CLICKED
              : constant.CONTACT.ACTIVITY.TYPE
                  .PROJECT_CAROUSEL_RIGHT_BUTTON_CLICKED,
          );
      }
      if (previousIndex > activeIndex) {
        if (shouldTrackActivity)
          activityTracker(
            !projectLevel
              ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_LEFT_BUTTON_CLICKED
              : constant.CONTACT.ACTIVITY.TYPE
                  .PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED,
          );
      }
    }
  };

  return (
    <div className="container mt-1 mb-5 swiper-wrap">
      <SwiperBanner
        medias={medias}
        handleMaximize={handleMaximize}
        elRef={gallerySwiperRef}
        projectLevel={projectLevel}
        handleSwiperSlideChange={handleSwiperSlideChange}
      />

      {showThumbnails && (
        <div className="swiper-thumbs shortlisted-property-swiper mt-3">
          <SwiperThumbs
            medias={medias}
            handleMaximize={handleMaximize}
            elRef={thumbnailSwiperRef}
            projectLevel={projectLevel}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SwiperComponent);
