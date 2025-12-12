import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import { getCity } from '../../../../../../helpers/general';

import { api } from '../../api';
import constant from '../../constants/constant.json';

import CommonSimpleTable, {
  SelectColumnFilter,
} from '../../../../../Common/CommonSimpleTable';

import IconBookmarkActiveVector from '../Icons/IconBookmarkActiveVector';
import IconBookmarkInactiveVector from '../Icons/IconBookmarkInactiveVector';
export default function ProjectTableList({
  projects,
  contact_id = null,
  handleClick,
  reloadShortlistedProjects,
  shouldTrackActivity,
  customStyle,
  translate,
  selected = null,
}) {
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

  const handleBookmark = async (shortlisted_project_id) => {
    const apiRes =
      await api.shortlistedProject.updateShortlistedProjectBookmark(
        { shortlisted_project_id },
        false,
      );
    if (h.cmpStr(apiRes.status, 'ok')) {
      reloadShortlistedProjects();
      let activity_type;
      let alertMessage;
      if (apiRes.data.is_bookmarked) {
        activity_type = constant.CONTACT.ACTIVITY.TYPE.PROJECT_BOOKMARKED;
        alertMessage = 'Project successfully bookmarked';
      } else {
        activity_type = constant.CONTACT.ACTIVITY.TYPE.PROJECT_UNBOOKMARKED;
        alertMessage = 'Removed bookmark successfully';
      }
      if (shouldTrackActivity && contact_id) {
        await api.contactActivity.create(
          {
            contact_fk: contact_id,
            activity_type: activity_type,
            activity_meta: JSON.stringify({
              shortlisted_project_id,
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
        id: 'projectName',
        Header: h.translate.localize('project', translate),
        accessor: (row) =>
          h.isEmpty(row.project?.name) ? '' : row.project?.name,
        filter: false,
      },
      {
        Header: h.translate.localize('country', translate),
        accessor: (row) => {
          return (
            <>
              <span className="hid">
                {getCity(row.project?.location_google_place_raw)} &#8211;{' '}
              </span>
              {getCountry(row.project?.location_google_place_raw)}
            </>
          );
        },
      },
      {
        Header: h.translate.localize('city', translate),
        accessor: (row) => {
          return getCity(row.project?.location_google_place_raw);
        },
        sortType: 'text',
      },
      {
        Header: h.translate.localize('proposedDate', translate),
        accessor: (row) => {
          return row.created_date;
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
          if (row.project?.project_id === selected.project.project.project_id) {
            stroke = false;
          }
          return (
            <>
              <div
                style={{ textAlign: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (contact_id) {
                    handleBookmark(row.shortlisted_project_id);
                  }
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
            </>
          );
        },
      },
    ],
    [h, selected, contact_id],
  );

  return (
    <div>
      {h.notEmpty(projects) ? (
        <CommonSimpleTable
          columns={tableColumns}
          selected={selected}
          data={projects}
          handleClick={handleClick}
          customStyle={customStyle}
        />
      ) : (
        <p>You have no projects here.</p>
      )}
    </div>
  );
}
