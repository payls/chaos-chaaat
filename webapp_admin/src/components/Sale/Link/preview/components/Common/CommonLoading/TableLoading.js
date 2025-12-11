import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default React.memo(
  ({ className = 'mt-5', height = '30px', width = '100%' }) => {
    return (
      <Skeleton
        width={width}
        height={height}
        className={className}
        borderRadius={'3px'}
        inline
      />
    );
  },
);
