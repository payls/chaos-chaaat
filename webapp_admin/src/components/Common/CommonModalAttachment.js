// import React, { useState, useEffect } from 'react';
// import { Modal } from 'react-bootstrap';
// import { h } from '../../helpers';
// import constant from '../../constants/constant.json';
// import {
//   faTimes,
//   faDownload,
//   faAngleLeft,
//   faAngleRight,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import ReactImageMagnify from 'react-image-magnify';

// import { Document, Page, pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// import CommonImagePreview from './CommonImagePreview';

// export default function CommonModalAttachment(props) {
//   const { show = false, attachment, handleModal, downloadable = true } = props;
//   const [totalPages, setTotalPages] = useState(1);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [image, setImage] = useState(null);

//   const isPdf = attachment.attachment_url.includes('.pdf');
//   let pdfViewWidth = 600;
//   if (window.innerWidth < 1000) {
//     pdfViewWidth = 400;
//   }
//   if (window.innerWidth < 800) {
//     pdfViewWidth = 300;
//   }
//   if (window.innerWidth < 450) {
//     pdfViewWidth = 200;
//   }

//   useEffect(() => {
//     if (show) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     const img = new Image();
//     img.src = attachment.attachment_url;

//     setImage(img);
//     return () => {
//       document.body.style.overflow = 'unset';
//       setImage(null);
//     };
//   }, [show]);

//   const zoomRatio = 2.5;
//   const getDisplayDimensions = () => {
//     const targetWidth = window.innerWidth * 0.8;
//     const multiplier = targetWidth / image.width;

//     return {
//       width: image.width * multiplier,
//       height: image.height * multiplier,
//     };
//   };

//   return (
//     <>
//       {show && (
//         <div className="common-modal-attachment-background">
//           <div
//             className="common-modal-attachment-container"
//             style={{ position: 'relative' }}
//           >
//             <div className="common-modal-attachment-header">
//               <h1 style={{ color: 'white' }}>Preview</h1>
//               <div
//                 style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                 }}
//               >
//                 <span
//                   style={{
//                     display: downloadable ? 'inline' : 'none',
//                     fontSize: '0.8em',
//                   }}
//                   onClick={() => {
//                     h.download.downloadWithFileName(
//                       attachment.attachment_url,
//                       constant.UPLOAD.TYPE
//                         .SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT,
//                     );
//                   }}
//                 >
//                   <FontAwesomeIcon
//                     icon={faDownload}
//                     style={{ cursor: 'pointer' }}
//                     color="#fff"
//                     size="2x"
//                   />
//                 </span>

//                 <span
//                   onClick={handleModal}
//                   style={{
//                     cursor: 'pointer',
//                     fontSize: '1em',
//                     marginLeft: '3em',
//                   }}
//                 >
//                   <FontAwesomeIcon icon={faTimes} color="#fff" size="2x" />
//                 </span>
//               </div>
//             </div>
//             <div className="common-modal-attachment-body">
//               {!isPdf ? (
//                 <CommonImagePreview imageSrc={attachment.attachment_url} />
//               ) : (
//                 <Document
//                   file={attachment.attachment_url}
//                   onLoadSuccess={({ numPages }) => {
//                     setTotalPages(numPages);
//                   }}
//                 >
//                   <Page
//                     class="pdf-page"
//                     width={pdfViewWidth}
//                     pageNumber={pageNumber}
//                   />
//                 </Document>
//               )}
//               <div
//                 className="justify-content-center align-items-center"
//                 style={{
//                   display: totalPages === 1 ? 'none' : 'flex',
//                   backgroundColor: 'white',
//                   padding: '1em 0',
//                 }}
//               >
//                 <button
//                   className="table-pagination-navigate"
//                   onClick={() => setPageNumber(pageNumber - 1)}
//                   disabled={pageNumber === 1}
//                 >
//                   <span style={{ padding: '0 10px 0 0' }}>
//                     <FontAwesomeIcon
//                       icon={faAngleLeft}
//                       color="#ADC7A6"
//                       fontSize="20px"
//                     />
//                   </span>
//                   Prev
//                 </button>
//                 &nbsp;&nbsp;&nbsp;{pageNumber}/{totalPages}&nbsp;&nbsp;&nbsp;
//                 <button
//                   className="table-pagination-navigate"
//                   onClick={() => setPageNumber(pageNumber + 1)}
//                   disabled={pageNumber === totalPages}
//                 >
//                   Next
//                   <span style={{ padding: '0 0 0 10px' }}>
//                     <FontAwesomeIcon
//                       icon={faAngleRight}
//                       color="#ADC7A6"
//                       fontSize="20px"
//                     />
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
