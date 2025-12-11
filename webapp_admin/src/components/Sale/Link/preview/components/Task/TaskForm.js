import React, {useEffect, useState} from 'react';
import {h} from '../../helpers';
import {useRouter} from 'next/router';
import {api} from '../../api';
import constant from '../../constants/constant.json';

export default function TaskForm({
                                   setLoading,
                                   formMode = h.form.FORM_MODE.ADD,
                                   handleFormCancelled,
                                   handleFormSubmitted,
                                   taskId,
                                 }) {
  const router = useRouter();

  const fieldClass = 'col-12';
  const [formFields, setFormFields] = useState();
  // const [fields, setFields] = useState(h.form.initFields(formFields));
  const [fields, setFields] = useState();

  useEffect(() => {
    let newFormFields = {};
    if (h.cmpStr(formMode, h.form.FORM_MODE.VIEW)) {
      newFormFields = {
        message: {
          field_type: h.form.FIELD_TYPE.TEXTAREA,
          class_name: fieldClass,
          validation: [h.form.FIELD_VALIDATION.REQUIRED],
        },
      };
    } else {
      newFormFields = {
        type: {
          field_type: h.form.FIELD_TYPE.SELECT,
          class_name: fieldClass,
          options: [{text: 'Select task type', value: undefined}].concat(
            Object.keys(constant.TASK.TYPE).map((key) => {
              return {
                text: h.general.prettifyConstant(key),
                value: constant.TASK.TYPE[key],
              };
            }),
          ),
          validation: [h.form.FIELD_VALIDATION.REQUIRED],
          onChange: (value) => {
            switch (value) {
              case constant.TASK.TYPE.TASK:
                newFormFields.type_sub.options = [
                  {text: 'Select a task category', value: undefined},
                ].concat(
                  Object.keys(constant.TASK.TYPE_SUB)
                    .filter((key) => {
                      if (
                        constant.TASK.TYPE_SUB[key]
                          .toLowerCase()
                          .indexOf('task_') > -1
                      )
                        return true;
                      else return false;
                    })
                    .map((key) => {
                      return {
                        text: h.general.prettifyConstant(key),
                        value: constant.TASK.TYPE_SUB[key],
                      };
                    }),
                );
                break;
              case constant.TASK.TYPE.JOB:
                newFormFields.type_sub.options = [
                  {text: 'Select a job category', value: undefined},
                ].concat(
                  Object.keys(constant.TASK.TYPE_SUB)
                    .filter((key) => {
                      if (
                        constant.TASK.TYPE_SUB[key]
                          .toLowerCase()
                          .indexOf('job_') > -1
                      )
                        return true;
                      else return false;
                    })
                    .map((key) => {
                      return {
                        text: h.general.prettifyConstant(key),
                        value: constant.TASK.TYPE_SUB[key],
                      };
                    }),
                );
                break;
            }
          },
        },
        type_sub: {
          field_type: h.form.FIELD_TYPE.SELECT,
          class_name: fieldClass,
          options: [{text: 'Select a task type first', value: undefined}],
          validation: [h.form.FIELD_VALIDATION.REQUIRED],
          label: 'Category',
        },
        subject: {
          field_type: h.form.FIELD_TYPE.TEXT,
          class_name: fieldClass,
          validation: [h.form.FIELD_VALIDATION.REQUIRED],
        },
        message: {
          field_type: h.form.FIELD_TYPE.TEXTAREA,
          class_name: fieldClass,
          validation: [h.form.FIELD_VALIDATION.REQUIRED],
        },
      };
    }
    setFormFields(newFormFields);
    setFields(h.form.initFields(newFormFields));
  }, [formMode]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    switch (formMode) {
      case h.form.FORM_MODE.VIEW:
        await api.taskMessage.create(
          {task_id: taskId, message: fields.message.value},
          false,
        );
        fields.message.value = '';
        setFields(fields);
        break;
      default:
      case h.form.FORM_MODE.ADD:
        await api.task.create({
          type: fields.type.value,
          type_sub: fields.type_sub.value,
          subject: fields.subject.value,
          message: fields.message.value,
        });
        break;
    }
    if (handleFormSubmitted) handleFormSubmitted();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <h.form.GenericForm
          formFields={formFields}
          formMode={
            h.cmpStr(formMode, h.form.FORM_MODE.VIEW)
              ? h.form.FORM_MODE.EDIT
              : formMode
          }
          setLoading={setLoading}
          fields={fields}
          setFields={setFields}
          handleSubmit={handleSubmit}
          submitButtonLabel="Send"
          handleCancel={async (e) => {
            e.preventDefault();
            if (handleFormCancelled) handleFormCancelled();
          }}
        />
      </div>
    </div>
  );
}
