import React, { useEffect, useState, createRef, useRef } from 'react';
import { Card, Navbar } from 'react-bootstrap';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import { flatten } from 'lodash';

import ShortlistedProjectCard from '../components/Property/ShortlistedProjectCard';
import { useRouter } from 'next/router';
import IconOrangeInternet from '../components/Icons/IconOrangeInternet';
import IconOrangeInstagram from '../components/Icons/IconOrangeInstagram';
import IconOrangeLinkedin from '../components/Icons/IconOrangeLinkedin';

import IconEmail from '../components/Icons/IconEmail';
import IconFacebookVector from '../components/Icons/IconFacebookVector';
import IconInstagramVector from '../components/Icons/IconInstagramVector';
import IconLinkedinVector from '../components/Icons/IconLinkedinVector';
import IconPhoneVector from '../components/Icons/IconPhoneVector';
import IconWebsiteVector from '../components/Icons/IconWebsiteVector';

import CommonLoading from '../components/Common/CommonLoading/CommonLoading';
import CommonImage from '../components/Common/CommonImage';
import ProjectTableList from '../../../../Sale/Link/preview/components/Property/ProjectTableList';
import PropertyTableList from '../../../../Sale/Link/preview/components/Property/PropertyTableList';

import {
  faPhoneAlt,
  faEnvelope,
  faPencil,
  faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonEmptyState from '../components/Common/CommonEmptyState';
import constant from '../constants/constant.json';

import GreetingEditor from '../components/Editor/GreetingEditor';

export default function Permalink(props) {
  const router = useRouter();
  const headerRef = useRef(null);
  const { inPermalink, shouldTrackActivity, setSettingsData, settingsData } =
    props;
  const [proposalProperties, setProposalProperties] = useState([]);
  const [permalink, setPermalink] = useState(inPermalink);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contact, setContact] = useState();
  const [shortlistedProjects, setShortlistedProjects] = useState();
  const [showFullAgentDescription, setShowFullAgentDescription] =
    useState(false);
  const [agencyUser, setAgencyUser] = useState({});
  const [emptyState, setEmptyState] = useState(false);
  const [permalinkMessage, setPermalinkMessage] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [customStyle, setCustomStyle] = useState(null);
  const [translate, setTranslation] = useState(
    require('../../preview/constants/locale/en.json'),
  );
  const imageUrl = 'https://cdn.yourpave.com/assets/buyer-page-empty.png';
  const invalidText = 'This Web Link is not correct or no longer active';

  const [navigationValue, setNavigationValue] = useState('projects');
  const [projectRefs, setProjectRefs] = useState([]);

  // const getGreetings = () => {
  //   const myDate = new Date();
  //   const hrs = myDate.getHours();
  //   let greet;
  //   if (hrs < 12) greet = 'Good Morning';
  //   else if (hrs >= 12 && hrs <= 17) greet = 'Good Afternoon';
  //   else if (hrs >= 17 && hrs <= 24) greet = 'Good Evening';
  //   return greet;
  // };

  // get the parameter to determine whether to track the activity on the link
  // this parameter is set false for preview pages

  const sortProjects = (projects) => {
    const compareFunction = (first, second) => {
      if (first.is_bookmarked && !second.is_bookmarked) {
        return -1;
      } else if (!first.is_bookmarked && second.is_bookmarked) {
        return 1;
      } else {
        // for both bookmarked and not bookmarked, the display order logic remains the same
        return first.display_order < second.display_order ? -1 : 1;
      }
    };
    return projects.sort(compareFunction);
  };

  const getShortlistedProjects = async () => {
    let { inPermalink } = props;
    if (h.notEmpty(inPermalink)) {
      inPermalink = inPermalink.split('-').pop();
    }
    setPermalink(inPermalink);
    await (async () => {
      setIsLoading(true);
      if (h.notEmpty(inPermalink)) {
        const apiRes = await api.contact.getContactWithShortlistedProjects(
          { permalink: inPermalink },
          false,
        );
        if (h.cmpStr(apiRes.status, 'ok') && apiRes.data) {
          if (
            h.notEmpty(apiRes.data.contact) &&
            h.notEmpty(apiRes.data.shortlisted_projects)
          ) {
            setContact(apiRes.data.contact);

            // HARD CODED FOR PRIORITY CLIENT
            setCustomStyleFunc(apiRes.data.contact.agency.agency_id);
            setTranslationFunc(apiRes.data.contact.agency.agency_id);

            // if a request is made from webapp_admin, do not fire a link opened activity
            if (shouldTrackActivity) {
              //Create activity tracker
              await handleTracker(apiRes.data.contact.contact_id, inPermalink);
            }

            const sProjs = sortProjects(
              apiRes.data.shortlisted_projects.filter((f) => !f.is_deleted),
            );

            setProjectRefs((elRefs) =>
              sProjs.map((proj) => ({
                projectRef: createRef(),
                propertyRefs: proj.shortlisted_properties
                  ? proj.shortlisted_properties.map(() => createRef())
                  : [],
              })),
            );

            setNavigationValue(sProjs.length === 1 ? 'properties' : 'projects');
            setProposalProperties(
              flatten(
                sProjs
                  .filter((f) => f.shortlisted_properties)
                  .map((m) => m.shortlisted_properties),
              ),
            );

            setShortlistedProjects(sProjs);
            setSelectedProject({
              project: sProjs[0],
              index: 0,
            });

            let inAgencyUser = apiRes.data.contact.agency_user;
            setAgencyUser(inAgencyUser);
            if (
              inAgencyUser.description &&
              inAgencyUser.description.length > 200
            )
              setShowFullAgentDescription(false);
            else setShowFullAgentDescription(true);

            // set permalink message from the db value or default
            if (h.notEmpty(permalinkMessage)) {
              setPermalinkMessage(permalinkMessage);
            } else if (h.notEmpty(apiRes.data.contact.permalink_message)) {
              setPermalinkMessage(apiRes.data.contact.permalink_message);
            } else {
              setPermalinkMessage(
                'It’s ' +
                  inAgencyUser.user.first_name +
                  ' here from ' +
                  apiRes.data.contact.agency.agency_name +
                  '. I’ve shortlisted a few units that I wanted to share with you for your thoughts and feedback. ' +
                  "Appreciate if you can provide me a guide on your interest using the stars and any comments you'd " +
                  'like to share against each unit below.\n\n Thank you!',
              );
            }
          } else {
            setEmptyState(true);
          }
        }
      }
      setLoaded(true);
      setIsLoading(false);
    })();
  };

  const handleClicRowkProject = (v) => {
    setSelectedProject({
      project: v.original,
      index: v.index,
    });
    setTimeout(() => {
      projectRefs[v.index].projectRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 25);
  };

  const handleClicRowkProperty = (v) => {
    const projectIndex = shortlistedProjects.findIndex(
      (x) => x.project.project_id === v.original.project.project_id,
    );

    setSelectedProject({
      project: shortlistedProjects[projectIndex],
      index: projectIndex,
    });

    const allPropertyRef = flatten(projectRefs.map((m) => m.propertyRefs));
    setTimeout(() => {
      allPropertyRef[v.index].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 25);
  };

  useEffect(() => {
    getShortlistedProjects();
  }, [router.query]);

  const handleTracker = async (contactId, permalink) => {
    let metaData = {
      permalink: permalink,
    };
    await api.contactActivity.create(
      {
        contact_fk: contactId,
        activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
        activity_meta: JSON.stringify(metaData),
      },
      false,
    );
  };

  const getCustomStyle = (agent) => {
    switch (agent) {
      case 'raeon':
        return {
          agencyLogoSize: { width: '60%' },
          topLogoWrapper: { background: 'white' },
          agentProfile: {
            container: { background: 'white' },
            name: { color: '#002030' },
            title: { color: '#002030' },
            readmore: { color: '#002030' },
            description: { color: '#002030' },
            socialIcon: {
              icon: { color: '#0086A4' },
              background: { background: '#E1F4FD' },
            },
            socialLink: { color: '#002030' },
          },
          carousel: {
            tagActiveBgColor: '#0086A4',
            tagTextColor: 'white',
          },
          bookmark: {
            color: '#0086A4',
            background: '#E1F4FD',
          },
          details: {
            title: '#002030',
            content: 'rgba(0, 32, 48, 0.7)',
          },
          projectFeatures: {
            title: 'white',
            textColor: 'white',
            iconBg: 'white',
            iconColor: '#0086A4',
            iconBorder: 'white',
            background: '#0086A4',
          },
          projectInfo: {
            background: '#DCF0F4',
            title: '#002030',
            content: 'rgba(0, 32, 48, 0.7)',
            chevron: '#707070',
            separator: { borderBottom: '1px solid #AAB6B8' },
          },
          projectLocation: {
            titleColor: '#002030',
            background: 'white',
          },
          propertyDetails: {
            titleColor: '#002030',
            background: 'white',
            iconColor: '#0086A4',
            iconColor2: '#0086A4',
            textColor: '#002030',
            price: '#002030',
          },
          message: {
            background: '#E1F4FD',
            button: '#E1F4FD',
            color: '#0086A4',
          },
          reservation: {
            background: '#0086A4',
          },
          options: {
            background: '#002030',
          },
          footer: {
            background: 'white',
            invert: false,
            text: '#002030',
          },
        };
      case 'ogps':
        return {
          agencyLogoSize: { width: '30%' },
          topLogoWrapper: { background: '#000' },
          agentProfile: {
            container: { background: '#e5e2dc' },
            name: { color: '#000' },
            title: { color: '#a58561' },
            readmore: { color: '#a58561' },
            description: { color: '#000' },
            socialIcon: {
              icon: { color: '#a58561' },
              background: { background: '#E6ECEC' },
            },
            socialLink: { color: '#000' },
          },
          carousel: {
            tagActiveBgColor: '#28201b',
            tagTextColor: 'white',
          },
          bookmark: {
            color: '#a58561',
            background: '#E6ECEC',
          },
          details: {
            title: '#000',
            content: '#626970',
          },
          projectFeatures: {
            title: 'white',
            textColor: 'white',
            iconBg: '#000',
            iconColor: '#a58561',
            iconBorder: '#a58561',
            background: '#000',
          },
          projectInfo: {
            background: '#e5e2dc',
            title: '#28201b',
            content: '#a58561',
            chevron: '#49433f',
            separator: { borderBottom: '1px solid #b1b1b1' },
          },
          projectLocation: {
            titleColor: '#131313',
            background: 'white',
          },
          propertyDetails: {
            titleColor: '#131313',
            background: '#E6ECEC',
            iconColor: '#a58561',
            iconColor2: '#a58561',
            textColor: '#28201b',
            price: '#28201b',
          },
          message: {
            background: '#eff2f6',
            button: 'rgb(4, 34, 30)',
          },
          reservation: {
            background: '#131313',
          },
          options: {
            background: '#131313',
          },
          footer: {
            background: '#000',
            invert: false,
            text: 'white',
          },
        };
      case 'louise':
        return {
          agencyLogoSize: { width: '30%' },
          topLogoWrapper: { background: '#ED6D5E' },
          agentProfile: {
            container: { background: '#D4D4D4' },
            name: { color: '#000' },
            title: { color: '#1c1c1c' },
            readmore: { color: '#1c1c1c' },
            description: { color: '#1c1c1c' },
            socialIcon: {
              icon: { color: '#ED6D5E' },
              background: { background: '#E6ECEC' },
            },
            socialLink: { color: '#000' },
          },
          carousel: {
            tagActiveBgColor: '#ED6D5E',
            tagTextColor: 'white',
          },
          bookmark: {
            color: '#ED6D5E',
            background: '#E6ECEC',
          },
          details: {
            title: '#131313',
            content: '#626970',
          },
          projectFeatures: {
            title: 'white',
            textColor: 'white',
            iconBg: '#edebe7',
            iconColor: '#ED6D5E',
            iconBorder: '#ED6D5E',
            background: '#ED6D5E',
          },
          projectInfo: {
            background: '#D4D4D4',
            title: '#191919',
            content: '#626970',
            chevron: '#28303F',
            separator: { borderBottom: '1px solid #8b8b8b' },
          },
          projectLocation: {
            titleColor: '#131313',
            background: '#DDF9FF',
          },
          propertyDetails: {
            titleColor: '#131313',
            background: '#E6ECEC',
            iconColor: '#ED6D5E',
            iconColor2: '#ED6D5E',
            textColor: '#ED6D5E',
            price: '#ED6D5E',
          },
          message: {
            background: '#eff2f6',
            button: 'rgb(4, 34, 30)',
          },
          reservation: {
            background: '#ED6D5E',
          },
          options: {
            background: '#ED6D5E',
          },
          footer: {
            background: '#ED6D5E',
            invert: false,
            text: 'white',
          },
        };
      case 'eco':
        return {
          agencyLogoSize: { width: '30%' },
          topLogoWrapper: { background: 'white' },
          agentProfile: {
            container: { background: 'white' },
            name: { color: '#131313' },
            title: { color: '#949799' },
            readmore: { color: '#131313' },
            description: { color: '#949799' },
            socialIcon: {
              icon: { color: '#8C827A' },
              background: { background: '#ECE6E1' },
            },
            socialLink: { color: '#8C827A' },
          },
          carousel: {
            tagActiveBgColor: '#8C827A',
            tagTextColor: 'white',
          },
          bookmark: {
            color: '#8C827A',
            background: '#ECE6E1',
          },
          details: {
            title: '#131313',
            content: '#626970',
          },
          projectFeatures: {
            title: 'white',
            textColor: 'white',
            iconBg: 'white',
            iconColor: '#8C827A',
            iconBorder: 'white',
            background: '#8C827A',
          },
          projectInfo: {
            background: '#EFE6DE',
            title: '#131313',
            content: '#949799',
            chevron: '#131313',
            separator: { borderBottom: '1px solid #949799' },
          },
          projectLocation: {
            titleColor: '#131313',
            background: 'white',
          },
          propertyDetails: {
            titleColor: '#131313',
            background: '#F1F0EC',
            iconColor: '#4F4637',
            iconColor2: '#4F4637',
            textColor: '#131313',
            price: '#131313',
          },
          message: {
            background: '#ECE6E1',
            button: '#B4ACA7',
          },
          reservation: {
            background: '#8C827A',
          },
          options: {
            background: '#8C827A',
          },
          footer: {
            background: 'white',
            invert: false,
            text: '#131313',
          },
        };
      default:
        return {
          agencyLogoSize: { width: '30%' },
          topLogoWrapper: { background: '#FAFBFB' },
          agentProfile: {
            container: { background: '#FAFBFB' },
            name: { color: '#000' },
            title: { color: '#1c1c1c' },
            readmore: { color: '#1c1c1c' },
            description: { color: '#3F4446' },
            socialIcon: {
              icon: { color: '#04221E' },
              background: { background: '#E6ECEC' },
            },
            socialLink: { color: '#000' },
          },
          carousel: {
            tagActiveBgColor: '#04221E',
            tagTextColor: 'white',
          },
          bookmark: {
            color: '#04221E',
            background: '#f3f3f3',
          },
          details: {
            title: '#131313',
            content: '#626970',
          },
          projectFeatures: {
            title: '#131313',
            textColor: '#373b45',
            iconBg: '#edebe7',
            iconColor: '#000',
            iconBorder: '#edebe7',
            background: '#F3F3F3',
          },
          projectInfo: {
            background: 'white',
            title: '#373b45',
            content: '#626970',
            chevron: '#28303F',
            separator: { borderBottom: '1px solid #d9d9d9' },
          },
          projectLocation: {
            titleColor: '#131313',
            background: 'white',
          },
          propertyDetails: {
            titleColor: '#131313',
            background: '#F1F0EC',
            iconColor: '#908E8E',
            iconColor2: '#908E8E',
            textColor: '#131313',
            price: '#131313',
          },
          message: {
            background: '#eff2f6',
            button: 'rgb(4, 34, 30)',
          },
          reservation: {
            background: '#04221E',
          },
          options: {
            background: '#04221E',
          },
          footer: {
            background: 'white',
            invert: false,
            text: '#131313',
          },
        };
    }
  };

  function setCustomStyleFunc(agentId) {
    let agencyStyle = 'default';
    switch (agentId) {
      case '1da3ff5f-d3fc-11eb-8182-065264a181d4':
        agencyStyle = 'raeon';
        break;
      case '1f880948-0097-40a8-b431-978fd59ca321':
        agencyStyle = 'ogps';
        break;
      case '2d6bd5e4-a90a-4138-b69c-52ad74dba119':
        agencyStyle = 'louise';
        break;
      case '6d2ed536-369f-4b06-838a-458fac611c21':
        agencyStyle = 'eco';
        break;
    }

    setCustomStyle(getCustomStyle(agencyStyle));
  }

  function setTranslationFunc(agentId) {
    switch (agentId) {
      case '1da3ff5f-d3fc-11eb-8182-065264a181d4':
        setTranslation(require('../../preview/constants/locale/ch.json'));
        break;
      default:
        setTranslation(require('../../preview/constants/locale/en.json'));
        break;
    }
  }

  return (
    <div className="mt-3">
      {h.notEmpty(contact) && (
        <Header
          title={`${contact.agency.agency_name} - a private proposal for your consideration`}
          titlePaveEnding={false}
          description={
            'View property information, rate your interest and have queries addressed '
          }
          imageOg={
            h.notEmpty(contact.agency.agency_logo_url)
              ? `https://pave-prd.s3-ap-southeast-1.amazonaws.com/${contact.agency.agency_logo_url}`
              : null
          }
          imageTwitter={
            h.notEmpty(contact.agency.agency_logo_url)
              ? `https://pave-prd.s3-ap-southeast-1.amazonaws.com/${contact.agency.agency_logo_url}`
              : null
          }
          showHeaderContent={false}
        />
      )}

      <Body isLoading={isLoading}>
        <CommonLoading isAnimating={isLoading} key={'progress-bar'} />
        {h.notEmpty(contact) &&
          h.notEmpty(agencyUser) &&
          h.cmpBool(emptyState, false) && (
            <div ref={headerRef}>
              <div style={customStyle.topLogoWrapper}>
                <div className="container animate-fadeIn py-3">
                  <div className="mx-2 mx-sm-0">
                    <Card.Title className="pb-3 d-flex justify-content-center">
                      {h.notEmpty(contact.agency.agency_logo_url) ? (
                        <img
                          src={contact.agency.agency_logo_url}
                          alt="Pave"
                          style={{
                            width:
                              window.innerWidth <= 820
                                ? customStyle?.agencyLogoSize.width
                                : 200,
                          }}
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
                          {h.user.getNameInitials(contact.agency.agency_name)}
                        </span>
                      )}
                    </Card.Title>
                  </div>
                </div>
              </div>
              <div style={customStyle.agentProfile.container} className="py-4">
                <div className="container animate-fadeIn">
                  <div className="row">
                    <div className={`col-lg-7 col-md-7 col-sm-12 col-xs-12`}>
                      <div className="mx-2 mx-sm-0">
                        <div className="d-flex flex-column">
                          <div className="d-flex header-agency align-items-start">
                            {!h.isEmpty(
                              contact?.agency_user?.user?.profile_picture_url,
                            ) &&
                              !contact?.agency_user?.user?.profile_picture_url.includes(
                                '/assets/profile_picture_placeholder.png',
                              ) &&
                              !h.cmpStr(
                                // TODO: remove this, this is an absolutely bad idea but done as per PAVE-952
                                agencyUser.user.email,
                                'henry.lam@tropicanacorp.com.my',
                              ) && (
                                <img
                                  style={{
                                    objectFit: 'cover',
                                  }}
                                  className="mb-3 mb-md-0 mt-3 mt-md-0 mr-2 agent-img rounded-circle"
                                  src={
                                    contact?.agency_user?.user
                                      ?.profile_picture_url
                                  }
                                  width="93px"
                                  height="93px"
                                  alt=""
                                />
                              )}
                            <div className="flex-column contact-name ">
                              <div className="d-flex flex-column">
                                <span
                                  style={{
                                    fontSize: 22,
                                    fontFamily: 'PoppinsSemiBold',
                                    marginTop: '15px',
                                    ...customStyle.agentProfile.name,
                                  }}
                                >
                                  {agencyUser.user.full_name}
                                </span>
                              </div>
                              {agencyUser.title && (
                                <div className="d-flex flex-column">
                                  <span
                                    style={{
                                      fontSize: 18,
                                      fontSize: 18,
                                      fontWeight: 400,
                                      ...customStyle.agentProfile.title,
                                    }}
                                  >
                                    {agencyUser.title}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="d-flex flex-column">
                              <p
                                className="mt-4 text-left profile-desc"
                                style={{
                                  fontSize: 18,
                                  fontWeight: 400,
                                  fontFamily: 'PoppinsLight',
                                  ...customStyle.agentProfile.description,
                                }}
                              >
                                {showFullAgentDescription
                                  ? agencyUser.description
                                  : agencyUser.description &&
                                    agencyUser.description.substr(0, 200)}
                                {!showFullAgentDescription &&
                                agencyUser.description &&
                                agencyUser.description.length > 200
                                  ? '...'
                                  : ''}
                              </p>
                              <div align="center">
                                {agencyUser.description &&
                                  agencyUser.description.length > 200 && (
                                    <a
                                      style={{
                                        ...customStyle.agentProfile.readmore,
                                      }}
                                      href="#"
                                      onClick={() =>
                                        setShowFullAgentDescription(
                                          !showFullAgentDescription,
                                        )
                                      }
                                    >
                                      {showFullAgentDescription
                                        ? h.translate.localize(
                                            'readLess',
                                            translate,
                                          )
                                        : h.translate.localize(
                                            'readMore',
                                            translate,
                                          )}
                                    </a>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-12  col-xs-12">
                      <div className="d-flex header-agency align-items-start">
                        <div className="flex-column contact-name ">
                          <div className="d-flex flex-column">
                            <span
                              style={{
                                fontSize: 22,
                                fontFamily: 'PoppinsSemiBold',
                                marginTop: '15px',
                                ...customStyle.agentProfile.name,
                              }}
                            >
                              {h.translate.localize(
                                'contactDetails',
                                translate,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap mt-4 mt-md-3 social-links">
                        {h.notEmpty(agencyUser.user.email) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span
                              className="social-links-icon"
                              // style={{
                              //   ...customStyle.agentProfile.socialIcon
                              //     .background,
                              // }}
                            >
                              <IconEmail
                                color={
                                  customStyle.agentProfile.socialIcon.icon.color
                                }
                              />{' '}
                            </span>

                            <a
                              href={`mailto:${agencyUser.user.email}`}
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                            >
                              {agencyUser.user.email}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.user.mobile_number) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span
                              className="social-links-icon"
                              // style={{
                              //   ...customStyle.agentProfile.socialIcon
                              //     .background,
                              // }}
                            >
                              <IconPhoneVector
                                color={
                                  customStyle.agentProfile.socialIcon.icon.color
                                }
                              />{' '}
                            </span>

                            <a
                              href={`tel:${agencyUser.user.mobile_number}`}
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                            >
                              {agencyUser.user.mobile_number}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.website) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span
                              className="social-links-icon"
                              // style={{
                              //   ...customStyle.agentProfile.socialIcon
                              //     .background,
                              // }}
                            >
                              <IconWebsiteVector
                                color={
                                  customStyle.agentProfile.socialIcon.icon.color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.website}
                              target="_blank"
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                            >
                              {agencyUser.website}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.instagram) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span
                              className="social-links-icon"
                              // style={{
                              //   ...customStyle.agentProfile.socialIcon
                              //     .background,
                              // }}
                            >
                              <IconInstagramVector
                                color={
                                  customStyle.agentProfile.socialIcon.icon.color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.instagram}
                              target="_blank"
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                            >
                              @
                              {agencyUser.instagram.split('/') &&
                                (agencyUser.instagram.split('/')[
                                  agencyUser.instagram.split('/').length - 1
                                ] ||
                                  agencyUser.instagram.split('/')[
                                    agencyUser.instagram.split('/').length - 2
                                  ])}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.linkedin) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span
                              className="social-links-icon"
                              // style={{
                              //   ...customStyle.agentProfile.socialIcon
                              //     .background,
                              // }}
                            >
                              <IconLinkedinVector
                                color={
                                  customStyle.agentProfile.socialIcon.icon.color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.linkedin}
                              target="_blank"
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                            >
                              @
                              {agencyUser.linkedin.split('/') &&
                                (agencyUser.linkedin.split('/')[
                                  agencyUser.linkedin.split('/').length - 1
                                ] ||
                                  agencyUser.linkedin.split('/')[
                                    agencyUser.linkedin.split('/').length - 2
                                  ])}
                            </a>
                          </div>
                        )}
                        {h.notEmpty(agencyUser.facebook) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span
                              className="social-links-icon"
                              // style={{
                              //   ...customStyle.agentProfile.socialIcon
                              //     .background,
                              // }}
                            >
                              <IconFacebookVector
                                color={
                                  customStyle.agentProfile.socialIcon.icon.color
                                }
                              />{' '}
                            </span>
                            <a
                              href={agencyUser.facebook}
                              target="_blank"
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                            >
                              {agencyUser.facebook.split('/') &&
                                (agencyUser.facebook.split('/')[
                                  agencyUser.facebook.split('/').length - 1
                                ] ||
                                  agencyUser.facebook.split('/')[
                                    agencyUser.facebook.split('/').length - 2
                                  ])}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {h.notEmpty(shortlistedProjects) && (
                <>
                  <div className="navigation-wrapper d-flex justify-content-center my-4">
                    <div className="navigation-items pos-rlt">
                      <span
                        className={
                          'movingBg ' +
                          (navigationValue === 'projects'
                            ? 'leftside'
                            : 'rightside') +
                          ' ' +
                          (proposalProperties.length === 0 ? 'no-prop' : '')
                        }
                      ></span>
                      <div>
                        {shortlistedProjects.length > 1 && (
                          <span
                            className={
                              'navigation-item ' +
                              (navigationValue === 'projects' ? 'selected' : '')
                            }
                            style={{ ...customStyle?.agentProfile?.name }}
                            onClick={() => {
                              setNavigationValue('projects');
                            }}
                          >
                            {h.translate.localize('projectList', translate)}
                          </span>
                        )}
                        {proposalProperties.length > 0 && (
                          <span
                            className={
                              'navigation-item ' +
                              (navigationValue === 'properties'
                                ? 'selected'
                                : '')
                            }
                            style={{ ...customStyle?.agentProfile?.name }}
                            onClick={() => {
                              setNavigationValue('properties');
                            }}
                          >
                            {h.translate.localize(
                              'shortlistedProperties',
                              translate,
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="container">
                    {navigationValue === 'projects' && (
                      <div className="projects-table animate-fadeIn">
                        <ProjectTableList
                          projects={shortlistedProjects}
                          selected={selectedProject}
                          customStyle={customStyle}
                          translate={translate}
                          contact_id={contact.contact_id}
                          reloadShortlistedProjects={getShortlistedProjects}
                          shouldTrackActivity={shouldTrackActivity}
                          handleClick={handleClicRowkProject}
                        />
                      </div>
                    )}
                    {proposalProperties.length > 0 &&
                      navigationValue === 'properties' && (
                        <div className="properties-table animate-fadeIn">
                          <PropertyTableList
                            selected={selectedProject}
                            projects={shortlistedProjects}
                            customStyle={customStyle}
                            translate={translate}
                            contact_id={contact.contact_id}
                            reloadShortlistedProjects={getShortlistedProjects}
                            shouldTrackActivity={shouldTrackActivity}
                            handleClick={handleClicRowkProperty}
                          />
                        </div>
                      )}
                  </div>
                </>
              )}

              {selectedProject && (
                <ShortlistedProjectCard
                  refValue={projectRefs[selectedProject.index]}
                  is_demo={h.cmpStr(permalink, 'demo')}
                  contact={contact}
                  shortlistedProject={selectedProject.project}
                  setLoading={setIsLoading}
                  shouldTrackActivity={shouldTrackActivity}
                  reloadShortlistedProjects={getShortlistedProjects}
                  settingsData={settingsData}
                  setSettingsData={setSettingsData}
                  key={selectedProject.index}
                  customStyle={customStyle}
                  translate={translate}
                />
              )}

              <div
                className="toTop"
                style={{
                  background: customStyle?.projectFeatures?.iconBg,
                  color: customStyle?.projectFeatures?.iconColor,
                }}
                onClick={() => {
                  headerRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              >
                &uarr;
              </div>
            </div>
          )}

        {h.cmpBool(emptyState, true) && (
          <div>
            <CommonEmptyState imageUrl={imageUrl} invalidText={invalidText} />
          </div>
        )}

        <div
          className="d-flex flex-column w-100 align-items-center justify-content-center pb-3"
          style={{ background: customStyle?.footer?.background }}
        >
          {h.notEmpty(contact) && (
            <>
              {h.notEmpty(contact.agency.agency_logo_url) ? (
                <img
                  src={contact.agency.agency_logo_url}
                  alt="Pave"
                  style={{
                    width:
                      window.innerWidth <= 820
                        ? customStyle?.agencyLogoSize.width
                        : 200,
                  }}
                  className="mt-2"
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
                  {h.user.getNameInitials(contact.agency.agency_name)}
                </span>
              )}
            </>
          )}
          <div
            className="pt-3 text-center"
            style={{ color: customStyle?.footer?.text }}
          >
            {h.translate.localize('poweredBy', translate)}{' '}
            <a
              href="https://www.yourpave.com/"
              target="_blank"
              style={{
                textDecoration: 'underline',
                color: customStyle?.footer?.text,
              }}
            >
              Pave
            </a>
          </div>
        </div>
      </Body>
    </div>
  );
}
