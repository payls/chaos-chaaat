import React, { useState } from 'react';
import Image from 'next/image';

export default function CommonNextImage({
  src = '',
  placeholder = 'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/no-image.png',
  style = {},
}) {
  const [imageSrc, setImageSrc] = useState(src);

  if (!src) {
    return <></>;
  }

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
