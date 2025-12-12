import React, { useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { api as api_admin } from '../../../../../../api';
import CommonModalAttachment from '../Common/CommonModalAttachment';
import ShortlistedPropertyCommentTextArea from './ShortlistedPropertyCommentTextArea';
import { Badge } from 'react-bootstrap';
import { FacebookCounter, FacebookSelector } from '@charkour/react-reactions';
import ShortlistedPropertyAttachmentCard from './ShortlistedPropertyAttachmentCard';
import UserProfilePicture from '../User/UserProfilePicture';
import CommonTooltip from '../../../../../Common/CommonTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

export default function ShortlistedPropertyComment(props) {
  const {
    comment = {},
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
    customStyle,
    translate,
  } = props;
  return (
    <div
      className="py-1"
      style={
        {
          // pointerEvents: shouldTrackActivity ? 'all' : 'none',
          // cursor: shouldTrackActivity ? 'default' : 'not-allowed',
        }
      }
    >
      <Comment
        contact={contact}
        comment={comment}
        handleModal={handleModal}
        showModal={showModal}
        currentModal={currentModal}
        project={project}
        contact_id={contact_id}
        shortlisted_property_id={shortlisted_property_id}
        setLoading={setLoading}
        reloadComments={reloadComments}
        replyToComment={comment}
        handleTracker={handleTracker}
        shouldTrackActivity={shouldTrackActivity}
        customStyle={customStyle}
        translate={translate}
      />
      {comment &&
        comment.shortlisted_property_comment_reply &&
        comment.shortlisted_property_comment_reply.map((reply, i) => {
          return (
            <Comment
              key={i}
              contact={contact}
              comment={reply}
              handleModal={handleModal}
              showModal={showModal}
              currentModal={currentModal}
              isReply={true}
              project={project}
              contact_id={contact_id}
              shortlisted_property_id={shortlisted_property_id}
              setLoading={setLoading}
              reloadComments={reloadComments}
              replyToComment={comment}
              handleTracker={handleTracker}
              shouldTrackActivity={shouldTrackActivity}
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
    shortlisted_property_id,
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
      key={comment.shortlisted_property_comment_id}
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
            {!isReply && (
              <CommonTooltip tooltipText="Delete comment">
                <div className="float-right" style={{ marginTop: '-4vw' }}>
                  <div
                    className="m-2"
                    onClick={async () => {
                      h.general.prompt(
                        {
                          message:
                            'Are you sure you want to delete this comment thread?',
                        },
                        async (status) => {
                          if (status) {
                            setLoading(true);
                            await api_admin.shortlistedPropertyComment.deleteComment(
                              {
                                shortlisted_property_comment_id:
                                  comment.shortlisted_property_comment_id,
                              },
                            );
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
                (attachment, i) => {
                  return (
                    <>
                      <ShortlistedPropertyAttachmentCard
                        key={i}
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
                            attachment={{
                              attachment_url: attachment.attachment_url,
                            }}
                            show={true}
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
              <a href="#" className="mr-1 reaction-link reaction-action">
                {h.translate.localize('like', translate)}
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
                className="mr-1 reaction-action"
                onClick={() => {
                  setIsReplying(true);
                }}
              >
                {h.translate.localize('reply', translate)}
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
              project={project}
              contact_id={contact_id}
              shortlisted_property_id={shortlisted_property_id}
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
