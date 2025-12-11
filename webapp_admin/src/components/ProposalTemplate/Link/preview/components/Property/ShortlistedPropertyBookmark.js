import React from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconBookmarkActiveVector from '../Icons/IconBookmarkActiveVector';
import IconBookmarkInactiveVector from '../Icons/IconBookmarkInactiveVector';

export default function ShortlistedPropertyBookmark(props) {
  const {
    contact_id,
    shortlisted_property_id,
    is_bookmarked,
    created_date,
    reloadShortlistedProjects,
    shouldTrackActivity = false,
    hasMedia = true,
    customStyle,
  } = props;

  const handleBookmark = async () => {
    const apiRes =
      await api.shortlistedProperty.updateShortlistedPropertyBookmark(
        { shortlisted_property_id },
        false,
      );
    if (h.cmpStr(apiRes.status, 'ok')) {
      reloadShortlistedProjects();
      let activity_type;
      let alertMessage;
      if (apiRes.data.is_bookmarked) {
        activity_type = constant.CONTACT.ACTIVITY.TYPE.PROPERTY_BOOKMARKED;
        alertMessage = 'Property successfully bookmarked';
      } else {
        activity_type = constant.CONTACT.ACTIVITY.TYPE.PROPERTY_UNBOOKMARKED;
        alertMessage = 'Removed bookmark successfully';
      }
      if (shouldTrackActivity) {
        await api.contactActivity.create(
          {
            contact_fk: contact_id,
            activity_type: activity_type,
            activity_meta: JSON.stringify({
              shortlisted_property_id,
            }),
          },
          false,
        );
      }
      h.general.alert('success', {
        message: alertMessage,
      });
    }
  };

  return (
    <div className="container pos-rlt">
      <div
        className={'bookmark-wrapper ' + (!hasMedia ? 'no-media-property' : '')}
        style={{ background: customStyle?.bookmark?.background ?? '#f3f3f3' }}
      >
        <span
          style={{
            cursor: 'pointer',
            pointerEvents: 'none',
          }}
          onClick={() => {
            handleBookmark();
          }}
        >
          {is_bookmarked ? (
            <IconBookmarkActiveVector stroke={customStyle?.bookmark?.color} />
          ) : (
            <IconBookmarkInactiveVector stroke={customStyle?.bookmark?.color} />
          )}
        </span>
      </div>
    </div>
  );
}
