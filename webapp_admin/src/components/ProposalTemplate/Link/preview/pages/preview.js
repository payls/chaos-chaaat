// import React, { useState } from 'react';
// import { Header, PreviewHeader } from '../components/Layouts/Layout';
// import Template from './template';

// export default function Preview(props) {
//   const {
//     proposalTemplateId,
//     proposalTemplate,
//     agency,
//     setSettingsData,
//     settingsData,
//     parentProjectImageCallBack,
//     permalinkTemplate,
//   } = props;
//   const [selectedPreview, setSelectedPreview] = useState('desktop-preview');

//   return (
//     <div style={{ position: 'relative', margin: 'inherit' }}>
//       <PreviewHeader
//         selectedPreview={selectedPreview}
//         setSelectedPreview={setSelectedPreview}
//         key="preview-proposal"
//       />

//       <Header showHeaderContent={false} />

//       <div id={'preview-div'} className={'d-flex justify-content-center '}>
//         <div
//           className={` ${selectedPreview}`}
//           style={{
//             minHeight: '92vh',
//           }}
//         >
//           <Template
//             permalinkTemplate={permalinkTemplate}
//             proposalTemplateId={proposalTemplateId}
//             proposalTemplate={proposalTemplate}
//             agency={agency}
//             shouldTrackActivity={false}
//             setSettingsData={setSettingsData}
//             settingsData={settingsData}
//             parentProjectImageCallBack={parentProjectImageCallBack}
//           />
//           {/*in order to make sure the contactActivity isn't fired*/}
//         </div>{' '}
//       </div>
//     </div>
//   );
// }
