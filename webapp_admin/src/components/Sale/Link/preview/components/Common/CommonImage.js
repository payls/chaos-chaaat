import React, { useEffect, useState } from 'react';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function CommonImage(props) {
  const { placeholder = '' } = props;

  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState('');
  const [placeholderImage, setPlaceholderImage] = useState(
    placeholder !== ''
      ? placeholder
      : 'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/no-image.png',
  );

  useEffect(() => {
    if (props?.media) {
      setPlaceholderImage('https://cdn.yourpave.com/assets/3d.png');
    }
  }, [props.media]);
  useEffect(() => {
    const img = new Image();
    img.src = props.src;
    img.onload = () => {
      setSource(props.src);
      setLoaded(true);
    };
    img.onerror = () => {
      setLoaded(true);
    };
  }, [props.src]);
  return loaded ? (
    <img
      src={source}
      {...props}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null; // prevents looping
        currentTarget.src = placeholderImage;
      }}
    />
  ) : (
    <Skeleton width={'100%'} height={'100%'} />
  );
}
