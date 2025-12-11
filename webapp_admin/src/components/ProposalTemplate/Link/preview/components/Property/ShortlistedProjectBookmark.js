import React from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconBookmarkActiveVector from '../Icons/IconBookmarkActiveVector';
import IconBookmarkInactiveVector from '../Icons/IconBookmarkInactiveVector';

export default function ShortlistedProjectBookmark(props) {
  const {
    shortlisted_project_id,
    is_bookmarked,
    reloadShortlistedProjects,
    hasMedia = true,
    customStyle,
  } = props;

  const handleBookmark = async () => {
    const apiRes =
      await api.shortlistedProject.updateShortlistedProjectBookmark(
        { shortlisted_project_id },
        false,
      );
    if (h.cmpStr(apiRes.status, 'ok')) {
      reloadShortlistedProjects();
      // TODO: Tracking for project-level bookmarking
      // let activity_type;
      let alertMessage;
      if (apiRes.data.is_bookmarked) {
        // activity_type = constant.CONTACT.ACTIVITY.TYPE.PROPERTY_BOOKMARKED;
        alertMessage = 'Project successfully bookmarked';
      } else {
        // activity_type = constant.CONTACT.ACTIVITY.TYPE.PROPERTY_UNBOOKMARKED;
        alertMessage = 'Removed bookmark successfully';
      }

      h.general.alert('success', {
        message: alertMessage,
      });
    }
  };

  return (
    <div className="container pos-rlt">
      <div
        className={'bookmark-wrapper ' + (!hasMedia ? 'no-media' : '')}
        style={{ background: customStyle?.bookmark?.background ?? '#f3f3f3' }}
      >
        <span
          style={{
            cursor: 'pointer',
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
