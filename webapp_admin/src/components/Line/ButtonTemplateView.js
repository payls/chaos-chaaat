import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import { api } from '../../api';

import {
  faBold,
  faItalic,
  faStrikethrough,
  faPlusCircle,
  faSmile,
  faTimes,
  faImage,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonSelect from '../Common/CommonSelect';

export default React.memo(
  ({
    onChange,
    form,
    setLoading,
    headerOption,
    setHeaderOption,
    source,
    setSource,
    sourceUrl,
    setSourceUrl,
    sourceThumbnail,
    setSourceThumbnail,
    directURL,
    setDirectURL,
    handleAddQuickReplies,
    fieldError,
    callbackForUpdateVariables,
  }) => {
    const textareaRef = useRef(null);
    const pickerRef = useRef(null);
    const fileRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);
    const [uploadURL, setUploadURL] = useState('');
    const [buttons, setButtons] = useState(form.quick_replies);
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
        handleAddQuickReplies(buttons);
      }
    }, [buttons]);

    function handleHeaderOptionAction(type) {
      setHeaderOption(type);
      onChange(type, 'template_header');
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

    async function handleOnChangeFile(e) {
      const files = e.target.files;
      setLoading(true);
      let uploadFiles = [...files];
      let newlyUploadFiles = [];
      if (h.notEmpty(uploadFiles)) {
        for (let i = 0; i < uploadFiles.length; i++) {
          const targetFile = uploadFiles[i];
          if (headerOption === 'image' && targetFile.size > 10485760) {
            h.general.alert('error', {
              message: 'Image must be not more than 10MB',
            });
          } else if (headerOption === 'video' && targetFile.size > 209715200) {
            h.general.alert('error', {
              message: 'Video must be not more than 200MB',
            });
          } else {
            const formData = new FormData();
            formData.append('file', targetFile);
            const uploadResponse = await api.upload.upload(
              formData,
              constant.UPLOAD.TYPE.MESSAGE_MEDIA,
              false,
            );
            if (h.cmpStr(uploadResponse.status, 'ok')) {
              newlyUploadFiles.push({
                full_file_url: uploadResponse.data.file.full_file_url,
                file_url: uploadResponse.data.file.file_url,
                file_name: uploadResponse.data.file.file_name,
                thumbnail: uploadResponse.data.file.file_thumbnail,
              });
            }
          }
        }
      }
      if (!h.isEmpty(newlyUploadFiles)) {
        setUploadURL(newlyUploadFiles[0].full_file_url);
        setSourceUrl(newlyUploadFiles[0].full_file_url);
        if (headerOption === 'image') {
          setSourceThumbnail(newlyUploadFiles[0].full_file_url);
        } else {
          setSourceThumbnail(newlyUploadFiles[0].thumbnail);
        }
      } else {
        setUploadURL('');
        setSourceUrl(null);
        setSourceThumbnail(null);
      }
      setLoading(false);
    }

    function handleAddButton() {
      const newBtn = [...buttons];
      newBtn.push({
        value: '',
      });

      setButtons(newBtn);
    }

    function handleUpdateButtonValue(v, index, action = null) {
      const newBtn = [...buttons];
      if (action === 'action') {
        newBtn[index].action = v;
      } else if (action === 'action_value') {
        newBtn[index].action_value = v;
      } else {
        newBtn[index].value = v;
      }

      setButtons(newBtn);
    }

    function handleDeleteButton(index) {
      const newBtn = [...buttons];
      newBtn.splice(index, 1);

      setButtons(newBtn);
    }

    return (
      <>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Heading Thumbnail Image<small>*</small>
          </label>
          <div>
            <>
              <div
                className="d-flex mt-2 modal-radio-input-group"
                style={{ display: 'inline' }}
              >
                <input
                  name="image_source"
                  type="radio"
                  value="agent"
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    setSource('upload');
                    setSourceUrl(uploadURL);
                  }}
                  disabled={true}
                />
                <label>File Upload</label>
                <input
                  name="image_source"
                  type="radio"
                  value="agent"
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    setSource('url');
                    setSourceUrl(directURL);
                    setSourceThumbnail(null);
                  }}
                  disabled={true}
                  defaultChecked
                />
                <label>
                  {`${headerOption
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}`}{' '}
                  URL
                </label>
              </div>
              <div
                style={{
                  display: `${source === 'upload' ? 'block' : 'none'}`,
                }}
              >
                <div
                  className="send-msg-txtarea d-flex align-items-center"
                  style={{ width: '100%', gap: '1em' }}
                >
                  {headerOption === 'image' && (
                    <input
                      type={'file'}
                      id={'csvFileInput'}
                      accept={'image/png,image/jpeg,image/jpg'}
                      onChange={handleOnChangeFile}
                      ref={fileRef}
                      className="form-item mt-2"
                      disabled={true}
                    />
                  )}
                </div>
              </div>
              <div
                style={{
                  display: `${source === 'url' ? 'block' : 'none'}`,
                }}
              >
                <input
                  type="text"
                  value={directURL}
                  className="form-item mt-2"
                  onChange={(e) => {
                    setDirectURL(e.target.value);
                    setSourceUrl(e.target.value);
                    if (headerOption === 'image') {
                      setSourceThumbnail(e.target.value);
                    }
                  }}
                  placeholder={`Paste desired image url here. File size must not exceed 10MB to avoid sending problem.`}
                  disabled={true}
                />
              </div>
            </>
          </div>
        </div>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Header Title<small className="chip">Optional</small>
          </label>
          <div>
            <input
              placeholder="Enter header title"
              type="text"
              value={form.header_title}
              className={`form-item`}
              onChange={(e) => {
                onChange(e.target.value, 'header_title');
              }}
              maxLength={40}
              disabled={true}
            />
            <small>
              Character:{' '}
              {h.notEmpty(form?.header_title) ? form.header_title.length : '0'}
              /40
            </small>
          </div>
        </div>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Body<small>*</small>
          </label>
          <div
            style={{
              border: `${
                fieldError && h.isEmpty(form.template_body)
                  ? '1px solid #fe5959'
                  : ''
              }`,
              borderRadius: '6px !important',
            }}
          >
            <span
              style={{
                color: '#c5c5c5',
                marginBottom: '5px',
              }}
            >
              Enter message text for the message
            </span>
            <textarea
              ref={textareaRef}
              value={form?.template_body || ''}
              maxLength={60}
              rows={5}
              onChange={(e) => onChange(e.target.value, 'template_body')}
              className="mb-3"
              disabled={true}
            />
            <div className="d-flex justify-content-between">
              <span>
                Character:{' '}
                {h.notEmpty(form?.template_body)
                  ? form.template_body.length
                  : '0'}
                /60
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
                >
                  <FontAwesomeIcon
                    icon={faStrikethrough}
                    color="#182327"
                    style={{ marginRight: '5px' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Redirection URL<small className="chip">Optional</small>
          </label>
          <div>
            <span
              style={{
                color: '#c5c5c5',
                marginBottom: '5px',
              }}
            >
              Enter redirection url when image, title or text area is tapped
            </span>
            <input
              placeholder="Enter redirection url"
              type="text"
              value={form.redirection_url}
              className={`form-item`}
              onChange={(e) => {
                onChange(e.target.value, 'redirection_url');
              }}
              disabled={true}
            />
          </div>
        </div>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Action Buttons<small>*</small>
          </label>
          <div>
            {buttons &&
              buttons.length > 0 &&
              buttons.map((btn, i) => (
                <div className="quick-replies-wrapper">
                  <span className="d-flex">
                    <input
                      type="text"
                      value={btn.value}
                      onChange={(e) =>
                        handleUpdateButtonValue(e.target.value, i)
                      }
                      size={100}
                      maxLength={20}
                      placeholder="Button Label"
                      disabled={true}
                    />
                    <small
                      style={{
                        marginTop: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      {' '}
                      {btn.value.length}/20
                    </small>
                    <CommonSelect
                      id={`type-${i}`}
                      options={[
                        ...constant.ACTION_TYPES.map((m) => ({
                          value: m,
                          label: Object.values(m),
                        })),
                      ]}
                      value={btn.action}
                      isSearchable={false}
                      onChange={(v) => handleUpdateButtonValue(v, i, 'action')}
                      placeholder="Action Type"
                      className="w-130 ml-2"
                      disabled={true}
                    />
                    <input
                      type="text"
                      className="w-200 ml-2"
                      value={btn.action_value}
                      onChange={(e) =>
                        handleUpdateButtonValue(
                          e.target.value,
                          i,
                          'action_value',
                        )
                      }
                      placeholder="Action Value"
                      disabled={true}
                    />
                  </span>
                </div>
              ))}
          </div>
        </div>
      </>
    );
  },
);
