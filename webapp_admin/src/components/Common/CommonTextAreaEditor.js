import React from 'react';
import { h } from '../../helpers';
import { Editor } from '@tinymce/tinymce-react';

export default function CommonTextAreaEditor(props) {
  const {
    message,
    setMessage,
    placeholder = '',
    disabled = false,
    height = 200,
  } = props;

  let { plugins, toolbar } = props;

  let toolbar1;

  if (h.isEmpty(plugins)) {
    plugins = [
      'advlist autolink lists link image',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table paste copy',
    ];
  }
  if (h.isEmpty(toolbar)) {
    toolbar1 = 'undo redo | bullist numlist outdent indent | link';
  } else {
    toolbar1 = toolbar;
  }

  const handleEditorChange = (content) => {
    setMessage(content);
  };

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_APIKEY}
      value={message}
      init={{
        placeholder,
        height,
        plugins,
        toolbar1,
        menubar: false,
        branding: false,
        contextmenu: false,
      }}
      disabled={disabled}
      onEditorChange={handleEditorChange}
      width="100%"
    />
  );
}
