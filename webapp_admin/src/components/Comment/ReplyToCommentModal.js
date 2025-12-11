// import { faTimes } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import React, { useEffect, useState } from 'react';
// import { h } from '../../helpers';
// import { api } from '../../api';
// import { useRouter } from 'next/router';
// import { routes } from '../../configs/routes';
// import ShortlistedPropertyComment from './ShortlistedPropertyComment';
// import ShortlistedProjectComment from './ShortlistedProjectComment';
// import InputFileButton from '../Sale/Link/InputFileButton';
// import ShortlistedPropertyAttachmentCard from '../Property/ShortlistedPropertyAttachmentCard';

// const constant = require('../../constants/constant.json');

// export default function ReplyToCommentModal(props) {
//   const router = useRouter();
//   const {
//     onCloseModal,
//     setLoading,
//     selectedComment,
//     contact,
//     reloadComments,
//     externalRedirect = '',
//     commentType = 'property',
//   } = props;

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => (document.body.style.overflow = 'unset');
//   }, []);

//   const formFields = {
//     reply: {
//       field_type: h.form.FIELD_TYPE.TEXTAREA,
//       class_name: `col-12`,
//       label: 'Reply',
//       placeholder: 'Write a reply...',
//     },
//   };

//   const [fields, setFields] = useState(h.form.initFields(formFields));
//   const [attachmentFiles, setAttachmentFiles] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [currentModal, setCurrentModal] = useState('');

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setLoading(true);

//     const commentApi =
//       commentType === 'property'
//         ? api.shortlistedPropertyComment
//         : api.shortlistedProjectComment;

//     const commentDataApi =
//       commentType === 'property'
//         ? {
//             shortlisted_property_id:
//               selectedComment.shortlisted_property.shortlisted_property_id,
//             parent_comment_fk: selectedComment.shortlisted_property_comment_id,
//             unit: selectedComment.shortlisted_property.unit,
//           }
//         : {
//             shortlisted_project_id:
//               selectedComment.shortlisted_project.shortlisted_project_id,
//             parent_comment_fk: selectedComment.shortlisted_project_comment_id,
//             unit: selectedComment.shortlisted_project.unit,
//           };

//     let apiResComments = await commentApi.createComment(
//       {
//         ...commentDataApi,
//         attachments: attachmentFiles,
//         message: fields.reply.value,
//         send_email: true,
//       },
//       true,
//     );

//     if (h.cmpStr(apiResComments.status, 'ok')) {
//       await closeModal();
//     }
//     setLoading(false);
//   };

//   const closeModal = async () => {
//     if (externalRedirect === 'activity') {
//       // console.log(h.getRoute(routes.dashboard.leads.activity_stream));
//       // await router.push(h.getRoute(routes.dashboard.leads.activity_stream));
//     } else {
//       await router.push(h.getRoute(routes.dashboard.comments), undefined, {
//         shallow: true,
//       });
//     }
//     onCloseModal();
//   };

//   const fileUploadHandler = async (files) => {
//     setLoading(true);

//     let uploadFiles = files;
//     let newlyUploadFiles = [];
//     if (h.notEmpty(uploadFiles)) {
//       for (let i = 0; i < uploadFiles.length; i++) {
//         const targetFile = uploadFiles[i];
//         const formData = new FormData();
//         formData.append('file', targetFile);
//         const uploadResponse = await api.upload.upload(
//           formData,
//           commentType === 'property'
//             ? constant.UPLOAD.TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT
//             : constant.UPLOAD.TYPE.SHORTLISTED_PROJECT_COMMENT_ATTACHMENT,
//           false,
//         );
//         if (h.cmpStr(uploadResponse.status, 'ok')) {
//           newlyUploadFiles.push({
//             full_file_url: uploadResponse.data.file.full_file_url,
//             file_url: uploadResponse.data.file.file_url,
//             file_name: uploadResponse.data.file.file_name,
//           });
//         }
//       }
//     }

//     setAttachmentFiles((prevAttachments) => [
//       ...prevAttachments,
//       ...newlyUploadFiles,
//     ]);
//     setLoading(false);
//   };

//   const removeAttachmentHandler = (urlToRemove) => {
//     setAttachmentFiles(
//       attachmentFiles.filter((file) => file.full_file_url != urlToRemove),
//     );
//   };

//   const handleModal = (e, attachment) => {
//     if (e) e.preventDefault();
//     if (showModal) {
//       setShowModal(false);
//       setCurrentModal('');
//     } else {
//       setShowModal(true);
//       setCurrentModal(
//         commentType === 'property'
//           ? attachment.shortlisted_property_comment_attachment_id
//           : attachment.shortlisted_project_comment_attachment_id,
//       );
//     }
//   };

//   return (
//     <div className="modal-root" onClick={() => closeModal}>
//       <div className="modal-container" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <span>Reply to comment</span>
//           <button onClick={closeModal}>
//             <FontAwesomeIcon icon={faTimes} color="#fff" size="2x" />
//           </button>
//         </div>
//         <div className="modal-body contact-modal-body">
//           {commentType === 'property' ? (
//             <ShortlistedPropertyComment
//               comment={selectedComment}
//               handleModal={handleModal}
//               showModal={showModal}
//               currentModal={currentModal}
//               contactId={contact.contact_id}
//               contact={contact}
//               reloadComments={reloadComments}
//               reactionShow={
//                 selectedComment && selectedComment.shortlisted_property
//               }
//             />
//           ) : (
//             <ShortlistedProjectComment
//               comment={selectedComment}
//               handleModal={handleModal}
//               showModal={showModal}
//               currentModal={currentModal}
//               contactId={contact.contact_id}
//               contact={contact}
//               reloadComments={reloadComments}
//               reactionShow={
//                 selectedComment && selectedComment.shortlisted_project
//               }
//             />
//           )}

//           {/*<span className="text-muted">*/}
//           {/*	{selectedComment.shortlisted_property.unit?.project?.project_name}&nbsp;|&nbsp;*/}
//           {/*	{selectedComment.shortlisted_property.unit?.unit?.floor} floor&nbsp;|&nbsp;*/}
//           {/*	{h.currency.format(selectedComment.shortlisted_property.unit?.unit?.sqm, 0)} sqm&nbsp;|&nbsp;*/}
//           {/*	{selectedComment.shortlisted_property.unit?.unit?.direction_facing} facing*/}
//           {/*</span>*/}

//           {h.notEmpty(attachmentFiles) && (
//             <div
//               className="col-12 d-flex flex-row flex-wrap"
//               style={{ gap: '10px 10px' }}
//             >
//               {attachmentFiles.map(({ full_file_url, file_name }, i) => {
//                 return (
//                   <ShortlistedPropertyAttachmentCard
//                     key={i}
//                     uploading={true}
//                     attachment={{
//                       attachment_url: full_file_url,
//                       file_name: file_name,
//                     }}
//                     handleModal={handleModal}
//                     removeAttachmentHandler={removeAttachmentHandler}
//                   />
//                 );
//               })}
//             </div>
//           )}
//           {selectedComment &&
//             (selectedComment.shortlisted_property ||
//               selectedComment.shortlisted_project) && (
//               <div
//                 className="modal-input-group comment-textarea"
//                 style={{ position: 'relative' }}
//               >
//                 <h.form.GenericForm
//                   className="text-left"
//                   formFields={formFields}
//                   formMode={h.form.FORM_MODE.ADD}
//                   setLoading={setLoading}
//                   fields={fields}
//                   setFields={setFields}
//                   showCancelButton={false}
//                   showSubmitButton={false}
//                   handleCancel={closeModal}
//                   cancelButtonClassName="common-button transparent-bg"
//                   handleSubmit={handleSubmit}
//                   submitButtonLabel="Reply"
//                   submitButtonClassName="col-12 col-sm-3 col-md-2 d-none"
//                   buttonWrapperClassName={'modal-footer'}
//                   submitButtonVariant="primary3"
//                 />
//                 <InputFileButton fileUploadHandler={fileUploadHandler} />
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// }
