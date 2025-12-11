import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import CommonBreadcrumb from '../../components/Common/CommonBreadcrumb';
import CommonFloatingAction from '../../components/Common/CommonFloatingAction';
import PropertyListing from '../../components/Property/PropertyListing';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import TaskListing from '../../components/Task/TaskListing';
import { formatAmpMessages } from 'next/dist/build/output';
import TaskForm from '../../components/Task/TaskForm';
import TaskPopupDialog from '../../components/Task/TaskPopupDialog';
import { config } from '../../configs/config';

export default function DashboardTasks() {
  const [isLoading, setLoading] = useState();
  const [formMode, setFormMode] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    //This is to open task creation popup dialog on page load
    const queryFormMode = h.general.findGetParameter('form_mode');
    if (h.notEmpty(queryFormMode)) {
      setFormMode(h.form.FORM_MODE.ADD);
    }
  }, []);

  return (
    <div>
      <Header title="Tasks" />
      <Body className="container pt-5 pb-5 min-vh-100" isLoading={isLoading}>
        {!h.cmpStr(config.env, 'production') && (
          <CommonFloatingAction
            text={<FontAwesomeIcon icon={faPlus} />}
            onClick={() => setFormMode(h.form.FORM_MODE.ADD)}
          />
        )}
        {!h.cmpStr(config.env, 'production') &&
          h.cmpStr(formMode, h.form.FORM_MODE.ADD) && (
            <TaskPopupDialog
              setLoading={setLoading}
              formMode={formMode}
              // taskId={selectedTask.task_id}
              // taskSubject={selectedTask.subject}
              handleCloseDialog={() => {
                // setSelectedTask({});
                setFormMode('');
              }}
            />
          )}

        <div className="row">
          <div className="col-12">
            <h1>Tasks</h1>
            {h.cmpStr(config.env, 'production') && (
              <p>
                This page is currently pending launch and we’ll notify you as
                soon as that happens. You’ll have the ability to manage tasks
                related to new property purchases as well as management of
                existing properties.
              </p>
            )}
          </div>
        </div>
        {!h.cmpStr(config.env, 'production') && (
          <div className="row mt-5">
            <div className="col-12">
              <TaskListing setLoading={setLoading} />
            </div>
          </div>
        )}
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading} />
    </div>
  );
}
