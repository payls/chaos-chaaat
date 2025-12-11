// import IconCrossVector from '../../Icons/IconCrossVector';
// import React, { useEffect, useState, useRef } from 'react';
// import { h } from '../../../helpers';
// import constant from '../../../constants/constant.json';
// import { api } from '../../../api';
// import { api as previewAPI } from '../Link/preview/api';
// import { useRouter } from 'next/router';
// import { routes } from '../../../configs/routes';
// import { config } from '../../../configs/config';
// import ContentEditable from 'react-contenteditable';
// import IconTransparentClipboard from '../../Icons/IconTransparentClipboard';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye } from '@fortawesome/free-solid-svg-icons';
// import CommonTooltip from '../../Common/CommonTooltip';
// import Preview from './preview/pages/preview';
// import { notEmpty } from './preview/helpers/general';
// import Toggle from 'react-toggle';
// import currency from '../../../constants/currency.json';
// import IconFileVector from '../../../components/Icons/IconFileVector';
// import IconEyeVector from '../../../components/Icons/IconEyeVector';
// import CommonTextAreaEditor from '../../Common/CommonTextAreaEditor';
// import CommonImage from './preview/components/Common/CommonImage';

// const projectTypeOptions = () => {
//   let projectType = [];
//   for (const type of Object.values(constant.PROJECT.TYPE)) {
//     projectType.push({ value: type, label: type });
//   }
//   return projectType;
// };

// const COLLIERS_OPTIONS = [
//   { label: 'Chaaat Standard', value: 'pave' },
//   { label: 'Colliers Landing Page', value: 'colliers' },
// ];

// const OGPS_OPTIONS = [
//   { label: 'Chaaat Standard', value: 'pave' },
//   { label: 'OGPS Landing Page', value: 'ogps' },
//   { label: 'OGPS STH BNK ENG Landing Page', value: 'ogps_sth_eng' },
//   { label: 'OGPS STH BNK CHN Landing Page', value: 'ogps_sth_chn' },
// ];

// const RAEON_OPTIONS = [
//   { label: 'Chaaat Standard', value: 'pave' },
//   { label: 'Raeon Internation Landing Page', value: 'raeon' },
// ];

// const STRCULTURE_OPTIONS = [
//   { label: 'Chaaat Standard', value: 'pave' },
//   { label: 'Strength Culture Landing Page', value: 'strculture' },
// ];

// export default function CreateLinkForm(props) {
//   const router = useRouter();

//   const {
//     isLoading,
//     setLoading,
//     formMode,
//     setFormMode,
//     selectedContactId,
//     isGeneralEnquiry,
//     agencyUser,
//   } = props;
//   const [projects, setProjects] = useState(null);
//   const [projectId, setProjectId] = useState(null);
//   const [projectProperties, setProjectProperties] = useState(null);
//   const [units, setUnits] = useState([]);
//   const [showCross, setShowCross] = useState(true);

//   const [selectedContact, setSelectedContact] = useState(null);
//   const [projectList, setProjectList] = useState([]);
//   const [contactList, setContactList] = useState([]);
//   const [unitList, setUnitList] = useState([]);
//   const [initProjectIdList, setInitProjectIdList] = useState([]);

//   const [selectedProjects, setSelectedProjects] = useState([]);
//   const [selectedUnits, setSelectedUnits] = useState([]);

//   const [formStep, setFormStep] = useState(1);
//   const [countryOptionsList, setCountryOptionsList] = useState([]);
//   const [cityOptionsList, setCityOptionsList] = useState([]);
//   const [selectedCountryList, setSelectedCountryList] = useState([]);
//   const [selectedCityList, setSelectedCityList] = useState([]);
//   const [selectedProjectType, setSelectedProjectType] = useState([]);
//   const [selectedTemplate, setSelectedTemplate] = useState('pave');

//   const [shortlistedProperties, setShortlistedProperties] = useState();
//   const [permalinkURL, setPermalinkURL] = useState('');
//   const [permalink, setPermalink] = useState('');
//   const [previewURL, setPreviewURL] = useState('');
//   const [agentEmailPreference, setAgentEmailPreference] = useState(true);
//   const [contactEmailPreference, setContactEmailPreference] = useState(true);
//   const [inviteEmailBody, setInviteEmailBody] = useState('');
//   const [inviteEmailSubject, setInviteEmailSubject] = useState('');
//   const [emailIntegrationStatus, setEmailIntegrationStatus] = useState(false);
//   const [priceToggle, setPriceToggle] = useState(false);
//   const [settingsData, setSettingsData] = useState([]);
//   const [contactLink, setContactLink] = useState(null);
//   const [customLandingPages, setCustomLandingPages] = useState([]);

//   const allQueries = {
//     setFilter: {
//       search: '',
//       contactOwner: '',
//       leadStatus: '',
//       proposalSent: '',
//       lastOpened: '',
//     },
//     moreFilter: {},
//   };

//   const editorRef = useRef(null);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);

//       let agencyUserTrayActiveSolutions =
//         await api.integrations.getAgencyUserActiveIntegrations(
//           null,
//           agencyUser,
//           false,
//         );
//       const active_integrations =
//         agencyUserTrayActiveSolutions?.data?.active_integrations;
//       let outlookStatus = !h.cmpStr(active_integrations?.outlook, 'inactive');

//       const gmailStatus = await checkGmailIntegration(
//         agencyUser.agency_user_id,
//       );

//       setEmailIntegrationStatus(gmailStatus || outlookStatus);
//       setLoading(false);

//       const apiRes = await api.agencyCustomLandingPage.get(
//         {
//           agency_fk: agencyUser.agency.agency_id,
//         },
//         false,
//       );
//       if (h.cmpStr(apiRes.status, 'ok')) {
//         const customLandingPagesOptions = [];
//         if (agencyUser.agency.real_estate_type === 'REAL_ESTATE') {
//           customLandingPagesOptions.push({
//             label: 'Chaaat Standard',
//             value: 'pave',
//           });
//         }

//         setCustomLandingPages([
//           ...customLandingPagesOptions,
//           ...apiRes.data?.custom_landing_pages?.map((m) => ({
//             label: m.landing_page_name,
//             value: m.landing_page,
//           })),
//         ]);
//       }
//     })();
//   }, [agencyUser]);

//   useEffect(() => {
//     (async () => {
//       if (h.notEmpty(selectedContactId)) {
//         setLoading(true);
//         const selectedContactRes = await api.contact.findById(
//           { contact_id: selectedContactId },
//           {},
//           false,
//         );
//         if (!selectedContactRes.data.contact) {
//           h.general.alert('error', {
//             message: 'Contact not found!',
//             autoCloseInSecs: 1,
//           });

//           await router.push(h.getRoute(routes.dashboard.leads.all_leads));
//         }
//         setSelectedContact(selectedContactRes.data.contact);

//         (async () => {
//           setLoading(true);
//           if (notEmpty(projects)) {
//             handleProjectLocationDropdownList(projects);
//             let parsedProj = handleProjectOptionList(
//               projects,
//               selectedContactRes.data.contact,
//             );
//             setProjects(projects);
//             setProjectList(parsedProj);
//           } else {
//             let projectApiRes = await api.project.contentFindAll(
//               {},
//               { slim: true },
//               false,
//             );
//             if (
//               h.cmpStr(projectApiRes.status, 'ok') &&
//               projectApiRes.data.projects &&
//               projectApiRes.data.projects.length > 0
//             ) {
//               handleProjectLocationDropdownList(projectApiRes.data.projects);
//               let parsedProj = handleProjectOptionList(
//                 projectApiRes.data.projects,
//                 selectedContactRes.data.contact,
//               );

//               setProjects(projectApiRes.data.projects);
//               setProjectList(parsedProj);
//             }
//           }

//           setLoading(false);
//         })();
//       }
//     })();
//   }, [selectedContactId]);

//   useEffect(() => {
//     (async () => {
//       if (selectedContact) {
//         setShowCross(
//           !h.leadStatus.afterLeadStatus(
//             selectedContact.lead_status,
//             constant.LEAD_STATUS.PROPOSAL_CREATED,
//           ),
//         );

//         handleContactOptionList([]);
//         handleUnitOptionList([]);
//       }
//     })();
//   }, [selectedContact]);

//   useEffect(() => {
//     if (h.notEmpty(contactLink)) {
//       setAgentEmailPreference(
//         agentEmailPreference
//           ? contactLink.data.contact.agent_email_preference
//           : agentEmailPreference,
//       );
//       setContactEmailPreference(
//         contactEmailPreference
//           ? contactLink.data.contact.contact_email_preference
//           : contactEmailPreference,
//       );
//     }
//   }, [contactLink]);

//   // To reload project lists when country and city filter is selected
//   useEffect(() => {
//     handleProjectLocationDropdownList(projects || []);
//     if (notEmpty(projects)) {
//       const parsedProj = handleProjectOptionList(projects);
//       setProjectList(parsedProj);
//     }
//   }, [selectedCountryList, selectedCityList, selectedProjectType]);

//   const formFieldsStep1 = {
//     project_id: {
//       field_type: h.form.FIELD_TYPE.SELECT_WITH_DROPDOWN,
//       class_name: `col-12 modal-input-group dropdown-btn`,
//       label: 'Project*',
//       options: projectList,
//       modern: true,
//       placeholder: 'Select a project',
//       dropdownOptions: [
//         {
//           placeholder: 'Project Type',
//           options: projectTypeOptions(),
//           setSelectedOptions: setSelectedProjectType,
//           noOptionsMessage: 'Select a Project Type',
//         },
//         {
//           placeholder: 'Country',
//           options: countryOptionsList,
//           setSelectedOptions: setSelectedCountryList,
//         },
//         {
//           placeholder: 'Region',
//           options: cityOptionsList,
//           setSelectedOptions: setSelectedCityList,
//           noOptionsMessage: 'Select a Region',
//         },
//       ],
//     },
//     unit_id: {
//       field_type: h.form.FIELD_TYPE.SELECT,
//       class_name: `col-12 modal-input-group dropdown-btn`,
//       label: null,
//       modern: true,
//       options: unitList,
//       placeholder: 'Select a unit',
//     },
//   };

//   if (h.notEmpty(agencyUser)) {
//     switch (agencyUser.agency_fk) {
//       case '3e09fed6-3538-442a-a458-ef95af682114': // Colliers
//       case '1f880948-0097-40a8-b431-978fd59ca321': // OGPS prod
//       case '1da3ff5f-d3fc-11eb-8182-065264a181d4': // RAEON prod
//       case '03770cad-f837-40ca-aec0-30bb292f65f2': // Strength Culture prod
//       case 'b07cac2d-7e95-40e4-a9f1-e7c9e6061911': // Breathe Pilates prod
//       case 'eb13e656-3d7e-4328-966c-cb0b52baf3c1': // Hybrid prod
//       case 'd3e5e710-59a6-4d03-8313-da45b893022b': // Hybrid prod
//       case '21c4ecb5-abbe-4964-b8a6-32371059fa47': // H-kore prod
//       case '9f8a2017-f5e2-4a05-9465-3d217527ea5a': // Lucid Vue
//       case 'cd5e428d-086b-48fc-9ece-479943180256': // f45 Punggol
//       case 'a7087be7-01c1-40d2-a808-7f19bb274c5e': // J Elliot
//         formFieldsStep1.proposal_template = {
//           field_type: h.form.FIELD_TYPE.SELECT,
//           class_name: `col-12 modal-input-group dropdown-btn`,
//           label: 'Template*',
//           options: customLandingPages,
//           modern: true,
//           value: customLandingPages[0],
//           placeholder: 'Select a template',
//         };
//         break;
//       case '21c4ecb5-abbe-4964-b8a6-32371059fa47': // H-kore prod
//       case 'd3e5e710-59a6-4d03-8313-da45b893022b': // Hybrid prod
//       case 'd3e5e710-59a6-4d03-8313-da45b893022b': // Hybrid prod
//       case 'b07cac2d-7e95-40e4-a9f1-e7c9e6061911': // Breathe Pilates prod
//       case '03770cad-f837-40ca-aec0-30bb292f65f2': // Strength Culture prod
//       case '1da3ff5f-d3fc-11eb-8182-065264a181d4': // Raeon
//       case '3e09fed6-3538-442a-a458-ef95af682114': // Colliers
//       case '1f880948-0097-40a8-b431-978fd59ca321': // OGPS prod
//       case 'c1189614-e72e-4c63-8ad3-afe0d8d3d15e': // test staging - ian
//       case 'f346de6f-4b6e-4899-8107-f71bfef1a724': // test qa - ian
//       case 'd142b4dd-bbec-11eb-8026-02b1ece053a6': // test prod - ian
//       case '9f8a2017-f5e2-4a05-9465-3d217527ea5a': // Lucid Vue
//       case 'cd5e428d-086b-48fc-9ece-479943180256': // f45 Punggol
//       case 'a7087be7-01c1-40d2-a808-7f19bb274c5e': // J Elliot
//         formFieldsStep1.proposal_template = {
//           field_type: h.form.FIELD_TYPE.SELECT,
//           class_name: `col-12 modal-input-group dropdown-btn`,
//           label: 'Template*',
//           options: [
//             { label: 'Chaaat Standard', value: 'pave' },
//             { label: 'Colliers Landing Page', value: 'colliers' },
//             { label: 'OGPS Landing Page', value: 'ogps' },
//             { label: 'OGPS - Persimmon ENG', value: 'ogps_persimmon_eng' },
//             { label: 'OGPS - Persimmon CHN', value: 'ogps_persimmon_chn' },
//             { label: 'OGPS STH BNK ENG Landing Page', value: 'ogps_sth_eng' },
//             { label: 'OGPS STH BNK CHN Landing Page', value: 'ogps_sth_chn' },
//             {
//               label: 'OGPS Burmingham Landing Page',
//               value: 'ogps_burmingham',
//             },
//             {
//               label: 'OGPS - Expat',
//               value: 'ogps_expat',
//             },
//             {
//               label: 'OGPS - Park Avenue Place',
//               value: 'ogps_park_avenue',
//             },
//             {
//               label: 'OGPS - Park Avenue Place[HK] ENG',
//               value: 'ogps_park_avenue_hk_eng',
//             },
//             {
//               label: 'OGPS - Park Avenue Place[HK] CHN',
//               value: 'ogps_park_avenue_hk_chn',
//             },
//             {
//               label: 'OGPS - Wembley Park Gardens',
//               value: 'ogps_wembley',
//             },
//             {
//               label: 'OGPS - Hendon Waterside - London',
//               value: 'ogps_hendon',
//             },
//             {
//               label: 'OGPS - Hendon Waterside - MY',
//               value: 'ogps_hendon_my',
//             },
//             {
//               label: 'OGPS - Park Quarter',
//               value: 'ogps_park_quarter',
//             },
//             {
//               label: 'OGPS - Manchester',
//               value: 'ogps_manchester',
//             },
//             {
//               label: 'OGPS - MQDC',
//               value: 'ogps_mqdc',
//             },
//             {
//               label: 'OGPS - Melbourne Townhouse',
//               value: 'ogps_melbourne_townhouse',
//             },
//             {
//               label: 'OGPS - Barratt London Collection - Personal',
//               value: 'ogps_barratt_personal',
//             },
//             {
//               label: 'OGPS - Barratt London Collection - Invited',
//               value: 'ogps_barratt_invited',
//             },
//             {
//               label: 'OGPS - Barratt London Collection - MY',
//               value: 'ogps_barratt_my',
//             },
//             {
//               label: 'OGPS - Peninsula Gardens',
//               value: 'ogps_pen_gardens',
//             },
//             {
//               label: 'OGPS - Vision Point',
//               value: 'ogps_vision_point',
//             },
//             {
//               label: 'OGPS - Eastman Village ENG',
//               value: 'ogps_eastman_village',
//             },
//             {
//               label: 'OGPS - Eastman Village MY',
//               value: 'ogps_eastman_village_my',
//             },
//             {
//               label: 'OGPS - Perth',
//               value: 'ogps_perth',
//             },
//             {
//               label: 'OGPS - Trafford Gardens',
//               value: 'ogps_trafford_gardens',
//             },
//             { label: 'Raeon Internation Landing Page', value: 'raeon' },
//             { label: 'Strength Culture Landing Page', value: 'strculture' },
//             { label: 'Breathe Pilates', value: 'breathe_pilates' },
//             {
//               label: 'Breathe Pilates - Classes and Prices',
//               value: 'breathe_pilates_classes_prices',
//             },
//             {
//               label: 'Breathe Pilates - Prospects',
//               value: 'breathe_pilates_prospects',
//             },
//             {
//               label: 'Breathe Pilates - Re-Engagement',
//               value: 'breathe_pilates_re_engagement',
//             },
//             {
//               label: 'Hybrid HK',
//               value: 'hybrid_hk',
//             },
//             {
//               label: 'Hybrid Gym Group',
//               value: 'hybrid_gym_group',
//             },
//             {
//               label: 'H-Kore',
//               value: 'h_kore',
//             },
//             {
//               label: 'Fulton & Fifth',
//               value: 'ogps_fulton_fifth',
//             },
//             {
//               label: 'OGPS - Floret',
//               value: 'ogps_floret',
//             },
//             {
//               label: 'Lucid Vue',
//               value: 'lucid_vue',
//             },
//             {
//               label: 'F45 - Punggol Plaza',
//               value: 'f45_punggol',
//             },
//             {
//               label: 'J Elliot',
//               value: 'j_elliot',
//             },
//           ],
//           modern: true,
//           value: { label: 'Chaaat Standard', value: 'pave' },
//           placeholder: 'Select a template',
//         };
//         break;
//     }
//   }

//   const [fieldsStep1, setFieldsStep1] = useState(
//     h.form.initFields(formFieldsStep1),
//   );

//   useEffect(() => {
//     (async () => {
//       if (
//         notEmpty(projects) &&
//         notEmpty(fieldsStep1.project_id.value) &&
//         notEmpty(fieldsStep1.project_id.value.value)
//       ) {
//         const val = fieldsStep1.project_id.value.value;

//         setLoading(true);
//         let selectedProject = projects.find(
//           (project) => project.project_id === String(val),
//         );
//         if (selectedProject) {
//           const selectedProjectId = selectedProject.project_id;
//           // setProjectId(selectedProjectId);

//           const propertiesApiRes = await api.project.contentFindAllProperties(
//             selectedProjectId,
//             {},
//             {},
//             false,
//           );

//           if (
//             h.cmpStr(propertiesApiRes.status, 'ok') &&
//             propertiesApiRes.data.properties &&
//             propertiesApiRes.data.properties.length > 0
//           ) {
//             const projectProperties = propertiesApiRes.data.properties;
//             setProjectProperties(projectProperties);

//             projectProperties.forEach((p) => {
//               p.currency_code = selectedProject.currency_code;
//             });
//             h.form.updateFields('unit_id', fieldsStep1, setFieldsStep1, {
//               value: '',
//             });

//             setUnits(projectProperties);
//             setUnitList(handleUnitOptionList(projectProperties));
//           }

//           if (
//             !selectedProjects.find(
//               (project) => project.project_id === selectedProject.project_id,
//             )
//           ) {
//             setSelectedProjects([selectedProject, ...selectedProjects]);
//           }
//           setLoading(false);
//         }
//       }
//     })();
//   }, [fieldsStep1.project_id]);

//   useEffect(() => {
//     if (fieldsStep1.proposal_template?.value) {
//       setSelectedTemplate(fieldsStep1.proposal_template?.value?.value);
//     }
//   }, [fieldsStep1.proposal_template]);

//   useEffect(() => {
//     if (notEmpty(projects)) {
//       const unitValue = fieldsStep1.unit_id.value.value;
//       const projectValue = fieldsStep1.project_id.value.value;
//       const selectedUnit = units.find(
//         (unit) => unit.project_property_id === String(unitValue),
//       );
//       let selectedProject = projects.find(
//         (project) => project.project_id === String(projectValue),
//       );
//       if (selectedUnit) {
//         if (
//           !selectedUnits.find(
//             (unit) =>
//               unit.project_property_id === selectedUnit.project_property_id,
//           )
//         ) {
//           // To reorder the selected projects when a new unit is added
//           const reorderedProjects = [];
//           reorderedProjects.push(selectedProject);
//           for (const projIndx in selectedProjects) {
//             const project = selectedProjects[projIndx];
//             if (project.project_id != selectedProject.project_id) {
//               reorderedProjects.push(project);
//             }
//           }
//           setSelectedProjects(reorderedProjects);
//           setSelectedUnits([selectedUnit, ...selectedUnits]);
//         } else {
//           h.general.alert('error', {
//             message: 'Unit already exists in proposal!',
//             autoCloseInSecs: 1,
//           });
//         }
//       }
//     }
//   }, [fieldsStep1.unit_id]);

//   /**
//    * Check user if gmail integrated
//    */
//   const checkGmailIntegration = async (agency_user_fk) => {
//     const activeIntegrationResponse =
//       await api.integrations.getGMailActiveIntegration(
//         {
//           agency_user_fk,
//         },
//         false,
//       );

//     if (
//       h.cmpStr(activeIntegrationResponse.status, 'ok') &&
//       h.notEmpty(activeIntegrationResponse.data.agency_oauth)
//     ) {
//       return true;
//     }

//     return false;
//   };

//   const handleProjectLocationDropdownList = (projects) => {
//     const cityList = [];
//     const countryList = [];
//     projects
//       .filter((p) => {
//         if (h.notEmpty(selectedProjectType)) {
//           return selectedProjectType.includes(p.project_type);
//         }

//         return true;
//       })
//       .forEach((project) => {
//         if (h.notEmpty(project.location_google_place_raw)) {
//           const city = h.general.getCity(project.location_google_place_raw);
//           const country = h.general.getCountry(
//             project.location_google_place_raw,
//           );
//           if (
//             selectedCountryList.includes(country) &&
//             !cityList.includes(city)
//           ) {
//             cityList.push(city);
//           }
//           if (!countryList.includes(country)) {
//             countryList.push(country);
//           }
//           if (
//             selectedCityList.includes(city) &&
//             !selectedCountryList.includes(country)
//           ) {
//             const filteredSelectedCities = selectedCityList.filter(
//               (selectedCity) => selectedCity !== city,
//             );
//             setSelectedCityList([...filteredSelectedCities]);
//           }
//         }
//       });
//     setCountryOptionsList(
//       countryList.sort().map((country) => ({ label: country, value: country })),
//     );
//     setCityOptionsList(
//       cityList.sort().map((city) => ({ label: city, value: city })),
//     );
//   };

//   const handleProjectOptionList = (projects, contact) => {
//     let options = [];
//     let initProjectIds = [];
//     projects
//       .filter((f) => {
//         if (h.notEmpty(selectedProjectType)) {
//           return selectedProjectType.includes(f.project_type);
//         }
//         return true;
//       })
//       .forEach((project) => {
//         if (h.notEmpty(selectedCountryList) || h.notEmpty(selectedCityList)) {
//           if (h.notEmpty(project.location_google_place_raw)) {
//             const city = h.general.getCity(project.location_google_place_raw);
//             const country = h.general.getCountry(
//               project.location_google_place_raw,
//             );
//             if (
//               (h.isEmpty(selectedCountryList) ||
//                 selectedCountryList.includes(country)) &&
//               (h.isEmpty(selectedCityList) || selectedCityList.includes(city))
//             ) {
//               let details = {};
//               details.value = project.project_id;
//               details.label = project.name;
//               options.push(details);
//             }
//           }
//         } else {
//           let details = {};
//           details.value = project.project_id;
//           details.label = project.name;
//           options.push(details);
//         }
//       });

//     // if a selected Contact exists, set the initial selected projects.
//     let projectIdList = [];
//     let propertyProjects = [];
//     let shortlistedProjects = [];
//     if (contact && h.isEmpty(selectedProjects)) {
//       setProjects(projects);
//       options.sort((a, b) => a.label.localeCompare(b.label));
//       // options.unshift({ label: 'Select project', value: '' });
//       setProjectList(options);
//       // make sure contact has shortlisted properties
//       if (h.notEmpty(contact.shortlisted_properties)) {
//         // make sure shorlisted properties are still existent and connected to data.
//         contact.shortlisted_properties.map((property) => {
//           if (
//             h.notEmpty(property.unit) &&
//             h.notEmpty(property.unit.project) &&
//             h.notEmpty(property.unit.project.project_id)
//           ) {
//             // mapping projects according ot shortlisted properties.
//             projects.map((project) => {
//               if (
//                 h.cmpStr(project.project_id, property.unit.project.project_id)
//               ) {
//                 if (!projectIdList.includes(property.unit.project.project_id)) {
//                   propertyProjects.push(project);
//                   projectIdList.push(property.unit.project.project_id);
//                 }
//               }
//             });
//           }
//         });
//       }

//       if (h.notEmpty(contact.shortlisted_projects)) {
//         contact.shortlisted_projects.map((shortlisted_project) => {
//           const project = shortlisted_project.project;
//           project.display_order = shortlisted_project.display_order;
//           shortlistedProjects.push(project);
//           projectIdList.push(project.project_id);
//         });
//         shortlistedProjects.sort((a, b) => a.display_order - b.display_order);
//         setInitProjectIdList(shortlistedProjects);
//         setSelectedProjects(shortlistedProjects);
//       } else {
//         setInitProjectIdList(propertyProjects);
//         setSelectedProjects(propertyProjects);
//       }
//     }

//     return options;
//   };

//   const handleContactOptionList = (contacts) => {
//     let options = [{ label: 'Select contact', value: '' }];

//     if (selectedContact) {
//       options.pop();
//       options.push({
//         value: selectedContactId,
//         label: `${h.user.formatFullName(selectedContact)}`,
//       });
//       setContactList(options);
//     }

//     contacts.forEach((contact) => {
//       if (
//         h.isEmpty(contact.permalink) &&
//         h.notEmpty(contact.agency_fk) &&
//         h.notEmpty(contact.agency_user_fk)
//       ) {
//         let details = {};
//         details.value = contact.contact_id;
//         details.label = `${h.user.formatFullName(contact)}`;
//         options.push(details);
//       }
//     });
//     return options;
//   };

//   const handleUnitOptionList = (units) => {
//     let options = [];

//     // checking selectedUnits is empty to make sure it doesn't refresh everytime this function is called.
//     if (selectedContact && h.isEmpty(selectedUnits)) {
//       let tempSelectedUnits = [];
//       selectedContact.shortlisted_properties.map((property) => {
//         if (property) {
//           tempSelectedUnits.push({
//             ...property,
//             project_property_id: property.project_property_fk,
//           });
//         }
//       });
//       tempSelectedUnits.sort(
//         (a, b) => parseInt(a.display_order) - parseInt(b.display_order),
//       );
//       setSelectedUnits(tempSelectedUnits);
//     }

//     units
//       .sort((a, b) => a.unit_number.localeCompare(b.unit_number))
//       .forEach((unit) => {
//         let details = {};
//         details.value = unit.project_property_id;
//         details.label = `#${unit.unit_number} |
//       ${unit.unit_type ? unit.unit_type + ' |' : ''}
//       ${h.general.customFormatDecimal(
//         unit.number_of_bedroom,
//       )} bed | ${h.general.customFormatDecimal(
//           unit.number_of_bathroom,
//         )} bath | ${h.currency.format(unit.starting_price)} ${
//           unit.currency_code
//         }`;
//         options.push(details);
//       });
//     return options;
//   };

//   const handleCancel = async () => {
//     await router.push(h.getRoute(routes.dashboard.leads.all_leads));
//   };

//   const handleGenerateLink = async () => {
//     let formDataStep1 = {};
//     formDataStep1.contact_id = selectedContactId;
//     formDataStep1.autogenerate_permalink = true;
//     // assign display order to current order of projects
//     formDataStep1.project_ids = selectedProjects.map(
//       (selectedProject, order) => {
//         return {
//           project_id: selectedProject.project_id,
//           display_order: order + 1,
//         };
//       },
//     );
//     // assign display order to the current order of units
//     formDataStep1.unit_ids = selectedUnits
//       .sort((a, b) => a.unit_number - b.unit_number)
//       .map((selectedUnit, order) => {
//         return {
//           project_property_id: selectedUnit.project_property_id,
//           display_order: order + 1,
//           is_general_enquiry: selectedUnit.is_general_enquiry,
//         };
//       });
//     formDataStep1.is_general_enquiry = isGeneralEnquiry;
//     formDataStep1.permalink_template = selectedTemplate ?? 'pave';
//     const [contactLink] = await Promise.all([
//       h.cmpStr(formMode, h.form.FORM_MODE.ADD)
//         ? api.contactLink.create(formDataStep1, false)
//         : api.contactLink.update(formDataStep1, false),
//     ]).catch(() => {
//       h.general.alert('error', {
//         message: 'failed to create or update proposal link',
//         autoCloseInSecs: 1,
//       });
//     });

//     setPermalinkURL(
//       h.route.createSubdomainUrl(
//         agencyUser.agency.agency_subdomain,
//         `${config.webUrl}/${h.general.ucFirstAllWords(
//           agencyUser.agency.agency_subdomain
//             ? agencyUser.agency.agency_subdomain
//             : agencyUser?.agency?.agency_name,
//         )}-Proposal-for-${h.user.combineFirstNLastName(
//           contactLink.data.contact.first_name,
//           contactLink.data.contact.last_name,
//           '-',
//         )}-${contactLink.data.permalink}`,
//       ),
//     );
//     setPermalink(contactLink.data.permalink);
//     setPreviewURL(
//       h.route.createSubdomainUrl(
//         agencyUser.agency.agency_subdomain,
//         `${config.webUrl}/preview?permalink=${contactLink.data.permalink}`,
//       ),
//     );
//     setContactLink(contactLink);
//   };

//   const handleToStep1 = async (toStep) => {};

//   const handleToStep2 = async (toStep) => {
//     await handleGenerateLink();
//     // Reset settings
//     setSettingsData([]);
//   };

//   const handleToStep3 = async (toStep) => {
//     // Setting if user jumps step1 to step2
//     if (formStep === 1) {
//       await handleGenerateLink();
//     }

//     // Save settings
//     // Async settings
//     for (let i in settingsData) {
//       try {
//         const m = settingsData[i];
//         await previewAPI.shortlistedProject.saveShortlistedProjectSettings(
//           m,
//           false,
//         );
//       } catch (err) {
//         h.general.alert('error', {
//           message: err,
//           autoCloseInSecs: 1,
//         });
//       }
//     }

//     const [inviteEmailDetails] = await Promise.all([
//       api.contactLink.InviteEmail(
//         {
//           contact_id: selectedContactId,
//         },
//         false,
//       ),
//     ]).catch((error) => {
//       h.general.alert('error', {
//         message: error,
//         autoCloseInSecs: 1,
//       });
//     });

//     if (h.cmpStr(inviteEmailDetails.status, 'ok')) {
//       // if it's empty(initial state) set it to the values from database, else set it to the new changed values
//       setInviteEmailSubject(
//         h.isEmpty(inviteEmailSubject)
//           ? inviteEmailDetails.data.invite_email_subject
//           : inviteEmailSubject,
//       );
//       setInviteEmailBody(
//         h.isEmpty(inviteEmailBody)
//           ? inviteEmailDetails.data.invite_email_body
//           : inviteEmailBody,
//       );
//     }

//     // in order to display user feedback.
//     await api.contactLink.saveEmailPreferences(
//       {
//         contact_id: selectedContactId,
//         agent_email_preference: agentEmailPreference,
//         contact_email_preference: contactEmailPreference,
//         invite_email_subject: inviteEmailSubject,
//         invite_email_body: inviteEmailBody,
//         email_integration_status: emailIntegrationStatus,
//         send_email: formStep === 3 && toStep === 3,
//       },
//       formStep === 3 && toStep === 3,
//     );
//   };

//   const handleSubmit = async (toStep) => {
//     setLoading(true);

//     switch (toStep) {
//       case 1:
//         await handleToStep1(toStep);
//         break;
//       case 2:
//         await handleToStep2(toStep);
//         break;
//       case 3:
//         await handleToStep3(toStep);
//         break;
//     }

//     setLoading(false);

//     setFormStep(toStep || formStep + 1);

//     if (formStep === 3 && toStep === 3)
//       await router.push(h.getRoute(routes.dashboard.leads.all_leads));

//     setFormMode(h.form.FORM_MODE.EDIT);
//   };

//   const unselectProject = (project_id) => {
//     setSelectedProjects(
//       selectedProjects.filter((project) => project.project_id !== project_id),
//     );
//   };

//   const unselectUnit = (unit_id) => {
//     setSelectedUnits(
//       selectedUnits.filter((unit) => unit.project_property_id !== unit_id),
//     );
//   };

//   const isNewProjectProperty = (projectProperty) => {
//     return h.isEmpty(projectProperty.shortlisted_property_id);
//   };

//   const isNewProject = (project) => {
//     for (let i = 0; i < initProjectIdList.length; i++) {
//       if (initProjectIdList[i].project_id === project.project_id) {
//         return false;
//       }
//     }
//     return true;
//   };

//   const isSubmitButtonActive =
//     !h.isEmpty(selectedContactId) && selectedProjects.length > 0 && agencyUser;

//   const formStepDescription = [
//     {
//       number: 1,
//       description: 'Select Project and Shortlisted Properties',
//     },
//     {
//       number: 2,
//       description: 'Review and Personalise',
//     },
//     {
//       number: 3,
//       description: 'Notify Buyer',
//     },
//   ];

//   // commenting out as it's hidden for now but will modify it to relevance later.
//   // const ToolTipDisplay = (props) => (
//   //   <div className="row justify-content-center">
//   //     <div className="col-1 text-right">
//   //       <IconToolTip />
//   //     </div>
//   //     <div className="col-10">
//   //       <span className="pt-3">{popoverText(props.step)}</span>
//   //     </div>
//   //   </div>
//   // );

//   const popoverText = (step) => {
//     switch (step) {
//       case 1:
//         return 'Invite a buyer to view properties on the Chaaat platform in three simple steps';
//       case 2:
//         return 'Review and modify messages that will be sent to the buyer';
//       case 3:
//         return 'Choose your email notification preferences';
//       default:
//         return '';
//     }
//   };

//   const copyToClipBoard = async (permalink, e) => {
//     if (e) e.preventDefault();
//     if (!navigator.clipboard) {
//       return console.log('copy not supported');
//     }
//     try {
//       await navigator.clipboard.writeText(permalink.permalinkURL);
//       h.general.alert('success', { message: 'Copied!', autoCloseInSecs: 1 });

//       // refetch contact with updated lead_status
//       const getContactRes = await api.contact.findOne(
//         {
//           contact_id: selectedContact.contact_id,
//         },
//         false,
//       );

//       const currentLeadStatus = getContactRes.data.contact.lead_status;

//       let newLeadStatus;
//       const constantLeadStatus = constant.LEAD_STATUS;
//       switch (currentLeadStatus) {
//         case constantLeadStatus.PROPOSAL_CREATED:
//           newLeadStatus = constantLeadStatus.PROPOSAL_SENT;
//           break;
//         case constantLeadStatus.UPDATED_PROPOSAL_CREATED:
//           newLeadStatus = constantLeadStatus.UPDATED_PROPOSAL_SENT;
//           break;
//         default:
//       }

//       if (newLeadStatus) {
//         const apiRes = await api.contact.update(
//           {
//             contact_id: selectedContact.contact_id,
//             lead_status: newLeadStatus,
//           },
//           false,
//         );
//       }
//     } catch (err) {
//       h.general.alert('error', { message: 'Copy failed', autoCloseInSecs: 1 });
//     }
//   };

//   const getProjectCurrencySymbol = (propertyId) => {
//     if (h.notEmpty(propertyId.currency_code)) {
//       return currency[propertyId.currency_code].symbol;
//     }

//     return currency[propertyId.project_property?.project?.currency_code]
//       ?.symbol;
//   };

//   const handleTogglePrice = (e) => {
//     setSelectedUnits(
//       h.general.deepCloneObject(selectedUnits).map((sUnit) => {
//         return {
//           ...sUnit,
//           is_general_enquiry: e.target.checked,
//         };
//       }),
//     );
//   };

//   const handleToggleUnitPrice = (e, propertyId) => {
//     setSelectedUnits(
//       h.general.deepCloneObject(selectedUnits).map((sUnit) => {
//         return {
//           ...sUnit,
//           is_general_enquiry:
//             sUnit.project_property_id === propertyId
//               ? e.target.checked
//               : sUnit.is_general_enquiry,
//         };
//       }),
//     );
//   };

//   /**
//    *  Get first media image
//    * @param {*} unit
//    * @returns image src
//    */
//   const getFirstMediaImage = (unit) => {
//     let media = null;
//     if (unit) {
//       if ('project_media_properties' in unit) {
//         media = unit.project_media_properties
//           .filter(
//             (f) =>
//               f.project_medium?.type ===
//               constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//           )
//           .map((m) => {
//             return {
//               media_thumbnail_src: m.project_medium?.thumbnail_src,
//               media_src: m.project_medium?.src,
//               media_display_order: m.project_medium?.display_order,
//             };
//           })
//           .sort((a, b) => a.media_display_order - b.media_display_order);
//       } else {
//         media = unit.medias
//           .filter(
//             (f) => f.media_type === constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
//           )
//           .sort((a, b) => a.media_display_order - b.media_display_order);
//       }

//       if (media.length > 0) {
//         return media[0].media_thumbnail_src
//           ? media[0].media_thumbnail_src
//           : media[0].media_url;
//       }

//       // return temp image if no image available
//       return 'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png';
//     }
//   };

//   return (
//     <div className="p-3 row">
//       <div className="form-steps">
//         {formStepDescription.map((step, i) => (
//           <div
//             className={'step  ' + (step.number === formStep ? 'active' : '')}
//             key={i}
//           >
//             <button
//               className={step.number === formStep ? 'selected' : ''}
//               onClick={
//                 () => isSubmitButtonActive && handleSubmit(step.number) // either 1 or 2 will be passed on.
//               }
//             >
//               {step.number}
//             </button>
//             <span>{step.description}</span>
//           </div>
//         ))}
//       </div>
//       <div
//         style={{
//           zIndex: 1,
//           textAlign: 'center',
//           fontFamily: 'PoppinsRegular',
//           fontSize: '18px',
//           width: '100%',
//           display: 'none',
//         }}
//         className="step-name"
//       >
//         {formStep ? formStepDescription[formStep - 1].description : ''}
//       </div>

//       {formStep === 1 && (
//         <div
//           className="d-flex"
//           style={{
//             alignItems: 'center',
//             justifyContent: 'center',
//             flex: 1,
//             flexBasis: 'auto',
//           }}
//         >
//           <div
//             className="modal-body animate-fadeIn"
//             style={{ overflowY: 'auto' }}
//           >
//             <div>
//               {/*<div className={'mb-5'}>*/}
//               {/*  <ToolTipDisplay step={formStep} />*/}
//               {/*  /!*<span>Start by selecting contacts, projects, units, etc.</span>*!/*/}
//               {/*</div>*/}
//               {selectedContact && (
//                 <h3 align="right" className="modal-sub-title">
//                   Select Projects and Units for {selectedContact.first_name}{' '}
//                   {selectedContact.last_name}
//                 </h3>
//               )}

//               <h.form.GenericForm
//                 className="text-left"
//                 formFields={formFieldsStep1}
//                 formMode={h.form.FORM_MODE.ADD}
//                 setLoading={setLoading}
//                 fields={fieldsStep1}
//                 setFields={setFieldsStep1}
//                 showCancelButton={false}
//                 showSubmitButton={false}
//                 key="proposal-link-form"
//               />

//               <div className="mt-2 selected-projects">
//                 <span className="selected-projects-header">
//                   Selected projects:
//                 </span>
//                 {selectedProjects.length === 0 && (
//                   <div className="selected-projects-warning">
//                     No selected Project.
//                   </div>
//                 )}
//                 {selectedProjects.map((project, i) => (
//                   <div
//                     className="d-flex justify-content-between selected-project-item animate-fadeIn mb-3"
//                     key={i}
//                   >
//                     <div
//                       className="d-flex align-items-center"
//                       style={{ gap: '1.3em' }}
//                     >
//                       <CommonImage
//                         src={
//                           project.property_header_info_cover_picture_url
//                             ? project.property_header_info_cover_picture_url
//                             : 'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png'
//                         }
//                         width="80px"
//                         height="80px"
//                         style={{
//                           borderRadius: '8px',
//                           objectFit: 'cover',
//                         }}
//                       />
//                       <span className="selected-project-item-title">
//                         {project.name}
//                       </span>
//                     </div>
//                     {(isNewProject(project) || showCross) && (
//                       <button
//                         className="btn ml-2"
//                         onClick={() => unselectProject(project.project_id)}
//                       >
//                         <IconCrossVector style={{ height: 16 }} />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <br />
//                 <div className="d-flex justify-content-between">
//                   <span className="selected-projects-header">
//                     Selected units:
//                   </span>
//                   {selectedUnits.length > 0 && (
//                     <label className="price-all-toggle d-flex align-items-center">
//                       <span>Price</span>
//                       <Toggle
//                         defaultChecked={priceToggle}
//                         icons={false}
//                         className="price-toggle"
//                         onChange={handleTogglePrice}
//                       />
//                     </label>
//                   )}
//                 </div>
//                 {selectedUnits.length === 0 && (
//                   <div className="selected-projects-warning">
//                     No selected Unit.
//                   </div>
//                 )}
//                 {selectedUnits
//                   .sort((a, b) => a.unit_number - b.unit_number)
//                   .map((unit, i) => {
//                     let tempUnit = null;
//                     if (unit && unit.unit && unit.unit.unit)
//                       tempUnit = unit.unit.unit;
//                     else if (unit && unit.unit) tempUnit = unit.unit;
//                     else if (unit) tempUnit = unit;
//                     return (
//                       <div
//                         key={i}
//                         className="d-flex justify-content-between selected-project-item"
//                       >
//                         {h.notEmpty(tempUnit) && (
//                           <div
//                             className="d-flex align-items-center mb-3 animate-fadeIn mb-3"
//                             style={{ gap: '1.3em' }}
//                           >
//                             <CommonImage
//                               placeholder="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png"
//                               src={getFirstMediaImage(tempUnit)}
//                               width="80px"
//                               height="80px"
//                               style={{
//                                 borderRadius: '8px',
//                                 objectFit: 'cover',
//                               }}
//                             />
//                             <div className="d-flex flex-column">
//                               <span className="selected-project-item-title">
//                                 #{tempUnit.unit_number || 0} |{' '}
//                                 {tempUnit.unit_type
//                                   ? tempUnit.unit_type + ' | '
//                                   : ''}
//                                 {h.general.customFormatDecimal(
//                                   tempUnit.number_of_bedroom,
//                                 ) ||
//                                   h.general.customFormatDecimal(tempUnit.bed) ||
//                                   0}{' '}
//                                 bed |{' '}
//                                 {h.general.customFormatDecimal(
//                                   tempUnit.number_of_bathroom,
//                                 ) ||
//                                   h.general.customFormatDecimal(
//                                     tempUnit.bath,
//                                   ) ||
//                                   0}{' '}
//                                 bath |{' '}
//                                 {h.currency.format(
//                                   tempUnit.start_price
//                                     ? tempUnit.start_price
//                                     : tempUnit.starting_price,
//                                 )}{' '}
//                                 {tempUnit.currency_code ||
//                                   tempUnit.currency.toUpperCase()}
//                               </span>
//                               <label className="price-all-toggle d-flex align-items-center">
//                                 <span>
//                                   {/* {console.log(unit)} */}
//                                   {getProjectCurrencySymbol(unit)}
//                                 </span>
//                                 <Toggle
//                                   checked={unit.is_general_enquiry}
//                                   icons={false}
//                                   className="price-toggle"
//                                   defaultValue={unit.is_general_enquiry}
//                                   onChange={(e) =>
//                                     handleToggleUnitPrice(
//                                       e,
//                                       unit.project_property_id,
//                                     )
//                                   }
//                                 />
//                               </label>
//                             </div>
//                           </div>
//                         )}
//                         {(isNewProjectProperty(unit) || showCross) && (
//                           <button
//                             className="btn remove-btn"
//                             onClick={() =>
//                               unselectUnit(unit.project_property_id)
//                             }
//                           >
//                             <IconCrossVector style={{ height: 16 }} />
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })}
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 className="common-button transparent-bg"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="common-button"
//                 style={{ cursor: isSubmitButtonActive ? 'pointer' : 'default' }}
//                 onClick={() =>
//                   isSubmitButtonActive && handleSubmit(formStep + 1)
//                 }
//               >
//                 Save & Next Step
//               </button>
//             </div>
//           </div>

//           {/*    </div>*/}
//           {/*</div>*/}
//         </div>
//       )}

//       {formStep === 2 && (
//         <>
//           <div
//             className={'modal-body preview-body animate-fadeIn'}
//             style={{
//               overflowY: 'auto',
//               height: '100%',
//               width: '100vw',
//               marginLeft: '-10vw',
//               marginRight: '-10vw',
//             }}
//           >
//             <Preview
//               permalink={permalink}
//               setSettingsData={(e) => {
//                 setSettingsData(e);
//               }}
//               settingsData={settingsData}
//             />
//             <div className="modal-footer mt-4 pos-rlt">
//               <button
//                 className="common-button transparent-bg"
//                 onClick={() => handleSubmit(formStep - 1)}
//               >
//                 Previous
//               </button>
//               <button
//                 className="common-button"
//                 style={{ cursor: isSubmitButtonActive ? 'pointer' : 'default' }}
//                 onClick={() =>
//                   isSubmitButtonActive && handleSubmit(formStep + 1)
//                 }
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
//             className="d-flex"
//             style={{
//               alignItems: 'center',
//               justifyContent: 'center',
//               flex: 1,
//               flexBasis: 'auto',
//             }}
//           >
//             <div className={'modal-body animate-fadeIn'}>
//               <div>
//                 <h3 align="center" className="modal-sub-title">
//                   Review Details
//                 </h3>

//                 <h3 className="modal-sub-title-item mb-3">Buyer's Link</h3>
//                 <div className="d-flex justify-content-between align-items-center buyers-link-wrapper">
//                   {h.notEmpty(permalinkURL) && (
//                     <div className="buyers-link">{permalinkURL}</div>
//                   )}
//                   <div
//                     className="d-flex align-items-center justify-content-center"
//                     style={{ gap: '2em' }}
//                   >
//                     <div>
//                       {document.queryCommandSupported('copy') && (
//                         <div
//                           className="ml-4 mt-4 mb-4"
//                           onClick={(e) => {
//                             copyToClipBoard({ permalinkURL }, e);
//                           }}
//                           style={{ cursor: 'pointer' }}
//                         >
//                           <CommonTooltip tooltipText="Copy Link">
//                             <div className="d-flex justify-content-center">
//                               <IconFileVector width="24" height="24" />
//                             </div>
//                           </CommonTooltip>
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <CommonTooltip tooltipText="Preview Proposal">
//                         <div>
//                           <a
//                             className={'link-primary dark-link'}
//                             href={previewURL}
//                             target="_blank"
//                           >
//                             <IconEyeVector width="24" height="24" />
//                           </a>{' '}
//                         </div>
//                       </CommonTooltip>
//                     </div>
//                   </div>
//                 </div>

//                 <h3 className="modal-sub-title-item mt-5 mb-3">
//                   Email Preferences
//                 </h3>
//                 <div className="modal-input-group  buyers-link-email-wrapper">
//                   <label className="cb-container">
//                     Send emails to buyer
//                     <input
//                       type={'checkbox'}
//                       style={{ marginLeft: '10px' }}
//                       defaultChecked={contactEmailPreference}
//                       onChange={(e) =>
//                         setContactEmailPreference(e.target.checked)
//                       }
//                     />
//                     <span class="checkmark"></span>
//                   </label>
//                   <label className="cb-container">
//                     Send emails to you
//                     <input
//                       type={'checkbox'}
//                       style={{ marginLeft: '10px' }}
//                       defaultChecked={agentEmailPreference}
//                       onChange={(e) =>
//                         setAgentEmailPreference(e.target.checked)
//                       }
//                     />
//                     <span class="checkmark"></span>
//                   </label>
//                 </div>
//                 <h3 className="modal-sub-title-item mt-5 mb-3">
//                   The email that will be sent to the buyer
//                 </h3>

//                 <div className="buyers-link-email">
//                   <div className="buyers-link-email-subject">
//                     <h5>Subject: </h5>

//                     <ContentEditable
//                       html={inviteEmailSubject}
//                       disabled={!emailIntegrationStatus}
//                       onChange={(e) => setInviteEmailSubject(e.target.value)}
//                     />
//                   </div>
//                   <div className="buyers-link-email-subject">
//                     <h5>Body: </h5>

//                     {emailIntegrationStatus ? (
//                       <CommonTextAreaEditor
//                         placeholder=""
//                         message={inviteEmailBody}
//                         setMessage={(e) => setInviteEmailBody(e)}
//                         showEditor={false}
//                         height={400}
//                       />
//                     ) : (
//                       <ContentEditable
//                         html={inviteEmailBody}
//                         disabled={true}
//                         onChange={(e) => setInviteEmailBody(e.target.value)}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="common-button transparent-bg"
//                   onClick={() => handleSubmit(formStep - 1)}
//                 >
//                   Previous
//                 </button>
//                 <button
//                   className="common-button"
//                   style={{
//                     cursor: isSubmitButtonActive ? 'pointer' : 'default',
//                   }}
//                   onClick={() => isSubmitButtonActive && handleSubmit(formStep)}
//                 >
//                   Save & Finish
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
