import React, { useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import CommonModalAttachment from '../Common/CommonModalAttachment';
import ShortlistedProjectCommentTextArea from './ShortlistedProjectCommentTextArea';
import { Badge } from 'react-bootstrap';
import { FacebookCounter, FacebookSelector } from '@charkour/react-reactions';
import ShortlistedProjectAttachmentCard from './ShortlistedProjectAttachmentCard';
import UserProfilePicture from '../User/UserProfilePicture';

export default function ShortlistedProjectComment(props) {
  const {
    comment = {},
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
    customStyle,
    translate,
  } = props;
  return (
    <div
      className="py-1"
      // style={{
      //   pointerEvents: shouldTrackActivity ? 'all' : 'none',
      //   cursor: shouldTrackActivity ? 'default' : 'not-allowed',
      // }}
    >
      <Comment
        contact={contact}
        comment={comment}
        handleModal={handleModal}
        showModal={showModal}
        currentModal={currentModal}
        project={project}
        contact_id={contact_id}
        shortlisted_project_id={shortlisted_project_id}
        setLoading={setLoading}
        reloadComments={reloadComments}
        replyToComment={comment}
        handleTracker={handleTracker}
        shouldTrackActivity={shouldTrackActivity}
        customStyle={customStyle}
        translate={translate}
        key={'parent-comment-' + shortlisted_project_id}
      />
      {comment &&
        comment.shortlisted_project_comment_reply &&
        comment.shortlisted_project_comment_reply.map((reply, i) => {
          return (
            <Comment
              contact={contact}
              comment={reply}
              handleModal={handleModal}
              showModal={showModal}
              currentModal={currentModal}
              isReply={true}
              project={project}
              contact_id={contact_id}
              shortlisted_project_id={shortlisted_project_id}
              setLoading={setLoading}
              reloadComments={reloadComments}
              replyToComment={comment}
              handleTracker={handleTracker}
              shouldTrackActivity={shouldTrackActivity}
              key={'reply-comment-' + i + '-' + shortlisted_project_id}
              customStyle={customStyle}
              translate={translate}
            />
          );
        })}
    </div>
  );
}

export function Comment(props) {
  const {
    comment = {},
    handleModal,
    showModal,
    currentModal,
    isReply = false,
    contact,
    project,
    contact_id,
    shortlisted_project_id,
    setLoading,
    reloadComments,
    handleTracker,
    shouldTrackActivity,
    customStyle,
    translate,
  } = props;

  const getProfilePictureUrl = (comment) => {
    if (comment.agency_user) {
      return comment.agency_user.user.profile_picture_url;
    } else if (comment.contact) {
      return comment.contact.profile_picture_url;
    }
    return null;
  };

  const getFirstName = (comment) => {
    if (comment.agency_user) {
      return comment.agency_user.user.first_name;
    } else if (comment.contact) {
      return comment.contact.first_name;
    }
    return null;
  };

  const getLastName = (comment) => {
    if (comment.agency_user) {
      return comment.agency_user.user.last_name;
    } else if (comment.contact) {
      return comment.contact.last_name;
    }
    return null;
  };

  const [isReplying, setIsReplying] = useState(false);

  return (
    <div
      key={comment.shortlisted_project_comment_id}
      className={`text-color3 pb-2`}
      style={{
        borderRadius: 10,
        // pointerEvents: shouldTrackActivity ? 'all' : 'none',
      }}
    >
      <div className="d-flex">
        {isReply ? (
          <div className="pr-2" style={{ visibility: 'hidden' }}>
            <UserProfilePicture
              src={getProfilePictureUrl(comment)}
              firstname={getFirstName(comment)}
              lastname={getLastName(comment)}
              alt={'Profile picture'}
            />
          </div>
        ) : null}
        <div className="pr-2">
          <UserProfilePicture
            src={getProfilePictureUrl(comment)}
            firstname={getFirstName(comment)}
            lastname={getLastName(comment)}
            alt={'Profile picture'}
          />
        </div>
        <div className="flex-fill" style={isReply ? { flex: '0 0 91%' } : {}}>
          <div
            className="comment-message py-sm-3"
            style={{
              background: customStyle?.message?.background
                ? customStyle?.message?.background
                : '#eff2f6',
            }}
          >
            <div>
              {h.isEmpty(comment.agency_user) &&
                h.notEmpty(comment.contact) &&
                h.notEmpty(h.user.formatFullName(comment.contact)) && (
                  <strong>{h.user.formatFullName(comment.contact)}</strong>
                )}
              {h.notEmpty(comment.agency_user) &&
                h.isEmpty(comment.contact) &&
                h.notEmpty(comment.agency_user.user) &&
                h.notEmpty(comment.agency_user.user.full_name) &&
                h.notEmpty(comment.agency_user.agency) &&
                h.notEmpty(comment.agency_user.agency.agency_name) && (
                  <span>
                    <strong>{comment.agency_user.user.full_name}</strong>&nbsp;
                    <Badge
                      className="bg-secondary text-white"
                      color="dark"
                      pill
                    >
                      {comment.agency_user.agency.agency_name}
                    </Badge>
                  </span>
                )}
            </div>
            <div
              className="mt-1 mt-sm-2 comment-message-content"
              style={{ overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
            >
              {comment.message}
            </div>
          </div>
          {h.notEmpty(comment.shortlisted_project_comment_attachments) && (
            <div
              className="py-1 d-flex flex-row"
              style={{ flexWrap: 'wrap', gap: '10px 10px' }}
            >
              {comment.shortlisted_project_comment_attachments.map(
                (attachment, i) => {
                  return (
                    <div key={i}>
                      <ShortlistedProjectAttachmentCard
                        attachment={attachment}
                        handleModal={handleModal}
                        handleTracker={handleTracker}
                        shouldTrackActivity={shouldTrackActivity}
                      />
                      {h.cmpBool(showModal, true) &&
                        h.cmpStr(
                          currentModal,
                          attachment.shortlisted_project_comment_attachment_id,
                        ) && (
                          <CommonModalAttachment
                            key={`modal-${attachment.shortlisted_project_comment_attachment_id}`}
                            attachment={attachment}
                            show={showModal}
                            handleModal={handleModal}
                            type="project"
                          />
                        )}
                    </div>
                  );
                },
              )}
            </div>
          )}
          <div className="d-flex align-items-center ml-3 mt-1">
            <div className="reaction-container">
              <a href="#" className="mr-1 reaction-link reaction-action">
                {h.translate.localize('like', translate)}
              </a>
              <div className="reaction-selector">
                <FacebookSelector
                  onSelect={async (emoji) => {
                    const apiRes =
                      await api.shortlistedProjectCommentReaction.create(
                        {
                          shortlisted_project_comment_id:
                            comment.shortlisted_project_comment_id,
                          contact_fk: contact.contact_id,
                          emoji,
                        },
                        false,
                      );
                    if (h.cmpStr(apiRes.status, 'ok')) {
                      if (reloadComments)
                        reloadComments(comment.shortlisted_project_fk);
                    }
                  }}
                />
              </div>
            </div>
            {!isReply && (
              <a
                style={{ cursor: 'pointer' }}
                className="mr-1 reaction-action"
                onClick={() => {
                  setIsReplying(true);
                }}
              >
                {h.translate.localize('reply', translate)}
              </a>
            )}
            <small className="text-color5 time-ago">
              {h.date.timeSince(new Date(comment.comment_date_raw))} ago
            </small>
            {h.notEmpty(comment) &&
              h.notEmpty(comment.shortlisted_project_comment_reactions) && (
                <FacebookCounter
                  user={h.user.formatFullName(contact)}
                  counters={comment.shortlisted_project_comment_reactions.map(
                    (reaction) => {
                      return {
                        emoji: reaction.emoji,
                        by:
                          h.user.formatFullName(contact) ||
                          comment.agency_user?.user?.full_name ||
                          '',
                      };
                    },
                  )}
                />
              )}
          </div>

          {/* TextArea for replying to an existing comment */}
          {h.cmpBool(isReplying, true) && (
            <ShortlistedProjectCommentTextArea
              project={project}
              contact_id={contact_id}
              shortlisted_project_id={shortlisted_project_id}
              setLoading={setLoading}
              reloadComments={reloadComments}
              replyToComment={comment}
              setIsReplying={setIsReplying}
              customStyle={customStyle}
              translate={translate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
