import React, { useState, useEffect } from 'react';
import { useTable, useFilters, usePagination } from 'react-table';
import { h } from '../../helpers';

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

export default function CommonTable({
  columns,
  data,
  noDataText = 'No records yet',
  options = {},
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
      initialState: {
        pageIndex: options.pageIndex || 0,
        pageSize: options.pageSize || 10,
      },
    },
    useFilters,
    usePagination,
  );

  return (
    <div>
      {h.notEmpty(data) && (
        <div className="table-responsive">
          <table
            className="table table-hover table-bordered"
            {...getTableProps()}
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render('Header')}
                      <div>
                        {h.cmpBool(column.filterable, true) ||
                        h.isEmpty(column.filterable)
                          ? column.render('Filter')
                          : null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination d-flex justify-content-center">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {'<<'}
            </button>
            &nbsp;
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {'<'}
            </button>
            &nbsp;
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {'>'}
            </button>
            &nbsp;
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {'>>'}
            </button>
            &nbsp;&nbsp;
            <span>
              Page&nbsp;
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
              &nbsp;
            </span>
            <span>
              &nbsp;|&nbsp;Go to page:&nbsp;
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: '100px' }}
              />
            </span>
            &nbsp;
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {h.isEmpty(data) && <div className="text-muted">{noDataText}</div>}
    </div>
  );
}
