import React from 'react';

export default function CommonStarRating(props) {
  const {
    count,
    value,
    activeColor,
    inactiveColor,
    onChange,
    starRatingClassName,
  } = props;

  const stars = Array.from({ length: count }, () => '★');

  const handleChange = (value) => {
    onChange(value + 1);
  };

  return (
    <div>
      {stars.map((star, index) => {
        let style = inactiveColor;
        if (index < value) {
          style = activeColor;
        }
        return (
          <span
            className={`star-rating pl-2 pr-2 pl-sm-3 pr-sm-3 pl-md-5 pr-md-5 ${starRatingClassName}`}
            key={index}
            style={{ color: style, cursor: 'pointer' }}
            onClick={() => handleChange(index)}
          >
            {star}
          </span>
        );
      })}
    </div>
  );
}
