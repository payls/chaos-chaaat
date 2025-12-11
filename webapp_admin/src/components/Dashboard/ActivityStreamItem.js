import React from 'react';
import { h } from '../../helpers';

export default function ActivityStreamItem(props) {
  const { date, hour, user_image_url, user_name, text, project } = props;
  const projectName =
    project && project.project && project.project.name
      ? project.project.name
      : '';
  const projectDetails =
    project &&
    `${projectName} | #${project.unit.unit_number} | ${
      project.unit.number_of_bedroom || '-'
    } bed | ${project.unit.number_of_bathroom || '-'} bath | $${
      project.unit.starting_price
        ? h.currency.format(project.unit.starting_price)
        : '-'
    }`;

  return (
    <div className="activity-stream-item">
      <div className="row pt-3 pb-3">
        <div className="col-12 col-md-2">
          <span>{date}</span>
        </div>
        <div className="col-12 col-md-2">
          <span>{hour}</span>
        </div>
        <div className="col-12 col-md-2">
          {h.notEmpty(user_image_url) && <img src={user_image_url} />}
          <span className="user-name">{user_name}</span>
        </div>
        <div className="col-12 col-md-5 d-flex flex-column">
          <span className="activity-stream-text">{text}</span>
          {project && <span>{projectDetails}</span>}
        </div>
      </div>
    </div>
  );
}
