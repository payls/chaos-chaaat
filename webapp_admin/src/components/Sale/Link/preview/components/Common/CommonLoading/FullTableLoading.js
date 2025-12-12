import React, { useState, useEffect } from 'react';

// Components
import TableLoading from './TableLoading';
import CommonResponsiveTable from '../../../../../../Common/CommonResponsiveTable';

export default ({ headers, rowsCount = 5 }) => {
  const columns = [
    ...[...Array(headers.length)].map((e, i) => ({
      id: 'index' + i,
      Header: headers[i],
      Cell: () => <TableLoading className={{}} />,
    })),
  ];

  const [data, setData] = useState([...Array(rowsCount)].map(() => ({})));

  return (
    <CommonResponsiveTable
      columns={columns}
      data={data}
      options={{
        manualPagination: false,
        pageCount: 10,
        enableRowSelect: false,
        scrollable: true,
        pageIndex: 0,
        pageSize: 25,
      }}
      thHeight="50px"
      setListingPageIndex={undefined}
      setListingPageSize={undefined}
      sortDirectionHandler={undefined}
      defaultSortColumn={null}
      bulkActions={[]}
      showFooter={false}
    />
  );
};
