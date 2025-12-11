import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import CommonSimpleTable, {
  SelectColumnFilter,
} from '../../components/Common/CommonSimpleTable';
import { flatten } from 'lodash';
import IconBookmarkActiveVector from '../Icons/IconBookmarkActiveVector';
import IconBookmarkInactiveVector from '../Icons/IconBookmarkInactiveVector';

import CommonTooltip from '../Common/CommonTooltip';

export default function PropertyTableList({
  projects,
  properties,
  handleClick,
  customStyle,
  reloadShortlistedProjects,
  shouldTrackActivity,
  contact_id,
  translate,
  selected = null,
}) {
  const allProperties = properties;

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

  const handleBookmark = async (shortlisted_property_id) => {
    const apiRes =
      await api.shortlistedProperty.updateShortlistedPropertyBookmark(
        { shortlisted_property_id },
        false,
      );
    if (h.cmpStr(apiRes.status, 'ok')) {
      reloadShortlistedProjects();
      let activity_type;
      let alertMessage;
      if (apiRes.data.is_bookmarked) {
        activity_type = constant.CONTACT.ACTIVITY.TYPE.PROPERTY_BOOKMARKED;
        alertMessage = 'Property successfully bookmarked';
      } else {
        activity_type = constant.CONTACT.ACTIVITY.TYPE.PROPERTY_UNBOOKMARKED;
        alertMessage = 'Removed bookmark successfully';
      }
      if (shouldTrackActivity) {
        await api.contactActivity.create(
          {
            contact_fk: contact_id,
            activity_type: activity_type,
            activity_meta: JSON.stringify({
              shortlisted_property_id,
            }),
          },
          false,
        );
      }
      h.general.alert('success', {
        message: alertMessage,
      });
    }
  };

  const getProjectName = (fk) => {
    const getName = projects.filter((f) => f.project_fk === fk);

    if (getName.length > 0) {
      return getName[0]?.project?.name;
    }
    return '';
  };

  const tableColumns = useMemo(
    () => [
      {
        Header: h.translate.localize('action', translate),
        id: 'selection',
        accessor: (row) => {
          return (
            <span
              style={{
                cursor: 'pointer',
                fontFamily: 'PoppinsSemiBold',
                display: 'block',
                width: '100%',
                textAlign: 'center',
              }}
              className="underline-hover"
            >
              {h.translate.localize('view', translate)}
            </span>
          );
        },
      },
      {
        Header: h.translate.localize('project', translate),
        accessor: (row) => {
          return getProjectName(row?.project_property?.project_fk);
        },
        filter: false,
      },
      {
        Header: h.translate.localize('bedrooms', translate),
        accessor: (row) => {
          return (
            <>
              {customFormatDecimal(row?.project_property?.number_of_bedroom)}

              <span className="hid mr-2">
                {' '}
                {h.translate.localize('bedrooms', translate)} &#8211;
              </span>
              <span className="hid mr-2">
                {customFormatDecimal(row?.project_property?.number_of_bathroom)}{' '}
                {h.translate.localize('bathrooms', translate)} &#8211;
              </span>
              <span className="hid mr-2">
                {`${row?.project_property?.sqm} ${h.translate.localize(
                  selected?.project?.project?.size_format,
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
          return customFormatDecimal(row?.project_property?.number_of_bathroom);
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('size', translate),
        accessor: (row) => {
          return `${row?.project_property?.sqm}  ${h.translate.localize(
            selected?.project?.project?.size_format,
            translate,
          )}`;
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('price', translate),
        accessor: (row) => {
          const curr = selected?.project?.project?.currency_code
            ? selected?.project?.project?.currency_code.toUpperCase()
            : '';
          if (row?.is_general_enquiry) {
            return `${row?.project_property?.starting_price} ${curr}`;
          }
          return h.translate.localize('pleaseContact', translate);
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('bookmarked', translate),
        accessor: (row) => {
          let stroke = false;
          if (row.is_opened) {
            stroke = true;
          }
          if (
            selected &&
            row.project?.project_id === selected.project.project.project_id
          ) {
            stroke = false;
          }
          return (
            <CommonTooltip
              tooltipText={row.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
            >
              <div
                style={{ textAlign: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark(row.shortlisted_property_id);
                }}
              >
                {row.is_bookmarked ? (
                  <IconBookmarkActiveVector
                    stroke={stroke ? customStyle?.bookmark?.color : '#fff'}
                  />
                ) : (
                  <IconBookmarkInactiveVector
                    stroke={stroke ? customStyle?.bookmark?.color : '#fff'}
                  />
                )}
              </div>
            </CommonTooltip>
          );
        },
      },
    ],
    [h, getProjectName],
  );

  return (
    <div>
      {h.notEmpty(projects) ? (
        <CommonSimpleTable
          selected={selected}
          customStyle={customStyle}
          columns={tableColumns}
          data={allProperties}
          handleClick={handleClick}
        />
      ) : (
        <p>You have no projects here.</p>
      )}
    </div>
  );
}
