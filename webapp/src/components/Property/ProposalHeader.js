import React, { useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

// ICONS
import IconEmail from '../../components/Icons/IconEmail';
import IconFacebookVector from '../../components/Icons/IconFacebookVector';
import IconInstagramVector from '../../components/Icons/IconInstagramVector';
import IconLinkedinVector from '../../components/Icons/IconLinkedinVector';
import IconPhoneVector from '../../components/Icons/IconPhoneVector';
import IconWebsiteVector from '../../components/Icons/IconWebsiteVector';

function ProposalHeader({
  translate,
  customStyle,
  agencyUser,
  permalink,
  contact,
}) {
  const [showFullAgentDescription, setShowFullAgentDescription] =
    useState(false);

  const handleAgentLinkClick = async (activityType) => {
    let metaData = {
      permalink: permalink,
    };
    await api.contactActivity.create(
      {
        contact_fk: contact.contact_id,
        activity_type: activityType,
        activity_meta: JSON.stringify(metaData),
      },
      false,
    );
  };
  return (
    <div
      style={customStyle?.agentProfile?.container}
      className="py-4 header-container"
    >
      <div className="container">
        <div className="row">
          <div className={`col-lg-7 col-md-7 col-sm-12 col-xs-12`}>
            <div className="mx-2 mx-sm-0">
              <div className="d-flex flex-column">
                {agencyUser?.user?.email?.toLowerCase() !==
                  'info@rae-on.com' && (
                  <div className="d-flex header-agency align-items-start">
                    {!h.isEmpty(agencyUser?.user?.profile_picture_url) &&
                      !agencyUser.user?.profile_picture_url.includes(
                        '/assets/profile_picture_placeholder.png',
                      ) &&
                      !h.cmpStr(
                        // TODO: remove this, this is an absolutely bad idea but done as per PAVE-952
                        agencyUser?.user?.email,
                        'henry.lam@tropicanacorp.com.my',
                      ) && (
                        <img
                          style={{
                            objectFit: 'cover',
                          }}
                          className="mb-3 mb-md-0 mt-3 mt-md-0 mr-2 agent-img rounded-circle"
                          src={agencyUser?.user?.profile_picture_url}
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
                            ...customStyle?.agentProfile?.name,
                          }}
                        >
                          {agencyUser?.user?.full_name}
                        </span>
                      </div>
                      {agencyUser?.title && (
                        <div className="d-flex flex-column">
                          <span
                            style={{
                              fontSize: 18,
                              fontSize: 18,
                              fontWeight: 400,
                              ...customStyle?.agentProfile?.title,
                            }}
                          >
                            {agencyUser?.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="d-flex flex-column">
                    <p
                      className="mt-4 text-left profile-desc"
                      style={{
                        fontSize: 18,
                        fontWeight: 400,
                        fontFamily: 'PoppinsLight',
                        ...customStyle?.agentProfile?.description,
                      }}
                    >
                      {showFullAgentDescription
                        ? agencyUser?.description
                        : agencyUser?.description &&
                          agencyUser?.description.substr(
                            0,
                            agencyUser?.user?.email?.toLowerCase() !==
                              'info@rae-on.com'
                              ? 200
                              : 400,
                          )}
                      {!showFullAgentDescription &&
                      agencyUser?.description &&
                      agencyUser?.description.length >
                        (agencyUser?.user?.email?.toLowerCase() !==
                        'info@rae-on.com'
                          ? 200
                          : 400)
                        ? '...'
                        : ''}
                    </p>
                    <div align="center">
                      {agencyUser?.description &&
                        agencyUser?.description.length >
                          (agencyUser?.user?.email?.toLowerCase() !==
                          'info@rae-on.com'
                            ? 200
                            : 400) && (
                          <a
                            style={{
                              ...customStyle?.agentProfile?.readmore,
                            }}
                            href="#"
                            onClick={() =>
                              setShowFullAgentDescription(
                                !showFullAgentDescription,
                              )
                            }
                          >
                            {showFullAgentDescription
                              ? h.translate.localize('readLess', translate)
                              : h.translate.localize('readMore', translate)}
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
                      ...customStyle?.agentProfile?.name,
                    }}
                  >
                    {h.translate.localize('contactDetails', translate)}
                  </span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap mt-1 mt-md-3 social-links">
              {h.notEmpty(agencyUser?.user.email) && (
                <div className="d-flex align-items-center flex-5p">
                  <span
                    className="social-links-icon"
                    // style={{
                    //   ...customStyle.agentProfile.socialIcon
                    //     .background,
                    // }}
                  >
                    <IconEmail
                      color={customStyle?.agentProfile?.socialIcon?.icon?.color}
                    />{' '}
                  </span>

                  <a
                    href={`mailto:${agencyUser?.user?.email}`}
                    style={{
                      ...customStyle?.agentProfile?.socialLink,
                    }}
                    onClick={() => {
                      handleAgentLinkClick(
                        constant.CONTACT.ACTIVITY.TYPE.AGENT_EMAIL_CLICKED,
                      );
                    }}
                  >
                    {agencyUser?.user?.email}
                  </a>
                </div>
              )}
              {h.notEmpty(agencyUser?.user?.mobile_number) && (
                <div className="d-flex align-items-center flex-5p">
                  <span
                    className="social-links-icon"
                    // style={{
                    //   ...customStyle.agentProfile.socialIcon
                    //     .background,
                    // }}
                  >
                    <IconPhoneVector
                      color={customStyle?.agentProfile?.socialIcon?.icon?.color}
                    />{' '}
                  </span>

                  <a
                    href={`tel:${agencyUser?.user?.mobile_number}`}
                    style={{
                      ...customStyle?.agentProfile?.socialLink,
                    }}
                    onClick={() => {
                      handleAgentLinkClick(
                        constant.CONTACT.ACTIVITY.TYPE.AGENT_PHONE_CLICKED,
                      );
                    }}
                  >
                    {agencyUser?.user?.mobile_number}
                  </a>
                </div>
              )}
              {h.notEmpty(agencyUser?.website) && (
                <div className="d-flex align-items-center flex-5p">
                  <span
                    className="social-links-icon"
                    // style={{
                    //   ...customStyle.agentProfile.socialIcon
                    //     .background,
                    // }}
                  >
                    <IconWebsiteVector
                      color={customStyle?.agentProfile?.socialIcon?.icon?.color}
                    />{' '}
                  </span>
                  <a
                    href={agencyUser?.website}
                    target="_blank"
                    style={{
                      ...customStyle?.agentProfile?.socialLink,
                    }}
                    onClick={() => {
                      handleAgentLinkClick(
                        constant.CONTACT.ACTIVITY.TYPE.AGENT_WEBSITE_CLICKED,
                      );
                    }}
                  >
                    {agencyUser?.website}
                  </a>
                </div>
              )}
              {h.notEmpty(agencyUser?.instagram) && (
                <div className="d-flex align-items-center flex-5p">
                  <span
                    className="social-links-icon"
                    // style={{
                    //   ...customStyle.agentProfile.socialIcon
                    //     .background,
                    // }}
                  >
                    <IconInstagramVector
                      color={customStyle?.agentProfile?.socialIcon?.icon?.color}
                    />{' '}
                  </span>
                  <a
                    href={agencyUser?.instagram}
                    target="_blank"
                    style={{
                      ...customStyle?.agentProfile?.socialLink,
                    }}
                    onClick={() => {
                      handleAgentLinkClick(
                        constant.CONTACT.ACTIVITY.TYPE.AGENT_INSTAGRAM_CLICKED,
                      );
                    }}
                  >
                    @
                    {agencyUser?.instagram.split('/') &&
                      (agencyUser?.instagram.split('/')[
                        agencyUser?.instagram.split('/').length - 1
                      ] ||
                        agencyUser?.instagram.split('/')[
                          agencyUser?.instagram.split('/').length - 2
                        ])}
                  </a>
                </div>
              )}
              {h.notEmpty(agencyUser?.linkedin) && (
                <div className="d-flex align-items-center flex-5p">
                  <span
                    className="social-links-icon"
                    // style={{
                    //   ...customStyle.agentProfile.socialIcon
                    //     .background,
                    // }}
                  >
                    <IconLinkedinVector
                      color={customStyle?.agentProfile?.socialIcon?.icon?.color}
                    />{' '}
                  </span>
                  <a
                    href={agencyUser?.linkedin}
                    target="_blank"
                    style={{
                      ...customStyle?.agentProfile?.socialLink,
                    }}
                    onClick={() => {
                      handleAgentLinkClick(
                        constant.CONTACT.ACTIVITY.TYPE.AGENT_LINKEDIN_CLICKED,
                      );
                    }}
                  >
                    @
                    {agencyUser?.linkedin.split('/') &&
                      (agencyUser?.linkedin.split('/')[
                        agencyUser?.linkedin.split('/').length - 1
                      ] ||
                        agencyUser?.linkedin.split('/')[
                          agencyUser?.linkedin.split('/').length - 2
                        ])}
                  </a>
                </div>
              )}
              {h.notEmpty(agencyUser?.facebook) && (
                <div className="d-flex align-items-center flex-5p">
                  <span
                    className="social-links-icon"
                    // style={{
                    //   ...customStyle.agentProfile.socialIcon
                    //     .background,
                    // }}
                  >
                    <IconFacebookVector
                      color={customStyle?.agentProfile?.socialIcon?.icon?.color}
                    />{' '}
                  </span>
                  <a
                    href={agencyUser?.facebook}
                    target="_blank"
                    style={{
                      ...customStyle?.agentProfile?.socialLink,
                    }}
                    onClick={() => {
                      handleAgentLinkClick(
                        constant.CONTACT.ACTIVITY.TYPE.AGENT_FACEBOOK_CLICKED,
                      );
                    }}
                  >
                    {agencyUser?.facebook.split('/') &&
                      (agencyUser?.facebook.split('/')[
                        agencyUser?.facebook.split('/').length - 1
                      ] ||
                        agencyUser?.facebook.split('/')[
                          agencyUser?.facebook.split('/').length - 2
                        ])}
                  </a>
                </div>
              )}
              {/* {!h.isEmpty(agencyUser.user.mobile_number) &&
                        h.user.isValidNumberWithCountryCode(
                          agencyUser.user.mobile_number,
                        ) && (
                          <div className="d-flex align-items-center flex-5p">
                            <span className="social-links-icon">
                              <img
                                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/whatsapp-logo.png"
                                width={34}
                                style={{
                                  marginBottom: '5px',
                                  cursor: 'pointer',
                                  marginLeft: '-5px',
                                  marginRight: '-5px',
                                }}
                                title="WhatsApp Mobile Number"
                              />
                            </span>

                            <a
                              href={`https://wa.me/${agencyUser.user.mobile_number}`}
                              style={{
                                ...customStyle.agentProfile.socialLink,
                              }}
                              target="_blank"
                            >
                              Reach out on WhatsApp
                            </a>
                          </div>
                        )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProposalHeader);
