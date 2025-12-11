import React from 'react';
import { h } from '../../helpers';
import { Badge } from 'react-bootstrap';

export default function CommentItem(props) {
  return (
    <div className="comment-item">
      <Comment {...props} onCommentClick={props.onCommentClick} />
      {/*{props.comment && props.comment.shortlisted_property_comment_reply && props.comment.shortlisted_property_comment_reply.map(comment => (*/}
      {/*		<ReplyComment user_name={h.user.formatFullName(comment.contact)} text={comment.message} date={h.date.timeSince(new Date(comment.comment_date_raw))} />*/}
      {/*))}*/}
    </div>
  );
}

function Comment(props) {
  const { comment, text, date, onCommentClick } = props;

  return (
    <div
      className="comment-item-container w-100"
      onClick={onCommentClick}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ minWidth: 70, maxWidth: 70 }}>
        {h.isEmpty(comment.agency_user) &&
          h.notEmpty(comment.contact) &&
          h.notEmpty(comment.contact.first_name) && (
            <strong>{comment.contact.first_name}</strong>
          )}
      </div>
      <div className="comment-item-text-container">
        <span>{h.general.renderLink(text)}</span>
        <br />
        <span>
          {h.notEmpty(comment) &&
            h.notEmpty(comment.shortlisted_property) &&
            h.notEmpty(comment.shortlisted_property.project_property) &&
            h.notEmpty(
              comment.shortlisted_property.project_property.project,
            ) && (
              <small className="text-muted">
                {comment.shortlisted_property.project_property.project.name}
                &nbsp;|&nbsp;
                {comment.shortlisted_property.project_property.unit_number &&
                  '#' +
                    comment.shortlisted_property.project_property.unit_number +
                    ' | '}
                {
                  comment.shortlisted_property.project_property
                    .number_of_bedroom
                }{' '}
                bedrooms &nbsp;|&nbsp;
                {
                  comment.shortlisted_property.project_property
                    .number_of_bathroom
                }{' '}
                bathrooms &nbsp;|&nbsp;
                {comment.shortlisted_property.project_property.starting_price &&
                  comment.shortlisted_property.project_property.project
                    .currency_code +
                    ' ' +
                    h.currency.format(
                      parseInt(
                        comment.shortlisted_property.project_property
                          .starting_price,
                      ),
                      0,
                    )}
              </small>
            )}
        </span>
      </div>
      <div>
        <span className="">{date}</span>
      </div>
    </div>
  );
}

function ReplyComment(props) {
  const { user_name, text, date } = props;

  return (
    <div className="comment-item-reply-container">
      <div className="comment-item-reply-content">
        <span className="user-name">{user_name}</span>
        <span>{h.general.renderLink(text)}</span>
      </div>
      <div>
        <span className="date">{date}</span>
      </div>
    </div>
  );
}
