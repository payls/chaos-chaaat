import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function LoadingShortlistedProject() {
  return (
    <div className="container mt-2">
      <Skeleton width={'40%'} height={'40px'} />
      <div>
        <Skeleton
          width={'20%'}
          height={'20px'}
          className={'mt-3'}
          style={{ marginRight: '30px' }}
          count={3}
          inline
        />
      </div>

      <Skeleton
        width={'10%'}
        height={'50px'}
        count={5}
        className="mt-3 mr-2"
        inline
      />
      <Skeleton width={'100%'} height={'340px'} className="mt-2" />

      <Skeleton width={'10%'} height={'40px'} className="mt-3" />
      <Skeleton width={'100%'} height={'20px'} className="mt-2" count={3} />

      <Skeleton width={'10%'} height={'40px'} className="mt-3" />

      <div className="d-flex justify-content-between mt-2">
        <div>
          <Skeleton
            width={'40px'}
            height={'40px'}
            className="mt-2 mr-2"
            borderRadius={'100%'}
            inline
          />
          <Skeleton
            width={'120px'}
            height={'40px'}
            className="mt-2 mr-5"
            count={1}
            inline
          />
        </div>
        <div>
          <Skeleton
            width={'40px'}
            height={'40px'}
            className="mt-2 mr-2"
            borderRadius={'100%'}
            inline
          />
          <Skeleton
            width={'120px'}
            height={'40px'}
            className="mt-2 mr-5"
            count={1}
            inline
          />
        </div>
        <div>
          <Skeleton
            width={'40px'}
            height={'40px'}
            className="mt-2 mr-2"
            borderRadius={'100%'}
            inline
          />
          <Skeleton
            width={'120px'}
            height={'40px'}
            className="mt-2 mr-5"
            count={1}
            inline
          />
        </div>
      </div>
      <Skeleton width={'100%'} height={'340px'} className="mt-3" />
    </div>
  );
}
