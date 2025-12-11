import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import ShortlistedProjectComment from './ShortlistedProjectComment';

export default function ShortlistedProjectOlderComments(props) {
  const {
    hideOldCommentsInit = true,
    comments = [],
    handleModal,
    showModal,
    currentModal,
    contact,
    project,
    contact_id,
    shortlisted_project_id,
    setLoading,
    reloadComments,
    handleTracker,
    shouldTrackActivity,
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
          comments.map((comment, i) => {
            return h.isEmpty(comment.message) ? null : (
              <ShortlistedProjectComment
                key={i}
                comment={comment}
                handleModal={handleModal}
                showModal={showModal}
                currentModal={currentModal}
                contact={contact}
                project={project}
                contact_id={contact_id}
                shortlisted_project_id={shortlisted_project_id}
                setLoading={setLoading}
                reloadComments={reloadComments}
                handleTracker={handleTracker}
                shouldTrackActivity={shouldTrackActivity}
              />
            );
          })}
      </div>
    </div>
  );
}
