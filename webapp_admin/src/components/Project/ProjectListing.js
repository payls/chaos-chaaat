import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import CommonTable from '../Common/CommonTable';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';

import Link from 'next/link';
import { routes } from '../../configs/routes';
import { getCity } from '../../helpers/general';

export default function ProjectListing({
  setLoading,
  isLoading,
  updateParentProjectsCount,
  searchQuery,
  filters,
}) {
  const [projects, setProjects] = useState([]);
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [listingPageCount, setListingPageCount] = useState(0);
  const debouncedQuery = h.general.useDebounce(searchQuery, 700);

  const tableColumns = useMemo(
    () => [
      {
        Header: '',
        accessor: 'logo',
        disableSortBy: true,
        // width: '80px',
        Cell: ({ row: { original } }) => {
          const {
            name, // Local database
            property_header_info_cover_picture_title: projectLogoTitle,
            property_header_info_cover_picture_url: projectLogoUrl,
          } = original;
          const projectImage = new Image();
          projectImage.src = projectLogoUrl;
          let isLandscape = true;
          if (projectImage.height > projectImage.width) {
            isLandscape = false;
          }
          return (
            <>
              {projectLogoUrl ? (
                <img
                  style={
                    isLandscape
                      ? {
                          maxWidth: '100%',
                          height: 'auto',
                        }
                      : {
                          maxHeight: '100px',
                          width: 'auto',
                        }
                  }
                  className="mr-3"
                  src={projectLogoUrl}
                  alt={projectLogoTitle || name}
                />
              ) : (
                <img
                  style={{ height: '5em' }}
                  className="mr-3"
                  src={'https://cdn.yourpave.com/assets/Placeholder_image.png'}
                  alt={projectLogoTitle || name}
                />
              )}
            </>
          );
        },
      },
      {
        Header: 'Project name',
        accessor: 'name',
        filter: 'text',
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const {
            project_id,
            name, // Local database
            id,
            title = {}, // WordPress content site
            property_header_info_cover_picture_title: projectLogoTitle,
            property_header_info_cover_picture_url: projectLogoUrl,
          } = original;
          const projectId = project_id || id;
          const projectName =
            name || (title && title.rendered ? title.rendered : '');
          return (
            <div className="d-flex align-items-center">
              {h.cmpStr(projectId, '257') && (
                <div
                  className="mr-2 p-3 d-flex align-items-center"
                  style={{
                    height: 25,
                    borderRadius: 10,
                    backgroundColor: '#DC5D4B',
                    color: '#ffffff',
                  }}
                >
                  Sample
                </div>
              )}
              <Link
                href={h.getRoute(routes.dashboard['products.edit'], {
                  project_id,
                })}
              >
                <span>
                  <span
                    style={{
                      color: '#4285f4',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {projectName}
                  </span>
                </span>
              </Link>
            </div>
          );
        },
      },
      {
        Header: 'Country',
        // width: '100px',
        accessor: (row) => {
          return getCountry(row.location_google_place_raw);
        },
        filter: 'text',
        Cell: ({ row: { original } }) => {
          return <span>{getCountry(original.location_google_place_raw)}</span>;
        },
      },
      {
        Header: 'Region',
        // width: '100px',
        accessor: (row) => {
          return getCity(row.location_google_place_raw);
        },
        filter: 'text',
        Cell: ({ row: { original } }) => {
          return <span>{getCity(original.location_google_place_raw)}</span>;
        },
      },
      {
        Header: 'Address',
        accessor: (row) => {
          const { location_address_1, location_address_2, location_address_3 } =
            row;
          let fullLocation = `${location_address_1 || ''} ${
            location_address_2 || ''
          } ${location_address_3 || ''}`;
          return <span>{fullLocation}</span>;
        },
        filter: 'text',
        Cell: ({ row: { original } }) => {
          const { location_address_1, location_address_2, location_address_3 } =
            original;
          let fullLocation = `${location_address_1 || ''} ${
            location_address_2 || ''
          } ${location_address_3 || ''}`;
          return <span>{fullLocation}</span>;
        },
      },
      {
        Header: 'Developer name',
        accessor: (row) => {
          const developer = row.project_team_behinds.find(
            (team) => team.type == 'developer',
          );
          return h.isEmpty(developer) ? '' : developer.name;
        },
        sortType: 'text',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { project_team_behinds } = original;
          let developer_name = '';
          if (project_team_behinds && project_team_behinds.length > 0) {
            project_team_behinds.map((team) => {
              if (h.cmpStr(team.type, 'developer')) {
                developer_name = team.name;
              }
            });
          }
          return <span>{developer_name}</span>;
        },
      },
      {
        Header: 'Number of units',
        // width: '90px',
        accessor: (row) => row.project_properties.length,
        sortType: 'number',
        sortDescFirst: true,
        Cell: ({ row: { original } }) => {
          const { project_properties } = original;
          const number_of_units = h.notEmpty(project_properties)
            ? project_properties.filter(
                (property) =>
                  (h.notEmpty(property.unit_number) &&
                    parseInt(property.unit_number) !== 0) ||
                  property.floor !== 0 ||
                  h.notEmpty(property.unit_type) ||
                  (h.notEmpty(property.starting_price) &&
                    parseFloat(property.starting_price) !== 0.0) ||
                  (h.notEmpty(property.sqm) &&
                    parseFloat(property.sqm) !== 0.0) ||
                  property.number_of_bedroom !== 0 ||
                  property.number_of_bathroom !== 0 ||
                  h.notEmpty(property.direction_facing) ||
                  property.number_of_parking_lots !== 0 ||
                  h.notEmpty(property.status),
              ).length
            : 0;
          return <span>{number_of_units}</span>;
        },
      },
      {
        Header: 'Completion Date',
        // width: '90px',
        accessor: (row) =>
          h.isEmpty(row.completion_date) ? '' : row.completion_date,
        filter: 'text',
        sortType: 'date',
        Cell: ({ row: { original } }) => {
          const { completion_date } = original;
          let formattedCompletionDate = !h.date.isDateEmpty(completion_date)
            ? h.date.formateDate(completion_date)
            : '';
          return <span>{formattedCompletionDate}</span>;
        },
      },
      {
        Header: 'Created Date',
        // width: '90px',
        accessor: (row) =>
          h.isEmpty(row.created_date) ? '' : row.created_date,
        filter: 'text',
        sortType: 'date',
        Cell: ({ row: { original } }) => {
          const { created_date } = original;
          let formattedCreatedDate = !h.date.isDateEmpty(created_date)
            ? h.date.formateDate(created_date)
            : '';
          return <span>{formattedCreatedDate}</span>;
        },
      },
      {
        Header: 'Created By',
        // width: '90px',
        accessor: (row) => (h.isEmpty(row.created_by) ? '' : row.created_by),
        filter: 'text',
        disableSortBy: true,
        Cell: ({ row: { original } }) => {
          const { created_by } = original;
          return <span>{created_by}</span>;
        },
      },
    ],
    [],
  );

  const memoizedAllFilter = useMemo(() => {
    return { debouncedQuery, filters };
  }, [JSON.stringify({ debouncedQuery, filters })]);

  useEffect(() => {
    (async () => {
      await getProjects();
    })();
  }, [memoizedAllFilter, listingPageIndex, listingPageSize]);

  useEffect(() => {
    setListingPageIndex(0);
  }, [debouncedQuery, filters]);

  const getCountry = (google_place_raw) => {
    let country = '';
    if (h.notEmpty(google_place_raw)) {
      for (let i = 0; i < google_place_raw.address_components.length; i++) {
        const add_component = google_place_raw.address_components[i];
        if (add_component.types.includes('country')) {
          country = add_component.long_name;
        }
      }
    }
    return country;
  };

  const getProjects = async () => {
    setLoading(true);
    const apiRes = await api.project.getTableList(
      {},
      {
        pageIndex: listingPageIndex,
        pageSize: listingPageSize,
        total: listingPageCount ? listingPageCount : null,
        search: searchQuery,
        ...filters.setFilter,
      },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      setProjects(apiRes.data.projects);
      setListingPageCount(apiRes.data.metadata.pageCount);
      updateParentProjectsCount(apiRes.data.metadata.totalCount);
    }
    setLoading(false);
  };

  return (
    <div>
      {h.notEmpty(projects) && !isLoading ? (
        <CommonResponsiveTable
          overflow="auto"
          columns={tableColumns}
          data={projects}
          options={{
            manualPagination: true,
            pageCount: listingPageCount,
            enableRowSelect: false,
            scrollable: true,
            pageIndex: listingPageIndex,
            pageSize: listingPageSize,
          }}
          setListingPageIndex={setListingPageIndex}
          setListingPageSize={setListingPageSize}
          // sortDirectionHandler={changeSortDirection}
          defaultSortColumn={null}
          thHeight="50px"
          modern={true}
        />
      ) : (
        <div className="d-flex w-100 align-items-center justify-content-center">
          <img
            style={{ width: '65%' }}
            width="100%"
            src="https://cdn.yourpave.com/assets/empty-data-2x.png"
            alt={'profile picture'}
          />
        </div>
      )}
    </div>
  );
}
