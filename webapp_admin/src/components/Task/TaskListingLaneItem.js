import React, { useState, useEffect, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import TaskPopupDialog from './TaskPopupDialog';
import { h } from '../../helpers';

export default function TaskListingLaneItem({ setLoading, task }) {
  const { task_id, subject, message_latest, updated_date_time_ago } = task;

  return (
    <Card className="mx-auto mb-2" style={{ maxWidth: '30rem' }}>
      <Card.Body>
        <Card.Title>{subject}</Card.Title>
        <Card.Text>{message_latest}</Card.Text>
        {/*<Card.Text className="float-right text-muted"><small>{updated_date_time_ago}</small></Card.Text>*/}
      </Card.Body>
    </Card>
  );
}
