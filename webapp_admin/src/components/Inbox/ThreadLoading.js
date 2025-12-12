import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default React.memo(() => {
  return (
    <>
      <div
        className="p-3 animate-fadeIn"
        style={{
          display: 'grid',
          alignContent: 'end',
          height: '100%',
          textAlign: 'right',
        }}
      >
        <Skeleton width={'10%'} height={'20px'} className="mt-2" />
        <Skeleton
          width={'80%'}
          height={'240px'}
          className="mt-1"
          borderRadius={'10px'}
        />
        <Skeleton
          width={'40%'}
          height={'50px'}
          className="mt-2"
          borderRadius={'10px'}
        />
        <Skeleton
          width={'70%'}
          height={'040px'}
          className="mt-2"
          borderRadius={'10px'}
        />
        <Skeleton
          width={'100%'}
          height={'040px'}
          className="mt-5"
          borderRadius={'10px'}
        />
        {/* <div className="p-3 " style={{ textAlign: 'right' }}>
          <Skeleton
            width={'6%'}
            height={'10px'}
            className="mt-2"
            borderRadius={'10px'}
          />
          <Skeleton
            width={'70%'}
            height={'040px'}
            className="mt-2"
            borderRadius={'10px'}
          />
        </div> */}
      </div>
    </>
  );
});
