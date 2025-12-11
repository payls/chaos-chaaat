import React from 'react';
import IconStarGrayVector from '../Icons/IconStarGrayVector';
import IconStarYellowVector from '../Icons/IconStarYellowVector';

export default function CommonStarRating(props) {
  const { count, value, onChange, shouldTrackActivity, customStyle } = props;

  const handleChange = (value) => {
    onChange(value + 1);
  };

  return (
    <div
      style={{
        pointerEvents: shouldTrackActivity ? 'all' : 'none',
        ...customStyle?.starBg,
      }}
      className="comment-star-rating"
    >
      {[...Array(count)].map((i, index) => {
        return (
          <span
            key={index}
            style={{ cursor: 'pointer', marginLeft: '7px' }}
            onClick={() => handleChange(index)}
          >
            {index < value ? <IconStarYellowVector /> : <IconStarGrayVector />}
          </span>
        );
      })}
    </div>
  );
}
