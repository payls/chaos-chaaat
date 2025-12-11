import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import CommonSimpleTable, {
  SelectColumnFilter,
} from '../../../../../Common/CommonSimpleTable';
import { flatten } from 'lodash';
import IconBookmarkActiveVector from '../Icons/IconBookmarkActiveVector';
import IconBookmarkInactiveVector from '../Icons/IconBookmarkInactiveVector';

export default function PropertyTableList({
  projects,
  handleClick,
  customStyle,
  reloadShortlistedProjects,
  shouldTrackActivity,
  translate,
}) {
  const allProperties = flatten(
    projects
      .filter((f) => f.shortlisted_property_proposal_templates)
      .map((m) => m.shortlisted_property_proposal_templates),
  );

  const allPropertiesUpdated = allProperties.map(m => ({
    ...m,
    is_opened: 0,
  }));

  const getCountry = (google_place_raw) => {
    if (
      h.isEmpty(google_place_raw) ||
      h.isEmpty(google_place_raw.address_components)
    )
      return '';
    const address_components = google_place_raw.address_components.filter((f) =>
      f.types.includes('country'),
    );
    if (address_components.length > 0) {
      return address_components[0].long_name;
    }

    return '';
  };

  const customFormatDecimal = (decimal, fraction = 0) => {
    return Math.floor(decimal) == decimal
      ? Math.floor(decimal).toFixed(fraction)
      : decimal;
  };

  const getCity = (google_place_raw) => {
    let city = '';
    if (h.notEmpty(google_place_raw)) {
      for (let i = 0; i < google_place_raw.address_components.length; i++) {
        const add_component = google_place_raw.address_components[i];

        if (add_component.types.includes('administrative_area_level_2')) {
          city = add_component.long_name;
          break;
        }
        if (add_component.types.includes('administrative_area_level_1')) {
          city = add_component.long_name;
          break;
        }

        if (add_component.types.includes('locality')) {
          city = add_component.long_name;
        }
      }
    }
    return city;
  };

  const tableColumns = useMemo(
    () => [
      {
        Header: h.translate.localize('project', translate),
        accessor: (row) =>
          h.isEmpty(row.project?.project_name) ? '' : row.project?.project_name,
        filter: false,
      },
      {
        Header: h.translate.localize('bedrooms', translate),
        accessor: (row) => {
          return (
            <>
              {customFormatDecimal(row.unit?.bed)}

              <span className="hid mr-2">
                {' '}
                {h.translate.localize('bedrooms', translate)} &#8211;
              </span>
              <span className="hid mr-2">
                {customFormatDecimal(row.unit?.bath)}{' '}
                {h.translate.localize('bathrooms', translate)} &#8211;
              </span>
              <span className="hid mr-2">
                {`${row.unit?.sqm} ${h.translate.localize(
                  row.project?.project_size_format,
                  translate,
                )}`}
              </span>
            </>
          );
        },
      },
      {
        Header: h.translate.localize('bathrooms', translate),
        accessor: (row) => {
          return customFormatDecimal(row.unit?.bath);
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('size', translate),
        accessor: (row) => {
          return `${row.unit?.sqm}  ${h.translate.localize(
            row.project?.project_size_format,
            translate,
          )}`;
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('price', translate),
        accessor: (row) => {
          const curr = row.unit?.currency
            ? row.unit?.currency.toUpperCase()
            : '';
          if (row?.is_general_enquiry) {
            return `${row.unit?.start_price} ${curr}`;
          }
          return h.translate.localize('pleaseContact', translate);
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('bookmarked', translate),
        accessor: (row) => {
          return (
            <>
              <div style={{ textAlign: 'center' }}>
                {row.is_bookmarked ? (
                  <IconBookmarkActiveVector
                    stroke={
                      row.is_opened ? customStyle?.bookmark?.color : '#fff'
                    }
                  />
                ) : (
                  <IconBookmarkInactiveVector
                    stroke={
                      row.is_opened ? customStyle?.bookmark?.color : '#fff'
                    }
                  />
                )}
              </div>
            </>
          );
        },
      },
    ],
    [h],
  );

  return (
    <div>
      {h.notEmpty(projects) ? (
        <CommonSimpleTable
          customStyle={customStyle}
          columns={tableColumns}
          data={allPropertiesUpdated}
          handleClick={handleClick}
        />
      ) : (
        <p>You have no projects here.</p>
      )}
    </div>
  );
}
