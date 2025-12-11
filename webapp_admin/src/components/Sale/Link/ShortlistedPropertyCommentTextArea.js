import React, { useRef, useState } from 'react';
import { h } from '../../../helpers';
import IconAttachment from '../../Icons/IconAttachment';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import ShortlistedPropertyAttachmentCard from './ShortlistedPropertyAttachmentCard';

export default function ShortlistedPropertyCommentTextArea(props) {
  const { shortlisted_property_id, setLoading, reloadComments } = props;

  const attachmentInputRef = useRef();
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const formFields = {
    comment: {
      label: '',
      placeholder: 'Send a message',
      style: {
        border: 'none',
        borderRadius: '10px',
        opacity: '1',
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
    let apiResComment = await api.shortlistedPropertyComment.createComment(
      {
        shortlisted_property_id,
        message: fields.comment.value,
        attachments: attachmentFiles,
        contact_comment: false,
        send_email: false,
      },
      false,
    );
    fields.comment.value = '';
    setFields(Object.assign({}, fields));

    if (h.cmpStr(apiResComment.status, 'ok')) {
      // Removing submitted attachment files
      setAttachmentFiles([]);
    }

    await reloadComments(shortlisted_property_id);
    setLoading(false);
  };

  const handleReserve = async (e) => {
    if (e) e.preventDefault();
  };

  const handleOpenFilePicker = async () => {
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
          constant.UPLOAD.TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT,
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
    const newAttachmentFiles = attachmentFiles.filter(
      (file) => file.full_file_url != urlToRemove,
    );
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
            // pointerEvents: shouldTrackActivity ? 'all' : 'none',
          }}
        >
          {attachmentFiles.map(({ file_url, full_file_url, file_name }) => {
            return (
              <ShortlistedPropertyAttachmentCard
                uploading={true}
                attachment={{
                  attachment_url: full_file_url,
                  file_name: file_name,
                }}
                removeAttachmentHandler={removeAttachmentHandler}
              />
            );
          })}
        </div>
      )}

      {/* TextArea */}
      <div id={shortlisted_property_id} className="col-12 mb-3">
        <button className={'attachment-button'} onClick={handleOpenFilePicker}>
          <IconAttachment />
        </button>
        <h.form.GenericForm
          formFields={formFields}
          fieldType={'textarea'}
          formMode={h.form.FORM_MODE.ADD}
          fields={fields}
          setFields={setFields}
          setLoading={setLoading}
          handleSubmit={handleSubmit}
          showCancelButton={false}
          submitButtonLabel="Send"
          submitButtonVariant="primary2"
          submitButtonStyle={{
            color: '#FFFFFF',
            backgroundColor:
              fields?.comment?.value?.length > 0 ? '#025146' : '#C4C4C4',
            borderRadius: '5px',
            border: 'none',
          }}
          submitButtonClassName="col-12 col-sm-3 col-md-2 mt-2 mt-sm-0 d-none"
          submitButtonBeforeContent={null}
          buttonWrapperClassName="text-right"
          // showCustomButton={true}
          customButtonStyle={{
            backgroundColor: '#ADC7A6',
            borderRadius: '5px',
            border: 'none',
          }}
          customButtonLabel="Reserve Unit"
          customButtonClassName="col-12 col-sm-4 col-md-3 col-lg-2"
          handleCustom={handleReserve}
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
    </>
  );
}
