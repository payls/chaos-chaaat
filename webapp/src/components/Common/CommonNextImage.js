import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CommonNextImage({
  src = null,
  placeholder = 'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/no-image.png',
  style = {},
}) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    if (src) {
      setImageSrc(src);
    }
  }, [src]);

  return (
    <Image
      src={imageSrc}
      placeholder="blur"
      blurDataURL={'https://cdn.yourpave.com/assets/blur.png'}
      alt="Pave"
      objectFit={'cover'}
      layout="fill"
      style={style}
      loading="lazy"
      onError={() => setImageSrc(placeholder)}
    />
  );
}
