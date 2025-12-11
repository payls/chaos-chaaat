import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import CommonIconButton from '../../components/Common/CommonIconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlusCircle,
  faEnvelope,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import CreateInviteUserModal from '../../components/UserManagement/CreateInviteUserModal';
import { useRouter } from 'next/router';
import AgencyUserListing from '../../components/UserManagement/AgencyUserListing';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import useUserManagementStore from '../../components/UserManagement/store';
import IconMail from '../../components/Icons/IconMail';
import IconPlusCircle from '../../components/Icons/IconPlusCircle';
import IconResendImage from '../../components/Icons/IconResendImage';

export default function UserManagement() {
  const router = useRouter();
  const { users: selectedUsers, setUsers } = useUserManagementStore();
  const [isLoading, setLoading] = useState();
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [formMode, setFormMode] = useState('');
  const [shouldReload, setShouldReload] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [agencyId, setAgencyId] = useState('');
  const [showResendBtn, setShowResendBtn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const { open_invite_user } = router.query;
    
    if (open_invite_user === 'true') {
      setShowInviteUserModal(true);
    }
  }, [router.query]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      setIsSuperAdmin(await h.userManagement.isSuperAdmin());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyId(apiRes.data.agencyUser.agency.agency_id);
      }
    })();
  }, []);

  useEffect(() => {
    setShowResendBtn(true);
    if (h.notEmpty(agencyId)) {
      (async () => {
        const subscriptionRes = await api.agency.getAgencySubscription(agencyId, false);
        if (h.cmpStr(subscriptionRes.status, 'ok')) {
          console.log(subscriptionRes.data);
        }
      })();
    }
  }, [agencyId]);

  useEffect(() => {
    const contact_id = h.general.findGetParameter('contact_id');
    const form_mode = h.general.findGetParameter('form_mode');
    setSelectedContactId(contact_id);
    setFormMode(form_mode);
    if (h.cmpStr(form_mode, h.form.FORM_MODE.ADD)) {
      setShowInviteUserModal(true);
    }
  }, [router.query]);

  const doneReloading = () => {
    setShouldReload(false);
  };

  const getUsedLicences = () => {
    return agencyUsers
      .filter((agencyUser) => agencyUser.user !== null)
      .filter(
        (agencyUser) => agencyUser.user.status !== constant.USER.STATUS.DELETED,
      ).length;
  };

  const handleResendInvitation = async () => {
    if (h.isEmpty(selectedUsers)) {
      h.general.alert('error', {
        message: 'Please select at least one user to resend activation email.',
        autoCloseInSecs: 3,
      });
      return;
    }

    h.general.prompt(
      {
        title: 'Resend Activation Email',
        message:
          'This will resend account activation email to all selected users with pending status. <br/>Continue?',
      },
      async (confirmSend) => {
        if (confirmSend) {
          setLoading(true);
          const resendRes =
            await api.userManagement.resendAccountActivationEmail(
              { agency_id: agencyId, user_ids: selectedUsers },
              true,
            );
          if (h.cmpStr(resendRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Resend Activation Email Success!',
              autoCloseInSecs: 1,
            });
          }
          setLoading(false);
          setShowResend(false);
          setUsers([]);
        }
      },
    );
  };

  const ResendModal = () => {
    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body">
          <div className=" d-flex justify-content-between">
            <h1></h1>

            <span
              onClick={() => setShowResend(false)}
              style={{
                cursor: 'pointer',
                fontSize: '1em',
                marginLeft: '3em',
              }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                color="#182327"
                style={{ fontSize: '30px' }}
              />
            </span>
          </div>
          <div className="center-body">
            <IconResendImage />
            <h3 style={{ fontFamily: 'PoppinsSemiBold' }} className="mt-5 ">
              Resend Activation Email
            </h3>
            <p
              style={{
                fontFamily: 'PoppinsRegular',
                textAlign: 'center',
                fontSize: '25px',
                color: '#182327',
                marginBottom: '20px',
              }}
              className="mt-3"
            >
              This will resend account activation email
              <br /> to all users with pending status.
            </p>
            <button
              type="button"
              className="common-button md w-f-content text-normal mt-3 mb-3"
              onClick={handleResendInvitation}
              disabled={isLoading}
            >
              <span
                style={{
                  fontSize: '18px',
                  margin: '10px 25px',
                  display: 'block',
                }}
              >
                Resend
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showResend && <ResendModal />}

      {showInviteUserModal && (
        <CreateInviteUserModal
          formMode={formMode}
          setLoading={setLoading}
          onCloseModal={() => {
            setShowInviteUserModal(!showInviteUserModal);
            setShouldReload(true);
          }}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="mb-2 contacts-title d-flex justify-content-between">
                <div>
                  <h1> User Management</h1>
                  <span>
                    {getUsedLicences()} licence
                    {getUsedLicences() === 1 ? '' : 's'} used
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs">
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div
                      className="d-flex mt-2 justify-content-end"
                      style={{ width: '100%', gap: '1em' }}
                    >
                      <button
                        type="type"
                        className="chip-button mb-0 c-action-button round"
                        onClick={() => {
                          setShowInviteUserModal(true);
                          setFormMode(h.form.FORM_MODE.ADD);
                        }}
                        style={{ fontSize: '12px', paddingRight: '15px' }}
                      >
                        <IconPlusCircle />
                        Add New User{' '}
                      </button>
                      <button
                        type="button"
                        className="common-button md w-f-content text-normal"
                        onClick={() => setShowResend(true)}
                      >
                        <IconMail width={20} className="mr-2" /> Resend
                        Activation Email
                      </button>
                    </div>
                    <div className="tab-body pt-2">
                      <AgencyUserListing
                        shouldReload={shouldReload}
                        doneReloading={doneReloading}
                        setLoading={setLoading}
                        updateAgencyUsers={setAgencyUsers}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
