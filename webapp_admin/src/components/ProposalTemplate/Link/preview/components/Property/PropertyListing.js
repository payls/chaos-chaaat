import React, {useState, useEffect, useMemo} from 'react';
import {h} from '../../helpers';
import {api} from '../../api';
import CommonTable, {
  SelectColumnFilter,
} from '../../components/Common/CommonTable';
import Link from 'next/link';
import {routes} from '../../configs/routes';

export default function PropertyListing({setLoading}) {
  const [properties, setProperties] = useState();

  const tableColumns = useMemo(
    () => [
      {
        Header: (
          <span>
            Name
            <br/>
            (Address)
          </span>
        ),
        accessor: 'address_1',
        filter: 'text',
        Cell: ({row: {original}}) => {
          const {property_id} = original;
          let address = '';
          if (original.address_1)
            address += `${address && ' '}${original.address_1}`;
          if (original.address_2)
            address += `${address && ' '}${original.address_2}`;
          if (original.address_3)
            address += `${address && ' '}${original.address_3}`;
          return (
            <Link href={h.getRoute(routes.property.edit, {property_id})}>
              {address}
            </Link>
          );
        },
      },
      {
        Header: 'Type',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes',
        Cell: ({row: {original}}) => {
          return h.general.prettifyConstant(original.status);
        },
      },
      {
        Header: 'Valuation/Rent (AUD)',
        accessor: 'offer_price',
        filter: 'text',
        Cell: ({row: {original}}) => {
          return '';
        },
      },
      {
        Header: 'Notes',
        accessor: 'notes',
        filter: 'text',
      },
    ],
    [],
  );

  useEffect(() => {
    (async () => {
      await getProperties();
    })();
  }, []);

  const getProperties = async () => {
    const apiRes = await api.property.findAll({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setProperties(apiRes.data.properties);
    }
  };

  return (
    <div>
      {h.notEmpty(properties) ? (
        <CommonTable columns={tableColumns} data={properties}/>
      ) : (
        <p>You have no properties here.</p>
      )}
    </div>
  );
}
