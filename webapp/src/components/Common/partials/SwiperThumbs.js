import React from 'react';
import Image from 'next/image';
import Swiper from 'react-id-swiper';
import SwiperCore, { Controller } from 'swiper';

import constant from '../../../constants/constant.json';

import 'swiper/swiper-bundle.css';
import CommonNextImage from '../CommonNextImage';

SwiperCore.use([Controller]);

const swiperOptions = {
  modules: [Controller],
  spaceBetween: 10,
  slidesPerView: 6,
  touchRatio: 0.2,
  slideToClickedSlide: true,
  lazy: true,
  breakpoints: {
    // when window width is >= 220px
    200: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    // when window width is >= 320px
    320: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    // when window width is >= 480px
    480: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    // when window width is >= 640px
    480: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    // when window width is >= 540px
    540: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    // when window width is >= 640px
    640: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    // when window width is >= 995px
    995: {
      slidesPerView: 4,
      spaceBetween: 20,
    },
    1200: {
      slidesPerView: 6,
      spaceBetween: 20,
    },
  },
};

const SwiperThumbs = ({ medias, handleMaximize, elRef, projectLevel }) => {
  return (
    <Swiper {...swiperOptions} ref={elRef} observeParents observer>
      {medias.map((item, i) => {
        let imgSrc = item.thumb ?? item.src;

        if (item.tag.includes(constant.PROPERTY.MEDIA.TAG.VIDEO)) {
          imgSrc = item.thumb;
        }

        if (item.tag.includes(constant.PROPERTY.MEDIA.TAG.RENDER_3D)) {
          imgSrc = 'https://cdn.yourpave.com/assets/3d.png';
        }

        if (projectLevel && item.is_hero_image) {
          return <div style={{ display: 'none' }} key={`thumbnail-` + i}></div>;
        }

        return (
          <div key={i} onClick={() => handleMaximize(i)}>
            <CommonNextImage src={imgSrc} />
          </div>
        );
      })}
    </Swiper>
  );
};

export default React.memo(SwiperThumbs);
