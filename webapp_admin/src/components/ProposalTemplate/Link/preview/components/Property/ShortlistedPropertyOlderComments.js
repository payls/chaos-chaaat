import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import ShortlistedPropertyComment from './ShortlistedPropertyComment';

export default function ShortlistedPropertyOlderComments(props) {
  const {
    hideOldCommentsInit = true,
    comments = [],
    handleModal,
    showModal,
    currentModal,
    contact,
    project,
    contact_id,
    shortlisted_property_id,
    setLoading,
    reloadComments,
    handleTracker,
    shouldTrackActivity,
    translate,
  } = props;

  const [hideComments, setHideComments] = useState(true);

  useEffect(() => {
    setHideComments(hideOldCommentsInit);
  }, [hideOldCommentsInit]);

  return (
    <div style={{ width: '100%' }}>
      <div
        className="mt-4 older-comments-container"
        style={{
          display: hideComments ? 'none' : 'block',
        }}
      >
        {h.notEmpty(comments) &&
          comments.map((comment) => {
            return h.isEmpty(comment.message) ? null : (
              <ShortlistedPropertyComment
                comment={comment}
                handleModal={handleModal}
                showModal={showModal}
                currentModal={currentModal}
                contact={contact}
                project={project}
                contact_id={contact_id}
                shortlisted_property_id={shortlisted_property_id}
                setLoading={setLoading}
                reloadComments={reloadComments}
                handleTracker={handleTracker}
                shouldTrackActivity={shouldTrackActivity}
                translate={translate}
              />
            );
          })}
      </div>
    </div>
  );
}
