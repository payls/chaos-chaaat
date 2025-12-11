import React from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';

export default function UserProfilePicture(props) {
  const { src, alt, firstname, lastname, handleOnClick } = props;

  const getFirstInitials = (firstname, lastname) => {
    let firstInitial;
    let secondInitial;

    if (h.general.notEmpty(firstname)) {
      firstInitial = firstname.charAt(0).toUpperCase();
    } else {
      firstInitial = '';
    }

    if (h.general.notEmpty(lastname)) {
      secondInitial = lastname.charAt(0).toUpperCase();
    } else {
      secondInitial = '';
    }
    return firstInitial + secondInitial;
  };

  return (
    <>
      {(h.general.notEmpty(src) &&
        !h.general.cmpStr(src, constant.USER.PROFILE_PICTURE_PLACEHOLDER)) ||
      (h.isEmpty(firstname) && h.isEmpty(lastname)) ? (
        <img
          src={src ? src : constant.USER.PROFILE_PICTURE_PLACEHOLDER}
          alt={alt}
          className="rounded-circle comment-profile-picture"
          style={{
            cursor: h.general.notEmpty(handleOnClick) ? 'pointer' : 'inherit',
          }}
          onClick={handleOnClick}
        />
      ) : (
        <span
          className="rounded-circle comment-profile-picture profile-picture"
          style={{
            cursor: h.general.notEmpty(handleOnClick) ? 'pointer' : 'default',
          }}
          onClick={handleOnClick}
        >
          {getFirstInitials(firstname, lastname)}
        </span>
      )}
    </>
  );
}
