import React, { useState, useEffect } from 'react';
import { useTable, useFilters, usePagination, useSortBy } from 'react-table';
import { h } from '../../helpers';
import { has } from 'lodash';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import constant from '../../constants/constant.json';
import IconNewVector from '../Icons/IconNewVector';
import IconNewCircleVector from '../Icons/IconNewCircleVector';
import IconSortDefaultVector from '../Icons/IconSortDefaultVector';
import IconSortUpVector from '../Icons/IconSortUpVector';
import IconSortDownVector from '../Icons/IconSortDownVector';

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

export default function CommonSimpleTable({
  columns,
  data,
  noDataText = 'No records yet',
  options = {},
  handleClick,
  customStyle,
  selected = null,
}) {
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

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
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
  const {
    getTableProps,
    getTableBodyProps,
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
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      sortTypes,
      initialState: {
        pageIndex: options.pageIndex || 0,
        pageSize: options.pageSize || 10,
      },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const isSelected = (v) => {
    if (selected && selected.project) {
      return v.project?.project_id === selected.project.project.project_id;
    }

    return false;
  };

  return (
    <div>
      {h.notEmpty(data) && (
        <div className="table-responsive">
          <Table
            className="table table-hover table-bordered table-collapsed"
            {...getTableProps()}
          >
            <Thead style={{ cursor: 'pointer' }}>
              <Tr>
                {headerGroups.map((headerGroup) =>
                  headerGroup.headers.map((column) => (
                    <Th
                      {...column.getHeaderProps({
                        ...column.getSortByToggleProps({ title: undefined }),
                      })}
                      style={{
                        background: '#FAFBFB',
                        textTransform: 'uppercase',
                        ...customStyle?.table?.header,
                      }}
                    >
                      {column.render('Header')}
                      {/* <div>
                        {h.cmpBool(column.filterable, true) ||
                        h.isEmpty(column.filterable)
                          ? column.render('Filter')
                          : null}
                      </div> */}
                      {!h.cmpStr(column.id, 'selection') && (
                        <span>
                          {h.general.cmpStr(
                            column.sortDirection,
                            constant.COMMON_TABLE.SORTING.DESCENDING,
                          ) ||
                          (column.isSorted && column.isSortedDesc) ? (
                            <IconSortUpVector />
                          ) : h.general.cmpStr(
                              column.sortDirection,
                              constant.COMMON_TABLE.SORTING.ASCENDING,
                            ) || column.isSorted ? (
                            <IconSortDownVector />
                          ) : column.canSort &&
                            (h.general.cmpStr(
                              column.sortDirection,
                              constant.COMMON_TABLE.SORTING.DEFAULT,
                            ) ||
                              column.sortDirection === undefined) ? (
                            <>
                              <IconSortDefaultVector
                                fillColorUp={customStyle?.table?.value}
                                fillColorDown={customStyle?.table?.value}
                              />
                            </>
                          ) : null}
                        </span>
                      )}
                    </Th>
                  )),
                )}
              </Tr>
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <Tr
                    {...row.getRowProps()}
                    onClick={() => handleClick(row)}
                    style={{
                      cursor: 'pointer',
                      ...(row.original?.is_opened === 0 ||
                      isSelected(row.original)
                        ? customStyle?.table?.bgBorder
                        : ''),
                    }}
                    className={
                      row.original?.is_opened === 0 || isSelected(row.original)
                        ? 'new'
                        : ''
                    }
                  >
                    {row.cells.map((cell, i) => {
                      return (
                        <Td
                          {...cell.getCellProps()}
                          style={{
                            ...customStyle?.table?.value,
                            ...(row.original?.is_opened === 0 ||
                            isSelected(row.original)
                              ? customStyle?.table?.hover
                              : {}),
                          }}
                          className={
                            row.original?.is_opened === 0 ||
                            isSelected(row.original)
                              ? 'pos-rlt'
                              : ''
                          }
                        >
                          {i === 1 && !row.original?.is_opened && (
                            <IconNewVector />
                            // <IconNewCircleVector />
                          )}
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

      {h.isEmpty(data) && <div className="text-muted">{noDataText}</div>}
    </div>
  );
}
