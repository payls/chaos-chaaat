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
import useHubSpotStore from '../../components/HubSpot/store';

function ToggleRadioComponent({ onHandleClick, Id }) {
  const [s, setState] = useState(false);
  const { linkDetails } = useHubSpotStore();
  

  const Component =
    Id === linkDetails?.list_id ? IconRadioToggled : IconRadioUnToggled;
  return (
    <Component
      className={
        Id === linkDetails?.list_id ? 'img-checked' : 'img-unchecked'
      }
      style={{ cursor: 'pointer' }}
      onClick={() => {
        onHandleClick();
      }}
    />
  );
}

const tableHeaders = [
  'List Name',
  'List Size',
  'Processing Type',
  'Created On',
];

export default React.memo(({ agency }) => {
  const [isLoading, setLoading] = useState(constant.API_STATUS.IDLE);
  const { setStoreLinkDetails, linkDetails } = useHubSpotStore();
  const [list, setList] = useState([]);
  const [listFilter, setListFilter] = useState({
    agency_id: agency.agency_id,
    name: '',
  });

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

  async function getHubSpotContactList() {
    setLoading(constant.API_STATUS.PENDING);

    const apiRes = await api.contact.getHubSpotContactList(listFilter);

    if (h.cmpStr(apiRes.status, 'ok')) {
      setList(apiRes.data.list);
    }

    setLoading(constant.API_STATUS.FULLFILLED);
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
      await getHubSpotContactList();
    })();
  }, [listFilter]);

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
              Id={original.listId}
              onHandleClick={(s) => {
                setStoreLinkDetails({
                  ...linkDetails,
                  list_id: original.listId,
                  list_name: original.name,
                });
              }}
            />
          </div>
        );
      },
    },
    {
      id: 'name',
      Header: 'List Name',
      accessor: 'name',
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        return original.name ?? '-';
      },
    },
    {
      id: 'list_size',
      Header: 'List Size',
      accessor: 'hs_list_size',
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { additionalProperties } = original;
        const { hs_list_size } = additionalProperties;
        return hs_list_size ?? '-';
      },
    },
    {
      id: 'processingType',
      Header: 'Processing Type',
      accessor: 'processingType',
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        return original.processingType ?? '-';
      },
    },
    {
      id: 'createdAt',
      Header: 'Created On',
      accessor: 'createdAt',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { createdAt } = original;
        if (createdAt) {
          const localTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const dateTime = h.date.convertUTCDateToLocalDate(
            createdAt,
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

  return (
    <>
      <div
        className="d-flex flex-row align-items-center contact-filter-wrapper "
        style={{ gap: '1em' }}
      >
        <CommonSearchInput
          isLoading={isLoading === constant.API_STATUS.PENDING}
          callback={(e) => {
            setListFilter((s) => ({ ...s, name: e }));
          }}
          placeholder={'Search list..'}
          className={``}
        />
      </div>
      <div className="new-table">
        {isLoading === constant.API_STATUS.PENDING && (
          <FullTableLoading headers={tableHeaders} rowsCount={10} />
        )}

        {h.notEmpty(list) &&
          isLoading === constant.API_STATUS.FULLFILLED && (
            <CommonResponsiveTable
              overflow="auto"
              columns={tableColumns}
              data={list}
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

        {h.isEmpty(list) && isLoading === constant.API_STATUS.FULLFILLED && (
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
            No HubSpot lists found.
          </div>
        )}
      </div>
    </>
  );
});