import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignJustify,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

export default function ContactActivityList(props) {
  const { contactActivities } = props;

  const convertActivityType = (activityType) => {
    const words = activityType.split('_').map((word) => {
      const firstChar = word.charAt(0).toUpperCase();
      const restOfString = word.slice(1).replace(/_/g, ' ');
      let activity = `${firstChar}${restOfString}`;
      activity = activity.replace(/\bProjet\b/g, 'Project');
      return activity;
    });

    return words.join(' ');
  };

  if (contactActivities.length === 0) {
    return (
      <>
        <div className="contact-activity-overview-row">
          <span>
            <FontAwesomeIcon
              icon={faAlignJustify}
              color="#515151"
              fontSize="20px"
              style={{ width: 12, marginRight: '10px', height: 'auto' }}
            />
            Contact Activities
          </span>
        </div>
        <div className="contact-activity-overview-row">No activities</div>
      </>
    );
  }

  const sortedContactActivities = contactActivities.sort(
    (activityA, activityB) => {
      const dateA = new Date(activityA.activity_date_raw);
      const dateB = new Date(activityB.activity_date_raw);
      return dateB - dateA;
    },
  );

  console.log(sortedContactActivities);

  return (
    <>
      <div className="contact-activity-overview-row">
        <span>
          <FontAwesomeIcon
            icon={faAlignJustify}
            color="#515151"
            fontSize="20px"
            style={{ width: 12, marginRight: '10px', height: 'auto' }}
          />
          Contact Activities
        </span>
      </div>
      <div className="contact-activity-overview-row">
        <ul
          style={{
            listStyle: 'none',
            marginLeft: '-40px',
            height: '300px',
            overflowY: 'scroll',
          }}
        >
          {sortedContactActivities.map((activity, index) => (
            <li key={index}>
              <div>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  color="#515151"
                  fontSize="15px"
                  style={{ width: 10, marginRight: '10px', height: 'auto' }}
                />
                {convertActivityType(activity.activity_type)} {' ('}
                {activity.activity_date_time_ago}
                {')'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
