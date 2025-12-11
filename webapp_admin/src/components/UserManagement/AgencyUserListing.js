import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { h } from '../../helpers';
import { api } from '../../api';
import CommonTable from '../Common/CommonTable';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
const constant = require('../../constants/constant.json');
import {
  faEye,
  faPlusSquare,
  faEdit,
  faClipboard,
  faTrashAlt,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import useUserManagementStore from './store';

export default function AgencyUserListing({
  setLoading,
  shouldReload = false,
  doneReloading,
  updateAgencyUsers,
}) {
  const { setUsers } = useUserManagementStore();
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const isNotCurrentUser = (userId) => {
    if (!currentUser) return false;
    return userId !== currentUser.user_fk;
  };

  const getFirstInitials = (firstname, lastname) => {
    let firstInitial;
    let secondInitial;

    if (h.general.notEmpty(firstname)) {
      firstInitial = firstname.charAt(0).toUpperCase();
    } else {
      firstInitial = '';
    }

    if (h.general.notEmpty(lastname)) {
      secondInitial = lastname.charAt(0).toUpperCase();
    } else {
      secondInitial = '';
    }
    return firstInitial + secondInitial;
  };

  function ToggleCheckboxComponent({ onHandleClick, Id }) {
    const { users } = useUserManagementStore();

    return (
      <img
        src={
          users.includes(Id)
            ? 'https://cdn.yourpave.com/assets/toggled.png'
            : 'https://cdn.yourpave.com/assets/untoggled.png'
        }
        className={users.includes(Id) ? 'img-checked' : 'img-unchecked'}
        width={25}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          onHandleClick(users);
        }}
      />
    );
  }

  const tableColumns = useMemo(
    () => [
      {
        id: 'action_radio',
        Header: '',
        accessor: '',
        disableSortBy: true,
        headerWidth: '50px',
        Cell: ({ row: { original } }) => {
          const { status } = handleStatus(original.user.status);
          return (
            <div
              style={{
                textAlign: 'center',
                width: '100%',
                display: status === 'PENDING' ? 'inline-block' : 'none',
              }}
            >
              <ToggleCheckboxComponent
                Id={original.agency_user_id}
                onHandleClick={(c) => {
                  if (!c.includes(original.agency_user_id)) {
                    setUsers([...c, original.agency_user_id]);
                  } else {
                    setUsers(c.filter((i) => i !== original.agency_user_id));
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        Header: 'Name',
        accessor: (row) => h.user.formatFullName(row.user),
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          return (
            <div className={'user'}>
              <div
                className="d-flex align-items-center"
                style={{ gap: '0.4em' }}
              >
                {!original.user.profile_picture_url.includes(
                  'profile_picture_placeholder.png',
                ) ? (
                  <img
                    src={original.user.profile_picture_url}
                    style={{ width: '40px', height: '40px' }}
                    alt={'user_profile_picture'}
                  />
                ) : (
                  <span
                    className="rounded-circle profile-picture"
                    style={{
                      height: 40,
                      width: 40,
                      fontSize: '14px',
                    }}
                  >
                    {getFirstInitials(
                      original.user.first_name,
                      original.user.last_name,
                    )}
                  </span>
                )}
                <span>{h.user.formatFullName(original.user)}</span>
              </div>
            </div>
          );
        },
      },
      {
        Header: 'User Type',
        accessor: (row) => row.user.user_roles[0].user_role.split('_')[1],
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          return (
            <span>
              {original.user.user_roles[0].user_role.split('_')[0] === 'super'
                ? 'Super Admin'
                : h.general.sentenceCase(
                    original.user.user_roles[0].user_role.split('_')[1],
                  )}
            </span>
          );
        },
      },
      {
        Header: 'Email',
        accessor: 'email',
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          return <span>{original.user.email}</span>;
        },
      },
      {
        Header: 'Last Seen',
        accessor: (row) =>
          h.isEmpty(row.user.last_seen) ? '' : row.user.last_seen,
        filter: 'text',
        sortType: 'date',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { last_seen } = original.user;
          if (h.isEmpty(last_seen)) {
            return <span>None</span>;
          }
          const lastSeenFormatted =
            h.date.timeSince(new Date(last_seen)) == 'Now'
              ? 'Now'
              : h.date.timeSince(new Date(last_seen)) + ' ago';
          return <span>{lastSeenFormatted}</span>;
        },
      },
      {
        Header: 'Status',
        accessor: (row) => handleStatus(row.user.status)?.status,
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { status, color } = handleStatus(original.user.status);
          return (
            <span style={{ color }}>{h.general.sentenceCase(status)}</span>
          );
        },
      },
      {
        Header: 'Action',
        Cell: ({ row: { original } }) => {
          return isNotCurrentUser(original.user_fk) ? (
            <div className="user row justify-content-around">
              <CommonTooltip tooltipText="Delete User">
                <div
                  className="d-flex justify-content-center"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleDeleteUserPrompt(original.user_fk);
                  }}
                >
                  <DeleteIcon />
                </div>
              </CommonTooltip>
            </div>
          ) : null;
        },
      },
    ],
    [isNotCurrentUser],
  );

  const handleStatus = (status) => {
    const statusMap = {
      [constant.USER.STATUS.INACTIVE]: { status: 'PENDING', color: '#FBBC04' },
      [constant.USER.STATUS.DELETED]: { status: 'DISABLED', color: '#DEDEDE' },
    };
    return statusMap[status] || { status: 'ACTIVE', color: '#4877FF' };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await getAgencyUsers();
      setLoading(false);

      if (!currentUser) await getCurrentUser();
    })();
  }, [currentUser]);

  useEffect(() => {
    if (h.cmpBool(shouldReload, true)) {
      (async () => {
        setLoading(true);
        await getAgencyUsers();
        await getCurrentUser();
        setLoading(false);
        doneReloading();
      })();
    }
  }, [shouldReload]);

  const getAgencyUsers = async () => {
    const apiRes = await api.userManagement.findAll({}, {}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setAgencyUsers(
        apiRes.data.agency_users.filter(
          (agency_user) => agency_user.user !== null,
        ), // in case some users do not exist
      );
      if (updateAgencyUsers) updateAgencyUsers(apiRes.data.agency_users);
    }
  };

  const getCurrentUser = async () => {
    const currentUserRes = await api.agencyUser.getCurrentUserAgency({}, false);
    if (h.cmpStr(currentUserRes.status, 'ok')) {
      setCurrentUser(currentUserRes.data.agencyUser);
    }
  };

  const handleDeleteUser = async (user_id) => {
    setLoading(true);
    const deleteRes = await api.userManagement.deleteUser({ user_id }, true);
    if (h.cmpStr(deleteRes.status, 'ok')) {
      await getAgencyUsers();
    }
    setLoading(false);
  };

  const handleDeleteUserPrompt = async (user_id) => {
    h.general.prompt(
      {
        message: `Please confirm you're happy to delete this user?`,
      },
      async (status) => {
        if (status) {
          handleDeleteUser(user_id);
        }
      },
    );
  };

  const DeleteIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 5.5H20"
          stroke="#333333"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 2.5H15"
          stroke="#333333"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 8.5H18V20C18 20.8285 17.3285 21.5 16.5 21.5H7.5C6.67155 21.5 6 20.8285 6 20V8.5Z"
          stroke="#333333"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  };
  return (
    <div>
      {h.notEmpty(agencyUsers) ? (
        <div className="new-table">
          <CommonResponsiveTable
            columns={tableColumns}
            data={agencyUsers}
            options={{ enableRowSelect: false, newCheckBox: true }}
            thHeight="50px"
            modern={true}
          />
        </div>
      ) : (
        <p> You have No agency users registered. </p>
      )}
    </div>
  );
}
