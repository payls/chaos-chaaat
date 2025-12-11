import React from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';

export default function AgencyLogo(props) {
  const { src, alt, width, height, name, handleOnClick } = props;

  const getNameInitials = (name) => {
    if (h.general.notEmpty(name)) {
      return name.charAt(0).toUpperCase();
    }
    return '';
  };

  return (
    <>
      {(h.general.notEmpty(src) &&
        !h.general.cmpStr(src, constant.USER.PROFILE_PICTURE_PLACEHOLDER)) ||
      h.isEmpty(name) ? (
        <img
          src={src ? src : constant.USER.PROFILE_PICTURE_PLACEHOLDER}
          alt={alt}
          className="rounded-circle"
          style={{
            height: height,
            width: width,
            cursor: h.general.notEmpty(handleOnClick) ? 'pointer' : 'inherit',
          }}
          onClick={handleOnClick}
        />
      ) : (
        <span
          className="rounded-circle profile-picture"
          style={{
            height: height,
            width: width,
            fontSize: height / 3,
            cursor: h.general.notEmpty(handleOnClick) ? 'pointer' : 'default',
          }}
          onClick={handleOnClick}
        >
          {getNameInitials(name)}
        </span>
      )}
    </>
  );
}
