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
import moment from 'moment';
import useSalesforceStore from '../../components/Salesforce/store';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';
import CommonSelect from '../Common/CommonSelect';

const tableHeaders = ['First Name', 'Last Name', 'Email', 'Created Date'];

function ToggleCheckboxComponent({ onHandleClick, Id }) {
  const { contactsArray } = useSalesforceStore();

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

export default React.memo(({ agency }) => {
  const [isLoading, setLoading] = useState(constant.API_STATUS.IDLE);
  const { addContactsToImport, contactsArray, setSFObject } =
    useSalesforceStore();
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
    // startDate: new Date(moment('March 23, 2000').startOf('month')),
    startDate: new Date(moment().startOf('month')),
    endDate: new Date(moment().endOf('month')),
    sfObject: {
      label: 'Contact',
      value: 'Contact',
    },
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
              Id={original.Id}
              onHandleClick={(c) => {
                if (!c.includes(original.Id)) {
                  addContactsToImport([...c, original.Id]);
                } else {
                  addContactsToImport(c.filter((i) => i !== original.Id));
                }
              }}
            />
          </div>
        );
      },
    },
    {
      id: 's_first_name',
      Header: 'First Name',
      accessor: 'FirstName',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        return original.FirstName;
      },
    },
    {
      id: 's_last_name',
      Header: 'Last Name',
      accessor: 'LastName',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        return original.LastName;
      },
    },
    {
      id: 's_mobile_number',
      Header: 'Phone Number',
      accessor: 'MobilePhone',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        return original.MobilePhone;
      },
    },
    {
      id: 's_email',
      Header: 'Email',
      accessor: 'Email',
      disableSortBy: true,
      filter: 'text',
      Cell: ({ row: { original } }) => {
        return original.Email;
      },
    },
    {
      id: 's_created_date',
      Header: 'Create On',
      accessor: 'CreatedDate',
      disableSortBy: true,
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

    const apiRes = await api.contact.getSalesforceContacts(agency.agency_id, {
      startDate: moment(searchForm.startDate).toISOString(),
      endDate: moment(searchForm.endDate).toISOString(),
      count: listingPageSize,
      pageNumber: listingPageIndex + 1,
      sfObject: searchForm.sfObject.value,
    });

    if (h.cmpStr(apiRes.status, 'ok')) {
      setContacts(apiRes.data.records);
      setListingPageIndex(apiRes.data.pageNumber - 1);
      setListingPageSize(apiRes.data.count);
      setListingPageCount(
        Math.round(apiRes.data.totalSize / apiRes.data.count),
      );
    }

    setLoading(constant.API_STATUS.FULLFILLED);
  }

  async function search() {
    if (
      h.isEmpty(searchForm.sfObject) ||
      h.isEmpty(searchForm.startDate) ||
      h.isEmpty(searchForm.endDate)
    ) {
      h.general.alert('error', {
        message: 'Invalid Start Date/End Date/SF Object',
      });
      return;
    }

    setLoading(constant.API_STATUS.PENDING);

    const apiRes = await api.contact.getSalesforceContacts(agency.agency_id, {
      startDate: moment(searchForm.startDate).toISOString(),
      endDate: moment(searchForm.endDate).toISOString(),
      count: listingPageSize,
      pageNumber: 1,
      sfObject: searchForm.sfObject.value,
      search: searchForm.query,
    });

    if (h.cmpStr(apiRes.status, 'ok')) {
      setContacts(apiRes.data.records);
      setListingPageIndex(0);
      setListingPageCount(
        Math.round(apiRes.data.totalSize / apiRes.data.count),
      );
      addContactsToImport([]);
    }

    setLoading(constant.API_STATUS.FULLFILLED);
  }

  function selectAll() {
    const newSelected = contacts
      .map((m) => m.Id)
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
        </div>
        <div className="contact-filter " style={{ width: '250px' }}>
          <CommonSelect
            id="select_country"
            options={[
              {
                label: 'Contact',
                value: 'Contact',
              },
              {
                label: 'Lead',
                value: 'Lead',
              },
            ]}
            value={searchForm.sfObject}
            isSearchable={true}
            onChange={(v) => {
              setSFObject(v);
              setSearchForm((s) => ({ ...s, sfObject: v }));
            }}
            placeholder="Select Salesforce Object"
            className=""
            control={{
              height: 40,
              minHeight: 40,
              borderRadius: 8,
            }}
            isClearable={true}
          />
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
