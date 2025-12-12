import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default React.memo(
  ({ className = 'mt-5', height = '30px', width = '100%', count = 5 }) => {
    return (
      <>
        {[...Array(count)].map((e, i) => (
          <Skeleton
            width={width}
            height={height}
            className={className}
            borderRadius={'3px'}
            inline
            key={i}
          />
        ))}
      </>
    );
  },
);
