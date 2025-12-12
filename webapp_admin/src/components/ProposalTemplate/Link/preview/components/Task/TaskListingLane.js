import React, {useState, useEffect, useMemo} from 'react';
import {h} from '../../helpers';
import TaskListingLaneItem from './TaskListingLaneItem';
import TaskPopupDialog from './TaskPopupDialog';

export default function TaskListingLane({
                                          setLoading,
                                          laneTitle,
                                          laneEmptyTitle = 'No tasks here',
                                          tasks,
                                          reloadTasks,
                                        }) {
  const [selectedTask, setSelectedTask] = useState({});

  return (
    <div>
      <div className="row text-center mb-4">
        <div className="col-12">
          <h3>{laneTitle}</h3>
        </div>
      </div>

      {h.isEmpty(tasks) && (
        <div className="row text-center">
          <div className="col-12">
            <span className="text-muted">{laneEmptyTitle}</span>
          </div>
        </div>
      )}

      {h.notEmpty(tasks) && (
        <div className="row">
          <div className="col-12">
            {tasks.map((task) => {
              return (
                <a
                  style={{cursor: 'pointer'}}
                  onClick={() => setSelectedTask(task)}
                >
                  <TaskListingLaneItem setLoading={setLoading} task={task}/>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {h.notEmpty(selectedTask) && (
        <TaskPopupDialog
          setLoading={setLoading}
          formMode={h.form.FORM_MODE.VIEW}
          taskId={selectedTask.task_id}
          taskSubject={selectedTask.subject}
          taskStatus={selectedTask.status}
          handleCloseDialog={() => {
            setSelectedTask({});
            if (reloadTasks) reloadTasks();
          }}
        />
      )}
    </div>
  );
}
