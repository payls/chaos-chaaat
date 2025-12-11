// import React, { useEffect, useState } from 'react';
// import moment from 'moment';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { h } from '../../helpers';
// import { api } from '../../api';
// import constant from '../../constants/constant.json';
// import { routes } from '../../configs/routes';
// // import { Pie, Doughnut } from 'react-chartjs-2';
// import Countries from '../../constants/countryNumberCodes.json';
// import Color from '../../constants/randomColors';

// import Skeleton from 'react-loading-skeleton';
// import { useRouter } from 'next/router';

// // UI
// import { Header, Body, Footer } from '../../components/Layouts/Layout';
// import {
//   faPaperPlane,
//   faCheckDouble,
//   faCommentSlash,
//   faComments,
//   faClock,
//   faCheckCircle,
//   faChartBar,
//   faRedo,
//   faEnvelopeOpen,
//   faChartPie,
//   faAddressBook,
//   faLink,
//   faStickyNote,
//   faUsers,
//   faRobot,
// } from '@fortawesome/free-solid-svg-icons';
// import IconDashboard from '../../components/Icons/IconDashboard';
// import IconClock from '../../components/Icons/IconClock';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import IconChevronLeft from '../../components/ProposalTemplate/Link/preview/components/Icons/IconChevronLeft';

// // Components
// import ContactFilter from '../../components/Contact/ContactFilter';
// import ProjectFilter from '../../components/Contact/ProjectFilter';
// import DateFilter from '../../components/Contact/DateFilter';
// import MostEngagedContacts from '../../components/Contact/MostEngagedContacts';
// import ActivityStreamItem from '../../components/Dashboard/ActivityStreamItem';
// import OnboardingList from '../../components/WhatsApp/OnboardingList';

// ChartJS.register(ArcElement, Tooltip, Legend);

// export default function DashboardIndex() {
//   const router = useRouter();

//   const currentDate = moment();
//   const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
//   const [isLoading, setLoading] = useState();
//   const [options, setOptions] = useState({
//     contactOwners: [],
//     projects: [],
//   });
//   const [agencyUser, setAgencyUser] = useState({});

//   const [proposalSent, setProposalSent] = useState(0);
//   const [proposalOpened, setProposalOpened] = useState(0);
//   const [engagementScore, setEngagementScore] = useState({
//     data: [],
//     loading: true,
//   });
//   const [sentMethod, setSentMethod] = useState({ data: [], loading: true });
//   const [deviceType, setDeviceType] = useState({ data: [], loading: true });
//   const [activityLocation, setActivityLocation] = useState({
//     data: [],
//     loading: true,
//   });
//   const [dateFilter, setDateFilter] = useState({ data: [], loading: true });
//   const [messagingStat, setMessagingStat] = useState(null);
//   const [pieOptions, setPieOptions] = useState({
//     plugins: {
//       legend: false,
//     },
//     responsive: true,
//   });

//   const [allQueries, setAllQueries] = useState({
//     setFilter: {
//       agency_id: '',
//       agent_user_id: '',
//       from: moment(currentDate).startOf('week').toISOString(),
//       to: currentDate.endOf('week').toISOString(),
//       project_id: '',
//     },
//     moreFilter: {},
//   });

//   useEffect(() => {
//     (async () => {
//       h.auth.isLoggedInElseRedirect();
//       setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
//       const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
//       if (h.cmpStr(apiRes.status, 'ok')) {
//         setOptions({ ...options, agency_id: apiRes.data.agencyUser.agency_fk });
//         setAgencyUser(apiRes.data.agencyUser);
//       }
//     })();
//   }, []);

//   // retrieving agency users for filter dropdown Contact Owner
//   useEffect(() => {
//     (async () => {
//       if (h.notEmpty(agencyUser)) {
//         // Contact owners
//         let contactOwners = [];
//         const apiContactsRes = await api.agencyUser.getAgencyUsers(
//           { agency_fk: agencyUser.agency.agency_id },
//           false,
//         );
//         if (h.cmpStr(apiContactsRes.status, 'ok')) {
//           for (const agencyUser of apiContactsRes.data.agency_users) {
//             contactOwners.push({
//               value: agencyUser.agency_user_id,
//               label: agencyUser.user.full_name,
//             });
//           }
//         }

//         // Projects
//         let projects = [];
//         const apiProjectsRes = await api.project.findAll(
//           { agency_fk: agencyUser.agency.agency_id },
//           {},
//           false,
//         );
//         if (h.cmpStr(apiProjectsRes.status, 'ok')) {
//           for (const project of apiProjectsRes.data.projects) {
//             projects.push({
//               value: project.project_id,
//               label: project.name,
//             });
//           }
//         }

//         setOptions({ ...options, contactOwners, projects });
//       }
//     })();
//   }, [agencyUser]);

//   useEffect(() => {
//     if (agencyUser && agencyUser.agency_fk) {
//       getProposalSent();
//       getProposalOpened();
//       getEngagementScores();
//       getMessagingStats();
//     }
//   }, [agencyUser, allQueries]);

//   const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

//   const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;
//   const getFilterValues = () => {
//     const removedNoValueData = Object.fromEntries(
//       Object.entries(allQueries.setFilter).filter(
//         ([key, value]) => value !== '',
//       ),
//     );
//     return removedNoValueData;
//   };
//   const getProposalSent = async () => {
//     const apiRes = await api.dashboard.getProposalSent(
//       {
//         agency_id: agencyUser.agency_fk,
//         ...getFilterValues(),
//       },
//       false,
//     );

//     if (h.cmpStr(apiRes.status, 'ok')) {
//       setProposalSent(apiRes.data.proposal_sent.count);
//     }
//   };

//   const getProposalOpened = async () => {
//     const apiRes = await api.dashboard.getProposalOpened(
//       {
//         agency_id: agencyUser.agency_fk,
//         ...getFilterValues(),
//       },
//       false,
//     );

//     if (h.cmpStr(apiRes.status, 'ok')) {
//       setProposalOpened(apiRes.data.proposal_opened.count);
//     }
//   };

//   const getEngagementScores = async () => {
//     setEngagementScore((prev) => ({ ...prev, data: [], loading: true }));

//     const apiRes = await api.dashboard.getEngagementScores(
//       {
//         agency_id: agencyUser.agency_fk,
//         ...getFilterValues(),
//       },
//       false,
//     );

//     if (h.cmpStr(apiRes.status, 'ok')) {
//       const labels = Object.keys(apiRes.data.engagement_score).map((m) =>
//         h.general.ucFirstAllWords(m),
//       );
//       const parsedData = parseObjectToData(apiRes.data.engagement_score);
//       setEngagementScore({
//         chartData: {
//           labels,
//           datasets: [
//             {
//               label: 'No. of Contacts',
//               data: Object.values(apiRes.data.engagement_score),
//               backgroundColor: [...labels.map((m, i) => Color[i])],

//               borderWidth: 1,
//             },
//           ],
//         },
//         data: parsedData,
//         loading: false,
//       });
//     }
//   };

//   const getMessagingStats = async () => {
//     const apiRes = await api.dashboard.getMessagingStats(
//       agencyUser.agency_fk,
//       false,
//     );

//     if (h.cmpStr(apiRes.status, 'ok')) {
//       setMessagingStat(apiRes.data);
//     }
//   };

//   const parseObjectToData = (obj) => {
//     const parsedData = [];
//     for (let i = 0; i < Object.keys(obj).length; i++) {
//       parsedData.push({
//         name: Object.keys(obj)[i],
//         value: Object.values(obj)[i],
//         color: Color[i],
//       });
//     }

//     return parsedData;
//   };

//   const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const getGreeting = () => {
//     let currentHour = new Date().getHours();

//     if (currentHour < 12) {
//       return 'Good morning';
//     } else if (currentHour < 18) {
//       return 'Good afternoon';
//     } else {
//       return 'Good evening';
//     }
//   };
//   return (
//     <div className="contacts-root layout-v">
//       <Header
//         className={
//           'container dashboard-contacts-container common-navbar-header mb-3'
//         }
//       />
//       <Body>
//         <div className="n-banner">
//           <div className="mb-2 contacts-title d-flex justify-content-between container dashboard-contacts-container contacts-container">
//             <div>
//               <h1>{`${getGreeting()}${
//                 agencyUser?.user?.first_name
//                   ? `, ${agencyUser?.user?.first_name}!`
//                   : '!'
//               }`}</h1>
//               <span>
//                 <h1
//                   style={{
//                     fontSize: '18px',
//                     color: '#989898',
//                     fontFamily: 'PoppinsRegular',
//                   }}
//                 >
//                   Get started
//                 </h1>
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white">
//           <div className="contacts-list-container">
//             <div className="container dashboard-contacts-container">
//               <div className="pl-3 pr-3">
//                 <div className="row">
//                   <div className="tab-body pt-3">
//                     <div
//                       className="d-flex dashboard-items"
//                       style={{ gap: '1em' }}
//                     >
//                       <div
//                         className="most-engaged-wrapper"
//                         style={{ flex: 'auto' }}
//                       >
//                         <div className="d-flex flex-column">
//                           <div className="info-dash-wrapper d-flex">
//                             <div
//                               className="info-dash-wrapper-item d-flex flex-row justify-content-between"
//                               onClick={() => {
//                                 window.location = h.getRoute(
//                                   routes.dashboard.messaging,
//                                 );
//                               }}
//                             >
//                               <div className="d-flex flex-row gap-1">
//                                 <div
//                                   className="info-dash-wrapper-item-icon"
//                                   style={{ background: '#fdecd4' }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faComments}
//                                     style={{ cursor: 'pointer' }}
//                                     color="#ff9500"
//                                     size="l#g"
//                                   />
//                                 </div>
//                                 <div className="info-dash-wrapper-item-details d-flex flex-row">
//                                   <div className="d-flex flex-column">
//                                     <label>Create a Campaigns</label>
//                                     <span>
//                                       Initiate your contact engagements by
//                                       creating your campaign.{' '}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <IconChevronLeft
//                                 width="20"
//                                 className="invert"
//                                 color="#909090"
//                               />
//                             </div>
//                           </div>
//                           <div className="info-dash-wrapper d-flex">
//                             <div
//                               className="info-dash-wrapper-item d-flex flex-row justify-content-between"
//                               onClick={() => {
//                                 window.location = h.getRoute(
//                                   routes.templates.whatsapp.list,
//                                 );
//                               }}
//                             >
//                               <div className="d-flex flex-row gap-1">
//                                 <div
//                                   className="info-dash-wrapper-item-icon"
//                                   style={{ background: '#caffc8' }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faStickyNote}
//                                     style={{ cursor: 'pointer' }}
//                                     color="#22cf1c"
//                                     size="l#g"
//                                   />
//                                 </div>
//                                 <div className="info-dash-wrapper-item-details d-flex flex-row">
//                                   <div className="d-flex flex-column">
//                                     <label>Create a Templates</label>
//                                     <span>
//                                       Begin your campaigns by creating your
//                                       templates.{' '}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <IconChevronLeft
//                                 width="20"
//                                 className="invert"
//                                 color="#909090"
//                               />
//                             </div>
//                           </div>
//                           <div className="info-dash-wrapper d-flex">
//                             <div
//                               className="info-dash-wrapper-item d-flex flex-row justify-content-between"
//                               onClick={() => {
//                                 window.location = h.getRoute(
//                                   routes.settings.user_management,
//                                 );
//                               }}
//                             >
//                               <div className="d-flex flex-row gap-1">
//                                 <div
//                                   className="info-dash-wrapper-item-icon"
//                                   style={{ background: 'rgb(170 228 255)' }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faAddressBook}
//                                     style={{ cursor: 'pointer' }}
//                                     color="#00aeff"
//                                     size="l#g"
//                                   />
//                                 </div>
//                                 <div className="info-dash-wrapper-item-details d-flex flex-row">
//                                   <div className="d-flex flex-column">
//                                     <label>Add Team Members</label>
//                                     <span>
//                                       Organize your team by inviting members to
//                                       join.
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <IconChevronLeft
//                                 width="20"
//                                 className="invert"
//                                 color="#909090"
//                               />
//                             </div>
//                           </div>
//                           <div className="info-dash-wrapper d-flex">
//                             <div
//                               className="info-dash-wrapper-item d-flex flex-row justify-content-between"
//                               onClick={() => {
//                                 window.location = h.getRoute(
//                                   routes.templates.contact.list,
//                                 );
//                               }}
//                             >
//                               <div className="d-flex flex-row gap-1">
//                                 <div
//                                   className="info-dash-wrapper-item-icon"
//                                   style={{ background: 'rgb(239 203 255)' }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faUsers}
//                                     style={{ cursor: 'pointer' }}
//                                     color="#c94eff"
//                                     size="l#g"
//                                   />
//                                 </div>
//                                 <div className="info-dash-wrapper-item-details d-flex flex-row">
//                                   <div className="d-flex flex-column">
//                                     <label>
//                                       Create or Upload your Contacts
//                                     </label>
//                                     <span>
//                                       Initiate your contact interactions by
//                                       adding your contacts to get started.{' '}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <IconChevronLeft
//                                 width="20"
//                                 className="invert"
//                                 color="#909090"
//                               />
//                             </div>
//                           </div>
//                           <div className="info-dash-wrapper d-flex">
//                             <div
//                               className="info-dash-wrapper-item d-flex flex-row justify-content-between"
//                               onClick={() => {
//                                 window.location = h.getRoute(
//                                   routes.settings.integrations,
//                                 );
//                               }}
//                             >
//                               <div className="d-flex flex-row gap-1">
//                                 <div
//                                   className="info-dash-wrapper-item-icon"
//                                   style={{ background: 'rgb(193 197 255)' }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faLink}
//                                     style={{ cursor: 'pointer' }}
//                                     color="#5762ff"
//                                     size="l#g"
//                                   />
//                                 </div>
//                                 <div className="info-dash-wrapper-item-details d-flex flex-row">
//                                   <div className="d-flex flex-column">
//                                     <label>Connect your Integrations</label>
//                                     <span>
//                                       Link your account to our integration and
//                                       commence your customer/contact
//                                       interactions.
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <IconChevronLeft
//                                 width="20"
//                                 className="invert"
//                                 color="#909090"
//                               />
//                             </div>
//                           </div>
//                           <div className="info-dash-wrapper d-flex">
//                             <div
//                               className="info-dash-wrapper-item d-flex flex-row justify-content-between"
//                               onClick={() => {
//                                 window.location = h.getRoute(
//                                   routes.automation.index,
//                                 );
//                               }}
//                             >
//                               <div className="d-flex flex-row gap-1">
//                                 <div
//                                   className="info-dash-wrapper-item-icon"
//                                   style={{ background: 'rgb(236 255 199)' }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faRobot}
//                                     style={{ cursor: 'pointer' }}
//                                     color="#79b503"
//                                     size="l#g"
//                                   />
//                                 </div>
//                                 <div className="info-dash-wrapper-item-details d-flex flex-row">
//                                   <div className="d-flex flex-column">
//                                     <label>Create Automations</label>
//                                     <span>
//                                       Send automated message based on your rule
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <IconChevronLeft
//                                 width="20"
//                                 className="invert"
//                                 color="#909090"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="d-flex flex-column">
//                         <div className="whatsapp-overview-wrapper d-flex">
//                           <div
//                             className="whatsapp-overview-wrapper-item d-flex flex-row"
//                             style={{ background: '#f945b336' }}
//                           >
//                             <div
//                               className="whatsapp-overview-wrapper-item-icon"
//                               style={{ background: '#f2f2f2a3' }}
//                             >
//                               <FontAwesomeIcon
//                                 icon={faPaperPlane}
//                                 style={{ cursor: 'pointer' }}
//                                 color="#ff70c7"
//                                 size="lg"
//                               />
//                             </div>
//                             <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
//                               <label>Message Sent</label>
//                               <span style={{ color: '#ff496e' }}>
//                                 {messagingStat?.sent?.overall_total
//                                   ? new Intl.NumberFormat('en-US').format(
//                                       messagingStat?.sent?.overall_total,
//                                     )
//                                   : 0}
//                               </span>
//                             </div>
//                           </div>

//                           <div
//                             className="whatsapp-overview-wrapper-item d-flex flex-row"
//                             style={{ background: '#ffa23357' }}
//                           >
//                             <div
//                               className="whatsapp-overview-wrapper-item-icon"
//                               style={{ background: '#f2f2f2a3' }}
//                             >
//                               <FontAwesomeIcon
//                                 icon={faEnvelopeOpen}
//                                 style={{ cursor: 'pointer' }}
//                                 color="#ffb155"
//                                 size="lg"
//                               />
//                             </div>
//                             <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
//                               <label>Response Rate</label>
//                               <span style={{ color: '#00c203' }}>
//                                 {messagingStat?.sent?.overall_rate?.toFixed(
//                                   2,
//                                 ) ?? 0}{' '}
//                                 %
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         {h.notEmpty(agencyUser.agency_fk) && (
//                           <OnboardingList agencyId={agencyUser.agency_fk} />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Body>
//       <Footer />
//     </div>
//   );
// }

const IndexOld = () => {
  return (
    <></>
  )
}
export default IndexOld