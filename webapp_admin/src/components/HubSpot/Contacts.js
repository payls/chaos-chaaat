import React, { useEffect, useState, useRef, useMemo } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import { h } from '../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import CommonSearchInput from '../Sale/Link/preview/components/Common/CommonSearchInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import moment from 'moment-timezone';
import useHubSpotStore from '../../components/HubSpot/store';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';
import CommonSelect from '../Common/CommonSelect';

const tableHeaders = ['First Name', 'Last Name', 'Email', 'Created Date'];

function ToggleCheckboxComponent({ onHandleClick, Id }) {
  const { contactsArray } = useHubSpotStore();

  return (
    <img
      src={
        contactsArray.includes(Id)
          ? 'https://cdn.yourpave.com/assets/toggled.png'
          : 'https://cdn.yourpave.com/assets/untoggled.png'
      }
      className={contactsArray.includes(Id) ? 'img-checked' : 'img-unchecked'}
      width={25}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        onHandleClick(contactsArray);
      }}
    />
  );
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default React.memo(({ agency }) => {
  const [isLoading, setLoading] = useState(constant.API_STATUS.IDLE);
  const { addContactsToImport, contactsArray } =
  useHubSpotStore();
  const [contacts, setContacts] = useState([]);
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

  const [searchForm, setSearchForm] = useState({
    query: null,
    startDate: moment.tz(timezone).startOf('month').startOf('day').toDate(),
    endDate: moment.tz(timezone).endOf('month').endOf('day').toDate(),
  });

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
            <ToggleCheckboxComponent
              Id={original.id}
              onHandleClick={(c) => {
                if (!c.includes(original.id)) {
                  addContactsToImport([...c, original.id]);
                } else {
                  addContactsToImport(c.filter((i) => i !== original.id));
                }
              }}
            />
          </div>
        );
      },
    },
    {
      id: 'firstname',
      Header: 'First Name',
      accessor: 'firstname',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        const {properties: {firstname}} = original;
        return firstname;
      },
    },
    {
      id: 'lastname',
      Header: 'Last Name',
      accessor: 'lastname',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        const {properties: {lastname}} = original;
        return lastname;
      },
    },
    {
      id: 'mobilephone',
      Header: 'Phone Number',
      accessor: 'mobilephone',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        const {properties: {phone, mobilephone}} = original;
        return mobilephone ?? phone;
      },
    },
    {
      id: 'email',
      Header: 'Email',
      accessor: 'email',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        const {properties: {email}} = original;
        return email;
      },
    },
    {
      id: 'createdate',
      Header: 'Create On',
      accessor: 'createdate',
      disableSortBy: true,
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const {properties: {createdate}} = original;
        if (createdate) {
          const localTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const dateTime = h.date.convertUTCDateToLocalDate(
            createdate,
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
      await getContacts();
    })();
  }, [listingPageIndex, listingPageSize]);

  async function getContacts() {
    setLoading(constant.API_STATUS.PENDING);
    const apiRes = await api.contact.getHubSpotContacts(agency.agency_id, {
      startDate: moment.tz(searchForm.startDate, timezone).format('YYYY-MM-DD'),
      endDate: moment.tz(searchForm.endDate, timezone).format('YYYY-MM-DD'),
      count: listingPageSize,
      pageNumber: listingPageIndex + 1,
    });

    if (h.cmpStr(apiRes.status, 'ok')) {
      setContacts(apiRes.data.records);
      setListingPageIndex(apiRes.data.pageNumber - 1);
      setListingPageSize(apiRes.data.count);
      setListingPageCount(
        Math.ceil(apiRes.data.totalSize / apiRes.data.count),
      );
    }

    setLoading(constant.API_STATUS.FULLFILLED);
  }

  async function search() {
    if (
      h.isEmpty(searchForm.startDate) ||
      h.isEmpty(searchForm.endDate)
    ) {
      h.general.alert('error', {
        message: 'Invalid Start Date/End Date',
      });
      return;
    }

    setLoading(constant.API_STATUS.PENDING);
    const apiRes = await api.contact.getHubSpotContacts(agency.agency_id, {
      startDate: moment.tz(searchForm.startDate, timezone).format('YYYY-MM-DD'),
      endDate: moment.tz(searchForm.endDate, timezone).format('YYYY-MM-DD'),
      count: listingPageSize,
      pageNumber: 1,
      search: searchForm.query,
    });

    if (h.cmpStr(apiRes.status, 'ok')) {
      setContacts(apiRes.data.records);
      setListingPageIndex(0);
      setListingPageCount(
        Math.ceil(apiRes.data.totalSize / apiRes.data.count),
      );
      addContactsToImport([]);
    }

    setLoading(constant.API_STATUS.FULLFILLED);
  }

  function selectAll() {
    const newSelected = contacts
      .map((m) => m.id)
      .filter((f) => !contactsArray.includes(f));

    addContactsToImport([...contactsArray, ...newSelected]);
  }

  return (
    <>
      <div
        className="d-flex flex-row align-items-center contact-filter-wrapper"
        style={{ gap: '1em' }}
      >
        <CommonSearchInput
          isLoading={isLoading === constant.API_STATUS.PENDING}
          callback={(e) => {
            setSearchForm((s) => ({ ...s, query: e }));
          }}
          placeholder={'Generate your search here'}
          className={``}
        />
        <div className="contact-filter date-filter pos-rlt">
          <DatePicker
            selected={searchForm.startDate}
            onChange={(date) =>
              setSearchForm((s) => ({ ...s, startDate: date, endDate: null }))
            }
            dateFormat="MMMM d, yyyy"
            className="form-item"
            onKeyDown={(e) => {
              e.preventDefault();
            }}
            placeholderText="Select start date"
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
            placeholderText="Select end date"
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
        </div>
        <div className="contact-filter ">
          <button
            type="button"
            className="common-button black-bg"
            style={{ padding: '10px' }}
            onClick={search}
          >
            Apply filters
          </button>
        </div>
        {h.notEmpty(contacts) &&
          isLoading === constant.API_STATUS.FULLFILLED && (
            <div className="contact-filter ">
              <button
                type="button"
                className="common-button"
                style={{ padding: '10px' }}
                onClick={selectAll}
              >
                Select All
              </button>
            </div>
          )}
      </div>
      <div className="new-table">
        {h.notEmpty(contacts) &&
          isLoading === constant.API_STATUS.FULLFILLED && (
            <CommonResponsiveTable
              overflow="auto"
              columns={tableColumns}
              data={contacts}
              options={{
                manualPagination: true,
                pageCount: listingPageCount,
                enableRowSelect: false,
                scrollable: true,
                pageIndex: listingPageIndex,
                pageSize: listingPageSize,
                newCheckBox: true,
              }}
              setListingPageIndex={setListingPageIndex}
              setListingPageSize={setListingPageSize}
              sortDirectionHandler={changeSortDirection}
              defaultSortColumn={null}
              thHeight="50px"
              modern={true}
            />
          )}
        {isLoading === constant.API_STATUS.PENDING && (
          <FullTableLoading headers={tableHeaders} rowsCount={10} />
        )}
        {h.isEmpty(contacts) &&
          isLoading === constant.API_STATUS.FULLFILLED && (
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
              No Salesforce contacts yet.
            </div>
          )}
      </div>
    </>
  );
});
