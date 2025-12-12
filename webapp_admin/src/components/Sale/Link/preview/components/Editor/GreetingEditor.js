import React, {useEffect, useRef} from 'react';
import CommonEditor from '../../../../../Common/CommonEditor';

export default function GreetingEditor(props) {
  const {
    permalinkMessage,
    setPermalinkMessage,
    showEditor,
    setLoading,
    contactId,
  } = props;
  const editorRef = useRef(null);

  return (
    <CommonEditor
      message={permalinkMessage}
      setMessage={setPermalinkMessage}
      editorRef={editorRef}
      setLoading={setLoading}
      showEditor={showEditor}
      contactId={contactId}
    />
  );
}
