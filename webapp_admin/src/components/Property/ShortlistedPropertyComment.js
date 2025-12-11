import React from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import CommonModalAttachment from '../Common/CommonModalAttachment';
import { Badge } from 'react-bootstrap';
import { FacebookCounter, FacebookSelector } from '@charkour/react-reactions';

export default function ShortlistedPropertyComment(props) {
  const {
    comment = {},
    handleModal,
    showModal,
    currentModal,
    setReplyToComment,
    scrollToAnchor,
    reloadComments,
    contactId,
    contact,
  } = props;
  return (
    <div className="py-1">
      <Comment
        contact={contact}
        contactId={contactId}
        comment={comment}
        handleModal={handleModal}
        showModal={showModal}
        currentModal={currentModal}
        setReplyToComment={setReplyToComment}
        scrollToAnchor={scrollToAnchor}
        reloadComments={reloadComments}
      />
      {comment &&
        comment.shortlisted_property_comment_reply &&
        comment.shortlisted_property_comment_reply.map((reply) => {
          return (
            <Comment
              contact={contact}
              contactId={contactId}
              comment={reply}
              handleModal={handleModal}
              showModal={showModal}
              currentModal={currentModal}
              isReply={true}
              reloadComments={reloadComments}
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
    setReplyToComment,
    scrollToAnchor,
    reloadComments,
    contactId,
    contact,
  } = props;
  return (
    <div
      key={comment.shortlisted_property_comment_id}
      className={`text-color3 pb-2 ${isReply ? 'ml-5' : 'w-100'}`}
      style={{ borderRadius: 10, width: isReply ? '96%' : 'inherit' }}
    >
      <div className="row no-gutters">
        {h.notEmpty(comment.agency_user_fk) && h.isEmpty(comment.contact_fk) && (
          <div className="col-3 col-sm-2 col-md-1 text-center text-sm-right px-2">
            <img
              className="rounded-circle"
              style={{ width: 40 }}
              src={
                comment.agency_user?.user?.profile_picture_url
                  ? comment.agency_user.user.profile_picture_url
                  : 'https://cdn.yourpave.com/assets/profile_picture_placeholder.png'
              }
            />
          </div>
        )}
        <div className="col-9 col-sm-10 col-md-11">
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
            <div style={{ overflowWrap: 'break-word' }}>{comment.message}</div>
          </div>
          {h.notEmpty(comment.shortlisted_property_comment_attachments) && (
            <div className="py-1">
              {comment.shortlisted_property_comment_attachments.map(
                (attachment) => {
                  return (
                    <>
                      <img
                        key={
                          attachment.shortlisted_property_comment_attachment_id
                        }
                        className="mr-1"
                        src={attachment.attachment_url}
                        alt={attachment.attachment_title}
                        onClick={(e) => {
                          handleModal(e, attachment);
                        }}
                        style={{ height: 100, cursor: 'pointer' }}
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
          <div className="d-flex align-items-center">
            <div className="reaction-container">
              <a href="#" className="mr-2 reaction-link">
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
            {!isReply && (
              <a
                style={{ cursor: 'pointer' }}
                className="mr-2"
                onClick={() => {
                  setReplyToComment(comment);
                  if (scrollToAnchor) {
                    const commentBox = document.getElementById(scrollToAnchor);
                    if (commentBox) {
                      const yOffset = -10;
                      const y =
                        commentBox.getBoundingClientRect().top +
                        window.pageYOffset +
                        yOffset;
                      commentBox.scrollIntoView({ top: y, behavior: 'smooth' });
                    }
                  }
                }}
              >
                Reply
              </a>
            )}
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
        </div>
      </div>
    </div>
  );
}
