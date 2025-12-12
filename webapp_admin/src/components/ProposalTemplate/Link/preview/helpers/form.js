import React, { useState } from 'react';
import { h } from './index';
import { Button, Form } from 'react-bootstrap';
import Cropper from 'react-cropper';
import Link from 'next/dist/client/link';

export const FORM_MODE = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
  DELETE: 'delete',
};

export const FIELD_TYPE = {
  TEXT: 'text',
  PASSWORD: 'password',
  DATE: 'date',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  FILE: 'file',
  FILE_WITH_CROPPER: 'file_with_cropper',
  LINK: 'link',
  SECTION: 'section',
};

export const FIELD_VALIDATION = {
  REQUIRED: (key, value, fields) => {
    let error = '';
    if (h.isEmpty(value))
      error = `${h.general.prettifyConstant(key)} is required`;
    return error;
  },
  VALID_EMAIL: (key, value, fields) => {
    let error = '';
    if (h.isEmpty(value) || !h.validate.validateEmail(value))
      error = `${h.general.prettifyConstant(key)} is not valid`;
    return error;
  },
  VALID_PASSWORD: (key, value, fields) => {
    let error = '';
    if (h.isEmpty(value) || !h.validate.validatePassword(value))
      error = `${h.general.prettifyConstant(
        key,
      )} has to be at least 8 characters with a mix of letters and numbers`;
    return error;
  },
  PHONENUMBER: (key, value, fields) => {
    let error = '';
    if (h.isEmpty(value) || !h.validate.validateEmail(value))
      error = `${h.general.prettifyConstant(key)} is not valid`;
    return error;
  },
};

/**
 * Initialise form fields in state
 * @param {object} fields
 * @returns {{}}
 */
export function initFields(fields) {
  if (h.isEmpty(fields)) return {};
  fields.formFields = {};
  for (let key in fields) {
    fields.formFields[key] = key;
    fields[key] = h.notEmpty(fields[key]) ? fields[key] : {};
    fields[key].value = fields[key].value || ''; //Store actual value of field
    fields[key].error = ''; //Store error message of field
    fields[key].dirty = fields[key].dirty || false; //Flag to indicate whether field has been edited before
  }
  return fields;
}

/**
 * Input on change handler
 * @param {ChangeEvent<HTMLInputElement>>} e
 * @param {string} fieldName
 * @param {object} fields
 * @param {function} setFields
 * @param {function} [validate]
 * @param {function} [onChange]
 */
export function onChange(e, fieldName, fields, setFields, validate, onChange) {
  let value = '';
  if (h.cmpStr(e.target.type, h.form.FIELD_TYPE.CHECKBOX)) {
    let currentValue = fields[fieldName].value;
    value = h.cmpInt(currentValue, 1) ? 0 : 1;
  } else {
    value = e.target.value;
  }
  let newFields = this.updateFields(fieldName, fields, setFields, { value });
  if (validate) validate(fieldName, newFields, setFields);
  if (onChange) onChange(value);
}

/**
 * Input file on change handler
 * @param {InputEvent<HTMLInputElement>} e
 * @param {string} fieldName
 * @param {object} fields
 * @param {function} setFields
 */
export function onSelectFile(e, fieldName, fields, setFields) {
  if (e.target.files && e.target.files.length > 0) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      h.form.updateFields(fieldName, fields, setFields, {
        value_new: reader.result,
      });
    });
    reader.readAsDataURL(e.target.files[0]);
  }
}

/**
 * Update fields
 * @param {string} fieldName
 * @param {object} fields
 * @param {function} setFields
 * @param {{value?:string, value_new?:string, error?:string, dirty?:boolean}} options={dirty:true}
 */
export function updateFields(fieldName, fields, setFields, options) {
  const newFields = Object.assign({}, fields, {
    [fieldName]: {
      value: options.value,
      value_new: options.value_new,
      error:
        typeof options.error === 'string'
          ? options.error
          : fields[fieldName].error,
      dirty: options.dirty || true,
    },
  });
  setFields(newFields);
  return newFields;
}

/**
 * Custom <form>
 * @param {{onSubmit?:function, children:object, inline?:boolean, className?:string}} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomForm(props) {
  const {
    onSubmit = function () {},
    children,
    inline,
    className,
    style,
  } = props;
  return (
    <Form
      className={className}
      inline={inline}
      onSubmit={onSubmit}
      style={style}
    >
      {children}
    </Form>
  );
}

/**
 * Custom <input> and <textarea>
 * @param {{data:object, type:string, placeholder:string, onChange:function, hintText:string, label?:string, name:string, as?:string, rows?:string, style?:object, className?:string}} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomInput(props) {
  const {
    data,
    type,
    label,
    name,
    onChange,
    placeholder,
    hintText,
    readOnly = false,
    onKeyPress,
    style,
    className,
  } = props;
  const value = data.value || '';
  const as = h.cmpStr(type, 'textarea') ? props.as : undefined;
  const rows = h.cmpStr(type, 'textarea') ? props.rows : undefined;
  return (
    <Form.Group>
      {h.notEmpty(label) && <Form.Label>{label}</Form.Label>}
      <Form.Control
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        isInvalid={h.notEmpty(data.error)}
        value={value}
        as={as}
        rows={rows}
        readOnly={readOnly}
        onKeyPress={onKeyPress}
        style={style}
        className={className}
      />
      {h.notEmpty(data.error) ? (
        <Form.Control.Feedback
          type="invalid"
          style={{ whiteSpace: 'pre-line' }}
        >
          {data.error}
        </Form.Control.Feedback>
      ) : h.notEmpty(hintText) ? (
        <Form.Text className="text-muted">{hintText}</Form.Text>
      ) : (
        ''
      )}
    </Form.Group>
  );
}

/**
 * Custom <input type="checkbox">
 * @param {{
 *  key?:string,
 *  data:object,
 *  name:string,
 *  onChange:function,
 *  disabled?:boolean,
 *  label?:string,
 *  checked?:boolean
 * }} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomCheckbox(props) {
  const {
    key = Date.now(),
    data = {},
    name,
    onChange,
    disabled = false,
    label = '',
  } = props;
  let checked = false;
  if (h.cmpInt(data.value, 1)) checked = true;
  return (
    <Form.Check type="checkbox" id={key} disabled={disabled}>
      <Form.Check.Input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <Form.Check.Label>{label}</Form.Check.Label>
      {h.notEmpty(data.error) && (
        <Form.Control.Feedback type="invalid">
          {data.error}
        </Form.Control.Feedback>
      )}
    </Form.Check>
  );
}

/**
 * Custom <select>
 * @param {{ data:object, label?:string, name:string, onChange?:function, multiple?:boolean, options:object, readOnly?:boolean }} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomSelect(props) {
  const {
    data,
    label,
    name,
    onChange,
    multiple,
    options,
    readOnly = false,
    onKeyPress,
  } = props;
  const value = data.value || '';
  let menuItems = [];
  for (let i = 0; i < options.length; i++) {
    let option = options[i];
    menuItems.push(
      <option key={`${option.value}_${i}`} value={option.value}>
        {option.text}
      </option>,
    );
  }
  return (
    <Form.Group>
      {h.notEmpty(label) && <Form.Label>{label}</Form.Label>}
      <Form.Control
        name={name}
        onChange={onChange}
        isInvalid={h.notEmpty(data.error)}
        value={value}
        as="select"
        multiple={multiple}
        disabled={readOnly}
        onKeyPress={onKeyPress}
      >
        {menuItems}
      </Form.Control>
      {h.notEmpty(data.error) ? (
        <Form.Control.Feedback
          type="invalid"
          style={{ whiteSpace: 'pre-line' }}
        >
          {data.error}
        </Form.Control.Feedback>
      ) : (
        ''
      )}
    </Form.Group>
  );
}

/**
 * Custom <input type=file/>
 * @param { data:object, label:string, name:string, onChange?:function } props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomUpload(props) {
  const { data, label, name, onChange } = props;
  const value = data.value || '';
  const error = h.notEmpty(data.error) ? data.error : undefined;
  return (
    <span>
      <Form.Group>
        {h.notEmpty(value) && <img style={{ maxWidth: 100 }} src={value} />}
        <Form.File
          name={name}
          label={label}
          onChange={onChange}
          isInvalid={h.notEmpty(data.error)}
          feedback={error}
        />
      </Form.Group>
    </span>
  );
}

/**
 * Custom <button>
 * @param {{
 * 	key?:string,
 * 	variant?:string,
 * 	type?:string,
 * 	onClick?:function,
 * 	children:*,
 * 	className?:string,
 * 	style?:object
 * 	}} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomButton(props) {
  const {
    key = Date.now(),
    variant = 'primary',
    type = 'submit',
    onClick = function () {},
    children,
    className,
    style = {},
  } = props;
  let buttonClassName;
  switch (variant) {
    case 'primary2':
      buttonClassName = `${className} btn-custom-primary2`;
      break;
    default:
      buttonClassName = className;
  }
  return (
    <Button
      key={key}
      variant={variant}
      type={type}
      onClick={onClick}
      className={buttonClassName}
      style={style}
    >
      {children}
    </Button>
  );
}

/**
 * Generic form component
 * @param {{
 * 		formFields:object,
 * 		formMode:string,
 * 		setLoading?:function,
 * 		validate?:function,
 * 		fields:object,
 * 		setFields:function,
 * 		submitButtonLabel?:string,
 * 		cancelButtonLabel?:string,
 * 		showCancelButton?:boolean,
 * }} props
 * @returns {JSX.Element}
 * @constructor
 */
export function GenericForm(props) {
  const {
    formFields, //Form field definitions
    formMode, //Mode of submitButtonLabelform: add, edit
    setLoading, //To trigger loading indicator
    fields, //State to store field values and error messages
    setFields, //Function to update fields
    handleSubmit, //Function to handle form submission behaviour
    handleCancel = () => {}, //Function to handle form cancel button event
    buttonWrapperClassName = 'text-center',
    submitButtonBeforeContent = <span></span>,
    submitButtonLabel = h.cmpStr(formMode, h.form.FORM_MODE.ADD)
      ? 'Submit'
      : 'Update', //Custom submit button label
    submitButtonVariant = 'primary',
    submitButtonClassName = '',
    submitButtonStyle = {},
    cancelButtonLabel = 'Cancel', //Custom cancel button label
    showCancelButton = true, //Indicate whether cancel button is visible
    showCustomButton = false, // Custom button
    customButtonVariant = 'primary',
    customButtonClassName = '',
    customButtonStyle = {},
    customButtonLabel = '',
    handleCustom = () => {},
    disableEnter = false,
  } = props;

  //For image upload cropping
  const [cropper, setCropper] = useState(null);
  const onCropperInit = (cropper) => {
    setCropper(cropper);
  };

  const validate = (key, fields, setFields) => {
    const value = fields[key].value;
    let error = processValidation(key, fields);
    fields[key] = { value, error, dirty: true };

    //Re-validate fields with errors
    for (let fieldKey in fields) {
      if (h.notEmpty(fields[fieldKey].error)) {
        let fieldError = processValidation(key, fields);
        fields[fieldKey].error = fieldError;
      }
    }

    setFields(Object.assign({}, fields));
  };

  const validateAll = (fields, setFields) => {
    for (let key in fields) {
      if (!h.cmpStr(key, 'formFields')) {
        let error = processValidation(key, fields);
        fields[key].error = error;
      }
    }
    setFields(Object.assign({}, fields));
  };

  const processValidation = (key, fields) => {
    const value = fields[key].value;
    let error = '';
    const fieldValidations = formFields[key].validation;
    if (formFields && formFields[key] && h.notEmpty(fieldValidations)) {
      for (let i = 0; i < fieldValidations.length; i++) {
        const fieldValidation = fieldValidations[i];
        if (h.isEmpty(error)) {
          error = fieldValidation(key, value, fields);
        } else {
          error += `\n${fieldValidation(key, value, fields)}`;
        }
      }
    }
    return error;
  };

  const preHandleSubmit = (e) => {
    e.preventDefault();
    let isFormValid = true;
    let fieldsCopy = validateAll(fields, setFields);
    for (let key in fields) {
      if (h.notEmpty(fields[key].error)) isFormValid = false;
    }
    if (isFormValid) {
      //Extract file upload with cropping value
      for (let fieldKey in fields) {
        const { field_type } = formFields[fieldKey];
        if (h.cmpStr(field_type, h.form.FIELD_TYPE.FILE_WITH_CROPPER)) {
          fields[fieldKey].value_cropped = cropper
            .getCroppedCanvas()
            .toDataURL();
        }
      }
      setFields(fields);
      handleSubmit(e);
    } else {
      // setFields(Object.assign({}, fields));
    }
  };

  const onKeyPress = (event) => {
    if (event.charCode === 13 && !disableEnter) {
      preHandleSubmit(event);
    }
  };

  return (
    <h.form.CustomForm onSubmit={preHandleSubmit}>
      <div className="row mt-3">
        {h.notEmpty(fields) &&
          Object.keys(formFields).map((fieldKey) => {
            const formField = formFields[fieldKey];
            const {
              field_type: fieldType = null, //Form field type E.g. text, date, textarea, select
              class_name = 'col-12 col-sm-6', //CSS classname
              read_only = h.notEmpty(fields[fieldKey].readOnly)
                ? fields[fieldKey].readOnly
                : h.cmpStr(formMode, h.form.FORM_MODE.VIEW), //Indicates whether form field will be editable or not
              visible = true, //Indicates whether to field is visible or not
              options = [{ text: 'Select an option', value: '' }], //For <select><option>
              checked = false, //For checkboxes & radio buttons to indicate whether it is checked or not
              label = h.general.prettifyConstant(fieldKey), //Field label (default: prettifying of field key)
              style,
              placeholder = h.general.prettifyConstant(fieldKey),
              onChange = () => {}, //Field on change callback,
              href, //Route for Link
            } = formField || {};
            switch (fieldType) {
              case h.form.FIELD_TYPE.TEXT:
                return visible ? (
                  <div className={class_name}>
                    <h.form.CustomInput
                      label={label}
                      data={fields[fieldKey]}
                      name={fieldKey}
                      type="text"
                      onChange={(e) =>
                        h.form.onChange(
                          e,
                          fieldKey,
                          fields,
                          setFields,
                          validate,
                          onChange,
                        )
                      }
                      readOnly={read_only}
                      onKeyPress={onKeyPress}
                      style={style}
                      placeholder={placeholder}
                    />
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.PASSWORD:
                return visible ? (
                  <div className={class_name}>
                    <h.form.CustomInput
                      label={label}
                      data={fields[fieldKey]}
                      name={fieldKey}
                      type="password"
                      onChange={(e) =>
                        h.form.onChange(
                          e,
                          fieldKey,
                          fields,
                          setFields,
                          validate,
                          onChange,
                        )
                      }
                      readOnly={read_only}
                      onKeyPress={onKeyPress}
                      style={style}
                      placeholder={placeholder}
                    />
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.DATE:
                return visible ? (
                  <div className={class_name}>
                    <h.form.CustomInput
                      label={label}
                      data={fields[fieldKey]}
                      name={fieldKey}
                      type="date"
                      onChange={(e) =>
                        h.form.onChange(
                          e,
                          fieldKey,
                          fields,
                          setFields,
                          validate,
                          onChange,
                        )
                      }
                      readOnly={read_only}
                      onKeyPress={onKeyPress}
                      style={style}
                      placeholder={placeholder}
                    />
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.TEXTAREA:
                return visible ? (
                  <div className={class_name}>
                    <h.form.CustomInput
                      label={label}
                      data={fields[fieldKey]}
                      name={fieldKey}
                      type="textarea"
                      onChange={(e) =>
                        h.form.onChange(
                          e,
                          fieldKey,
                          fields,
                          setFields,
                          validate,
                          onChange,
                        )
                      }
                      as="textarea"
                      rows={3}
                      readOnly={read_only}
                      onKeyPress={onKeyPress}
                      style={style}
                      placeholder={placeholder}
                    />
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.SELECT:
                return visible ? (
                  <div className={class_name}>
                    <h.form.CustomSelect
                      label={label}
                      data={fields[fieldKey]}
                      name={fieldKey}
                      onChange={(e) =>
                        h.form.onChange(
                          e,
                          fieldKey,
                          fields,
                          setFields,
                          validate,
                          onChange,
                        )
                      }
                      options={options}
                      readOnly={read_only}
                      onKeyPress={onKeyPress}
                      style={style}
                    />
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.CHECKBOX:
                return visible ? (
                  <div className={class_name}>
                    <h.form.CustomCheckbox
                      label={label}
                      data={fields[fieldKey]}
                      name={fieldKey}
                      onChange={(e) =>
                        h.form.onChange(
                          e,
                          fieldKey,
                          fields,
                          setFields,
                          validate,
                          onChange,
                        )
                      }
                      readOnly={read_only}
                      onKeyPress={onKeyPress}
                      style={style}
                    />
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.FILE_WITH_CROPPER:
                return visible ? (
                  <div className={class_name}>
                    {h.notEmpty(fields[fieldKey].value_new) &&
                    !h.cmpStr(formMode, h.form.FORM_MODE.VIEW) ? (
                      <Cropper
                        src={fields[fieldKey].value_new}
                        style={{ height: 300, width: '100%' }}
                        aspectRatio={1 / 1}
                        guides={true}
                        viewMode={1}
                        responsive={true}
                        onInitialized={onCropperInit}
                      />
                    ) : (
                      <img
                        className="img-fluid"
                        src={fields[fieldKey].value_new}
                      />
                    )}
                    {!h.cmpStr(formMode, h.form.FORM_MODE.VIEW) && (
                      <h.form.CustomUpload
                        label={label}
                        data={fields[fieldKey]}
                        name={fieldKey}
                        onChange={(e) =>
                          h.form.onSelectFile(e, fieldKey, fields, setFields)
                        }
                        readOnly={read_only}
                        onKeyPress={onKeyPress}
                        formMode={formMode}
                        style={style}
                      />
                    )}
                    {h.cmpStr(formMode, h.form.FORM_MODE.VIEW) && (
                      <img
                        className="img-fluid mb-3"
                        style={{ maxWidth: 200 }}
                        src={fields[fieldKey].value}
                      />
                    )}
                  </div>
                ) : (
                  ''
                );
                break;
              case h.form.FIELD_TYPE.SECTION:
                return (
                  <div className={class_name}>
                    <h5>{h.general.prettifyConstant(fieldKey)}</h5>
                  </div>
                );
                break;
              case h.form.FIELD_TYPE.LINK:
                return visible ? (
                  <div className={class_name}>
                    <Link href={href}>{label}</Link>
                  </div>
                ) : (
                  ''
                );
                break;
            }
          })}

        {h.notEmpty(submitButtonBeforeContent) && (
          <div className={`col-12 col-sm-12 mt-3`}>
            {submitButtonBeforeContent}
          </div>
        )}

        {!h.cmpStr(formMode, h.form.FORM_MODE.VIEW) && (
          <div className={`col-12 col-sm-12 ${buttonWrapperClassName}`}>
            {showCancelButton && (
              <h.form.CustomButton variant="secondary" onClick={handleCancel}>
                {cancelButtonLabel}
              </h.form.CustomButton>
            )}

            {showCustomButton && (
              <h.form.CustomButton
                variant={customButtonVariant}
                className={`ml-1 ${customButtonClassName}`}
                style={customButtonStyle}
                onClick={handleCustom}
              >
                {customButtonLabel}
              </h.form.CustomButton>
            )}

            <h.form.CustomButton
              variant={submitButtonVariant}
              className={`ml-1 ${submitButtonClassName}`}
              style={submitButtonStyle}
            >
              {submitButtonLabel}
            </h.form.CustomButton>
          </div>
        )}
      </div>
    </h.form.CustomForm>
  );
}
