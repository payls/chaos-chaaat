import React, { useEffect, useState, useRef } from 'react';
import { h } from '../../helpers';
import Picker from 'emoji-picker-react';
import constant from '../../constants/constant.json';

// ICONS
import {
  faPaperPlane,
  faRedoAlt,
  faTimes,
  faCheck,
  faPlus,
  faReply,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconImage from '../ProposalTemplate/Link/preview/components/Icons/IconImage';
import IconFile from '../ProposalTemplate/Link/preview/components/Icons/IconFile';
import IconFile2 from '../ProposalTemplate/Link/preview/components/Icons/IconFile2';
import IconVideo2 from '../ProposalTemplate/Link/preview/components/Icons/IconVideo2';
import IconTemplate from '../ProposalTemplate/Link/preview/components/Icons/IconTemplate';
import IconEmoji from '../ProposalTemplate/Link/preview/components/Icons/IconEmoji';
import CommonTooltip from '../Common/CommonTooltip';
import CommonMenuItem from '../Common/CommonMenuItem';
import IconAudio from '../ProposalTemplate/Link/preview/components/Icons/IconAudio';

export default React.memo(
  ({
    sending,
    msgTextAreaRef,
    sendMessage,
    successSend,
    failedSend,
    attachmentFiles,
    removeAttachmentFile,
    handleOnChangeFile,
    fileRef,
    openSendTemplate = () => {},
    openSendLineTemplate = () => {},
    toReplyMsg = null,
    contact,
    clearReplyMsg = () => {},
    changeLineSelectedChannel = () => {},
    medias = [],
    setTemplateSending,
    fileUploadStatus,
    platform,
    lineChannels,
    lineLastChannelUsed,
    setMediaType,
  }) => {
    const [msgReply, setMsgReply] = useState('');
    const pastedContents = useRef(null);
    const pickerRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);

    const resizeTextArea = () => {
      if (msgTextAreaRef.current) {
        msgTextAreaRef.current.style.height = 'auto';
        msgTextAreaRef.current.style.height =
          msgTextAreaRef.current.scrollHeight + 'px';
      }
    };

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

    useEffect(resizeTextArea, [msgReply]);

    useEffect(() => {
      if (successSend) {
        setMsgReply('');
      }
    }, [successSend]);

    function getIcon() {
      if (successSend) {
        return faCheck;
      }
      if (failedSend) {
        return faTimes;
      }

      return faPaperPlane;
    }

    function getMediaMsgBody(msg) {
      switch (msg.msg_type) {
        case 'file_frompave':
          return 'Document';
        case 'document':
          return msg.file_name;
        case 'file':
          return msg.file_name;
        case 'image':
        case 'img_frompave': {
          if (h.notEmpty(msg.media_url)) {
            return <img src={msg.media_url} height="300px" />;
          }

          const media = medias.filter((f) => f.id === msg.whatsapp_chat_id);

          return <img src={media[0]?.value} height="300px" />;
        }
        case 'audio':
          return 'Audio';
        case 'video':
        case 'video_frompave':
          const media = medias.filter((f) => f.id === msg.whatsapp_chat_id);

          return <video controls src={media[0]?.value} disabled></video>;
        default:
          return <span className="inbox-item-big-msg">Unsupported media</span>;
      }
    }

    function handleImgMsgBody(chat) {
      if (h.notEmpty(chat.media_url)) {
        const message_body = <img src={chat.media_url} height="300px" />;

        return message_body;
      }
      const msg_body = chat.msg_body;
      if (msg_body.includes('<div')) {
        const splitString = msg_body.split(/\s+<div/);
        const url = splitString[0];

        const message_body = <img src={url} height="300px" />;

        return message_body;
      }
    }

    function getName(msgBody) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = msgBody;
      const strongElement = tempElement.querySelector('strong');

      if (!strongElement) return null;

      return strongElement.textContent;
    }

    const handlePaste = (event) => {
      if (!showMediaAction()) {
        return;
      }

      const clipboardData = event.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      const dataTransfer = new DataTransfer();

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const imageBlob = items[i].getAsFile();
          if (imageBlob) {
            const fileData = new File([imageBlob], 'pasted-image.png', {
              type: 'image/png',
            });
            dataTransfer.items.add(fileData);
          }
        }
      }
      if (h.notEmpty(dataTransfer.files)) {
        event.preventDefault();
        fileRef.current.files = dataTransfer.files;
        // Trigger file input change event
        const changeEvent = new Event('change', { bubbles: true });
        fileRef.current.dispatchEvent(changeEvent);
      }
    };

    const onEmojiClick = (emojiObject) => {
      setMsgReply(msgReply + emojiObject.emoji);
      setShowPicker(false);
      msgTextAreaRef.current.focus();
    };

    function showMediaAction() {
      if (platform === constant.INBOX.TYPE.LINE && h.notEmpty(toReplyMsg)) {
        return false;
      }
      return true;
    }

    const renderPreview = (item) => {
      if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(item.full_file_url)) {
        return (
          <CommonTooltip tooltipText={item.file_name}>
            <img src={item.full_file_url} />
          </CommonTooltip>
        );
      }
      if (/\.(mp4|3gp)$/i.test(item.full_file_url)) {
        return (
          <CommonTooltip tooltipText={item.file_name}>
            <video src={item.full_file_url} muted style={{width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover'}} />
          </CommonTooltip>
        );
      }
      if (/\.(aac|amr|mp3|mpga?|mpeg|mp2a?|m2a|m3a)$/i.test(item.full_file_url)) {
        return (
          <CommonTooltip tooltipText={item.file_name}>
            <img src="/assets/images/audio-preview.svg" />
          </CommonTooltip>
        );
      }
      return (
        <CommonTooltip tooltipText={item.file_name}>
          <img src="/assets/images/document-preview.svg" />
        </CommonTooltip>
      );
    };

    return (
      <>
        <div ref={pastedContents}></div>
        {fileUploadStatus === 'PENDING' && (
          <div
            className="text-center"
            style={{ fontFamily: 'PoppinsSemiBold' }}
          >
            <FontAwesomeIcon
              icon={faRedoAlt}
              color="#182327"
              size="lg"
              spin={true}
            />{' '}
            Loading media...
          </div>
        )}
        {h.notEmpty(toReplyMsg) && (
          <>
            <div className="image-files-wrapper">
              <div className="image-files">
                <div style={{ width: '100%' }}>
                  <div className="reply">
                    <h1>
                      <FontAwesomeIcon
                        icon={faReply}
                        color="#182327"
                        style={{ fontSize: '14px' }}
                      />{' '}
                      Replying to{' '}
                      <b>
                        {getName(toReplyMsg.msg_body)
                          ? getName(toReplyMsg.msg_body)
                          : h.user.combineFirstNLastName(
                              contact.first_name,

                              contact.last_name,

                              ' ',
                            )}
                      </b>
                    </h1>

                    {['img_frompave'].includes(toReplyMsg.msg_type) && (
                      <>{handleImgMsgBody(toReplyMsg)}</>
                    )}
                    {['file_frompave'].includes(toReplyMsg.msg_type) && (
                      <>{getMediaMsgBody(toReplyMsg)}</>
                    )}
                    {['video_frompave'].includes(toReplyMsg.msg_type) && (
                      <>{getMediaMsgBody(toReplyMsg)}</>
                    )}
                    {['document', 'image', 'audio', 'video', 'file'].includes(
                      toReplyMsg.msg_type,
                    ) && <> {getMediaMsgBody(toReplyMsg)} </>}

                    {['frompave', 'text', 'button', 'interactive'].includes(
                      toReplyMsg.msg_type,
                    ) && (
                      <div
                        className="reply-msg"
                        dangerouslySetInnerHTML={{
                          __html: toReplyMsg.msg_body,
                        }}
                      ></div>
                    )}
                  </div>
                  {!sending && (
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        clearReplyMsg();
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {attachmentFiles.length > 0 && (
          <>
            <div className="image-files-wrapper">
              <div className="image-files">
                {attachmentFiles.map((item, i) => (
                  <div key={i}>
                    {renderPreview(item)}
                    {!sending && (
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeAttachmentFile(i)}
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          color="#fff"
                          size="sm"
                        />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <input
          type={'file'}
          id={'csvFileInput'}
          // accept={'image/*'}
          onChange={handleOnChangeFile}
          style={{ display: 'none' }}
          multiple
          ref={fileRef}
        />
        <div
          className="send-msg-txtarea d-flex flex-column"
          style={{
            width: '100%',
            border: ' 1px solid rgb(209, 209, 209)',
            padding: '10px',
            background: '#fff',
            borderRadius: '5px',
            margin: '5px 0px',
          }}
        >
          <div
            className="pos-rlt"
            style={{
              flex: 'auto',
              width: '100%',
            }}
          >
            <textarea
              style={{}}
              className="inbox-textarea"
              disabled={sending}
              placeholder="Type your message..."
              ref={msgTextAreaRef}
              value={msgReply}
              onChange={(e) => {
                setMsgReply(e.target.value);
              }}
              onPaste={handlePaste}
              rows={1}
              onKeyDown={(e) => {
                if (
                  e.keyCode === 13 &&
                  e.target.value.trim().length > 0 &&
                  !e.shiftKey
                ) {
                  sendMessage(msgReply);
                  e.preventDefault();
                  return false;
                }
              }}
            />
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex" style={{ gap: '0.8em' }}>
              {[
                constant.INBOX.TYPE.WHATSAPP,
                constant.INBOX.TYPE.LINE,
                constant.INBOX.TYPE.MESSENGER,
              ].includes(platform) && (
                <>
                  <div className="gggg">
                    {showPicker && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '30px',
                          left: '53px',
                        }}
                        ref={pickerRef}
                      >
                        <Picker
                          pickerStyle={{ width: '100%' }}
                          onEmojiClick={onEmojiClick}
                        />
                      </div>
                    )}
                    <CommonTooltip tooltipText="Add Emoji">
                      <IconEmoji
                        width="25px"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setShowPicker(true);
                        }}
                      />
                    </CommonTooltip>
                  </div>
                  {showMediaAction() && (
                    <div className="gggg">
                      <CommonTooltip tooltipText="Add Image">
                        <IconImage
                          width="25px"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setMediaType('image');
                            const acceptValue =
                              'image/png,image/jpeg,image/jpg';
                            fileRef.current.setAttribute('accept', acceptValue);
                            fileRef.current.click();
                          }}
                        />
                      </CommonTooltip>
                    </div>
                  )}

                  {[
                    constant.INBOX.TYPE.WHATSAPP,
                    constant.INBOX.TYPE.MESSENGER,
                  ].includes(platform) &&
                    showMediaAction() && (
                      <div className="gggg">
                        <CommonTooltip tooltipText="Add File">
                          <IconFile
                            width="25px"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (fileRef.current) {
                                const acceptValue =
                                  'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv';
                                fileRef.current.setAttribute(
                                  'accept',
                                  acceptValue,
                                );
                              }
                              setMediaType('document');
                              fileRef.current.click();
                            }}
                          />
                        </CommonTooltip>
                      </div>
                    )}
                  {showMediaAction() && (
                    <div className="gggg">
                      <CommonTooltip tooltipText="Add Video">
                        <IconVideo2
                          width="25px"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (fileRef.current) {
                              const acceptValue = 'video/mp4, video/3gpp';
                              fileRef.current.setAttribute(
                                'accept',
                                acceptValue,
                              );
                            }
                            setMediaType('video');
                            fileRef.current.click();
                          }}
                        />
                      </CommonTooltip>
                    </div>
                  )}
                  {showMediaAction() && (
                    <div className="gggg">
                      <CommonTooltip tooltipText="Add Audio">
                        <IconAudio
                          width="25px"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (fileRef.current) {
                              const acceptValue = 'audio/aac, audio/amr, audio/mpeg';
                              fileRef.current.setAttribute(
                                'accept',
                                acceptValue,
                              );
                            }
                            setMediaType('audio');
                            fileRef.current.click();
                          }}
                        />
                      </CommonTooltip>
                    </div>
                  )}
                  {[
                    constant.INBOX.TYPE.WHATSAPP,
                    constant.INBOX.TYPE.LINE,
                  ].includes(platform) && (
                    <div className="gggg">
                      <CommonTooltip tooltipText="Send Template">
                        <IconTemplate
                          width="25px"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (platform === constant.INBOX.TYPE.WHATSAPP) {
                              setTemplateSending(false);
                              openSendTemplate(true);
                            } else if (platform === constant.INBOX.TYPE.LINE) {
                              setTemplateSending(false);
                              openSendLineTemplate(true);
                            }
                          }}
                        />
                      </CommonTooltip>
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              {[constant.INBOX.TYPE.LINE].includes(platform) && (
                <>
                  <label className="channel-select-label">
                    Contact Channels:{' '}
                  </label>
                  <select
                    className="channel-select"
                    onChange={changeLineSelectedChannel}
                  >
                    {lineChannels.map((lc, i) => (
                      <option
                        value={lc.agency_channel_config_id}
                        key={i}
                        selected={
                          lineLastChannelUsed === lc.channel_id ? true : false
                        }
                      >
                        {lc.channel_name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <button
                type="button"
                disabled={
                  (attachmentFiles.length === 0 &&
                    (!msgReply || msgReply.trim().length === 0)) ||
                  sending
                }
                onClick={() => {
                  if (!failedSend && !successSend) {
                    sendMessage(msgReply);
                  }
                }}
                className={`send-btn ${failedSend ? 'shake' : ''} ${
                  successSend ? 'gbg' : ''
                }`}
              >
                {!sending ? (
                  'Send'
                ) : (
                  <FontAwesomeIcon
                    icon={faRedoAlt}
                    color="#fff"
                    size="lg"
                    spin={true}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  },
);
