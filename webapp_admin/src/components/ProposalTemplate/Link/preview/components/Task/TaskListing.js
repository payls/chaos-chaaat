import React, {useState, useEffect} from 'react';
import {h} from '../../helpers';
import {api} from '../../api';
import TaskListingLane from './TaskListingLane';
import constant from '../../constants/constant.json';

export default function TaskListing({setLoading}) {
  const [todoTasks, setTodoTasks] = useState([]); //pending_client
  const [doingTasks, setDoingTasks] = useState([]); //pending_staff
  const [doneTasks, setDoneTasks] = useState([]); //completed

  useEffect(() => {
    (async () => {
      await reloadTasks();
    })();
  }, []);

  const reloadTasks = async () => {
    await getTasks(constant.TASK.STATUS.PENDING_CLIENT);
    await getTasks(constant.TASK.STATUS.PENDING_STAFF);
    await getTasks(constant.TASK.STATUS.COMPLETED);
  };

  const getTasks = async (status) => {
    const apiRes = await api.task.findAll({status}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      switch (status) {
        case constant.TASK.STATUS.PENDING_CLIENT:
          setTodoTasks(apiRes.data.tasks);
          break;
        case constant.TASK.STATUS.PENDING_STAFF:
          setDoingTasks(apiRes.data.tasks);
          break;
        case constant.TASK.STATUS.COMPLETED:
          setDoneTasks(apiRes.data.tasks);
          break;
      }
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-12 col-md-4">
          <TaskListingLane
            laneTitle="To do"
            laneEmptyTitle="Congrats, you are all caught up here!"
            tasks={todoTasks}
            reloadTasks={() => reloadTasks()}
          />
        </div>
        <div className="col-12 col-md-4">
          <TaskListingLane
            laneTitle="Doing"
            laneEmptyTitle="Get started by creating a task for us!"
            tasks={doingTasks}
            reloadTasks={() => reloadTasks()}
          />
        </div>
        <div className="col-12 col-md-4">
          <TaskListingLane
            laneTitle="Done"
            laneEmptyTitle="There are no completed tasks yet!"
            tasks={doneTasks}
            reloadTasks={() => reloadTasks()}
          />
        </div>
      </div>
    </div>
  );
}
