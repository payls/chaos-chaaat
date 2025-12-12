// import React, { useEffect, useState, createRef, useRef } from 'react';
// import { Card, Navbar } from 'react-bootstrap';
// import { Header, Body, Footer } from '../components/Layouts/Layout';
// import { h } from '../helpers';
// import { h as previewH } from '../../../../Sale/Link/preview/helpers';
// import { api } from '../api';
// import { api as origApi } from '../../../../Sale/Link/preview/api';
// import { api as apiRoot } from '../../../../../api';

// import { flatten } from 'lodash';

// import ShortlistedProjectCard from '../components/Property/ShortlistedProjectCard';

// import { useRouter } from 'next/router';
// import IconOrangeInternet from '../components/Icons/IconOrangeInternet';
// import IconOrangeInstagram from '../components/Icons/IconOrangeInstagram';
// import IconOrangeLinkedin from '../components/Icons/IconOrangeLinkedin';

// import IconEmail from '../components/Icons/IconEmail';
// import IconFacebookVector from '../components/Icons/IconFacebookVector';
// import IconInstagramVector from '../components/Icons/IconInstagramVector';
// import IconLinkedinVector from '../components/Icons/IconLinkedinVector';
// import IconPhoneVector from '../components/Icons/IconPhoneVector';
// import IconWebsiteVector from '../components/Icons/IconWebsiteVector';

// import CommonLoading from '../components/Common/CommonLoading/CommonLoading';
// import CommonImage from '../components/Common/CommonImage';
// import ProjectTableList from '../../../../Sale/Link/preview/components/Property/ProjectTableList';
// import PropertyTableList from '../../../../Sale/Link/preview/components/Property/PropertyTableList';
// import LoadingShortlistedProject from '../components/Property/ShortlistedProperty/LoadingShortlistedProject';
// import Colliers from '../../../../Sale/Link/preview/pages/proposal/Colliers';
// import InvestOGPS from '../../../../Sale/Link/preview/pages/proposal/InvestOGPS';
// import InvestOGPS_STH_ENG from '../../../../Sale/Link/preview/pages/proposal/InvestOGPS_STH_ENG';
// import InvestOGPS_STH_CHN from '../../../../Sale/Link/preview/pages/proposal/InvestOGPS_STH_CHN';
// import Raeon from '../../../../Sale/Link/preview/pages/proposal/Raeon';
// import StrengthCulture from '../../../../Sale/Link/preview/pages/proposal/StrengthCulture';
// import BreathePilates from '../../../../Sale/Link/preview/pages/proposal/BreathePilates';
// import BreathePilatesClassesPrices from '../../../../Sale/Link/preview/pages/proposal/BreathePilatesClassesPrices';
// import BreathePilatesProspects from '../../../../Sale/Link/preview/pages/proposal/BreathePilatesProspects';
// import BreathePilatesReEngagement from '../../../../Sale/Link/preview/pages/proposal/BreathePilatesReEngagement';
// import HybridHK from '../../../../../pages/dashboard/products/landing-pages/HybridHK';
// import HybridGroup from '../../../../../pages/dashboard/products/landing-pages/HybridGroup';
// import HKore from '../../../../../pages/dashboard/products/landing-pages/HKore';
// import InvestOGPSPersimmonEng from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSPersimmonEng';
// import InvestOGPSPersimmonChn from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSPersimmonChn';
// import InvestOGPSFultonFifth from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSFultonFifth';
// import InvestOGPSFloret from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSFloret';
// import InvestOGPSBurmingham from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSBurmingham';
// import InvestOGPSParkAvenue from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSParkAvenue';
// import InvestOGPSBarretInvited from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSBarretInvited';
// import InvestOGPSBarretPersonal from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSBarretPersonal';
// import InvestOGPSBarretMY from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSBarretMY';
// import InvestOGPSParkAvenueENG from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSParkAvenueENG';
// import InvestOGPSParkAvenueCHN from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSParkAvenueCHN';
// import InvestOGPSWembley from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSWembley';
// import InvestOGPSHendonWaterSideLondon from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSHendonWaterSideLondon';
// import InvestOGPSHendonWaterSideLondonMY from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSHendonWaterSideLondonMY';
// import InvestOGPSEastmanVillageENG from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSEastmanVillageENG';
// import InvestOGPSEastmanVillageMY from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSEastmanVillageMY';
// import InvestOGPSExpat from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSExpat';
// import InvestOGPSManchester from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSManchester';
// import InvestOGPSMQDC from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSMQDC';
// import InvestOGPSMelbourneTownhouse from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSMelbourneTownhouse';
// import InvestOGPSParkQuarter from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSParkQuarter';
// import InvestOGPSVisionPoint from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSVisionPoint';
// import InvestOGPSTraffordGardens from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSTraffordGardens';
// import InvestOGPSPerth from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSPerth';
// import LucidVue from '../../../../../pages/dashboard/products/landing-pages/LucidVue';
// import F45PunggolPlaza from '../../../../../pages/dashboard/products/landing-pages/F45PunggolPlaza';
// import JElliot from '../../../../../pages/dashboard/products/landing-pages/JElliot';

// import {
//   faPhoneAlt,
//   faEnvelope,
//   faPencil,
//   faPencilAlt,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import CommonEmptyState from '../components/Common/CommonEmptyState';
// import constant from '../constants/constant.json';

// import GreetingEditor from '../components/Editor/GreetingEditor';
// import InvestOGPSPeninsulaGardens from '../../../../../pages/dashboard/products/landing-pages/InvestOGPSPeninsulaGardens';

// export default function Template(props) {
//   const router = useRouter();
//   const projectRef = useRef();
//   const propertyRef = useRef();
//   const headerRef = useRef(null);
//   const {
//     proposalTemplateId,
//     proposalTemplate,
//     agency,
//     shouldTrackActivity,
//     setSettingsData,
//     settingsData,
//     parentProjectImageCallBack,
//     permalinkTemplate,
//   } = props;
//   const [proposalProperties, setProposalProperties] = useState([]);
//   const [proposalTemplateData, setProposalTemplateData] =
//     useState(proposalTemplate);
//   const [isLoading, setIsLoading] = useState(false);
//   const [loaded, setLoaded] = useState(false);
//   const [contact, setContact] = useState();
//   const [shortlistedProjects, setShortlistedProjects] = useState();
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [showFullAgentDescription, setShowFullAgentDescription] =
//     useState(false);
//   const [agencyUser, setAgencyUser] = useState({});
//   const [emptyState, setEmptyState] = useState(false);
//   const [permalinkMessage, setPermalinkMessage] = useState('');
//   const [showEditor, setShowEditor] = useState(false);
//   const [customStyle, setCustomStyle] = useState(null);
//   const [whatsAppVerified, setWhatsAppVerified] = useState(false);
//   const [shorlistedProjectsLoading, setShortlistedProjectsLoading] =
//     useState(true);

//   const [proposalProject, setProposalProject] = useState([]);
//   const [agencyPage, setAgencyPage] = useState('');
//   const [customPageData, setCustomPageData] = useState(null);
//   const [translate, setTranslation] = useState(
//     require('../constants/locale/en.json'),
//   );
//   const imageUrl = 'https://cdn.yourpave.com/assets/buyer-page-empty.png';
//   const invalidText = 'This Web Link is not correct or no longer active';

//   const [navigationValue, setNavigationValue] = useState('projects');
//   const [projectRefs, setProjectRefs] = useState([]);

//   // const getGreetings = () => {
//   //   const myDate = new Date();
//   //   const hrs = myDate.getHours();
//   //   let greet;
//   //   if (hrs < 12) greet = 'Good Morning';
//   //   else if (hrs >= 12 && hrs <= 17) greet = 'Good Afternoon';
//   //   else if (hrs >= 17 && hrs <= 24) greet = 'Good Evening';
//   //   return greet;
//   // };

//   const getAgencyInfo = async () => {
//     const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
//     if (h.cmpStr(apiRes.status, 'ok')) {
//       setAgencyUser(apiRes.data.agencyUser);
//       // setContact(apiRes.data.contact);

//       // color scheme for clients
//       setCustomStyle(previewH.theme.getJSON(apiRes.data.agencyUser.agency_fk));
//       setTranslationFunc(apiRes.data.agencyUser.agency_fk);

//       const whatsAppValidator = await apiRoot.whatsapp.validateNumber(
//         apiRes.data.agencyUser.agency_user_id,
//         false,
//       );
//       if (h.cmpStr(whatsAppValidator.status, 'ok') && whatsAppValidator.data) {
//         setWhatsAppVerified(whatsAppValidator.data.is_agent_whatsapp_mobile);
//       }

//       if (permalinkTemplate.startsWith('custom-')) {
//         const apiResLandingPage =
//           await apiRoot.agencyCustomLandingPage.getBySlug(
//             {
//               slug: permalinkTemplate,
//             },
//             false,
//           );
//         if (h.cmpStr(apiResLandingPage.status, 'ok')) {
//           if (apiResLandingPage.data?.custom_landing_pages?.landing_page_info) {
//             setCustomPageData(
//               apiResLandingPage.data?.custom_landing_pages?.landing_page_info,
//             );
//           }
//         }
//       } else {
//         switch (permalinkTemplate) {
//           case 'colliers': // Colliers
//             setAgencyPage('colliers');
//             break;
//           case 'ogps': // Invest OGPS
//             setAgencyPage('investogps');
//             break;
//           case 'ogps_sth_eng': //OGPS STH ENG
//             setAgencyPage('investogps_sth_eng');
//             break;
//           case 'ogps_sth_chn': //OGPS STH CHN
//             setAgencyPage('investogps_sth_chn');
//             break;
//           case 'ogps_persimmon_eng': // Invest OGPS Persimmon ENG
//             setAgencyPage('ogps_persimmon_eng');
//             break;
//           case 'ogps_persimmon_chn': // Invest OGPS Persimmon CHN
//             setAgencyPage('ogps_persimmon_chn');
//             break;
//           case 'ogps_fulton_fifth': // Invest OGPS Fulton
//             setAgencyPage('ogps_fulton_fifth');
//             break;
//           case 'ogps_burmingham': // Invest OGPS Burmingham
//             setAgencyPage('ogps_burmingham');
//             break;
//           case 'ogps_floret': // Invest OGPS floret
//             setAgencyPage('ogps_floret');
//             break;
//           case 'ogps_expat': // Invest OGPS Expat
//             setAgencyPage('ogps_expat');
//             break;
//           case 'ogps_manchester': // Invest OGPS Manchester
//             setAgencyPage('ogps_manchester');
//             break;
//           case 'ogps_mqdc': // Invest OGPS MQDC
//             setAgencyPage('ogps_mqdc');
//             break;
//           case 'ogps_pen_gardens': // Invest OGPS Peninsula Gardens
//             setAgencyPage('ogps_pen_gardens');
//             break;
//           case 'ogps_vision_point': // Invest OGPS Vision POint
//             setAgencyPage('ogps_vision_point');
//             break;
//           case 'ogps_melbourne_townhouse': // Invest OGPS melbourne townhouse
//             setAgencyPage('ogps_melbourne_townhouse');
//             break;
//           case 'ogps_park_avenue': // Invest Park Avenue
//             setAgencyPage('ogps_park_avenue');
//             break;
//           case 'ogps_park_avenue_hk_eng': // Invest OGPS Park Avenue ENG
//             setAgencyPage('ogps_park_avenue_hk_eng');
//             break;
//           case 'ogps_park_avenue_hk_chn': // Invest OGPS Park Avenue CHN
//             setAgencyPage('ogps_park_avenue_hk_chn');
//             break;
//           case 'ogps_wembley': // Invest OGPS Wembley
//             setAgencyPage('ogps_wembley');
//             break;
//           case 'ogps_eastman_village': // Invest OGPS Wembley
//             setAgencyPage('ogps_eastman_village');
//             break;
//           case 'ogps_eastman_village_my': // Invest OGPS Eastman village
//             setAgencyPage('ogps_eastman_village_my');
//             break;
//           case 'ogps_hendon': // Invest OGPS Hendon WaterSide London
//             setAgencyPage('ogps_hendon');
//             break;
//           case 'ogps_hendon_my': // Invest OGPS Hendon WaterSide London MY
//             setAgencyPage('ogps_hendon_my');
//             break;
//           case 'ogps_park_quarter': // Invest OGPS park quarter
//             setAgencyPage('ogps_park_quarter');
//             break;
//           case 'ogps_barratt_personal': // Invest OGPS Barret personal
//             setAgencyPage('ogps_barratt_personal');
//             break;
//           case 'ogps_barratt_invited': // Invest OGPS park invited
//             setAgencyPage('ogps_barratt_invited');
//             break;
//           case 'ogps_barratt_my': // Invest OGPS Barratt MY
//             setAgencyPage('ogps_barratt_my');
//             break;
//           case 'ogps_perth': // Invest OGPS Perth
//             setAgencyPage('ogps_perth');
//             break;
//           case 'ogps_trafford_gardens': // Invest OGPS Trafford Gardens
//             setAgencyPage('ogps_trafford_gardens');
//             break;
//           case 'raeon': // Raeon
//             setAgencyPage('raeon');
//             break;
//           case 'strculture': // Strength Culture
//             setAgencyPage('strculture');
//             break;
//           case 'breathe_pilates': // Breathe Pilates
//             setAgencyPage('breathe_pilates');
//             break;
//           case 'breathe_pilates_classes_prices': // Breathe Pilates Classes Prices
//             setAgencyPage('breathe_pilates_classes_prices');
//             break;
//           case 'breathe_pilates_prospects': // Breathe Pilates Prospects
//             setAgencyPage('breathe_pilates_prospects');
//             break;
//           case 'breathe_pilates_re_engagement': // Breathe Pilates Re-Engagement
//             setAgencyPage('breathe_pilates_re_engagement');
//             break;
//           case 'hybrid_hk': // Hybrid HK
//             setAgencyPage('hybrid_hk');
//             break;
//           case 'hybrid_gym_group': // Hybrid Gym Group
//             setAgencyPage('hybrid_gym_group');
//             break;
//           case 'h_kore': // Hybrid HK
//             setAgencyPage('h_kore');
//             break;
//           case 'lucid_vue': // Lucid Vue
//             setAgencyPage('lucid_vue');
//             break;
//           case 'f45_punggol': // F45 Punggol Plaza
//             setAgencyPage('f45_punggol');
//             break;
//           case 'j_elliot': // J Elliot
//             setAgencyPage('j_elliot');
//             break;
//           default:
//             setAgencyPage('default');
//             break;
//         }
//       }
//     }
//   };

//   // get the parameter to determine whether to track the activity on the link
//   // this parameter is set false for preview pages

//   const sortProjects = (projects) => {
//     // const compareFunction = (first, second) => {
//     //   if (first.is_bookmarked && !second.is_bookmarked) {
//     //     return -1;
//     //   } else if (!first.is_bookmarked && second.is_bookmarked) {
//     //     return 1;
//     //   } else {
//     //     // for both bookmarked and not bookmarked, the display order logic remains the same
//     //     return first.display_order < second.display_order ? -1 : 1;
//     //   }
//     // };
//     return projects.sort((a, b) => a.display_order - b.display_order);
//   };

//   const getShortlistedProjects = async () => {
//     let { proposalTemplateId, proposalTemplate, agency } = props;
//     if (h.notEmpty(proposalTemplate)) {
//       const apiRes =
//         await api.proposalTemplate.getProposalTemplateWithShortlistedProjects(
//           { proposal_template_id: proposalTemplateId },
//           false,
//         );
//       if (h.cmpStr(apiRes.status, 'ok') && apiRes.data) {
//         if (h.notEmpty(apiRes.data.shortlisted_project_proposal_templates)) {
//           const sProjs = sortProjects(
//             apiRes.data.shortlisted_project_proposal_templates.filter(
//               (f) => !f.is_deleted,
//             ),
//           );

//           setShortlistedProjects(sProjs);
//           setSelectedProject({
//             project: sProjs[0],
//             index: 0,
//           });

//           if (agencyUser.description && agencyUser.description.length > 200)
//             setShowFullAgentDescription(false);
//           else setShowFullAgentDescription(true);
//         } else {
//           setEmptyState(true);
//         }
//       }
//       setShortlistedProjectsLoading(false);
//     }
//   };

//   useEffect(() => {
//     // GET AGENCY
//     getAgencyInfo(props);
//     // GET SHORLISTED PROJECT TABLE LIST
//     handleGetShortlistedTableList(props);
//     // GET SHORLISTED PROJECT
//     getShortlistedProjects();

//     // GET CSRF Token
//   }, [router.query]);

//   /**
//    * Get Shortlisted table list
//    */
//   const handleGetShortlistedTableList = async (query) => {
//     let { proposalTemplateId } = props;

//     if (h.notEmpty(proposalTemplateId)) {
//       const tableListRes =
//         await origApi.contact.getShortlistedTemplateTableList(
//           { proposal_template_id: proposalTemplateId },
//           false,
//         );

//       if (h.cmpStr(tableListRes.status, 'ok') && tableListRes.data) {
//         setNavigationValue(
//           tableListRes.data.shortlisted_projects.length === 1
//             ? 'properties'
//             : 'projects',
//         );
//         setProposalProject(
//           tableListRes.data.shortlisted_projects
//             .sort((a, b) => a.display_order - b.display_order)
//             .map((m) => ({ ...m, is_opened: 0 })),
//         );

//         setProposalProperties(
//           tableListRes.data.shotlisted_properties.map((m) => ({
//             ...m,
//             is_opened: 0,
//           })),
//         );
//       }
//     }
//   };

//   const handleClicRowkProject = (v) => {
//     setSelectedProject({
//       project: shortlistedProjects[v.index],
//       index: v.index,
//     });
//     setTimeout(() => {
//       projectRef.current.scrollIntoView({
//         behavior: 'smooth',
//         block: 'start',
//       });
//     }, 25);
//   };

//   const handleClicRowkProperty = (v) => {
//     console.log(v.original, shortlistedProjects);
//     const projectIndex = shortlistedProjects.findIndex(
//       (x) => x.project_fk === v.original.project_property.project_fk,
//     );

//     setSelectedProject({
//       project: shortlistedProjects[projectIndex],
//       index: projectIndex,
//     });

//     setTimeout(() => {
//       propertyRef.current.scrollIntoView({
//         behavior: 'smooth',
//         block: 'start',
//       });
//     }, 100);
//   };

//   useEffect(() => {
//     getShortlistedProjects();
//   }, [router.query]);

//   function setTranslationFunc(agentId) {
//     switch (agentId) {
//       case '1da3ff5f-d3fc-11eb-8182-065264a181d4':
//       case '3d1d056d-0a26-4274-bb9b-5b9e1b3e3b70':
//         setTranslation(require('../constants/locale/ch.json'));
//         break;
//       default:
//         setTranslation(require('../constants/locale/en.json'));
//         break;
//     }
//   }

//   return (
//     <div
//       className="mt-3"
//       style={{
//         ...(customStyle ? { background: customStyle?.background } : {}),
//       }}
//     >
//       <Header
//         title={`${agency.agency_name} - a private proposal for your consideration`}
//         titlePaveEnding={false}
//         description={
//           'View property information, rate your interest and have queries addressed '
//         }
//         imageOg={
//           h.notEmpty(agency.agency_logo_url)
//             ? `https://pave-prd.s3-ap-southeast-1.amazonaws.com/${agency.agency_logo_url}`
//             : null
//         }
//         imageTwitter={
//           h.notEmpty(agency.agency_logo_url)
//             ? `https://pave-prd.s3-ap-southeast-1.amazonaws.com/${agency.agency_logo_url}`
//             : null
//         }
//         showHeaderContent={false}
//       />

//       <Body isLoading={isLoading}>
//         {/* <CommonLoading isAnimating={isLoading} key={'progress-bar'} /> */}

//         {agencyPage === 'default' && (
//           <>
//             {h.notEmpty(agencyUser) && customStyle && (
//               <div ref={headerRef}>
//                 <div style={customStyle.topLogoWrapper}>
//                   <div className="container animate-fadeIn py-3">
//                     <div className="mx-2 mx-sm-0">
//                       <Card.Title className="pb-3 d-flex justify-content-center">
//                         {h.notEmpty(agencyUser?.agency?.agency_logo_url) ? (
//                           <img
//                             src={agencyUser?.agency?.agency_logo_url}
//                             alt="Pave"
//                             style={{
//                               width:
//                                 window.innerWidth <= 820
//                                   ? customStyle?.agencyLogoSize.width
//                                   : 200,
//                             }}
//                           />
//                         ) : (
//                           <span
//                             className="rounded-circle comment-profile-picture profile-picture"
//                             style={{
//                               cursor: 'default',
//                               width: '150px',
//                               height: '150px',
//                               fontSize: '30px',
//                             }}
//                           >
//                             {h.user.getNameInitials(
//                               agencyUser?.agency?.agency_name,
//                             )}
//                           </span>
//                         )}
//                       </Card.Title>
//                     </div>
//                   </div>
//                 </div>
//                 <div
//                   style={customStyle.agentProfile.container}
//                   className="py-4"
//                 >
//                   <div className="container animate-fadeIn">
//                     <div className="row">
//                       <div className={`col-lg-7 col-md-7 col-sm-12 col-xs-12`}>
//                         <div className="mx-2 mx-sm-0">
//                           <div className="d-flex flex-column">
//                             {agencyUser?.user?.email?.toLowerCase() !==
//                               'info@rae-on.com' && (
//                               <div className="d-flex header-agency align-items-start">
//                                 {!h.isEmpty(
//                                   agencyUser?.user?.profile_picture_url,
//                                 ) &&
//                                   !agencyUser?.user?.profile_picture_url.includes(
//                                     '/assets/profile_picture_placeholder.png',
//                                   ) &&
//                                   !h.cmpStr(
//                                     // TODO: remove this, this is an absolutely bad idea but done as per PAVE-952
//                                     agencyUser.user.email,
//                                     'henry.lam@tropicanacorp.com.my',
//                                   ) && (
//                                     <img
//                                       style={{
//                                         objectFit: 'cover',
//                                       }}
//                                       className="mb-3 mb-md-0 mt-3 mt-md-0 mr-2 agent-img rounded-circle"
//                                       src={
//                                         agencyUser?.user?.profile_picture_url
//                                       }
//                                       width="93px"
//                                       height="93px"
//                                       alt=""
//                                     />
//                                   )}
//                                 <div className="flex-column contact-name ">
//                                   <div className="d-flex flex-column">
//                                     <span
//                                       style={{
//                                         fontSize: 22,
//                                         fontFamily: 'PoppinsSemiBold',
//                                         marginTop: '15px',
//                                         ...customStyle.agentProfile.name,
//                                       }}
//                                     >
//                                       {agencyUser.user.first_name}{' '}
//                                       {agencyUser.user.last_name}
//                                     </span>
//                                   </div>
//                                   {agencyUser.title && (
//                                     <div className="d-flex flex-column">
//                                       <span
//                                         style={{
//                                           fontSize: 18,
//                                           fontSize: 18,
//                                           fontWeight: 400,
//                                           ...customStyle.agentProfile.title,
//                                         }}
//                                       >
//                                         {agencyUser.title}
//                                       </span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )}
//                             <div>
//                               <div className="d-flex flex-column">
//                                 <p
//                                   className="mt-4 text-left profile-desc"
//                                   style={{
//                                     fontSize: 18,
//                                     fontWeight: 400,
//                                     fontFamily: 'PoppinsLight',
//                                     ...customStyle.agentProfile.description,
//                                   }}
//                                 >
//                                   {showFullAgentDescription
//                                     ? agencyUser.description
//                                     : agencyUser.description &&
//                                       agencyUser.description.substr(
//                                         0,
//                                         agencyUser?.user?.email?.toLowerCase() !==
//                                           'info@rae-on.com'
//                                           ? 200
//                                           : 400,
//                                       )}
//                                   {!showFullAgentDescription &&
//                                   agencyUser.description &&
//                                   agencyUser.description.length >
//                                     (agencyUser?.user?.email?.toLowerCase() !==
//                                     'info@rae-on.com'
//                                       ? 200
//                                       : 400)
//                                     ? '...'
//                                     : ''}
//                                 </p>
//                                 <div align="center">
//                                   {agencyUser.description &&
//                                     agencyUser.description.length >
//                                       (agencyUser?.user?.email?.toLowerCase() !==
//                                       'info@rae-on.com'
//                                         ? 200
//                                         : 400) && (
//                                       <a
//                                         style={{
//                                           ...customStyle.agentProfile.readmore,
//                                         }}
//                                         href="#"
//                                         onClick={() =>
//                                           setShowFullAgentDescription(
//                                             !showFullAgentDescription,
//                                           )
//                                         }
//                                       >
//                                         {showFullAgentDescription
//                                           ? h.translate.localize(
//                                               'readLess',
//                                               translate,
//                                             )
//                                           : h.translate.localize(
//                                               'readMore',
//                                               translate,
//                                             )}
//                                       </a>
//                                     )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-lg-5 col-md-5 col-sm-12  col-xs-12">
//                         <div className="d-flex header-agency align-items-start">
//                           <div className="flex-column contact-name ">
//                             <div className="d-flex flex-column">
//                               <span
//                                 style={{
//                                   fontSize: 22,
//                                   fontFamily: 'PoppinsSemiBold',
//                                   marginTop: '15px',
//                                   ...customStyle.agentProfile.name,
//                                 }}
//                               >
//                                 {h.translate.localize(
//                                   'contactDetails',
//                                   translate,
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="d-flex flex-wrap mt-4 mt-md-3 social-links">
//                           {h.notEmpty(agencyUser.user.email) && (
//                             <div className="d-flex align-items-center flex-5p">
//                               <span
//                                 className="social-links-icon"
//                                 // style={{
//                                 //   ...customStyle.agentProfile.socialIcon
//                                 //     .background,
//                                 // }}
//                               >
//                                 <IconEmail
//                                   color={
//                                     customStyle.agentProfile.socialIcon.icon
//                                       .color
//                                   }
//                                 />{' '}
//                               </span>

//                               <a
//                                 href={`mailto:${agencyUser.user.email}`}
//                                 style={{
//                                   ...customStyle.agentProfile.socialLink,
//                                 }}
//                               >
//                                 {agencyUser.user.email}
//                               </a>
//                             </div>
//                           )}
//                           {h.notEmpty(agencyUser.user.mobile_number) && (
//                             <div className="d-flex align-items-center flex-5p">
//                               <span
//                                 className="social-links-icon"
//                                 // style={{
//                                 //   ...customStyle.agentProfile.socialIcon
//                                 //     .background,
//                                 // }}
//                               >
//                                 <IconPhoneVector
//                                   color={
//                                     customStyle.agentProfile.socialIcon.icon
//                                       .color
//                                   }
//                                 />{' '}
//                               </span>

//                               <a
//                                 href={`tel:${agencyUser.user.mobile_number}`}
//                                 style={{
//                                   ...customStyle.agentProfile.socialLink,
//                                 }}
//                               >
//                                 {agencyUser.user.mobile_number}
//                               </a>
//                             </div>
//                           )}
//                           {h.notEmpty(agencyUser.website) && (
//                             <div className="d-flex align-items-center flex-5p">
//                               <span
//                                 className="social-links-icon"
//                                 // style={{
//                                 //   ...customStyle.agentProfile.socialIcon
//                                 //     .background,
//                                 // }}
//                               >
//                                 <IconWebsiteVector
//                                   color={
//                                     customStyle.agentProfile.socialIcon.icon
//                                       .color
//                                   }
//                                 />{' '}
//                               </span>
//                               <a
//                                 href={agencyUser.website}
//                                 target="_blank"
//                                 style={{
//                                   ...customStyle.agentProfile.socialLink,
//                                 }}
//                               >
//                                 {agencyUser.website}
//                               </a>
//                             </div>
//                           )}
//                           {h.notEmpty(agencyUser.instagram) && (
//                             <div className="d-flex align-items-center flex-5p">
//                               <span
//                                 className="social-links-icon"
//                                 // style={{
//                                 //   ...customStyle.agentProfile.socialIcon
//                                 //     .background,
//                                 // }}
//                               >
//                                 <IconInstagramVector
//                                   color={
//                                     customStyle.agentProfile.socialIcon.icon
//                                       .color
//                                   }
//                                 />{' '}
//                               </span>
//                               <a
//                                 href={agencyUser.instagram}
//                                 target="_blank"
//                                 style={{
//                                   ...customStyle.agentProfile.socialLink,
//                                 }}
//                               >
//                                 @
//                                 {agencyUser.instagram.split('/') &&
//                                   (agencyUser.instagram.split('/')[
//                                     agencyUser.instagram.split('/').length - 1
//                                   ] ||
//                                     agencyUser.instagram.split('/')[
//                                       agencyUser.instagram.split('/').length - 2
//                                     ])}
//                               </a>
//                             </div>
//                           )}
//                           {h.notEmpty(agencyUser.linkedin) && (
//                             <div className="d-flex align-items-center flex-5p">
//                               <span
//                                 className="social-links-icon"
//                                 // style={{
//                                 //   ...customStyle.agentProfile.socialIcon
//                                 //     .background,
//                                 // }}
//                               >
//                                 <IconLinkedinVector
//                                   color={
//                                     customStyle.agentProfile.socialIcon.icon
//                                       .color
//                                   }
//                                 />{' '}
//                               </span>
//                               <a
//                                 href={agencyUser.linkedin}
//                                 target="_blank"
//                                 style={{
//                                   ...customStyle.agentProfile.socialLink,
//                                 }}
//                               >
//                                 @
//                                 {agencyUser.linkedin.split('/') &&
//                                   (agencyUser.linkedin.split('/')[
//                                     agencyUser.linkedin.split('/').length - 1
//                                   ] ||
//                                     agencyUser.linkedin.split('/')[
//                                       agencyUser.linkedin.split('/').length - 2
//                                     ])}
//                               </a>
//                             </div>
//                           )}
//                           {h.notEmpty(agencyUser.facebook) && (
//                             <div className="d-flex align-items-center flex-5p">
//                               <span
//                                 className="social-links-icon"
//                                 // style={{
//                                 //   ...customStyle.agentProfile.socialIcon
//                                 //     .background,
//                                 // }}
//                               >
//                                 <IconFacebookVector
//                                   color={
//                                     customStyle.agentProfile.socialIcon.icon
//                                       .color
//                                   }
//                                 />{' '}
//                               </span>
//                               <a
//                                 href={agencyUser.facebook}
//                                 target="_blank"
//                                 style={{
//                                   ...customStyle.agentProfile.socialLink,
//                                 }}
//                               >
//                                 {agencyUser.facebook.split('/') &&
//                                   (agencyUser.facebook.split('/')[
//                                     agencyUser.facebook.split('/').length - 1
//                                   ] ||
//                                     agencyUser.facebook.split('/')[
//                                       agencyUser.facebook.split('/').length - 2
//                                     ])}
//                               </a>
//                             </div>
//                           )}
//                           {/* {whatsAppVerified && (
//                         <div className="d-flex align-items-center flex-5p">
//                           <span
//                             className="social-links-icon"
//                             // style={{
//                             //   ...customStyle.agentProfile.socialIcon
//                             //     .background,
//                             // }}
//                           >
//                             <img
//                               src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/whatsapp-logo.png"
//                               width={34}
//                               style={{
//                                 marginBottom: '5px',
//                                 cursor: 'pointer',
//                                 marginLeft: '-5px',
//                                 marginRight: '-5px',
//                               }}
//                               title="WhatsApp Mobile Number"
//                             />
//                           </span>
//                           <a
//                             href={`https://wa.me/${agencyUser.user.mobile_number}`}
//                             style={{
//                               ...customStyle.agentProfile.socialLink,
//                             }}
//                           >
//                             Reach out on WhatsApp
//                           </a>
//                         </div>
//                       )} */}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {h.notEmpty(proposalProject) && selectedProject && (
//                   <>
//                     <div
//                       className="navigation-wrapper d-flex justify-content-center my-4"
//                       style={{
//                         background: customStyle?.background,
//                       }}
//                     >
//                       <div
//                         className="navigation-items pos-rlt"
//                         style={{
//                           background: customStyle?.table?.navigationWrapper,
//                         }}
//                       >
//                         <span
//                           className={
//                             'movingBg ' +
//                             (navigationValue === 'projects'
//                               ? 'leftside'
//                               : 'rightside') +
//                             ' ' +
//                             (proposalProperties.length === 0 ? 'no-prop' : '') +
//                             ' ' +
//                             (proposalProject.length === 1 ? 'single-proj' : '')
//                           }
//                           style={{ background: customStyle?.table?.movingBg }}
//                         ></span>
//                         <div>
//                           {proposalProject.length > 1 && (
//                             <span
//                               className={
//                                 'navigation-item ' +
//                                 (navigationValue === 'projects'
//                                   ? 'selected'
//                                   : '')
//                               }
//                               style={{ ...customStyle?.table?.nav }}
//                               onClick={() => {
//                                 setNavigationValue('projects');
//                               }}
//                             >
//                               {h.translate.localize('projectList', translate)}
//                             </span>
//                           )}
//                           {proposalProperties.length > 0 && (
//                             <span
//                               className={
//                                 'navigation-item ' +
//                                 (navigationValue === 'properties'
//                                   ? 'selected'
//                                   : '')
//                               }
//                               style={{ ...customStyle?.table?.nav }}
//                               onClick={() => {
//                                 setNavigationValue('properties');
//                               }}
//                             >
//                               {h.translate.localize(
//                                 'shortlistedProperties',
//                                 translate,
//                               )}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="container">
//                       {navigationValue === 'projects' && (
//                         <div className="projects-table animate-fadeIn">
//                           <ProjectTableList
//                             selected={selectedProject}
//                             projects={proposalProject}
//                             customStyle={customStyle}
//                             translate={translate}
//                             reloadShortlistedProjects={getShortlistedProjects}
//                             shouldTrackActivity={shouldTrackActivity}
//                             handleClick={handleClicRowkProject}
//                           />
//                         </div>
//                       )}
//                       {proposalProperties.length > 0 &&
//                         navigationValue === 'properties' && (
//                           <div className="properties-table animate-fadeIn">
//                             <PropertyTableList
//                               selected={selectedProject}
//                               projects={proposalProject}
//                               properties={proposalProperties}
//                               customStyle={customStyle}
//                               translate={translate}
//                               reloadShortlistedProjects={getShortlistedProjects}
//                               shouldTrackActivity={shouldTrackActivity}
//                               handleClick={handleClicRowkProperty}
//                             />
//                           </div>
//                         )}
//                     </div>
//                   </>
//                 )}

//                 {shorlistedProjectsLoading && <LoadingShortlistedProject />}

//                 {!shorlistedProjectsLoading && selectedProject && (
//                   <ShortlistedProjectCard
//                     projectRef={projectRef}
//                     propertyRef={propertyRef}
//                     is_demo={false}
//                     contact={contact}
//                     shortlistedProject={selectedProject.project}
//                     setLoading={setIsLoading}
//                     shouldTrackActivity={shouldTrackActivity}
//                     reloadShortlistedProjects={getShortlistedProjects}
//                     settingsData={settingsData}
//                     setSettingsData={setSettingsData}
//                     key={selectedProject.index}
//                     customStyle={customStyle}
//                     translate={translate}
//                     parentProjectImageCallBack={parentProjectImageCallBack}
//                   />
//                 )}

//                 <div
//                   className="toTop"
//                   style={{
//                     background: customStyle?.projectFeatures?.iconBg,
//                     color: customStyle?.projectFeatures?.iconColor,
//                   }}
//                   onClick={() => {
//                     headerRef.current.scrollIntoView({
//                       behavior: 'smooth',
//                       block: 'start',
//                     });
//                   }}
//                 >
//                   &uarr;
//                 </div>
//               </div>
//             )}

//             <div
//               className="d-flex flex-column w-100 align-items-center justify-content-center pb-3"
//               style={{ background: customStyle?.footer?.background }}
//             >
//               <>
//                 {h.notEmpty(agencyUser) && (
//                   <>
//                     {h.notEmpty(agencyUser?.agency?.agency_logo_url) ? (
//                       <img
//                         src={agencyUser?.agency?.agency_logo_url}
//                         alt="Pave"
//                         style={{
//                           width:
//                             window.innerWidth <= 820
//                               ? customStyle?.agencyLogoSize.width
//                               : 200,
//                         }}
//                         className="mt-2"
//                       />
//                     ) : (
//                       <span
//                         className="rounded-circle comment-profile-picture profile-picture"
//                         style={{
//                           cursor: 'default',
//                           width: '150px',
//                           height: '150px',
//                           fontSize: '30px',
//                         }}
//                       >
//                         {h.user.getNameInitials(
//                           agencyUser?.agency?.agency_name,
//                         )}
//                       </span>
//                     )}
//                   </>
//                 )}
//               </>
//               <div
//                 className="pt-3 text-center"
//                 style={{
//                   color: customStyle?.footer?.text,
//                   fontFamily: 'PoppinsRegular',
//                 }}
//               >
//                 {h.translate.localize('poweredBy', translate)}{' '}
//                 <a
//                   href="https://www.yourpave.com/"
//                   target="_blank"
//                   style={{
//                     textDecoration: 'underline',
//                     color: customStyle?.footer?.text,
//                   }}
//                 >
//                   Pave
//                 </a>
//               </div>
//             </div>
//           </>
//         )}

//         {agencyPage === 'colliers' && (
//           <Colliers
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//           />
//         )}

//         {agencyPage === 'investogps' && (
//           <InvestOGPS
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//           />
//         )}

//         {agencyPage === 'investogps_sth_eng' && (
//           <InvestOGPS_STH_ENG
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//           />
//         )}

//         {agencyPage === 'investogps_sth_chn' && (
//           <InvestOGPS_STH_CHN
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}

//         {agencyPage === 'ogps_persimmon_eng' && (
//           <InvestOGPSPersimmonEng
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//           />
//         )}

//         {agencyPage === 'ogps_persimmon_chn' && (
//           <InvestOGPSPersimmonChn
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//           />
//         )}

//         {agencyPage === 'raeon' && (
//           <Raeon
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={contact}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}

//         {agencyPage === 'strculture' && (
//           <StrengthCulture
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}

//         {agencyPage === 'breathe_pilates' && (
//           <BreathePilates
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}

//         {agencyPage === 'breathe_pilates_classes_prices' && (
//           <BreathePilatesClassesPrices
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}
//         {agencyPage === 'breathe_pilates_prospects' && (
//           <BreathePilatesProspects
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}
//         {agencyPage === 'breathe_pilates_re_engagement' && (
//           <BreathePilatesReEngagement
//             agencyUser={agencyUser}
//             shortlistedProject={selectedProject?.project}
//             translate={translate}
//             setLoading={setIsLoading}
//             contact={null}
//             shouldTrackActivity={shouldTrackActivity}
//             project={selectedProject?.project}
//             customStyle={customStyle}
//           />
//         )}

//         {agencyPage === 'hybrid_hk' && <HybridHK />}
//         {agencyPage === 'hybrid_gym_group' && <HybridGroup />}

//         {agencyPage === 'h_kore' && <HKore />}
//         {agencyPage === 'ogps_fulton_fifth' && <InvestOGPSFultonFifth />}
//         {agencyPage === 'ogps_floret' && <InvestOGPSFloret />}
//         {agencyPage === 'ogps_park_quarter' && <InvestOGPSParkQuarter />}
//         {agencyPage === 'ogps_expat' && <InvestOGPSExpat />}
//         {agencyPage === 'ogps_manchester' && <InvestOGPSManchester />}
//         {agencyPage === 'ogps_mqdc' && <InvestOGPSMQDC />}
//         {agencyPage === 'ogps_barratt_personal' && <InvestOGPSBarretPersonal />}
//         {agencyPage === 'ogps_barratt_invited' && <InvestOGPSBarretInvited />}
//         {agencyPage === 'ogps_barratt_my' && <InvestOGPSBarretMY />}
//         {agencyPage === 'ogps_pen_gardens' && <InvestOGPSPeninsulaGardens />}
//         {agencyPage === 'ogps_melbourne_townhouse' && (
//           <InvestOGPSMelbourneTownhouse />
//         )}
//         {agencyPage === 'ogps_eastman_village' && (
//           <InvestOGPSEastmanVillageENG />
//         )}
//         {agencyPage === 'ogps_eastman_village_my' && (
//           <InvestOGPSEastmanVillageMY />
//         )}
//         {agencyPage === 'ogps_burmingham' && <InvestOGPSBurmingham />}
//         {agencyPage === 'ogps_park_avenue' && <InvestOGPSParkAvenue />}
//         {agencyPage === 'ogps_park_avenue_hk_eng' && (
//           <InvestOGPSParkAvenueENG />
//         )}
//         {agencyPage === 'ogps_park_avenue_hk_chn' && (
//           <InvestOGPSParkAvenueCHN />
//         )}
//         {agencyPage === 'ogps_perth' && <InvestOGPSPerth />}
//         {agencyPage === 'ogps_wembley' && <InvestOGPSWembley />}
//         {agencyPage === 'ogps_vision_point' && <InvestOGPSVisionPoint />}
//         {agencyPage === 'ogps_trafford_gardens' && (
//           <InvestOGPSTraffordGardens />
//         )}
//         {agencyPage === 'ogps_hendon' && <InvestOGPSHendonWaterSideLondon />}
//         {agencyPage === 'ogps_hendon_my' && (
//           <InvestOGPSHendonWaterSideLondonMY />
//         )}
//         {agencyPage === 'lucid_vue' && <LucidVue />}
//         {agencyPage === 'f45_punggol' && <F45PunggolPlaza />}
//         {agencyPage === 'j_elliot' && <JElliot />}

//         {customPageData && (
//           <>
//             <div
//               dangerouslySetInnerHTML={{
//                 __html: customPageData?.landing_page_html,
//               }}
//             ></div>
//             <style>{customPageData?.landing_page_css}</style>
//           </>
//         )}

//         {h.cmpBool(emptyState, true) && (
//           <div>
//             <CommonEmptyState imageUrl={imageUrl} invalidText={invalidText} />
//           </div>
//         )}
//       </Body>
//     </div>
//   );
// }
