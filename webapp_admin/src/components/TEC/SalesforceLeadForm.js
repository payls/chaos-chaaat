import React, { useState, useEffect } from 'react';
import { config } from '../../configs/config';
import {
  faTimes,
  faCommentSlash,
  faTrash,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { h } from '../../helpers';
import { api } from '../../api';
import constants from '../../constants/constant.json';
import CommonSelect from '../../components/Common/CommonSelect';
import SmallSpinner from '../Inbox/SmallSpinner';
import SalesforceUpdateField from '../Common/SalesforceUpdateField';

export default function SalesforceLeadForm({
  contactId,
  agencyId,
  agencyUserId,
  platform,
  contact,
  contactUpdate,
}) {
  const [status, setStatus] = useState(constants.API_STATUS.PENDING);
  const [sfdcData, setSfdcData] = useState(null);
  const [hasTECRecord, setHasTECRecord] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [hasEmail, setHasEmail] = useState(h.notEmpty(contact?.email));
  const [form, setForm] = useState({
    agency_id: null,
    agency_user_id: null,
    contact_id: null,
    first_name: contact?.first_name,
    last_name: contact?.last_name,
    mobile_number: contact?.mobile_number,
    email: contact?.email,
    platform: platform,
    preferred_language: null,
    interested_product: null,
    interested_city: null,
    enable_marketing: false,
  });

  const [cities, setCities] = useState([]);
  const [products, setProducts] = useState([
    {
      value: 'Service Office',
      label: 'Private Offices',
    },
    {
      value: 'Coworking',
      label: 'Coworking Space',
    },
    {
      value: 'Virtual Office',
      label: 'Virtual Offices',
    },
    {
      value: 'Meeting Rooms',
      label: 'Meeting Room Booking',
    },
    {
      value: 'Event Spaces',
      label: 'Event Spaces Hire',
    },
    {
      value: 'Enterprise Solution',
      label: 'Customised Workspace',
    },
    {
      value: 'Others',
      label: 'Others',
    },
  ]);
  const LANGUAGE = [
    {
      value: 'en',
      label: 'English',
    },
    {
      value: 'jp',
      label: 'Japanese',
    },
    {
      value: 'kr',
      label: 'Korean',
    },
    {
      value: 'zh-Hant',
      label: 'Traditional Chinese',
    },
  ];
  const [salesforceContact, setSalesforceContact] = useState(false);
  const tec_agencies = config.tec_agency_list.split(',');

  useEffect(() => {
    (async () => {
      setSfdcData(null);
      if (h.notEmpty(contactId) && h.notEmpty(agencyId)) {
        setStatus(constants.API_STATUS.PENDING);
        setForm({
          agency_id: agencyId,
          agency_user_id: agencyUserId,
          contact_id: contactId,
          first_name: contact?.first_name,
          last_name: contact?.last_name,
          mobile_number: contact?.mobile_number,
          email: contact?.email,
          platform: platform,
          preferred_language: null,
          interested_product: null,
          interested_city: null,
          enable_marketing: false,
        });
        await getSalesforceFormData();
        await getCities(agencyId);
        setStatus(constants.API_STATUS.FULLFILLED);
      }
    })();
  }, [contactId, agencyId, contact]);

  useEffect(() => {
    (async () => {
      setHasTECRecord(false);
      if (h.notEmpty(sfdcData)) {
        setHasTECRecord(true);
      }
    })();
  }, [sfdcData]);

  function onChange(v, key) {
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  async function getCities(agencyId, language = 'en') {
    const response = await api.liveChat.getCities(agencyId, language, false);

    if (h.cmpStr(response.status, 'ok')) {
      setCities(response.data.cities);
    }
  }

  async function getSalesforceFormData() {
    const sfdcDataRes = await api.contact.getSalesforceFormData(contactId);

    if (h.cmpStr(sfdcDataRes.status, 'ok')) {
      if (h.notEmpty(sfdcDataRes.data.contact_saleforce_data)) {
        sfdcDataRes.data.contact_saleforce_data.preferred_language =
          sfdcDataRes.data.contact_saleforce_data.language;
      }
      setSfdcData(sfdcDataRes.data.contact_saleforce_data);
      setSalesforceContact(h.notEmpty(sfdcDataRes.data.contact_source));
    }
  }

  // this function is for SFDC submission for TEC
  async function handleTECSubmit() {
    if (
      h.isEmpty(form.email) ||
      !h.general.validateEmail(form.email) ||
      h.isEmpty(form.preferred_language) ||
      h.isEmpty(form.interested_product) ||
      h.isEmpty(form.interested_city) ||
      (h.cmpStr(platform, 'line') && h.isEmpty(form.mobile_number))
    ) {
      setFieldError(true);
      h.general.alert('error', {
        message: 'Please fill in required fields',
      });
      setStatus(constants.API_STATUS.FULLFILLED);
      return;
    }

    h.general.prompt(
      {
        message:
          'Are you sure you want to submit data and generate a Salesforce record?',
      },

      async (submitSFDC) => {
        if (h.cmpBool(submitSFDC, true)) {
          setStatus(constants.API_STATUS.PENDING);

          setFieldError(false);
          const formData = {
            agency_id: form.agency_id,
            agency_user_id: form.agency_user_id,
            contact_id: form.contact_id,
            first_name: form.first_name,
            last_name: form.last_name,
            mobile_number: form.mobile_number,
            email: form.email,
            platform: form.platform,
            preferred_language: form.preferred_language.value,
            interested_product: form.interested_product.value,
            interested_city: form.interested_city.value,
            enable_marketing: form.enable_marketing,
          };
          if (h.cmpStr(platform, 'line')) {
            formData.mobile_number = form.mobile_number;
          }
          const apiRes = await api.contact.generateTECSalesforceLead(
            formData,
            false,
          );
          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.infoPrompt(
              {
                message: 'Succesfully created Salesforce record.',
              },

              async () => {
                await getSalesforceFormData();
              },
            );
          } else {
            h.general.alert('error', {
              message: 'Something went wrong! Please try again.',
            });
          }
          setStatus(constants.API_STATUS.FULLFILLED);
        }
      },
    );
  }

  // this is for generic SFDC submission
  async function handleGenericSFDCSubmit() {
    if (
      h.isEmpty(form.email) ||
      !h.general.validateEmail(form.email)) {
      setFieldError(true);
      h.general.alert('error', {
        message: 'Please provide a valid email address',
      });
      setStatus(constants.API_STATUS.FULLFILLED);
      return;
    }

    h.general.prompt(
      {
        message:
          'Are you sure you want to submit data and generate a Salesforce record?',
      },

      async (submitSFDC) => {
        if (h.cmpBool(submitSFDC, true)) {
          setStatus(constants.API_STATUS.PENDING);

          setFieldError(false);
          const formData = {
            agency_id: form.agency_id,
            agency_user_id: form.agency_user_id,
            contact_id: form.contact_id,
            first_name: form.first_name,
            last_name: form.last_name,
            mobile_number: form.mobile_number,
            email: form.email,
            platform: form.platform,
          };

          const apiRes = await api.contact.generateSalesforceData(
            formData,
            false,
          );
          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.infoPrompt(
              {
                message: 'Succesfully created Salesforce record.',
              },

              async () => {
                await getSalesforceFormData();
              },
            );
          } else {
            h.general.alert('error', {
              message: 'Something went wrong! Please try again.',
            });
          }
          setStatus(constants.API_STATUS.FULLFILLED);
        }
      },
    );
  }

  return (
    <>
      <div>
        {!salesforceContact && status !== constants.API_STATUS.PENDING && (
          <>
            <div
              style={{
                flexGrow: 1,
              }}
            >
              {platform === 'line' && (
                <div className="campaign-create-form mt-2">
                  <small className="smaill-title ">
                    Mobile Number<b className="light-red-text">*</b>
                  </small>
                  <div className="mt-1">
                    <input
                      className={`form-item ${
                        fieldError && h.isEmpty(form.mobile_number)
                          ? 'field-error'
                          : ''
                      }`}
                      placeholder="Enter a valid mobile number"
                      type="text"
                      value={form.mobile_number}
                      onChange={(e) =>
                        onChange(e.target.value, 'mobile_number')
                      }
                    />
                    <sub>Format is country code + rest of the number.</sub>
                  </div>
                </div>
              )}

              {!hasEmail && (
                <div className="campaign-create-form mt-2">
                  <small className="smaill-title ">
                    Email<b className="light-red-text">*</b>
                  </small>
                  <div className="mt-1">
                    <input
                      className={`form-item ${
                        (fieldError && h.isEmpty(form.email)) ||
                        !h.general.validateEmail(form.email)
                          ? 'field-error'
                          : ''
                      }`}
                      placeholder="Enter a valid email"
                      type="email"
                      value={form.email}
                      onChange={(e) => onChange(e.target.value, 'email')}
                    />
                  </div>
                </div>
              )}

              {tec_agencies.includes(agencyId) && (
                <>
                  <div className="campaign-create-form mt-2">
                    <small className="smaill-title ">
                      Preferred Language<b className="light-red-text">*</b>
                    </small>
                    <div className="mt-1">
                      <CommonSelect
                        id="preferred_language"
                        className={`${
                          fieldError && h.isEmpty(form.preferred_language)
                            ? 'field-error'
                            : ''
                        }`}
                        options={[
                          ...LANGUAGE.map((m) => ({
                            value: m.value,
                            label: `${m.label}`,
                          })),
                        ]}
                        value={form.preferred_language}
                        isSearchable={true}
                        onChange={(v) => {
                          onChange(v, 'preferred_language');
                        }}
                        placeholder="Select Language"
                      />
                    </div>
                  </div>
                  <div className="campaign-create-form mt-1">
                    <small className="smaill-title ">
                      Interested Product<b className="light-red-text">*</b>
                    </small>
                    <div className="mt-1">
                      <CommonSelect
                        id="interested_product"
                        className={`${
                          fieldError && h.isEmpty(form.interested_product)
                            ? 'field-error'
                            : ''
                        }`}
                        options={[
                          ...products.map((m) => ({
                            value: m.value,
                            label: `${m.label}`,
                          })),
                        ]}
                        value={form.interested_product}
                        isSearchable={true}
                        onChange={(v) => {
                          onChange(v, 'interested_product');
                        }}
                        placeholder="Select Product"
                      />
                    </div>
                  </div>
                  <div className="campaign-create-form mt-1">
                    <small className="smaill-title ">
                      Interested City<b className="light-red-text">*</b>
                    </small>
                    <div className="mt-1">
                      <CommonSelect
                        id="interested_city"
                        className={`${
                          fieldError && h.isEmpty(form.interested_city)
                            ? 'field-error'
                            : ''
                        }`}
                        options={[
                          ...cities.map((m) => ({
                            value: m.sf_city_id,
                            label: `${m.name}`,
                          })),
                        ]}
                        value={form.interested_city}
                        isSearchable={true}
                        onChange={(v) => {
                          onChange(v, 'interested_city');
                        }}
                        placeholder="Select City"
                      />
                    </div>
                  </div>
                  <div className="campaign-create-form mt-2">
                    <small className="smaill-title ">Enable Marketing?</small>
                    <div className="mt-1">
                      <button
                        type="button"
                        className={`header-none-btn w ${
                          form.enable_marketing === false ? 'active' : ''
                        }`}
                        onClick={(v) => onChange(false, 'enable_marketing')}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className={`header-none-btn w ${
                          form.enable_marketing === true ? 'active' : ''
                        }`}
                        onClick={(v) => onChange(true, 'enable_marketing')}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div
                className="campaign-create-form mt-1"
                style={{
                  textAlign: 'right',
                }}
              >
                <label style={{ width: '180px' }}></label>
                <div>
                  <button
                    className="common-button-2 mt-2 text-normal w-100"
                    type="button"
                    onClick={tec_agencies.includes(agencyId) ? handleTECSubmit : handleGenericSFDCSubmit}
                    disabled={
                      status === constants.API_STATUS.PENDING ? true : false
                    }
                  >
                    Push to Salesforce
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {salesforceContact && status !== constants.API_STATUS.PENDING && (
          <>
            <div
              style={{
                flexGrow: 1,
              }}
              className=" flex-column"
            >
              <div className="campaign-create-form">
                <small className="mb-0 small-title">Email</small>
                <SalesforceUpdateField
                  contact={contact}
                  field="email"
                  value={sfdcData?.email}
                  onSuccess={() => getSalesforceFormData()}
                  contactUpdate={contactUpdate}
                />
              </div>
              {platform === 'line' && (
                <div className="campaign-create-form">
                  <small className="mb-0 small-title">Mobile Number</small>
                  <SalesforceUpdateField
                    field="mobile"
                    value={sfdcData?.mobile}
                    contact={contact}
                    onSuccess={() => getSalesforceFormData()}
                  />
                </div>
              )}
              {tec_agencies.includes(agencyId) && (
                <>
                  <div className="campaign-create-form mt-2">
                    <small className="mb-0 small-title">Preferred Language</small>
                    <SalesforceUpdateField
                      field="preferred_language"
                      value={sfdcData?.preferred_language}
                      language={[
                        ...LANGUAGE.map((m) => ({
                          value: m.value,
                          label: `${m.label}`,
                        })),
                      ]}
                      contact={contact}
                      onSuccess={() => getSalesforceFormData()}
                    />
                  </div>
                  <div className="campaign-create-form mt-2">
                    <small className="mb-0 small-title">Interested Product</small>
                    <SalesforceUpdateField
                      field="interested_product"
                      value={sfdcData?.interested_product}
                      contact={contact}
                      products={[
                        ...products.map((m) => ({
                          value: m.value,
                          label: `${m.label}`,
                        })),
                      ]}
                      onSuccess={() => getSalesforceFormData()}
                    />
                  </div>
                  <div className="campaign-create-form mt-2">
                    <small className="mb-0 small-title">Interested City</small>
                    <SalesforceUpdateField
                      field="interested_city"
                      value={sfdcData?.interested_city}
                      cities={cities.map((m) => ({
                        value: m.sf_city_id,
                        code: m.code,
                        label: `${m.name}`,
                      }))}
                      contact={contact}
                      onSuccess={() => getSalesforceFormData()}
                    />
                  </div>
                  <div className="campaign-create-form mt-2">
                    <small className="mb-0 small-title">Enable Marketing?</small>
                    <SalesforceUpdateField
                      field="enable_marketing"
                      value={sfdcData?.enable_marketing}
                      contact={contact}
                      onSuccess={() => getSalesforceFormData()}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {status === constants.API_STATUS.PENDING && <SmallSpinner />}
      </div>
    </>
  );
}
