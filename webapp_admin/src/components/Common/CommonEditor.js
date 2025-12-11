import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { Editor } from '@tinymce/tinymce-react';
import { config } from '../../configs/config';
import { api } from '../../api';

export default function CommonEditor(props) {
  const { message, setMessage, editorRef, showEditor, contactId } = props;
  let { plugins, toolbar, setLoading } = props;
  const [editorContent, setEditorContent] = useState(message);

  useEffect(() => {
    setLoading(false);
  }, []);

  // const editorRef = useRef(null);
  let toolbar1;
  // let toolbar2;

  if (h.isEmpty(plugins)) {
    plugins = [
      'advlist autolink lists link image',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table paste',
      'wordcount',
    ];
  }
  if (h.isEmpty(toolbar)) {
    toolbar1 =
      'undo redo | formatselect fontsizeselect fontselect| bold italic | \
            bullist numlist outdent indent |\
            alignleft aligncenter alignright | \
            forecolor backcolor | \
            language |\
            help | SaveBtn CancelBtn';
    // add more features to tool bar2
    // toolbar2 =
  } else {
    toolbar1 = toolbar;
  }
  const onButtonClick = () => {
    const latestContent = editorRef.current.getContent();
    setEditorContent(latestContent);
    setMessage(latestContent);
    (async () =>
      api.contactLink.savePermalinkMessage(
        {
          contact_id: contactId,
          permalink_message: latestContent,
        },
        true,
      ))();
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };
  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_APIKEY}
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      initialValue={message}
      init={{
        height: 500,
        menubar: false,
        plugins: plugins,
        toolbar1: toolbar1,
        branding: false,
        // toolbar2: toolbar2,
        setup: (editor) => {
          editor.ui.registry.addButton('SaveBtn', {
            text: 'Save',
            onAction: onButtonClick,
          });
          editor.ui.registry.addButton('CancelBtn', {
            text: 'Close Editor',
            style: { color: 'red' },
            onAction: () => {
              showEditor(false);
            },
          });
        },
      }}
      onEditorChange={handleEditorChange}
      width="70%"
    />
  );
}
