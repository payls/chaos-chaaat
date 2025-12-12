import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import CommonTable from '../Common/CommonTable';
import { config } from '../../configs/config';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import {
  faEye,
  faEdit,
  faClipboard,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

export default function SaleListing({
  setLoading,
  shouldReload = false,
  doneReloading,
  updateParentContactLinks,
  searchQuery,
}) {
  const router = useRouter();
  const [contactLinks, setContactLinks] = useState([]);
  const debouncedQuery = h.general.useDebounce(searchQuery, 700);

  const tableColumns = useMemo(
    () => [
      {
        Header: 'Buyer Name',
        accessor: (row) => {
          const fullName = row.first_name + row.last_name;
          return h.isEmpty(fullName) ? '' : fullName;
        },
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          return (
            <div className="user">
              <div>{h.user.formatFullName(original)}</div>
            </div>
          );
        },
      },
      {
        Header: 'Agent name',
        accessor: (row) => {
          const fullName = row.agency_user?.user?.full_name;
          return h.isEmpty(fullName) ? '' : fullName;
        },
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          return (
            <span>{h.user.formatFullName(original.agency_user?.user)}</span>
          );
        },
      },
      {
        Header: 'Created',
        accessor: (row) =>
          h.isEmpty(row.created_date) ? '' : row.created_date,
        filter: 'text',
        sortType: 'date',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { created_date } = original;
          if (h.isEmpty(created_date)) {
            return <span>None</span>;
          }
          const localTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const dateTime = h.date.convertUTCDateToLocalDate(
            created_date + ' GMT',
            localTimezone,
            'en-GB',
            {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            },
          );
          return <span>{dateTime}</span>;
        },
      },
      {
        Header: 'Proposal',
        accessor: '',
        disableSortBy: true,
        Cell: ({ row: { original } }) => {
          const { permalink, contact_id, agency_user, first_name, last_name } =
            original;
          return (
            <div className="user row justify-content-around">
              <CommonTooltip tooltipText="Edit Proposal">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    router.push(
                      h.getRoute(routes.sales.proposal_type_edit, {
                        contact_id: original.contact_id,
                      }),
                      undefined,
                      { shallow: true },
                    )
                  }
                >
                  <FontAwesomeIcon
                    className="table-icon"
                    color="#055349"
                    icon={faEdit}
                  />
                </div>
              </CommonTooltip>
              <CommonTooltip tooltipText="Preview Proposal">
                <div className="d-flex justify-content-center align-items-center">
                  <a
                    href={h.route.createSubdomainUrl(
                      agency_user?.agency?.agency_subdomain,
                      `${config.webUrl}/preview?permalink=${permalink}`,
                    )}
                    target="_blank"
                  >
                    <FontAwesomeIcon
                      className="table-icon"
                      color="#055349"
                      icon={faEye}
                    />
                  </a>{' '}
                </div>
              </CommonTooltip>

              {document.queryCommandSupported('copy') && (
                <CommonTooltip tooltipText="Copy Link">
                  <div className="d-flex justify-content-center">
                    <div
                      className="d-flex justify-content-center align-items-center"
                      onClick={(e) => {
                        copyToClipBoard(
                          h.route.createSubdomainUrl(
                            agency_user?.agency?.agency_subdomain,
                            `${config.webUrl}/${
                              agency_user?.agency?.agency_subdomain
                            }-Proposal-for-${h.user.combineFirstNLastName(
                              first_name,
                              last_name,
                              '-',
                            )}-${permalink}`,
                          ),
                          e,
                        );
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon
                        className="table-icon"
                        color="#055349"
                        icon={faClipboard}
                      />
                    </div>
                  </div>
                </CommonTooltip>
              )}
              <CommonTooltip tooltipText="Delete Proposal">
                <div className="d-flex justify-content-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    onClick={async () => {
                      h.general.prompt(
                        {
                          message:
                            'Are you sure you want to delete this proposal?',
                        },
                        async (status) => {
                          if (status) {
                            setLoading(true);
                            await api.contactLink.deleteContact({ contact_id });
                            await getContactsLinks();
                          }
                        },
                      );
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <FontAwesomeIcon
                      className="table-icon-delete"
                      icon={faTrashAlt}
                    />
                  </div>
                </div>
              </CommonTooltip>
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    (async () => {
      await getContactsLinks();
    })();
  }, []);

  useEffect(() => {
    if (h.cmpBool(shouldReload, true)) {
      (async () => {
        await getContactsLinks();
        doneReloading();
      })();
    }
  }, [shouldReload]);

  useEffect(() => {
    if (!h.isEmpty(debouncedQuery)) {
      searchContactsLinks(searchQuery);
    } else {
      getContactsLinks();
    }
  }, [debouncedQuery]);

  const getContactsLinks = async () => {
    setLoading(true);
    const apiRes = await api.contactLink.findAll({}, {}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      const contactsToShow = apiRes.data.contacts.filter((contact) =>
        h.notEmpty(contact.permalink),
      );
      setContactLinks(contactsToShow);
      if (updateParentContactLinks) updateParentContactLinks(contactsToShow);
    }
    setLoading(false);
  };

  const searchContactsLinks = async (query) => {
    const apiRes = await api.contactLink.getUniquePermaLink(
      {},
      { query: query },
      false,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      const contactsToShow = apiRes.data.contacts.filter((contact) =>
        h.notEmpty(contact.permalink),
      );
      setContactLinks(contactsToShow);
      if (updateParentContactLinks) updateParentContactLinks(contactsToShow);
    }
  };

  const copyToClipBoard = async (permalink, e) => {
    if (e) e.preventDefault();
    if (!navigator.clipboard) {
      return console.log('copy not supported');
    }
    try {
      await navigator.clipboard.writeText(permalink);
      h.general.alert('success', { message: 'Copied!', autoCloseInSecs: 1 });
    } catch (err) {
      h.general.alert('error', { message: 'Copy failed', autoCloseInSecs: 1 });
    }
  };

  return (
    <div>
      {h.notEmpty(contactLinks) ? (
        <CommonTable columns={tableColumns} data={contactLinks} />
      ) : (
        <div className="d-flex w-100 align-items-center justify-content-center">
          <img
            style={{ width: '65%' }}
            width="100%"
            src="https://cdn.yourpave.com/assets/links-empty.png"
            alt={'link not found'}
          />
        </div>
      )}
    </div>
  );
}
