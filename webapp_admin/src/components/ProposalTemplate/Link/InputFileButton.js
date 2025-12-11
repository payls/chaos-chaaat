import React, {useRef} from 'react';
import { h } from '../../../helpers';
import IconAttachment from '../../Icons/IconAttachment';

export default function InputFileButton(props) {
  const { fileUploadHandler, subject_id=null } = props;
  const attachmentInputRef = useRef();

  const inputRefHandler= async () => {
    attachmentInputRef.current.click();
  };

  // lifting ID and uploaded files up
  const fileInputHandler = async (e) => {
    if (h.isEmpty(subject_id)){
      fileUploadHandler(e.target.files);
    } else{
      fileUploadHandler(e.target.files, subject_id);
    }
  };

  return (
    <>
      <button
        key={props.subject_id}
        id={props.subject_id}
        className="attachment-button"
        onClick={inputRefHandler}
      >
        <IconAttachment />
      </button>
      <input
        key={subject_id}
        id={subject_id}
        ref={attachmentInputRef}
        type="file"
        style={{ display: "none" }}
        name={subject_id}
        onChange={fileInputHandler}
        accept={h.attachment.getSupportedFileTypes()}
        multiple
      />
    </>
  );
}
