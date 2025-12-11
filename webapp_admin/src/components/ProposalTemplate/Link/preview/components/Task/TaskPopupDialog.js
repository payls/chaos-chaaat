import React, { useState, useEffect, useRef } from 'react';
import { ListGroup, Modal } from 'react-bootstrap';
import TaskForm from './TaskForm';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

export default function TaskPopupDialog({
  setLoading,
  formMode = h.form.FORM_MODE.ADD,
  handleCloseDialog,
  taskId,
  taskSubject,
  taskStatus,
}) {
  const bottomRef = useRef();
  const [showDialog, setShowDialog] = useState(true);
  const [task, setTask] = useState();

  const handleClose = async () => {
    switch (formMode) {
      case h.form.FORM_MODE.VIEW:
        await getTaskByTaskId(taskId);
        break;
      default:
      case h.form.FORM_MODE.ADD:
        closeDialog();
        break;
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    handleCloseDialog();
  };

  useEffect(() => {
    (async () => {
      await getTaskByTaskId(taskId);
    })();
  }, [taskId]);

  const getTaskByTaskId = async (task_id) => {
    if (h.isEmpty(taskId)) return;
    const apiRes = await api.task.findOne({ task_id }, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setTask(apiRes.data.task);
    }
    bottomRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <Modal
      show={showDialog}
      onHide={closeDialog}
      backdrop="static"
      keyboard={false}
      centered
      size="md"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {h.cmpStr(formMode, h.form.FORM_MODE.VIEW)
            ? taskSubject
            : 'Create Task'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {h.cmpStr(formMode, h.form.FORM_MODE.VIEW) &&
          h.notEmpty(task) &&
          h.notEmpty(task.task_messages) && (
            <ListGroup
              variant="flush"
              style={{ maxHeight: 300, overflow: 'scroll' }}
            >
              {task.task_messages.map((task_message) => {
                let { type } = task_message;
                let { user_id: current_user_id } = h.auth.getUserInfo();
                let { full_name, profile_picture_url, user_id } =
                  task_message.user;
                return (
                  <ListGroup.Item
                    variant={
                      h.cmpStr(current_user_id, user_id) &&
                      h.cmpStr(type, constant.TASK.MESSAGE.TYPE.CLIENT_TO_STAFF)
                        ? 'primary'
                        : ''
                    }
                  >
                    <div className="row">
                      <div className="col-2">
                        <img
                          className="img-fluid rounded-circle"
                          src={profile_picture_url}
                        />
                      </div>
                      <div className="col-10">
                        <div className="row">
                          <div className="col-7 text-muted">
                            <small>{full_name}</small>
                          </div>
                          <div className="col-5 text-muted text-right">
                            <small>{task_message.created_date_time_ago}</small>
                          </div>
                          <div className="col-12">{task_message.message}</div>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
              <div ref={bottomRef}></div>
            </ListGroup>
          )}

        {h.notEmpty(formMode) &&
          !h.cmpStr(taskStatus, constant.TASK.STATUS.COMPLETED) && (
            <TaskForm
              setLoading={setLoading}
              formMode={formMode}
              handleFormCancelled={closeDialog}
              handleFormSubmitted={handleClose}
              taskId={taskId}
            />
          )}
      </Modal.Body>
      {/*<Modal.Footer>*/}
      {/*	<a onClick={handleClose}>Close dialog</a>*/}
      {/*</Modal.Footer>*/}
    </Modal>
  );
}
