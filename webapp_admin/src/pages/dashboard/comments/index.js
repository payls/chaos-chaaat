import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import IconContact from '../../../components/Icons/IconContact';
import CommentItem from '../../../components/Comment/CommentItem';
import { api } from '../../../api';
import ReplyToCommentModal from '../../../components/Comment/ReplyToCommentModal';
import { routes } from '../../../configs/routes';
import CommonTooltip from '../../../components/Common/CommonTooltip';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';

export default function DashboardComments() {
  const router = useRouter();

  const [isLoading, setLoading] = useState();
  // const [shouldReload, setShouldReload] = useState(false);
  const [selectedComment, setSelectedComment] = useState();
  const [agency, setAgency] = useState(null);

  const [comments, setComments] = useState([]);
  const [childContactParentAgentComments, setChildContactParentAgentComments] =
    useState([]);

  const [showReplyToCommentModal, setShowReplyToCommentModal] = useState(false);

  const currentPage = useRef(0);
  const pageSize = 100;
  const currentCount = useRef(0);
  const totalCount = useRef(null);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      setLoading(true);
      await getComments();
      setLoading(false);

      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgency(apiRes.data?.agencyUser);
      }
    })();
  }, []);

  useEffect(() => {
    const detectBottomPage = async () => {
      if (
        Math.abs(
          document.body.scrollHeight - window.innerHeight - window.scrollY,
        ) < 1 &&
        (totalCount.current === null ||
          currentCount.current < totalCount.current)
      ) {
        document.removeEventListener('scroll', detectBottomPage);
        setLoading(true);
        currentPage.current++;

        const apiRes = await api.shortlistedPropertyComment.getComments(
          { pagination: { pageSize, pageIndex: currentPage.current } },
          { getReply: true, hasContact: true },
          false,
        );

        if (h.cmpStr(apiRes.status, 'ok')) {
          const commentRecords = apiRes.data.shortlisted_property_comments;
          currentCount.current += commentRecords.length;

          const { comments: newComments, agentContactComments } =
            filterComments(commentRecords);

          // concatenating into existing comments array
          setChildContactParentAgentComments((prevComments) => {
            const concatComments = prevComments.concat([
              ...agentContactComments,
            ]);
            return concatComments;
          });
          setComments((prevComments) => {
            const concatComments = prevComments.concat([...commentRecords]);
            return concatComments;
          });

          setLoading(false);
        } else {
          // api request failed, re-adding event listener
          document.addEventListener('scroll', detectBottomPage);
          h.general.alert('error', { message: 'Failed to load comments' });
        }
      }
    };
    // register eventListener on each state update
    document.addEventListener('scroll', detectBottomPage);

    return () => {
      // unregister eventListener
      document.removeEventListener('scroll', detectBottomPage);
    };
  }, [comments]);

  const getComments = async () => {
    const apiRes = await api.shortlistedPropertyComment.getComments(
      { pagination: { pageSize, pageIndex: 0 } },
      { getReply: true, hasContact: true },
      false,
    );
    currentPage.current = 0;

    if (h.cmpStr(apiRes.status, 'ok')) {
      totalCount.current = apiRes.data.metadata.totalCount;
      const commentRecords = apiRes.data.shortlisted_property_comments;
      currentCount.current = commentRecords.length;

      const { comments: newComments, agentContactComments } =
        filterComments(commentRecords);

      setChildContactParentAgentComments(agentContactComments);
      setComments(commentRecords);
    }
  };

  const filterComments = (commentRecords) => {
    // comments that have a contact associated with it.
    const contactComments = commentRecords.filter((comment) => comment.contact);

    // comments that have agents associated with it.
    const agentComments = commentRecords.filter(
      (comment) =>
        h.isEmpty(comment.contact) && h.notEmpty(comment.agency_user),
    );

    // comments that are made by agents and are parent to comments made by contacts
    const agentContactComments = agentComments.filter((comment) =>
      contactComments
        .map((contactComment) => contactComment.parent_comment_fk)
        .includes(comment.shortlisted_property_comment_id),
    );

    return {
      comments: commentRecords.filter((comment) => h.notEmpty(comment.contact)),
      agentContactComments,
    };
  };

  // Gets parent comment of another comment
  // returns null if no parent comment
  const getParentComment = async (selectedComment) => {
    let parentComment = comments.find(
      (comment) =>
        comment.shortlisted_property_comment_id ===
        selectedComment.parent_comment_fk,
    );
    if (parentComment === undefined) {
      parentComment = childContactParentAgentComments.find(
        (comment) =>
          comment.shortlisted_property_comment_id ===
          selectedComment.parent_comment_fk,
      );
      if (parentComment !== undefined)
        parentComment.contact = selectedComment.contact;
    }
    // request for parent comment when it cannot be found
    if (parentComment === undefined) {
      const apiRes = await api.shortlistedPropertyComment.getCommentByCommentId(
        { comment_id: selectedComment.parent_comment_fk },
        false,
      );
      parentComment = apiRes.data.shortlisted_property_comment;
    }
    return parentComment;
  };

  return (
    <>
      {showReplyToCommentModal && (
        <ReplyToCommentModal
          contact={selectedComment.contact}
          selectedComment={selectedComment}
          setLoading={setLoading}
          reloadComment={getComments}
          onCloseModal={async () => {
            setShowReplyToCommentModal(!showReplyToCommentModal);
            await getComments();
            // setShouldReload(true);
          }}
        />
      )}
      <div id="messaging-root">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading} className="messaging-wrapper">
          <div className="messaging-container modern-style">
            <div
              className="message-navigation"
              style={{ height: '100% !important' }}
            >
              <div
                className=""
                onClick={() => router.push(routes.dashboard.messaging)}
              >
                <CommonTooltip
                  tooltipText={'WhatsApp Shared Inbox'}
                  placement={'right'}
                >
                  <IconWhatsApp width="30" color={'#fff'} />
                </CommonTooltip>
              </div>
              <div onClick={() => router.push(routes.dashboard.sms)}>
                <CommonTooltip
                  tooltipText={'SMS Shared Inbox'}
                  placement={'right'}
                >
                  <IconSMS width="30" color={'#fff'} />
                </CommonTooltip>
              </div>
              <div
                onClick={() => router.push(routes.dashboard.comments)}
                className="active"
              >
                <CommonTooltip tooltipText={'Comments'} placement={'right'}>
                  <IconComments width="30" color={'#fff'} />
                </CommonTooltip>
              </div>
            </div>
            <div
              className="message-body"
              style={{ width: '100%', padding: '10px', overflow: 'auto' }}
            >
              <div className="">
                <div className="pl-3 pr-3 pb-2">
                  <div className="d-flex justify-content-between">
                    <h1
                      style={{
                        fontFamily: 'PoppinsRegular',
                        textIndent: '-15px',
                        lineHeight: '55px',
                        fontSize: '20px',
                      }}
                    >
                      Comments
                    </h1>
                  </div>
                  <div className="row">
                    {h.notEmpty(comments) ? (
                      <div className="tab-body">
                        {comments.map((comment) => {
                          return (
                            <CommentItem
                              key={comment.shortlisted_property_comment_id}
                              comment={comment}
                              user_name={h.user.formatFullName(comment.contact)}
                              text={comment.message}
                              date={h.date.timeSince(
                                new Date(comment.comment_date_raw),
                              )}
                              onCommentClick={async () => {
                                if (h.notEmpty(comment.parent_comment_fk)) {
                                  const parentComment = await getParentComment(
                                    comment,
                                  );
                                  if (parentComment && parentComment.contact) {
                                    setSelectedComment(parentComment);
                                  } else {
                                    setSelectedComment(comment);
                                  }
                                } else {
                                  setSelectedComment(comment);
                                }
                                setShowReplyToCommentModal(true);
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="d-flex w-100 align-items-center justify-content-center">
                        <img
                          style={{ width: '65%' }}
                          width="100%"
                          src="https://cdn.yourpave.com/assets/empty-data-2x.png"
                          alt={'profile picture'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
