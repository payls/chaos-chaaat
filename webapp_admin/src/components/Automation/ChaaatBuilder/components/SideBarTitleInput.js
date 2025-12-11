import React, { useState, useEffect, useRef } from 'react';

// UI
import Pencil from '../../../FlowBuilder/Icons/Pencil';

// STORE
import useSideBarStore from '../store';
import { getUpdatedNodeData } from '../store/functions';

const SideBarTitleInput = ({
  nodeDataIndex,
  isEditable = true,
  defaultTitle = '',
  styles,
}) => {
  const titleInputRef = useRef(null);

  const { nodeData, setNodeData } = useSideBarStore();
  const title = nodeData[nodeDataIndex]?.data?.flowData?.title ?? defaultTitle;
  const [enableTitleEdit, setEnableTitleEdit] = useState(false);

  useEffect(() => {
    if (enableTitleEdit) {
      titleInputRef.current.focus();
    }
  }, [enableTitleEdit]);

  /**
   * Handles the change event for the name input field.
   * Updates the node name and node data if the input value matches the regex pattern.
   *
   * @param {Event} e - The change event object.
   */
  function handleChangeName(e) {
    const regex = /^[A-Za-z0-9 ]*$/;
    if (regex.test(e.target.value)) {
      setNodeData(
        getUpdatedNodeData(nodeData, nodeDataIndex, 'title', e.target.value),
      );
    }
  }

  /**
   * Enables the title edit mode.
   */
  function handleEnableTitleEdit() {
    setEnableTitleEdit(true);
  }

  return (
    <div className={styles.sidebarWrapperHeaderInput}>
      <input
        type="text"
        value={title}
        onChange={handleChangeName}
        disabled={!enableTitleEdit}
        ref={titleInputRef}
      />

      {isEditable && (
        <span onClick={handleEnableTitleEdit}>
          <Pencil />
        </span>
      )}
    </div>
  );
};

export default SideBarTitleInput;
