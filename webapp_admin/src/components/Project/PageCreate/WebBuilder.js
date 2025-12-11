// import React, { useRef, useEffect, useState } from 'react';
// import { h } from '../../../helpers';

// import grapesjs from 'grapesjs';
// import { GrapesjsReact, Editor } from 'grapesjs-react';
// import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
// import grapesjsPresetNewsletter from 'grapesjs-preset-newsletter';
// import 'grapesjs/dist/css/grapes.min.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faClipboardList,
//   faPlusCircle,
//   faSave,
// } from '@fortawesome/free-solid-svg-icons';
// import CommonIconButton from '../../../components/Common/CommonIconButton';

// const grapesjsConfig = {
//   buildProps: ['font-family'],
//   properties: [
//     {
//       property: 'font-family',
//       name: 'Font',
//       list: [
//         {
//           value: 'Open Sans',
//           name: 'Open Sans',
//         },
//       ],
//     },
//   ],
// };

// function WebBuilder({ updateCallback, save, initialData }) {
//   const grapesRef = useRef(null);
//   const [editor, setEditor] = useState(null);

//   useEffect(() => {
//     return () => {
//       if (editor) {
//         editor.destroy();
//         setEditor(null);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (editor === null) {
//       const editorInstance = grapesjs.init({
//         container: '#gjs',
//         plugins: [grapesjsPresetWebpage, grapesjsPresetNewsletter],
//         pluginsOpts: {
//           'gjs-blocks-basic': { flexGrid: true },
//           grapesjsPresetWebpage: {},
//           grapesjsPresetNewsletter: {
//             // Add grapesjs-preset-newsletter options here
//           },
//         },
//         projectData: h.notEmpty(initialData?.landing_page_data)
//           ? JSON.parse(initialData?.landing_page_data)
//           : h.webBuilder.preset(),
//         assetManager: {
//           assets: {
//             fonts: [
//               {
//                 name: 'Your Font Name',
//                 url: 'https://fonts.googleapis.com/css?family=Your Font Name:300,400,600,700',
//               },
//             ],
//           },
//         },
//       });
//       setEditor(editorInstance);
//     } else {
//       // if (initialData && initialData?.landing_page_data) {
//       //   editor.loadProjectData(JSON.parse(initialData?.landing_page_data));
//       //   editor.
//       // } else {
//       //   editor.setComponents([]);
//       // }
//       // editor.refresh();
//       // const styleManager = editor.StyleManager;
//       // const fontProperty = styleManager.getProperty(
//       //   'typography',
//       //   'font-family',
//       // );
//       // console.log(fontProperty);
//       // fontProperty.addOption({
//       //   value: "'Oswald', sans-serif",
//       //   name: 'Oswald',
//       // });
//     }
//   }, [editor]);

//   if (editor) {
//     editor.on('change', handleOnChange);
//   }
//   function handleOnChange() {
//     if (editor) {
//       // updateCallback({
//       //   data: JSON.stringify(editor.getProjectData()),
//       //   html: editor.getHtml(),
//       //   css: editor.getCss(),
//       // });
//     }
//   }

//   return (
//     <div className="webBuilder" style={{ height: '100%' }}>
//       <CommonIconButton
//         style={{
//           // width: 200,
//           position: 'absolute',
//           right: '10px',
//           marginTop: '-45px',
//         }}
//         onClick={async () => {
//           if (editor) {
//             console.log(editor.getProjectData());
//             save({
//               data: JSON.stringify(editor.getProjectData()),
//               html: editor.getHtml(),
//               css: editor.getCss(),
//             });
//           }
//         }}
//       >
//         Save
//         <FontAwesomeIcon icon={faSave} color="#fff" fontSize="20px" />
//       </CommonIconButton>
//       {/* <button
//         type="button"
//         onClick={() => {
//           console.log(editor.getProjectData());
//           //   console.log(JSON.stringify(editor.getComponents()));
//           //   console.log(JSON.stringify(editor.getCss()));
//           //   console.log(editor);
//           //   editor.loadProjectData();
//         }}
//       >
//         asd
//       </button> */}
//       <GrapesjsReact id="gjs" />
//     </div>
//   );
// }

// export default WebBuilder;
