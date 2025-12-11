import React, { useState } from 'react';
import { h } from '../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function ProjectTeamBehindForm({
  url,
  title,
  filename,
  onUpdate,
  onDelete,
}) {
  return (
    <div className="uploaded-file mt-2">
      <div className="row">
        <div className="col-12 col-sm-3">
          <img className="w-100 h-100" src={url} />
        </div>
        <div className="col-12 col-sm-9">
          <small className="text-muted">Filename</small>
          <div>{filename}</div>
          <small className="text-muted">Title</small>
          <div>
            <input
              className="w-100"
              type="text"
              value={title}
              placeholder="Enter title"
              onChange={(e) => {
                onUpdate({ url, title: e.target.value, filename });
              }}
            />
          </div>
          <div className="mt-2">
            <div
              className="text-danger"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                h.general.prompt(
                  { message: 'Are you sure you want to delete this image?' },
                  (status) => {
                    if (status) onDelete({ url: '', title: '', filename: '' });
                  },
                );
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
