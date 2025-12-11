import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import Image from 'next/image';

import React, { useEffect, useState, useRef } from 'react';
import constant from '../constants/constant.json';
import { config } from '../configs/config';
import { notEmpty } from '../helpers/general';
import { useRouter } from 'next/router';
import { h } from '../helpers';
import { api } from '../api';

// COMPONENTS
import { Header, Body } from '../components/Layouts/Layout';
import ShortlistedProjectCard from '../components/Property/ShortlistedProjectCard';
import CommonEmptyState from '../components/Common/CommonEmptyState';
import CommonLoading from '../components/Common/CommonLoading/CommonLoading';
import LoadingShortlistedProject from '../components/Property/ShortlistedProperty/LoadingShortlistedProject';
import Navigation from '../components/Property/TableNavigation/Navigation';
import ProposalHeader from '../components/Property/ProposalHeader';
import ProposalFooter from '../components/Property/ProposalFooter';

// Pages
import Colliers from './proposal/Colliers';
import InvestOGPS from './proposal/InvestOGPS';
import InvestOGPS_STH_ENG from './proposal/InvestOGPSSthEng';
import InvestOGPS_STH_CHN from './proposal/InvestOGPSSthChn';
import InvestOGPSPersimmonEng from './proposal/InvestOGPSPersimmonEng';
import InvestOGPSPersimmonChn from './proposal/InvestOGPSPersimmonChn';
import InvestOGPSFultonFifth from './proposal/InvestOGPSFultonFifth';
import InvestOGPSBurmingham from './proposal/InvestOGPSBurmingham';
import InvestOGPSParkAvenue from './proposal/InvestOGPSParkAvenue';
import InvestOGPSParkAvenueENG from './proposal/InvestOGPSParkAvenueENG';
import InvestOGPSParkAvenueCHN from './proposal/InvestOGPSParkAvenueCHN';
import InvestOGPSFloret from './proposal/InvestOGPSFloret';
import InvestOGPSExpat from './proposal/InvestOGPSExpat';
import InvestOGPSManchester from './proposal/InvestOGPSManchester';
import InvestOGPSMQDC from './proposal/InvestOGPSMQDC';
import InvestOGPSMelbourneTownhouse from './proposal/InvestOGPSMelbourneTownhouse';
import InvestOGPSWembley from './proposal/InvestOGPSWembley';
import InvestOGPSHendonWaterSideLondon from './proposal/InvestOGPSHendonWaterSideLondon';
import InvestOGPSHendonWaterSideLondonMY from './proposal/InvestOGPSHendonWaterSideLondonMY';
import InvestOGPSParkQuarter from './proposal/InvestOGPSParkQuarter';
import InvestOGPSBarrattPersonal from './proposal/InvestOGPSBarrattPersonal';
import InvestOGPSBarrattInvited from './proposal/InvestOGPSBarrattInvited';
import InvestOGPSBarrattMY from './proposal/InvestOGPSBarrattMY';
import InvestOGPSPeninsulaGardens from './proposal/InvestOGPSPeninsulaGardens';
import InvestOGPSVisionPoint from './proposal/InvestOGPSVisionPoint';
import InvestOGPSTraffordGardens from './proposal/InvestOGPSTraffordGardens';
import InvestOGPSEastmanVillageENG from './proposal/InvestOGPSEastmanVillageENG';
import InvestOGPSEastmanVillageMY from './proposal/InvestOGPSEastmanVillageMY';
import InvestOGPSPerth from './proposal/InvestOGPSPerth';
import Raeon from './proposal/Raeon';
import StrengthCulture from './proposal/StrengthCulture';
import BreathePilates from './proposal/BreathePilates';
import BreathePilatesClassesPrices from './proposal/BreathePilatesClassesPrices';
import BreathePilatesProspects from './proposal/BreathePilatesProspects';
import BreathePilatesReEngagement from './proposal/BreathePilatesReEngagement';
import JElliot from './proposal/JElliot';
import HybridHK from './proposal/HybridHK';
import HybridGroup from './proposal/HybridGroup';
import HKore from './proposal/HKore';
import LucidVue from './proposal/LucidVue';
import F45PunggolPlaza from './proposal/F45PunggolPlaza';

const queryClient = new QueryClient();

const imageUrl = 'https://cdn.yourpave.com/assets/buyer-page-empty.png';
const invalidText = 'This Web Link is not correct or no longer active';

let timeSpent = 0;
let globalContactActivityId = '';
let globalPermalink = '';

setInterval(() => {
  timeSpent += 1;
}, 1000);

export default function Permalink({
  url,
  agencyName,
  metaImage,
  title,
  description,
  favicon,
}) {
  const router = useRouter();
  const projectRef = useRef();
  const propertyRef = useRef();

  const [permalink, setPermalink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loaderColor, setLoaderColor] = useState('#08443d');
  const [contact, setContact] = useState();
  const [shortlistedProjects, setShortlistedProjects] = useState([]);
  const [shortlistedProperties, setShortlistedProperties] = useState([]);

  const [agencyUser, setAgencyUser] = useState({});
  const [emptyState, setEmptyState] = useState(false);
  const [shouldTrackActivity, setShouldTrackActivity] = useState(true);
  const [linkOpenedActivityId, setLinkOpenedActivityId] = useState();
  const [onScreenTime, setOnScreenTime] = useState(0);
  const [settingsData, setSettingsData] = useState([]);
  const [selectedShortlistedProject, setSelectedShortlistedProject] =
    useState(null);
  const [projectData, setProjectData] = useState(null);

  const headerRef = useRef(null);
  const [customStyle, setCustomStyle] = useState(null);
  const [translate, setTranslation] = useState(
    require('../constants/locale/en.json'),
  );
  const [shorlistedProjectsLoading, setShortlistedProjectsLoading] =
    useState(true);

  const [proposalProject, setProposalProject] = useState([]);
  const [proposalProperties, setProposalProperties] = useState([]);
  const [agencyPage, setAgencyPage] = useState('');
  const [customPageData, setCustomPageData] = useState(null);
  const [trackOtherPage, setTrackOtherPage] = useState({
    track: null,
    timer: null,
    meta: {
      contact_fk: '',
      activity_type: '',
      activity_meta: null,
    },
  });

  const [pageTrack, setPageTrack] = useState({
    timeElapsed: 0,
    idleTimer: 0,
    totalTime: 0,
    intervalSeconds: 0,
  });

  const pageTimeTracker = (intSec) => {
    const pTrack = {
      timeElapsed: 0,
      idleTimer: 0,
      totalTime: 0,
      intervalSeconds: intSec,
    };

    window.addEventListener('mousemove', () => {
      pTrack.idleTimer = 0;
    });

    window.addEventListener('keypress', () => {
      pTrack.idleTimer = 0;
    });

    setPageTrack(pTrack);
  };

  useEffect(() => {
    if (trackOtherPage.track === false) {
      (async () => {
        await api.contactActivity.create(trackOtherPage.meta, false);
        setTrackOtherPage((p) => ({ ...p, timer: null, track: null }));
      })();
    }
  }, [trackOtherPage]);

  const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

  useInterval(() => {
    const pTrack = pageTrack;
    pTrack.idleTimer += 1;
    if (agencyName !== 'default') {
      if (
        document.activeElement == document.getElementsByTagName('iframe')[0]
      ) {
        const timer = trackOtherPage.timer + 1;
        setTrackOtherPage({
          track: true,
          timer,
          meta: {
            contact_fk: contact?.contact_id,
            activity_type: constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_PLAY_VIDEO,
            activity_meta: JSON.stringify({
              video_url: 'https://www.youtube.com/embed/DWkT1Rch1io',
              on_screen_duration: timer,
              shortlisted_project_id:
                selectedShortlistedProject?.project?.shortlisted_project_id,
              agency_fk: agencyUser?.agency?.agency_id,
              project_fk: selectedShortlistedProject?.project?.project_fk,
            }),
          },
        });
      } else if (
        document.activeElement == document.getElementsByTagName('iframe')[1]
      ) {
        const timer = trackOtherPage.timer + 1;
        setTrackOtherPage({
          track: true,
          timer,
          meta: {
            contact_fk: contact?.contact_id,
            activity_type: constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_PLAY_3D,
            activity_meta: JSON.stringify({
              iframe_url: 'https://new.8prop.com/zh-CHT/mod/dcxMMjGNasL',
              on_screen_duration: timer,
              shortlisted_project_id:
                selectedShortlistedProject?.project?.shortlisted_project_id,
              agency_fk: agencyUser?.agency?.agency_id,
              project_fk: selectedShortlistedProject?.project?.project_fk,
            }),
          },
        });
      } else {
        if (trackOtherPage.timer !== null) {
          setTrackOtherPage((p) => ({ ...p, track: false }));
        }
      }
    }
    if (
      document.hasFocus() &&
      pTrack.idleTimer <=
        constant.CONTACT.ACTIVITY.TRACK_ON_SCREEN.IDLE_THRESHOLD
    )
      pTrack.timeElapsed += 1;
    if (pTrack.timeElapsed >= pTrack.intervalSeconds) {
      pTrack.totalTime += pTrack.timeElapsed;
      console.log('onscreenupdated');
      setOnScreenTime(pTrack.totalTime);
      pTrack.timeElapsed -= pTrack.intervalSeconds;

      setPageTrack(pTrack);
    }
  }, 1000);

  useEffect(() => {
    const trackParam = h.general.findGetParameter('should_track_activity');
    if (h.notEmpty(trackParam)) setShouldTrackActivity(trackParam !== 'false');
    pageTimeTracker(10);
  }, []);

  const sortProjects = (projects) => {
    return projects.sort((a, b) => a.display_order - b.display_order);
  };

  function setTranslationFunc(agentId) {
    switch (agentId) {
      case '1da3ff5f-d3fc-11eb-8182-065264a181d4':
      case '3d1d056d-0a26-4274-bb9b-5b9e1b3e3b70':
        setTranslation(require('../constants/locale/ch.json'));
        break;
      default:
        setTranslation(require('../constants/locale/en.json'));
        break;
    }
  }

  const reloadShortlistedProjects = async () => {
    const project_id = selectedShortlistedProject?.project?.project_fk;
    if (project_id) {
      const projectIndex = proposalProject.findIndex(
        (i) => i.project_fk === project_id,
      );
      await queryClient.cancelQueries([`tableList`]);

      const tableListRes = await queryClient.fetchQuery(['tableList'], () =>
        api.contact.getShortlistedTableList(
          {
            permalink,
          },
          false,
        ),
      );

      if (h.cmpStr(tableListRes.status, 'ok') && tableListRes.data) {
        const oldIndex = tableListRes.data?.shortlisted_projects.findIndex(
          (i) => i.project_fk === project_id,
        );

        const getProperties = tableListRes.data?.shotlisted_properties.filter(
          (i) => i.project_property.project_fk === project_id,
        );
        const updateProposalProperties = proposalProperties;
        for (let i = 0; i < getProperties.length; i++) {
          const propIndex = proposalProperties.findIndex(
            (f) =>
              f.shortlisted_property_id ===
              getProperties[i].shortlisted_property_id,
          );

          if (propIndex !== -1) {
            updateProposalProperties[propIndex] = getProperties[i];
          }
        }

        const updateProposalProject = proposalProject;
        updateProposalProject[projectIndex] =
          tableListRes.data.shortlisted_projects[oldIndex];

        // Update shortlisted projects
        setProposalProject(updateProposalProject);

        // Update shortlisted properties
        setProposalProperties(updateProposalProperties);

        setSelectedShortlistedProject({
          project: tableListRes.data.shortlisted_projects[oldIndex],
          index: projectIndex,
        });
      }
    }
  };

  useEffect(() => {
    // GET AGENCY
    handleGetAgencyUser(router.query);

    // GET SHORLISTED PROJECT TABLE LIST
    handleGetShortlistedTableList(router.query);

    // GET CSRF Token
    api.auth.getCsrfToken();
  }, [router.query]);

  /**
   * Get all property data
   * Background process
   */
  useEffect(() => {
    if (proposalProperties.length > 0) {
      (async () => {
        await updateShorlitedProperties();
      })();
    }
  }, [proposalProperties]);

  const updateShorlitedProperties = async () => {
    const propertyArr = [];
    for (let i = 0; i < proposalProperties.length; i++) {
      const propertyDate = await getPropertiesById(
        proposalProperties[i]?.project_property?.project_property_id,
      );
      propertyArr.push(propertyDate);
    }

    setShortlistedProperties(propertyArr);
  };

  /**
   * Get Agency User
   */
  const handleGetAgencyUser = async (query) => {
    let { permalink: inPermalink, should_track_activity, demo_theme } = query;

    if (h.notEmpty(inPermalink)) {
      inPermalink = inPermalink.split('-').pop();
    }

    const agencyUserRes = await queryClient.fetchQuery(['agencyUser'], () =>
      api.contact.getAgencyUser(
        {
          permalink: inPermalink,
        },
        false,
      ),
    );

    // const queryaa = queryCache.find({ queryKey: ['agencyUser'] })
    // console.log(queryaa)

    if (h.cmpStr(agencyUserRes.status, 'ok') && agencyUserRes.data) {
      setAgencyUser(agencyUserRes.data.agency_user);
      setContact(agencyUserRes.data.contact);

      // color scheme for clients
      if (h.notEmpty(demo_theme)) {
        setCustomStyle(h.theme.getThemeByName(demo_theme));
      } else {
        setCustomStyle(
          h.theme.getJSON(agencyUserRes.data?.agency_user?.agency_fk),
        );
      }

      setTranslationFunc(agencyUserRes.data?.agency_user?.agency_fk);

      setPermalink(inPermalink);
      globalPermalink = inPermalink;
      // Set Agency Name - for static page
      if (
        agencyUserRes?.data?.contact?.permalink_template.startsWith('custom-')
      ) {
        const apiResLandingPage = await api.agencyCustomLandingPage.getBySlug(
          {
            slug: agencyUserRes?.data?.contact?.permalink_template,
          },
          false,
        );
        if (h.cmpStr(apiResLandingPage.status, 'ok')) {
          if (apiResLandingPage.data?.custom_landing_pages?.landing_page_info) {
            setCustomPageData(
              apiResLandingPage.data?.custom_landing_pages?.landing_page_info,
            );
          }
        }
      } else {
        switch (agencyUserRes?.data?.contact?.permalink_template) {
          case 'colliers': //Colliers
            setAgencyPage('colliers');
            break;
          case 'ogps': // Invest OGPS
            setAgencyPage('investogps');
            break;
          case 'ogps_sth_eng': // Invest OGPS STH ENG
            setAgencyPage('investogps_sth_eng');
            break;
          case 'ogps_sth_chn': // Invest OGPS STH CHN
            setAgencyPage('investogps_sth_chn');
            break;
          case 'ogps_persimmon_eng': // Invest OGPS Persimmon ENG
            setAgencyPage('ogps_persimmon_eng');
            break;
          case 'ogps_persimmon_chn': // Invest OGPS Persimmon CHN
            setAgencyPage('ogps_persimmon_chn');
            break;
          case 'ogps_fulton_fifth': // Invest OGPS Fulton Fifth
            setAgencyPage('ogps_fulton_fifth');
            break;
          case 'ogps_floret': // Invest OGPS Floret
            setAgencyPage('ogps_floret');
            break;
          case 'ogps_burmingham': // Invest OGPS Burmingham
            setAgencyPage('ogps_burmingham');
            break;
          case 'ogps_barratt_personal': // Invest OGPS Barret personal
            setAgencyPage('ogps_barratt_personal');
            break;
          case 'ogps_barratt_invited': // Invest OGPS park invited
            setAgencyPage('ogps_barratt_invited');
            break;
          case 'ogps_barratt_my': // Invest OGPS barratt MY
            setAgencyPage('ogps_barratt_my');
            break;
          case 'ogps_expat': // Invest OGPS Expat
            setAgencyPage('ogps_expat');
            break;
          case 'ogps_manchester': // Invest OGPS Manchester
            setAgencyPage('ogps_manchester');
            break;
          case 'ogps_mqdc': // Invest OGPS MQDC
            setAgencyPage('ogps_mqdc');
            break;
          case 'ogps_park_avenue': // Invest OGPS Park Avenue
            setAgencyPage('ogps_park_avenue');
            break;
          case 'ogps_park_avenue_hk_eng': // Invest OGPS Park Avenue ENG
            setAgencyPage('ogps_park_avenue_hk_eng');
            break;
          case 'ogps_pen_gardens': // Invest OGPS Peninsula Gardens
            setAgencyPage('ogps_pen_gardens');
            break;
          case 'ogps_park_avenue_hk_chn': // Invest OGPS Park Avenue CHN
            setAgencyPage('ogps_park_avenue_hk_chn');
            break;
          case 'ogps_wembley': // Invest OGPS Wembley
            setAgencyPage('ogps_wembley');
            break;
          case 'ogps_hendon': // Invest OGPS Hendon WaterSide london
            setAgencyPage('ogps_hendon');
            break;
          case 'ogps_hendon_my': // Invest OGPS Hendon WaterSide london my
            setAgencyPage('ogps_hendon_my');
            break;
          case 'ogps_park_quarter': // Invest OGPS Park Quarter
            setAgencyPage('ogps_park_quarter');
            break;
          case 'ogps_eastman_village': // Invest OGPS Eastman Village
            setAgencyPage('ogps_eastman_village');
            break;
          case 'ogps_eastman_village_my': // Invest OGPS Eastman Village
            setAgencyPage('ogps_eastman_village_my');
            break;
          case 'ogps_vision_point': // Invest OGPS Vision Point
            setAgencyPage('ogps_vision_point');
            break;
          case 'ogps_trafford_gardens': // Invest OGPS Trafford Gardens
            setAgencyPage('ogps_trafford_gardens');
            break;
          case 'ogps_melbourne_townhouse': // Invest OGPS Melbourne Townhouse
            setAgencyPage('ogps_melbourne_townhouse');
            break;
          case 'ogps_perth': // Invest OGPS Perth
            setAgencyPage('ogps_perth');
            break;
          case 'breathe_pilates': // Breathe Pilates
            setAgencyPage('breathe_pilates');
            break;
          case 'breathe_pilates_classes_prices': // Breathe Pilates Classes Prices
            setAgencyPage('breathe_pilates_classes_prices');
            break;
          case 'breathe_pilates_prospects': // Breathe Pilates Prospects
            setAgencyPage('breathe_pilates_prospects');
            break;
          case 'breathe_pilates_re_engagement': // Breathe Pilates Re-Engagement
            setAgencyPage('breathe_pilates_re_engagement');
            break;
          case 'raeon': // Raeon
            setAgencyPage('raeon');
            setCustomStyle(
              h.theme.getJSON('1da3ff5f-d3fc-11eb-8182-065264a181d4'),
            );
            break;
          case 'strculture':
            setLoaderColor('#fff');
            setAgencyPage('strculture');
            break;
          case 'hybrid_hk': // Hybrid HK
            setAgencyPage('hybrid_hk');
            break;
          case 'hybrid_gym_group': // Hybrid Gym Group
            setAgencyPage('hybrid_gym_group');
            break;
          case 'h_kore': // H Kore
            setAgencyPage('h_kore');
            break;
          case 'lucid_vue': // Lucid Vue
            setAgencyPage('lucid_vue');
            break;
          case 'f45_punggol': // F45 Punggol Plaza
            setAgencyPage('f45_punggol');
            break;
          case 'j_elliot': // JElliot
            setAgencyPage('j_elliot');
            break;
          default:
            setAgencyPage('default');
            break;
        }
      }
      if (shouldTrackActivity && h.notEmpty(agencyUserRes.data?.contact)) {
        // Tag contact proposal as opened - RUNS IN BACKGROUND TO AVOID EXTRA LOADING TIME AND DON'T BLOCK THE PAGE LOAD
        api.contact.setOpenByContact({ permalink: inPermalink }, false);

        //Create activity tracker
        handleTracker(agencyUserRes.data?.contact?.contact_id, inPermalink);
      }

      if (!h.notEmpty(agencyUserRes.data?.agency_user)) {
        setEmptyState(true);
      }
    }
  };

  /**
   * Get Shortlisted table list
   */
  const handleGetShortlistedTableList = async (query) => {
    let { permalink: inPermalink } = query;

    if (h.notEmpty(inPermalink)) {
      inPermalink = inPermalink.split('-').pop();
    }

    const tableListRes = await queryClient.fetchQuery(['tableList'], () =>
      api.contact.getShortlistedTableList(
        {
          permalink: inPermalink,
        },
        false,
      ),
    );

    if (h.cmpStr(tableListRes.status, 'ok') && tableListRes.data) {
      if (
        tableListRes.data &&
        tableListRes.data?.shortlisted_projects?.length > 0
      ) {
        const orderedProjects = tableListRes.data.shortlisted_projects.sort(
          (a, b) => a.display_order - b.display_order,
        );

        // Initiate first project
        setSelectedShortlistedProject({
          project: orderedProjects[0],
          index: 0,
        });

        // Put table navigation data
        setProposalProject(orderedProjects);
        setProposalProperties(tableListRes.data.shotlisted_properties);

        // Get first project
        getProjectById(orderedProjects[0]?.project_fk);

        setShortlistedProjectsLoading(false);
      }
    }
  };

  /**
   * Get project by ID
   */
  const getProjectById = async (project_id) => {
    const projectApiRes = await queryClient.fetchQuery(
      [`project-${project_id}`],
      () => api.project.findOne({ project_id }, false),
    );

    if (
      h.cmpStr(projectApiRes.status, 'ok') &&
      h.notEmpty(projectApiRes.data) &&
      h.notEmpty(projectApiRes.data.project)
    ) {
      setShortlistedProjects((prev) => [...prev, projectApiRes.data.project]);
      if (!projectData) {
        setProjectData(projectApiRes.data.project);
      }

      return projectApiRes.data.project;
    }

    return null;
  };

  const getPropertiesById = async (project_property_id) => {
    // console.log(proposalProperties);

    const projectPropertiesApi = await queryClient.fetchQuery(
      ['projectProperty'],
      () => api.project.getProperties({ project_property_id }, false),
    );

    if (
      h.cmpStr(projectPropertiesApi.status, 'ok') &&
      h.notEmpty(projectPropertiesApi.data)
    ) {
      return projectPropertiesApi.data.project_property;
    }

    return null;
  };

  const handleTracker = async (contactId, permalink) => {
    let metaData = {
      permalink: permalink,
    };

    if (shouldTrackActivity) {
      const contactActivityId = await api.contactActivity.create(
        {
          contact_fk: contactId,
          activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
          activity_meta: JSON.stringify(metaData),
        },
        false,
      );
      setLinkOpenedActivityId(contactActivityId.data.contact_activity_id);
      globalContactActivityId = contactActivityId.data.contact_activity_id;
    }
  };

  return (
    <div
      style={{
        ...(customStyle ? { background: customStyle?.background } : {}),
      }}
    >
      <Header
        title={title}
        titlePaveEnding={false}
        showHeaderContent={false}
        imageOg={metaImage}
        imageTwitter={metaImage}
        description={description ?? `Made by Pave for ${agencyName}`}
        url={url}
        favicon={favicon}
      />

      <Body isLoading={isLoading} loaderColor={loaderColor}>
        {/* <CommonLoading isAnimating={!loaded} key={'progress-bar'} /> */}

        {agencyPage === 'default' && (
          <>
            {h.notEmpty(agencyUser) && customStyle && (
              <div ref={headerRef}>
                <div style={customStyle.topLogoWrapper}>
                  <div className="container py-3">
                    <div className="mx-2 mx-sm-0">
                      <div className="d-flex justify-content-center">
                        {h.notEmpty(agencyUser?.agency?.agency_logo_url) ? (
                          <Image
                            src={agencyUser?.agency?.agency_logo_url ?? ''}
                            alt="Pave"
                            objectFit={'contain'}
                            width={300}
                            height={100}
                          />
                        ) : (
                          <span
                            className="rounded-circle comment-profile-picture profile-picture"
                            style={{
                              cursor: 'default',
                              width: '150px',
                              height: '150px',
                              fontSize: '30px',
                            }}
                          >
                            {h.user.getNameInitials(
                              agencyUser?.agency?.agency_name,
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proposal agent header */}
                <ProposalHeader
                  agencyUser={agencyUser}
                  customStyle={customStyle}
                  translate={translate}
                  permalink={permalink}
                  contact={contact}
                />

                {/* Table navigation */}
                {h.notEmpty(proposalProject) && (
                  <Navigation
                    selectedShortlistedProject={selectedShortlistedProject}
                    proposalProject={proposalProject}
                    contact={contact}
                    shouldTrackActivity={shouldTrackActivity}
                    setSelectedShortlistedProject={
                      setSelectedShortlistedProject
                    }
                    proposalProperties={proposalProperties}
                    elementRef={{ projectRef, propertyRef }}
                    customStyle={customStyle}
                    translate={translate}
                    shortlistedProjects={shortlistedProjects}
                    getProjectById={getProjectById}
                    setProjectData={setProjectData}
                  />
                )}

                {/* Project Info */}
                {shorlistedProjectsLoading && <LoadingShortlistedProject />}
                {!shorlistedProjectsLoading &&
                  selectedShortlistedProject &&
                  projectData && (
                    <ShortlistedProjectCard
                      projectRef={projectRef}
                      propertyRef={propertyRef}
                      key={selectedShortlistedProject.index}
                      contact={contact}
                      shortlistedProject={selectedShortlistedProject.project}
                      shortlistedProperties={shortlistedProperties}
                      proposalProperties={proposalProperties}
                      project={projectData}
                      setLoading={setIsLoading}
                      shouldTrackActivity={shouldTrackActivity}
                      reloadShortlistedProjects={reloadShortlistedProjects}
                      settingsData={settingsData}
                      setSettingsData={setSettingsData}
                      customStyle={customStyle}
                      translate={translate}
                    />
                  )}
              </div>
            )}

            {/* Proposal Footer */}
            {h.notEmpty(agencyUser) && customStyle && (
              <ProposalFooter
                agencyUser={agencyUser}
                customStyle={customStyle}
                translate={translate}
                headerRef={headerRef}
              />
            )}
          </>
        )}

        {agencyPage === 'colliers' && (
          <Colliers
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            shouldTrackActivity={shouldTrackActivity}
          />
        )}

        {agencyPage === 'investogps' && (
          <InvestOGPS
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
          />
        )}

        {agencyPage === 'ogps_persimmon_eng' && (
          <InvestOGPSPersimmonEng
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
          />
        )}

        {agencyPage === 'ogps_persimmon_chn' && (
          <InvestOGPSPersimmonChn
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
          />
        )}

        {agencyPage === 'ogps_fulton_fifth' && (
          <InvestOGPSFultonFifth
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
          />
        )}

        {agencyPage === 'ogps_floret' && (
          <InvestOGPSFloret
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
          />
        )}

        {agencyPage === 'investogps_sth_eng' && (
          <InvestOGPS_STH_ENG
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'investogps_sth_chn' && (
          <InvestOGPS_STH_CHN
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'raeon' && (
          <Raeon
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'strculture' && (
          <StrengthCulture
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'breathe_pilates' && (
          <BreathePilates
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'breathe_pilates_classes_prices' && (
          <BreathePilatesClassesPrices
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'breathe_pilates_prospects' && (
          <BreathePilatesProspects
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'breathe_pilates_re_engagement' && (
          <BreathePilatesReEngagement
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'hybrid_hk' && (
          <HybridHK
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'hybrid_gym_group' && (
          <HybridGroup
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'h_kore' && (
          <HKore
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'lucid_vue' && (
          <LucidVue
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_burmingham' && (
          <InvestOGPSBurmingham
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'f45_punggol' && (
          <F45PunggolPlaza
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_expat' && (
          <InvestOGPSExpat
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_manchester' && (
          <InvestOGPSManchester
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_mqdc' && (
          <InvestOGPSMQDC
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_park_avenue' && (
          <InvestOGPSParkAvenue
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_park_avenue_hk_eng' && (
          <InvestOGPSParkAvenueENG
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_park_avenue_hk_chn' && (
          <InvestOGPSParkAvenueCHN
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_wembley' && (
          <InvestOGPSWembley
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_hendon' && (
          <InvestOGPSHendonWaterSideLondon
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_hendon_my' && (
          <InvestOGPSHendonWaterSideLondonMY
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_park_quarter' && (
          <InvestOGPSParkQuarter
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_barratt_personal' && (
          <InvestOGPSBarrattPersonal
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_barratt_invited' && (
          <InvestOGPSBarrattInvited
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_barratt_my' && (
          <InvestOGPSBarrattMY
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_eastman_village' && (
          <InvestOGPSEastmanVillageENG
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_eastman_village_my' && (
          <InvestOGPSEastmanVillageMY
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_pen_gardens' && (
          <InvestOGPSPeninsulaGardens
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_melbourne_townhouse' && (
          <InvestOGPSMelbourneTownhouse
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_vision_point' && (
          <InvestOGPSVisionPoint
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_perth' && (
          <InvestOGPSPerth
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'ogps_trafford_gardens' && (
          <InvestOGPSTraffordGardens
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {agencyPage === 'j_elliot' && (
          <JElliot
            agencyUser={agencyUser}
            shortlistedProject={selectedShortlistedProject?.project}
            translate={translate}
            setLoading={setIsLoading}
            contact={contact}
            reloadShortlistedProjects={reloadShortlistedProjects}
            shouldTrackActivity={shouldTrackActivity}
            customStyle={customStyle}
            project={projectData}
          />
        )}

        {customPageData && (
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: customPageData?.landing_page_html,
              }}
            ></div>
            <style>{customPageData?.landing_page_css}</style>
          </>
        )}

        {h.cmpBool(emptyState, true) && (
          <div>
            <CommonEmptyState imageUrl={imageUrl} invalidText={invalidText} />
          </div>
        )}
      </Body>
    </div>
  );
}

const getEnvConfig = (host) => {
  // development environment
  if (
    host.indexOf('localhost') > -1 ||
    process.env.NEXT_PUBLIC_APP_ENV === 'development'
  ) {
    return {
      apiUrl: `http://localhost:3110`,
      baseUrl: `http://localhost:3111`,
      imageBaseUrl: `https://cdn-staging.yourpave.com`,
    };
  }
  // staging environment
  else if (
    host.indexOf('app-staging.yourpave.com') > -1 ||
    process.env.NEXT_PUBLIC_APP_ENV === 'staging'
  ) {
    return {
      apiUrl: `https://api-staging.yourpave.com`,
      baseUrl: `https://app-staging.yourpave.com`,
      imageBaseUrl: `https://cdn-staging.yourpave.com`,
    };
  }
  // qa environment
  else if (
    host.indexOf('app-qa.yourpave.com') > -1 ||
    process.env.NEXT_PUBLIC_APP_ENV === 'qa'
  ) {
    return {
      apiUrl: `https://api-qa.yourpave.com`,
      baseUrl: `https://app-qa.yourpave.com`,
      imageBaseUrl: `https://cdn-qa.yourpave.com`,
    };
  }
  // production environment
  else {
    return {
      apiUrl: `https://api.chaaat.io`,
      baseUrl: `https://${host}`,
      imageBaseUrl: `https://cdn.yourpave.com`,
    };
  }
};
const fetchMeta = async ({ req, params }) => {
  let inPermalink = '';
  let logo_url = '';
  let title = '';
  let description = null;
  let agencyName = '';
  let favicon =
    'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/favicon-32x32-kH8gKq9n.png';

  const { apiUrl, baseUrl, imageBaseUrl } = getEnvConfig(req.headers.host);

  if (h.notEmpty(params.permalink)) {
    inPermalink = params.permalink.split('-').pop();

    const response = await fetch(`${apiUrl}/v2/contact/${inPermalink}/agency`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Origin: baseUrl,
      },
    }).then((response) => response.json());

    if (response && h.cmpStr(response.status, 'ok')) {
      agencyName = response?.agency?.agency_name ?? '';
      const buyerName = h.user.formatFullName(response?.contact);

      title = h.notEmpty(buyerName)
        ? `Real Estate Proposal for ${buyerName}`
        : `Pave - Share & Track Project Information with Prospects`;

      if (response?.contact?.permalink_template.startsWith('custom-')) {
        title =
          response?.contact?.agency_custom_landing_page?.landing_page_info
            ?.meta_title ?? '';
        description =
          response?.contact?.agency_custom_landing_page?.landing_page_info
            ?.meta_description ?? '';
        logo_url =
          response?.contact?.agency_custom_landing_page?.landing_page_info
            ?.meta_image ??
          response?.agency?.agency_logo_whitebg_url ??
          response?.agency?.agency_logo_url ??
          '';
      } else {
        switch (response?.contact?.permalink_template) {
          case 'j_elliot':
            title = `J.Elliot Spring Summer 24 & Stockist Supercharge Program`;
            description = `Boost your sales with our Spring Summer 24 Collection and exclusive Stockist Supercharge Program for unmatched success.`;
            logo_url =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/jelliot/meta.jpg';
            favicon =
              'https://jelliot.com.au/cdn/shop/files/ezgif.com-webp-to-png_32x32.png?v=1614304443';
            break;
          case 'f45_punggol':
            title = `F45 Training Punggol Plaza | Team Training | Sign Up Today`;
            description = `Looking for gyms in F45 Punggol Plaza? F45 Training Punggol Plaza has got your fitness needs covered with a range of cardio, resistance, and hybrid group workouts.`;
            logo_url = 'landing_pages/f45/meta.png';
            favicon =
              'https://cdn.f45training.com/f45training/uploads/2019/07/04080818/favicon.png';
            break;
          case 'lucid_vue':
            title = `Lucid Vue - 3D visualisation agency specialising in real estate`;
            description = `Fast and flexible 3D visualisations with no compromise. 3D tours, renders & animations delivered in half the time. Sell unbuilt property faster.`;
            logo_url = 'landing_pages/lucid/meta.png';
            favicon =
              'https://lucidvue.com/wp-content/uploads/2022/03/cropped-Untitled-design-13-192x192.png';
            break;
          case 'ogps_trafford_gardens':
            title = `First Release | Manchester | only 10% deposit | invest from £19,000`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_eastman_village':
            title = `Exceptional growth potential | Barratt London | New phase launch | Register now`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_perth':
            title = `AT238 Perth | Australia Property | New Launch`;
            description = `Nestled in the heart of Perth’s historical hub lies apartment living with the heirloom of style & sophistication. AT238 features large internal apartment areas, semi-enclosed balconies with bi-fold doors – extending the living area; bringing the outside in, & world class facilities including a private dining room, outdoor cinema, & roof top lounge overlooking the river & city!`;
            logo_url = 'landing_pages/ogps/perth_meta.png';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_eastman_village_my':
            title = `Exceptional growth potential | Barratt London | New phase launch | Register now`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_vision_point':
            title = `[HK] UK | London | Vision Point`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_pen_gardens':
            title = `Selling Fast! | Register Now | Latest Phase of Peninsula Gardens | London`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_barratt_personal':
            title = `Largest developer in the UK | Barratt London Collection | Register now`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_barratt_invited':
            title = `Largest developer in the UK | Barratt London Collection | Register now`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_barratt_my':
            title = `Largest developer in the UK | Barratt London Collection | Register now`;
            description = ``;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_melbourne_townhouse':
            title = `Melbourne Townhouse | Australia Property | New Launch`;
            description = `One Global Group proudly presents brand new-Melbourne townhouses in an established, leafy and family suburb located only 12km north of Melbourne CBD, surrounded by reservoirs, parklands, with direct bike rail to the city and nearby local village offering a wide selection of shopping, dining, bars and cafes.`;
            logo_url = 'landing_pages/ogps/melbourne-townhouse.jpeg';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_park_quarter':
            title = `Park Quarter | Australia Property | New Launch`;
            description = `New launch 1, 2 & 3 bedroom in Park Quarter developed by SIDG. An exemplar of striking architecture with unparalleled views to Albert Park lake and the CBD.`;
            logo_url = 'landing_pages/ogps/park_quarter_meta.jpeg';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_hendon':
            title = `Hendon Waterside - London`;
            description = `Covering over 30 acres and encompassing over 2,000 homes, Hendon Waterside is a unique lifestyle destination. As part of the multi-million pound regeneration of West Hendon, alongside neighbouring Brent Cross and Cricklewood the development provides an
            array of parks, leisure facilities and amenities.`;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_hendon_my':
            title = `Hendon Waterside - London`;
            description = `Covering over 30 acres and encompassing over 2,000 homes, Hendon Waterside is a unique lifestyle destination. As part of the multi-million pound regeneration of West Hendon, alongside neighbouring Brent Cross and Cricklewood the development provides an
            array of parks, leisure facilities and amenities.`;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_wembley':
            title = `Wembley Park Gardens - London`;
            description = `Wembley Park Gardens takes its place as the newest, brightest example of the area’s regeneration, with two recent barratt london developments in the area proving popular with residents and investors alike`;
            logo_url = null;
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_park_avenue':
          case 'ogps_park_avenue_hk_eng':
          case 'ogps_park_avenue_hk_chn':
            title = `Park Avenue Place - Deptford`;
            description = `Park Avenue Place, located in the London Borough of Lewisham, is Galliard Homes' latest project. Comprising 176 apartments, ranging from 1, 2 and 3 bedrooms`;
            logo_url = 'landing_pages/ogps/park_meta.jpeg';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_expat':
            title = `[OGExpat] | UK | Sutton Coldfield | EXCLUSIVE OPPORTUNITY Royal Sutton Coldfield`;
            description = ``;
            logo_url = 'landing_pages/ogps/expat_meta.png';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_mqdc':
            title = `Thonglor BKK Ultra-luxury residences| 1-minute to BTS`;
            description = ``;
            logo_url = '';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_manchester':
            title = `Manchester Collection exhibition`;
            description = ``;
            logo_url = '';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_burmingham':
            title = `Live, Work & Invest in Birmingham`;
            description = `In recent years, global brands like HSBC, Deutsche Bank, PWC ,Goldman Sachs and BBC among others have already relocated to this thriving city. More are set to follow in their footsteps. In addition, Birmingham is the top regional city for start-ups for the 6th year running. Based on present and future trends, one thing is clear: the property market in Birmingham is primed for a colossal surge.`;
            logo_url = 'landing_pages/ogps/burmingham_meta.png';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_floret':
            title = `Floret Melbourne | Australia Property | New Launch`;
            description = `New launch 3 and 4 bedroom townhouses in Glen Waverly, Melbourne, developed by Golden Age Group. Designed by award-winning architects Rothelowman and landscaped by the renowned Aspect Studios. Surrounded by more than 40 education facilities such as Monash University.`;
            logo_url = 'landing_pages/floret/floret_meta.jpeg';
            favicon =
              'https://invest.ogpsglobal.com/hubfs/Floret/GOLD0030_V06_EXT_TypeC_Row_LR.jpg';
            break;
          case 'ogps_fulton_fifth':
            title = `Fulton & Fifth - Wembley`;
            description = `Fulton & Fifth offers 1, 2, and 3-bedroom apartments. Each apartment provides effortless living and makes the most of the views across Wembley and the city of London.`;
            logo_url =
              'https://invest.ogpsglobal.com/hubfs/Hubspot%20Feature%20Images%20%281%29.png#keepProtocol';
            favicon =
              'https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Finvest.ogpsglobal.com%2Fhubfs%2FFulton%2520Fifth%2520_Wembley%2FWeb_4098_Fulton-and-Fifth_101_Aerial.jpg%23keepProtocol';
            break;
          case 'ogps_persimmon_chn':
            title = `Persimmon | 共同打造您的家。`;
            description = `从单身公寓到行政家庭住宅，我们为您提供了在英国各个理想地点的新住房大量选择，带来了奢华的体验。`;
            logo_url =
              'https://invest.ogpsglobal.com/hubfs/Hubspot%20Feature%20Images%20%281%29.png#keepProtocol';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'ogps_persimmon_eng':
            title = `Persimmon | Together, we make your home`;
            description = `From studio apartments to executive family homes, we provide the luxury of a vast choice of new homes in desirable locations throughout the UK.`;
            logo_url =
              'https://invest.ogpsglobal.com/hubfs/Hubspot%20Feature%20Images%20%281%29.png#keepProtocol';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'h_kore':
            title = `MegaKore | H-Kore`;
            description = `At H-Kore you can expect to Strengthen, Stretch and Sweat in every class. Our unique training methods ensure all your fitness needs are met and with over 150 classes to choose from weekly between our Central and Quarry Bay studios, staying fit and healthy has never been easier!`;
            logo_url =
              'https://h-kore.com/uploads/Banner/_1200x600_crop_center-center_none/banner1.jpg';
            favicon = 'https://h-kore.com/favicon/ms-icon-144x144.png';
            break;
          case 'hybrid_hk':
            title = `1:1 Customized Training with Hong Kong's Top Trainers`;
            description = `Guided by top personal trainers in our world-class facility in Hong Kong, you'll have absolutely everything you need to stay motivated, LOVE your training & achieve REAL, measurable results, once & for all!
              Get the best personal training in HongKong at Hybrid Gym!`;
            logo_url =
              'https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Fwww.hybridgymhk.com%2Fhosted%2Fimages%2F41%2Fd98b8f55fc4c5b97f0553598b2eb8b%2FDSC09635.jpg';
            favicon =
              'https://www.hybridgymhk.com/hosted/images/03/6d230cc78948a68bdc93d79ddaef1b/Hybrid-Artwork-for-Uniform-01.png';
            break;
          case 'hybrid_gym_group':
            title = `Hybrid Group Classes in Central | Hybrid MMA & Fitness Hong Kong`;
            description = `From MMA training to Strength & Performance, Hybrid has classes that benefit everybody. Click to learn more about which HYBRID class suits you best.`;
            logo_url =
              'https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Fjoin.thehybridgymgroup.com%2Fhubfs%2FDSC09552.jpeg%23keepProtocol';
            favicon =
              'https://www.hybridgymhk.com/hosted/images/03/6d230cc78948a68bdc93d79ddaef1b/Hybrid-Artwork-for-Uniform-01.png';
            break;
          case 'breathe_pilates_classes_prices':
          case 'breathe_pilates_prospects':
          case 'breathe_pilates_re_engagement':
            title =
              'Pilates Reformer Singapore | Gyrotonic Singapore | Pilates Reformer Singapore';
            description =
              'Find the best Pilates reformer classes in Singapore at Breathe Pilates and discover the importance of mindful movement at our elite Pilates studio.';
            logo_url =
              response?.agency?.agency_logo_whitebg_url ??
              response?.agency?.agency_logo_url ??
              '';
            favicon =
              'https://www.breathepilates.com.sg/wp-content/uploads/2017/05/favicon.png';
            break;
          case 'breathe_pilates':
            title =
              'Pilates Classes | Pilates Courses | Pilates Training Singapore';
            description =
              'Breathe Pilates is Singapore’s elite Pilates & GYROTONIC® studio, offering Pilates reformer & GYROTONIC® private/group classes & training courses.';
            logo_url =
              response?.agency?.agency_logo_whitebg_url ??
              response?.agency?.agency_logo_url ??
              '';
            favicon =
              'https://www.breathepilates.com.sg/wp-content/uploads/2017/05/favicon.png';
            break;
          case 'ogps':
            title =
              'Garden Towers East Perth | Australia Property | New Launch';
            description =
              'Located at Perth CBD by Finbar Group, near the new Edith Cowan University. Rental yield up to 6.23%, prices from A$435K. 50% Govt. stamp duty incentives';
            logo_url =
              response?.agency?.agency_logo_whitebg_url ??
              response?.agency?.agency_logo_url ??
              '';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/ogps-ico.png';
            break;
          case 'raeon':
            title = 'The Canopy | 買外國樓搵利安：Raeon International';
            description =
              'The Canopy位處South Melbourne，舉步即達電車站，輕鬆通往墨爾本市內各區，5分鐘即達Port Melbourne Beach，6分鐘到Crown Casino，10分鐘返回墨爾本CBD，12分鐘步行至著名的South Melbourne Market。';
            logo_url =
              response?.agency?.agency_logo_whitebg_url ??
              response?.agency?.agency_logo_url ??
              '';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/reaon-ico.png';
            break;
          case 'strculture':
            title = '6WK PT Program| Strength Culture | Hong Kong';
            description =
              'Our 6 Weeks PT Program fuses our Personal Training, Group Classes and Open Gym, providing you great value and results';
            logo_url = 'assets/str-culture-l.jpeg';
            favicon =
              'https://pave-prd.s3.ap-southeast-1.amazonaws.com/landing_pages/favicon/strculture.png';
            break;

          default:
            logo_url =
              response?.agency?.agency_logo_whitebg_url ??
              response?.agency?.agency_logo_url ??
              '';
            break;
        }
      }
    }
  }

  return {
    url: req?.url,
    metaImage: h.notEmpty(logo_url)
      ? imageBaseUrl + '/' + logo_url
      : 'https://cdn.yourpave.com/assets/color-favi.png',
    title,
    description,
    agencyName,
    favicon,
  };
};

// META TAGS
export const getServerSideProps = async ({ req, res, params }) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );

  const props = await fetchMeta({ req, params });
  console.log(props);
  return {
    props,
  };
};
