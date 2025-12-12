import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import { h } from '../../helpers';

import {
  faBold,
  faItalic,
  faStrikethrough,
  faPlusCircle,
  faSmile,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getUpdatedNodeData
} from '../Automation/ChaaatBuilder/store/functions';

import useSideBarStore from '../Automation/ChaaatBuilder/store'

export default React.memo(
  ({
    onChange,
    form,
    setTemplateForm,
    callbackForUpdateBody,
    callbackForUpdateVariables,
    disabled,
    className = 'mb-3',
    nodeDataIndex,
    moduleType = "template"
  }) => {
    const textareaRef = useRef(null);
    const pickerRef = useRef(null);
    const [variable, setVariable] = useState(1);
    const [showPicker, setShowPicker] = useState(false);
    const [formattedVariables, setFormattedVariables] = useState({});
    const [bodyVariables, setBodyVariables] = useState({});
    const {
      setNodeData,
      nodeData,
    } = useSideBarStore();
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target)) {
          setShowPicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [pickerRef]);

    useEffect(() => {
      if (moduleType !== "automation") {
        setBodyVariables(form.body_variables);
        updateFormattedBody();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }
    }, [form]);

    function getVariableArray(body) {
      const regex = /{{([^}]+)}}/g;
      if (body) {
        return body?.match(regex) ?? [];  
      }
      return form.template_body?.match(regex) ?? [];
    }

    useEffect(() => {
      if (!h.notEmpty(form?.template_body)) {
        setVariable(1);
      }
    }, [form?.template_body]);

    const getFormattedBody = (template_body, body_variables) => {
      let formatted = template_body;
      const fValues = {...body_variables};
      if (
        typeof fValues === 'object' &&
        fValues !== null &&
        Object.keys(fValues).length !== 0
      ) {
        for (const i of Object.keys(fValues)) {
          formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
        }
      }
      return formatted
    };

    const handleBodyChange = (e) => {
      let newBodyVariables = form.body_variables ? form.body_variables : {}
      let newBodyVariableTypes = form.body_variables_type ? form.body_variables_type : []
      const variables = getVariableArray(e.target.value)
      const formBodyVariables = form?.body_variables ?? {}
      if (variables.length > Object.keys(formBodyVariables)?.length) {
        const newVariable = `{{${Object.keys(form.body_variables)?.length + 1}}}`;
        newBodyVariables = {
          ...form.body_variables,
          [newVariable]: '',
        };
        newBodyVariableTypes = [
          ...form.body_variables_type,
          'contact',
        ];
        setVariable((prev) => prev + 1);
      }
      setTemplateForm({
        ...form,
        template_body: e.target.value,
        body_variables: newBodyVariables,
        body_variables_type: newBodyVariableTypes
      })
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables', newBodyVariables));
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables_type', newBodyVariableTypes));
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'template_body', e.target.value));
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'formattedBody', getFormattedBody(e.target.value, newBodyVariables)));
    }

    function formatSelectedMessage(type) {
      let mode = '';

      switch (type) {
        case 'bold':
          mode = '*';
          break;
        case 'italic':
          mode = '_';
          break;
        case 'strikethrough':
          mode = '~';
          break;
        default:
          break;
      }

      const textarea = textareaRef.current;

      // Get the selected word
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.slice(start, end);

      const modifiedText =
        form.template_body.slice(0, start) +
        mode +
        selectedText +
        mode +
        form.template_body.slice(end);

      onChange(modifiedText, 'template_body');
      textarea.focus();
    }

    const onEmojiClick = (emojiObject) => {
      const newContent =
        (h.notEmpty(form?.template_body) ? form?.template_body : '') +
        emojiObject.emoji;
      onChange(newContent, 'template_body');
      setShowPicker(false);
      const textarea = textareaRef.current;
      textarea.focus();
    };

    function addVariable() {
      if (moduleType === "automation") {
        const textarea = textareaRef.current;
        const body = h.notEmpty(form?.template_body) ? form?.template_body : '';
        const variables = getVariableArray(body)
        const newVariable = `{{${variables.length + 1}}}`;
        const { selectionStart, selectionEnd } = textarea;

        const newContent =
          body.slice(0, selectionStart) + newVariable + body.slice(selectionEnd);

        const newBodyVariables = {
          ...form.body_variables,
          [newVariable]: '',
        };
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables', newBodyVariables));
        const newBodyVariableTypes = [
          ...form.body_variables_type,
          'contact',
        ];
        
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables_type', newBodyVariableTypes));
        setVariable((prev) => prev + 1);
        setTemplateForm({
          ...form,
          template_body: newContent,
          body_variables: newBodyVariables,
          body_variables_type: newBodyVariableTypes
        })
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'template_body', newContent));
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'formattedBody', getFormattedBody(newContent, newBodyVariables)));
        textarea.focus();
      } else {
        const textarea = textareaRef.current;
  
        const body = h.notEmpty(form?.template_body) ? form?.template_body : '';
        const pattern = /{{\d+}}/g;
        const occurrences = (body.match(pattern) || []).length;
  
        const newVariable = `{{${occurrences + 1}}}`;
        const { selectionStart, selectionEnd } = textarea;
  
        const newContent =
          body.slice(0, selectionStart) + newVariable + body.slice(selectionEnd);
  
        onChange(newContent, 'template_body');
        setVariable(occurrences + 1);
        textarea.focus();
      }
    }

    function formatBodyVariable(variable, value) {
      if (moduleType === "automation") {
        const fValues = { ...form.body_variables };
        fValues[variable] = value;
        let formatted = form.template_body;
        for (const i of Object.keys(fValues)) {
          formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
        }
        callbackForUpdateBody(formatted);
        callbackForUpdateVariables(fValues);
      } else {
        const fValues = { ...formattedVariables };

        fValues[variable] = value;
        setFormattedVariables(fValues);

        let formatted = form.template_body;
        for (const i of Object.keys(fValues)) {
          formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
        }

        callbackForUpdateBody(formatted);
        callbackForUpdateVariables(fValues);

        const bVariables = { ...bodyVariables };
        bVariables[variable] = value;
        setBodyVariables(bVariables);
      }
    }

    const onHandleVariableTypeChange = (v, i) => {
      const newBodyVariableTypes = [
        ...form.body_variables_type
      ]
      newBodyVariableTypes[i] = v;
      if (moduleType === "automation") {
        setTemplateForm({...form, body_variables_type: newBodyVariableTypes})
        setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables_type', newBodyVariableTypes));
      } else {
        onChange(newBodyVariableTypes, 'body_variables_type');
      }
    }

    function getVariableArray() {
      const regex = /{{([^}]+)}}/g;
      return form?.template_body?.match(regex) ?? [];
    }

    function formatBodyVariable(variable, value) {
      const fValues = { ...formattedVariables };

      fValues[variable] = value;
      setFormattedVariables(fValues);

      let formatted = form.template_body;
      for (const i of Object.keys(fValues)) {
        formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
      }

      callbackForUpdateBody(formatted);
      callbackForUpdateVariables(fValues);

      const bVariables = { ...bodyVariables };
      bVariables[variable] = value;
      setBodyVariables(bVariables);
    }

    const updateFormattedBody = () => {
      let formatted = form.template_body;
      const fValues = form.body_variables;
      if (
        typeof fValues === 'object' &&
        fValues !== null &&
        Object.keys(fValues).length !== 0
      ) {
        for (const i of Object.keys(fValues)) {
          formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
        }
        callbackForUpdateBody(formatted); // Replace with your actual callback function
        callbackForUpdateVariables(fValues); // Replace with your actual callback function
      }
    };

    return (
      <>
        <textarea
          ref={textareaRef}
          placeholder="Enter the Text in the language you've selected"
          value={form?.template_body || ''}
          maxLength={1024}
          rows={5}
          onChange={(e) =>
            moduleType !== "automation"
              ? onChange(e.target.value, "template_body")
              : handleBodyChange(e)
          }
          className={className}
          disabled={disabled}
        />
        <div className="d-flex justify-content-between">
          <span>
            Character:{' '}
            {h.notEmpty(form?.template_body) ? form.template_body.length : '0'}
            /1024
          </span>
          <div style={{ position: 'relative' }}>
            {showPicker && (
              <div
                style={{ position: 'absolute' }}
                className="emoji-container"
                ref={pickerRef}
              >
                <Picker
                  pickerStyle={{ width: '100%' }}
                  onEmojiClick={onEmojiClick}
                />
              </div>
            )}
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowPicker((val) => !val)}
              disabled={disabled}
            >
              <FontAwesomeIcon
                icon={faSmile}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                formatSelectedMessage('bold');
              }}
              disabled={disabled}
            >
              <FontAwesomeIcon
                icon={faBold}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                formatSelectedMessage('italic');
              }}
              disabled={disabled}
            >
              <FontAwesomeIcon
                icon={faItalic}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                formatSelectedMessage('strikethrough');
              }}
              disabled={disabled}
            >
              <FontAwesomeIcon
                icon={faStrikethrough}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                addVariable();
              }}
              disabled={disabled}
            >
              <FontAwesomeIcon
                icon={faPlusCircle}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
              Add Variable
            </button>
          </div>
        </div>
        {h.notEmpty(form?.template_body) && getVariableArray().length > 0 && (
          <>
            <hr />
            <span
              style={{
                color: '#c5c5c5',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Set variable type and add sample data
            </span>
            {getVariableArray().map((item, i) => (
              <>
                <div className="quick-replies-input-wrapper" key={i}>
                  <div>
                    <div
                      className="modal-radio-input-group"
                      style={{ display: 'inline-block' }}
                    >
                      <select
                        name={`variable_type${i}`}
                        className="form-item variable_type"
                        style={{
                          marginLeft: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          padding: '8px',
                          width: '150px',
                        }}
                        disabled={disabled}
                        onChange={(event) => onHandleVariableTypeChange(
                          event.target.value,
                          i,
                        )}
                      >
                        <option
                          value="contact"
                          selected={
                            h.isEmpty(form.body_variables_type) ||
                            h.cmpStr(form.body_variables_type[i], 'contact')
                          }
                        >
                          Contact
                        </option>
                        <option
                          value="agent"
                          selected={
                            !h.isEmpty(form.body_variables_type) &&
                            h.cmpStr(form.body_variables_type[i], 'agent')
                          }
                        >
                          Agent
                        </option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={
                        moduleType === "automation"
                          ? form?.body_variables
                            ? form?.body_variables?.[item]
                            : ""
                          : bodyVariables
                            ? bodyVariables[item]
                            : ""
                      }
                      placeholder={`Enter content for ${item}`}
                      onChange={(e) => formatBodyVariable(item, e.target.value)}
                      size={100}
                      className="form-item variable_value"
                      style={{
                        width: '200px',
                        marginLeft: '10px',
                        display: 'inline-block',
                      }}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </>
            ))}
          </>
        )}
      </>
    );
  },
);
