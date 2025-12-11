import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import { h } from '../../helpers';

import {
  faBold,
  faItalic,
  faStrikethrough,
  faPlusCircle,
  faSmile,
  faTimes,
  faCode,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonSelect from '../../components/Common/CommonSelect';
import CommonDropdownAction from '../Common/CommonDrodownAction';

export default React.memo(
  ({
    onChange,
    form,
    fieldError,
    erroredFields,
    callBackQuickReplies,
    callbackForUpdateVariables,
  }) => {
    const textareaRef = useRef(null);
    const pickerRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);
    const [buttons, setButtons] = useState([
      {
        type: 'message',
        label: 'Yes',
        value: 'Yes',
      },
      {
        type: 'message',
        label: 'No',
        value: 'No',
      },
    ]);
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
      if (h.notEmpty(buttons)) {
        callBackQuickReplies(buttons);
      }
    }, [buttons]);

    function handleAddButton() {
      const newBtn = [...buttons];
      newBtn.push({
        value: '',
      });

      setButtons(newBtn);
    }

    function handleUpdateButtonValue(v, index) {
      const newBtn = [...buttons];
      newBtn[index].type = 'message';
      newBtn[index].label = v;
      newBtn[index].value = v;

      setButtons(newBtn);
    }

    function handleDeleteButton(index) {
      const newBtn = [...buttons];
      newBtn.splice(index, 1);

      setButtons(newBtn);
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

    function getListAction() {
      const listActionsArr = [];
      const textarea = textareaRef.current;

      listActionsArr.push({
        label: '{{firstname}}',
        icon: faCode,
        action: () => {
          const newContent =
            (h.notEmpty(form?.template_body) ? form?.template_body : '') +
            `{{firstname}}`;
          onChange(newContent, 'template_body');
          textarea.focus();
        },
      });

      listActionsArr.push({
        label: '{{lastname}}',
        icon: faCode,
        action: () => {
          const newContent =
            (h.notEmpty(form?.template_body) ? form?.template_body : '') +
            `{{lastname}}`;
          onChange(newContent, 'template_body');
          textarea.focus();
        },
      });

      listActionsArr.push({
        label: '{{agentname}}',
        icon: faCode,
        action: () => {
          const newContent =
            (h.notEmpty(form?.template_body) ? form?.template_body : '') +
            `{{agentname}}`;
          onChange(newContent, 'template_body');
          textarea.focus();
        },
      });

      listActionsArr.push({
        label: '{{agency}}',
        icon: faCode,
        action: () => {
          const newContent =
            (h.notEmpty(form?.template_body) ? form?.template_body : '') +
            `{{agency}}`;
          onChange(newContent, 'template_body');
          textarea.focus();
        },
      });

      return listActionsArr;
    }
    return (
      <>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Body<small>*</small>
          </label>
          <div>
            <span
              style={{
                color: '#c5c5c5',
                marginBottom: '5px',
              }}
            >
              Enter message text for the confirmation message
            </span>
            <textarea
              ref={textareaRef}
              value={form?.template_body || ''}
              maxLength={240}
              rows={5}
              onChange={(e) => onChange(e.target.value, 'template_body')}
              className={`mb-3 form-item ${
                fieldError && erroredFields.includes('Body')
                  ? 'field-error'
                  : ''
              }`}
            />
            <div className="d-flex justify-content-between">
              <span>
                Character:{' '}
                {h.notEmpty(form?.template_body)
                  ? form.template_body.length
                  : '0'}
                /240
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
                <CommonDropdownAction
                  items={getListAction()}
                  icon={false}
                  className="d-inline"
                  html={
                    <button type="button" className="icon-btn">
                      <FontAwesomeIcon
                        icon={faPlusCircle}
                        color="#182327"
                        style={{ marginRight: '5px' }}
                      />
                      Add Variable
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Actions<small>*</small>
          </label>
          <div>
            <>
              <div className="d-flex" style={{ gap: '1em' }}>
                {buttons &&
                  buttons.length > 0 &&
                  buttons.map((btn, i) => (
                    <div className="quick-replies-wrapper">
                      <label>Action Button {i + 1}</label>
                      <span>
                        <input
                          type="text"
                          value={btn.value}
                          onChange={(e) =>
                            handleUpdateButtonValue(e.target.value, i)
                          }
                          size={100}
                          maxLength={20}
                          style={{ width: '300px' }}
                          className={`mb-3 form-item ${
                            fieldError &&
                            h.isEmpty(btn.value) &&
                            erroredFields.includes('Action Buttons')
                              ? 'field-error'
                              : ''
                          }`}
                        />
                        <small> {btn.value.length}/20</small>
                      </span>
                    </div>
                  ))}
              </div>
            </>
          </div>
        </div>
      </>
    );
  },
);
