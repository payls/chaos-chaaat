import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import CommonTable from '../Common/CommonTable';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import { config } from '../../configs/config';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import { faFilePdf, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

export default function ReportListing({
  setLoading,
  shouldReload = false,
  doneReloading,
  updateParentReports,
}) {
  const router = useRouter();
  const [reports, setReports] = useState([]);

  const tableColumns = useMemo(
    () => [
      {
        Header: 'Created By',
        accessor: (row) => {
          const user = row.agency_user.user;
          const fullName = h.user.formatFullName(user)
            ? h.user.formatFullName(user)
            : 'None';
          return fullName;
        },
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const user = original.agency_user.user;
          const fullName = h.user.formatFullName(user)
            ? h.user.formatFullName(user)
            : 'None';
          return <span>{fullName}</span>;
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
        Header: 'From',
        accessor: (row) => (h.isEmpty(row.from) ? '' : row.from),
        filter: 'text',
        sortType: 'date',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { from } = original;
          let dateTime = new Date(from);
          return (
            <span>
              {dateTime.toLocaleString('en-GB', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              })}
            </span>
          );
        },
      },
      {
        Header: 'To',
        accessor: (row) => (h.isEmpty(row.to) ? '' : row.to),
        filter: 'text',
        sortType: 'date',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { to } = original;
          let dateTime = new Date(to);
          return (
            <span>
              {dateTime.toLocaleString('en-GB', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              })}
            </span>
          );
        },
      },
      {
        Header: ' ',
        accessor: '',
        disableSortBy: true,
        Cell: ({ row: { original } }) => {
          const { agency_report_id, url } = original;
          return (
            <div className="user row justify-content-around">
              <CommonTooltip tooltipText="Download as PDF">
                <div className="d-flex justify-content-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      h.download.downloadWithFileName(
                        url,
                        constant.UPLOAD.TYPE.REPORT,
                      )
                    }
                  >
                    <FontAwesomeIcon className="table-icon" icon={faFilePdf} />
                  </div>
                </div>
              </CommonTooltip>
              <CommonTooltip tooltipText="Delete Report">
                <div className="d-flex justify-content-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    onClick={async () => {
                      h.general.prompt(
                        {
                          message:
                            'Are you sure you want to delete this report?',
                        },
                        async (status) => {
                          if (status) {
                            setLoading(true);
                            await api.agencyReport.deleteReport({
                              agency_report_id,
                            });
                            await getReports();
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
      await getReports();
    })();
  }, []);

  useEffect(() => {
    if (h.cmpBool(shouldReload, true)) {
      (async () => {
        await getReports();
        doneReloading();
      })();
    }
  }, [shouldReload]);

  const getReports = async () => {
    setLoading(true);

    const apiRes = await api.agencyReport.findAll({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setReports(apiRes.data.reports);
      if (updateParentReports) updateParentReports(apiRes.data.reports);
    } else {
      h.general.alert('error', { message: apiRes.data.message });
    }

    setLoading(false);
  };

  return (
    <div>
      {h.notEmpty(reports) ? (
        <CommonResponsiveTable columns={tableColumns} data={reports} />
      ) : (
        <div className="d-flex w-100 align-items-center justify-content-center">
          <img
            style={{ width: '65%' }}
            width="100%"
            src="https://cdn.yourpave.com/assets/links-empty.png"
          />
        </div>
      )}
    </div>
  );
}
