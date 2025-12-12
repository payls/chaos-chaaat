import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { useRouter } from 'next/router';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import countryCodes from '../../constants/countryCodes';

export default function CreateContactModal(props) {
  const router = useRouter();
  const {
    onCloseModal,
    setLoading,
    contactId,
    formMode,
    agencyWhatsAppCredentials,
  } = props;
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [contactStatus, setContactStatus] = useState([]);
  const [contact, setContact] = useState({});
  const [agencyUser, setAgencyUser] = useState({});
  const [showModal, setShowModal] = useState(
    h.cmpStr(formMode, h.form.FORM_MODE.ADD),
  );
  const formFields = {
    first_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'First Name*',
      class_name: `col-12 login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Last Name',
      class_name: `col-12 login-generic-input`,
    },
    mobile_number: {
      field_type: h.form.FIELD_TYPE.PHONENUMBER,
      label: 'Phone number',
      class_name: `col-12 login-generic-input phone-indent-create`,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.NUMBER,
      ],
    },
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Email',
      placeholder: 'example@gmail.com',
      class_name: `col-12 login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.NON_REQUIRED_VALID_EMAIL],
    },
    contact_owner: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 login-generic-input`,
      label: 'Contact Owner',
      options: agencyUsers,
    },
    company: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 login-generic-input`,
      label: 'Company',
    },
    status: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 login-generic-input ajd-error-icon`,
      label: 'Contact Status',
      options: contactStatus,
    },
    opt_out_whatsapp: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 login-generic-input ajd-error-icon`,
      label: 'WhatsApp Subscription',
      options: [{ text: 'Opt-In', value: false }, { text: 'Opt-Out', value: true }],
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    //Fetch list of agency users
    (async () => {
      await getAgencyInfo();
    })();
    return () => (document.body.style.overflow = 'unset');
  }, []);

  const handleAgencyApiResponse = (res) => {
    if (res.data.agency_users && res.data.agency_users.length > 0) {
      let agencyUsers = handleOptionList(res.data.agency_users);
      setAgencyUsers(agencyUsers);
    }
  };

  const getCountryCode = (mobileNumberWithCountryCode) => {
    /**
     * e.g. +919090345556
     * e.g. 919090345556
     */
    if (h.isEmpty(mobileNumberWithCountryCode)) return null
    let parsedNumber;
    if (mobileNumberWithCountryCode.startsWith("+")) {
      parsedNumber = parsePhoneNumberFromString(mobileNumberWithCountryCode)
    } else {
      parsedNumber = parsePhoneNumberFromString(`+${mobileNumberWithCountryCode}`)
    }
    if (
      h.notEmpty(parsedNumber) &&
      h.notEmpty(parsedNumber.nationalNumber) && 
      h.notEmpty(parsedNumber.countryCallingCode)
    ) {
      const countryCode = countryCodes.find((ele) => ele.code === parsedNumber?.country)
      if (h.notEmpty(countryCode)) {
        const countryCodeObj = {
          value: countryCode,
          label: `${countryCode.flag} ${countryCode.code} ${countryCode.dial_code}`,
        }
        return {
          mobileNumberWithoutCountryCode: parsedNumber.nationalNumber,
          countryCode: countryCodeObj
        }
      }
    }
    return null
  }

  // Set default contact owner
  useEffect(() => {
    if (agencyUser) {
      h.form.updateFields('contact_owner', fields, setFields, {
        value: agencyUser.agency_user_id,
      });
    }
  }, [agencyUser]);

  useEffect(() => {
    if (h.notEmpty(contactId)) {
      // Edit mode
      if (h.cmpStr(formMode, h.form.FORM_MODE.EDIT)) {
        (async () => {
          setLoading(true);

          const [contactApiRes, agencyUsersApiRes] = await Promise.all([
            api.contact.findOne({ contact_id: contactId }, false),
            api.agencyUser.getAgencyUsers(
              { agency_fk: agencyUser.agency },
              false,
            ),
          ]);

          if (
            h.cmpStr(contactApiRes.status, 'ok') &&
            h.cmpStr(agencyUsersApiRes.status, 'ok')
          ) {
            handleAgencyApiResponse(agencyUsersApiRes);
            handleStatusOptionList(constant.CONTACT.STATUS);
            setContact(contactApiRes.data.contact);
            const fieldsCopy = h.general.deepCloneObject(fields);
            fieldsCopy.first_name.value =
              contactApiRes.data.contact?.first_name;
            fieldsCopy.last_name.value = contactApiRes.data.contact?.last_name;
            fieldsCopy.mobile_number.value = contactApiRes.data.contact?.mobile_number;
            const parsedNumber = getCountryCode(contactApiRes.data.contact?.mobile_number)
            if (h.notEmpty(parsedNumber)) {
              const { mobileNumberWithoutCountryCode, countryCode } =
                parsedNumber;
              fieldsCopy.countryCode = countryCode;
              fieldsCopy.mobile_number.value = mobileNumberWithoutCountryCode;
            }
            fieldsCopy.email.value = contactApiRes.data.contact?.email;
            fieldsCopy.contact_owner.value =
              contactApiRes.data.contact?.agency_user_fk;
            fieldsCopy.company.value = contactApiRes.data.contact?.company;
            fieldsCopy.status.value = contactApiRes.data.contact?.status;
            fieldsCopy.opt_out_whatsapp.value = contactApiRes.data.contact?.opt_out_whatsapp;
            setFields(fieldsCopy);
            setShowModal(true);
          }
        })();
      }
    } else {
      // Add mode
      (async () => {
        setLoading(true);
        handleStatusOptionList(constant.CONTACT.STATUS);
        const agencyUsersApiRes = await api.agencyUser.getAgencyUsers(
          { agency_fk: agencyUser.agency },
          false,
        );
        if (h.cmpStr(agencyUsersApiRes.status, 'ok')) {
          handleAgencyApiResponse(agencyUsersApiRes);
          setShowModal(true);
        }
      })();
    }
  }, [contactId]);

  useEffect(() => {
    if (showModal) setLoading(false);
  }, [showModal]);

  const getAgencyInfo = async () => {
    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setAgencyUser(apiRes.data.agencyUser);
    }
  };

  const handleOptionList = (agencyUsers) => {
    let options = [{ text: 'Select contact owner', value: '' }];
    agencyUsers.forEach((agencyUser) => {
      let details = {};
      details.value = agencyUser.agency_user_id;
      details.text = agencyUser.user.email;
      options.push(details);
    });
    return options;
  };

  const handleStatusOptionList = (statusList) => {
    let options = [{ text: 'Select contact status', value: '' }];
    for (const [key, value] of Object.entries(statusList)) {
      let details = {};
      details.value = value;
      details.text = key;
      options.push(details);
    }
    setContactStatus(options);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let mobile_number = fields.mobile_number?.value;
    let parsedNumber;

    if (
      !h.isEmpty(fields.mobile_number?.value) &&
      !h.isEmpty(fields.countryCode?.value?.code)
    ) {
      parsedNumber = parsePhoneNumberFromString(
        fields.mobile_number.value,
        fields.countryCode?.value?.code
      );

      if (h.isEmpty(parsedNumber) || !parsedNumber.isValid()) {
        h.general.alert('error', { message: 'Invalid number format.' });
        const f = Object.assign({}, fields);
        f.mobile_number.error = true;
        setFields(f);
        return;
      }
      mobile_number = parsedNumber?.number;
    }

    setLoading(true);
    let formData = {};
    formData.first_name = fields.first_name.value;
    formData.last_name = fields.last_name.value;
    formData.mobile_number = mobile_number;
    formData.email = fields.email.value;
    formData.agency_id = agencyUser.agency_fk;
    formData.agency_user_id = fields.contact_owner.value;
    formData.company = fields.company.value;
    formData.status = fields.status.value;
    formData.opt_out_whatsapp = h.cmpStr(fields.opt_out_whatsapp.value, 'true') ? true : false;

    if (h.cmpStr(formMode, h.form.FORM_MODE.ADD)) {
      formData.status = fields.status.value ? fields.status.value : 'active';
      const apiRes = await api.contact.create(formData);
      if (h.cmpStr(apiRes.status, 'ok')) {
        await closeModal();
      }
    } else {
      formData.contact_id = contactId;
      const apiRes = await api.contact.update(formData);
      if (h.cmpStr(apiRes.status, 'ok')) {
        await closeModal(formData);
      }
    }
    setLoading(false);
  };

  const checkIfWhatsAppMobile = async (mobile_number, contactId) => {
    if (!h.isEmpty(contactId)) {
      const contactData = await api.contact.findById(contactId, {}, false);
      if (h.cmpStr(contactData.mobile_number, mobile_number)) {
        if (!contactData.is_whatsapp) {
          return await addWhatsAppConnection(mobile_number);
        }
        return contactData.is_whatsapp;
      } else {
        return await addWhatsAppConnection(mobile_number);
      }
    } else {
      return await addWhatsAppConnection(mobile_number);
    }
  };

  const checkIfAgencySMSConnection = async (mobile_number, contactId) => {
    if (!h.isEmpty(contactId)) {
      const contactData = await api.contact.findById(contactId, {}, false);
      if (h.cmpStr(contactData.mobile_number, mobile_number)) {
        if (!contactData.is_agency_sms_connection) {
          return await addSMSConnection(mobile_number);
        }
        return contactData.is_agency_sms_connection;
      } else {
        return await addSMSConnection(mobile_number);
      }
    } else {
      return await addSMSConnection(mobile_number);
    }
  };

  const addWhatsAppConnection = async (mobile_number) => {
    const contactMobile = mobile_number.replace(/[^0-9,;\-.!? ]/g, '');
    const addConnection = await api.whatsapp.validateAndAddConnection(
      {
        mobile_number: contactMobile,
        credentials: agencyWhatsAppCredentials,
      },
      false,
    );
    return h.general.cmpStr(addConnection.status, 'ok');
  };

  const addSMSConnection = async (mobile_number) => {
    const contactMobile = mobile_number.replace(/[^0-9,;\-.!? ]/g, '');
    const addConnection = await api.sms.validateAndAddConnection(
      {
        mobile_number: contactMobile,
        credentials: agencyWhatsAppCredentials,
      },
      false,
    );
    return h.general.cmpStr(addConnection.status, 'ok');
  };

  const closeModal = async (data = null) => {
    setShowModal(false);
    await router.push(window.location.pathname);
    onCloseModal(data);
  };

  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body sm">
        <div className=" d-flex justify-content-between">
          <h1>{h.isEmpty(contactId) ? 'Add' : 'Edit'} Contact</h1>

          <span
            onClick={closeModal}
            style={{
              cursor: 'pointer',
              fontSize: '1em',
              marginLeft: '3em',
            }}
          >
            <FontAwesomeIcon
              icon={faTimes}
              color="#182327"
              style={{ fontSize: '15px' }}
            />
          </span>
        </div>
        <div className=" modern-style mt-4 mdrn-input-form">
          <span>Start by entering the contact’s name, email, etc.</span>
          <h.form.GenericForm
            className="text-left login-form"
            formFields={formFields}
            formMode={h.form.FORM_MODE.ADD}
            setLoading={setLoading}
            fields={fields}
            setFields={setFields}
            showCancelButton={true}
            handleCancel={closeModal}
            cancelButtonClassName="common-button transparent-bg"
            handleSubmit={handleSubmit}
            submitButtonLabel={
              h.cmpStr(formMode, h.form.FORM_MODE.ADD) ? 'Create' : 'Update'
            }
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-5'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}
