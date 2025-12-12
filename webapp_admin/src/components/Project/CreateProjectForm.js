// import {
//   faCertificate,
//   faTrash,
//   faUpload,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import XHRUpload from '@uppy/xhr-upload';

// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from 'react';
// import { h } from '../../helpers';
// import dynamic from 'next/dynamic';

// import '@uppy/core/dist/style.css';
// import '@uppy/dashboard/dist/style.css';

// import Uppy from '@uppy/core';
// import { useUppy } from '@uppy/react';
// import Transloadit from '@uppy/transloadit';
// import IconOrangePool from '../../components/Icons/IconOrangePool';
// import IconOrangeGym from '../../components/Icons/IconOrangeGym';
// import IconOrangeConcierge from '../../components/Icons/IconOrangeConcierge';
// import IconOrangeTennis from '../../components/Icons/IconOrangeTennis';
// import IconOrangeBath from '../../components/Icons/IconOrangeBath';
// import IconOrangeSauna from '../../components/Icons/IconOrangeSauna';
// import IconOrangeCoworking from '../../components/Icons/IconOrangeCoworking';
// import IconOrangeSecurity from '../../components/Icons/IconOrangeSecurity';
// import IconOrangeUtilityArea from '../../components/Icons/IconOrangeUtilityArea';
// import IconOrangeGarden from '../../components/Icons/IconOrangeGarden';
// import IconOrangeParking from '../../components/Icons/IconOrangeParking';
// import IconOrangeGameRoom from '../../components/Icons/IconOrangeGameRoom';
// import IconOrangeGolfSimulator from '../../components/Icons/IconOrangeGolfSimulator';
// import IconOrangeTheater from '../../components/Icons/IconOrangeTheater';
// import IconOrangeDogWash from '../../components/Icons/IconOrangeDogWash';
// import IconOrangeResidenceClub from '../../components/Icons/IconOrangeResidenceClub';
// import IconOrangeWine from '../../components/Icons/IconOrangeWine';
// import IconOrangeSteamRoom from '../../components/Icons/IconOrangeSteamRoom';
// import IconIntegratedAppliances from '../../components/Icons/IconIntegratedAppliances';
// import IconCCTV from '../../components/Icons/IconCCTV';

// import IconToolTip from '../../components/Icons/IconToolTip';
// import { config } from '../../configs/config';
// import { routes } from '../../configs/routes';
// import { useRouter } from 'next/router';
// import { api } from '../../api';
// import constant from '../../constants/constant.json';
// import currency from '../../constants/currency.json';
// import { useDropzone } from 'react-dropzone';
// import ReactGoogleAutocomplete from 'react-google-autocomplete';
// import ProjectTeamBehindForm from './ProjectTeamBehindForm';
// import ProjectMediaForm from './ProjectWizard/ProjectMediaForm';
// import Preview from './Preview';
// import ProjectWizardMediaUpload from './ProjectWizard/ProjectWizardMediaUpload';
// import CommonTextAreaEditor from '../../components/Common/CommonTextAreaEditor';

// const paveCommon = { config: { constant, currency } };

// const DataGrid = dynamic(() => import('react-data-grid'), {
//   ssr: false,
// });

// export default function CreateProjectForm({
//   setLoading,
//   formMode,
//   setFormMode,
//   projectId,
// }) {
//   const router = useRouter();

//   const projectHeaderImageDragAndDrop = useDropzone({
//     accept: 'image/jpeg, image/png',
//     maxFiles: 1,
//   });

//   const developerLogoDragAndDrop = useDropzone({
//     accept: 'image/jpeg, image/png',
//     maxFiles: 1,
//   });

//   const architectLogoDragAndDrop = useDropzone({
//     accept: 'image/jpeg, image/png',
//     maxFiles: 1,
//   });

//   const builderLogoDragAndDrop = useDropzone({
//     accept: 'image/jpeg, image/png',
//     maxFiles: 1,
//   });

//   const landscaperLogoDragAndDrop = useDropzone({
//     accept: 'image/jpeg, image/png',
//     maxFiles: 1,
//   });

//   const projectImagesDragAndDrop = useDropzone({
//     accept: 'image/jpeg, image/png',
//   });

//   const projectVideosDragAndDrop = useDropzone({
//     accept: 'video/mp4',
//   });

//   const projectEbrochuresDragAndDrop = useDropzone({
//     accept: 'application/pdf',
//   });

//   const [formStep, setFormStep] = useState(1);

//   const projectHeaderImageUploadInputRef = useRef();
//   const developerLogoImageUploadInputRef = useRef();
//   const architectLogoImageUploadInputRef = useRef();
//   const builderLogoImageUploadInputRef = useRef();
//   const landscaperLogoImageUploadInputRef = useRef();

//   const projectMediasImagesUploadInputRef = useRef();
//   const projectMediasVideosUploadInputRef = useRef();
//   const projectMediasEbrochureUploadInputRef = useRef();

//   const [projectNameInput, setProjectNameInput] = useState('');
//   const [projectNameError, setProjectNameError] = useState('');
//   const [projectDescriptionInput, setProjectDescriptionInput] = useState('');
//   const [projectKeyStatsInput, setProjectKeyStatsInput] = useState('');
//   const [projectHighlightsInput, setProjectHighlightsInput] = useState('');
//   const [projectWhyInvestInput, setProjectWhyInvestInput] = useState('');
//   const [projectShoppingInput, setProjectShoppingInput] = useState('');
//   const [projectTransportInput, setProjectTransportInput] = useState('');
//   const [projectEducationInput, setProjectEducationInput] = useState('');
//   const [projectTypeInput, setProjectTypeInput] = useState('');
//   const [projectTypeError, setProjectTypeError] = useState('');
//   const [projectCurrencyCodeInput, setProjectCurrencyCodeInput] = useState('');
//   const [projectCurrencyCodeError, setProjectCurrencyCodeError] = useState('');
//   const [projectSizeFormatInput, setProjectSizeFormatInput] = useState('');
//   const [projectSizeFormatError, setProjectSizeFormatError] = useState('');
//   const [projectCompletionDateInput, setProjectCompletionDateInput] =
//     useState('');
//   const [
//     projectHeaderInfoCoverPictureUrl,
//     setProjectHeaderInfoCoverPictureUrl,
//   ] = useState({
//     url: '',
//     title: '',
//     filename: '',
//   });

//   const [developerNameInput, setDeveloperNameInput] = useState('');
//   const [developerDescriptionInput, setDeveloperDescriptionInput] =
//     useState('');
//   const [developerLogoUrl, setDeveloperLogoUrl] = useState({
//     url: '',
//     title: '',
//     filename: '',
//   });

//   const [architectNameInput, setArchitectNameInput] = useState('');
//   const [architectDescriptionInput, setArchitectDescriptionInput] =
//     useState('');
//   const [architectLogoUrl, setArchitectLogoUrl] = useState({
//     url: '',
//     title: '',
//     filename: '',
//   });

//   const [builderNameInput, setBuilderNameInput] = useState('');
//   const [builderDescriptionInput, setBuilderDescriptionInput] = useState('');
//   const [builderLogoUrl, setBuilderLogoUrl] = useState({
//     url: '',
//     title: '',
//     filename: '',
//   });

//   const [landscaperNameInput, setLandscaperNameInput] = useState('');
//   const [landscaperDescriptionInput, setLandscaperDescriptionInput] =
//     useState('');
//   const [landscaperLogoUrl, setLandscaperLogoUrl] = useState({
//     url: '',
//     title: '',
//     filename: '',
//   });

//   const [googleAutocompleteValue, setGoogleAutocompleteValue] = useState(null);
//   const [googleMapsPlace, setGoogleMapsPlace] = useState(null);

//   const [youtubeVideoUrlInput, setYoutubeVideoUrlInput] = useState('');
//   const [youtubeVideoUrlError, setYoutubeVideoUrlError] = useState('');

//   const [iframeUrl, setIframeUrl] = useState('');
//   const [iframeUrlError, setIframeUrlError] = useState('');

//   const [vimeoVideoUrlInput, setVimeoVideoUrlInput] = useState('');
//   const [vimeoVideoUrlError, setVimeoVideoUrlError] = useState('');

//   const [wistiaVideoUrlInput, setWistiaVideoUrlInput] = useState('');
//   const [wistiaVideoUrlError, setWistiaVideoUrlError] = useState('');

//   const [projectMedias, setProjectMedias] = useState([]);
//   const [deleteProjectMedias, setDeleteProjectMedias] = useState([]);

//   const [projectFeatures, setProjectFeatures] = useState([]);
//   const [hasMarketingAccess, setHasMarketingAccess] = useState(true);

//   const [heroImageMediaId, setHeroImageMediaId] = useState('');
//   const [selectedIndexes, setSelectedIndexes] = useState([]);
//   const [sort, setSort] = useState(0);

//   // show floor only if project type is High Rise Residential
//   const floorNotAllowedProjectTypes = [
//     constant.PROJECT.TYPE.HOUSE_AND_LAND,
//     constant.PROJECT.TYPE.SEMI_DETACHED,
//   ];

//   useEffect(() => {
//     h.auth.isLoggedInElseRedirect();
//     const queryStep = h.general.findGetParameter('step');
//     if (h.notEmpty(queryStep)) {
//       setFormStep(parseInt(queryStep));
//       (async () => {
//         await router.replace(
//           h.getRoute(routes.dashboard['products.edit'], {
//             project_id: projectId,
//           }),
//           undefined,
//           { shallow: true },
//         );
//       })();
//     }
//     (async () => {
//       setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
//     })();
//   }, []);

//   useEffect(() => {
//     if (h.notEmpty(projectId)) {
//       (async () => {
//         setLoading(true);
//         await getProjectFromServer(projectId);
//         setLoading(false);
//       })();
//     }
//   }, [projectId]);

//   const getProjectFromServer = async (projectId) => {
//     const response = await api.project.getProjectByStep(
//       projectId,
//       formStep,
//       false,
//     );
//     if (h.cmpStr(response.status, 'ok')) {
//       const outProject = response.data.project;
//       setProjectNameInput(outProject.name);
//       setProjectDescriptionInput(outProject.description);
//       setProjectKeyStatsInput(outProject.key_stats);
//       setProjectHighlightsInput(outProject.project_highlights);
//       setProjectWhyInvestInput(outProject.why_invest);
//       setProjectShoppingInput(outProject.shopping);
//       setProjectTransportInput(outProject.transport);
//       setProjectEducationInput(outProject.education);
//       setProjectTypeInput(outProject.project_type);
//       setProjectHeaderInfoCoverPictureUrl({
//         url: outProject.property_header_info_cover_picture_url,
//         title: outProject.property_header_info_cover_picture_title,
//         filename: outProject.property_header_info_cover_picture_filename,
//       });
//       setProjectCurrencyCodeInput(outProject.currency_code);
//       setProjectSizeFormatInput(outProject.size_format);
//       setGoogleAutocompleteValue(outProject.location_address_1);
//       setGoogleMapsPlace(outProject.location_google_place_raw);
//       //Set completion date
//       let completionDate = new Date(outProject.completion_date);
//       // const completionDateDay = completionDate.getDate();
//       const completionDateYear = completionDate.getFullYear();
//       const completionDateMonth =
//         completionDate.getMonth() < 10
//           ? `0${completionDate.getMonth() + 1}`
//           : completionDate.getMonth() + 1;
//       let setDate = `${completionDateYear}-${completionDateMonth}`;
//       setProjectCompletionDateInput(setDate);
//       //Set team behind fields
//       handleGetTeamBehind(outProject.team_behind);
//       //Set media fields
//       handleGetMedia(outProject.medias);
//       //Set feature fields
//       handleGetFeature(outProject.features);
//       //Set units
//       handleGetUnits(outProject.units_available_for_purchase);
//     }
//   };

//   const handleGetTeamBehind = (teamBehind) => {
//     if (h.notEmpty(teamBehind)) {
//       let { developer, architect, builder, landscaper } = teamBehind;
//       setDeveloperNameInput(developer.name);
//       setDeveloperDescriptionInput(developer.description);
//       setDeveloperLogoUrl({
//         url: developer.logo_url,
//         title: developer.title,
//         filename: developer.filename,
//       });
//       setArchitectNameInput(architect.name);
//       setArchitectDescriptionInput(architect.description);
//       setArchitectLogoUrl({
//         url: architect.logo_url,
//         title: architect.title,
//         filename: architect.filename,
//       });
//       setBuilderNameInput(builder.name);
//       setBuilderDescriptionInput(builder.description);
//       setBuilderLogoUrl({
//         url: builder.logo_url,
//         title: builder.title,
//         filename: builder.filename,
//       });
//       setLandscaperNameInput(landscaper.name);
//       setLandscaperDescriptionInput(landscaper.description);
//       setLandscaperLogoUrl({
//         url: landscaper.logo_url,
//         title: landscaper.title,
//         filename: landscaper.filename,
//       });
//     }
//   };

//   const handleGetMedia = (medias) => {
//     setProjectMedias(
//       medias
//         .map((media, i) => {
//           if (media.is_hero_image) setHeroImageMediaId(media.project_media_id);
//           return {
//             project_media_id: media.project_media_id,
//             title: media.title,
//             url: media.url,
//             filename: media.filename,
//             type: media.type,
//             unitsSelected: h.notEmpty(media.project_media_properties)
//               ? media.project_media_properties.map((project_media_property) => {
//                   return project_media_property.project_property_fk;
//                 })
//               : [],
//             tags: h.notEmpty(media.project_media_tags)
//               ? media.project_media_tags.map((project_media_tag) => {
//                   return project_media_tag.tag;
//                 })
//               : [],
//             display_order: media.display_order ?? i,
//           };
//         })
//         .sort((a, b) => a.display_order - b.display_order),
//     );
//   };

//   const handleGetFeature = (inFeatures) => {
//     setProjectFeatures(inFeatures);
//   };

//   const handleGetUnits = (inUnits) => {
//     if (h.isEmpty(inUnits)) {
//       setRows([
//         {
//           project_property_id: '',
//           index: new Date().getTime(),
//           unit: '',
//           type: '',
//           floor: '',
//           price: '',
//           size: '',
//           beds: '',
//           baths: '',
//           direction: '',
//           parking_lots: '',
//           status: '',
//         },
//       ]);
//     } else {
//       setRows(
//         inUnits.map((inUnit) => {
//           return {
//             project_property_id: inUnit.project_property_id,
//             index: inUnit.project_property_id,
//             unit: inUnit.unit_number,
//             type: inUnit.unit_type,
//             floor: inUnit.floor,
//             price: inUnit.starting_price,
//             size: inUnit.sqm,
//             beds: h.general.customFormatDecimal(inUnit.number_of_bedroom, 0),
//             baths: h.general.customFormatDecimal(inUnit.number_of_bathroom, 0),
//             direction: inUnit.direction_facing,
//             parking_lots: inUnit.number_of_parking_lots,
//             status: inUnit.status,
//           };
//         }),
//       );
//     }
//   };

//   useEffect(() => {
//     if (h.notEmpty(projectHeaderImageDragAndDrop.acceptedFiles)) {
//       const targetFile = projectHeaderImageDragAndDrop.acceptedFiles[0];
//       const formData = new FormData();
//       formData.append('file', targetFile);
//       handleFileUpload(formData, 'project_header', targetFile.name);
//     }
//   }, [projectHeaderImageDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(developerLogoDragAndDrop.acceptedFiles)) {
//       const targetFile = developerLogoDragAndDrop.acceptedFiles[0];
//       const formData = new FormData();
//       formData.append('file', targetFile);
//       handleFileUpload(formData, 'developer_logo', targetFile.name);
//     }
//   }, [developerLogoDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(architectLogoDragAndDrop.acceptedFiles)) {
//       const targetFile = architectLogoDragAndDrop.acceptedFiles[0];
//       const formData = new FormData();
//       formData.append('file', targetFile);
//       handleFileUpload(formData, 'architect_logo', targetFile.name);
//     }
//   }, [architectLogoDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(builderLogoDragAndDrop.acceptedFiles)) {
//       const targetFile = builderLogoDragAndDrop.acceptedFiles[0];
//       const formData = new FormData();
//       formData.append('file', targetFile);
//       handleFileUpload(formData, 'builder_logo', targetFile.name);
//     }
//   }, [builderLogoDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(landscaperLogoDragAndDrop.acceptedFiles)) {
//       const targetFile = landscaperLogoDragAndDrop.acceptedFiles[0];
//       const formData = new FormData();
//       formData.append('file', targetFile);
//       handleFileUpload(formData, 'landscaper_logo', targetFile.name);
//     }
//   }, [landscaperLogoDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(projectImagesDragAndDrop.acceptedFiles)) {
//       for (const targetFile of projectImagesDragAndDrop.acceptedFiles) {
//         try {
//           const formData = new FormData();
//           formData.append('file', targetFile);
//           handleFileUpload(formData, 'project_medias_images', targetFile.name);
//         } catch {}
//       }
//     }
//   }, [projectImagesDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(projectVideosDragAndDrop.acceptedFiles)) {
//       for (const targetFile of projectVideosDragAndDrop.acceptedFiles) {
//         try {
//           const formData = new FormData();
//           formData.append('file', targetFile);
//           handleFileUpload(formData, 'project_medias_videos', targetFile.name);
//         } catch {}
//       }
//     }
//   }, [projectVideosDragAndDrop.acceptedFiles]);

//   useEffect(() => {
//     if (h.notEmpty(projectEbrochuresDragAndDrop.acceptedFiles)) {
//       const targetFile =
//         projectEbrochuresDragAndDrop.acceptedFiles[
//           projectEbrochuresDragAndDrop.acceptedFiles.length - 1
//         ];
//       const formData = new FormData();
//       formData.append('file', targetFile);
//       handleFileUpload(formData, 'project_medias_ebrochure', targetFile.name);
//     }
//   }, [projectEbrochuresDragAndDrop.acceptedFiles]);

//   const handleProjectHeaderImageUpload = () => {
//     projectHeaderImageUploadInputRef.current.click();
//   };

//   const handleDeveloperLogoImageUpload = () => {
//     developerLogoImageUploadInputRef.current.click();
//   };

//   const handleArchitectLogoImageUpload = () => {
//     architectLogoImageUploadInputRef.current.click();
//   };

//   const handleBuilderLogoImageUpload = () => {
//     builderLogoImageUploadInputRef.current.click();
//   };

//   const handleLandscaperLogoImageUpload = () => {
//     landscaperLogoImageUploadInputRef.current.click();
//   };

//   const handleProjectMediasImagesUpload = () => {
//     projectMediasImagesUploadInputRef.current.click();
//   };

//   const handleProjectMediasVideosUpload = () => {
//     projectMediasVideosUploadInputRef.current.click();
//   };

//   const handleProjectMediasEbrochureUpload = () => {
//     projectMediasEbrochureUploadInputRef.current.click();
//   };

//   const handleFilePickerChange = async (e, type) => {
//     let uploadFiles = [...e.target.files];
//     if (h.notEmpty(uploadFiles)) {
//       await Promise.all(
//         uploadFiles.map((targetFile) => {
//           // eslint-disable-next-line no-undef
//           const formData = new FormData();
//           formData.append('file', targetFile);
//           handleFileUpload(formData, type, targetFile.name);
//         }),
//       );
//     }
//   };

//   const addYoutubeVideo = async () => {
//     const youtubeUrlRegex =
//       /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
//     if (!youtubeUrlRegex.test(youtubeVideoUrlInput)) {
//       setYoutubeVideoUrlError('Invalid Youtube URL');
//       return;
//     }

//     setYoutubeVideoUrlError('');

//     const youtubeId = h.youtube.getYoutubeId(youtubeVideoUrlInput);

//     setProjectMedias((projectMedias) => [
//       ...projectMedias,
//       {
//         title: '',
//         url: h.youtube.formatYoutubeEmbedUrl(youtubeId),
//         filename: youtubeVideoUrlInput,
//         type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE,
//         unitsSelected: [],
//         tags: [],
//       },
//     ]);
//     setYoutubeVideoUrlInput('');
//   };

//   const addIframeLink = async () => {
//     const urlPattern =
//       /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

//     if (!urlPattern.test(iframeUrl)) {
//       setIframeUrlError('Invalid Link');
//       return;
//     }

//     setIframeUrlError('');
//     setProjectMedias((projectMedias) => [
//       ...projectMedias,
//       {
//         title: '',
//         url: iframeUrl,
//         filename: iframeUrl,
//         type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_RENDER_3D,
//         unitsSelected: [],
//         tags: [],
//       },
//     ]);
//     setIframeUrl('');
//   };

//   const addVimeoVideo = async () => {
//     const vimeoUrlRegex =
//       /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/;
//     if (!vimeoUrlRegex.test(vimeoVideoUrlInput)) {
//       setVimeoVideoUrlError('Invalid Vimeo URL');
//       return;
//     }

//     setVimeoVideoUrlError('');

//     const vimeoId = h.youtube.getEmbeddedId(
//       vimeoVideoUrlInput,
//       paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO,
//     );
//     setProjectMedias((projectMedias) => [
//       ...projectMedias,
//       {
//         title: '',
//         url: h.youtube.formatVimeoEmbedUrl(vimeoId),
//         filename: h.youtube.formatVimeoFilename(vimeoId),
//         type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO,
//         unitsSelected: [],
//         tags: [],
//       },
//     ]);
//     setVimeoVideoUrlInput('');
//   };

//   const addWistiaVideo = async () => {
//     const wistiaUrlRegex =
//       /https?:\/\/[^.]+\.(wistia\.com|wi\.st)\/(medias|embed)\/.*/;
//     if (!wistiaUrlRegex.test(wistiaVideoUrlInput)) {
//       setWistiaVideoUrlError('Invalid Wistia URL');
//       return;
//     }

//     setWistiaVideoUrlError('');

//     const wistiaId = h.youtube.getEmbeddedId(
//       wistiaVideoUrlInput,
//       paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA,
//     );
//     setProjectMedias((projectMedias) => [
//       ...projectMedias,
//       {
//         title: '',
//         url: h.youtube.formatWistiaEmbedUrl(wistiaId),
//         filename: h.youtube.formatWistiaEmbedUrl(wistiaId),
//         type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA,
//         unitsSelected: [],
//         tags: [],
//       },
//     ]);
//     setWistiaVideoUrlInput('');
//   };

//   const handleFileUpload = async (formData, type, filename) => {
//     setLoading(true);
//     if (type === 'project_header') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE
//           .PROJECT_PROPERTY_HEADER_INFO_COVER_PICTURE,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setProjectHeaderInfoCoverPictureUrl({
//           url: uploadResponse.data.file.full_file_url,
//           title: '',
//           filename,
//         });
//       }
//     }

//     if (type === 'developer_logo') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_TEAM_BEHIND_LOGO,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setDeveloperLogoUrl({
//           url: uploadResponse.data.file.full_file_url,
//           title: '',
//           filename,
//         });
//       }
//     }

//     if (type === 'architect_logo') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_TEAM_BEHIND_LOGO,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setArchitectLogoUrl({
//           url: uploadResponse.data.file.full_file_url,
//           title: '',
//           filename,
//         });
//       }
//     }

//     if (type === 'builder_logo') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_TEAM_BEHIND_LOGO,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setBuilderLogoUrl({
//           url: uploadResponse.data.file.full_file_url,
//           title: '',
//           filename,
//         });
//       }
//     }

//     if (type === 'landscaper_logo') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_TEAM_BEHIND_LOGO,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setLandscaperLogoUrl({
//           url: uploadResponse.data.file.full_file_url,
//           title: '',
//           filename,
//         });
//       }
//     }

//     if (type === 'project_medias_images') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setProjectMedias((projectMedias) => [
//           ...projectMedias,
//           {
//             url: uploadResponse.data.file.full_file_url,
//             filename,
//             type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//             tags: [],
//           },
//         ]);
//       }
//     }

//     if (type === 'project_medias_videos') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setProjectMedias((projectMedias) => [
//           ...projectMedias,
//           {
//             url: uploadResponse.data.file.full_file_url,
//             filename,
//             type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
//             tags: [],
//           },
//         ]);
//       }
//     }

//     if (type === 'project_medias_ebrochure') {
//       const uploadResponse = await api.upload.upload(
//         formData,
//         paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE,
//         false,
//       );
//       if (h.cmpStr(uploadResponse.status, 'ok')) {
//         setProjectMedias((projectMedias) => [
//           ...projectMedias,
//           {
//             url: uploadResponse.data.file.full_file_url,
//             filename,
//             type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE,
//             tags: [],
//           },
//         ]);
//       }
//     }
//     setLoading(false);
//   };

//   // numeric formatter for strings in project wizard step 3
//   const colorFormatter = (val, formatToNumber = true) => {
//     return formatToNumber ? (
//       <div style={{ color: h.general.isNumeric(val) ? 'green' : 'red' }}>
//         {val}
//       </div>
//     ) : (
//       <div style={{ color: 'green' }}>{val}</div>
//     );
//   };

//   // list of allowed statuses
//   const allowed_status_list = Object.keys(
//     paveCommon.config.constant.PROPERTY.PROPERTY_STATUS,
//   ).map((key) => {
//     return paveCommon.config.constant.PROPERTY.PROPERTY_STATUS[key]
//       .toLowerCase()
//       .trim();
//   });

//   const columns = [
//     {
//       key: 'unit',
//       name: 'Unit',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.unit, false),
//     },
//     {
//       key: 'type',
//       name: 'Type',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.type, false),
//     },
//     {
//       key: 'price',
//       name: 'Price',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.price),
//     },
//     {
//       key: 'size',
//       name: 'Size',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.size),
//     },
//     {
//       key: 'beds',
//       name: 'Beds',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.beds),
//     },
//     {
//       key: 'baths',
//       name: 'Baths',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.baths),
//     },
//     {
//       key: 'direction',
//       name: 'Direction',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.direction, false),
//     },
//     {
//       key: 'parking_lots',
//       name: 'Parking Lots',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.parking_lots, false),
//     },
//     {
//       key: 'status',
//       name: 'Status',
//       editable: true,
//       formatter: (
//         { row }, // custom formatting for status
//       ) => (
//         <div
//           style={{
//             color: allowed_status_list.includes(
//               row.status?.trim().toLowerCase(),
//             )
//               ? 'green'
//               : 'red',
//           }}
//         >
//           {row.status}
//         </div>
//       ),
//     },
//     { key: 'action', name: '' },
//   ];

//   if (!floorNotAllowedProjectTypes.includes(projectTypeInput))
//     columns.splice(1, 0, {
//       key: 'floor',
//       name: 'Floor',
//       editable: true,
//       sortable: true,
//       formatter: ({ row }) => colorFormatter(row.floor, false),
//     });

//   const [rows, setRows] = useState([]);

//   const getCellActions = (column, currentRow) => {
//     const cellActions = [
//       {
//         icon: (
//           <button className="btn">
//             <FontAwesomeIcon icon={faTrash} />
//           </button>
//         ),
//         callback: () => {
//           const updatedRows = rows.filter(
//             (row) => !h.cmpStr(row.index, currentRow.index),
//           );
//           setRows(updatedRows);

//           updateRow({ updatedRows });
//         },
//       },
//     ];
//     return column.key === 'action' ? cellActions : null;
//   };

//   const updateRow = async ({ updatedRows }) => {
//     handleSubmit(null, updatedRows);
//   };

//   const onGridRowsUpdated = async ({ fromRow, toRow, updated }) => {
//     const tempRows = [...rows];
//     tempRows[toRow] = { ...tempRows[toRow], ...updated };
//     setRows(tempRows);

//     updateRow({ updatedRows: tempRows });
//   };

//   const deleteRows = () => {
//     const updatedRows = rows.filter((row, i) => {
//       return !selectedIndexes.includes(i);
//     });

//     setRows(updatedRows);

//     updateRow({ updatedRows });

//     setSelectedIndexes([]);
//   };

//   const onRowsSelected = (rows) => {
//     setSelectedIndexes(selectedIndexes.concat(rows.map((r) => r.rowIdx)));
//   };

//   const onRowsDeselected = (rows) => {
//     let rowIndexes = rows.map((r) => r.rowIdx);
//     setSelectedIndexes(
//       selectedIndexes.filter((i) => rowIndexes.indexOf(i) === -1),
//     );
//   };

//   const addRow = () => {
//     const newRow = {
//       project_property_id: '',
//       index: new Date().getTime(),
//       unit: '',
//       type: '',
//       floor: '',
//       price: '',
//       size: '',
//       beds: '',
//       baths: '',
//       direction: '',
//       parking_lots: '',
//       status: '',
//     };
//     setRows((rows) => [...rows, newRow]);
//   };

//   useEffect(() => {
//     const copyPasteEvent = function (e) {
//       const text = e.clipboardData.getData('text');

//       if (h.notEmpty(text)) {
//         let splitLines = text.split('\n');
//         for (let i = 0; i < splitLines.length; i++) {
//           const splitLine = splitLines[i];
//           const splitColumns = splitLine.split('\t');

//           let j = 0;
//           const row_headers = {
//             project_property_id: '',
//             index: new Date().getTime(),
//             unit: splitColumns[j],
//             floor:
//               h.notEmpty(projectTypeInput) &&
//               !floorNotAllowedProjectTypes.includes(projectTypeInput)
//                 ? splitColumns[++j]
//                 : '',
//             type: splitColumns[++j],
//             price: splitColumns[++j],
//             size: splitColumns[++j],
//             beds: splitColumns[++j],
//             baths: splitColumns[++j],
//             direction: splitColumns[++j],
//             parking_lots: splitColumns[++j],
//             status: splitColumns[++j],
//           };
//           setRows((rows) => [...rows, row_headers]);
//         }
//       }
//     };

//     if (formStep === 3) {
//       document.addEventListener('paste', copyPasteEvent, true);
//     } else {
//       document.removeEventListener('paste', copyPasteEvent, true);
//     }

//     return () => {
//       document.removeEventListener('paste', copyPasteEvent, true);
//     };
//   }, [formStep]);

//   // function to set the error values to required errors
//   const handleError = () => {
//     let hasError = false;
//     if (formStep === 1) {
//       if (h.isEmpty(projectNameInput)) {
//         setProjectNameError('Project name is required');
//         hasError = true;
//       }

//       // check if project type is empty
//       if (
//         h.cmpStr(projectTypeInput, 'project-type') ||
//         h.isEmpty(projectTypeInput)
//       ) {
//         setProjectTypeError('Project type is required');
//         hasError = true;
//       }

//       //check if project currency code is empty
//       if (
//         h.cmpStr(projectCurrencyCodeInput, 'currency-code') ||
//         h.isEmpty(projectCurrencyCodeInput)
//       ) {
//         setProjectCurrencyCodeError('Currency code is required');
//         hasError = true;
//       }

//       // check if project size is empty
//       if (
//         h.cmpStr(projectSizeFormatInput, 'size-format') ||
//         h.isEmpty(projectSizeFormatInput)
//       ) {
//         setProjectSizeFormatError('Size format is required');
//         hasError = true;
//       }
//     }

//     if (formStep === 4) {
//       // check if Youtube video url is invalid
//       if (!h.isEmpty(youtubeVideoUrlError)) {
//         hasError = true;
//       }

//       // check if Vimeo video url is invalid
//       if (!h.isEmpty(vimeoVideoUrlInput)) {
//         hasError = true;
//       }

//       // check if Wistia video url is invalid
//       if (!h.isEmpty(wistiaVideoUrlInput)) {
//         hasError = true;
//       }
//     }

//     return hasError;
//   };

//   const handleSubmit = async (toStep, updatedRows) => {
//     setLoading(true);
//     let newProjectId;

//     // if there is an error, return without executing anything further
//     const hasError = handleError();
//     if (hasError) {
//       h.general.alert('error', { message: 'Please fill the required fields' });
//       setLoading(false);
//       return;
//     }

//     if (formMode === h.form.FORM_MODE.ADD && formStep === 1) {
//       const response = await api.project.generateId({}, {}, false);
//       newProjectId = response.data.project_id;
//     }

//     const completionDate = new Date(projectCompletionDateInput);

//     const unitsAvailableForPurchase = updatedRows || rows;

//     const reOrderedMedias = projectMedias.map((media, i) => {
//       return {
//         ...media,
//         display_order: i,
//       };
//     });
//     console.log(formStep);
//     if (formStep !== 5) {
//       await api.project.update(
//         newProjectId || projectId,
//         formStep,
//         {
//           name: projectNameInput,
//           description: projectDescriptionInput,
//           key_stats: projectKeyStatsInput,
//           project_highlights: projectHighlightsInput,
//           why_invest: projectWhyInvestInput,
//           shopping: projectShoppingInput,
//           transport: projectTransportInput,
//           education: projectEducationInput,
//           project_type:
//             projectTypeInput !== 'project-type' ? projectTypeInput : '',
//           currency_code:
//             projectCurrencyCodeInput !== 'currency-code'
//               ? projectCurrencyCodeInput
//               : '',
//           size_format:
//             projectSizeFormatInput !== 'size-format'
//               ? projectSizeFormatInput
//               : '',
//           completion_date: completionDate,
//           location_address_1: h.notEmpty(googleMapsPlace)
//             ? googleMapsPlace.formatted_address
//             : '',
//           location_address_2: '',
//           location_address_3: '',
//           location_latitude: h.notEmpty(googleMapsPlace)
//             ? googleMapsPlace.lat
//             : 0,
//           location_longitude: h.notEmpty(googleMapsPlace)
//             ? googleMapsPlace.lng
//             : 0,
//           location_google_map_url: '',
//           location_google_place_id: h.notEmpty(googleMapsPlace)
//             ? googleMapsPlace.place_id
//             : '',
//           location_google_place_raw: h.notEmpty(googleMapsPlace)
//             ? googleMapsPlace
//             : {},
//           property_header_info_cover_picture_url:
//             projectHeaderInfoCoverPictureUrl.url,
//           property_header_info_cover_picture_title:
//             projectHeaderInfoCoverPictureUrl.title,
//           property_header_info_cover_picture_filename:
//             projectHeaderInfoCoverPictureUrl.filename,
//           team_behind: {
//             developer: {
//               type: paveCommon.config.constant.UPLOAD.TYPE
//                 .PROJECT_TEAM_BEHIND_LOGO,
//               name: developerNameInput,
//               description: developerDescriptionInput,
//               logo_url: developerLogoUrl.url,
//               title: developerLogoUrl.title,
//               filename: developerLogoUrl.filename,
//             },
//             architect: {
//               type: paveCommon.config.constant.UPLOAD.TYPE
//                 .PROJECT_TEAM_BEHIND_LOGO,
//               name: architectNameInput,
//               description: architectDescriptionInput,
//               logo_url: architectLogoUrl.url,
//               title: architectLogoUrl.title,
//               filename: architectLogoUrl.filename,
//             },
//             builder: {
//               type: paveCommon.config.constant.UPLOAD.TYPE
//                 .PROJECT_TEAM_BEHIND_LOGO,
//               name: builderNameInput,
//               description: builderDescriptionInput,
//               logo_url: builderLogoUrl.url,
//               title: builderLogoUrl.title,
//               filename: builderLogoUrl.filename,
//             },
//             landscaper: {
//               type: paveCommon.config.constant.UPLOAD.TYPE
//                 .PROJECT_TEAM_BEHIND_LOGO,
//               name: landscaperNameInput,
//               description: landscaperDescriptionInput,
//               logo_url: landscaperLogoUrl.url,
//               title: landscaperLogoUrl.title,
//               filename: landscaperLogoUrl.filename,
//             },
//           },
//           features: projectFeatures,
//           images: reOrderedMedias
//             .filter(
//               (media) =>
//                 media.type ===
//                 paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//             )
//             .map((media) => {
//               return {
//                 project_media_id: media?.new ? null : media.project_media_id,
//                 type: paveCommon.config.constant.UPLOAD.TYPE
//                   .PROJECT_MEDIA_IMAGE,
//                 url: media.url,
//                 filename: media.filename,
//                 thumbnail: media.thumbnail,
//                 title: media.title,
//                 units_selected: media.unitsSelected,
//                 tags: media.tags,
//                 is_hero_image: h.cmpStr(
//                   heroImageMediaId,
//                   media.project_media_id,
//                 ),
//                 display_order: media.display_order,
//               };
//             }),
//           videos: reOrderedMedias
//             .filter(
//               (media) =>
//                 media.type ===
//                 paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
//             )
//             .map((media) => {
//               return {
//                 project_media_id: media.project_media_id,
//                 type: paveCommon.config.constant.UPLOAD.TYPE
//                   .PROJECT_MEDIA_VIDEO,
//                 url: media.url,
//                 filename: media.filename,
//                 thumbnail: media.thumbnail,
//                 title: media.title,
//                 units_selected: media.unitsSelected,
//                 tags: media.tags,
//                 display_order: media.display_order,
//               };
//             }),
//           youtubes: reOrderedMedias
//             .filter((media) => {
//               let embededVideos =
//                 media.type ===
//                   paveCommon.config.constant.UPLOAD.TYPE
//                     .PROJECT_MEDIA_YOUTUBE ||
//                 media.type ===
//                   paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO ||
//                 media.type ===
//                   paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA;
//               return embededVideos;
//             })
//             .map((media) => {
//               return {
//                 project_media_id: media.project_media_id,
//                 type: media.type,
//                 url: media.url,
//                 filename: media.filename,
//                 title: media.title,
//                 units_selected: media.unitsSelected,
//                 tags: media.tags,
//                 display_order: media.display_order,
//               };
//             }),
//           ebrochures: reOrderedMedias
//             .filter(
//               (media) =>
//                 media.type ===
//                 paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE,
//             )
//             .map((media) => {
//               return {
//                 project_media_id: media?.new ? null : media.project_media_id,
//                 type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE,
//                 url: media.url,
//                 filename: media.filename,
//                 title: media.title,
//               };
//             }),
//           render_3ds: reOrderedMedias
//             .filter(
//               (media) =>
//                 media.type ===
//                 paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_RENDER_3D,
//             )
//             .map((media) => {
//               return {
//                 project_media_id: media.project_media_id,
//                 type: media.type,
//                 url: media.url,
//                 filename: media.filename,
//                 title: media.title,
//                 units_selected: media.unitsSelected,
//                 tags: media.tags,
//                 display_order: media.display_order,
//               };
//             }),
//           delete_project_medias: deleteProjectMedias,
//           locations_nearby: [],
//           units_available_for_purchase: unitsAvailableForPurchase.map(
//             (row) => ({
//               project_property_id: row.project_property_id,
//               unit_type: row.type,
//               unit_number: row.unit,
//               floor: row.floor,
//               sqm: Number(row.size),
//               number_of_bedroom: Number(row.beds),
//               number_of_bathroom: Number(row.baths),
//               number_of_parking_lots: row.parking_lots,
//               direction_facing: row.direction,
//               currency_code: row.currency,
//               starting_price: Number(row.price),
//               weekly_rent: Number(row.weekly_rent),
//               rental_yield: Number(row.rental_yield),
//               status: row.status,
//             }),
//           ),
//         },
//         {},
//         false,
//       );
//     }

//     if (h.notEmpty(newProjectId)) {
//       await router.replace(
//         h.getRoute(routes.dashboard['products.edit.step'], {
//           project_id: newProjectId,
//           step: 2,
//         }),
//         undefined,
//         { shallow: true },
//       );
//     }

//     if (!updatedRows) {
//       if (formStep !== 5) {
//         await getProjectFromServer(newProjectId || projectId);
//       }

//       setFormStep(toStep || formStep + 1);
//       await router.push(
//         `${window.location.pathname}/?form_step=${toStep || formStep + 1}`,
//       );
//     }

//     setFormMode(h.form.FORM_MODE.EDIT);
//     setLoading(false);
//     if (formStep === 5 && toStep === 5)
//       await router.push(h.getRoute(routes.dashboard.products));
//   };

//   const [newFeatureNameInput, setNewFeatureNameInput] = useState('');
//   const [newFeatureTypeInput, setNewFeatureTypeInput] = useState('');
//   const [features, setFeatures] = useState(
//     Object.keys(paveCommon.config.constant.PROJECT.FEATURE).map((key) => {
//       return {
//         type: key,
//         name: paveCommon.config.constant.PROJECT.FEATURE[key].label,
//       };
//     }),
//   );

//   const handleCheckboxChange = (changedFeature) => {
//     if (
//       projectFeatures.find((feature) => feature.type === changedFeature.type)
//     ) {
//       setProjectFeatures(
//         projectFeatures.filter(
//           (feature) => feature.type !== changedFeature.type,
//         ),
//       );
//     } else {
//       setProjectFeatures([...projectFeatures, changedFeature]);
//     }
//   };

//   const createNewFeature = (type) => {
//     if (!features.find((feature) => feature.type === type)) {
//       setFeatures([...features, { type: type, name: newFeatureNameInput }]);
//     }

//     if (!projectFeatures.find((feature) => feature.type === type)) {
//       setProjectFeatures([
//         ...projectFeatures,
//         { type: type, name: newFeatureNameInput },
//       ]);
//     }

//     setNewFeatureNameInput('');
//     setNewFeatureTypeInput('');
//   };

//   const formStepDescription = [
//     {
//       number: 1,
//       description: 'Create project',
//     },
//     {
//       number: 2,
//       description: 'List features',
//     },
//     {
//       number: 3,
//       description: 'Create price list',
//     },
//     {
//       number: 4,
//       description: 'Load images and videos',
//     },
//     {
//       number: 5,
//       description: 'Preview',
//     },
//   ];

//   const ToolTipDisplay = (props) => (
//     <div className="row justify-content-center">
//       {/*<OverlayTrigger trigger="click" placement="right" overlay={*/}
//       {/*	<Popover id="project-form-tooltip-popover" style={{ backgroundColor: "#025146" }}>*/}
//       {/*		<PopoverContent style={{ color: "#ffffff" }}>{popoverText(props.step)}</PopoverContent>*/}
//       {/*	</Popover>*/}
//       {/*}>*/}
//       <div className="col-1 text-right">
//         <IconToolTip />
//       </div>
//       <div className="col-10">
//         <span className="pt-3">{popoverText(props.step)}</span>
//       </div>
//       {/* </OverlayTrigger>*/}
//     </div>
//   );

//   const popoverText = (step) => {
//     switch (step) {
//       case 1:
//         return (
//           'A new project ready to market? Great! Do enter in as much as you can ' +
//           "below and you can always come back to anything you'd like to add or change later."
//         );
//       case 2:
//         return (
//           'Time to show off the features that get buyers excited! Here you can add all the features and facilities of the project.' +
//           'Anything missing from our list? No problem, go ahead and add as many extra features as you like.'
//         );
//       case 3:
//         return (
//           'Say goodbye to PDFs and Excel spreadsheets! Create and maintain a price list with associated features.' +
//           'Need to update the lists? No problem, simply add or remove rows or copy in an entirely new list.'
//         );
//       case 4:
//         return (
//           'You have a lot of high quality videos and images of the project I bet! Well this is where you get them uploaded and ' +
//           'tagged to be seen at a project level or tagged to individual units. Drag, drop or bulk upload.'
//         );
//       default:
//         return '';
//     }
//   };

//   const FeatureIconMapping = (props) => {
//     const { type } = props;

//     switch (type) {
//       case 'pool':
//         return <IconOrangePool {...props} fillColor="#025146" />;
//       case 'gym':
//         return <IconOrangeGym {...props} fillColor="#025146" />;
//       case 'concierge':
//         return <IconOrangeConcierge {...props} fillColor="#025146" />;
//       case 'tennis':
//         return <IconOrangeTennis {...props} fillColor="#025146" />;
//       case 'jacuzzi':
//         return <IconOrangeBath {...props} fillColor="#025146" />;
//       case 'sauna':
//         return <IconOrangeSauna {...props} fillColor="#025146" />;
//       case 'library':
//         return <IconOrangeCoworking {...props} fillColor="#025146" />;
//       case 'security':
//         return <IconOrangeSecurity {...props} fillColor="#025146" />;
//       case 'utility_area':
//         return <IconOrangeUtilityArea {...props} fillColor="#025146" />;
//       case 'garden':
//         return <IconOrangeGarden {...props} fillColor="#025146" />;
//       case 'games_room':
//         return <IconOrangeGameRoom {...props} fillColor="#025146" />;
//       case 'golf_simulator':
//         return <IconOrangeGolfSimulator {...props} fillColor="#025146" />;
//       case 'theater':
//         return <IconOrangeTheater {...props} fillColor="#025146" />;
//       case 'parking':
//         return <IconOrangeParking {...props} fillColor="#025146" />;
//       case 'dog_wash':
//         return <IconOrangeDogWash {...props} fillColor="#025146" />;
//       case 'residence_club':
//         return <IconOrangeResidenceClub {...props} fillColor="#025146" />;
//       case 'wine':
//         return <IconOrangeWine {...props} fillColor="#025146" />;
//       case 'steam_room':
//         return <IconOrangeSteamRoom {...props} fillColor="#025146" />;
//       case 'integrated_appliances':
//         return <IconIntegratedAppliances {...props} fillColor="#025146" />;
//       case 'secure_video_entry':
//         return <IconCCTV {...props} fillColor="#025146" />;
//       default:
//         return (
//           <FontAwesomeIcon {...props} icon={faCertificate} color="#025146" />
//         );
//     }
//   };

//   const projectMediasImagesUppy = useUppy(() => {
//     const accessToken =
//       typeof window !== 'undefined' ? h.cookie.getAccessToken() : '';

//     return new Uppy({
//       restrictions: {
//         allowedFileTypes: ['image/*'],
//       },
//     })
//       .use(XHRUpload, {
//         endpoint: `${config.apiUrl}/v1/staff/upload/${paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE}`,
//         headers: {
//           ['x-access-token']: accessToken,
//         },
//         timeout: 150000,
//         limit: 1,
//       })
//       .on('upload-success', (file, response) => {
//         setProjectMedias((projectMedias) => [
//           ...projectMedias,
//           {
//             url: response.body.file.full_file_url,
//             filename: response.body.file.file_name,
//             thumbnail: response.body.file.file_thumbnail,
//             type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//             tags: [],
//             // Temp ID
//             project_media_id: Date.now(),
//             new: true,
//           },
//         ]);
//       });
//   });

//   const projectMediasMp4Uppy = useUppy(() => {
//     const accessToken =
//       typeof window !== 'undefined' ? h.cookie.getAccessToken() : '';

//     return new Uppy({
//       restrictions: {
//         allowedFileTypes: ['video/mp4'],
//       },
//     })
//       .use(XHRUpload, {
//         endpoint: `${config.apiUrl}/v1/staff/upload/${paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO}`,
//         headers: {
//           ['x-access-token']: accessToken,
//         },
//         timeout: 150000,
//         limit: 1,
//       })
//       .on('upload-success', (file, response) => {
//         setProjectMedias((projectMedias) => [
//           ...projectMedias,
//           {
//             url: response.body.file.full_file_url,
//             filename: response.body.file.file_name,
//             thumbnail: response.body.file.file_thumbnail,
//             type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
//             tags: [],
//           },
//         ]);
//       });
//   });

//   const projectMediasEbrochuresUppy = useMemo(() => {
//     const accessToken =
//       typeof window !== 'undefined' ? h.cookie.getAccessToken() : '';

//     return new Uppy({
//       restrictions: {
//         allowedFileTypes: ['.pdf'],
//         maxNumberOfFiles: 1,
//       },
//     })
//       .use(XHRUpload, {
//         endpoint: `${config.apiUrl}/v1/staff/upload/${paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE}`,
//         headers: {
//           ['x-access-token']: accessToken,
//         },
//         timeout: 150000,
//         limit: 1,
//       })
//       .use(Transloadit, {
//         locale: {
//           strings: {
//             encoding: 'Processing',
//           },
//         },
//         params: {
//           auth: {
//             key: config.transloadit.key,
//           },
//           template_id: config.transloadit.template.extractPdfPages,
//         },
//         waitForEncoding: true,
//       })
//       .on('transloadit:complete', (response) => {
//         let additionalUploadedFiles = [];
//         if (response && response.results && response.results.thumbnailed) {
//           additionalUploadedFiles = response.results.thumbnailed.map(
//             (image, i) => {
//               return {
//                 url: `${config.cdnUrls[0]}/project/property/media/image/${image.original_basename}-${image.name}`,
//                 filename: `${image.original_basename}-${image.name}`,
//                 type: paveCommon.config.constant.UPLOAD.TYPE
//                   .PROJECT_MEDIA_IMAGE,
//                 tags: [
//                   paveCommon.config.constant.PROPERTY.MEDIA.TAG.BROCHURE,
//                   paveCommon.config.constant.PROPERTY.MEDIA.TAG.FACTSHEET,
//                   paveCommon.config.constant.PROPERTY.MEDIA.TAG.PROJECT,
//                 ],
//                 // Temp ID
//                 project_media_id: Date.now() + i,
//                 new: true,
//               };
//             },
//           );
//           h.general.prompt(
//             {
//               title: 'One quick question',
//               message: `Would you also like this Brochure / Fact Sheet to be tagged to all properties?`,
//             },
//             (status) => {
//               h.general.pdfSelectedTagPrompt(
//                 {
//                   title: 'One quick question',
//                   message: `Select tag/s for Brochures / Fact Sheet. <br /><br /> <input type="checkbox" id="brochure"  checked /> Brochures  <br />
//               <input type="checkbox" id="factsheet" checked /> Fact Sheet`,
//                 },
//                 (res) => {
//                   setProjectMedias((projectMedias) => [
//                     ...projectMedias,
//                     ...additionalUploadedFiles.map((file) => {
//                       const tags = [
//                         paveCommon.config.constant.PROPERTY.MEDIA.TAG.PROJECT,
//                       ];

//                       if (res && res.isConfirmed && res.value.brochure) {
//                         tags.push(
//                           paveCommon.config.constant.PROPERTY.MEDIA.TAG
//                             .BROCHURE,
//                         );
//                       }
//                       if (res && res.isConfirmed && res.value.factsheet) {
//                         tags.push(
//                           paveCommon.config.constant.PROPERTY.MEDIA.TAG
//                             .FACTSHEET,
//                         );
//                       }

//                       return {
//                         ...file,
//                         unitsSelected: status
//                           ? rows.map((row) => row.project_property_id)
//                           : [],
//                         tags,
//                       };
//                     }),
//                   ]);
//                 },
//               );
//             },
//           );
//         }
//       })
//       .on('upload-success', (file, response) => {
//         if (response && response.body && response.body.file) {
//           setProjectMedias((projectMedias) => [
//             ...projectMedias,
//             {
//               url: response.body.file.full_file_url,
//               filename: response.body.file.file_name,
//               type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE,
//               tags: [],
//             },
//           ]);
//         }
//       });
//   }, [rows]);

//   // Merge and Reorder Image Medias
//   const mergeReorderedImageMedias = useCallback(
//     (sortedMedia) => {
//       let medias = sortedMedia;

//       if (typeof medias !== 'function') {
//         const otherMedias = projectMedias.filter(
//           (media) =>
//             media.type !==
//             paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//         );
//         medias = [...medias, ...otherMedias];
//       }

//       setProjectMedias(medias);
//     },
//     [projectMedias],
//   );

//   return (
//     <div className="p-3 row">
//       <div className="form-steps">
//         {formStepDescription.map((step) => (
//           <div className="step text-center">
//             <button
//               className={step.number === formStep ? 'selected' : ''}
//               onClick={() => handleSubmit(step.number)}
//             >
//               {step.number}
//             </button>
//             <p className="mt-2">{step.description}</p>
//           </div>
//         ))}
//       </div>

//       {formStep === 1 && (
//         <>
//           <div
//             className="modal-body"
//             style={{
//               overflowY: 'auto',
//               height: '100%',
//               pointerEvents: hasMarketingAccess ? 'all' : 'none',
//             }}
//           >
//             <div>
//               <div className="mb-5">
//                 <ToolTipDisplay step={formStep} />
//               </div>
//               <h3>Project</h3>
//               <div className="modal-input-group">
//                 <label>Name*</label>
//                 <input
//                   placeholder="Name"
//                   value={projectNameInput}
//                   onChange={(e) => {
//                     setProjectNameInput(e.target.value);
//                     if (h.notEmpty(e.target.value)) setProjectNameError('');
//                   }}
//                 />
//                 {h.notEmpty(projectNameError) && (
//                   <span className="text-danger">{projectNameError}</span>
//                 )}
//               </div>
//               <div className="modal-input-group">
//                 <label>Description</label>
//                 <textarea
//                   placeholder="Enter a description of the project, you have up to 500 characters..."
//                   value={projectDescriptionInput}
//                   rows={5}
//                   onChange={(e) => setProjectDescriptionInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Project type*</label>
//                 <select
//                   placeholder="Project type"
//                   value={projectTypeInput}
//                   onChange={(e) => {
//                     setProjectTypeInput(e.target.value);
//                     if (
//                       e.target.value !== 'project-type' &&
//                       h.notEmpty(e.target.value)
//                     )
//                       setProjectTypeError('');
//                   }}
//                 >
//                   <option value="project-type">Select project type</option>
//                   {Object.values(paveCommon.config.constant.PROJECT.TYPE).map(
//                     (type) => (
//                       <option value={type}>{type}</option>
//                     ),
//                   )}
//                 </select>
//                 {h.notEmpty(projectTypeError) && formStep === 1 && (
//                   <span className="text-danger">{projectTypeError}</span>
//                 )}
//               </div>{' '}
//               <div className="modal-input-group">
//                 <label>Currency code*</label>
//                 <select
//                   defaultChecked="currency-code"
//                   placeholder="Currency code"
//                   value={projectCurrencyCodeInput}
//                   onChange={(e) => {
//                     setProjectCurrencyCodeInput(e.target.value);
//                     if (
//                       e.target.value !== 'currency-code' &&
//                       h.notEmpty(e.target.value)
//                     )
//                       setProjectCurrencyCodeError('');
//                   }}
//                 >
//                   <option value="currency-code">Select currency code</option>
//                   {Object.values(paveCommon.config.currency).map((currency) => (
//                     <option value={currency.code}>{currency.name}</option>
//                   ))}
//                 </select>
//                 {h.notEmpty(projectCurrencyCodeError) && formStep === 1 && (
//                   <span className="text-danger">
//                     {projectCurrencyCodeError}
//                   </span>
//                 )}
//               </div>
//               <div className="modal-input-group">
//                 <label>Size format*</label>
//                 <select
//                   defaultChecked="size-format"
//                   placeholder="Size format"
//                   value={projectSizeFormatInput}
//                   onChange={(e) => {
//                     setProjectSizeFormatInput(e.target.value);
//                     if (e.target.value !== 'size-format')
//                       setProjectSizeFormatError('');
//                   }}
//                 >
//                   <option value="size-format">Select size format</option>
//                   <option value="sqm">sqm</option>
//                   <option value="sqft">sqft</option>
//                   <option value="tsubo (坪)">tsubo (坪)</option>
//                 </select>
//                 {h.notEmpty(projectSizeFormatError) && formStep === 1 && (
//                   <span className="text-danger">{projectSizeFormatError}</span>
//                 )}
//               </div>
//               <div className="modal-input-group">
//                 <label>Completion date</label>
//                 <input
//                   type="month"
//                   placeholder="Completion date"
//                   value={projectCompletionDateInput}
//                   onChange={(e) =>
//                     setProjectCompletionDateInput(e.target.value)
//                   }
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Key Stats</label>
//                 <CommonTextAreaEditor
//                   placeholder="Enter the key stats of the project..."
//                   message={projectKeyStatsInput}
//                   setMessage={(e) => setProjectKeyStatsInput(e)}
//                   showEditor={false}
//                   setLoading={setLoading}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Project Highlights</label>
//                 <CommonTextAreaEditor
//                   placeholder="Enter the highlights of the project..."
//                   message={projectHighlightsInput}
//                   setMessage={(e) => setProjectHighlightsInput(e)}
//                   showEditor={false}
//                   setLoading={setLoading}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Why Invest</label>
//                 <CommonTextAreaEditor
//                   placeholder="Enter reasons to invest in the project..."
//                   message={projectWhyInvestInput}
//                   setMessage={(e) => setProjectWhyInvestInput(e)}
//                   showEditor={false}
//                   setLoading={setLoading}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Shopping</label>
//                 <CommonTextAreaEditor
//                   placeholder="Enter shopping amenities of the project..."
//                   message={projectShoppingInput}
//                   setMessage={(e) => setProjectShoppingInput(e)}
//                   showEditor={false}
//                   setLoading={setLoading}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Transport</label>
//                 <CommonTextAreaEditor
//                   placeholder="Enter nearby transport services of the project..."
//                   message={projectTransportInput}
//                   setMessage={(e) => setProjectTransportInput(e)}
//                   showEditor={false}
//                   setLoading={setLoading}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Education</label>
//                 <CommonTextAreaEditor
//                   placeholder="Enter education facilities of the project..."
//                   message={projectEducationInput}
//                   setMessage={(e) => setProjectEducationInput(e)}
//                   showEditor={false}
//                   setLoading={setLoading}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Project Header</label>
//                 <button
//                   className="common-button"
//                   onClick={handleProjectHeaderImageUpload}
//                 >
//                   <FontAwesomeIcon icon={faUpload} size="2x" />
//                 </button>
//               </div>
//               {h.isEmpty(projectHeaderInfoCoverPictureUrl.url) && (
//                 <div
//                   {...projectHeaderImageDragAndDrop.getRootProps({
//                     className: 'dropzone mt-2',
//                   })}
//                 >
//                   <input {...projectHeaderImageDragAndDrop.getInputProps()} />
//                   <p>Drag and drop some files here, or click to select files</p>
//                   <em>(Only jpeg and png images will be accepted)</em>
//                 </div>
//               )}
//               <div className="uploaded-files">
//                 {h.notEmpty(projectHeaderInfoCoverPictureUrl.url) && (
//                   <ProjectTeamBehindForm
//                     url={projectHeaderInfoCoverPictureUrl.url}
//                     title={projectHeaderInfoCoverPictureUrl.title}
//                     filename={projectHeaderInfoCoverPictureUrl.filename}
//                     onUpdate={(updated) =>
//                       setProjectHeaderInfoCoverPictureUrl(updated)
//                     }
//                     onDelete={(deleted) =>
//                       setProjectHeaderInfoCoverPictureUrl(deleted)
//                     }
//                   />
//                 )}
//               </div>
//               <input
//                 ref={projectHeaderImageUploadInputRef}
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 style={{ display: 'none' }}
//                 onChange={(e) => handleFilePickerChange(e, 'project_header')}
//               />
//             </div>

//             <div className="mt-4">
//               <div className="modal-input-group">
//                 <label>Developer Name</label>
//                 <input
//                   placeholder="Name"
//                   value={developerNameInput}
//                   onChange={(e) => setDeveloperNameInput(e.target.value)}
//                 />
//               </div>
//               {/*  <h3>Developer</h3>
//               <div className="modal-input-group">
//                 <label>Name</label>
//                 <input
//                   placeholder="Name"
//                   value={developerNameInput}
//                   onChange={(e) => setDeveloperNameInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Description</label>
//                 <textarea
//                   maxLength="500"
//                   placeholder="Enter a description of the Developer, you have up to 500 characters..."
//                   value={developerDescriptionInput}
//                   rows={5}
//                   onChange={(e) => setDeveloperDescriptionInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Developer Logo</label>
//                 <button
//                   className="common-button"
//                   onClick={handleDeveloperLogoImageUpload}
//                 >
//                   <FontAwesomeIcon icon={faUpload} size="2x" />
//                 </button>
//               </div>
//               {h.isEmpty(developerLogoUrl.url) && (
//                 <div
//                   {...developerLogoDragAndDrop.getRootProps({
//                     className: 'dropzone mt-2',
//                   })}
//                 >
//                   <input {...developerLogoDragAndDrop.getInputProps()} />
//                   <p>Drag and drop some files here, or click to select files</p>
//                   <em>(Only jpeg and png images will be accepted)</em>
//                 </div>
//               )}
//               <div className="uploaded-files">
//                 {h.notEmpty(developerLogoUrl.url) && (
//                   <ProjectTeamBehindForm
//                     url={developerLogoUrl.url}
//                     title={developerLogoUrl.title}
//                     filename={developerLogoUrl.filename}
//                     onUpdate={(updated) => setDeveloperLogoUrl(updated)}
//                     onDelete={(deleted) => setDeveloperLogoUrl(deleted)}
//                   />
//                 )}
//               </div>
//               <input
//                 ref={developerLogoImageUploadInputRef}
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 style={{ display: 'none' }}
//                 onChange={(e) => handleFilePickerChange(e, 'developer_logo')}
//               />
//             </div>

//             <div className="mt-4">
//               <h3>Architect</h3>
//               <div className="modal-input-group">
//                 <label>Name</label>
//                 <input
//                   placeholder="Name"
//                   value={architectNameInput}
//                   onChange={(e) => setArchitectNameInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Description</label>
//                 <textarea
//                   maxLength="500"
//                   placeholder="Enter a description of the Architect, you have up to 500 characters..."
//                   value={architectDescriptionInput}
//                   rows={5}
//                   onChange={(e) => setArchitectDescriptionInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Architect Logo</label>
//                 <button
//                   className="common-button"
//                   onClick={handleArchitectLogoImageUpload}
//                 >
//                   <FontAwesomeIcon icon={faUpload} size="2x" />
//                 </button>
//               </div>
//               {h.isEmpty(architectLogoUrl.url) && (
//                 <div
//                   {...architectLogoDragAndDrop.getRootProps({
//                     className: 'dropzone mt-2',
//                   })}
//                 >
//                   <input {...architectLogoDragAndDrop.getInputProps()} />
//                   <p>Drag and drop some files here, or click to select files</p>
//                   <em>(Only jpeg and png images will be accepted)</em>
//                 </div>
//               )}
//               <div className="uploaded-files">
//                 {h.notEmpty(architectLogoUrl.url) && (
//                   <ProjectTeamBehindForm
//                     url={architectLogoUrl.url}
//                     title={architectLogoUrl.title}
//                     filename={architectLogoUrl.filename}
//                     onUpdate={(updated) => setArchitectLogoUrl(updated)}
//                     onDelete={(deleted) => setArchitectLogoUrl(deleted)}
//                   />
//                 )}
//               </div>
//               <input
//                 ref={architectLogoImageUploadInputRef}
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 style={{ display: 'none' }}
//                 onChange={(e) => handleFilePickerChange(e, 'architect_logo')}
//               />
//             </div>

//             <div className="mt-4">
//               <h3>Builder</h3>
//               <div className="modal-input-group">
//                 <label>Name</label>
//                 <input
//                   placeholder="Name"
//                   value={builderNameInput}
//                   onChange={(e) => setBuilderNameInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Description</label>
//                 <textarea
//                   maxLength="500"
//                   placeholder="Enter a description of the Builder, you have up to 500 characters..."
//                   value={builderDescriptionInput}
//                   rows={5}
//                   onChange={(e) => setBuilderDescriptionInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Builder Logo</label>
//                 <button
//                   className="common-button"
//                   onClick={handleBuilderLogoImageUpload}
//                 >
//                   <FontAwesomeIcon icon={faUpload} size="2x" />
//                 </button>
//               </div>
//               {h.isEmpty(builderLogoUrl.url) && (
//                 <div
//                   {...builderLogoDragAndDrop.getRootProps({
//                     className: 'dropzone mt-2',
//                   })}
//                 >
//                   <input {...builderLogoDragAndDrop.getInputProps()} />
//                   <p>Drag and drop some files here, or click to select files</p>
//                   <em>(Only jpeg and png images will be accepted)</em>
//                 </div>
//               )}
//               <div className="uploaded-files">
//                 {h.notEmpty(builderLogoUrl.url) && (
//                   <ProjectTeamBehindForm
//                     url={builderLogoUrl.url}
//                     title={builderLogoUrl.title}
//                     filename={builderLogoUrl.filename}
//                     onUpdate={(updated) => setBuilderLogoUrl(updated)}
//                     onDelete={(deleted) => setBuilderLogoUrl(deleted)}
//                   />
//                 )}
//               </div>
//               <input
//                 ref={builderLogoImageUploadInputRef}
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 style={{ display: 'none' }}
//                 onChange={(e) => handleFilePickerChange(e, 'builder_logo')}
//               />
//             </div>

//             <div className="mt-4">
//               <h3>Landscaper</h3>
//               <div className="modal-input-group">
//                 <label>Name</label>
//                 <input
//                   placeholder="Name"
//                   value={landscaperNameInput}
//                   onChange={(e) => setLandscaperNameInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Description</label>
//                 <textarea
//                   maxLength="500"
//                   placeholder="Enter a description of the Landscaper, you have up to 500 characters..."
//                   value={landscaperDescriptionInput}
//                   rows={5}
//                   onChange={(e) =>
//                     setLandscaperDescriptionInput(e.target.value)
//                   }
//                 />
//               </div>
//               <div className="modal-input-group">
//                 <label>Landscaper Logo</label>
//                 <button
//                   className="common-button"
//                   onClick={handleLandscaperLogoImageUpload}
//                 >
//                   <FontAwesomeIcon icon={faUpload} size="2x" />
//                 </button>
//               </div>
//               {h.isEmpty(landscaperLogoUrl.url) && (
//                 <div
//                   {...landscaperLogoDragAndDrop.getRootProps({
//                     className: 'dropzone mt-2',
//                   })}
//                 >
//                   <input {...landscaperLogoDragAndDrop.getInputProps()} />
//                   <p>Drag and drop some files here, or click to select files</p>
//                   <em>(Only jpeg and png images will be accepted)</em>
//                 </div>
//               )}
//               <div className="uploaded-files">
//                 {h.notEmpty(landscaperLogoUrl.url) && (
//                   <ProjectTeamBehindForm
//                     url={landscaperLogoUrl.url}
//                     title={landscaperLogoUrl.title}
//                     filename={landscaperLogoUrl.filename}
//                     onUpdate={(updated) => setLandscaperLogoUrl(updated)}
//                     onDelete={(deleted) => setLandscaperLogoUrl(deleted)}
//                   />
//                 )}
//               </div>
//               <input
//                 ref={landscaperLogoImageUploadInputRef}
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 style={{ display: 'none' }}
//                 onChange={(e) => handleFilePickerChange(e, 'landscaper_logo')}
//               /> */}

//               <div className="modal-input-group mt-4">
//                 <label>Project Address</label>
//                 <ReactGoogleAutocomplete
//                   apiKey={config.google.apiKey}
//                   onPlaceSelected={(place) => {
//                     if (place && place.place_id) {
//                       place.lat = place.geometry.location.lat();
//                       place.lng = place.geometry.location.lng();
//                       console.log(place);
//                       setGoogleAutocompleteValue(place.formatted_address);
//                       setGoogleMapsPlace(place);
//                     }
//                   }}
//                   options={{
//                     types: [],
//                   }}
//                   placeholder="Search a location"
//                   onChange={(e) => {
//                     console.log(e.target.value);

//                     setGoogleAutocompleteValue(e.target.value);
//                   }}
//                   value={
//                     h.notEmpty(googleAutocompleteValue)
//                       ? googleAutocompleteValue
//                       : ''
//                   }
//                 />
//               </div>

//               {!googleMapsPlace ? (
//                 <iframe
//                   width="100%"
//                   height="450"
//                   style={{ border: 0 }}
//                   loading="lazy"
//                   allowFullScreen
//                   src={`https://www.google.com/maps/embed/v1/search?q= &key=${config.google.apiKey}`}
//                 ></iframe>
//               ) : (
//                 <iframe
//                   width="100%"
//                   height="450"
//                   style={{ border: 0 }}
//                   loading="lazy"
//                   allowFullScreen
//                   src={`https://www.google.com/maps/embed/v1/place?q=place_id:${googleMapsPlace?.place_id}&key=${config.google.apiKey}`}
//                 ></iframe>
//               )}
//             </div>
//             <div
//               className="d-flex align-items-center mt-4"
//               style={{ pointerEvents: 'all' }}
//             >
//               <div style={{ flex: 1 }} />
//               <button
//                 className="common-button flex-fill"
//                 onClick={() => handleSubmit(formStep + 1)}
//               >
//                 Save & Next Step
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {formStep === 2 && (
//         <>
//           <div
//             className="modal-body"
//             style={{
//               overflowY: 'auto',
//               height: '100%',
//               pointerEvents: hasMarketingAccess ? 'all' : 'none',
//             }}
//           >
//             <div className="mb-5">
//               <ToolTipDisplay step={formStep} />
//             </div>
//             <div className="d-flex flex-wrap ">
//               {features
//                 .sort((a, b) => a.name.localeCompare(b.name))
//                 .map((feature) => (
//                   <div style={{ flex: '50%' }}>
//                     <div className="modal-checkbox-input-group align-items-center mb-1">
//                       <label
//                         htmlFor={feature.type}
//                         className="cb-container-normal"
//                       >
//                         <FeatureIconMapping
//                           className="mr-2"
//                           style={{ width: 20 }}
//                           type={feature.type}
//                         />
//                         {feature.name}
//                         <input
//                           type="checkbox"
//                           id={feature.type}
//                           checked={
//                             !!projectFeatures.find(
//                               (i) => i.type === feature.type,
//                             )
//                           }
//                           onClick={() => handleCheckboxChange(feature)}
//                         />
//                         <span className="checkmark"></span>
//                       </label>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//             {/*<div className="modal-checkbox-input-group align-items-center mb-1">*/}
//             {/*	<input type="checkbox" id="new-feature" checked={false} disabled={true}/>*/}
//             {/*	<label>*/}
//             {/*		<input*/}
//             {/*			style={{ width: 250 }}*/}
//             {/*			placeholder="Enter new feature name"*/}
//             {/*			value={newFeatureNameInput}*/}
//             {/*			onChange={e => setNewFeatureNameInput(e.target.value)}*/}
//             {/*			onKeyPress={(e) => {*/}
//             {/*				if (h.cmpStr(e.key, 'Enter')) {*/}
//             {/*					createNewFeature(new Date().getTime());*/}
//             {/*				}*/}
//             {/*			}}*/}
//             {/*		/>*/}
//             {/*		<FeatureIconMapping className="ml-2" style={{ width: 20 }} type={'new'}/>*/}
//             {/*	</label>*/}
//             {/*</div>*/}
//             {/*<div className="mt-4">*/}
//             {/*	<h3>Create new feature</h3>*/}
//             {/*	<div className="modal-input-group">*/}
//             {/*		<label>Name</label>*/}
//             {/*		<input placeholder="Name" value={newFeatureNameInput}*/}
//             {/*			   onChange={e => setNewFeatureNameInput(e.target.value)}/>*/}
//             {/*	</div>*/}
//             {/*	<div className="modal-input-group">*/}
//             {/*		<label>Type</label>*/}
//             {/*		<input placeholder="Description" value={newFeatureTypeInput}*/}
//             {/*			   onChange={e => setNewFeatureTypeInput(e.target.value)}/>*/}
//             {/*	</div>*/}
//             {/*	<button className="common-button" style={{ width: 180 }} onClick={createNewFeature}>Create*/}
//             {/*		Feature*/}
//             {/*	</button>*/}
//             {/*</div>*/}
//             <div
//               className="d-flex align-items-center mt-4"
//               style={{ pointerEvents: 'all' }}
//             >
//               <button
//                 className="common-button transparent-bg flex-fill mr-2"
//                 onClick={() => handleSubmit(formStep - 1)}
//               >
//                 Prev Step
//               </button>
//               <button
//                 className="common-button flex-fill"
//                 onClick={() => handleSubmit(formStep + 1)}
//               >
//                 Save & Next Step
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {formStep === 3 && (
//         <>
//           <div
//             className="modal-body"
//             style={{
//               overflowY: 'auto',
//               height: '100%',
//               pointerEvents: hasMarketingAccess ? 'all' : 'none',
//             }}
//           >
//             <div className="mb-5">
//               <ToolTipDisplay step={formStep} />
//             </div>
//             <div className="mt-4">
//               <DataGrid
//                 columns={columns}
//                 rows={rows}
//                 rowGetter={(i) => rows[i]}
//                 rowsCount={rows.length}
//                 enableCellSelect
//                 getCellActions={getCellActions}
//                 onGridRowsUpdated={onGridRowsUpdated}
//                 onGridSort={(e) => {
//                   const r = [...rows];
//                   let sorted = r;
//                   if (sort === 0) {
//                     setSort(1);
//                     sorted = r.sort((a, b) => {
//                       return b[e].localeCompare(a[e], undefined, {
//                         numeric: true,
//                         sensitivity: 'base',
//                       });
//                     });
//                   } else if (sort === 1) {
//                     setSort(2);
//                     sorted = r.sort((a, b) => {
//                       return a[e].localeCompare(b[e], undefined, {
//                         numeric: true,
//                         sensitivity: 'base',
//                       });
//                     });
//                   } else {
//                     setSort(0);
//                   }

//                   setRows(sorted);
//                   updateRow({ updatedRows: sorted });
//                 }}
//                 rowSelection={{
//                   showCheckbox: true,
//                   onRowsSelected: onRowsSelected,
//                   onRowsDeselected: onRowsDeselected,
//                   selectBy: {
//                     indexes: selectedIndexes,
//                   },
//                 }}
//               />
//             </div>

//             <div
//               className={
//                 'd-flex mt-2 ' +
//                 (selectedIndexes.length > 0
//                   ? 'justify-content-between'
//                   : 'justify-content-end ')
//               }
//             >
//               {selectedIndexes.length > 0 && (
//                 <button
//                   className="common-button d-fill"
//                   style={{ width: 200 }}
//                   onClick={deleteRows}
//                 >
//                   Delete selected rows
//                 </button>
//               )}
//               <button
//                 className="common-button d-fill"
//                 style={{ width: 180 }}
//                 onClick={addRow}
//               >
//                 Add row
//               </button>
//             </div>
//             <div
//               className="d-flex align-items-center mt-4"
//               style={{ pointerEvents: 'all' }}
//             >
//               <button
//                 className="common-button transparent-bg flex-fill mr-2"
//                 onClick={() => handleSubmit(formStep - 1)}
//               >
//                 Prev Step
//               </button>
//               <button
//                 className="common-button flex-fill"
//                 onClick={() => handleSubmit(formStep + 1)}
//               >
//                 Save & Next Step
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {formStep === 4 && (
//         <>
//           <div
//             className="modal-body"
//             style={{
//               overflowY: 'auto',
//               height: '100%',
//               pointerEvents: hasMarketingAccess ? 'all' : 'none',
//             }}
//           >
//             <div className="mb-5">
//               <ToolTipDisplay step={formStep} />
//             </div>

//             <ProjectWizardMediaUpload
//               title="Images"
//               hintText="Only jpeg and png images will be accepted"
//               mediaType={
//                 paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE
//               }
//               acceptedFileTypes={['image/png', 'image/gif', 'image/jpeg']}
//               projectMedias={projectMedias.filter(
//                 (media) =>
//                   media.type ===
//                   paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//               )}
//               setProjectMedias={mergeReorderedImageMedias}
//               setDeleteProjectMedias={setDeleteProjectMedias}
//               projectProperties={rows}
//               projectCurrencyCode={projectCurrencyCodeInput}
//               projectMediasImagesUppy={projectMediasImagesUppy}
//               setLoading={setLoading}
//               heroImageMediaId={heroImageMediaId}
//               setHeroImageMediaId={setHeroImageMediaId}
//             />

//             <div className="mt-4">
//               <ProjectWizardMediaUpload
//                 title="Videos"
//                 hintText="Only videos will be accepted"
//                 mediaType={
//                   paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO
//                 }
//                 acceptedFileTypes={['video/mp4']}
//                 projectMedias={projectMedias}
//                 setProjectMedias={setProjectMedias}
//                 setDeleteProjectMedias={setDeleteProjectMedias}
//                 projectProperties={rows}
//                 projectMediasImagesUppy={projectMediasMp4Uppy}
//                 projectCurrencyCode={projectCurrencyCodeInput}
//                 setLoading={setLoading}
//               />
//             </div>

//             <div className="mt-4 pb-2">
//               <div className="modal-input-group">
//                 <h3>3D Link / Iframe</h3>
//                 <input
//                   placeholder="Iframe Link"
//                   value={iframeUrl}
//                   onChange={(e) => setIframeUrl(e.target.value)}
//                 />
//                 {h.notEmpty(iframeUrlError) && (
//                   <span className="text-danger">{iframeUrlError}</span>
//                 )}
//               </div>
//               <button
//                 style={{ width: 180 }}
//                 className="common-button"
//                 onClick={addIframeLink}
//               >
//                 Add Iframe link
//               </button>
//               <div>
//                 {projectMedias.map((media) => {
//                   if (
//                     media.type ===
//                     paveCommon.config.constant.UPLOAD.TYPE
//                       .PROJECT_MEDIA_RENDER_3D
//                   ) {
//                     return (
//                       <ProjectMediaForm
//                         projectMediaId={media.project_media_id}
//                         url={media.url}
//                         title={media.title}
//                         filename={media.filename}
//                         type={media.type}
//                         projectCurrencyCode={projectCurrencyCodeInput}
//                         onUpdate={(updated) => {
//                           setProjectMedias((projectMedias) =>
//                             projectMedias.map((i) => {
//                               if (
//                                 updated.projectMediaId &&
//                                 i.project_media_id === updated.projectMediaId
//                               ) {
//                                 // This is for existing media in project
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else if (
//                                 // This is for new media that hasn't been saved in project yet
//                                 !updated.projectMediaId &&
//                                 i.url === updated.url &&
//                                 i.type === updated.type
//                               ) {
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else {
//                                 return { ...i };
//                               }
//                             }),
//                           );
//                         }}
//                         onDelete={(deleted) => {
//                           let deletedRecord;
//                           setProjectMedias((projectMedias) => {
//                             if (deleted.projectMediaId) {
//                               // This is existing media in project
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.project_media_id ===
//                                   deleted.projectMediaId,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             } else {
//                               // This is new media that hasn't been saved into project yet
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.type === deleted.type &&
//                                   projectMedia.url === deleted.url,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             }
//                             return projectMedias;
//                           });
//                           setDeleteProjectMedias((deleteProjectMedias) => [
//                             ...deleteProjectMedias,
//                             deletedRecord,
//                           ]);
//                         }}
//                         units={rows}
//                         unitsSelected={media.unitsSelected}
//                         tags={media.tags}
//                       />
//                     );
//                   }
//                 })}
//               </div>
//             </div>
//             <div className="mt-4 pb-2">
//               <div className="modal-input-group">
//                 <h3>YouTube</h3>
//                 <input
//                   placeholder="YouTube URL"
//                   value={youtubeVideoUrlInput}
//                   onChange={(e) => setYoutubeVideoUrlInput(e.target.value)}
//                 />
//                 {h.notEmpty(youtubeVideoUrlError) && (
//                   <span className="text-danger">{youtubeVideoUrlError}</span>
//                 )}
//               </div>
//               <button
//                 style={{ width: 180 }}
//                 className="common-button"
//                 onClick={addYoutubeVideo}
//               >
//                 Add youtube video
//               </button>
//               <div>
//                 {projectMedias.map((media) => {
//                   if (
//                     media.type ===
//                     paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE
//                   ) {
//                     return (
//                       <ProjectMediaForm
//                         projectMediaId={media.project_media_id}
//                         url={media.url}
//                         title={media.title}
//                         filename={media.filename}
//                         type={media.type}
//                         projectCurrencyCode={projectCurrencyCodeInput}
//                         onUpdate={(updated) => {
//                           setProjectMedias((projectMedias) =>
//                             projectMedias.map((i) => {
//                               if (
//                                 updated.projectMediaId &&
//                                 i.project_media_id === updated.projectMediaId
//                               ) {
//                                 // This is for existing media in project
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else if (
//                                 // This is for new media that hasn't been saved in project yet
//                                 !updated.projectMediaId &&
//                                 i.url === updated.url &&
//                                 i.type === updated.type
//                               ) {
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else {
//                                 return { ...i };
//                               }
//                             }),
//                           );
//                         }}
//                         onDelete={(deleted) => {
//                           let deletedRecord;
//                           setProjectMedias((projectMedias) => {
//                             if (deleted.projectMediaId) {
//                               // This is existing media in project
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.project_media_id ===
//                                   deleted.projectMediaId,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             } else {
//                               // This is new media that hasn't been saved into project yet
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.type === deleted.type &&
//                                   projectMedia.url === deleted.url,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             }
//                             return projectMedias;
//                           });
//                           setDeleteProjectMedias((deleteProjectMedias) => [
//                             ...deleteProjectMedias,
//                             deletedRecord,
//                           ]);
//                         }}
//                         units={rows}
//                         unitsSelected={media.unitsSelected}
//                         tags={media.tags}
//                       />
//                     );
//                   }
//                 })}
//               </div>
//             </div>

//             <div className="mt-4 pb-2">
//               <div className="modal-input-group">
//                 <h3>Vimeo</h3>
//                 <input
//                   placeholder="Vimeo URL"
//                   value={vimeoVideoUrlInput}
//                   onChange={(e) => setVimeoVideoUrlInput(e.target.value)}
//                 />
//                 {h.notEmpty(vimeoVideoUrlError) && (
//                   <span className="text-danger">{vimeoVideoUrlError}</span>
//                 )}
//               </div>
//               <button
//                 style={{ width: 180 }}
//                 className="common-button"
//                 onClick={addVimeoVideo}
//               >
//                 Add vimeo video
//               </button>
//               <div>
//                 {projectMedias.map((media) => {
//                   if (
//                     media.type ===
//                     paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO
//                   ) {
//                     return (
//                       <ProjectMediaForm
//                         projectMediaId={media.project_media_id}
//                         url={media.url}
//                         title={media.title}
//                         filename={media.filename}
//                         type={media.type}
//                         projectCurrencyCode={projectCurrencyCodeInput}
//                         onUpdate={(updated) => {
//                           setProjectMedias((projectMedias) =>
//                             projectMedias.map((i) => {
//                               if (
//                                 updated.projectMediaId &&
//                                 i.project_media_id === updated.projectMediaId
//                               ) {
//                                 // This is for existing media in project
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else if (
//                                 // This is for new media that hasn't been saved in project yet
//                                 !updated.projectMediaId &&
//                                 i.url === updated.url &&
//                                 i.type === updated.type
//                               ) {
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else {
//                                 return { ...i };
//                               }
//                             }),
//                           );
//                         }}
//                         onDelete={(deleted) => {
//                           let deletedRecord;
//                           setProjectMedias((projectMedias) => {
//                             if (deleted.projectMediaId) {
//                               // This is existing media in project
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.project_media_id ===
//                                   deleted.projectMediaId,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             } else {
//                               // This is new media that hasn't been saved into project yet
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.type === deleted.type &&
//                                   projectMedia.url === deleted.url,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             }
//                             return projectMedias;
//                           });
//                           setDeleteProjectMedias((deleteProjectMedias) => [
//                             ...deleteProjectMedias,
//                             deletedRecord,
//                           ]);
//                         }}
//                         units={rows}
//                         unitsSelected={media.unitsSelected}
//                         tags={media.tags}
//                       />
//                     );
//                   }
//                 })}
//               </div>
//             </div>

//             <div className="mt-4 pb-2">
//               <div className="modal-input-group">
//                 <h3>Wistia</h3>
//                 <input
//                   placeholder="Wistia URL"
//                   value={wistiaVideoUrlInput}
//                   onChange={(e) => setWistiaVideoUrlInput(e.target.value)}
//                 />
//                 {h.notEmpty(wistiaVideoUrlError) && (
//                   <span className="text-danger">{wistiaVideoUrlError}</span>
//                 )}
//               </div>
//               <button
//                 style={{ width: 180 }}
//                 className="common-button"
//                 onClick={addWistiaVideo}
//               >
//                 Add wistia video
//               </button>
//               <div>
//                 {projectMedias.map((media) => {
//                   if (
//                     media.type ===
//                     paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA
//                   ) {
//                     return (
//                       <ProjectMediaForm
//                         projectMediaId={media.project_media_id}
//                         url={media.url}
//                         title={media.title}
//                         filename={media.filename}
//                         type={media.type}
//                         projectCurrencyCode={projectCurrencyCodeInput}
//                         onUpdate={(updated) => {
//                           setProjectMedias((projectMedias) =>
//                             projectMedias.map((i) => {
//                               if (
//                                 updated.projectMediaId &&
//                                 i.project_media_id === updated.projectMediaId
//                               ) {
//                                 // This is for existing media in project
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else if (
//                                 // This is for new media that hasn't been saved in project yet
//                                 !updated.projectMediaId &&
//                                 i.url === updated.url &&
//                                 i.type === updated.type
//                               ) {
//                                 return {
//                                   ...i,
//                                   title: updated.title,
//                                   unitsSelected: updated.unitsSelected,
//                                   tags: updated.tags,
//                                 };
//                               } else {
//                                 return { ...i };
//                               }
//                             }),
//                           );
//                         }}
//                         onDelete={(deleted) => {
//                           let deletedRecord;
//                           setProjectMedias((projectMedias) => {
//                             if (deleted.projectMediaId) {
//                               // This is existing media in project
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.project_media_id ===
//                                   deleted.projectMediaId,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             } else {
//                               // This is new media that hasn't been saved into project yet
//                               const deletedIndex = projectMedias.findIndex(
//                                 (projectMedia) =>
//                                   projectMedia.type === deleted.type &&
//                                   projectMedia.url === deleted.url,
//                               );
//                               deletedRecord = projectMedias[deletedIndex];
//                               if (deletedIndex > -1) {
//                                 projectMedias.splice(deletedIndex, 1);
//                               }
//                             }
//                             return projectMedias;
//                           });
//                           setDeleteProjectMedias((deleteProjectMedias) => [
//                             ...deleteProjectMedias,
//                             deletedRecord,
//                           ]);
//                         }}
//                         units={rows}
//                         unitsSelected={media.unitsSelected}
//                         tags={media.tags}
//                       />
//                     );
//                   }
//                 })}
//               </div>
//             </div>

//             <div className="mt-4">
//               <ProjectWizardMediaUpload
//                 title="PDF Brochures and Fact Sheets"
//                 hintText="Only pdf files will be accepted"
//                 mediaType={
//                   paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE
//                 }
//                 acceptedFileTypes={['application/pdf']}
//                 projectMedias={projectMedias}
//                 setProjectMedias={setProjectMedias}
//                 setDeleteProjectMedias={setDeleteProjectMedias}
//                 projectProperties={rows}
//                 projectCurrencyCode={projectCurrencyCodeInput}
//                 projectMediasEbrochuresUppy={projectMediasEbrochuresUppy}
//                 setLoading={setLoading}
//                 maxFilesAllowed={1}
//               />
//             </div>

//             <div
//               className="d-flex align-items-center mt-4"
//               style={{ pointerEvents: 'all' }}
//             >
//               <button
//                 className="common-button transparent-bg flex-fill mr-2"
//                 onClick={() => handleSubmit(formStep - 1)}
//               >
//                 Prev Step
//               </button>
//               <button
//                 className="common-button flex-fill"
//                 onClick={() => handleSubmit(formStep + 1)}
//               >
//                 Save & Next Step
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//       {formStep === 5 && (
//         <div
//           className={'modal-body preview-body animate-fadeIn'}
//           style={{
//             overflowY: 'auto',
//             height: '100%',
//             width: '100vw',
//             marginLeft: '-10vw',
//             marginRight: '-10vw',
//           }}
//         >
//           <Preview
//             project={{
//               name: projectNameInput,
//               description: projectDescriptionInput,
//               location_google_place_raw: googleMapsPlace,
//               location_address_1: googleAutocompleteValue,
//               completion_date: projectCompletionDateInput,
//               features: projectFeatures,
//               key_stats: projectKeyStatsInput,
//               project_highlights: projectHighlightsInput,
//               why_invest: projectWhyInvestInput,
//               shopping: projectShoppingInput,
//               transport: projectTransportInput,
//               education: projectEducationInput,
//               location_google_place_id: h.notEmpty(googleMapsPlace)
//                 ? googleMapsPlace.place_id
//                 : '',
//               projectMedias: projectMedias,
//             }}
//           />
//           <div
//             className="d-flex align-items-center mt-4"
//             style={{ pointerEvents: 'all' }}
//           >
//             <button
//               className="common-button transparent-bg flex-fill mr-2"
//               onClick={() => handleSubmit(formStep - 1)}
//             >
//               Prev Step
//             </button>
//             <button
//               className="common-button flex-fill"
//               onClick={() => handleSubmit(formStep)}
//             >
//               Save & Return to projects
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
