import React from 'react';
import Swiper from 'react-id-swiper';
import SwiperCore, { Navigation, Controller } from 'swiper';

SwiperCore.use([Navigation, Controller]);

const swiperOptions = {
  slidesPerView: 1,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
};

export default React.memo(({ images, height = '355px' }) => {
  const imagesArr = images ?? [];
  return (
    <div style={{ width: '100%' }}>
      <Swiper {...swiperOptions}>
        {imagesArr.map((img, i) => (
          <div key={i}>
            <img
              src={img}
              width={'100%'}
              height={height}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </Swiper>
    </div>
  );
});
