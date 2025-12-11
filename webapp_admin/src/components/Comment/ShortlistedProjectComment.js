// import React, { useEffect, useState } from 'react';
// import { h } from '../../helpers';
// import { api } from '../../api';
// import CommonModalAttachment from '../Common/CommonModalAttachment';
// import { Badge } from 'react-bootstrap';
// import { FacebookCounter, FacebookSelector } from '@charkour/react-reactions';
// import { config } from '../../configs/config';
// import ShortlistedProjectAttachmentCard from '../Project/ShortlistedProjectAttachmentCard';
// import UserProfilePicture from '../UserProfile/UserProfilePicture';

// export default function ShortlistedProjectComment(props) {
//   const {
//     comment = {},
//     handleModal,
//     showModal,
//     currentModal,
//     setReplyToComment,
//     scrollToAnchor,
//     reloadComments,
//     contactId,
//     contact,
//     reactionShow = true,
//   } = props;
//   const [commentState, setCommentState] = useState(comment);
//   const [agency, setAgency] = useState();

//   useEffect(() => {
//     (async () => {
//       setAgency(
//         (await api.agencyUser.getCurrentUserAgency({}, false)).data.agencyUser
//           .agency,
//       );
//     })();
//   }, []);
//   useEffect(() => {
//     (async () => {
//       await getCommentByCommentId(comment.shortlisted_project_comment_id);
//     })();
//   }, [comment]);

//   const getCommentByCommentId = async (comment_id) => {
//     const apiRes = await api.shortlistedProjectComment.getCommentByCommentId(
//       { comment_id },
//       false,
//     );
//     if (h.cmpStr(apiRes.status, 'ok')) {
//       const commentId =
//         apiRes.data.shortlisted_project_comment.shortlisted_project_comment_id;
//       // comment returned is child comment
//       if (commentId !== commentState.shortlisted_project_comment_id) {
//         setCommentState((prevCommentState) => {
//           const newCommentState = { ...prevCommentState };
//           newCommentState.shortlisted_project_comment_reply =
//             prevCommentState.shortlisted_project_comment_reply.map(
//               (childComment) => {
//                 if (childComment.shortlisted_project_comment_id === commentId) {
//                   return apiRes.data.shortlisted_project_comment;
//                 }
//                 return childComment;
//               },
//             );
//           return newCommentState;
//         });
//         // comment returned is parent comment
//       } else setCommentState(apiRes.data.shortlisted_project_comment);
//     }
//   };

//   return h.notEmpty(commentState) ? (
//     <div className="py-1">
//       <div className="mb-3 p-2 border">
//         <div className="row">
//           <div className="col-2 small-sc-title">Contact</div>
//           <div className="col-10 small-sc-desc">
//             <small className="text-muted">
//               <span className="contact-email">
//                 {h.user.formatFullName(contact)}
//               </span>
//               {contact && contact.email && (
//                 <a href={`mailto:${contact.email}`}>
//                   &nbsp;|&nbsp;{contact.email}
//                 </a>
//               )}
//               {contact && contact.mobile_number && (
//                 <a href={`tel:${contact.mobile_number}`}>
//                   &nbsp;|&nbsp;{contact.mobile_number}
//                 </a>
//               )}
//               &nbsp;|&nbsp;
//               <a
//                 href={
//                   h.notEmpty(agency)
//                     ? h.route.createSubdomainUrl(
//                         agency.agency_subdomain,
//                         `${config.webUrl}/preview?permalink=${contact.permalink}`,
//                       )
//                     : ''
//                 }
//                 target="_blank"
//               >
//                 View Buyer Page
//               </a>
//             </small>
//           </div>
//         </div>
//         <div className="row">
//           <div className="col-2 small-sc-title">Project</div>
//           <div className="col-10 small-sc-desc">
//             {h.notEmpty(comment) && h.notEmpty(comment.shortlisted_project) && (
//               <small className="text-muted">
//                 {comment.shortlisted_project.project.name}
//               </small>
//             )}
//           </div>
//         </div>
//       </div>
//       <p>Comment</p>
//       <Comment
//         contact={contact}
//         contactId={contactId}
//         comment={commentState}
//         handleModal={handleModal}
//         showModal={showModal}
//         currentModal={currentModal}
//         setReplyToComment={setReplyToComment}
//         scrollToAnchor={scrollToAnchor}
//         reloadComments={reloadComments}
//         getCommentByCommentId={getCommentByCommentId}
//         reactionShow={reactionShow}
//         key={comment.shortlisted_project_comment_id}
//       />
//       {commentState &&
//         commentState.shortlisted_project_comment_reply &&
//         commentState.shortlisted_project_comment_reply.map((reply, i) => {
//           return (
//             <Comment
//               key={
//                 reply.shortlisted_project_comment_id +
//                 '-project-comment-reply' +
//                 i
//               }
//               contact={contact}
//               contactId={contactId}
//               comment={reply}
//               handleModal={handleModal}
//               showModal={showModal}
//               currentModal={currentModal}
//               isReply={true}
//               reloadComments={reloadComments}
//               getCommentByCommentId={getCommentByCommentId}
//               reactionShow={reactionShow}
//             />
//           );
//         })}
//     </div>
//   ) : (
//     'Loading comment'
//   );
// }

// export function Comment(props) {
//   const {
//     comment = {},
//     handleModal,
//     showModal,
//     currentModal,
//     isReply = false,
//     reloadComments,
//     contact,
//     getCommentByCommentId,
//     reactionShow = true,
//   } = props;

//   const getProfilePictureUrl = (comment) => {
//     if (comment.agency_user) {
//       return comment.agency_user.user.profile_picture_url;
//     } else if (comment.contact) {
//       return comment.contact.profile_picture_url;
//     }
//     return null;
//   };

//   const getFirstName = (comment) => {
//     if (comment.agency_user) {
//       return comment.agency_user.user.first_name;
//     } else if (comment.contact) {
//       return comment.contact.first_name;
//     }
//     return null;
//   };

//   const getLastName = (comment) => {
//     if (comment.agency_user) {
//       return comment.agency_user.user.last_name;
//     } else if (comment.contact) {
//       return comment.contact.last_name;
//     }
//     return null;
//   };

//   return (
//     <div
//       key={comment.shortlisted_project_comment_id + '-comment-body'}
//       className={`text-color3 pb-2 ${isReply ? 'ml-5 comment-sc' : 'w-100'}`}
//       style={{ borderRadius: 10, width: isReply ? '96%' : 'inherit' }}
//     >
//       <div className="row no-gutters">
//         <div className="col-3 col-sm-2 col-md-1 d-flex justify-content-end pr-2">
//           <UserProfilePicture
//             height={40}
//             width={40}
//             src={getProfilePictureUrl(comment)}
//             firstname={getFirstName(comment)}
//             lastname={getLastName(comment)}
//             alt={'Profile picture'}
//           />
//         </div>
//         <div className="col-9 col-sm-10 col-md-11">
//           <div className="comment-message">
//             <div>
//               {h.isEmpty(comment.agency_user) &&
//                 h.notEmpty(comment.contact) &&
//                 h.notEmpty(comment.contact.first_name) && (
//                   <strong>{comment.contact.first_name}</strong>
//                 )}
//               {h.notEmpty(comment.agency_user) &&
//                 h.isEmpty(comment.contact) &&
//                 h.notEmpty(comment.agency_user.user) &&
//                 h.notEmpty(comment.agency_user.user.full_name) &&
//                 h.notEmpty(comment.agency_user.agency) &&
//                 h.notEmpty(comment.agency_user.agency.agency_name) && (
//                   <span>
//                     <strong>{comment.agency_user.user.full_name}</strong>&nbsp;
//                     <Badge
//                       className="bg-secondary text-white"
//                       color="dark"
//                       pill
//                     >
//                       {comment.agency_user.agency.agency_name}
//                     </Badge>
//                   </span>
//                 )}
//             </div>
//             <div style={{ overflowWrap: 'break-word' }}>{comment.message}</div>
//           </div>
//           {h.notEmpty(comment.shortlisted_project_comment_attachments) && (
//             <div
//               className="py-1 d-flex flex-row flex-wrap"
//               style={{ gap: '10px 10px' }}
//             >
//               {comment.shortlisted_project_comment_attachments.map(
//                 (attachment, i) => {
//                   return (
//                     <div
//                       key={
//                         attachment.shortlisted_project_comment_attachment_id +
//                         `-` +
//                         i
//                       }
//                     >
//                       <ShortlistedProjectAttachmentCard
//                         attachment={attachment}
//                         handleModal={handleModal}
//                       />
//                       {h.cmpBool(showModal, true) &&
//                         h.cmpStr(
//                           currentModal,
//                           attachment.shortlisted_project_comment_attachment_id,
//                         ) && (
//                           <CommonModalAttachment
//                             key={`modal-${attachment.shortlisted_project_comment_attachment_id}`}
//                             attachment={attachment}
//                             show={showModal}
//                             handleModal={handleModal}
//                           />
//                         )}
//                     </div>
//                   );
//                 },
//               )}
//             </div>
//           )}
//           {reactionShow && (
//             <div className="d-flex align-items-center">
//               <div className="reaction-container">
//                 <a href="#" className="mr-2 reaction-link">
//                   Like
//                 </a>
//                 <div className="reaction-selector">
//                   <FacebookSelector
//                     onSelect={async (emoji) => {
//                       const apiRes =
//                         await api.shortlistedProjectCommentReaction.create(
//                           {
//                             shortlisted_project_comment_id:
//                               comment.shortlisted_project_comment_id,
//                             // contact_fk: contact.contact_id,
//                             agency_user_fk: h.auth.getUserInfo().user_id,
//                             emoji,
//                           },
//                           false,
//                         );
//                       if (h.cmpStr(apiRes.status, 'ok')) {
//                         await getCommentByCommentId(
//                           comment.shortlisted_project_comment_id,
//                         );
//                         if (reloadComments)
//                           reloadComments(comment.shortlisted_project_fk);
//                       }
//                     }}
//                   />
//                 </div>
//               </div>
//               <small className="text-color5 mt-1 mr-2">
//                 {h.date.timeSince(new Date(comment.comment_date_raw))} ago
//               </small>
//               {h.notEmpty(comment) &&
//                 h.notEmpty(comment.shortlisted_project_comment_reactions) && (
//                   <FacebookCounter
//                     user={h.user.formatFullName(contact)}
//                     counters={comment.shortlisted_project_comment_reactions.map(
//                       (reaction) => {
//                         return {
//                           emoji: reaction.emoji,
//                           by:
//                             h.user.formatFullName(contact) ||
//                             comment.agency_user?.user?.full_name ||
//                             '',
//                         };
//                       },
//                     )}
//                   />
//                 )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
