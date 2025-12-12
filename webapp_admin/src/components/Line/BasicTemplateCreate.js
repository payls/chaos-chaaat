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
  faCode,
  faSmile,
  faTimes,
  faImage,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonSelect from '../Common/CommonSelect';
import CommonDropdownAction from '../Common/CommonDrodownAction';

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
    handleAddQuickReplies,
    fieldError,
    erroredFields,
    callbackForUpdateVariables,
  }) => {
    const textareaRef = useRef(null);
    const pickerRef = useRef(null);
    const fileRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);
    const [uploadURL, setUploadURL] = useState('');
    const [directURL, setDirectURL] = useState('');
    const [buttons, setButtons] = useState([
      {
        value: '',
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

    function handleUpdateButtonValue(v, index) {
      const newBtn = [...buttons];
      newBtn[index].value = v;

      setButtons(newBtn);
    }

    function handleDeleteButton(index) {
      const newBtn = [...buttons];
      newBtn.splice(index, 1);

      setButtons(newBtn);
    }

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
            Header<small className="chip">Optional</small>
          </label>
          <div>
            <button
              type="button"
              className={`header-none-btn w ${
                headerOption === 'none' ? 'active' : ''
              }`}
              onClick={() => handleHeaderOptionAction('none')}
            >
              None
            </button>
            <button
              type="button"
              className={`header-img-btn ${
                headerOption === 'image' ? 'active' : ''
              }`}
              onClick={() => handleHeaderOptionAction('image')}
            >
              <FontAwesomeIcon
                icon={faImage}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
              Header Image
            </button>
            <button
              type="button"
              className={`header-img-btn ${
                headerOption === 'video' ? 'active' : ''
              }`}
              onClick={() => handleHeaderOptionAction('video')}
            >
              <FontAwesomeIcon
                icon={faVideo}
                color="#182327"
                style={{ marginRight: '5px' }}
              />
              Header Video
            </button>
            {['image', 'video'].includes(headerOption) && (
              <>
                <div
                  className="d-flex mt-3 modal-radio-input-group"
                  style={{ display: 'inline' }}
                >
                  <input
                    name={`${
                      headerOption === 'image' ? 'image_source' : 'video_source'
                    }`}
                    type="radio"
                    value="agent"
                    style={{ marginLeft: '10px' }}
                    onClick={() => {
                      setSource('upload');
                      setSourceUrl(uploadURL);
                    }}
                    defaultChecked
                  />
                  <label>File Upload</label>
                  <input
                    name={`${
                      headerOption === 'image' ? 'image_source' : 'video_source'
                    }`}
                    type="radio"
                    value="agent"
                    style={{ marginLeft: '10px' }}
                    onClick={() => {
                      setSource('url');
                      setSourceUrl(directURL);
                      setSourceThumbnail(null);
                    }}
                  />
                  <label>
                    {`${headerOption
                      .split(' ')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
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
                      />
                    )}
                    {headerOption === 'video' && (
                      <input
                        type={'file'}
                        id={'csvFileInput'}
                        accept={'video/mp4'}
                        onChange={handleOnChangeFile}
                        ref={fileRef}
                        className="form-item mt-2"
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
                    placeholder={`Paste desired ${headerOption} url here. File size must not exceed ${
                      headerOption === 'image' ? '10MB' : '200MB'
                    } to avoid sending problem.`}
                  />
                  {headerOption === 'video' && (
                    <input
                      type="text"
                      value={sourceThumbnail}
                      className="form-item mt-2"
                      onChange={(e) => {
                        setSourceThumbnail(e.target.value);
                      }}
                      placeholder={`Paste desired video thumbnail image url here`}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="d-flex campaign-create-form mt-3">
          <label>
            Body<small>*</small>
          </label>
          <div
          // style={{
          //   border: `${
          //     fieldError && erroredFields.includes('body')
          //       ? '1px solid #fe5959'
          //       : ''
          //   }`,
          //   borderRadius: '6px !important',
          // }}
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
              maxLength={1024}
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
            Action Buttons<small className="chip">Optional</small>
          </label>
          <div>
            {buttons &&
              buttons.length > 0 &&
              buttons.map((btn, i) => (
                <div className="quick-replies-wrapper">
                  <label>Button Text</label>
                  <span>
                    <input
                      type="text"
                      value={btn.value}
                      onChange={(e) =>
                        handleUpdateButtonValue(e.target.value, i)
                      }
                      size={100}
                      maxLength={20}
                    />
                    <small> {btn.value.length}/20</small>
                  </span>
                  {buttons.length > 1 && (
                    <FontAwesomeIcon
                      icon={faTimes}
                      color="#182327"
                      style={{ marginLeft: '5px', cursor: 'pointer' }}
                      onClick={() => handleDeleteButton(i)}
                    />
                  )}
                </div>
              ))}
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                handleAddButton();
              }}
              disabled={buttons.length === 5}
              style={{
                display: 'block',
                color: buttons.length === 5 ? '#c5c5c5' : 'inherit',
              }}
            >
              <FontAwesomeIcon
                icon={faPlusCircle}
                color="#182327"
                style={{
                  marginRight: '5px',
                  color: buttons.length === 5 ? '#c5c5c5' : 'inherit',
                }}
              />
              Add Reply Button
            </button>
          </div>
        </div>
      </>
    );
  },
);
