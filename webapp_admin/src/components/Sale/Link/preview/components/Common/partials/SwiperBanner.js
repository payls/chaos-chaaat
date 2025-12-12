import React from 'react';
import Image from 'next/image';
import Swiper from 'react-id-swiper';
import SwiperCore, { Navigation, Controller } from 'swiper';

import constant from '../../../constants/constant.json';

import 'swiper/swiper-bundle.css';
import CommonNextImage from '../CommonNextImage';

SwiperCore.use([Navigation, Controller]);

const swiperOptions = {
  modules: [Navigation, Controller],
  navigation: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  lazy: true,
  spaceBetween: 30,
  breakpoints: {
    1200: {
      slidesPerView: 1,
      spaceBetween: 0,
    },
  },
};

const SwiperBanner = ({
  medias,
  handleMaximize,
  elRef,
  projectLevel,
  handleSwiperSlideChange,
}) => {
  return (
    <Swiper
      {...swiperOptions}
      ref={elRef}
      observeParents
      observer
      on={{
        slideChange: async (e) => await handleSwiperSlideChange(e),
      }}
    >
      {medias.map((item, i) => {
        let imgSrc = item.src ? item.src : item.thumb;

        if (item.tag.includes(constant.PROPERTY.MEDIA.TAG.VIDEO)) {
          imgSrc = item.thumb;
        }
        return item.tag.includes(constant.PROPERTY.MEDIA.TAG.RENDER_3D) ? (
          <div className="swiper-banner-image" key={i}>
            <iframe src={imgSrc} width="100%" height="100%" />
          </div>
        ) : (
          <div
            className="swiper-banner-image"
            key={i}
            onClick={() => handleMaximize(i)}
          >
            <CommonNextImage src={imgSrc} />
          </div>
        );
      })}
    </Swiper>
  );
};

export default React.memo(SwiperBanner);
