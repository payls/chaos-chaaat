import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import {
  useTable,
  useFilters,
  usePagination,
  useSortBy,
  useResizeColumns,
  useFlexLayout,
  useRowSelect,
  useGlobalFilter,
} from 'react-table';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    if (h.notEmpty(preFilteredRows)) {
      preFilteredRows.forEach((row) => {
        options.add(row.values[id]);
      });
    }
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, newCheckBox, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return !newCheckBox ? (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    ) : (
      <div className="report-mapping">
        <div className="col">
          <label className={`cont`} style={{ margin: '0px', fontSize: '10px' }}>
            <input type="checkbox" ref={resolvedRef} {...rest} />
            <img
              className="img-unchecked"
              src="https://cdn.yourpave.com/assets/untoggled.png"
              width={25}
            />
            <img
              className="img-checked"
              src="https://cdn.yourpave.com/assets/toggled.png"
              width={25}
            />
          </label>
        </div>
      </div>
    );
  },
);

const CommonResponsiveTable = React.forwardRef(function CommonResponsiveTable(
  {
    overflow = 'inherit',
    columns,
    data,
    noDataText = 'No records yet',
    options = {
      manualPagination: false,
      pageCount: undefined, // not required if manualPagination === false
      enableRowSelect: false,
      scrollable: false,
      pageIndex: undefined, // not required if manualPagination === false
      pageSize: undefined, // not required if manualPagination === false
      newCheckBox: false,
    },
    setListingPageIndex = () => {}, // not required if manualPagination === false
    setListingPageSize = () => {}, // not required if manualPagination === false
    sortDirectionHandler = () => {}, // not required if manualPagination === false
    defaultSortColumn = {}, // not required if manualPagination === false
    bulkActions = [],
    showFooter = true,
    thHeight = '70px',
    modern = false,
    searchString = null,
  },
  ref
) {
  const [disableOptionButtons, setDisableOptionButtons] = useState(true);
  let defaultPageSizeValue =
    options.pageSize || constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value;
  let defaultPageSizeLabel = constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.label;
  if (defaultPageSizeValue !== constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value) {
    defaultPageSizeLabel =
      constant.COMMON_TABLE.PAGE_SIZE[`${options.pageSize}_PER_PAGE`].label;
  }

  const [selectedPageSize, setSelectedPageSize] = useState(
    h.general.prettifyConstant(defaultPageSizeLabel),
  );
  const DefaultColumnFilter = ({
    column: { filterValue, preFilteredRows, setFilter },
  }) => {
    const count = preFilteredRows.length;
    return (
      <input
        value={filterValue || ''}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
        placeholder={`Search ${count} records...`}
      />
    );
  };

  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .indexOf(String(filterValue).toLowerCase()) > -1
            : true;
        });
      },
    }),
    [],
  );

  const sortTypes = React.useMemo(
    () => ({
      text: (rowA, rowB, columnId) => {
        const a = rowA.values[columnId];
        const b = rowB.values[columnId];

        // Empty or null value is ranked lower
        if (h.isEmpty(a)) {
          return -1;
        } else if (h.isEmpty(b)) {
          return 1;
        }
        const firstCharacterA = a[0].toLowerCase();
        const firstCharacterB = b[0].toLowerCase();

        return firstCharacterA > firstCharacterB ? 1 : -1;
      },
      number: (rowA, rowB, columnId) => {
        const a = parseInt(rowA.values[columnId]);
        const b = parseInt(rowB.values[columnId]);

        // Empty or null value is ranked lower
        if (isNaN(a)) {
          return -1;
        } else if (isNaN(b)) {
          return 1;
        }

        return a > b ? 1 : -1;
      },
      date: (rowA, rowB, columnId) => {
        const a = Date.parse(rowA.values[columnId]);
        const b = Date.parse(rowB.values[columnId]);

        // Empty or null value is ranked lower
        if (isNaN(a)) {
          return -1;
        } else if (isNaN(b)) {
          return 1;
        }

        return a > b ? 1 : -1;
      },
    }),
    [],
  );

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    allColumns,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      sortTypes,
      initialState: {
        pageIndex: options.pageIndex || 0,
        pageSize:
          options.pageSize || constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
      },
      manualPagination: options.manualPagination,
      autoResetPage: !options.manualPagination,
      ...(options.manualPagination ? { pageCount: options.pageCount } : {}), // paceCount should be only defined if manualPagination is true
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useResizeColumns,
    useFlexLayout,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        const columnsToPush = options.enableRowSelect
          ? [
              {
                id: 'selection',
                Header: ({ getToggleAllRowsSelectedProps }) => (
                  <IndeterminateCheckbox
                    {...getToggleAllRowsSelectedProps()}
                    style={{
                      ...getToggleAllRowsSelectedProps().style,
                      transform: 'scale(1.5)',
                      margin: '0 auto',
                    }}
                    newCheckBox={options.newCheckBox}
                  />
                ),
                width: '50px',
                Cell: ({ row }) => (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <IndeterminateCheckbox
                      {...row.getToggleRowSelectedProps()}
                      style={{
                        ...row.getToggleRowSelectedProps().style,
                        transform: 'scale(1.5)',
                        margin: '0 auto',
                      }}
                      newCheckBox={options.newCheckBox}
                    />
                  </div>
                ),
              },
              ...columns,
            ]
          : [...columns];
        return columnsToPush;
      });
    },
  );

  const headerWidth = 200;
  const headerClickHandler = (column) => {
    if (!column.canSort) return;
    let direction;
    const sortConstants = constant.COMMON_TABLE.SORTING;
    switch (column.sortDirection) {
      case undefined:
      case sortConstants.DEFAULT:
        direction = sortConstants.DESCENDING;
        break;
      case sortConstants.DESCENDING:
        direction = sortConstants.ASCENDING;
        break;
      case sortConstants.ASCENDING:
        direction = sortConstants.DEFAULT;
        break;
      default:
        console.log(`Error: Invalid sort direction ${column.sortDirection}`);
    }

    sortDirectionHandler(column.Header, direction);
  };

  useEffect(() => {
    if (h.general.notEmpty(defaultSortColumn)) {
      const columnToChange = allColumns.find((column) =>
        h.general.cmpStr(column.id, defaultSortColumn.id),
      );
      columnToChange.toggleSortBy(true, false);
    }
  }, []);
  useEffect(() => {
    if (searchString !== null) {
      setGlobalFilter(searchString);
    }
  }, [searchString, data]);
  useEffect(() => {
    setListingPageIndex(pageIndex);
    setListingPageSize(pageSize);
  }, [pageIndex, pageSize]);

  useEffect(() => {
    setDisableOptionButtons(selectedFlatRows.length === 0);
  }, [selectedFlatRows])

  useEffect(() => {
    if(ref && ref.current) {
      ref.current.gotoPage = gotoPage
    }
  }, [ref])

  const getHeaderWidth = (column) => {
    if (h.cmpStr(column.id, 'selection')) {
      return column.width;
    }

    return column.headerWidth ?? headerWidth + 'px';
  };

  const getAdditionalClass = (column) => {
    if (h.notEmpty(column.additionalClass)) {
      return column.additionalClass;
    }

    return '';
  };

  return (
    <div ref={ref}>
      {h.notEmpty(data) && (
        <div
          className={options.scrollable ? 'table-scrollable-container' : ''}
          style={{ overflow }}
        >
          {options.enableRowSelect && (
            <>
            <div className="d-flex w-100 mb-3">
              {bulkActions.map((actionObject) => (
                <button
                  className="common-button"
                  disabled={disableOptionButtons}
                  style={{marginLeft: 'auto', zIndex: 3}}
                  onClick={() => {
                    const originalRows = selectedFlatRows.map(
                      (d) => d.original,
                    );
                    actionObject.handler(originalRows);
                  }}
                >
                  <span style={{ padding: '0 8px 0 0' }}>
                    <FontAwesomeIcon
                      icon={actionObject.icon}
                      color={actionObject.iconColor}
                      fontSize="20px"
                    />
                  </span>
                  {actionObject.action.charAt(0).toUpperCase() +
                    actionObject.action.slice(1)}
                </button>
              ))}
            </div>
            </>
            )}
          <Table {...getTableProps()}>
            <Thead>
              {/* <Tr>
                {headerGroups.map((headerGroup) =>
                  headerGroup.headers.map((column) => (
                    <Th {...column.getHeaderProps()}>
                      {column.render('Header')}
                    </Th>
                  )),
                )}
              </Tr> */}
              <Tr
                // {...headerGroup.getHeaderGroupProps()}
                style={{ display: 'table-row' }}
              >
                {headerGroups.map((headerGroup) =>
                  headerGroup.headers.map((column, i) =>
                      <Th
                        {...column.getHeaderProps({
                          ...column.getSortByToggleProps({ title: undefined }),
                          style: {
                            width: getHeaderWidth(column),
                            maxWidth: getHeaderWidth(column),
                            height: thHeight,
                          },
                        })}
                        {...(options.manualPagination
                          ? {
                              onClick: () => {
                                headerClickHandler(column);
                              },
                            }
                          : {})}
                          className={`${getAdditionalClass(column)}`}
                      >
                        <div className="d-flex flex-row align-items-center table-arrow-container justify-content-between">
                          {column.render('Header')}
                          {!h.cmpStr(column.id, 'selection') && (
                            <span>
                              <svg
                                className="table-sort-svg"
                                role="presentation"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 7.5 14"
                              >
                                {h.general.cmpStr(
                                  column.sortDirection,
                                  constant.COMMON_TABLE.SORTING.DESCENDING,
                                ) ||
                                (column.isSorted && column.isSortedDesc) ? (
                                  <>
                                    <polygon
                                      className="table-arrow-unsorted table-arrow-next"
                                      points="7.5 5 0 5 3.75 0 7.5 5"
                                    ></polygon>
                                    <polygon
                                      className="table-arrow-sorted"
                                      points="0 9 7.5 9 3.75 14 0 9"
                                    ></polygon>
                                  </>
                                ) : h.general.cmpStr(
                                    column.sortDirection,
                                    constant.COMMON_TABLE.SORTING.ASCENDING,
                                  ) || column.isSorted ? (
                                  <>
                                    <polygon
                                      className="table-arrow-sorted"
                                      points="7.5 5 0 5 3.75 0 7.5 5"
                                    ></polygon>
                                    <polygon
                                      className="table-arrow-unsorted"
                                      points="0 9 7.5 9 3.75 14 0 9"
                                    ></polygon>
                                  </>
                                ) : column.canSort &&
                                  (h.general.cmpStr(
                                    column.sortDirection,
                                    constant.COMMON_TABLE.SORTING.DEFAULT,
                                  ) ||
                                    column.sortDirection === undefined) ? (
                                  <>
                                    <polygon
                                      className="table-arrow-unsorted"
                                      points="7.5 5 0 5 3.75 0 7.5 5"
                                    ></polygon>
                                    <polygon
                                      className="table-arrow-unsorted table-arrow-next"
                                      points="0 9 7.5 9 3.75 14 0 9"
                                    ></polygon>
                                  </>
                                ) : null}
                              </svg>
                            </span>
                          )}
                        </div>
                      </Th>
                  ),
                )}
              </Tr>
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()} style={{ display: 'table-row' }}>
                    {row.cells.map((cell) => {
                      return (
                        <Td
                          {...cell.getCellProps({
                            style: {
                              width: cell.column?.width,
                              overflow: 'initial',
                            },
                          })}
                          className={`td-class ${getAdditionalClass(cell.column)}`}
                        >
                          {cell.render('Cell')}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </div>
      )}
      {showFooter && (
        <div
          className={`text-center pagination-wrapper d-flex flex-row ${
            modern ? 'modern' : ''
          }`}
          style={{ marginTop: '.1em' }}
        >
          <div className="pagination flex-wrap">
            <button
              className="table-pagination-navigate"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <span style={{ padding: '0 10px 0 0' }}>
                <FontAwesomeIcon
                  icon={faAngleLeft}
                  color="#ADC7A6"
                  fontSize="20px"
                />
              </span>
              Prev
            </button>
            &nbsp;
            {/*Array(pageOptions.length).fill(1).map((pageNum, pageNumI) => <button className={pageIndex === pageNumI ? "active" : ""} onClick={() => gotoPage(pageNumI)}>{pageNumI + 1}</button>)*/}
            {Array(pageOptions.length)
              .fill(1)
              .map((pageNum, pageNumI) => {
                let perceivedIndex = pageIndex;
                if (
                  pageIndex <= constant.COMMON_TABLE.PAGINATION.RANGE_THRESHOLD
                )
                  perceivedIndex =
                    constant.COMMON_TABLE.PAGINATION.RANGE_THRESHOLD;
                return pageNumI >=
                  perceivedIndex -
                    constant.COMMON_TABLE.PAGINATION.RANGE_THRESHOLD &&
                  pageNumI <=
                    perceivedIndex +
                      constant.COMMON_TABLE.PAGINATION.RANGE_THRESHOLD ? (
                  <li className="table-pagination" key={pageNumI}>
                    <button
                      className={pageIndex === pageNumI ? 'active' : ''}
                      onClick={() => {
                        gotoPage(pageNumI);
                      }}
                    >
                      {pageNumI + 1}
                    </button>
                  </li>
                ) : null;
              })}
            <button
              className="table-pagination-navigate"
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              Next
              <span style={{ padding: '0 0 0 10px' }}>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  color="#ADC7A6"
                  fontSize="20px"
                />
              </span>
            </button>
            &nbsp;
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <Dropdown>
              <Dropdown.Toggle
                id="dropdown-custom-1"
                className="table-pagination-page-size"
              >
                {selectedPageSize}
              </Dropdown.Toggle>

              <Dropdown.Menu className="table-pagination-page-size">
                <Dropdown.Item
                  className="table-pagination-page-size"
                  onClick={() => {
                    setPageSize(constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value);
                    setSelectedPageSize(
                      h.general.prettifyConstant(
                        constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.label,
                      ),
                    );
                  }}
                >
                  {h.general.prettifyConstant(
                    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.label,
                  )}
                </Dropdown.Item>
                <Dropdown.Item
                  className="table-pagination-page-size"
                  onClick={() => {
                    setPageSize(
                      constant.COMMON_TABLE.PAGE_SIZE['50_PER_PAGE'].value,
                    );
                    setSelectedPageSize(
                      h.general.prettifyConstant(
                        constant.COMMON_TABLE.PAGE_SIZE['50_PER_PAGE'].label,
                      ),
                    );
                  }}
                >
                  {h.general.prettifyConstant(
                    constant.COMMON_TABLE.PAGE_SIZE['50_PER_PAGE'].label,
                  )}
                </Dropdown.Item>
                <Dropdown.Item
                  className="table-pagination-page-size"
                  onClick={() => {
                    setPageSize(
                      constant.COMMON_TABLE.PAGE_SIZE['100_PER_PAGE'].value,
                    );
                    setSelectedPageSize(
                      h.general.prettifyConstant(
                        constant.COMMON_TABLE.PAGE_SIZE['100_PER_PAGE'].label,
                      ),
                    );
                  }}
                >
                  {h.general.prettifyConstant(
                    constant.COMMON_TABLE.PAGE_SIZE['100_PER_PAGE'].label,
                  )}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      )}
      {h.isEmpty(data) && <div className="text-muted">{noDataText}</div>}
    </div>
  );
});

export default CommonResponsiveTable;
