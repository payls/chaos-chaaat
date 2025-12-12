// import React, { useEffect } from 'react';

// import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
// import IconZoomIn from '../Icons/IconZoomIn';
// import IconZoomOut from '../Icons/IconZoomOut';
// import IconReset from '../Icons/IconReset';
// import { faRedo } from '@fortawesome/free-regular-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// export default function CommonImagePreview({ imageSrc, download = false }) {
//   return (
//     <TransformWrapper initialScale={1}>
//       {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
//         <React.Fragment>
//           <div
//             className={'tools ' + (download ? 'wd' : '')}
//             style={{ ...(window.innerWidth <= 500 ? { display: 'none' } : {}) }}
//           >
//             <button onClick={() => zoomOut()} className="btn-img-action">
//               <IconZoomIn fill="#fff" />
//             </button>
//             <button onClick={() => zoomIn()} className="btn-img-action">
//               <IconZoomOut fill="#fff" />
//             </button>
//             <button
//               onClick={() => resetTransform()}
//               className="btn-img-action reset-action"
//             >
//               <IconReset fill="#fff" />
//             </button>
//           </div>
//           <TransformComponent>
//             <img src={imageSrc} alt="test" width="100%" />
//           </TransformComponent>
//         </React.Fragment>
//       )}
//     </TransformWrapper>
//   );
// }
