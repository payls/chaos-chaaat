import React, { useEffect, useState, useRef, useMemo } from 'react';
import { faCalendar, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import CommonSearchInput from '../Sale/Link/preview/components/Common/CommonSearchInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';
import CommonDropdownActions from '../Common/CommonDrodownAction';
import IconRadioToggled from '../Icons/IconRadioToggled';
import IconRadioUnToggled from '../Icons/IconRadioUnToggled';
import useSalesforceStore from '../../components/Salesforce/store';

const tableHeaders = [
  'Report Name',
  'Description',
  'Folder',
  'Created By',
  'Created On',
  'Action',
];

function ToggleRadioComponent({ onHandleClick, Id }) {
  const [s, setState] = useState(false);
  const { linkDetails } = useSalesforceStore();

  const Component =
    Id === linkDetails?.report_id ? IconRadioToggled : IconRadioUnToggled;
  return (
    <Component
      className={
        Id === linkDetails?.report_id ? 'img-checked' : 'img-unchecked'
      }
      style={{ cursor: 'pointer' }}
      onClick={() => {
        onHandleClick();
      }}
    />
  );
}

export default React.memo(({ agency }) => {
  const router = useRouter();
  const { list } = router.query;
  const { setStoreLinkDetails, linkDetails } = useSalesforceStore();
  const [isLoading, setLoading] = useState(constant.API_STATUS.IDLE);
  const [reports, setReports] = useState([]);

  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [listingPageCount, setListingPageCount] = useState(0);
  // default sort by created date
  const [sortInfo, setSortInfo] = useState({
    columnId: null,
    columnHeader: null,
    order: null,
  });
  const [date, setDate] = useState(null);

  const initialColumns = [
    {
      id: 'action_radio',
      Header: '',
      accessor: '',
      disableSortBy: true,
      headerWidth: '50px',
      Cell: ({ row: { original } }) => {
        return (
          <div
            style={{
              textAlign: 'center',
              display: 'inline-block',
              width: '100%',
            }}
          >
            <ToggleRadioComponent
              Id={original.Id}
              onHandleClick={(s) => {
                setStoreLinkDetails({
                  ...linkDetails,
                  report_id: original.Id,
                  report_name: original.Name,
                });
              }}
            />
          </div>
        );
      },
    },
    {
      id: 's_report_name',
      Header: 'Report Name',
      accessor: 'Name',
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        return original.Name ?? '-';
      },
    },
    {
      id: 's_description',
      Header: 'Description',
      accessor: 'Description',
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        return original.Description ?? '-';
      },
    },
    {
      id: 's_folder',
      Header: 'Folder',
      accessor: 'FolderName',
      filter: 'text',
      Cell: ({ row: { original } }) => {
        return original.FolderName ?? '-';
      },
    },
    {
      id: 's_created_by',
      Header: 'Created By',
      accessor: 'CreatedByName',
      filter: 'text',
      Cell: ({ row: { original } }) => {
        return original.CreatedByName ?? '-';
      },
    },
    {
      id: 's_created_date',
      Header: 'Create On',
      accessor: 'CreatedDate',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { CreatedDate } = original;
        if (CreatedDate) {
          const localTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const dateTime = h.date.convertUTCDateToLocalDate(
            CreatedDate,
            localTimezone,
            'en-AU',
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
        }

        return <span>-</span>;
      },
    },
  ];

  const [columns, setColumns] = useState(initialColumns);

  const tableColumns = useMemo(() => columns, [columns]);
  const [searchForm, setSearchForm] = useState({
    query: '',
    // startDate: null,
    // endDate: null,
  });

  function getListAction(data) {
    const listActionsArr = [];

    listActionsArr.push({
      label: 'Add and create list',
      icon: faUserPlus,
      action: () => {
        router.push(
          h.getRoute(routes.salesforce.mapping, {
            report_id: data.Id,
            report_name: data.Name,
            // list,
          }),
          undefined,
          { shallow: true },
        );
      },
    });

    return listActionsArr;
  }
  const changeSortDirection = (header, direction) => {
    const replicateColumns = columns;

    if (h.general.notEmpty(sortInfo.columnId)) {
      const previousColumnIndex = columns.findIndex(
        (column) => column.Header === sortInfo.columnHeader,
      );
      replicateColumns[previousColumnIndex].sortDirection = '';
    }

    const columnIndex = columns.findIndex((column) => column.Header === header);
    replicateColumns[columnIndex].sortDirection = direction;

    setColumns([...replicateColumns]);
    setSortInfo({
      columnId: replicateColumns[columnIndex].id,
      columnHeader: replicateColumns[columnIndex].Header,
      order: direction,
    });
  };

  useEffect(() => {
    (async () => {
      await getReports();
    })();
  }, []);

  async function getReports() {
    setLoading(constant.API_STATUS.PENDING);

    const apiRes = await api.contact.getSalesforceReports(agency.agency_id);

    if (h.cmpStr(apiRes.status, 'ok')) {
      setReports(apiRes.data.reports);
    }

    setLoading(constant.API_STATUS.FULLFILLED);
  }

  function filterData() {
    return reports.filter(
      (f) =>
        f.Name?.toLowerCase().includes(searchForm.query.toLowerCase()) ||
        f.Description?.toLowerCase().includes(searchForm.query.toLowerCase()) ||
        f.FolderName?.toLowerCase().includes(searchForm.query.toLowerCase()) ||
        f.CreatedByName?.toLowerCase().includes(searchForm.query.toLowerCase()),
    );
  }
  return (
    <>
      <div
        className="d-flex flex-row align-items-center contact-filter-wrapper "
        style={{ gap: '1em' }}
      >
        <CommonSearchInput
          isLoading={isLoading === constant.API_STATUS.PENDING}
          callback={(e) => {
            setSearchForm((s) => ({ ...s, query: e }));
          }}
          placeholder={'Search report..'}
          className={``}
        />
        {/* <div className="contact-filter date-filter pos-rlt">
          <DatePicker
            selected={searchForm.startDate}
            onChange={(date) =>
              setSearchForm((s) => ({ ...s, startDate: date }))
            }
            dateFormat="MMMM d, yyyy"
            className="form-item"
            onKeyDown={(e) => {
              e.preventDefault();
            }}
            placeholderText="Select start date and time"
          />
          <span className="ap-icon">
            <FontAwesomeIcon
              icon={faCalendar}
              color="#636363"
              style={{
                marginRight: '10px',
                marginLeft: '10px',
                cursor: 'pointer',
              }}
            />
          </span>
        </div>
        <div className="contact-filter date-filter pos-rlt">
          <DatePicker
            selected={searchForm.endDate}
            onChange={(date) => setSearchForm((s) => ({ ...s, endDate: date }))}
            dateFormat="MMMM d, yyyy"
            className="form-item"
            onKeyDown={(e) => {
              e.preventDefault();
            }}
            placeholderText="Select end date and time"
            minDate={searchForm.startDate}
          />
          <span className="ap-icon">
            <FontAwesomeIcon
              icon={faCalendar}
              color="#636363"
              style={{
                marginRight: '10px',
                marginLeft: '10px',
                cursor: 'pointer',
              }}
            />
          </span>
        </div> */}
        {/* <div className="contact-filter ">
          <button
            type="button"
            className="common-button black-bg"
            style={{ padding: '10px' }}
            onClick={search}
          >
            Apply filters
          </button>
        </div> */}
      </div>
      <div className="new-table">
        {isLoading === constant.API_STATUS.PENDING && (
          <FullTableLoading headers={tableHeaders} rowsCount={10} />
        )}

        {h.notEmpty(reports) &&
          isLoading === constant.API_STATUS.FULLFILLED && (
            <CommonResponsiveTable
              overflow="auto"
              columns={tableColumns}
              data={filterData()}
              options={{
                manualPagination: false,
                pageCount: listingPageCount,
                enableRowSelect: false,
                scrollable: true,
                pageIndex: listingPageIndex,
                pageSize: listingPageSize,
              }}
              setListingPageIndex={setListingPageIndex}
              setListingPageSize={setListingPageSize}
              sortDirectionHandler={changeSortDirection}
              defaultSortColumn={null}
              thHeight="50px"
              modern={true}
            />
          )}

        {h.isEmpty(reports) && isLoading === constant.API_STATUS.FULLFILLED && (
          <div
            className="d-flex w-100 align-items-center justify-content-center flex-column"
            style={{ gap: '2em', marginTop: '100px' }}
          >
            <img
              style={{ width: '40%' }}
              width="100%"
              src="https://cdn.yourpave.com/assets/empty-data-2x.png"
              alt={'profile picture'}
            />
            No Salesforce reports yet.
          </div>
        )}
      </div>
    </>
  );
});
