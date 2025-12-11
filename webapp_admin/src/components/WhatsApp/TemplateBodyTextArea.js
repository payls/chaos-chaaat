import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import { h } from '../../helpers';

// CSS
import mainStyle from '../Automation/ChaaatBuilder/styles/styles.module.scss';

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

import CommonSelect from '../../components/Common/CommonSelect';
import { unescapeData } from '../../helpers/general';

const bodyVariableTypeArr = [
  {
    value: 'contact',
    label: 'Contact',
  },
  {
    value: 'agent',
    label: 'Agent',
  },
];

export default React.memo(
  ({
    onChange,
    form,
    callbackForUpdateBody,
    callbackForUpdateVariables,
    maxChar = 1024,
    nodeDataIndex,
    error = false,
  }) => {
    const textareaRef = useRef(null);
    const pickerRef = useRef(null);
    const [variable, setVariable] = useState(1);
    const [showPicker, setShowPicker] = useState(false);
    const [formattedVariables, setFormattedVariables] = useState({});
    const [body_variables, setBodyVariables] = useState(null);
    const [body_variables_type, setBodyVariablesType] = useState([]);
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
      setBodyVariables(form.body_variables || {});
      if (!body_variables_type || body_variables_type.length < 1) setBodyVariablesType(form.body_variables_type || []);
      updateFormattedBody();
    }, [form]);

    useEffect(() => {
      if (!h.notEmpty(form?.template_body)) {
        setVariable(1);
      }
    }, [form?.template_body]);

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
      const textarea = textareaRef.current;

      const body = h.notEmpty(form?.template_body) ? form?.template_body : '';
      const pattern = /{{\d+}}/g;
      const occurrences = (body.match(pattern) || []).length;

      const newVariable = `{{${occurrences + 1}}}`;
      const { selectionStart, selectionEnd } = textarea;

      const newContent =
        body.slice(0, selectionStart) + newVariable + body.slice(selectionEnd);

      onChange(newContent, 'template_body');
      const newBodyVariables = {
        ...body_variables,
        [newVariable]: '',
      };
      setBodyVariables(newBodyVariables);
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables', newBodyVariables));
      const newBodyVariableTypes = [
        ...body_variables_type,
        'contact',
      ];
      setBodyVariablesType(newBodyVariableTypes);
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables_type', newBodyVariableTypes));
      setVariable((prev) => prev + 1);
      textarea.focus();
    }

    function getVariableArray() {
      const regex = /{{([^}]+)}}/g;
      return form.template_body.match(regex) ?? [];
    }

    function formatBodyVariable(variable, value) {
      const fValues = { ...body_variables };

      fValues[variable] = value;
      setFormattedVariables(fValues);

      let formatted = form.template_body;
      for (const i of Object.keys(fValues)) {
        formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
      }

      callbackForUpdateBody(formatted);
      callbackForUpdateVariables(fValues);

      const bVariables = { ...body_variables };
      bVariables[variable] = value;
      setBodyVariables(bVariables);
    }

    const updateFormattedBody = () => {
      let formatted = form.template_body;
      const fValues = {...body_variables};
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

    const onHandleVariableTypeChange = (v, i) => {
      const newBodyVariableTypes = [
        ...body_variables_type
      ]
      newBodyVariableTypes[i] = v;
      setBodyVariablesType(newBodyVariableTypes)
      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'body_variables_type', newBodyVariableTypes));
    }

    return (
      <>
        <textarea
          ref={textareaRef}
          placeholder="Enter the Text in the language you've selected"
          value={unescapeData(form?.template_body || '')}
          maxLength={maxChar}
          rows={5}
          onChange={(e) => onChange(e.target.value, 'template_body')}
          className={`${mainStyle.templateBodyTextArea} mb-3 form-item ${error ? 'field-error' : ''}`}
        />
        <div className="d-flex justify-content-between">
          {maxChar !== null && (
            <span>
              Character:{' '}
              {h.notEmpty(form?.template_body)
                ? form.template_body.length
                : '0'}
              /{maxChar}
            </span>
          )}
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
                      value={body_variables ? unescapeData(body_variables[item]) : ''}
                      placeholder={`Enter content for ${item}`}
                      onChange={(e) => formatBodyVariable(item, e.target.value)}
                      size={100}
                      className="form-item variable_value"
                      style={{
                        width: '200px',
                        marginLeft: '10px',
                        display: 'inline-block',
                      }}
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
