import React, { useRef, useState } from 'react';
import { h } from '../../helpers';
import IconAttachment from '../Icons/IconAttachment';
import IconAttachementVector from '../Icons/IconAttachementVector';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import ShortlistedProjectAttachmentCard from './ShortlistedProjectAttachmentCard';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ShortlistedProjectCommentTextArea(props) {
  const {
    project,
    contact_id,
    shortlisted_project_id,
    setLoading,
    reloadComments,
    replyToComment = {},
    setIsReplying = null,
    shouldTrackActivity = true,
    customStyle,
    translate,
  } = props;

  const attachmentInputRef = useRef();
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const placeholder = h.isEmpty(replyToComment)
    ? h.translate.localize('sendAMessage', translate)
    : h.translate.localize('sendAReply', translate);

  const formFields = {
    comment: {
      label: '',
      placeholder: placeholder,
      style: {
        border: 'none',
        borderRadius: '10px',
        backgroundColor: '#fff',
        opacity: '1',
        fontFamily: 'PoppinsLight',
        fontSize: '14px',
      },
      field_type: h.form.FIELD_TYPE.TEXTAREA,
      class_name: 'col-12',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };

  const [fields, setFields] = useState(formFields);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let apiResComment = await api.shortlistedProjectComment.create(
      {
        shortlisted_project_id,
        contact_id,
        message: fields.comment.value,
        attachments: attachmentFiles,
        parent_comment_fk: h.notEmpty(replyToComment)
          ? replyToComment.shortlisted_project_comment_id
          : undefined,
        project,
      },
      false,
    );
    fields.comment.value = '';
    setFields(Object.assign({}, fields));

    let createdCommentId = '';
    if (h.cmpStr(apiResComment.status, 'ok')) {
      // Create activity record upon submitting comment
      createdCommentId = apiResComment.data.shortlisted_project_comment_id;
      // Removing submitted attachment files
      setAttachmentFiles([]);
    }

    let apiResContactActivity = await api.contactActivity.create(
      {
        contact_fk: contact_id,
        activity_type: constant.CONTACT.ACTIVITY.TYPE.COMMENT_POSTED,
        activity_meta: JSON.stringify({
          shortlisted_project_id,
          shortlisted_project_comment_id: createdCommentId,
        }),
      },
      false,
    );

    // set to IsReplying to false when api returns response successfully, removing TextArea for replying
    if (
      h.notEmpty(setIsReplying) &&
      h.cmpStr(apiResContactActivity.status, 'ok')
    ) {
      setIsReplying(false);
    }

    await reloadComments(shortlisted_project_id);
    setLoading(false);
  };

  const handleReserve = async (e) => {
    if (e) e.preventDefault();
  };

  const handleOpenFilePicker = async (e) => {
    attachmentInputRef.current.click();
  };

  const handleFilePickerChange = async (e) => {
    setLoading(true);
    let uploadFiles = [...e.target.files];
    let newlyUploadFiles = [];
    if (h.notEmpty(uploadFiles)) {
      for (let i = 0; i < uploadFiles.length; i++) {
        const targetFile = uploadFiles[i];
        const formData = new FormData();
        formData.append('file', targetFile);
        const uploadResponse = await api.upload.upload(
          formData,
          constant.UPLOAD.TYPE.SHORTLISTED_PROJECT_COMMENT_ATTACHMENT,
          false,
        );
        if (h.cmpStr(uploadResponse.status, 'ok')) {
          newlyUploadFiles.push({
            full_file_url: uploadResponse.data.file.full_file_url,
            file_url: uploadResponse.data.file.file_url,
            file_name: uploadResponse.data.file.file_name,
          });
        }
      }
    }
    setAttachmentFiles([...attachmentFiles, ...newlyUploadFiles]);
    setLoading(false);
  };

  const removeAttachmentHandler = (urlToRemove) => {
    let filteredArray = attachmentFiles.filter(
      (file) => file.full_file_url != urlToRemove,
    );
    const newAttachmentFiles = filteredArray;
    setAttachmentFiles(newAttachmentFiles);
  };

  return (
    <>
      {/* Showing uploaded attachments above TextArea*/}
      {h.notEmpty(attachmentFiles) && (
        <div
          className="col-12 d-flex flex-row pt-3"
          style={{
            gap: '10px 10px',
            pointerEvents: shouldTrackActivity ? 'all' : 'none',
          }}
        >
          {attachmentFiles.map(
            ({ file_url, full_file_url, file_name }, index) => {
              return (
                <ShortlistedProjectAttachmentCard
                  ke={index}
                  uploading={true}
                  attachment={{
                    attachment_url: full_file_url,
                    file_name: file_name,
                  }}
                  removeAttachmentHandler={removeAttachmentHandler}
                />
              );
            },
          )}
        </div>
      )}
      {h.notEmpty(attachmentFiles) && (
        <div
          style={{
            display: 'block',
            paddingLeft: '18px',
            fontFamily: 'PoppinsLight',
            fontStyle: 'normal',
            fontSize: '14px',
            color: '#fd5151',
          }}
        >
          Please add a comment and hit submit to save the attachment.
        </div>
      )}
      {/* TextArea */}
      <div
        id={shortlisted_project_id}
        className="col-12"
        style={{ pointerEvents: shouldTrackActivity ? 'all' : 'none' }}
      >
        <div className="comment-text-area-wrapper">
          <button
            className={
              h.isEmpty(replyToComment)
                ? 'attachment-button'
                : 'attachment-button-reply'
            }
            onClick={handleOpenFilePicker}
          >
            <IconAttachementVector />
          </button>
          {!h.isEmpty(replyToComment) && (
            <button
              className={'close-button-reply'}
              onClick={() => {
                setIsReplying(false);
              }}
            >
              <FontAwesomeIcon icon={faTimes} color="#828282" />
            </button>
          )}
          <h.form.GenericForm
            key={`project-text-area-${shortlisted_project_id}`}
            formFields={formFields}
            fieldType={'textarea'}
            formMode={h.form.FORM_MODE.ADD}
            fields={fields}
            setFields={setFields}
            setLoading={setLoading}
            handleSubmit={handleSubmit}
            showCancelButton={false}
            submitButtonVariant="primary2"
            submitButtonStyle={{
              color:
                fields?.comment?.value?.length > 0
                  ? customStyle?.message?.color ?? '#fff'
                  : '#04221E',
              backgroundColor:
                fields?.comment?.value?.length > 0
                  ? customStyle?.message?.button ?? 'rgb(4, 34, 30)'
                  : '#E6ECEC',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontFamily: 'PoppinsRegular',
            }}
            elKey={shortlisted_project_id}
            //submitButtonClassName="col-12 col-sm-3 col-md-2 mt-2 mt-sm-0"
            //submitButtonBeforeContent={null}
            buttonWrapperClassName="text-right"
            disableEnter={true}
            // showCustomButton={true}
            // customButtonStyle={{
            //   backgroundColor: '#ADC7A6',
            //   borderRadius: '5px',
            //   border: 'none',
            // }}
            // customButtonLabel="Reserve Unit"
            // customButtonClassName="col-12 col-sm-4 col-md-3 col-lg-2"
            handleCustom={handleReserve}
            submitButtonLabel={h.translate.localize('submit', translate)}
          />

          <input
            ref={attachmentInputRef}
            type="file"
            style={{ display: 'none' }}
            name="file"
            onChange={handleFilePickerChange}
            accept={h.attachment.getSupportedFileTypes()}
            multiple
          />
        </div>
      </div>
    </>
  );
}
