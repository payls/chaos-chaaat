import React, { useState } from 'react';
import { h } from '../../../helpers';
import { api } from '../../../api';
import CommonModalAttachment from '../../Common/CommonModalAttachment';
import ShortlistedPropertyCommentTextArea from './ShortlistedPropertyCommentTextArea';
import { Badge } from 'react-bootstrap';
import { FacebookCounter, FacebookSelector } from '@charkour/react-reactions';
import ShortlistedPropertyAttachmentCard from './ShortlistedPropertyAttachmentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import CommonTooltip from '../../Common/CommonTooltip';
import UserProfilePicture from '../../UserProfile/UserProfilePicture';

export default function ShortlistedPropertyComment(props) {
  const {
    comment = {},
    handleModal,
    showModal,
    currentModal,
    project,
    shortlisted_property_id,
    setLoading,
    reloadComments,
  } = props;

  return (
    <div className="py-1">
      <Comment
        comment={comment}
        handleModal={handleModal}
        showModal={showModal}
        currentModal={currentModal}
        project={project}
        shortlisted_property_id={shortlisted_property_id}
        setLoading={setLoading}
        reloadComments={reloadComments}
        replyToComment={comment}
      />
      {comment &&
        comment.shortlisted_property_comment_reply &&
        comment.shortlisted_property_comment_reply.map((reply, i) => {
          return (
            <Comment
              key={i}
              comment={reply}
              handleModal={handleModal}
              showModal={showModal}
              currentModal={currentModal}
              isReply={true}
              project={project}
              shortlisted_property_id={shortlisted_property_id}
              setLoading={setLoading}
              reloadComments={reloadComments}
              replyToComment={comment}
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
    shortlisted_property_id,
    setLoading,
    reloadComments,
    handleTracker,
  } = props;

  const [isReplying, setIsReplying] = useState(false);

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

  return (
    <div
      key={comment.shortlisted_property_comment_id}
      className={`text-color3 pb-2 ${isReply ? 'ml-5' : 'w-100'}`}
      style={{
        borderRadius: 10,
      }}
    >
      <div className="row no-gutters">
        <div className="col-3 col-sm-2 col-md-1 d-flex justify-content-end px-2">
          <UserProfilePicture
            height={40}
            width={40}
            src={getProfilePictureUrl(comment)}
            firstname={getFirstName(comment)}
            lastname={getLastName(comment)}
            alt={'Profile picture'}
          />
        </div>
        <div
          className="col-9 col-sm-10 col-md-11"
          style={isReply ? { flex: '0 0 91%' } : {}}
        >
          <div className="comment-message">
            <div>
              {h.isEmpty(comment.agency_user) &&
                h.notEmpty(comment.contact) &&
                h.notEmpty(comment.contact.first_name) && (
                  <strong>{comment.contact.first_name}</strong>
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
            <div className="mt-1" style={{ overflowWrap: 'break-word' }}>
              {comment.message}
            </div>
            {!isReply && (
              <CommonTooltip tooltipText="Delete comment">
                <div className="comment-delete-button">
                  <div
                    className=""
                    onClick={async () => {
                      h.general.prompt(
                        {
                          message:
                            'Are you sure you want to delete this comment thread?',
                        },
                        async (status) => {
                          if (status) {
                            setLoading(true);
                            await api.shortlistedPropertyComment.deleteComment({
                              shortlisted_property_comment_id:
                                comment.shortlisted_property_comment_id,
                            });
                            if (reloadComments)
                              reloadComments(comment.shortlisted_property_fk);
                            setLoading(false);
                          }
                        },
                      );
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <FontAwesomeIcon
                      className="table-icon-delete"
                      icon={faTrashAlt}
                    />
                  </div>
                </div>
              </CommonTooltip>
            )}
          </div>
          {h.notEmpty(comment.shortlisted_property_comment_attachments) && (
            <div
              className="py-1 d-flex flex-row"
              style={{ flexWrap: 'wrap', gap: '10px 10px' }}
            >
              {comment.shortlisted_property_comment_attachments.map(
                (attachment) => {
                  return (
                    <>
                      <ShortlistedPropertyAttachmentCard
                        attachment={attachment}
                        handleModal={handleModal}
                        handleTracker={handleTracker}
                      />
                      {h.cmpBool(showModal, true) &&
                        h.cmpStr(
                          currentModal,
                          attachment.shortlisted_property_comment_attachment_id,
                        ) && (
                          <CommonModalAttachment
                            key={`modal-${attachment.shortlisted_property_comment_attachment_id}`}
                            attachment={attachment}
                            show={showModal}
                            handleModal={handleModal}
                          />
                        )}
                    </>
                  );
                },
              )}
            </div>
          )}
          <div
            className="d-flex align-items-center ml-3 mt-1"
            style={{ pointerEvents: 'none' }}
          >
            <div className="reaction-container">
              <a href="#" className="mr-1 reaction-link">
                Like
              </a>
              <div className="reaction-selector">
                <FacebookSelector
                  onSelect={async (emoji) => {
                    const apiRes =
                      await api.shortlistedPropertyCommentReaction.create(
                        {
                          shortlisted_property_comment_id:
                            comment.shortlisted_property_comment_id,
                          contact_fk: contact.contact_id,
                          emoji,
                        },
                        false,
                      );
                    if (h.cmpStr(apiRes.status, 'ok')) {
                      if (reloadComments)
                        reloadComments(comment.shortlisted_property_fk);
                    }
                  }}
                />
              </div>
            </div>
            {!isReply && <span className="mr-1">·</span>}
            {!isReply && (
              <a
                style={{ cursor: 'pointer' }}
                className="mr-1"
                onClick={() => {
                  setIsReplying(true);
                }}
              >
                Reply
              </a>
            )}
            <span className="mr-1">·</span>
            <small className="text-color5 mt-1 mr-2">
              {h.date.timeSince(new Date(comment.comment_date_raw))} ago
            </small>
            {h.notEmpty(comment) &&
              h.notEmpty(comment.shortlisted_property_comment_reactions) && (
                <FacebookCounter
                  user={h.user.formatFullName(contact)}
                  counters={comment.shortlisted_property_comment_reactions.map(
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
            <ShortlistedPropertyCommentTextArea
              shortlisted_property_id={shortlisted_property_id}
              setLoading={setLoading}
              reloadComments={reloadComments}
            />
          )}
        </div>
      </div>
    </div>
  );
}
