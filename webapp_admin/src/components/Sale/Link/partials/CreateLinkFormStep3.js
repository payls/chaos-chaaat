import React, { useEffect, useState } from 'react';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import Toggle from 'react-toggle';

// ICONS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSms, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import IconCrossVector from '../../../Icons/IconCrossVector';

// COMPONENTS
import CommonTooltip from '../../../Common/CommonTooltip';
import CommonTextAreaEditor from '../../../Common/CommonTextAreaEditor';
import ContentEditable from 'react-contenteditable';
import WhatsAppMessageForm from './WhatsAppMessageForm';
import WhatsAppTemplateMessageForm from './WhatsAppTemplateMessageForm';
import { TokenExpiredError } from 'jsonwebtoken';

export default function CreateLinkFormStep3({
  proposalId,
  agencyUser,
  successCallback,
  setLoading,
  projectImages,
  settingsData,
  permalinkTemplate,
}) {
  const [sms, setSms] = useState(false);
  const [whatsApp, setWhatsApp] = useState(false);
  const [email, setEmail] = useState(false);
  const [contacts, setContacts] = useState(
    JSON.parse(localStorage.getItem('selected_contacts') || []),
  );
  const [inviteEmailSubject, setInviteEmailSubject] = useState('');
  const [inviteEmailBody, setInviteEmailBody] = useState('');
  const [emailIntegrationStatus, setEmailIntegrationStatus] = useState(false);
  const [addOwner, setAddOwner] = useState(false);
  const [triggerSubmit, setTriggerSubmit] = useState(false);
  const [triggerQuickReply, setTriggerQuickReply] = useState(false);
  const [triggerDisplayImage, setTriggerDisplayImage] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [genericMessage, setGenericMessage] = useState(true);
  const [messageTemplate, setMessageTemplate] = useState(false);
  const [genericToggle, setGenericToggle] = useState(true);
  const [templateToggle, setTemplateToggle] = useState(false);
  const [agency, setAgency] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [hasSmsNumber, setHasSmsNumber] = useState(false);
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);
  const [campaignName, setCampaignName] = useState(
    `${agencyUser.agency.agency_name} Campaign`,
  );
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [whatsAppCredentialID, setWhatsAppCredentialID] = useState('');
  const [wabaSelectedCredentials, setWabaSelectedCredentials] = useState([]);
  const [ctaResponses, setCtaResponses] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [additionalEmailRecipient, setAdditionalEmailRecipient] = useState('');
  const [isConfirmation, setIsConfirmation] = useState(false);
  const [ctaOptions, setCtaOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (email && agencyUser) {
        let agencyUserTrayActiveSolutions =
          await api.integrations.getAgencyUserActiveIntegrations(
            null,
            agencyUser,
            false,
          );
        const active_integrations =
          agencyUserTrayActiveSolutions?.data?.active_integrations;
        let gmailStatus = !h.cmpStr(active_integrations?.gmail, 'inactive');
        let outlookStatus = !h.cmpStr(active_integrations?.outlook, 'inactive');
        setEmailIntegrationStatus(gmailStatus || outlookStatus);

        const genericEmailRes = await api.contactLink.genericInviteEmail(
          {},
          {},
          false,
        );
        if (h.cmpStr(genericEmailRes.status, 'ok')) {
          setInviteEmailSubject(genericEmailRes.data.invite_email_subject);
          setInviteEmailBody(genericEmailRes.data.invite_email_body);
        }
      }
      const agencyRes = await api.agencyUser.getCurrentUserAgency({}, false);
      setAgency(agencyRes.data.agencyUser.agency);
      setLoading(false);
    })();
  }, [email]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // check if sms option can be used
      if (
        !h.isEmpty(agencyUser.agency.agency_config) &&
        !h.isEmpty(agencyUser.agency.agency_config.sms_config)
      ) {
        const sms_config = JSON.parse(
          agencyUser.agency.agency_config.sms_config,
        );

        if (
          !h.isEmpty(sms_config) &&
          !h.isEmpty(sms_config.sms_number) &&
          !h.isEmpty(sms_config.is_enabled) &&
          h.cmpBool(sms_config.is_enabled, true)
        ) {
          setHasSmsNumber(true);
        }
      }

      // check of whatsapp option can be used
      if (
        !h.isEmpty(agencyUser.agency.agency_config) &&
        !h.isEmpty(agencyUser.agency.agency_config.whatsapp_config)
      ) {
        const whatsapp_config = JSON.parse(
          agencyUser.agency.agency_config.whatsapp_config,
        );

        if (
          !h.isEmpty(whatsapp_config) &&
          !h.isEmpty(whatsapp_config.is_enabled) &&
          h.cmpBool(whatsapp_config.is_enabled, true)
        ) {
          setWhatsAppEnabled(true);

          //get available agency waba credentials
          const credentials =
            await api.whatsapp.getAgencyWhatsAppConfigurations(
              agencyUser.agency.agency_id,
              false,
            );
          setWabaCredentials(credentials.data.agency_whatsapp_config);
          setAdditionalEmailRecipient(
            agencyUser.agency.agency_campaign_additional_recipient,
          );
        }
      }

      // check if email option can be used
      let agencyUserTrayActiveSolutions =
        await api.integrations.getAgencyUserActiveIntegrations(
          null,
          agencyUser,
          false,
        );
      const active_integrations =
        agencyUserTrayActiveSolutions?.data?.active_integrations;
      let hasGmailConnected = !h.cmpStr(active_integrations?.gmail, 'inactive');
      let hasOutlookConnected = !h.cmpStr(
        active_integrations?.outlook,
        'inactive',
      );
      setEmailIntegrationStatus(hasGmailConnected || hasOutlookConnected);

      setLoading(false);
    })();
  }, [agencyUser]);

  const handleClickSubmit = async () => {
    // Checks BUYER_FIRST_NAME in body
    if (email && !inviteEmailBody.includes('[BUYER_FIRST_NAME]')) {
      h.general.alert('error', {
        message: '[BUYER_FIRST_NAME] missing in email body',
      });

      // Checks PERMALINK in body
    } else if (email && !inviteEmailBody.includes('[PERMALINK]')) {
      h.general.alert('error', {
        message: '[PERMALINK] missing in email body',
      });
    } else {
      console.log(
        'has contacts with no owners: ' +
          h.cmpStr(localStorage.getItem('with_no_owner_contact'), 'true'),
      );
      if (h.cmpStr(localStorage.getItem('with_no_owner_contact'), 'true')) {
        h.general.prompt(
          {
            title: 'Before you proceed!',
            message:
              'It looks like you have selected contacts with no owner. Would you like to set the owner as yourself?',
          },
          async (confirmSetOwner) => {
            await setAddOwner(confirmSetOwner);
            await confirmSubmission();
          },
        );
      } else {
        await setAddOwner(false);
        await confirmSubmission();
      }
    }
  };

  const confirmSubmission = async () => {
    const promptMessage = whatsApp
      ? 'Confirm submit of the proposal? <br/><br/>Please note that if there are no WhatsApp mobile numbers, proposals will not be sent in the contact numbers.'
      : 'Confirm submit of the proposal?';
    h.general.prompt(
      {
        message: promptMessage,
      },

      async (status) => {
        if (status) {
          await setTriggerSubmit(true);
        }
      },
    );
  };

  useEffect(() => {
    if (h.cmpBool(triggerSubmit, true)) submit();
  }, [triggerSubmit]);

  const submit = async () => {
    const form = {
      campaign_name: campaignName,
      contact_ids: contacts.map((m) => m.contact_id),
      agency_id: agencyUser.agency_fk,
      sms,
      whatsApp,
      email,
      proposal: proposalId,
      add_owner: addOwner,
      trigger_quick_reply: triggerQuickReply,
      trigger_add_image: triggerDisplayImage,
      selected_images: selectedImages,
      templates: templates,
      is_generic: genericToggle,
      is_template: templateToggle,
      selected_waba_credentials_id: whatsAppCredentialID,
      api_token: wabaSelectedCredentials.agency_whatsapp_api_token,
      api_secret: wabaSelectedCredentials.agency_whatsapp_api_secret,
      permalink_template: permalinkTemplate,
      cta_response: ctaResponses,
      event_name: eventName,
      event_details: eventDetails,
      campaign_notification_additional_recipients: additionalEmailRecipient,
      is_confirmation: isConfirmation,
    };

    setLoading(true);

    // UPDATE EMAIL TEMPLATE

    if (email) {
      await api.proposalTemplate.createOrUpdate(
        {
          agency_id: agencyUser.agency_fk,
          proposal_template_id: proposalId,
          email_subject: inviteEmailSubject,
          email_body: inviteEmailBody,
        },
        false,
      );
    }

    const apiRes = await api.proposalTemplate.sendProposal(form, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      h.general.alert('success', { message: `Succesfully created proposals.` });
      setTimeout(() => {
        setLoading(false);

        successCallback();
      }, 2000);
    }
  };

  const handleSelectGenericMessage = () => {
    setGenericMessage(true);
    setMessageTemplate(false);
  };

  const handleSelectMessageTemplate = () => {
    setGenericMessage(false);
    setMessageTemplate(true);
  };

  const handleSetCampaignName = (campaign) => {
    setCampaignName(campaign);
  };

  const handleSelectedWABA = async (event) => {
    setWhatsAppCredentialID(event.target.value);
    if (event.target.value) {
      const selected_credentials =
        await api.whatsapp.getAgencyWhatsAppSelectedCredentials(
          event.target.value,
          false,
        );
      console.log(selected_credentials);
      setWabaSelectedCredentials({
        agency_whatsapp_api_token:
          selected_credentials.data.agency_whatsapp_config
            .agency_whatsapp_api_token,
        agency_whatsapp_api_secret:
          selected_credentials.data.agency_whatsapp_config
            .agency_whatsapp_api_secret,
        agency_waba_id:
          selected_credentials.data.agency_whatsapp_config.agency_waba_id,
        agency_waba_template_token:
          selected_credentials.data.agency_whatsapp_config
            .agency_waba_template_token,
        agency_waba_template_secret:
          selected_credentials.data.agency_whatsapp_config
            .agency_waba_template_secret,
      });
    } else {
      setTemplates([]);
    }
  };

  useEffect(() => {
    setGenericToggle(genericMessage);
  }, [genericMessage]);

  useEffect(() => {
    setTemplateToggle(messageTemplate);
  }, [messageTemplate]);

  return (
    <>
      <div
        className="d-flex"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          flexBasis: 'auto',
        }}
      >
        <div className={'modal-body animate-fadeIn'}>
          <div>
            <h3 align="center" className="modal-sub-title">
              Review Details
            </h3>
            <h3 className="modal-sub-title-item mt-5 mb-3">
              Notification Preferences
            </h3>
            <div
              className="d-flex notification-item-wrapper justify-content-center align-items-center"
              style={{ gap: '2em' }}
            >
              {agencyUser &&
                agencyUser.agency &&
                agencyUser.agency.agency_whatsapp_api_secret &&
                agencyUser.agency.agency_whatsapp_api_token && (
                  <>
                    {hasSmsNumber && (
                      <div
                        className={
                          `notification-item d-flex flex-column justify-content-center align-items-center ` +
                          (sms ? 'active' : '')
                        }
                        onClick={() => setSms((prev) => !prev)}
                      >
                        <div style={{ height: '120px', paddingTop: '10px' }}>
                          <FontAwesomeIcon
                            icon={faSms}
                            color="#00a859"
                            size="7x"
                          />
                        </div>
                        <span>SMS</span>
                      </div>
                    )}
                    {whatsAppEnabled && (
                      <div
                        className={
                          `notification-item d-flex flex-column justify-content-center align-items-center ` +
                          (whatsApp ? 'active' : '')
                        }
                        onClick={() => setWhatsApp((prev) => !prev)}
                      >
                        <div style={{ height: '120px' }}>
                          <img
                            src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/whatsapp-logo.png"
                            width={150}
                          />
                        </div>
                        <span>WhatsApp</span>
                      </div>
                    )}
                  </>
                )}
              {emailIntegrationStatus && (
                <div
                  className={
                    `notification-item d-flex flex-column justify-content-center align-items-center ` +
                    (email ? 'active' : '')
                  }
                  onClick={() => setEmail((prev) => !prev)}
                >
                  <div style={{ height: '120px', paddingTop: '10px' }}>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      color="#00a859"
                      size="7x"
                    />
                  </div>
                  <span>Email</span>
                </div>
              )}
            </div>
            {email && (
              <>
                <h3 className="modal-sub-title-item mt-5 mb-3">
                  The email that will be sent to the buyer
                </h3>

                <div className="buyers-link-email">
                  <div className="buyers-link-email-subject">
                    <h5>Subject: </h5>

                    <ContentEditable
                      html={inviteEmailSubject}
                      disabled={!emailIntegrationStatus}
                      onChange={(e) => setInviteEmailSubject(e.target.value)}
                    />
                  </div>
                  <div className="buyers-link-email-subject">
                    <h5>Body: </h5>

                    {emailIntegrationStatus ? (
                      <CommonTextAreaEditor
                        placeholder=""
                        message={inviteEmailBody}
                        setMessage={(e) => setInviteEmailBody(e)}
                        showEditor={false}
                        height={400}
                      />
                    ) : (
                      <ContentEditable
                        html={inviteEmailBody}
                        disabled={true}
                        onChange={(e) => setInviteEmailBody(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
            {whatsApp && (
              <>
                <div className="modal-input-group mt-5">
                  <label>Campaign Name*</label>
                  <input
                    type="text"
                    placeholder="Campaign Name"
                    value={campaignName}
                    onChange={(e) => handleSetCampaignName(e.target.value)}
                  />
                </div>
                <div className="modal-input-group mt-4">
                  <label className="whatsapp-toggle d-flex align-items-center">
                    <Toggle
                      icons={false}
                      checked={isConfirmation}
                      defaultChecked={false}
                      className="is-confirmation-toggle"
                      onClick={() => setIsConfirmation(!isConfirmation)}
                    />
                    <h3 className="modal-sub-title-item mt-2">
                      Is this a Confirmation Reminder?
                    </h3>
                  </label>
                </div>
                <div className="modal-input-group mt-4">
                  <label>Event Name*</label>
                  <span
                    style={{
                      fontSize: '10px',
                      marginBottom: '5px',
                    }}
                  >
                    Note: This field is used a landing page templates, with
                    email notification that needs event details. Leave blank if
                    not needed.
                  </span>
                  <input
                    type="text"
                    placeholder="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                <div className="modal-input-group mt-5">
                  <label>Event Details</label>
                  <span
                    style={{
                      fontSize: '10px',
                      marginBottom: '5px',
                    }}
                  >
                    Note: This field is used a landing page templates, with
                    email notification that needs event details. Leave blank if
                    not needed.
                  </span>
                  <textarea
                    placeholder="Sample format: on the 1st of January, from 12pm to 6pm at the
                    Sydney Opera House, Bennelong Point, Sydney NSW 2000,
                      Australia."
                    onChange={(e) => setEventDetails(e.target.value)}
                  ></textarea>
                </div>
                <div className="modal-input-group mt-5">
                  <label>Additional Email Notification Recipients</label>
                  <span
                    style={{
                      fontSize: '10px',
                      marginBottom: '5px',
                    }}
                  >
                    Note: This field is used for additional email notification
                    recipients. Add comma {'(,)'} as separator.
                  </span>
                  <input
                    type="text"
                    placeholder="Additional Email Recipients"
                    value={additionalEmailRecipient}
                    onChange={(e) =>
                      setAdditionalEmailRecipient(e.target.value)
                    }
                  />
                </div>
                <div className="modal-input-group mt-5">
                  <label>WABA*</label>
                  <select onChange={() => handleSelectedWABA(event)}>
                    <option value="">Select WABA to use</option>
                    {wabaCredentials.map((waba, wabaIndex) => {
                      return (
                        <option value={waba.agency_whatsapp_config_id}>
                          {waba.waba_name} [+{waba.waba_number}]
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div
                  style={
                    h.isEmpty(whatsAppCredentialID) ? { display: 'none' } : {}
                  }
                >
                  {!h.isEmpty(agency.agency_waba_id) ? (
                    <label className="whatsapp-toggle d-flex align-items-center mt-5">
                      <Toggle
                        icons={false}
                        checked={genericToggle}
                        defaultChecked={false}
                        className="whatsapp-toggle"
                        onClick={() => handleSelectGenericMessage()}
                      />
                      <h3 className="modal-sub-title-item mt-2">
                        Choose to use our generic message
                      </h3>
                    </label>
                  ) : (
                    <h3 className="modal-sub-title-item mt-5 mb-3">
                      The WhatsApp message that will be sent to the buyer
                    </h3>
                  )}
                  {genericToggle && (
                    <WhatsAppMessageForm
                      proposalId={proposalId}
                      triggerQuickReply={triggerQuickReply}
                      setTriggerQuickReply={setTriggerQuickReply}
                      triggerDisplayImage={triggerDisplayImage}
                      setTriggerDisplayImage={setTriggerDisplayImage}
                      projectImages={projectImages}
                      selectedImages={selectedImages}
                      setSelectedImages={setSelectedImages}
                    />
                  )}
                  {!h.isEmpty(agency.agency_waba_id) ? (
                    <label className="whatsapp-toggle d-flex align-items-center mt-3">
                      <Toggle
                        icons={false}
                        checked={templateToggle}
                        defaultChecked={false}
                        className="whatsapp-toggle"
                        onClick={() => handleSelectMessageTemplate()}
                      />
                      <h3 className="modal-sub-title-item mt-2">
                        Or select from your available WhatsApp templates
                      </h3>
                    </label>
                  ) : (
                    ''
                  )}
                  {templateToggle && (
                    <WhatsAppTemplateMessageForm
                      proposalId={proposalId}
                      projectImages={projectImages}
                      selectedImages={selectedImages}
                      setSelectedImages={setSelectedImages}
                      setLoading={setLoading}
                      agency={agency}
                      templates={templates}
                      setTemplates={setTemplates}
                      wabaSelectedCredentials={wabaSelectedCredentials}
                      ctaResponses={ctaResponses}
                      setCtaResponses={setCtaResponses}
                      ctaOptions={ctaOptions}
                      setCtaOptions={setCtaOptions}
                    />
                  )}
                </div>
              </>
            )}
            <h3 className="modal-sub-title-item mt-5 mb-3">Contact Summary</h3>
            {contacts.length === 0 && <div>No contact found.</div>}
            {contacts.length > 0 && (
              <table className="contact-summary-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>email</th>
                    <th width="50px"></th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, i) => (
                    <tr>
                      <td>
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td>{contact.mobile_number}</td>
                      <td>{contact.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        <CommonTooltip tooltipText="Remove Contact">
                          <IconCrossVector
                            style={{ height: 16, cursor: 'pointer' }}
                            onClick={async () => {
                              h.general.prompt(
                                {
                                  message:
                                    'Are you sure you want to remove this contact from the list?',
                                },

                                async (status) => {
                                  if (status) {
                                    const contactsCopy = [...contacts];
                                    contactsCopy.splice(i, 1);
                                    setContacts(contactsCopy);
                                  }
                                },
                              );
                            }}
                          />
                        </CommonTooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="modal-footer">
            <button className="common-button transparent-bg" onClick={() => {}}>
              Previous
            </button>
            {contacts.length === 0 ||
            (!sms &&
              (!whatsApp || (whatsApp && !whatsAppCredentialID)) &&
              !email) ? (
              <button
                className="common-button transparent-bg"
                style={{
                  cursor: 'default',
                }}
              >
                Save & Finish
              </button>
            ) : (
              <button
                className="common-button"
                style={{
                  cursor: 'pointer',
                }}
                onClick={handleClickSubmit}
              >
                Save & Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
